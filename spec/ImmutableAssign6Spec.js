"use strict";

// Test working with ES6 arrow function

(function (root, factory) {

    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    } else {
        // Browser globals (root is window)
        var browserRequire = function (name) {
            if ((name == "deep-freeze" || name == "deep-freeze-strict") && root.deepFreeze) {
                return root.deepFreeze;
            }

            if (name == "lodash" && root._) {
                return root._;
            }

            if (name == "immutable" && root.Immutable) {
                return root.Immutable;
            }

            if (name.indexOf("iassign") > -1 && root.iassign) {
                return root.iassign;
            }

            throw new Error("Unable to require: " + name);
        }

        factory(browserRequire, {});
    }
})(this, function (require, exports) {

    var iassign = require("../src/iassign");
    var noDeepFreeze = false;
    try {
        var deepFreeze = require("deep-freeze-strict");
    }
    catch (ex) {
        deepFreeze = function () { };
        noDeepFreeze = true;
        console.warn("Cannot load deep-freeze module.", ex);
    }
    var _ = require("lodash");
    var immutable = require("immutable");

    if (typeof (global) !== "undefined") {
        console.log("In node");
        if (global.process.env.running_under_istanbul) {
            // Handle coverage tool that may modify the source code.
            iassign.disableExtraStatementCheck = true;
        }
    }

    if (typeof (window) !== "undefined") {
        console.log("In browser");
        if (window.__coverage__) {
            iassign.disableExtraStatementCheck = true;
        }
    }

    // Test if arrow function is supported
    try {
        new Function("(y => y)");
        console.log("arrow function is supported.")
    }
    catch (err) {
        console.log("arrow function is not supported.")
        return;
    }

    describe("Test 6", function () {
        beforeEach(function () {
        });
        if (typeof Proxy != "undefined") {
            it("Arrow function 1: with {}", function () {
                var nested1 = { a:{ b:{ c:[ {id: 3}, {id: 4}, {id: 5}], d: 1 } } };

                var getPropCallCount = 0;
                var nested2 = iassign(
                    nested1,
                    function (n) {
                        getPropCallCount++
                        var f = n.a.b.c[1]
                        return f
                    },
                    function (c1) { return { id: 12}; }
                );

                expect(nested2).toEqual({ a:{ b:{ c:[ {id: 3}, {id: 12}, {id: 5}], d: 1 } } })
                expect(getPropCallCount).toEqual(1)
            });
        }
    });
});
