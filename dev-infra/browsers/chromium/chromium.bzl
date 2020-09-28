load("//dev-infra/browsers:platform_http_file.bzl", "platform_http_file")

"""
  Defines repositories for Chromium that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_chromium_repositories():
    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/angular/blob/master/dev-infra/browsers/README.md.

    platform_http_file(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "390be82d423fb23830aaf87260cf88afdde975448ca8f587572b052838bc0ba6",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/782797/chrome-linux.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "b841ec5ad03b08422d97593fc719f1c5b038703388ad65e6cd8cc8272d58958c",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/756053/chrome-mac.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "4683d7ac88dfec4b98d1da3012ecc8e42cc8c1a560a7b95589ad4cc96bf90fcb",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/756065/chrome-win.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "528f4bd8515fff93ad99955a0c4b30133398f4e4fbff54709744bd367ec4f11a",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/782797/chromedriver_linux64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "17260e9b2222b0c905a1861285210192baef830f4281778903e7cebb8db683cc",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/756053/chromedriver_mac64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "de1423b2d69f96e451e902d686e8d471610d786c345a8de59dd1a5a436e45fc2",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/756065/chromedriver_win32.zip"],
    )
