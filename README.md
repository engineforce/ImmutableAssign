# ImmutableAssign

Lightweight immutable helper that supports TypeScript type checking, and allows you to continue working with POJO (Plain Old JavaScript Object).

This library is trying to solve following problems:

* Most immutable JavaScript libraries try to encapsulate the data, and provide proprietary APIs to work with the data. They are more verbose than normal JavaScript syntax. E.g., map1.get('b') vs map1.b, nested2.getIn(['a', 'b', 'd']) vs nested2.a.b.d, etc.
* Encapsulated data is no more POJO, therefore cannot be easily used with other libraries, e.g., lodash, underscore, etc.
* [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) address some of above issues when reading the properties, but still use verbose APIs to write properties.
* [Immutability Helpers](https://facebook.github.io/react/docs/update.html) allows us work with POJO, but it has still introduced some magic keywords, such as $set, $push, etc.
* Most importantly (in my opinion), we lost TypeScript type checking. E.g., when calling nested2.getIn(['a', 'b', 'd']), TypeScript won't be able to warn me if I changed property 'd' to 'e'.

This library has only one method **iassign()**, which accept a POJO object and return you a new POJO object with specific property updated.

##Install with npm

    npm install immutable-assign --save

#### Function Signature

```javascript
// Return a new POJO object with property updated.
function iassign<TObj, TProp, TContext>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get the property that needs to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set the property.
    ctx?: TContext): TObj;                              // (Optional) Context to be used in getProp().
```

####Example 1: Update array

```javascript
var iassign = require("iassign");
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
```
```javascript
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
```
```javascript
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
