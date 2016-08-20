"use strict";

(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports); if (v !== undefined) module.exports = v;
  }
  else if (typeof define === 'function' && define.amd) {
    define(["require", "exports"], factory);
  } else {
    // Browser globals (root is window)
    let require = (name) => {
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

    factory(require, {});
  }
})(this, function (require, exports) {
        
    var iassign = require("../src/iassign");
    var deepFreeze = require("deep-freeze");
    var _ = require("lodash");

    if (typeof(global) !== "undefined") {
        console.log("In node");
        if (global.process.env.running_under_istanbul) {
            // Handle coverage tool that may modify the source code.
            iassign.disableExtraStatementCheck = true;
        }
    }
    else if (typeof(window) !== "undefined") {
        console.log("In browser");
        if (window.__coverage__) {
            iassign.disableExtraStatementCheck = true;
        }
    }

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
            if (iassign.disableExtraStatementCheck) {
                return;
            }

            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            expect(() => {
                var o2 = iassign(o1, function (o) {
                    var text = "unexpected text";
                    return o.a.b.c[0][0]
                }, function (ci) { ci.d++; return ci; });
            }).toThrowError(/has statements other than 'return'/);
        });        
        
        it("getProp() disableExtraStatementCheck", function () {

            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
            deepFreeze(o1);

            var o2 = iassign(
                o1,
                function (o) {
                    var text = "unexpected text";
                    return o.a.b.c[0][0];
                },
                function (ci) { ci.d++; return ci; },
                undefined,
                {
                    disableExtraStatementCheck: true
                }
            );

            //
            // Jasmine Tests
            //

            // expect o1 has not been changed
            expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} })

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

            // var o2 = iassign(o1, function (o) {
            //     var text = "unexpected text";
            //     return o.a.b.c[0][0];
            // }, function (ci) { ci.d++; return ci; });
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

        it("Test root is an array, and try to update root array", function () {
            var o1 = [{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }];
            deepFreeze(o1); // Ensure o1 is not changed, for testing only

            //
            // Calling iassign() and _.map() to increment to every item in "c" array
            //
            var o2 = iassign(
                o1,
                function (o) { return                  o        
                    ; },
                function (o) {
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
            deepFreeze(o1); // Ensure o1 is not changed, for testing only

            var o2 = iassign(
                o1, 
                function (o) { return              o                  }, 
                function (o) { o.a = { b: 1 }; return o; });
            
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

        it("Access object property using string 4", function () {
            var propBName = "p\\r\"o.p t[] e.s't\'B";
            var propCName = "h\\e'llo w\'or\"ld";
            var propDName = 'h\\e"llo w\"or\'ld';
            var propEName = 'p\\r\'o.p t[] e.s"t\"B';
            var o1 = { a: (_a = {}, _a[propBName] = (_b = {}, _b[propCName] = (_c = {}, _c[propDName] = (_d = {}, _d[propEName] = [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], _d), _c), _b), _a) };
            deepFreeze(o1);
            var o2 = iassign(o1, function (o) { return o
                . 
                a 
                [ 
                "p\\r\"o.p t[] e.s't\'B" 
                ] 
                [ 
                    "h\\e'llo w\'or\"ld" 
                    ]         
                    [  
                        'h\\e"llo w\"or\'ld'  
                        ]  
                        [  
                            'p\\r\'o.p t[] e.s"t\"B'  
                            ]   
                            [  
                                "1"  
                                ]    
                                [      
                                    0  
                                    ]   
                                    .   
                                    d    
                                    ; }, function (d) { return d + 1; });
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
    });
});
