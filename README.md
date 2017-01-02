# immutable-assign (iassign.js)

Lightweight immutable helper that allows you to continue working with POJO (Plain Old JavaScript Object), and supports full TypeScript type checking.

[![NPM version][3]][4] [![Build Status][1]][2] [![coverage status][5]][6]

[![Sauce Test Status][7]][8]

This library is trying to solve following problems:

* Most immutable JavaScript libraries try to encapsulate the data and provide proprietary APIs to work with the data. They are more verbose than normal JavaScript syntax. E.g., map1.get('b') vs map1.b, nested2.getIn(['a', 'b', 'd']) vs nested2.a.b.d, etc.
* Encapsulated data is no more POJO, therefore cannot be easily used with other libraries, e.g., lodash, underscore, etc.
* Most immutable libraries leak themselves throughout your entire application (including view components), however, they should have been encapsulated at the place where updates happen (e.g., Redux reducers). This is also a pain when you need to change to another immutable library that has its own APIs.
* [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) address some of above issues when reading the properties, but still use verbose APIs to write properties.
* [Immutability Helpers](https://facebook.github.io/react/docs/update.html) allows us to work with POJO, but it has still introduced some magic keywords, such as $set, $push, etc.
* In addition, we lost TypeScript type checking. E.g., when calling nested2.getIn(["a", "b", "c"]), TypeScript won't be able to warn me if I changed property "c" to "d".

This library is an alternative to [Immutable.js](https://facebook.github.io/immutable-js/), it has only one method **iassign()**, which accept a POJO object and return you a new POJO object with specific property updated. However, since it works with other libraries such as lodash (refer to [example 4](#example-4-work-with-3rd-party-libraries-eg-lodash)), it provides all the functionalities you need plus immutability.

* I have added some options to freeze input and output using [deep-freeze](https://github.com/substack/deep-freeze), which can be used in development to make sure they don't change unintentionally by us or the 3rd party libraries. 

This library will leave your POJO objects completely untouched (except the optional deep-freeze), it does not wrap around nor add any methods/properties to your POJO objects.

This library works in JavaScript and it works really well with TypeScript, because of its [generic type argument inference](https://www.typescriptlang.org/docs/handbook/generics.html); and since you are working with POJO (not the wrapper objects), you can utilize the full power of TypeScript: IntelliSense, type checking and refactoring, etc.

## Performance

Performance of this library should be comparable to [Immutable.js](https://facebook.github.io/immutable-js/), because read operations will always occur more than write operations. When using this library, all your react components can read object properties directly. E.g., you can use &lt;TextBox value={this.state.userinfo.fullName} /&gt; in your components, instead of &lt;TextBox value={this.state.getIn(["userinfo", "fullName"])} /&gt;. In addition, shouldComponentUpdate() can compare POJO objects without knowing about the immutable libraries, e.g., return this.props.userInfo.orders !== nextProps.userInfos.orders. I.e., the more read operations you have, the more it will outperform [Immutable.js](https://facebook.github.io/immutable-js/). Following are the benchmarks for mutlple immutable libraries (assuming the read to write ratio is 5 to 1):

![benchmarks](benchmarks.png?raw=true "benchmarks")

##Install with npm

    npm install immutable-assign --save

#### Function Signature (TypeScript syntax)

```javascript

// Return a new POJO object with property updated.

// function overload 1: 
function iassign<TObj, TProp, TContext>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get the property that needs to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set the property.
    context?: TContext,                                 // (Optional) Context to be used in getProp().
    option?: IIassignOption): TObj;                     // (Optional) Options

// function overload 2: you can skip getProp() if you trying to update the root object, refer to example 1 and 2
function iassign<TObj>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    setProp: setPropFunc<TObj>,                         // Function to set the property.
    option?: IIassignOption): TObj;                     // (Optional) Options


// Options, can be applied globally or individually
interface IIassignOption {
    freeze?: boolean;              // Deep freeze both input and output
    freezeInput?: boolean;         // Deep freeze input
    freezeOutput?: boolean;        // Deep freeze output

    // Disable validation for extra statements in the getProp() function, 
    // which is needed when running the coverage, e.g., istanbul.js does add 
    // instrument statements in our getProp() function, which can be safely ignored. 
    disableExtraStatementCheck?: boolean;
}
```

####Example 1: Update object

```javascript
var iassign = require("immutable-assign");

// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.freeze = true;

var map1 = { a:1, b:2, c:3 };

// 1: Calling iassign() to update map1.b, using overload 2
var map2 = iassign(
    map1,
    function (m) { m.b = 50; return m; }
);

// map2 = { a:1, b: 50, c:3 }
// map2 !== map1

```

####Example 2: Update list/array

```javascript
var iassign = require("immutable-assign");

var list1 = [1, 2];


// 2.1: Calling iassign() to push items to list1, using overload 2
var list2 = iassign(
    list1,
    function (l) { l.push(3, 4, 5); return l; }
);

// list2 = [1, 2, 3, 4, 5]
// list2 !== list1


// 2.2: Calling iassign() to unshift item to list2, using overload 2
var list3 = iassign(
    list2,
    function (l) { l.unshift(0); return l; }
);

// list3 = [0, 1, 2, 3, 4, 5]
// list3 !== list2


// 2.3, Calling iassign() to concat list1, list2 and list3, using overload 2
var list4 = iassign(
    list1,
    function (l) { return l.concat(list2, list3); }
);

// list4 = [1, 2, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5]
// list4 !== list1


// 2.4, Calling iassign() to concat sort list4, using overload 2
var list5 = iassign(
    list4,
    function (l) { return l.sort(); }
);

// list5 = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5]
// list5 !== list4

```

####Example 3: Update nested structures

```javascript
var iassign = require("immutable-assign");

var nested1 = { a:{ b:{ c:[3, 4, 5] } } };


// 3.1: Calling iassign() to assign d to nested1.a.b
var nested2 = iassign(
    nested1,
    function (n) { return n.a.b; },
    function (b) { b.d = 6; return b; }
);

// nested2 = { a:{ b:{ c:[3, 4, 5], d: 6 } } }
// nested2 !== nested1


// 3.2: Calling iassign() to increment nested2.a.b.d
var nested3 = iassign(
    nested2,
    function (n) { return n.a.b.d; },
    function (d) { return d + 1; }
);

// nested3 = { a:{ b:{ c:[3, 4, 5], d: 7 } } }
// nested3 !== nested2


// 3.3: Calling iassign() to push item to nested3.a.b.c
var nested4 = iassign(
    nested3,
    function (n) { return n.a.b.c; },
    function (c) { c.push(6); return c; }
);

// nested4 = { a:{ b:{ c:[3, 4, 5, 6], d: 7 } } }
// nested4 !== nested3

```

####Example 4: Work with 3rd party libraries, e.g., lodash

```javascript
var iassign = require("immutable-assign");
var _ = require("lodash");

var nested1 = { a: { b: { c: [1, 2, 3] } } };


// 4.1: Calling iassign() and _.map() to increment to every item in "c" array
var nested2 = iassign(
    nested1,
    function (n) { return n.a.b.c; },
    function (c) {
        return _.map(c, function (i) { return i + 1; });
    }
);

// nested2 = { a: { b: { c: [2, 3, 4] } } };
// nested2 !== nested1


// 4.2: Calling iassign() and _.flatMap()
var nested3 = iassign(
    nested2,
    function (n) { return n.a.b.c; },
    function (c) {
        return _.flatMap(c, function (i) { return [i, i]; });
    }
);

// nested3 = { a: { b: { c: [2, 2, 3, 3, 4, 4] } } };
// nested3 !== nested2

```


####Advanced example 5: Update nested property

```javascript
var iassign = require("immutable-assign");

var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

// 5: Calling iassign() to increment o1.a.b.c[0][0].d
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

####Advanced example 6: Update array

```javascript
var iassign = require("immutable-assign");

var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

// 6: Calling iassign() to push new item to o1.a.b.c[1]
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


####Advanced example 7: Update nested property, referring to external context.

```javascript
var iassign = require("immutable-assign");

var o1 = { a: { b: { c: [{ d: 11, e: 12 }, { d: 21, e: 22 }] } } };

// 7: Calling iassign() to push increment to o1.a.b.c[0].d
var external = { a: 0 };

var o2 = iassign(
    o1,
    function (o, ctx) { return o.a.b.c[ctx.external.a]; },
    function (ci) { ci.d++; return ci; },
    { external: external }
);
```
```javascript
//
// Jasmine Tests
//

// expect o1 has not been changed
expect(o1).toEqual({ a: { b: { c: [{ d: 11, e: 12 }, { d: 21, e: 22 }] });

// expect o2 inner property has been updated.
expect(o2.a.b.c[external.a].d).toBe(12);

// expect object graph for changed property in o2 is now different from (!==) o1.
expect(o2).not.toBe(o1);
expect(o2.a).not.toBe(o1.a);
expect(o2.a.b).not.toBe(o1.a.b);
expect(o2.a.b.c).not.toBe(o1.a.b.c);
expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
expect(o2.a.b.c[0].d).not.toBe(o1.a.b.c[0].d);

// expect object graph for unchanged property in o2 is still equal to (===) o1.
expect(o2.a.b.c[0].e).toBe(o1.a.b.c[0].e);
expect(o2.a.b.c[1]).toBe(o1.a.b.c[1]);
expect(o2.a.b.c[1].d).toBe(o1.a.b.c[1].d);
expect(o2.a.b.c[1].e).toBe(o1.a.b.c[1].e);

```


##Constraints

* getProp() must be a pure function; I.e., it cannot access anything other than the input parameters. e.g., it must not access "this" or "window" objects. In addition, it must not modify the input parameters. It should only return a property that needs to be updated.
* getProp() currently does not support comments in the function body, you can work around this by putting comments outside of the function body.


##History

* 1.0.23 - Greatly improved performance.
* 1.0.21 - Added new function overload to skip getProp() if you trying to update the root object, refer to [example 1](#example-1-update-object) and [example 2](#example-2-update-listarray)
* 1.0.20 - Added Travis-CI, Coveralls (coverage) and SauceLabs (browsers' tests)
* 1.0.19 - Added TypeScript types to package.json
* 1.0.18 - Tested on Mac (Safari 10 and Chrome 54)
* 1.0.16 - Tested in Node.js and major browsers (IE 11, Chrome 52, Firefox 47, Edge 13, PhantomJS 2)


[1]: https://travis-ci.org/engineforce/ImmutableAssign.svg?branch=master
[2]: https://travis-ci.org/engineforce/ImmutableAssign
[3]: https://badge.fury.io/js/immutable-assign.svg
[4]: https://badge.fury.io/js/immutable-assign
[5]: https://coveralls.io/repos/github/engineforce/ImmutableAssign/badge.svg?branch=master
[6]: https://coveralls.io/github/engineforce/ImmutableAssign?branch=master
[7]: https://saucelabs.com/browser-matrix/engineforce.svg
[8]: https://saucelabs.com/u/engineforce
