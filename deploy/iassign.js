"use strict";
(function (root, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        try {
            var deepFreeze = require("deep-freeze-strict");
        }
        catch (ex) {
            console.warn("Cannot load deep-freeze-strict module, however you can still use iassign() function.");
        }
        var v = factory(deepFreeze, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["deep-freeze-strict", "exports"], factory);
    }
    else {
        // Browser globals (root is window)
        root.iassign = factory(root.deepFreeze, {});
    }
})(this, function (deepFreeze, exports) {
    var autoCurry = (function () {
        var toArray = function toArray(arr, from) {
            return Array.prototype.slice.call(arr, from || 0);
        };
        var curry = function curry(fn /* variadic number of args */) {
            var args = toArray(arguments, 1);
            return function curried() {
                return fn.apply(undefined, args.concat(toArray(arguments)));
            };
        };
        return function autoCurry(fn, numArgs) {
            numArgs = numArgs || fn.length;
            return function autoCurried() {
                if (arguments.length < numArgs) {
                    return numArgs - arguments.length > 0
                        ? autoCurry(curry.apply(undefined, [fn].concat(toArray(arguments))), numArgs - arguments.length)
                        : curry.apply(undefined, [fn].concat(toArray(arguments)));
                }
                else {
                    return fn.apply(undefined, arguments);
                }
            };
        };
    })();
    var iassign = _iassign;
    iassign.fp = autoCurry(_iassignFp);
    iassign.freeze = process.env.NODE_ENV !== "production";
    iassign.setOption = function (option) {
        copyOption(iassign, option);
    };
    // Immutable Assign
    function _iassign(obj, // Object to set property, it will not be modified.
        getPropOrSetProp, // Function to get property to be updated. Must be pure function.
        setPropOrOption, // Function to set property.
        contextOrUndefined, // (Optional) Context to be used in getProp().
        optionOrUndefined) {
        var getProp = getPropOrSetProp;
        var setProp = setPropOrOption;
        var context = contextOrUndefined;
        var option = optionOrUndefined;
        if (typeof setPropOrOption !== "function") {
            getProp = undefined;
            setProp = getPropOrSetProp;
            context = undefined;
            option = setPropOrOption;
        }
        option = copyOption(undefined, option, iassign);
        if (deepFreeze && (option.freeze || option.freezeInput)) {
            deepFreeze(obj);
        }
        if (!getProp) {
            var newValue = undefined;
            if (option.ignoreIfNoChange) {
                newValue = setProp(obj);
                if (newValue === obj) {
                    return obj;
                }
            }
            obj = quickCopy(obj, undefined, option.useConstructor, option.copyFunc);
            obj = option.ignoreIfNoChange ? newValue : setProp(obj);
        }
        else {
            // Check if getProp() is valid
            var value = getProp(obj, context);
            var newValue = undefined;
            if (option.ignoreIfNoChange) {
                newValue = setProp(value);
                if (newValue === value) {
                    return obj;
                }
            }
            var funcText = getProp.toString();
            var arrowIndex = funcText.indexOf("=>");
            if (arrowIndex <= -1) {
                var returnIndex = funcText.indexOf("return ");
                if (returnIndex <= -1) {
                    throw new Error("getProp() function does not return a part of obj");
                }
            }
            var propPaths = getPropPath(getProp, obj, context, option);
            if (!propPaths) {
                throw new Error("getProp() function does not return a part of obj");
            }
            obj = updateProperty(obj, setProp, newValue, context, propPaths, option);
        }
        if (deepFreeze && (option.freeze || option.freezeOutput)) {
            deepFreeze(obj);
        }
        return obj;
    }
    function _iassignFp(option, getProp, setProp, context, obj) {
        return _iassign(obj, getProp, setProp, context, option);
    }
    function getPropPath(getProp, obj, context, option) {
        var paths = [];
        var objCopy;
        if (typeof Proxy === "undefined") {
            objCopy = _getPropPathViaProperty(obj, paths);
        }
        else {
            objCopy = _getPropPathViaProxy(obj, paths);
        }
        getProp(objCopy, context);
        return paths;
    }
    function _getPropPathViaProperty(obj, paths, level) {
        if (level === void 0) { level = 0; }
        var objCopy = quickCopy(obj, paths[level - 1]);
        var propertyNames = Object.getOwnPropertyNames(obj);
        propertyNames.forEach(function (propKey) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, propKey);
            if (descriptor && (!(obj instanceof Array) || propKey != "length")) {
                var copyDescriptor = {
                    enumerable: descriptor.enumerable,
                    configurable: false,
                    get: function () {
                        if (level == paths.length) {
                            paths.push(propKey);
                            var propValue = obj[propKey];
                            if (propValue != undefined) {
                                return _getPropPathViaProperty(propValue, paths, level + 1);
                            }
                        }
                        return obj[propKey];
                    }
                };
                Object.defineProperty(objCopy, propKey, copyDescriptor);
            }
        });
        return objCopy;
    }
    function _getPropPathViaProxy(obj, paths, level) {
        if (level === void 0) { level = 0; }
        var handlers = {
            get: function (target, propKey) {
                var propValue = obj[propKey];
                if (level == paths.length) {
                    paths.push(propKey);
                    if (typeof propValue === "object" && propValue != null) {
                        return _getPropPathViaProxy(propValue, paths, level + 1);
                    }
                }
                return propValue;
            }
        };
        return new Proxy(quickCopy(obj, paths[level - 1]), handlers);
    }
    // For performance
    function copyOption(target, option, defaultOption) {
        if (target === void 0) { target = {}; }
        if (defaultOption) {
            target.freeze = defaultOption.freeze;
            target.freezeInput = defaultOption.freezeInput;
            target.freezeOutput = defaultOption.freezeOutput;
            target.useConstructor = defaultOption.useConstructor;
            target.copyFunc = defaultOption.copyFunc;
            target.ignoreIfNoChange = defaultOption.ignoreIfNoChange;
        }
        if (option) {
            if (option.freeze != undefined) {
                target.freeze = option.freeze;
            }
            if (option.freezeInput != undefined) {
                target.freezeInput = option.freezeInput;
            }
            if (option.freezeOutput != undefined) {
                target.freezeOutput = option.freezeOutput;
            }
            if (option.useConstructor != undefined) {
                target.useConstructor = option.useConstructor;
            }
            if (option.copyFunc != undefined) {
                target.copyFunc = option.copyFunc;
            }
            if (option.ignoreIfNoChange != undefined) {
                target.ignoreIfNoChange = option.ignoreIfNoChange;
            }
        }
        return target;
    }
    function updateProperty(obj, setProp, newValue, context, propPaths, option) {
        var propValue = quickCopy(obj, undefined, option.useConstructor, option.copyFunc);
        obj = propValue;
        if (!propPaths.length) {
            return option.ignoreIfNoChange ? newValue : setProp(propValue);
        }
        for (var propIndex = 0; propIndex < propPaths.length; ++propIndex) {
            var propName = propPaths[propIndex];
            var isLast = propIndex + 1 === propPaths.length;
            var prevPropValue = propValue;
            propValue = propValue[propName];
            propValue = quickCopy(propValue, propName, option.useConstructor, option.copyFunc);
            if (isLast) {
                propValue = option.ignoreIfNoChange ? newValue : setProp(propValue);
            }
            prevPropValue[propName] = propValue;
        }
        return obj;
    }
    function quickCopy(value, propName, useConstructor, copyFunc) {
        if (value != undefined && !(value instanceof Date)) {
            if (value instanceof Array) {
                return value.slice();
            }
            else if (typeof value === "object") {
                if (useConstructor) {
                    var target = new value.constructor();
                    return extend(target, value);
                }
                else if (copyFunc) {
                    var newValue = copyFunc(value, propName);
                    if (newValue != undefined)
                        return newValue;
                }
                return extend({}, value);
            }
        }
        return value;
    }
    function extend(destination) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
            var source = sources_1[_a];
            for (var key in source) {
                if (!Object.prototype.hasOwnProperty.call(source, key)) {
                    continue;
                }
                var value = source[key];
                if (value !== undefined) {
                    destination[key] = value;
                }
            }
        }
        return destination;
    }
    iassign.default = iassign;
    iassign.deepFreeze = function (obj) { return (iassign.freeze ? deepFreeze(obj) : obj); };
    return iassign;
});
