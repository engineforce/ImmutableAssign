## Performance test results

```
$ npm run benchmarks

Mutable
  Object: read (x500000): 10 ms
  Object: write (x100000): 3 ms
  Object: deep read (x500000): 4 ms
  Object: deep write (x100000): 3 ms
  Object: very deep read (x500000): 32 ms
  Object: very deep write (x100000): 10 ms
  Object: merge (x100000): 18 ms
  Array: read (x500000): 5 ms
  Array: write (x100000): 3 ms
  Array: deep read (x500000): 6 ms
  Array: deep write (x100000): 4 ms
Total elapsed = 57 ms (read) + 41 ms (write) = 98 ms.

Immutable (Object.assign)
  Object: read (x500000): 13 ms
  Object: write (x100000): 97 ms
  Object: deep read (x500000): 9 ms
  Object: deep write (x100000): 167 ms
  Object: very deep read (x500000): 28 ms
  Object: very deep write (x100000): 245 ms
  Object: merge (x100000): 116 ms
  Array: read (x500000): 8 ms
  Array: write (x100000): 347 ms
  Array: deep read (x500000): 8 ms
  Array: deep write (x100000): 367 ms
Total elapsed = 66 ms (read) + 1339 ms (write) = 1405 ms.

Immutable (immutable-assign)
  Object: read (x500000): 14 ms
  Object: write (x100000): 37 ms
  Object: deep read (x500000): 7 ms
  Object: deep write (x100000): 219 ms
  Object: very deep read (x500000): 41 ms
  Object: very deep write (x100000): 597 ms
  Object: merge (x100000): 37 ms
  Array: read (x500000): 7 ms
  Array: write (x100000): 373 ms
  Array: deep read (x500000): 8 ms
  Array: deep write (x100000): 1002 ms
Total elapsed = 77 ms (read) + 2265 ms (write) = 2342 ms.

Immutable (immer setAutoFreeze(false))
  Object: read (x500000): 10 ms
  Object: write (x100000): 211 ms
  Object: deep read (x500000): 6 ms
  Object: deep write (x100000): 371 ms
  Object: very deep read (x500000): 38 ms
  Object: very deep write (x100000): 679 ms
  Object: merge (x100000): 259 ms
  Array: read (x500000): 5 ms
  Array: write (x100000): 1489 ms
  Array: deep read (x500000): 6 ms
  Array: deep write (x100000): 1697 ms
Total elapsed = 65 ms (read) + 4706 ms (write) = 4771 ms.

Immutable (immutable.js)
  Object: read (x500000): 12 ms
  Object: write (x100000): 21 ms
  Object: deep read (x500000): 57 ms
  Object: deep write (x100000): 50 ms
  Object: very deep read (x500000): 107 ms
  Object: very deep write (x100000): 77 ms
  Object: merge (x100000): 498 ms
  Array: read (x500000): 17 ms
  Array: write (x100000): 94 ms
  Array: deep read (x500000): 61 ms
  Array: deep write (x100000): 107 ms
Total elapsed = 254 ms (read) + 847 ms (write) = 1101 ms.

Immutable (seamless-immutable production)
  Object: read (x500000): 14 ms
  Object: write (x100000): 364 ms
  Object: deep read (x500000): 7 ms
  Object: deep write (x100000): 790 ms
  Object: very deep read (x500000): 39 ms
  Object: very deep write (x100000): 1749 ms
  Object: merge (x100000): 408 ms
  Array: read (x500000): 6 ms
  Array: write (x100000): 12699 ms
  Array: deep read (x500000): 7 ms
  Array: deep write (x100000): 13678 ms
Total elapsed = 73 ms (read) + 29688 ms (write) = 29761 ms.

Immutable (Object.assign) + deep freeze
  Object: read (x500000): 10 ms
  Object: write (x100000): 184 ms
  Object: deep read (x500000): 16 ms
  Object: deep write (x100000): 320 ms
  Object: very deep read (x500000): 29 ms
  Object: very deep write (x100000): 488 ms
  Object: merge (x100000): 206 ms
  Array: read (x500000): 9 ms
  Array: write (x100000): 10351 ms
  Array: deep read (x500000): 15 ms
  Array: deep write (x100000): 10678 ms
Total elapsed = 79 ms (read) + 22227 ms (write) = 22306 ms.

Immutable (immutable-assign) + deep freeze
  Object: read (x500000): 12 ms
  Object: write (x100000): 31 ms
  Object: deep read (x500000): 19 ms
  Object: deep write (x100000): 265 ms
  Object: very deep read (x500000): 43 ms
  Object: very deep write (x100000): 431 ms
  Object: merge (x100000): 31 ms
  Array: read (x500000): 8 ms
  Array: write (x100000): 10658 ms
  Array: deep read (x500000): 14 ms
  Array: deep write (x100000): 20971 ms
Total elapsed = 96 ms (read) + 32387 ms (write) = 32483 ms.

Immutable (immer) + deep freeze
  Object: read (x500000): 15 ms
  Object: write (x100000): 334 ms
  Object: deep read (x500000): 15 ms
  Object: deep write (x100000): 611 ms
  Object: very deep read (x500000): 29 ms
  Object: very deep write (x100000): 932 ms
  Object: merge (x100000): 374 ms
  Array: read (x500000): 9 ms
  Array: write (x100000): 12394 ms
  Array: deep read (x500000): 14 ms
  Array: deep write (x100000): 13539 ms
Total elapsed = 82 ms (read) + 28184 ms (write) = 28266 ms.
```