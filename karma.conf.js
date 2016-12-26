// Karma configuration
// Generated on Wed Aug 10 2016 13:14:23 GMT+1000 (AUS Eastern Standard Time)

module.exports = function (config) {

    // var customLaunchers = {
    //     // sl_opera: {
    //     //     base: 'SauceLabs',
    //     //     browserName: 'opera',
    //     //     platform: 'Windows 7',
    //     //     version: 'latest'
    //     // }        
    // }

    var customLaunchers = {
        sl_ie11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_edge: {
            base: 'SauceLabs',
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 10',
            version: 'latest'
        },
    
        sl_mac_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'macOS 10.12',
            version: 'latest'
        },
        sl_mac_safari: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'macOS 10.12',
            version: 'latest'
        },
        sl_mac_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'macOS 10.12',
            version: 'latest'
        },

        sl_ios_safari: {
            base: 'SauceLabs',
            browserName: 'iphone',
            platform: 'iOS 10',
        },
    }
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'src/Libs/*.js',
            'node_modules/lodash/lodash.js',
            'src/*.js',
            'spec/**/*.js'
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
            username: 'engineforce',
            accessKey: '61e43f6c-d263-4843-8561-a8ca4c482b70',
            startConnect: false,
            build: Math.random().toString()
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

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 1
    })
}
