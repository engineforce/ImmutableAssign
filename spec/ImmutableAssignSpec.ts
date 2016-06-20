
import iassign = require("../src/iassign");
import deepFreeze = require("deep-freeze");

describe("Test", function () {

  beforeEach(function () {
  });

  it("Access array item", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
    deepFreeze(o1);

    var p1 = { a: 0 };
    var o2 = iassign(o1, function (o) { return o.a.b.c[0][0]; }, function (ci) { ci.d++; return ci; });

    expect(o2).not.toBe(o1);
    expect(o2.a).not.toBe(o1.a);
    expect(o2.a.b).not.toBe(o1.a.b);
    expect(o2.a.b.c).not.toBe(o1.a.b.c);
    expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
    expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
    expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
    expect(o2.a.b.c[0][0].d).toBe(12);
  });

  it("Access array 1", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
    deepFreeze(o1);

    var p1 = { a: 0 };
    var o2 = iassign(o1, function (o) { return o.a.b.c[1]; }, function (c) { c.push(<any>101); return c; });

    expect(o2).not.toBe(o1);
    expect(o2.a).not.toBe(o1.a);
    expect(o2.a.b).not.toBe(o1.a.b);
    expect(o2.a.b.c).not.toBe(o1.a.b.c);
    expect(o2.a.b.c[0]).toBe(o1.a.b.c[0]);
    expect(o2.a.b.c[1]).not.toBe(o1.a.b.c[1]);
    expect(o2.a.b.c[1][0]).toBe(o1.a.b.c[1][0]);
    expect(o2.a.b.c[1][1]).toBe(101);
  });

  it("Access array 2", function () {
    var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
    deepFreeze(o1);

    var p1 = { a: 0 };
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

    var p1 = { a: 0 };
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

    var p1 = { a: 0 };
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

    var p1 = { a: 0 };
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

    var p1 = { a: 0 };

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].push(<any>3); return ci; }, { p1 });
    }).toThrowError(TypeError, /Can't add property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { ci[0].d++; return ci; }, { p1 });
    }).toThrowError(TypeError, /Cannot assign to read only property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c[0]; }, function (ci) { (<any>ci[0]).g = 1; return ci; }, { p1 });
    }).toThrowError(TypeError, /Can't add property/);

    expect(() => {
      iassign(o1, function (o) { return o.a.b.c; }, function (ci) { ci[0].pop(); return ci; }, { p1 });
    }).toThrowError(TypeError, /object is not extensible/);
  });

});
