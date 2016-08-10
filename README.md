# immutable-assign (iassign.js)

Lightweight immutable helper that supports TypeScript type checking, and allows you to continue working with POJO (Plain Old JavaScript Object).

This library is trying to solve following problems:

* Most immutable JavaScript libraries try to encapsulate the data and provide proprietary APIs to work with the data. They are more verbose than normal JavaScript syntax. E.g., map1.get('b') vs map1.b, nested2.getIn(['a', 'b', 'd']) vs nested2.a.b.d, etc.
* Encapsulated data is no more POJO, therefore cannot be easily used with other libraries, e.g., lodash, underscore, etc.
* The use of most immutable libraries will leak themselves throughout your entire application (stores and components), however, it should have been encapsulated inside the stores where you update your states. This is a pain when you need to change to another immutable library that has its own API.
* [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) address some of above issues when reading the properties, but still use verbose APIs to write properties.
* [Immutability Helpers](https://facebook.github.io/react/docs/update.html) allows us work with POJO, but it has still introduced some magic keywords, such as $set, $push, etc.
* In addition, we lost TypeScript type checking. E.g., when calling nested2.getIn(['a', 'b', 'd']), TypeScript won't be able to warn me if I changed property 'd' to 'e'.

This library has only one method **iassign()**, which accept a POJO object and return you a new POJO object with specific property updated. I have added some options to freeze input and output using [deep-freeze](https://github.com/substack/deep-freeze), which can be used in development to make sure they don't change unintentionally by us or the 3rd party libraries.

## Performance

Performance of this library should be comparable to [Immutable.js](https://facebook.github.io/immutable-js/), because read operations will always occur more than write operations. When using this library, all your react components can read object properties directly. E.g., you can use &lt;TextBox value={this.state.userinfo.fullName} /&gt; in your components, instead of &lt;TextBox value={this.state.getIn(["userinfo", "fullName"])} /&gt;. I.e., the more read operations you have, the more it will outperform [Immutable.js](https://facebook.github.io/immutable-js/).

##Install with npm

    npm install immutable-assign --save

#### Function Signature

```javascript
// Return a new POJO object with property updated.
function iassign<TObj, TProp, TContext>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get the property that needs to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set the property.
    context?: TContext,                                 // (Optional) Context to be used in getProp().
    option?: IIassignOption): TObj;                     // (Optional) Options
    
// Options, can be applied globally or individually
interface IIassignOption {
    freeze: boolean;              // Deep freeze both input and output
    freezeInput: boolean;         // Deep freeze input
    freezeOutput: boolean;        // Deep freeze output
}
```

####Example 1: Update nested property

```javascript
var iassign = require("immutable-assign");

// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.freeze = true;

var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

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
```

####Example 2: Update array

```javascript
var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

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
```


####Example 3: Update nested property, referring to external context.

```javascript
var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]] } } };

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
```

####Example 4: Work with 3rd party libraries, e.g., lodash

```javascript
var iassign = require("immutable-assign");
var _ = require("lodash");

// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.freeze = true;

var o1 = { a: { b: { c: [1, 2, 3] } } };

// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.freeze = true;

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
```
```javascript
//
// Jasmine Tests
//

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
```

##Constraints

* getProp() must be pure function; I.e., it cannot access anything other than the input parameters. e.g., it must not access "this" or "window" objects. In addition, it must not modify the input parameters. It should only return a property that needs to be updated.




