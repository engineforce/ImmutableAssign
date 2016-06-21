# ImmutableAssign
Lightweight immutable helper that supports TypeScript type checking.

##Install with npm

    npm install immutable-assign --save

#### Function Signature

```javascript
// Return a new object with property updated.
function iassign<TObj, TProp, TContext>(
    obj: TObj,                                          // Object to be getting the property from, it will not be modified.
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get the property that needs to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set the property.
    ctx?: TContext): TObj;                              // (Optional) Context to be used in getProp().
```

####Example 1: Update array

```javascript
var iassign = require("../src/iassign");
var deepFreeze = require("deep-freeze");

var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
deepFreeze(o1);     // Ensure o1 is not changed, for testing only

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
```

####Example 2: Update nested property

```javascript
var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]], c2: {} }, b2: {} }, a2: {} };
deepFreeze(o1);    // Ensure o1 is not changed, for testing only

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
```
