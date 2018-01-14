"use strict";

(function (root, factory) {

    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    } else {
        // Browser globals (root is window)
        var browserRequire = function(name) {
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
    catch(ex) {
        deepFreeze = function() {};
        noDeepFreeze = true;
        console.warn("Cannot load deep-freeze module.", ex);
    }
    var _ = require("lodash");
    var immutable = require("immutable");

    if (typeof(global) !== "undefined") {
        console.log("In node");
        if (global.process.env.running_under_istanbul) {
            // Handle coverage tool that may modify the source code.
            iassign.disableExtraStatementCheck = true;
        }
    }
    
    if (typeof(window) !== "undefined") {
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

            expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } }, a2: 0 });
            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
            expect(o2.a.b.c[0][0].d).toBe(12);
        });

        // Will cause error but not the close brack error.
        xit("extra '[' should throw exception", function () {
            if (noDeepFreeze)
                return;
            
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            expect(function () {
                var o2 = iassign(o1, function (o) {
                    return o.a.b.c[0]["["]
                }, function (ci) { ci.d++; return ci; });
            }).toThrow(/Found open bracket but not close bracket/);
        });

        // Will cause error but not the open brack error.
        xit("extra ']' should throw exception", function () {
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            expect(function () {
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

            expect(function () {
                var o2 = iassign(o1, function (o) {
                    o.a.b.c[0][0]
                }, function (ci) { ci.d++; return ci; });
            }).toThrowError(/does not return a part of obj/);
        });

        xit("getProp() function has other statements should throw exception", function () {            
            if (iassign.disableExtraStatementCheck) {
                return;
            }

            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            expect(function () {
                var o2 = iassign(o1, function (o) {
                    var text = "unexpected text";
                    return o.a.b.c[0][0]
                }, function (ci) { ci.d++; return ci; });
            }).toThrowError(/has statements other than 'return'/);
        });

        it("getProp() function has other statements should not throw exception", function () {

            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
            deepFreeze(o1);

            var o2 = iassign(o1, function (o) {
                var text = "unexpected text";
                return o.a.b.c[0][0]
            }, function (ci) { ci.d++; return ci; });

            expect(o2).not.toBe(o1);
            expect(o2.a).not.toBe(o1.a);
            expect(o2.a.b).not.toBe(o1.a.b);
            expect(o2.a.b.c).not.toBe(o1.a.b.c);
            expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
            expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
            expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);

            expect(o1.a.b.c[0][0].d).toBe(11);
            expect(o2.a.b.c[0][0].d).toBe(12);
        });

         it("getProp() function has use strict statements should not throw exception", function () {
            
            var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
            deepFreeze(o1);

            var o2 = iassign(
                o1,
                function (o) {

                    "use strict";"use strict";
                    "use strict";'use strict'
                    "use strict"

                    'use strict';
                    'use strict'

                    return o.a.b.c[0][0];
                },
                function (ci) { 
                    ci.d++; return ci; 
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
        it("Answer stackoverflow: http://stackoverflow.com/questions/40519819/how-to-make-this-piece-of-code-looks-better", function () {
            var state = 
                {
                    sideCart: {
                        orderItems: {
                            1: {
                                id: 'orderItems-1',
                                name: 'AI Brown\'s BBQ Fillet of Beef with Brown Mushroom Brandy Sauce',
                                quantity: 10,
                                price: 12,
                                subitems: ['0', '1', '2'],
                                instruction: 'No rosemary for beef',
                            },
                            2: {
                                id: 'orderItems-2',
                                name: 'AI Brown\'s BBQ Fillet',
                                quantity: 10,
                                price: 14,
                                subitems: ['0', '1', '2'],
                                instruction: 'No rosemary for beef',
                            }
                        }
                    }
                };

            // For validation
            var stateText = JSON.stringify(state);
            var item = {id: 1};

            var newState = iassign(state, 
                // Return the property you need to modify in you state.
                // This function must be pure function, therefore "item" 
                // need to be passed in via the context parameter. 
                function(state, context) {                    
                    return state.sideCart.orderItems[context.item.id] 
                }, 
                // Modify selected part of your state
                // Don't need to be pure, therefore you can access "item" directly
                function(currentItem) { 
                    if (currentItem.quantity) 
                        item.quantity = currentItem.quantity + 1;
                    else 
                        item.quantity = 1;
                    
                    return item;
                },
                // Context
                {
                    item: item
                });

            expect(newState.sideCart.orderItems[1].quantity).toBe(11);

            // Expect state has not changed
            expect(JSON.stringify(state)).toBe(stateText);          

            // expect object graph for changed property in newState is now different from (!==) state.
            expect(state).not.toBe(newState);
            expect(state.sideCart).not.toBe(newState.sideCart);
            expect(state.sideCart.orderItems).not.toBe(newState.sideCart.orderItems);
            expect(state.sideCart.orderItems[1]).not.toBe(newState.sideCart.orderItems[1]);
            expect(state.sideCart.orderItems[1].quantity).not.toBe(newState.sideCart.orderItems[1].quantity);

            // expect object graph for unchanged property in newState is still equal to (===) state.
            expect(state.sideCart.orderItems[2]).toBe(newState.sideCart.orderItems[2]);
        });

        it("iassign.fp", function () {
            //var iassign = require("immutable-assign");

            // Deep freeze both input and output, can be used in development to make sure they don't change. 
            iassign.freeze = true;

            var nested1 = { a: { b: { c: [3, 4, 5] } } };


            // 3.1: Calling iassign() to assign d to nested1.a.b 
            var iassignFp = iassign.fp(
                undefined,
                function (n) { return n.a.b; },
                function (b) { b.d = 6; return b; },
                undefined
            );
            var nested2 = iassignFp(nested1);

            expect(nested1).toEqual({ a: { b: { c: [3, 4, 5] } } });
            expect(nested2).toEqual({ a: { b: { c: [3, 4, 5], d: 6 } } });
            expect(nested2).not.toBe(nested1);

            // 3.2: Calling iassign() to increment nested2.a.b.d 
            iassignFp = iassign.fp(
                undefined,
                function (n) { return n.a.b.d; },
                function (d) { return d + 1; },
                undefined
            );
            var nested3 = iassignFp(nested2);

            expect(nested2).toEqual({ a: { b: { c: [3, 4, 5], d: 6 } } });
            expect(nested3).toEqual({ a: { b: { c: [3, 4, 5], d: 7 } } });
            expect(nested3).not.toBe(nested2);

            // 3.3: Calling iassign() to push item to nested3.a.b.c 
            iassignFp = iassign.fp(
                undefined,
                function (n) { return n.a.b.c; },
                function (c) { c.push(6); return c; },
                undefined
            );
            var nested4 = iassignFp(nested3);

            expect(nested3).toEqual({ a: { b: { c: [3, 4, 5], d: 7 } } });
            expect(nested4).toEqual({ a: { b: { c: [3, 4, 5, 6], d: 7 } } });
            expect(nested4).not.toBe(nested3);

        });

        it("iassign.fp 2", function () {
            //var iassign = require("immutable-assign");

            // Deep freeze both input and output, can be used in development to make sure they don't change. 
            iassign.freeze = true;

            var nested1 = { a: { b: { c: [3, 4, 5] } } };


            // 8.1: Calling iassign() to assign d to nested1.a.b 
            var iassignFp = iassign.fp(undefined)
                (function (n) { return n.a.b; })
                (function (b) { b.d = 6; return b; })
                (undefined);

            var nested2 = iassignFp(nested1);

            expect(nested1).toEqual({ a: { b: { c: [3, 4, 5] } } });
            expect(nested2).toEqual({ a: { b: { c: [3, 4, 5], d: 6 } } });
            expect(nested2).not.toBe(nested1);

            // 8.2: Calling iassign() to increment nested2.a.b.d 
            iassignFp = iassign.fp(undefined)
                (function (n) { return n.a.b.d; })
                (function (d) { return d + 1; })
                (undefined);
            var nested3 = iassignFp(nested2);

            expect(nested2).toEqual({ a: { b: { c: [3, 4, 5], d: 6 } } });
            expect(nested3).toEqual({ a: { b: { c: [3, 4, 5], d: 7 } } });
            expect(nested3).not.toBe(nested2);

            // 8.3: Calling iassign() to push item to nested3.a.b.c 
            iassignFp = iassign.fp(undefined)
                (function (n) { return n.a.b.c; })
                (function (c) { c.push(6); return c; })
                (undefined);
            var nested4 = iassignFp(nested3);

            expect(nested3).toEqual({ a: { b: { c: [3, 4, 5], d: 7 } } });
            expect(nested4).toEqual({ a: { b: { c: [3, 4, 5, 6], d: 7 } } });
            expect(nested4).not.toBe(nested3);

            // 8.4: Calling iassign() to push item to nested3.a.b.c[1]
            iassignFp = iassign.fp(undefined)
                (function (n, ctx) { return n.a.b.c[ctx.i]; })
                (function (ci) { return ci + 100; })
                ({i: 1});
            var nested5 = iassignFp(nested4);

            expect(nested4).toEqual({ a: { b: { c: [3, 4, 5, 6], d: 7 } } });
            expect(nested5).toEqual({ a: { b: { c: [3, 104, 5, 6], d: 7 } } });
            expect(nested5).not.toBe(nested4);
        });
    });
});
