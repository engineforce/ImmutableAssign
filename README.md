# immutable-assign (iassign.js)

Lightweight immutable helper that allows you to continue working with POJO (Plain Old JavaScript Object), and supports full TypeScript type checking for nested objects.

[![NPM version][3]][4] [![Build Status][1]][2] [![coverage status][5]][6]

[![Sauce Test Status][7]][8]


<p>
    <a href="https://raw.githubusercontent.com/engineforce/ImmutableAssign/master/Demo.gif" target="_blank">
        <img src="https://raw.githubusercontent.com/engineforce/ImmutableAssign/master/Demo.gif" alt="Demo" title="Demo">
    </a>
</p>

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

Performance of this library should be comparable to [Immutable.js](https://facebook.github.io/immutable-js/), because read operations will always occur more than write operations. When using this library, all your react components can read object properties directly. E.g., you can use &lt;TextBox value={this.state.userinfo.fullName} /&gt; in your components, instead of &lt;TextBox value={this.state.getIn(["userinfo", "fullName"])} /&gt;. In addition, shouldComponentUpdate() can compare POJO objects without knowing about the immutable libraries, e.g., return this.props.userInfo.orders !== nextProps.userInfos.orders. I.e., the more read operations you have, the more it will outperform [Immutable.js](https://facebook.github.io/immutable-js/). Following are the benchmarks for multiple immutable libraries (assuming the read to write ratio is 5 to 1):

```
$ npm run benchmarks

Mutable
Total elapsed = 57 ms (read) + 41 ms (write) = 98 ms.

Immutable (immutable.js)
Total elapsed = 254 ms (read) + 847 ms (write) = 1101 ms.

Immutable (Object.assign)
Total elapsed = 66 ms (read) + 1339 ms (write) = 1405 ms.

Immutable (immutable-assign)
Total elapsed = 77 ms (read) + 2265 ms (write) = 2342 ms.

Immutable (immer setAutoFreeze(false))
Total elapsed = 65 ms (read) + 4706 ms (write) = 4771 ms.

Immutable (seamless-immutable production)
Total elapsed = 73 ms (read) + 29688 ms (write) = 29761 ms.
```

Full performance test results can be found at <a href="https://github.com/engineforce/ImmutableAssign/tree/master/debug" target="_blank">benchmarks</a>.

## Install with npm

```sh
npm install immutable-assign
# or
yarn add immutable-assign
```

<br />

### Example 1: Update 1st level object properties

```javascript
const iassign = require("immutable-assign");

// Deep freeze both input and output, can be used in development to make sure they don't change.
iassign.setOption({ freeze: true });

const map1 = { a:1, b:2, c:3 };

// 1: Calling iassign() to update map1.b, using overload 1
const map2 = iassign(
    map1,
    function (m) { m.b = 50; return m; }
);

// map2 = { a:1, b: 50, c:3 }
// map2 !== map1

```

<br />

### Example 2: Update 1st level list/array elements

```javascript
const iassign = require("immutable-assign");

const list1 = [1, 2];


// 2.1: Calling iassign() to push items to list1, using overload 1
const list2 = iassign(
    list1,
    function (l) { l.push(3, 4, 5); return l; }
);

// list2 = [1, 2, 3, 4, 5]
// list2 !== list1


// 2.2: Calling iassign() to unshift item to list2, using overload 1
const list3 = iassign(
    list2,
    function (l) { l.unshift(0); return l; }
);

// list3 = [0, 1, 2, 3, 4, 5]
// list3 !== list2


// 2.3, Calling iassign() to concat list1, list2 and list3, using overload 1
const list4 = iassign(
    list1,
    function (l) { return l.concat(list2, list3); }
);

// list4 = [1, 2, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5]
// list4 !== list1


// 2.4, Calling iassign() to concat sort list4, using overload 1
const list5 = iassign(
    list4,
    function (l) { return l.sort(); }
);

// list5 = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5]
// list5 !== list4

```

<br />

### Example 3: Update nested level object properties

```javascript
const iassign = require("immutable-assign");

const nested1 = { a:{ b:{ c:[3, 4, 5] } } };


// 3.1: Calling iassign() to assign d to nested1.a.b
const nested2 = iassign(
    nested1,
    function (n) { return n.a.b; },
    function (b) { b.d = 6; return b; }
);

// nested2 = { a:{ b:{ c:[3, 4, 5], d: 6 } } }
// nested2 !== nested1


// 3.2: Calling iassign() to increment nested2.a.b.d
const nested3 = iassign(
    nested2,
    function (n) { return n.a.b.d; },
    function (d) { return d + 1; }
);

// nested3 = { a:{ b:{ c:[3, 4, 5], d: 7 } } }
// nested3 !== nested2


// 3.3: Calling iassign() to push item to nested3.a.b.c
const nested4 = iassign(
    nested3,
    function (n) { return n.a.b.c; },
    function (c) { c.push(6); return c; }
);

// nested4 = { a:{ b:{ c:[3, 4, 5, 6], d: 7 } } }
// nested4 !== nested3

```

<br />

### Example 4: Work with 3rd party libraries, e.g., lodash

```javascript
const iassign = require("immutable-assign");
const _ = require("lodash");

const nested1 = { a: { b: { c: [1, 2, 3] } } };


// 4.1: Calling iassign() and _.map() to increment to every item in "c" array
const nested2 = iassign(
    nested1,
    function (n) { return n.a.b.c; },
    function (c) {
        return _.map(c, function (i) { return i + 1; });
    }
);

// nested2 = { a: { b: { c: [2, 3, 4] } } };
// nested2 !== nested1


// 4.2: Calling iassign() and _.flatMap()
const nested3 = iassign(
    nested2,
    function (n) { return n.a.b.c; },
    function (c) {
        return _.flatMap(c, function (i) { return [i, i]; });
    }
);

// nested3 = { a: { b: { c: [2, 2, 3, 3, 4, 4] } } };
// nested3 !== nested2

```

<br />

### Example 5: Update nested object

```javascript
const iassign = require("immutable-assign");

const o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

// 5: Calling iassign() to increment o1.a.b.c[0][0].d
const o2 = iassign(
    o1,
    function (o) { return o.a.b.c[0][0]; },
    function (ci) { ci.d++; return ci; }
);
```

<br />

### Example 6: Update nested array

```javascript
const iassign = require("immutable-assign");

const o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} }, b2: {} }, a2: {} };

// 6: Calling iassign() to push new item to o1.a.b.c[1]
const o2 = iassign(
    o1,
    function (o) { return o.a.b.c[1]; },
    function (c) { c.push(101); return c; }
);
```

<br />

### Example 7: Update nested object, referring to external context.

```javascript
const iassign = require("immutable-assign");

const o1 = { a: { b: { c: [{ d: 11, e: 12 }, { d: 21, e: 22 }] } } };

// 7: Calling iassign() to push increment to o1.a.b.c[0].d
const external = { a: 0 };

const o2 = iassign(
    o1,
    function (o, ctx) { return o.a.b.c[ctx.external.a]; },
    function (ci) { ci.d++; return ci; },
    { external: external }
);
```

<br />

### Example 8: Update nested object using iassign.fp() and currying

```javascript
const iassign = require("immutable-assign");

const nested1 = { a: { b: { c: [3, 4, 5] } } };


// 8.1: Calling iassign() to assign d to nested1.a.b 
const iassignFp = iassign.fp(undefined)
    (function (n) { return n.a.b; })
    (function (b) { b.d = 6; return b; })
    (undefined);

const nested2 = iassignFp(nested1);

// nested2 = { a: { b: { c: [3, 4, 5], d: 6 } } };
// nested2 !== nested1

// 8.2: Calling iassign() to increment nested2.a.b.d 
iassignFp = iassign.fp(undefined)
    (function (n) { return n.a.b.d; })
    (function (d) { return d + 1; })
    (undefined);
const nested3 = iassignFp(nested2);

// nested3 = { a: { b: { c: [3, 4, 5], d: 7 } } };
// nested3 !== nested2

// 8.3: Calling iassign() to push item to nested3.a.b.c 
iassignFp = iassign.fp(undefined)
    (function (n) { return n.a.b.c; })
    (function (c) { c.push(6); return c; })
    (undefined);
const nested4 = iassignFp(nested3);

// nested4 = { a: { b: { c: [3, 4, 5, 6], d: 7 } } };
// nested4 !== nested3

// 8.4: Calling iassign() to push item to nested3.a.b.c[1]
iassignFp = iassign.fp(undefined)
    (function (n, ctx) { return n.a.b.c[ctx.i]; })
    (function (ci) { return ci + 100; })
    ({i: 1});
const nested5 = iassignFp(nested4);

// nested5 = { a: { b: { c: [3, 104, 5, 6], d: 7 } } };
// nested5 !== nested4

```

### Example 9: Support ES6 Map

```javascript
const iassign = require("immutable-assign");

const map1 = new Map();
map1.set("a", "value a");

iassign.setOption({
    copyFunc: function (value, propName) {
        if (value instanceof Map) {
            // In IE11, Map constructor arguments are not supported,
            // you need to provide ES6 shim, e.g., use core-js
            return new Map(value);
        }
    }
});

const map2 = iassign(
    map1,
    m => { m.set(1, 'first'); return m; }
);

// map2 !== map1
// map1 = Map({ "a": "value a" })
// map1 = Map({ "a": "value a", 1: "first" })

```

### Example 10: Update nested level object properties using property paths (overload 3)

```javascript
const iassign = require("immutable-assign");

const o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }]], c2: {} } } };

const o2 = iassign(
    o1,
    ['a', 'b', 'c', 0, '0'],
    (ci: any) => {
        ci.d++;
        return ci;
    });

// o2 = { a: { b: { c: [[{ d: 12, e: 12 }], [{ d: 21, e: 22 }]], c2: {} } } };
// o2 !== o1
```

<br />

### Function Signature (TypeScript syntax)

```typescript

// Return a new POJO object with property updated.

// function overload 1: you can skip getProp() if you trying to update the 1st level object properties, refer to example 1 and 2
iassign = function<TObj>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    setProp: setPropFunc<TObj>,                         // Function to set the property.
    option?: IIassignOption): TObj;                     // (Optional) Options

// function overload 2: use getProp() to get prop paths
iassign = function<TObj, TProp, TContext>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get the property that needs to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set the property.
    context?: TContext,                                 // (Optional) Context to be used in getProp().
    option?: IIassignOption): TObj;                     // (Optional) Options

// function overload 3: pass in known property paths (array)
iassign = function<TObj, TProp, TContext>(
    obj: TObj,                                          // POJO object to be getting the property from, it will not be modified.
    propPaths: (string | number)[],                     // paths to the property that needs to be updated.
    setProp: setPropFunc<TObj>,                         // Function to set the property.
    option?: IIassignOption): TObj;                     // (Optional) Options

// functional programming friendly style, moved obj to the last parameter and supports currying, refer to example 8
iassign.fp = function <TObj, TProp, TContext>(
    option: IIassignOption,
    getPropOrPropPaths: getPropFunc<TObj, TProp, TContext> | (string | number)[],
    setProp: setPropFunc<TProp>,
    context?: TContext,
    obj?: TObj): TObj;                                  // POJO object to be getting the property from, it will not be modified.

// In ES6, you cannot set property on imported module directly, because they are default
// to readonly, in this case you need to use this method.
iassign.setOption(option: IIassignOption): void;

// Options, can be applied globally or individually
interface IIassignOption {
    freeze?: boolean;              // Deep freeze both input and output
    freezeInput?: boolean;         // Deep freeze input
    freezeOutput?: boolean;        // Deep freeze output
    useConstructor?: boolean;      // Uses the constructor to create new instances

    // Custom copy function, can be used to handle special types, e.g., Map, Set; refer to example 9
    copyFunc?: <T>(value: T, propName: string): T;

    // Disable validation for extra statements in the getProp() function, 
    // which is needed when running the coverage, e.g., istanbul.js does add 
    // instrument statements in our getProp() function, which can be safely ignored. 
    disableExtraStatementCheck?: boolean;

    // Return the same object if setProp() returns the input with no change.
    ignoreIfNoChange?: boolean;
}
```

## Constraints

* getProp() must be a pure function; I.e., it cannot access anything other than the input parameters. e.g., it must not access "this" or "window" objects. In addition, it must not modify the input parameters. It should only return a property that needs to be updated.


## History

* 2.1.0 - Added function overload 3 to pass in known property paths (array). Refer to [example 10](#example-10-update-object)
* 2.0.8 - Fixed bug for undefined properties.
* 2.0.4 - Replaced the proxy-polyfill with Object.defineProperty(), which has much better browser support.
* 2.0.1 - Minor bug fixes.
* 2.0.0  - 
    * Used [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) instead of [eval()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) to process getProp(), which is more secure.
    * Also works on platforms that don't support Proxy and Map, such as IE 10 and IE 11 using the [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill) and [ES6 Map polyfill](https://github.com/zloirock/core-js)

* 1.0.36 - [Supports ES6 Map and Set](https://github.com/engineforce/ImmutableAssign/issues/12). Refer to [example 9](https://github.com/engineforce/ImmutableAssign#example-9-support-es6-map)
* 1.0.35 - Supports ES6 default export.
* 1.0.31 - 
    * Added ignoreIfNoChange option, which cause iassign to return the same object if setProp() returns its parameter (i.e., reference pointer not changed).
    * Added setOption() function to allow you set the iassign options globally in ES6.

* 1.0.30 - [Support classes](https://github.com/engineforce/ImmutableAssign/issues/4)
* 1.0.29 - Supported ES6 [Arrow Functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
* 1.0.27 - Added iassign.fp() that support [currying](https://www.sitepoint.com/currying-in-functional-javascript), refer to [example 8](#example-8-update-nested-structures-using-iassignfp-and-currying)
* 1.0.26 - Works with webpack, please refer to [ImmutableAssignTest](https://github.com/engineforce/ImmutableAssignTest)
* 1.0.23 - Greatly improved performance.
* 1.0.21 - Added function overload 1 to skip getProp() if you trying to update the 1st level object properties, refer to [example 1](#example-1-update-object) and [example 2](#example-2-update-listarray)
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
[7]: https://saucelabs.com/browser-matrix/iassign.svg
[8]: https://saucelabs.com/u/iassign
