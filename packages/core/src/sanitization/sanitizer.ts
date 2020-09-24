/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineInjectable} from '../di/interface/defs';
import {SecurityContext} from './security';

/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 * @publicApi
 */
export abstract class Sanitizer {
  abstract sanitize(ctx: SecurityContext.HTML, value: {}|string|null): string|TrustedHTML|null;
  abstract sanitize(ctx: SecurityContext.SCRIPT, value: {}|string|null): string|TrustedScript|null;
  abstract sanitize(ctx: SecurityContext.RESOURCE_URL, value: {}|string|null): string
      |TrustedScriptURL|null;
  abstract sanitize(ctx: SecurityContext, value: {}|string|null): string|null;

  /** @nocollapse */
  static ɵprov = ɵɵdefineInjectable({
    token: Sanitizer,
    providedIn: 'root',
    factory: () => null,
  });
}
