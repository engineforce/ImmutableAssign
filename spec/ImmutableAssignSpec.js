"use strict";
var iassign = require("../src/iassign");
var deepFreeze = require("deep-freeze");
describe("Test", function () {
    beforeEach(function () {
    });
    it("Access array item", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c[0][0]; }, function (ci) { ci.d++; return ci; });
        //
        // Jasmine Tests
        //
        // expect o1 has not been changed
        expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} });
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
        expect(o2.a.b.c[2][0]).toBe(o1.a.b.c[2][0]);
    });
    it("Access array 1", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c[1]; }, function (c) { c.push(101); return c; });
        //
        // Jasmine Tests
        //
        // expect o1 has not been changed
        expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} });
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
        expect(o2.a.b.c[2]).toBe(o1.a.b.c[2]);
        expect(o2.a.b.c[2][0]).toBe(o1.a.b.c[2][0]);
    });
    it("Access array 2", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c; }, function (c) { c.pop(); return c; });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[1]).toBe(o1.a.b.c[1]);
        expect(o2.a.b.c[2]).toBe(undefined);
    });
    it("Access object", function () {
        var o1 = { a: { b: { c: { d: 11, e: 12 } } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c; }, function (c) { c.d++; return c; });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c.d).not.toBe(o1.a.b.c.d);
        expect(o2.a.b.c.d).toBe(12);
    });
    it("Access primitive", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c[0][0].d; }, function (d) { return d + 1; });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });
    it("Access date", function () {
        var o1 = { a: { b: { c: { d: 11, e: 12, f: new Date() } } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c.f; }, function (f) { return new Date(2016, 1, 1); });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c.f).not.toBe(o1.a.b.c.f);
        expect(o2.a.b.c.f).toEqual(new Date(2016, 1, 1));
    });
    it("Access array item using string", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a.b.c["1"]["0"].d; }, function (d) { return d + 1; });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[1]).not.toBe(o1.a.b.c[1]);
        expect(o2.a.b.c[1][0]).not.toBe(o1.a.b.c[1][0]);
        expect(o2.a.b.c[1][0].d).not.toBe(o1.a.b.c[1][0].d);
        expect(o2.a.b.c[1][0].d).toBe(22);
    });
    it("Access object property using string", function () {
        var o1 = { a: { propB: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var o2 = iassign(o1, function (o) { return o.a["propB"].c["1"][0].d; }, function (d) { return d + 1; });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.propB).not.toBe(o1.a.propB);
        expect(o2.a.propB.c).not.toBe(o1.a.propB.c);
        expect(o2.a.propB.c[1]).not.toBe(o1.a.propB.c[1]);
        expect(o2.a.propB.c[1][0]).not.toBe(o1.a.propB.c[1][0]);
        expect(o2.a.propB.c[1][0].d).not.toBe(o1.a.propB.c[1][0].d);
        expect(o2.a.propB.c[1][0].d).toBe(22);
    });
    it("Access array using context parameter", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        var p1 = { a: 0 };
        var o2 = iassign(o1, function (o, ctx) { return o.a.b.c[ctx.p1.a][0]; }, function (ci) { ci.d++; return ci; }, { p1: p1 });
        expect(o2).not.toBe(o1);
        expect(o2.a).not.toBe(o1.a);
        expect(o2.a.b).not.toBe(o1.a.b);
        expect(o2.a.b.c).not.toBe(o1.a.b.c);
        expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
        expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
        expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
        expect(o2.a.b.c[0][0].d).toBe(12);
    });
    it("Try to modify freezed object should throw error.", function () {
        var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
        deepFreeze(o1);
        expect(function () {
            iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].push(3); return ci; });
        }).toThrowError(TypeError, /Can't add property/);
        expect(function () {
            iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].d++; return ci; });
        }).toThrowError(TypeError, /Cannot assign to read only property/);
        expect(function () {
            iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].g = 1; return ci; });
        }).toThrowError(TypeError, /Can't add property/);
        expect(function () {
            iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].pop(); return ci; });
        }).toThrowError(TypeError, /object is not extensible/);
    });
});