/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function(config) {
  config.set({
    customHeaders: [{
      match: '.*',
      name: 'Content-Security-Policy',
      // Lists the names of the trusted type policies that we trust.
      value:
          `require-trusted-types-for 'script'; trusted-types karma bazel-karma jasmine-core angular angular#only-for-testing angular#jit goog#html; report-uri http://localhost:1337/csp`,
    }],
  });
};
