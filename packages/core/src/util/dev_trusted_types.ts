
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';

/**
 * THIS FILE CONTAINS CODE WHICH SHOULD BE TREE SHAKEN AND NEVER CALLED FROM PRODUCTION CODE!!!
 */

/**
 * The Trusted Types policy used by Angular, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let trustedTypesPolicyForDev: TrustedTypePolicy|null|undefined;

/**
 * Returns the Trusted Types policy used by Angular, or null if Trusted Types
 * are not enabled/supported. The first call to this function will create the
 * policy.
 */
function getTrustedTypesPolicyForDev(): TrustedTypePolicy|null {
  if (!ngDevMode) {
    throw new Error(
        'Looks like we are in \'prod mode\', but we are creating a Trusted Types policy for development, which is wrong! Check your code');
  }
  if (trustedTypesPolicyForDev === undefined) {
    trustedTypesPolicyForDev = null;
    if (typeof window !== 'undefined') {
      try {
        trustedTypesPolicyForDev =
            window?.trustedTypes?.createPolicy('angular#only-for-development', {
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
  return trustedTypesPolicyForDev;
}

export function trustedHTMLForDev(html: string): string|TrustedHTML {
  return getTrustedTypesPolicyForDev()?.createHTML(html) ?? html;
}

export function trustedScriptForDev(script: string): string|TrustedScript {
  return getTrustedTypesPolicyForDev()?.createScript(script) ?? script;
}

export function trustedScriptURLForDev(url: string): string|TrustedScriptURL {
  return getTrustedTypesPolicyForDev()?.createScriptURL(url) ?? url;
}

export function trustedFunctionForDev(...args: string[]): Function {
  // return new Function(...args.map((a) => {
  //   return trustedScriptForTest(a) as string;
  // }));

  // Workaround for a Trusted Type bug in Chrome 83.
  const fnArgs = args.slice(0, -1).join(',');
  const fnBody = args.pop()!.toString();
  const body = `(function anonymous(${fnArgs}
) { ${fnBody}
}).bind(globalThis)`;
  const res = eval(trustedScriptForDev(body) as string) as Function;
  res.toString = () => body;  // To fix sourcemaps
  return res;
}
