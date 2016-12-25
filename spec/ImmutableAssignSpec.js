"use strict";
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
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
        };
        factory(browserRequire, {});
    }
})(this, function (require, exports) {
    var iassign = require("../src/iassign");
    var deepFreeze = require("deep-freeze");
    var _ = require("lodash");
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
        it("Access object property using string 2", function () {
            var propBName = "p\\r\"o.p t[] e.s\'t'B";
            var propCName = "h\\e'llo w\'or\"ld";
            var o1 = { a: (_a = {}, _a[propBName] = (_b = {}, _b[propCName] = [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], _b), _a) };
            deepFreeze(o1);
            var o2 = iassign(o1, function (o) { return o.a["p\\r\"o.p t[] e.s\'t'B"]["h\\e'llo w\'or\"ld"]["1"][0].d; }, function (d) { return d + 1; });
            expect(o2.a[propBName][propCName][1][0].d).toBe(22);
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a[propBName]).not.toBe(o1.a[propBName]);
            expect(o2.a[propBName][propCName]).not.toBe(o1.a[propBName][propCName]);
            expect(o2.a[propBName][propCName][1]).not.toBe(o1.a[propBName][propCName][1]);
            expect(o2.a[propBName][propCName][1][0]).not.toBe(o1.a[propBName][propCName][1][0]);
            expect(o2.a[propBName][propCName][1][0].d).not.toBe(o1.a[propBName][propCName][1][0].d);
            var _a, _b;
        });
        it("Access object property using string 3", function () {
            var propBName = "p\\ro.p t[] e.stB";
            var propCName = "h\\e'llo w\'or\"ld";
            var propDName = 'h\\e"llo w\"or\'ld';
            var propEName = 'p\\ro.p t[] e.stB';
            var o1 = { a: (_a = {}, _a[propBName] = (_b = {}, _b[propCName] = (_c = {}, _c[propDName] = (_d = {}, _d[propEName] = [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], _d), _c), _b), _a) };
            deepFreeze(o1);
            var o2 = iassign(o1, function (o) { return o.a["p\\ro.p t[] e.stB"]["h\\e'llo w\'or\"ld"]['h\\e"llo w\"or\'ld']['p\\ro.p t[] e.stB']["1"][0].d; }, function (d) { return d + 1; });
            expect(o2.a[propBName][propCName][propDName][propEName][1][0].d).toBe(22);
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a[propBName]).not.toBe(o1.a[propBName]);
            expect(o2.a[propBName][propCName]).not.toBe(o1.a[propBName][propCName]);
            expect(o2.a[propBName][propCName][propDName]).not.toBe(o1.a[propBName][propCName][propDName]);
            expect(o2.a[propBName][propCName][propDName][propEName]).not.toBe(o1.a[propBName][propCName][propDName][propEName]);
            expect(o2.a[propBName][propCName][propDName][propEName][1]).not.toBe(o1.a[propBName][propCName][propDName][propEName][1]);
            expect(o2.a[propBName][propCName][propDName][propEName][1][0]).not.toBe(o1.a[propBName][propCName][propDName][propEName][1][0]);
            expect(o2.a[propBName][propCName][propDName][propEName][1][0].d).not.toBe(o1.a[propBName][propCName][propDName][propEName][1][0].d);
            var _a, _b, _c, _d;
        });
        it("Access object property using string 4", function () {
            var propBName = "p\\r\"o.p t[] e.s't\'B";
            var propCName = "h\\e'llo w\'or\"ld";
            var propDName = 'h\\e"llo w\"or\'ld';
            var propEName = 'p\\r\'o.p t[] e.s"t\"B';
            var o1 = { a: (_a = {}, _a[propBName] = (_b = {}, _b[propCName] = (_c = {}, _c[propDName] = (_d = {}, _d[propEName] = [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], _d), _c), _b), _a) };
            deepFreeze(o1);
            var o2 = iassign(o1, function (o) { return o.a["p\\r\"o.p t[] e.s't\'B"]["h\\e'llo w\'or\"ld"]['h\\e"llo w\"or\'ld']['p\\r\'o.p t[] e.s"t\"B']["1"][0].d; }, function (d) { return d + 1; });
            expect(o2.a[propBName][propCName][propDName][propEName][1][0].d).toBe(22);
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a[propBName]).not.toBe(o1.a[propBName]);
            expect(o2.a[propBName][propCName]).not.toBe(o1.a[propBName][propCName]);
            expect(o2.a[propBName][propCName][propDName]).not.toBe(o1.a[propBName][propCName][propDName]);
            expect(o2.a[propBName][propCName][propDName][propEName]).not.toBe(o1.a[propBName][propCName][propDName][propEName]);
            expect(o2.a[propBName][propCName][propDName][propEName][1]).not.toBe(o1.a[propBName][propCName][propDName][propEName][1]);
            expect(o2.a[propBName][propCName][propDName][propEName][1][0]).not.toBe(o1.a[propBName][propCName][propDName][propEName][1][0]);
            expect(o2.a[propBName][propCName][propDName][propEName][1][0].d).not.toBe(o1.a[propBName][propCName][propDName][propEName][1][0].d);
            var _a, _b, _c, _d;
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
            }).toThrowError(TypeError, /Cannot|Can't|writable|doesn't|support|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].d++; return ci; });
            }).toThrowError(TypeError, /Cannot|read only|read-only|extensible|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].g = 1; return ci; });
            }).toThrowError(TypeError, /add|extensible|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].pop(); return ci; });
            }).toThrowError(TypeError, /extensible|Cannot|can't|support|unable/i);
        });
        it("Update array using lodash", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }], [{ d: 21, e: 22 }]] } }, a2: {} };
            deepFreeze(o1); // Ensure o1 is not changed, for testing only
            //
            // Calling iassign() and _.map() to increment to d in c[0] array
            //
            var o2 = iassign(o1, function (o) { return o.a.b.c[0]; }, function (c) {
                return _.map(c, function (item) { return iassign(item, function (o) { return o.d; }, function (d) { return d + 1; }); });
            });
            // expect o1 has not been changed
            expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }], [{ d: 21, e: 22 }]] } }, a2: {} });
            expect(o2).toEqual({ a: { b: { c: [[{ d: 12, e: 12 }, { d: 14, e: 14 }], [{ d: 21, e: 22 }]] } }, a2: {} });
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][1]).not.toBe(o1.a.b.c[0][1]);
            expect(o2.a.b.c[1][0]).toBe(o1.a.b.c[1][0]);
        });
        it("Update array using lodash 2", function () {
            var o1 = { a: { b: { c: [1, 2, 3] } } };
            deepFreeze(o1); // Ensure o1 is not changed, for testing only
            //
            // Calling iassign() and _.map() to increment to every item in "c" array
            //
            var o2 = iassign(o1, function (o) { return o.a.b.c; }, function (c) { return _.map(c, function (i) { return i + 1; }); });
            // expect o1 has not been changed
            expect(o1).toEqual({ a: { b: { c: [1, 2, 3] } } });
            // expect o2.a.b.c has been updated.
            expect(o2.a.b.c).toEqual([2, 3, 4]);
            // expect object graph for changed property in o2 is now different from (!==) o1.
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
        });
        it("Test root object is an array", function () {
            var o1 = [[{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]];
            deepFreeze(o1); // Ensure o1 is not changed, for testing only
            //
            // Calling iassign() and _.map() to increment to every item in "c" array
            //
            var o2 = iassign(o1, function (o) { return o[0]; }, function (o) {
                return _.map(o, function (item, index) {
                    if (index < 2) {
                        item = _.cloneDeep(item);
                        item.d++;
                    }
                    return item;
                });
            });
            // expect o1 has not been changed
            expect(o1).toEqual([[{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]]);
            // expect o2.a.b.c has been updated.
            expect(o2).toEqual([[{ d: 12, e: 12 }, { d: 14, e: 14 }, { d: 21, e: 22 }]]);
            // expect object graph for changed property in o2 is now different from (!==) o1.
            expect(o2).not.toBe(o1);
            expect(o2[0]).not.toBe(o1[0]);
            expect(o2[0][0]).not.toBe(o1[0][0]);
            expect(o2[0][1]).not.toBe(o1[0][1]);
            // expect object graph for unchanged property in o2 is still equal to (===) o1.
            expect(o2[0][2]).toBe(o1[0][2]);
        });
        it("Test root is an array, and try to update root array", function () {
            var o1 = [{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }];
            deepFreeze(o1); // Ensure o1 is not changed, for testing only
            //
            // Calling iassign() and _.map() to increment to every item in "c" array
            //
            var o2 = iassign(o1, function (o) { return o; }, function (o) {
                return _.map(o, function (item, index) {
                    if (index < 2) {
                        item = _.cloneDeep(item);
                        item.d++;
                    }
                    return item;
                });
            });
            // expect o1 has not been changed
            expect(o1).toEqual([{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]);
            // expect o2.a.b.c has been updated.
            expect(o2).toEqual([{ d: 12, e: 12 }, { d: 14, e: 14 }, { d: 21, e: 22 }]);
            // expect object graph for changed property in o2 is now different from (!==) o1.
            expect(o2).not.toBe(o1);
            expect(o2[0]).not.toBe(o1[0]);
            expect(o2[1]).not.toBe(o1[1]);
            // expect object graph for unchanged property in o2 is still equal to (===) o1.
            expect(o2[2]).toBe(o1[2]);
        });
        it("Test root is an object, and try to update root object", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };
            deepFreeze(o1);
            var o2 = iassign(o1, function (o) { return o; }, function (o) { o.a = { b: 1 }; return o; });
            //
            // Jasmine Tests
            //
            // expect o1 has not been changed
            expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} });
            // expect o2 inner property has been updated.
            expect(o2).toEqual({ a: { b: 1 }, a2: {} });
            // expect object graph for changed property in o2 is now different from (!==) o1.
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            // expect object graph for unchanged property in o2 is still equal to (===) o1.
            expect(o2.a2).toBe(o1.a2);
        });
        it("Use built-in deep freeze to protect input", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            iassign.freezeInput = true;
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].push(3); return ci; });
            }).toThrowError(TypeError, /Cannot|Can't|writable|doesn't|support|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].d++; return ci; });
            }).toThrowError(TypeError, /Cannot|read only|read-only|extensible|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].g = 1; return ci; });
            }).toThrowError(TypeError, /add|extensible|readonly/i);
            expect(function () {
                iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].pop(); return ci; });
            }).toThrowError(TypeError, /extensible|Cannot|can't|support|unable/i);
            iassign.freezeInput = undefined;
        });
        it("Use built-in deep freeze to protect output", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]] } } };
            iassign.freezeOutput = true;
            var o2 = iassign(o1, function (o) { return o.a.b.c[0]; }, function (c) {
                return _.map(c, function (item) { return iassign(item, function (o) { return o.d; }, function (d) { return d + 1; }); });
            });
            // expect o1 has not been changed
            expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]] } } });
            expect(o2.a.b.c[0][0].d).toBe(12);
            expect(o2.a.b.c[0][1].d).toBe(14);
            expect(o2.a.b.c[0][2].d).toBe(22);
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][1]).not.toBe(o1.a.b.c[0][1]);
            expect(o2.a.b.c[0][2]).not.toBe(o1.a.b.c[0][2]);
            expect(function () {
                o2.a.b.c[0].push(3);
            }).toThrowError(TypeError, /Cannot|Can't|writable|doesn't|support|readonly/i);
            expect(function () {
                o2.a.b.c[0][0].d++;
            }).toThrowError(TypeError, /Cannot|read only|read-only|extensible|readonly/i);
            expect(function () {
                o2.a.b.c[0][0].g = 1;
            }).toThrowError(TypeError, /add|extensible|readonly/i);
            expect(function () {
                o2.a.b.c[0].pop();
            }).toThrowError(TypeError, /extensible|Cannot|can't|support|unable/i);
            iassign.freezeOutput = undefined;
        });
    });
});
