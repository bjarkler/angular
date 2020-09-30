
/**
 * The Trusted Types policy used by Angular, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let trustedTypesPolicy: TrustedTypePolicy|null|undefined;

/**
 * Returns the Trusted Types policy used by Angular, or null if Trusted Types
 * are not enabled/supported. The first call to this function will create the
 * policy.
 */
export function getTrustedTypesPolicy(): TrustedTypePolicy|null {
  if (trustedTypesPolicy === undefined) {
    trustedTypesPolicy = null;
    if (typeof window !== 'undefined') {
      try {
        trustedTypesPolicy = window.trustedTypes?.createPolicy('angular', {
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
  return trustedTypesPolicy;
}

export function trustedConstSanitizer(value: any, tagName?: string, propName?: string): string|
    TrustedHTML|TrustedScript|TrustedScriptURL {
  if (tagName && propName && typeof window !== 'undefined' && window.trustedTypes) {
    const type = window.trustedTypes.getAttributeType(tagName, propName) ||
        window.trustedTypes.getPropertyType(tagName, propName);
    if (type === 'TrustedHTML') {
      return getTrustedTypesPolicy()?.createHTML(value) ?? value;
    }
    if (type === 'TrustedScript') {
      return getTrustedTypesPolicy()?.createScript(value) ?? value;
    }
    if (type === 'TrustedScriptURL') {
      return getTrustedTypesPolicy()?.createScriptURL(value) ?? value;
    }
  }
  return value;
}
