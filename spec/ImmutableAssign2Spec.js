"use strict";
var iassign = require("../src/iassign");
var deepFreeze = require("deep-freeze");

// Uncomment following line to test code coverage: npm run cover
// iassign.disableExtraStatementCheck = true;

describe("Test", function () {
    beforeEach(function () {
    });
    it("No semicolon at the end", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);

        var o2 = iassign(o1, function (o) { return o.a.b.c[0][0] }, function (ci) { ci.d++; return ci; });

        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Spaces and new lines between property names", function () {
        var o1 = { a: { "prop b": { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) {
            return o
                .
                a
            [
                "prop b"
            ]
                .
                c
            [
                0
            ]
            [
                0
            ]

        }, function (ci) { ci.d++; return ci; });

        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a["prop b"]).not.toBe(o1.a["prop b"]);
        expect(o2.a["prop b"].c).not.toBe(o1.a["prop b"].c);
        expect(o2.a["prop b"].c[0]).not.toBe(o1.a["prop b"].c[0]);
        expect(o2.a["prop b"].c[0][0]).not.toBe(o1.a["prop b"].c[0][0]);
        expect(o2.a["prop b"].c[0][0].d).not.toBe(o1.a["prop b"].c[0][0].d);

        expect(o2.a["prop b"].c[0][0].d).toBe(12);
    });

    xit("extra '[' should throw exception", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);

        expect(() => {
            var o2 = iassign(o1, function (o) {
                return o.a.b.c[0]["["]
            }, function (ci) { ci.d++; return ci; });
        }).toThrow(/Found open bracket but not close bracket/);
    });

    xit("extra ']' should throw exception", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);

        expect(() => {
            var o2 = iassign(o1, function (o) {
                return o.a.b.c[0]["]"]
            }, function (ci) { ci.d++; return ci; });
        }).toThrow(/Found close bracket but not open bracket/);
    });

    it("getProp() function without return should throw exception", function () {
        if (iassign.disableHasReturnCheck)
            return;

        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);

        expect(() => {
            var o2 = iassign(o1, function (o) {
                o.a.b.c[0][0]
            }, function (ci) { ci.d++; return ci; });
        }).toThrowError(/has no 'return' keyword/);
    });

    it("getProp() function has other statements should throw exception", function () {
        if (iassign.disableExtraStatementCheck)
            return;

        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);

        expect(() => {
            var o2 = iassign(o1, function (o) {
                var text = "unexpected text";
                return o.a.b.c[0][0]
            }, function (ci) { ci.d++; return ci; });
        }).toThrowError(/has statements other than 'return'/);
    });
});
