/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {_sanitizeHtml} from '../../src/sanitization/html_sanitizer';
import {isDOMParserAvailable} from '../../src/sanitization/inert_body';

{
  describe('HTML sanitizer', () => {
    let defaultDoc: any;
    let originalLog: (msg: any) => any = null!;
    let logMsgs: string[];

    beforeEach(() => {
      defaultDoc = document;
      logMsgs = [];
      originalLog = console.warn;  // Monkey patch DOM.log.
      console.warn = (msg: any) => logMsgs.push(msg);
    });

    afterEach(() => {
      console.warn = originalLog;
    });

    it('serializes nested structures', () => {
      expect(_sanitizeHtml(defaultDoc, '<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>')
                 .toString())
          .toEqual('<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>');
      expect(logMsgs).toEqual([]);
    });

    it('serializes self closing elements', () => {
      expect(_sanitizeHtml(defaultDoc, '<p>Hello <br> World</p>').toString())
          .toEqual('<p>Hello <br> World</p>');
    });

    it('supports namespaced elements', () => {
      expect(_sanitizeHtml(defaultDoc, 'a<my:hr/><my:div>b</my:div>c').toString()).toEqual('abc');
    });

    it('supports namespaced attributes', () => {
      expect(_sanitizeHtml(defaultDoc, '<a xlink:href="something">t</a>').toString())
          .toEqual('<a xlink:href="something">t</a>');
      expect(_sanitizeHtml(defaultDoc, '<a xlink:evil="something">t</a>').toString())
          .toEqual('<a>t</a>');
      expect(_sanitizeHtml(defaultDoc, '<a xlink:href="javascript:foo()">t</a>').toString())
          .toEqual('<a xlink:href="unsafe:javascript:foo()">t</a>');
    });

    it('supports HTML5 elements', () => {
      expect(_sanitizeHtml(defaultDoc, '<main><summary>Works</summary></main>').toString())
          .toEqual('<main><summary>Works</summary></main>');
    });

    it('supports ARIA attributes', () => {
      expect(_sanitizeHtml(defaultDoc, '<h1 role="presentation" aria-haspopup="true">Test</h1>')
                 .toString())
          .toEqual('<h1 role="presentation" aria-haspopup="true">Test</h1>');
      expect(_sanitizeHtml(defaultDoc, '<i aria-label="Info">Info</i>').toString())
          .toEqual('<i aria-label="Info">Info</i>');
      expect(
          _sanitizeHtml(defaultDoc, '<img src="pteranodon.jpg" aria-details="details">').toString())
          .toEqual('<img src="pteranodon.jpg" aria-details="details">');
    });

    it('sanitizes srcset attributes', () => {
      expect(_sanitizeHtml(defaultDoc, '<img srcset="/foo.png 400px, javascript:evil() 23px">')
                 .toString())
          .toEqual('<img srcset="/foo.png 400px, unsafe:javascript:evil() 23px">');
    });

    it('supports sanitizing plain text', () => {
      expect(_sanitizeHtml(defaultDoc, 'Hello, World').toString()).toEqual('Hello, World');
    });

    it('ignores non-element, non-attribute nodes', () => {
      expect(_sanitizeHtml(defaultDoc, '<!-- comments? -->no.').toString()).toEqual('no.');
      expect(_sanitizeHtml(defaultDoc, '<?pi nodes?>no.').toString()).toEqual('no.');
      expect(logMsgs.join('\n')).toMatch(/sanitizing HTML stripped some content/);
    });

    it('supports sanitizing escaped entities', () => {
      expect(_sanitizeHtml(defaultDoc, '&#128640;').toString()).toEqual('&#128640;');
      expect(logMsgs).toEqual([]);
    });

    it('does not warn when just re-encoding text', () => {
      expect(_sanitizeHtml(defaultDoc, '<p>Hellö Wörld</p>').toString())
          .toEqual('<p>Hell&#246; W&#246;rld</p>');
      expect(logMsgs).toEqual([]);
    });

    it('escapes entities', () => {
      expect(_sanitizeHtml(defaultDoc, '<p>Hello &lt; World</p>').toString())
          .toEqual('<p>Hello &lt; World</p>');
      expect(_sanitizeHtml(defaultDoc, '<p>Hello < World</p>').toString())
          .toEqual('<p>Hello &lt; World</p>');
      expect(_sanitizeHtml(defaultDoc, '<p alt="% &amp; &quot; !">Hello</p>').toString())
          .toEqual('<p alt="% &amp; &#34; !">Hello</p>');  // NB: quote encoded as ASCII &#34;.
    });

    describe('should strip dangerous elements (but potentially traverse their content)', () => {
      const dangerousTags = [
        'form',
        'object',
        'textarea',
        'button',
        'option',
        'select',
      ];
      for (const tag of dangerousTags) {
        it(tag, () => {
          expect(_sanitizeHtml(defaultDoc, `<${tag}>evil!</${tag}>`).toString()).toEqual('evil!');
        });
      }

      const dangerousSelfClosingTags = [
        'base',
        'basefont',
        'embed',
        'frameset',
        'input',
        'link',
        'param',
      ];
      for (const tag of dangerousSelfClosingTags) {
        it(tag, () => {
          expect(_sanitizeHtml(defaultDoc, `before<${tag}>After`).toString())
              .toEqual('beforeAfter');
        });
      }

      const dangerousSkipContentTags = [
        'script',
        'style',
        'template',
      ];
      for (const tag of dangerousSkipContentTags) {
        it(tag, () => {
          expect(_sanitizeHtml(defaultDoc, `<${tag}>evil!</${tag}>`).toString()).toEqual('');
        });
      }

      it(`frame`, () => {
        // `<frame>` is special, because different browsers treat it differently (e.g. remove it
        // altogether). // We just verify that (one way or another), there is no `<frame>` element
        // after sanitization.
        expect(_sanitizeHtml(defaultDoc, `<frame>evil!</frame>`).toString())
            .not.toContain('<frame>');
      });
    });

    describe('should strip dangerous attributes', () => {
      const dangerousAttrs = ['id', 'name', 'style'];

      for (const attr of dangerousAttrs) {
        it(`${attr}`, () => {
          expect(_sanitizeHtml(defaultDoc, `<a ${attr}="x">evil!</a>`).toString())
              .toEqual('<a>evil!</a>');
        });
      }
    });

    it('ignores content of script elements', () => {
      expect(_sanitizeHtml(defaultDoc, '<script>var foo="<p>bar</p>"</script>').toString())
          .toEqual('');
      expect(_sanitizeHtml(defaultDoc, '<script>var foo="<p>bar</p>"</script><div>hi</div>')
                 .toString())
          .toEqual('<div>hi</div>');
      expect(_sanitizeHtml(defaultDoc, '<style>\<\!-- something--\>hi</style>').toString())
          .toEqual('');
    });

    it('ignores content of style elements', () => {
      expect(_sanitizeHtml(defaultDoc, '<style><!-- foobar --></style><div>hi</div>').toString())
          .toEqual('<div>hi</div>');
      expect(_sanitizeHtml(defaultDoc, '<style><!-- foobar --></style>').toString()).toEqual('');
      expect(_sanitizeHtml(defaultDoc, '<style>\<\!-- something--\>hi</style>').toString())
          .toEqual('');
      expect(logMsgs.join('\n')).toMatch(/sanitizing HTML stripped some content/);
    });

    it('should strip unclosed iframe tag', () => {
      expect(_sanitizeHtml(defaultDoc, '<iframe>').toString()).toEqual('');
      expect([
        '&lt;iframe&gt;',
        // Double-escaped on IE
        '&amp;lt;iframe&amp;gt;'
      ]).toContain(_sanitizeHtml(defaultDoc, '<iframe><iframe>').toString());
      expect([
        '&lt;script&gt;evil();&lt;/script&gt;',
        // Double-escaped on IE
        '&amp;lt;script&amp;gt;evil();&amp;lt;/script&amp;gt;'
      ]).toContain(_sanitizeHtml(defaultDoc, '<iframe><script>evil();</script>').toString());
    });

    it('should ignore extraneous body tags', () => {
      expect(_sanitizeHtml(defaultDoc, '</body>').toString()).toEqual('');
      expect(_sanitizeHtml(defaultDoc, 'foo</body>bar').toString()).toEqual('foobar');
      expect(_sanitizeHtml(defaultDoc, 'foo<body>bar').toString()).toEqual('foobar');
      expect(_sanitizeHtml(defaultDoc, 'fo<body>ob</body>ar').toString()).toEqual('foobar');
    });

    it('should not enter an infinite loop on clobbered elements', () => {
      // Some browsers are vulnerable to clobbered elements and will throw an expected exception
      // IE and EDGE does not seems to be affected by those cases
      // Anyway what we want to test is that browsers do not enter an infinite loop which would
      // result in a timeout error for the test.
      try {
        _sanitizeHtml(defaultDoc, '<form><input name="parentNode" /></form>');
      } catch (e) {
        // depending on the browser, we might ge an exception
      }
      try {
        _sanitizeHtml(defaultDoc, '<form><input name="nextSibling" /></form>');
      } catch (e) {
        // depending on the browser, we might ge an exception
      }
      try {
        _sanitizeHtml(
            defaultDoc, '<form><div><div><input name="nextSibling" /></div></div></form>');
      } catch (e) {
        // depending on the browser, we might ge an exception
      }
    });

    // See
    // https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
    it('should not allow JavaScript execution when creating inert document', () => {
      const output =
          _sanitizeHtml(defaultDoc, '<svg><g onload="window.xxx = 100"></g></svg>').toString();
      const window = defaultDoc.defaultView;
      if (window) {
        expect(window.xxx).toBe(undefined);
        window.xxx = undefined;
      }
      expect(output).toEqual('');
    });

    // See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
    it('should not allow JavaScript hidden in badly formed HTML to get through sanitization (Firefox bug)',
       () => {
         expect(_sanitizeHtml(
                    defaultDoc, '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">')
                    .toString())
             .toEqual(
                 isDOMParserAvailable() ?
                     // PlatformBrowser output
                     '<p><img src="x"></p>' :
                     // PlatformServer output
                     '<p></p>');
       });

    if (browserDetection.isWebkit) {
      it('should prevent mXSS attacks', function() {
        // In Chrome Canary 62, the ideographic space character is kept as a stringified HTML entity
        expect(_sanitizeHtml(defaultDoc, '<a href="&#x3000;javascript:alert(1)">CLICKME</a>')
                   .toString())
            .toMatch(/<a href="unsafe:(&#12288;)?javascript:alert\(1\)">CLICKME<\/a>/);
      });
    }
  });
}
