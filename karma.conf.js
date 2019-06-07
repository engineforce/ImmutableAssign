// Karma configuration
// Generated on Wed Aug 10 2016 13:14:23 GMT+1000 (AUS Eastern Standard Time)
const { existsSync, writeFileSync, readFileSync, appendFileSync } = require("fs")
const { toPairs, fromPairs } = require("lodash")
const { TRAVIS_COMMIT, CUSTOM_JOB_INDEX } = process.env

console.assert(TRAVIS_COMMIT, "TRAVIS_COMMIT must exist")
console.assert(CUSTOM_JOB_INDEX, "CUSTOM_JOB_INDEX must exist")

const buildId = TRAVIS_COMMIT
const customJobIndex = parseInt(CUSTOM_JOB_INDEX)

const allCustomLaunchers = JSON.parse(readFileSync(`./allCustomLaunchers.json`, "utf8"))
const customLaunchers = fromPairs([toPairs(allCustomLaunchers)[customJobIndex]])

console.log({buildId, customJobIndex, customLaunchers})

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files/patterns to load in the browser
        files: [
            ...(process.env.NO_PROXY ? ["spec/disableProxy.js"] : []),
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
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            startConnect: true,
            build: buildId
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
