"use strict";

// Test working with immutable.js

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
        var deepFreeze = require("deep-freeze");
    }
    catch (ex) {
        deepFreeze = function () { };
        noDeepFreeze = true;
        console.warn("Cannot load deep-freeze module.");
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

    describe("Test 5", function () {
        beforeEach(function () {
        });
        it("Issue 12: Support Immutable.js Map", function () {

            var map1 = immutable.Map({"a": "value a"});

            iassign.setOption({
                copyFunc: function (value, propName) {
                    // No need to copy
                    //if (immutable.isImmutable(value)) {   // Added in v4+
                    if (immutable.Iterable.isIterable(value)) {
                        return value;
                    }
                }
            });

            var map2 = iassign(
                map1,
                function(m) { return m.set(1, 'first'); }
            );

            expect(map2).not.toBe(map1);

            expect(map2.size).toBe(2);
            expect(map2.get("a")).toBe("value a");
            expect(map2.get(1)).toBe("first");
            expect(map1.size).toBe(1);
            expect(map1.get("a")).toBe("value a");
            expect(map1.get(1)).toBe(undefined);

            var map3 = iassign(
                map2,
                function(m) { return  m.set(2, 'second'); }
            );

            expect(map3).not.toBe(map2);
            expect(map3).not.toBe(map1);

            expect(map3.size).toBe(3);
            expect(map3.get("a")).toBe("value a");
            expect(map3.get(1)).toBe("first");
            expect(map3.get(2)).toBe("second");

            expect(map2.size).toBe(2);
            expect(map2.get("a")).toBe("value a");
            expect(map2.get(1)).toBe("first");
            expect(map2.get(2)).toBe(undefined);

            expect(map1.size).toBe(1);
            expect(map1.get("a")).toBe("value a");
            expect(map1.get(1)).toBe(undefined);
            expect(map1.get(2)).toBe(undefined);
        });

        it("Issue 12: Support Immutable.js Map in nested object", function () {
            var o1 = { a: { b: { c: [[{ d: immutable.Map({"a": "value a"}), e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            iassign.setOption({
                copyFunc: function (value, propName) {
                    if (immutable.Iterable.isIterable(value)) {
                        return value;
                    }
                }
            });

            var o2 = iassign(
                o1,
                function (o) { return o.a.b.c[0][0].d },
                function (d) { return d.set(1, "first"); });

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o2.a.b.c[0][0].d.size).toBe(2);
            expect(o2.a.b.c[0][0].d.get("a")).toBe("value a");
            expect(o2.a.b.c[0][0].d.get(1)).toBe("first");
            expect(o1.a.b.c[0][0].d.size).toBe(1);
            expect(o1.a.b.c[0][0].d.get("a")).toBe("value a");
            expect(o1.a.b.c[0][0].d.get(1)).toBe(undefined);

            var o3 = iassign(
                o2,
                function (o) { return o.a.b.c[0][0].d },
                function (d) { return d.set(2, "second"); });

            expect(o3).not.toBe(o2);
            expect(o3.a).not.toBe(o2.a);
            expect(o3.a.b).not.toBe(o2.a.b);
            expect(o3.a.b.c).not.toBe(o2.a.b.c);
            expect(o3.a.b.c[0]).not.toBe(o2.a.b.c[0]);
            expect(o3.a.b.c[0][0]).not.toBe(o2.a.b.c[0][0]);
            expect(o3.a.b.c[0][0].d).not.toBe(o2.a.b.c[0][0].d);

            expect(o3.a.b.c[0][0].d.size).toBe(3);
            expect(o3.a.b.c[0][0].d.get("a")).toBe("value a");
            expect(o3.a.b.c[0][0].d.get(1)).toBe("first");
            expect(o3.a.b.c[0][0].d.get(2)).toBe("second");
            expect(o2.a.b.c[0][0].d.size).toBe(2);
            expect(o2.a.b.c[0][0].d.get("a")).toBe("value a");
            expect(o2.a.b.c[0][0].d.get(1)).toBe("first");
            expect(o2.a.b.c[0][0].d.get(2)).toBe(undefined);
        });

        it("Issue 12: Support Immutable.js Set", function () {

            var set1 = immutable.Set(["a"]);

            iassign.setOption({
                copyFunc: function (value, propName) {
                    if (immutable.Iterable.isIterable(value)) {
                        return value;
                    }
                }
            });

            var set2 = iassign(
                set1,
                function(m) { return m.add(1); }
            );

            expect(set2).not.toBe(set1);

            expect(set2.size).toBe(2);
            expect(set2.has("a")).toBe(true);
            expect(set2.has(1)).toBe(true);

            expect(set1.size).toBe(1);
            expect(set1.has("a")).toBe(true);
            expect(set1.has(1)).toBe(false);

            var set3 = iassign(
                set2,
                function(m) { return m.add(2); }
            );

            expect(set3).not.toBe(set2);
            expect(set3).not.toBe(set1);

            expect(set3.size).toBe(3);
            expect(set3.has("a")).toBe(true);
            expect(set3.has(1)).toBe(true);
            expect(set3.has(2)).toBe(true);

            expect(set2.size).toBe(2);
            expect(set2.has("a")).toBe(true);
            expect(set2.has(1)).toBe(true);
            expect(set2.has(2)).toBe(false);

            expect(set1.size).toBe(1);
            expect(set1.has("a")).toBe(true);
            expect(set1.has(1)).toBe(false);
            expect(set1.has(2)).toBe(false);
        });

        it("Issue 12: Support Immutable.js Set in nested object", function () {
            var o1 = { a: { b: { c: [[{ d: immutable.Set(["a"]), e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            iassign.setOption({
                copyFunc: function (value, propName) {
                    if (immutable.Iterable.isIterable(value)) {
                        return value;
                    }
                }
            });

            var o2 = iassign(
                o1,
                function (o) { return o.a.b.c[0][0].d },
                function (d) { return d.add(1); });

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o2.a.b.c[0][0].d.size).toBe(2);
            expect(o2.a.b.c[0][0].d.has("a")).toBe(true);
            expect(o2.a.b.c[0][0].d.has(1)).toBe(true);
            expect(o1.a.b.c[0][0].d.size).toBe(1);
            expect(o1.a.b.c[0][0].d.has("a")).toBe(true);
            expect(o1.a.b.c[0][0].d.has(1)).toBe(false);

            var o3 = iassign(
                o2,
                function (o) { return o.a.b.c[0][0].d },
                function (d) { return d.add(2); });

            expect(o3).not.toBe(o2);
            expect(o3.a).not.toBe(o2.a);
            expect(o3.a.b).not.toBe(o2.a.b);
            expect(o3.a.b.c).not.toBe(o2.a.b.c);
            expect(o3.a.b.c[0]).not.toBe(o2.a.b.c[0]);
            expect(o3.a.b.c[0][0]).not.toBe(o2.a.b.c[0][0]);
            expect(o3.a.b.c[0][0].d).not.toBe(o2.a.b.c[0][0].d);

            expect(o3.a.b.c[0][0].d.size).toBe(3);
            expect(o3.a.b.c[0][0].d.has("a")).toBe(true);
            expect(o3.a.b.c[0][0].d.has(1)).toBe(true);
            expect(o3.a.b.c[0][0].d.has(2)).toBe(true);
            expect(o2.a.b.c[0][0].d.size).toBe(2);
            expect(o2.a.b.c[0][0].d.has("a")).toBe(true);
            expect(o2.a.b.c[0][0].d.has(1)).toBe(true);
            expect(o2.a.b.c[0][0].d.has(2)).toBe(false);
        });
    });
});
