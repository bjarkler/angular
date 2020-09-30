
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The Trusted Types policy used by Angular, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let trustedTypesPolicyForTest: TrustedTypePolicy|null|undefined;

/**
 * Returns the Trusted Types policy used by Angular, or null if Trusted Types
 * are not enabled/supported. The first call to this function will create the
 * policy.
 */
function getTrustedTypesPolicyForTest(): TrustedTypePolicy|null {
  if (trustedTypesPolicyForTest === undefined) {
    trustedTypesPolicyForTest = null;
    if (typeof window !== 'undefined') {
      try {
        trustedTypesPolicyForTest = window.trustedTypes?.createPolicy('angular#only-for-testing', {
          createHTML: (s: string) => s,
          createScript: (s: string) => s,
          createScriptURL: (s: string) => s
        }) ??
            null;
      } catch (e) {
        // trustedTypes.createPolicy throws if called with a name that is already
        // registered, even in report-only mode. Until the API changes, catch the
        // error not to break the applications functionally. In such case, the
        // code will fall back to using strings.
        console.log(e);
      }
    }
  }
  return trustedTypesPolicyForTest;
}

export function trustedHTMLForTest(html: string): string|TrustedHTML {
  return getTrustedTypesPolicyForTest()?.createHTML(html) ?? html;
}

export function trustedScriptForTest(script: string): string|TrustedScript {
  return getTrustedTypesPolicyForTest()?.createScript(script) ?? script;
}

export function trustedScriptURLForTest(url: string): string|TrustedScriptURL {
  return getTrustedTypesPolicyForTest()?.createScriptURL(url) ?? url;
}

export function trustedFunctionForTest(...args: string[]): Function {
  // return new Function(...args.map((a) => {
  //   return trustedScriptForTest(a) as string;
  // }));

  // Workaround for a Trusted Type bug in Chrome 83. Use the above when the Angular test suite uses
  // Chrome 84.
  const fnArgs = args.slice(0, -1).join(',');
  const fnBody = args.pop()!.toString();
  const body = `(function anonymous(${fnArgs}
) { ${fnBody}
}).bind(globalThis)`;
  const res =
      eval((getTrustedTypesPolicyForTest()?.createScript(body) ?? body) as string) as Function;
  res.toString = () => body;  // To fix sourcemaps
  return res as Function;
}
