"use strict";

(function (root, factory) {

    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    } else {
        // Browser globals (root is window)
        var browserRequire = function (name) {
            if (name == "deep-freeze" && root.deepFreeze) {
                return root.deepFreeze;
            }

            if (name == "lodash" && root._) {
                return root._;
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
        var deepFreeze = require("deep-freeze");
    }
    catch (ex) {
        deepFreeze = function () { };
        noDeepFreeze = true;
        console.warn("Cannot load deep-freeze module.");
    }
    var _ = require("lodash");

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

    describe("Test 3", function () {
        beforeEach(function () {
        });
        it("Arrow function 1: with {}", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            var o2;
            eval("o2 = iassign(o1, (o) => { return o.a.b.c[0][0] }, function (ci) { ci.d++; return ci; });")

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o2.a.b.c[0][0].d).toBe(12);
        });

        it("Arrow function 2: without {} and return", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            var o2;
            eval("o2 = iassign(o1, (o) => o.a.b.c[0][0], function (ci) { ci.d++; return ci; });");

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o2.a.b.c[0][0].d).toBe(12);
        });

        it("Arrow function 3: using context parameter", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]] } } };
            deepFreeze(o1);     // Ensure o1 is not changed, for testing only

            //
            // Calling iassign() to push increment to o1.a.b.c[0].d
            //
            var p1 = { a: 0 };
            var o2;
            eval("o2 = iassign(o1, (o, ctx) => o.a.b.c[ctx.p1.a][0], function (ci) { ci.d++; return ci; }, { p1: p1 });");

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
            expect(o2.a.b.c[0][0].d).toBe(12);
        });

        it("Arrow function 4: without (), {} and return", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            var o2;
            eval("o2 = iassign(o1, o => o.a.b.c[0][0], function (ci) { ci.d++; return ci; });");

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o2.a.b.c[0][0].d).toBe(12);
        });
    });
});
