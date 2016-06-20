# ImmutableAssign
Lightweight immutable helper that supports TypeScript type checking.

##Install with npm

    npm install immutable-assign --save

####Example 1: Update array

```javascript
var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };

// Calling iassign()
var o2 = iassign(o1, function (o) { return o.a.b.c[1]; }, function (c) { c.push(101); return c; });

// Verify original object has not been changed.
expect(o2).not.toBe(o1);
expect(o2.a).not.toBe(o1.a);
expect(o2.a.b).not.toBe(o1.a.b);
expect(o2.a.b.c).not.toBe(o1.a.b.c);
expect(o2.a.b.c[0]).toBe(o1.a.b.c[0]);
expect(o2.a.b.c[1]).not.toBe(o1.a.b.c[1]);
expect(o2.a.b.c[1][0]).toBe(o1.a.b.c[1][0]);
expect(o2.a.b.c[1][1]).toBe(101);
```

####Example 2: Update nested property

```javascript
var o1 = { a: { b: { c: [[{ d: 11, e: 12 }], [{ d: 21, e: 22 }], [{ d: 31, e: 32 }]] } } };
let o2 = iassign(o1, (o) => o.a.b.c[0][0].d, (d) => { return d + 1; });
expect(o2).not.toBe(o1);
expect(o2.a).not.toBe(o1.a);
expect(o2.a.b).not.toBe(o1.a.b);
expect(o2.a.b.c).not.toBe(o1.a.b.c);
expect(o2.a.b.c[0]).not.toBe(o1.a.b.c[0]);
expect(o2.a.b.c[0][0]).not.toBe(o1.a.b.c[0][0]);
expect(o2.a.b.c[0][0].d).not.toBe(o1.a.b.c[0][0].d);
expect(o2.a.b.c[0][0].d).toBe(12);
```
