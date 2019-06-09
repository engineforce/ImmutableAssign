// Karma configuration
// Generated on Wed Aug 10 2016 13:14:23 GMT+1000 (AUS Eastern Standard Time)
var { readFileSync } = require("fs")
var { toPairs, fromPairs, } = require("lodash")
var { 
    NO_PROXY,
    TRAVIS_COMMIT, 
    TRAVIS_BRANCH, 
    CUSTOM_JOB_INDEX, 
    IASSIGN_SAUCE_USERNAME, 
    IASSIGN_SAUCE_ACCESS_KEY,
    IASSIGN_QA_SAUCE_USERNAME, 
    IASSIGN_QA_SAUCE_ACCESS_KEY, 
} = process.env

console.assert(TRAVIS_COMMIT, "TRAVIS_COMMIT must exist")
console.assert(CUSTOM_JOB_INDEX, "CUSTOM_JOB_INDEX must exist")

CUSTOM_JOB_INDEX = parseInt(CUSTOM_JOB_INDEX)
var branch = TRAVIS_BRANCH || "branch"

if (branch !== "master") {
    SAUCE_USERNAME = IASSIGN_QA_SAUCE_USERNAME
    SAUCE_ACCESS_KEY = IASSIGN_QA_SAUCE_ACCESS_KEY
}
else {
    SAUCE_USERNAME = IASSIGN_SAUCE_USERNAME
    SAUCE_ACCESS_KEY = IASSIGN_SAUCE_ACCESS_KEY
}

var allCustomLaunchers = toPairs(JSON.parse(readFileSync(`./allCustomLaunchers.json`, "utf8")))
var customLaunchers = fromPairs([allCustomLaunchers[CUSTOM_JOB_INDEX*2], allCustomLaunchers[CUSTOM_JOB_INDEX*2+1], ])

console.log({
    TRAVIS_BRANCH,
    TRAVIS_COMMIT, 
    CUSTOM_JOB_INDEX, 
    customLaunchers, 
    browserCount: Object.keys(allCustomLaunchers).length
})

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files/patterns to load in the browser
        files: [
            ...(NO_PROXY ? ["spec/disableProxy.js"] : []),
            'src/Libs/*.js',
            'node_modules/lodash/lodash.js',
            'node_modules/immutable/dist/immutable.js',
            'node_modules/immer/dist/immer.umd.js',
            'src/*.js',
            'spec/**/*Spec.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        sauceLabs: {
            testName: 'Immutable Assign Unit Tests',
            username: SAUCE_USERNAME,
            accessKey: SAUCE_ACCESS_KEY,
            startConnect: true,
            build: TRAVIS_COMMIT
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['dots', 'saucelabs'],

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        //
        // If browsers are not installed to the default location, you need to set the environment variable pointing to the installation path.
        // E.g., SET FIREFOX_BIN="C:\Program Files (x86)\MozillaFirefox4x\firefox.exe"
        // Refer to http://karma-runner.github.io/1.0/config/browsers.html
        //browsers: ["Chrome", "Firefox", "IE", "PhantomJS"],

        // To Run Edge, please install https://github.com/nicolasmccurdy/karma-edge-launcher manually.
        //browsers: ["Edge"],
        //browsers: ["Chrome", "Firefox", "IE", "Edge", "PhantomJS"],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        captureTimeout: 300000,
        browserNoActivityTimeout: 300000,
        retryLimit: 3,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 2
    })
}
