
// Copied and modifed from https://github.com/guigrpa/timm/blob/master/tools/benchmarks.coffee

(function () {
    var ARRAY_LENGTH, DEEP_PATH, INITIAL_ARRAY, INITIAL_OBJECT, Immutable, R, Seamless, _, _addResult, _allTests, _getIn, _solImmutableJs, _solImmutableSeamless, _solImmutableTimm, _solMutable, _test, _toggle, _verify, chalk, i, n, ref, timm;

    process.env.NODE_ENV = 'production';

    _ = require('lodash');

    chalk = require('chalk');

    Seamless = require('seamless-immutable');

    Immutable = require('immutable');

    timm = require('timm');

    iassign = require("../src/iassign");

    INITIAL_OBJECT = {
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

    DEEP_PATH = ['d', 'd9', 'b', 'b', 'b'];

    ARRAY_LENGTH = 1000;

    INITIAL_ARRAY = new Array(ARRAY_LENGTH);

    for (n = i = 0, ref = ARRAY_LENGTH; 0 <= ref ? i < ref : i > ref; n = 0 <= ref ? ++i : --i) {
        INITIAL_ARRAY[n] = {
            a: 1,
            b: 2
        };
    }

    R = 5e5;
    W = R / 5;

    _getIn = function (obj, path) {
        var j, key, len, out;
        out = obj;
        for (j = 0, len = path.length; j < len; j++) {
            key = path[j];
            out = out[key];
        }
        return out;
    };

    _solMutable = {
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
        initArr: function () {
            return _.cloneDeep(INITIAL_ARRAY);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            arr[idx] = val;
            return arr;
        }
    };

    _solIassign = {
        init: function () {
            return _.cloneDeep(INITIAL_OBJECT);
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
        initArr: function () {
            return _.cloneDeep(INITIAL_ARRAY);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            if (arr[idx] === val)
                return arr;

            return iassign(
                arr,
                function (arr) { arr[idx] = val; return arr; }
            );
        }
    };


    _solImmutableTimm = {
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
        initArr: function () {
            return _.cloneDeep(INITIAL_ARRAY);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            return timm.replaceAt(arr, idx, val);
        }
    };

    _solImmutableJs = {
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
        initArr: function () {
            return Immutable.List(INITIAL_ARRAY);
        },
        getAt: function (arr, idx) {
            return arr.get(idx);
        },
        setAt: function (arr, idx, val) {
            return arr.set(idx, val);
        }
    };

    _solImmutableSeamless = {
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
        initArr: function () {
            return Seamless(INITIAL_ARRAY);
        },
        getAt: function (arr, idx) {
            return arr[idx];
        },
        setAt: function (arr, idx, val) {
            return arr.set(idx, val);
        }
    };

    _toggle = function (solution, obj) {
        return solution.set(obj, 'toggle', !(solution.get(obj, 'toggle')));
    };

    _addResult = function (results, condition) {
        return results.push(condition ? chalk.green.bold('P') : chalk.green.red('F'));
    };

    _verify = function (solution) {
        var arr, arr2, get, getAt, getIn, init, initArr, merge, obj, obj2, results, set, setAt, setDeep, setIn;
        results = [];
        init = solution.init, get = solution.get, set = solution.set, setDeep = solution.setDeep, getIn = solution.getIn, setIn = solution.setIn, merge = solution.merge, initArr = solution.initArr, getAt = solution.getAt, setAt = solution.setAt;
        obj = init();
        _addResult(results, get(obj, 'toggle') === false);
        results.push('-');  // 1
        obj2 = set(obj, 'toggle', true);
        _addResult(results, get(obj, 'toggle') === false);
        _addResult(results, get(obj2, 'toggle') === true);
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        results.push('-');  // 2
        obj2 = set(obj, 'str', 'foo');
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        results.push('-');  // 3
        obj2 = setDeep(obj, 'd', 'd1', 3);
        _addResult(results, solution.getDeep(obj, 'd', 'd1') === 6);
        _addResult(results, solution.getDeep(obj2, 'd', 'd1') === 3);
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') !== get(obj, 'd'));
        _addResult(results, get(obj2, 'e') === get(obj, 'e'));
        results.push('-');  // 4
        obj2 = set(obj, 'b', get(obj, 'b'));
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        results.push('-');  // 5
        obj2 = set(obj, 'str', 'bar');
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        obj = init();
        obj2 = setDeep(obj, 'd', 'd1', 6);
        _addResult(results, solution.getDeep(obj, 'd', 'd1') === 6);
        _addResult(results, solution.getDeep(obj2, 'd', 'd1') === 6);
        _addResult(results, obj2 === obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        results.push('-');  // 6
        obj2 = setIn(obj, DEEP_PATH, 3);
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
        _addResult(results, obj2 !== obj);
        _addResult(results, get(obj2, 'd') === get(obj, 'd'));
        _addResult(results, get(obj2, 'c') === 5);
        _addResult(results, get(obj2, 'f') === null);
        results.push('-');  // 8
        arr = initArr();
        arr2 = setAt(arr, 1, {
            b: 3
        });
        _addResult(results, arr2 !== arr);
        _addResult(results, getAt(arr, 1).b === 2);
        _addResult(results, getAt(arr2, 1).b === 3);
        arr2 = setAt(arr, 1, getAt(arr, 1));
        _addResult(results, arr2 === arr);
        return console.log("  Verification: " + (results.join('')));
    };

    _test = function (desc, cb) {
        var tac, tic;
        tic = new Date().getTime();
        cb();
        tac = new Date().getTime();
        var elapsed = tac - tic;
        console.log(("  " + desc + ": ") + chalk.bold(elapsed + " ms"));
        return elapsed;
    };

    _allTests = function (desc, solution) {
        var MERGE_OBJ, arr, obj;
        console.log(chalk.bold(desc));
        _verify(solution);
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

        var totalElapsed = totalRead + totalWrite;
        console.log("Total elapsed = " + totalElapsed + " ms = " + totalRead + " (read) + " + totalWrite + " (write).");
        return totalElapsed;
    };

    _allTests("Mutable", _solMutable);

    _allTests("Immutable (iassign)", _solIassign);

    _allTests("Immutable (ImmutableJS)", _solImmutableJs);

    _allTests("Immutable (timm)", _solImmutableTimm);

    _allTests("Immutable (seamless-immutable)", _solImmutableSeamless);

}).call(this);
