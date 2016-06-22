
import iassign = require("../src/iassign");
import deepFreeze = require("deep-freeze");
import _ = require("lodash");

describe("Test", function () {

  beforeEach(function () {
  });

  it("Access array item", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
    deepFreeze(o1);

    var o2 = iassign(
      o1,
      (o) => o.a.b.c[0][0],
      (ci) => { ci.d++; return ci; }
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

  it("Access array 1", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
    deepFreeze(o1);

    var o2 = iassign(
      o1,
      (o) => o.a.b.c[1],
      (c) => { c.push(<any>101); return c; }
    );

    //
    // Jasmine Tests
    //

    // expect o1 has not been changed
    expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} })

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

    let o2 = iassign(o1, (o) => o.a.b.c, (c) => { c.d++; return c });

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

    let o2 = iassign(o1, (o) => o.a.b.c[0][0].d, (d) => { return d + 1; });

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

    let o2 = iassign(o1, (o) => o.a.b.c.f, (f) => { return new Date(2016, 1, 1) });

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

    let o2 = iassign(o1, (o) => o.a.b.c["1"]["0"].d, (d) => { return d + 1; });

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

    let o2 = iassign(o1, (o) => o.a["propB"].c["1"][0].d, (d) => { return d + 1; });

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
    var o2 = iassign(o1, function (o, ctx) { return o.a.b.c[ctx.p1.a][0]; }, function (ci) { ci.d++; return ci; }, { p1 });

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

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].push(<any>3); return ci; });
    }).toThrowError(TypeError, /Can't add property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].d++; return ci; });
    }).toThrowError(TypeError, /Cannot assign to read only property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { (<any>ci[0]).g = 1; return ci; });
    }).toThrowError(TypeError, /Can't add property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].pop(); return ci; });
    }).toThrowError(TypeError, /object is not extensible/);
  });

  it("Update array using lodash", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }], [{ d: 21, e: 22 }]] } } };

    deepFreeze(o1);   // Ensure o1 is not changed, for testing only

    //
    // Calling iassign() and _.map() to increment to d in c[0] array
    //
    let o2 = iassign(
      o1,
      (o) => o.a.b.c[0],
      (c) => {
        return _.map(c, (item) => { return iassign(item, (o) => o.d, (d) => d + 1); });
      });

    // expect o1 has not been changed
    expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }, { d: 13, e: 14 }], [{ d: 21, e: 22 }]] } } })

    expect(o2.a.b.c[0][0].d).toBe(12);
    expect(o2.a.b.c[0][1].d).toBe(14);

    expect(o2).not.toBe(o1);
    expect(o2.a).not.toBe(o1.a);
    expect(o2.a.b).not.toBe(o1.a.b);
    expect(o2.a.b.c).not.toBe(o1.a.b.c);
    // expect(o2.a.b.c[1]).not.toBe(o1.a.b.c[1]);
    // expect(o2.a.b.c[1][0]).not.toBe(o1.a.b.c[1][0]);
    // expect(o2.a.b.c[1][0].d).not.toBe(o1.a.b.c[1][0].d);
    // expect(o2.a.b.c[1][0].d).toBe(22);
  });

  it("Update array using lodash 2", function () {
    var o1 = { a: { b: { c: [1, 2, 3] } } };

    deepFreeze(o1);   // Ensure o1 is not changed, for testing only

    //
    // Calling iassign() and _.map() to increment to every item in "c" array
    //
    let o2 = iassign(
      o1,
      (o) => o.a.b.c,
      (c) => { return _.map(c, (i) => i + 1); }
    );

    // expect o1 has not been changed
    expect(o1).toEqual({ a: { b: { c: [1, 2, 3] } } })

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

    deepFreeze(o1);   // Ensure o1 is not changed, for testing only

    //
    // Calling iassign() and _.map() to increment to every item in "c" array
    //
    let o2 = iassign(
      o1,
      (o) => o[0],
      (o) => {
        return _.map(o, (item, index) => {
          if (index < 2) {
            item = _.cloneDeep(item);
            item.d++;
          }
          return item;
        });
      }
    );

    // expect o1 has not been changed
    expect(o1).toEqual([[{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }]])

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

    deepFreeze(o1);   // Ensure o1 is not changed, for testing only

    //
    // Calling iassign() and _.map() to increment to every item in "c" array
    //
    let o2 = iassign(
      o1,
      (o) => o,
      (o) => {
        return _.map(o, (item, index) => {
          if (index < 2) {
            item = _.cloneDeep(item);
            item.d++;
          }
          return item;
        });
      }
    );

    // expect o1 has not been changed
    expect(o1).toEqual([{ d: 11, e: 12 }, { d: 13, e: 14 }, { d: 21, e: 22 }])

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

    var o2 = iassign(
      o1,
      (o) => o,
      (o) => { o.a = <any>{ b: 1 }; return o; }
    );

    //
    // Jasmine Tests
    //

    // expect o1 has not been changed
    expect(o1).toEqual({ a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} });

    // expect o2 inner property has been updated.
    expect(o2).toEqual({ a: { b: 1}, a2: {} });

    // expect object graph for changed property in o2 is now different from (!==) o1.
    expect(o2).not.toBe(o1);
    expect(o2.a).not.toBe(o1.a);
    expect(o2.a.b).not.toBe(o1.a.b);

    // expect object graph for unchanged property in o2 is still equal to (===) o1.
    expect(o2.a2).toBe(o1.a2);
  });

});
