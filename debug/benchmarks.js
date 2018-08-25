
// Copied and modifed from https://github.com/guigrpa/timm/blob/master/tools/benchmarks.coffee

(function () {
    "use strict";

    var ARRAY_LENGTH, DEEP_PATH, INITIAL_ARRAY, INITIAL_OBJECT, Immutable, R, Seamless, _, _addResult, _allTests, _getIn, _solImmutableJs, _solImmutableSeamless, _solImmutableTimm, _solMutable, _test, _toggle, _verify, chalk, i, n, ref, timm;

    process.env.NODE_ENV = 'production'; // seamless-immutable will use this

    _ = require('lodash');

    chalk = require('chalk');

    var expect = require("expect");

    Seamless = require('../node_modules/seamless-immutable/seamless-immutable.production.min');
    //Seamless = require('seamless-immutable'); // This will also be production, because process.env.NODE_ENV = "production"

    Immutable = require('immutable');

    timm = require('timm');

    var _isDevel = false;

    var deepFreeze = require("deep-freeze-strict");

    var iassign = require("../src/iassign");

    var immer = require("immer");
    immer.setAutoFreeze(false);
    var produce = immer.default;

    var INITIAL_OBJECT = {
        toggle: false,
        b: 3,
        str: 'foo',
        d: {
            d1: 6,
            d2: 'foo',
            toggle: false,
            d9: {
                b: {
                    b: {
                        b: 1
                    }
                }
            }
        },
        e: {
            e1: 18,
            e2: 'foo'
        }
    };

    var DEEP_PATH = ['d', 'd9', 'b', 'b', 'b'];

    var ARRAY_LENGTH = 1000;

    var INITIAL_ARRAY = new Array(ARRAY_LENGTH);

    for (n = i = 0, ref = ARRAY_LENGTH; 0 <= ref ? i < ref : i > ref; n = 0 <= ref ? ++i : --i) {
        INITIAL_ARRAY[n] = {
            a: 1,
            b: 2
        };
    }

    var INITIAL_DEEP_ARRAY = [0, 1, 2, INITIAL_ARRAY, [5, 6, 7]];

    var R = 5e5;
    var W = R / 5;

    var _getIn = function (obj, path) {
        var j, key, len, out;
        out = obj;
        for (j = 0, len = path.length; j < len; j++) {
            key = path[j];
            out = out[key];
        }
        return out;
    };

    var _solMutable = {
        init: function () {
            return _.cloneDeep(INITIAL_OBJECT);
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            obj[key] = val;
            return obj;
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            obj[key1][key2] = val;
            return obj;
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {
            var idx, j, ptr, ref1;
            ptr = obj;
            for (idx = j = 0, ref1 = path.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; idx = 0 <= ref1 ? ++j : --j) {
                ptr = ptr[path[idx]];
            }
            ptr[path[path.length - 1]] = val;
            return obj;
        },
        merge: function (obj1, obj2) {
            var j, key, len, ref1, results1;
            ref1 = Object.keys(obj2);
            results1 = [];
            for (j = 0, len = ref1.length; j < len; j++) {
                key = ref1[j];
                results1.push(obj1[key] = obj2[key]);
            }
            return results1;
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }
            return _.cloneDeep(array);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            arr[idx] = val;
            return arr;
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr[idx1][idx2];
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            arr[idx1][idx2] = val;
            return arr;
        }
    };

    var _solObjectAssign = {
        init: function () {
            var obj = _.cloneDeep(INITIAL_OBJECT);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            if (obj[key] === val)
                return obj;

            obj = Object.assign({}, obj);
            obj[key] = val;
            return obj;
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            if (obj[key1][key2] === val)
                return obj;

            obj = Object.assign({}, obj);
            obj[key1] = Object.assign({}, obj[key1]);
            obj[key1][key2] = val;
            return obj;
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {

            obj = Object.assign({}, obj);
            var prop = obj;
            for (var i = 0; i < path.length; ++i) {
                var pathPart = path[i];
                if (i < path.length - 1) {
                    prop[pathPart] = Object.assign({}, prop[pathPart]);
                    prop = prop[pathPart];
                }
                else {
                    prop[pathPart] = val;
                }
            }

            return obj;
        },
        merge: function (obj1, obj2) {
            return Object.assign({}, obj1, obj2);
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }

            var obj = _.cloneDeep(array);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            if (arr[idx] === val)
                return arr;

            arr = arr.slice(0);
            arr[idx] = val;
            return arr;
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr[idx1][idx2];
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            if (arr[idx1][idx2] === val)
                return arr;

            arr = arr.slice(0);
            arr[idx1] = arr[idx1].slice(0);
            arr[idx1][idx2] = val;
            return arr;
        },
    };

    var _solIassign = {
        init: function () {
            var obj = _.cloneDeep(INITIAL_OBJECT);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            // Paul Note
            if (obj[key] === val)
                return obj;

            return iassign(
                obj,
                function (obj) { obj[key] = val; return obj; }
            );
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            // Paul Note
            if (obj[key1][key2] === val)
                return obj;

            return iassign(
                obj,
                function (obj, ctx) { return obj[ctx.key1]; },
                function (oKey1) { oKey1[key2] = val; return oKey1; },
                { key1: key1 }
            );
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {
            // Paul Note
            var keyText = "";
            for (var i = 0; i < path.length; i++) {
                keyText += "['" + path[i] + "']";
            }

            return iassign(
                obj,
                new Function('obj', 'ctx', 'return obj' + keyText),
                function (prop) {
                    prop = val; return prop;
                }
            )
        },
        merge: function (obj1, obj2) {
            return iassign(
                obj1,
                function (obj1) {
                    for (var key in obj2) {
                        obj1[key] = obj2[key];
                    }
                    return obj1;
                }
            )
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }

            var obj = _.cloneDeep(array);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            // Paul Note
            if (arr[idx] === val)
                return arr;

            return iassign(
                arr,
                function (arr) { arr[idx] = val; return arr; }
            );
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr[idx1][idx2];
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            if (arr[idx1][idx2] === val)
                return arr;

            return iassign(
                arr,
                function (arr, ctx) { return arr[ctx.idx1][ctx.idx2]; },
                function (prop) { return val; },
                {
                    idx1: idx1,
                    idx2: idx2
                }
            )
        }
    };

    var _solImmer = {
        init: function () {
            var obj = _.cloneDeep(INITIAL_OBJECT);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            // Paul Note
            if (obj[key] === val)
                return obj;

            return produce(
                obj,
                function (obj) { obj[key] = val; return obj; }
            );
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            // Paul Note
            if (obj[key1][key2] === val)
                return obj;

            return produce(
                obj,
                function (obj) { obj[key1][key2] = val; return obj; }
            );
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {
            return produce(obj, obj => {
                var idx, j, ptr, ref1;
                ptr = obj;
                for (idx = j = 0, ref1 = path.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; idx = 0 <= ref1 ? ++j : --j) {
                    ptr = ptr[path[idx]];
                }
                ptr[path[path.length - 1]] = val;
            });
        },
        merge: function (obj1, obj2) {
            return produce(
                obj1,
                function (obj1) {
                    for (var key in obj2) {
                        obj1[key] = obj2[key];
                    }
                    return obj1;
                }
            )
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }

            var obj = _.cloneDeep(array);
            if (_isDevel) {
                obj = deepFreeze(obj);
            }
            return obj;
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            // Paul Note
            if (arr[idx] === val)
                return arr;

            return produce(
                arr,
                function (arr) { arr[idx] = val; return arr; }
            );
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr[idx1][idx2];
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            if (arr[idx1][idx2] === val)
                return arr;

            return produce(
                arr,
                function (arr) { arr[idx1][idx2] = val; return arr; }
            )
        }
    };


    var _solImmutableTimm = {
        init: function () {
            return _.cloneDeep(INITIAL_OBJECT);
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            return timm.set(obj, key, val);
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            return timm.set(obj, key1, timm.set(obj[key1], key2, val));
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {
            return timm.setIn(obj, path, val);
        },
        merge: function (obj1, obj2) {
            return timm.merge(obj1, obj2);
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }
            return _.cloneDeep(array);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            return timm.replaceAt(arr, idx, val);
        }
    };

    var _solImmutableJs = {
        init: function () {
            return Immutable.fromJS(INITIAL_OBJECT);
        },
        get: function (obj, key) {
            return obj.get(key);
        },
        set: function (obj, key, val) {
            return obj.set(key, val);
        },
        getDeep: function (obj, key1, key2) {
            return obj.getIn([key1, key2]);
        },
        setDeep: function (obj, key1, key2, val) {
            return obj.setIn([key1, key2], val);
        },
        getIn: function (obj, path) {
            return obj.getIn(path);
        },
        setIn: function (obj, path, val) {
            return obj.setIn(path, val);
        },
        merge: function (obj1, obj2) {
            return obj1.merge(obj2);
        },
        initArr: function (array) {
            if (!array) {
                return Immutable.List(INITIAL_ARRAY);
            }
            return Immutable.fromJS(array);
        },
        getAt: function (arr, idx) {
            return arr.get(idx);
        },
        setAt: function (arr, idx, val) {
            return arr.set(idx, val);
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr.getIn([idx1, idx2]);
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            return arr.setIn([idx1, idx2], val);
        }
    };

    var _solImmutableSeamless = {
        init: function () {
            return Seamless(INITIAL_OBJECT);
        },
        get: function (obj, key) {
            return obj[key];
        },
        set: function (obj, key, val) {
            return obj.set(key, val);
        },
        getDeep: function (obj, key1, key2) {
            return obj[key1][key2];
        },
        setDeep: function (obj, key1, key2, val) {
            return obj.setIn([key1, key2], val);
        },
        getIn: _getIn,
        setIn: function (obj, path, val) {
            return obj.setIn(path, val);
        },
        merge: function (obj1, obj2) {
            return obj1.merge(obj2);
        },
        initArr: function (array) {
            if (!array) {
                array = INITIAL_ARRAY;
            }
            return Seamless(array);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            return arr.set(idx, val);
        },
        getAtDeep: function (arr, idx1, idx2) {
            return arr[idx1][idx2];
        },
        setAtDeep: function (arr, idx1, idx2, val) {
            return arr.setIn([idx1, idx2], val);
        }
    };

    var _toggle = function (solution, obj) {
        return solution.set(obj, 'toggle', !(solution.get(obj, 'toggle')));
    };

    var _addResult = function (results, condition) {
        return results.push(condition ? chalk.green.bold('P') : chalk.green.red('F'));
    };

    var _verify = function (solution, ignoreMutationError) {
        var arr, arr2, get, getAt, getAtDeep, getIn, init, initArr, merge, obj, obj2, results, set, setAt, setDeep, setIn, setAtDeep;
        results = [];
        init = solution.init, get = solution.get, set = solution.set, setDeep = solution.setDeep, getIn = solution.getIn,
            setIn = solution.setIn, merge = solution.merge, initArr = solution.initArr, getAt = solution.getAt, setAt = solution.setAt
        getAtDeep = solution.getAtDeep, setAtDeep = solution.setAtDeep;
        obj = init();
        _addResult(results, get(obj, 'toggle') === false);

        results.push('-');  // 1
        obj2 = set(obj, 'toggle', true);
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {toggle: true}));
        }

        _addResult(results, get(obj, 'toggle') === false);
        _addResult(results, get(obj2, 'toggle') === true);
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));

        results.push('-');  // 2
        obj2 = set(obj, 'str', 'foo');
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {str: 'foo'}));
        }
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));

        results.push('-');  // 3
        obj2 = setDeep(obj, 'd', 'd1', 3);
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {d: { d1: 3}}));
        }
        _addResult(results, solution.getDeep(obj, 'd', 'd1') === 6);
        _addResult(results, solution.getDeep(obj2, 'd', 'd1') === 3);
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') !== get(obj, 'd'));
        _addResult(results, get(obj2, 'e') === get(obj, 'e'));

        results.push('-');  // 4
        obj2 = set(obj, 'b', get(obj, 'b'));
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(INITIAL_OBJECT);
        }
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));

        results.push('-');  // 5
        obj2 = set(obj, 'str', 'bar');
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {str: 'bar'}));
        }
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));

        obj = init();
        obj2 = setDeep(obj, 'd', 'd1', 6);
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {d: { d1: 6}}));
        }
        _addResult(results, solution.getDeep(obj, 'd', 'd1') === 6);
        _addResult(results, solution.getDeep(obj2, 'd', 'd1') === 6);
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));

        results.push('-');  // 6
        obj2 = setIn(obj, DEEP_PATH, 3);
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {d: { d9: {b: {b: {b: 3}}}}}));
        }
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') !== get(obj, 'd'));
        _addResult(results, get(obj2, 'e') === get(obj, 'e'));
        _addResult(results, getIn(obj, DEEP_PATH) === 1);
        _addResult(results, getIn(obj2, DEEP_PATH) === 3);

        results.push('-');  // 7
        obj2 = merge(obj, {
            c: 5,
            f: null
        });
        if (!ignoreMutationError) {
            expect(obj).toEqual(INITIAL_OBJECT);
            expect(obj2).toEqual(_.merge(_.cloneDeep(INITIAL_OBJECT), {c: 5, f: null}));
        }
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        _addResult(results, get(obj2, 'c') === 5);
        _addResult(results, get(obj2, 'f') === null);

        results.push('-');  // 8
        arr = initArr();
        arr2 = setAt(arr, 1, {
            b: 3
        });
        if (!ignoreMutationError) {
            expect(arr).toEqual(INITIAL_ARRAY);
            const expectedArr2 = _.cloneDeep(INITIAL_ARRAY);
            expectedArr2[1] = {b: 3};
            expect(arr2).toEqual(expectedArr2);
        }
        _addResult(results, arr2 !== arr);
        _addResult(results, getAt(arr, 1).b === 2);
        _addResult(results, getAt(arr2, 1).b === 3);
        arr2 = setAt(arr, 1, getAt(arr, 1));
        if (!ignoreMutationError) {
            expect(arr).toEqual(INITIAL_ARRAY);
            expect(arr2).toEqual(INITIAL_ARRAY);
        }
        _addResult(results, arr2 === arr);

        results.push('-');  // 9
        arr = initArr(INITIAL_DEEP_ARRAY);
        arr2 = setAtDeep(arr, 3, 0, {
            b: 3
        });
        if (!ignoreMutationError) {
            expect(arr).toEqual(INITIAL_DEEP_ARRAY);
            const expectedArr2 = _.cloneDeep(INITIAL_DEEP_ARRAY);
            expectedArr2[3][0] = {b: 3};
            expect(arr2).toEqual(expectedArr2);
        }
        _addResult(results, arr2 !== arr);
        _addResult(results, get(getAtDeep(arr, 3, 0), "b") === 2);
        _addResult(results, getAtDeep(arr2, 3, 0).b === 3);
        arr2 = setAtDeep(arr, 3, 1, getAtDeep(arr, 3, 1));
        if (!ignoreMutationError) {
            expect(arr).toEqual(INITIAL_DEEP_ARRAY);
            expect(arr2).toEqual(INITIAL_DEEP_ARRAY);
        }
        _addResult(results, arr2 === arr);

        return console.log("  Verification: " + (results.join('')));
    };

    var _test = function (desc, cb) {
        var tac, tic;
        tic = new Date().getTime();
        cb();
        tac = new Date().getTime();
        var elapsed = tac - tic;
        console.log(("  " + desc + ": ") + chalk.bold(elapsed + " ms"));
        return elapsed;
    };

    var _allTests = function (desc, solution, ignoreMutationError) {
        var MERGE_OBJ, arr, obj;
        console.log("\n" + chalk.bold(desc));
        _verify(solution, ignoreMutationError);
        obj = solution.init();
        var totalRead = 0;
        var totalWrite = 0;
        totalRead += _test("Object: read (x" + R + ")", function () {
            var j, ref1, val;
            for (n = j = 0, ref1 = R; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                val = solution.get(obj, 'toggle');
            }
        });
        obj = solution.init();
        totalWrite += _test("Object: write (x" + W + ")", function () {
            var j, obj2, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                obj2 = solution.set(obj, 'b', n);
            }
        });
        obj = solution.init();
        totalRead += _test("Object: deep read (x" + R + ")", function () {
            var j, ref1, val;
            for (n = j = 0, ref1 = R; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                val = solution.getDeep(obj, 'd', 'd1');
            }
        });
        obj = solution.init();
        totalWrite += _test("Object: deep write (x" + W + ")", function () {
            var j, obj2, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                obj2 = solution.setDeep(obj, 'd', 'd1', n);
            }
        });
        obj = solution.init();
        totalRead += _test("Object: very deep read (x" + R + ")", function () {
            var j, ref1, val;
            for (n = j = 0, ref1 = R; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                val = solution.getIn(obj, DEEP_PATH);
            }
        });
        obj = solution.init();
        totalWrite += _test("Object: very deep write (x" + W + ")", function () {
            var j, obj2, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                obj2 = solution.setIn(obj, DEEP_PATH, n);
            }
        });
        obj = solution.init();
        MERGE_OBJ = {
            c: 5,
            f: null
        };
        totalWrite += _test("Object: merge (x" + W + ")", function () {
            var j, obj2, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                obj2 = solution.merge(obj, MERGE_OBJ);
            }
        });
        arr = solution.initArr();
        totalRead += _test("Array: read (x" + R + ")", function () {
            var j, ref1, val;
            for (n = j = 0, ref1 = R; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                val = solution.getAt(arr, 1);
            }
        });
        arr = solution.initArr();
        totalWrite += _test("Array: write (x" + W + ")", function () {
            var arr2, j, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                arr2 = solution.setAt(arr, 1, n);
            }
        });

        arr = solution.initArr(INITIAL_DEEP_ARRAY);
        totalRead += _test("Array: deep read (x" + R + ")", function () {
            var j, ref1, val;
            for (n = j = 0, ref1 = R; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                val = solution.getAtDeep(arr, 3, 0);
            }
        });
        arr = solution.initArr(INITIAL_DEEP_ARRAY);
        totalWrite += _test("Array: deep write (x" + W + ")", function () {
            var arr2, j, ref1;
            for (n = j = 0, ref1 = W; 0 <= ref1 ? j < ref1 : j > ref1; n = 0 <= ref1 ? ++j : --j) {
                arr2 = solution.setAtDeep(arr, 3, 0, n);
            }
        });

        var totalElapsed = totalRead + totalWrite;
        console.log("Total elapsed = " + totalRead + " ms (read) + " + totalWrite + " ms (write) = " + totalElapsed + " ms.");
        return totalElapsed;
    };

    _allTests("Mutable", _solMutable, true);
    _allTests("Immutable (Object.assign)", _solObjectAssign);
    _allTests("Immutable (immutable-assign)", _solIassign);
    _allTests("Immutable (immer setAutoFreeze(false))", _solImmer);
    _allTests("Immutable (immutable.js)", _solImmutableJs, true);
    _allTests("Immutable (seamless-immutable production)", _solImmutableSeamless);
    // _allTests("Immutable (timm)", _solImmutableTimm);

    // Deep freeze initial object/array
    _isDevel = true;
    _allTests("Immutable (Object.assign) + deep freeze", _solObjectAssign);
    _allTests("Immutable (immutable-assign) + deep freeze", _solIassign);
    _allTests("Immutable (immer) + deep freeze", _solImmer);

}).call(this);
