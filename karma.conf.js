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
    //     // sl_ie9: {                    // Deep freeze is not working
    //     //     base: 'SauceLabs',
    //     //     browserName: 'internet explorer',
    //     //     platform: 'Windows 7',
    //     //     version: '9'
    //     // },
    //     sl_ios_iphone: {
    //         base: 'SauceLabs',
    //         browserName: 'iphone',
    //         platform: 'iOS 10',
    //     },
    //     sl_android_chrome: {         // Deep freeze is not working
    //         base: 'SauceLabs',
    //         browserName: 'android',
    //         platform: 'Android 4',
    //         version: "4.4"
    //     },
    //     sl_android_chrome: {         // Deep freeze is not working
    //         base: 'SauceLabs',
    //         browserName: 'android',
    //         platform: 'Android 5',
    //         version: "5"
    //     }
    // }

    var customLaunchers = {
        sl_ie11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 10',
            version: '11'
        },
        // sl_ie10: {
        //     base: 'SauceLabs',
        //     browserName: 'internet explorer',
        //     platform: 'Windows 8',
        //     version: '10'
        // },
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
            platform: 'macOS 10.13',
            version: 'latest'
        },
        sl_mac_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'macOS 10.12',
            version: 'latest'
        },

        sl_ios_9: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'iOS',
            version: '9.3',
            deviceName: 'iPhone 6s Simulator',
        },
        sl_ios_10: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'iOS',
            version: '10.0',
            deviceName: 'iPhone 6s Simulator',
        },
        sl_ios: {
            base: 'SauceLabs',
            browserName: 'iphone',
            platform: 'iOS 10',
        },

        sl_android_4: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'Android',
            version: '4.4',
            deviceName: 'Android GoogleAPI Emulator',
        },
        sl_android_5: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'Android',
            version: '5.0',
            deviceName: 'Android GoogleAPI Emulator',
        },
        sl_android_6: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'Android',
            version: '6.0',
            deviceName: 'Android GoogleAPI Emulator',
        },
        sl_android_7: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'Android',
            version: '7.0',
            deviceName: 'Android GoogleAPI Emulator',
        },
        sl_android: {
            base: 'SauceLabs',
            browserName: 'android',
            platform: 'Android 5',
            varsion: "5"
        },
    }
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
            build: new Date().getTime() //Math.random().toString()
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

        captureTimeout: 60000,
        browserNoActivityTimeout: 60000,
        retryLimit: 3,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 2
    })
}
