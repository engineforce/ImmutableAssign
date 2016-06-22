"use strict";
var iassign = require("../src/iassign");
var deepFreeze = require("deep-freeze");
var _ = require("lodash");

// Uncomment following line to test code coverage: npm run cover
// iassign.disableExtraStatementCheck = true;

describe("Test 2", function () {
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

    it("Access array using context parameter", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var p1 = { a: 0 };

        var o2 = iassign(
            o1,
            function (o, ctx) {
                return o
                    .
                    a
                    .
                    b
                    .
                    c
                [
                    ctx
                        .
                        p1
                        .
                        a
                ]
                [
                    0
                ]
                    ;
            },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Access array using context parameter 2", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var p1 = { a: 0 };

        var o2 = iassign(
            o1,
            function (o, c) {
                return o
                    .
                    a
                    .
                    b
                    .
                    c
                [
                    c
                        .
                        p1
                        .
                        a
                ]
                [
                    0
                ]
                    ;
            },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Access array using context parameter 3", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var p1 = { a: 0 };

        var o2 = iassign(
            o1,
            function (o, context) {
                return o
                    .
                    a
                    .
                    b
                    .
                    c
                [
                    context
                        .
                        p1
                        .
                        a
                ]
                [
                    0
                ]
                    ;
            },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Access array using context parameter 4", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var p1 = { a: 0 };

        var o2 = iassign(
            o1,
            function (
                o
                , 
                b
                ) {
                return o
                    .
                    a
                    .
                    b
                    .
                    c
                [
                    b
                        .
                        p1
                        .
                        a
                ]
                [
                    0
                ]
                    ;
            },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Access array using context parameter 5", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } }, a2: 0 };
        deepFreeze(o1);
        var p1 = { a: 0 };

        var o2 = iassign(
            o1,
            function (
                o
                ) {
                return o
                    .
                    a
                    .
                    b
                    .
                    c
                [
                    o
                    .
                    a2
                ]
                [
                    0
                ]
                    ;
            },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
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

    it("Access array item", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };
        deepFreeze(o1); // Ensure o1 is not changed, for testing only

        //
        // Calling iassign() to increment o1.a.b.c[0][0].d
        //
        var o2 = iassign(
            o1,
            function (o) { return o.a.b.c[0][0]; },
            function (ci) { ci.d++; return ci; }
        );

        //
        // Jasmine Tests
        //

        // expect o1 has not been changed
        expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} });

        // expect o2 inner property has been updated.
        expect(o2.a.b.c[0][0].d).toBe(12);

        // expect object graph for changed property in o2 is now different from (!==) o1.
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

        // expect object graph for unchanged property in o2 is still equal to (===) o1.
        expect(o2.a2).toBe(o1.a2);
        expect(o2.a.b2).toBe(o1.a.b2);
        expect(o2.a.b.c2).toBe(o1.a.b.c2);
        expect(o2.a.b.c[0][0].e).toBe(o1.a.b.c[0][0].e);
        expect(o2.a.b.c[1][0]).toBe(o1.a.b.c[1][0]);
    });

    it("Access array 1", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };
        deepFreeze(o1); // Ensure o1 is not changed, for testing only

        //
        // Calling iassign() to push new item to o1.a.b.c[1]
        //
        var o2 = iassign(
            o1,
            function (o) { return o.a.b.c[1]; },
            function (c) { c.push(101); return c; }
        );

        //
        // Jasmine Tests
        //

        // expect o1 has not been changed
        expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} });

        // expect o2 inner property has been updated.
        expect(o2.a.b.c[1][1]).toBe(101);

        // expect object graph for changed property in o2 is now different from (!==) o1.
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[1]).not.toBe(o1.a.b.c[1]);

        // expect object graph for unchanged property in o2 is still equal to (===) o1.
        expect(o2.a2).toBe(o1.a2);
        expect(o2.a.b2).toBe(o1.a.b2);
        expect(o2.a.b.c2).toBe(o1.a.b.c2);
        expect(o2.a.b.c[0]).toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[1][0]).toBe(o1.a.b.c[1][0]);
    });

    it("Access array using context parameter", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]] } } };
        deepFreeze(o1);     // Ensure o1 is not changed, for testing only

        //
        // Calling iassign() to push increment to o1.a.b.c[0].d
        //
        var p1 = { a: 0 };
        var o2 = iassign(
            o1,
            function (o, ctx) { return o.a.b.c[ctx.p1.a][0]; },
            function (ci) { ci.d++; return ci; },
            { p1: p1 }
        );

        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });

    it("Update array using lodash 2", function () {
        var o1 = { a: { b: { c: [1, 2, 3] } } };

        deepFreeze(o1); // Ensure o1 is not changed, for testing only

        //
        // Calling iassign() and _.map() to increment to every item in "c" array
        //
        var o2 = iassign(
            o1,
            function (o) { return o.a.b.c; },
            function (c) {
                return _.map(c, function (i) { return i + 1; });
            }
        );

        // expect o1 has not been changed
        expect(o1).toEqual({ a: { b: { c: [1, 2, 3] } } });

        // expect o2.a.b.c has been updated.
        expect(o2.a.b.c).toEqual([2, 3, 4]);

        // expect object graph for changed property in o2 is now different from (!==) o1.
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
    });
});
