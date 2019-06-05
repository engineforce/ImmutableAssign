'use strict';
;
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        try {
            var deepFreeze = require('deep-freeze-strict');
        }
        catch (ex) {
            console.warn('Cannot load deep-freeze-strict module, however you can still use iassign() function.');
        }
        var v = factory(deepFreeze, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(['deep-freeze-strict', 'exports'], factory);
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
    iassign.maxGetPropCacheSize = 100;
    iassign.freeze =
        typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
    iassign.setOption = function (option) {
        copyOption(iassign, option);
    };
    // Immutable Assign
    function _iassign(obj, // Object to set property, it will not be modified.
    getPropOrSetPropOrPaths, // Function to get property to be updated. Must be pure function.
    setPropOrOption, // Function to set property.
    contextOrUndefined, // (Optional) Context to be used in getProp().
    optionOrUndefined) {
        var getProp = getPropOrSetPropOrPaths;
        var propPaths = undefined;
        var setProp = setPropOrOption;
        var context = contextOrUndefined;
        var option = optionOrUndefined;
        if (typeof setPropOrOption !== 'function') {
            getProp = undefined;
            setProp = getPropOrSetPropOrPaths;
            context = undefined;
            option = setPropOrOption;
        }
        else {
            if (getProp instanceof Array) {
                propPaths = getProp;
            }
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
            var newValue = undefined;
            if (!propPaths) {
                if (option.ignoreIfNoChange) {
                    // Check if getProp() is valid
                    var value = getProp(obj, context);
                    newValue = setProp(value);
                    if (newValue === value) {
                        return obj;
                    }
                }
                var funcText = getProp.toString();
                var arrowIndex = funcText.indexOf('=>');
                if (arrowIndex <= -1) {
                    var returnIndex = funcText.indexOf('return ');
                    if (returnIndex <= -1) {
                        throw new Error('getProp() function does not return a part of obj');
                    }
                }
                propPaths = getPropPath(getProp, obj, context, option);
            }
            else {
                if (option.ignoreIfNoChange) {
                    // Check if getProp() is valid
                    var value = getPropByPaths(obj, propPaths);
                    newValue = setProp(value);
                    if (newValue === value) {
                        return obj;
                    }
                }
            }
            if (!propPaths) {
                throw new Error('getProp() function does not return a part of obj');
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
        var propValue;
        if (typeof Proxy === 'undefined') {
            propValue = getProp(obj, context);
            objCopy = _getPropPathViaProperty(obj, paths);
        }
        else {
            objCopy = _getPropPathViaProxy(obj, paths);
        }
        getProp(objCopy, context);
        // Check propValue === undefined for performance
        if (typeof Proxy === 'undefined' && propValue === undefined) {
            var functionInfo = parseGetPropFuncInfo(getProp, option);
            if (paths.length != functionInfo.funcTokens.length - 1) {
                var remainingFunctionTokens = functionInfo.funcTokens.slice(paths.length + 1);
                for (var _i = 0, remainingFunctionTokens_1 = remainingFunctionTokens; _i < remainingFunctionTokens_1.length; _i++) {
                    var token = remainingFunctionTokens_1[_i];
                    if (token.propNameSource == ePropNameSource.inBracket &&
                        isNaN(token.propName)) {
                        throw new Error("Cannot handle " + token.propName + " when the property it point to is undefined.");
                    }
                }
                paths = paths.concat(remainingFunctionTokens.map(function (s) { return s.propName; }));
            }
        }
        return paths;
    }
    function _getPropPathViaProperty(obj, paths, level) {
        if (level === void 0) { level = 0; }
        var objCopy = quickCopy(obj, paths[level - 1]);
        var propertyNames = Object.getOwnPropertyNames(obj);
        propertyNames.forEach(function (propKey) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, propKey);
            if (descriptor && (!(obj instanceof Array) || propKey != 'length')) {
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
                    },
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
                    if (typeof propValue === 'object' && propValue != null) {
                        return _getPropPathViaProxy(propValue, paths, level + 1);
                    }
                }
                return propValue;
            },
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
            target.disableAllCheck = defaultOption.disableAllCheck;
            target.disableHasReturnCheck = defaultOption.disableHasReturnCheck;
            target.disableExtraStatementCheck =
                defaultOption.disableExtraStatementCheck;
            target.maxGetPropCacheSize = defaultOption.maxGetPropCacheSize;
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
            if (option.disableAllCheck != undefined) {
                target.disableAllCheck = option.disableAllCheck;
            }
            if (option.disableHasReturnCheck != undefined) {
                target.disableHasReturnCheck = option.disableHasReturnCheck;
            }
            if (option.disableExtraStatementCheck != undefined) {
                target.disableExtraStatementCheck = option.disableExtraStatementCheck;
            }
            if (option.maxGetPropCacheSize != undefined) {
                target.maxGetPropCacheSize = option.maxGetPropCacheSize;
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
            else if (typeof value === 'object') {
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
    function extend(destination, source) {
        for (var key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) {
                continue;
            }
            var value = source[key];
            destination[key] = value;
        }
        return destination;
    }
    var ePropNameSource;
    (function (ePropNameSource) {
        ePropNameSource[ePropNameSource["none"] = 0] = "none";
        ePropNameSource[ePropNameSource["beforeDot"] = 1] = "beforeDot";
        ePropNameSource[ePropNameSource["beforeBracket"] = 2] = "beforeBracket";
        ePropNameSource[ePropNameSource["inBracket"] = 3] = "inBracket";
        ePropNameSource[ePropNameSource["last"] = 4] = "last";
    })(ePropNameSource || (ePropNameSource = {}));
    var getPropCaches = {};
    var getPropCacheKeys = [];
    function parseGetPropFuncInfo(func, option) {
        var funcText = func.toString();
        var cacheKey = funcText + JSON.stringify(option);
        var info = getPropCaches[cacheKey];
        if (getPropCaches[cacheKey]) {
            return info;
        }
        var matches = /\(([^\)]*)\)/.exec(funcText);
        var objParameterName = undefined;
        var cxtParameterName = undefined;
        if (matches) {
            var parametersText = matches[1];
            var parameters = parametersText.split(',');
            objParameterName = parameters[0];
            cxtParameterName = parameters[1];
        }
        if (objParameterName) {
            objParameterName = objParameterName.trim();
        }
        if (cxtParameterName) {
            cxtParameterName = cxtParameterName.trim();
        }
        var bodyStartIndex = funcText.indexOf('{');
        var bodyEndIndex = funcText.lastIndexOf('}');
        var bodyText = '';
        if (bodyStartIndex > -1 && bodyEndIndex > -1) {
            bodyText = funcText.substring(bodyStartIndex + 1, bodyEndIndex);
        }
        else {
            var arrowIndex = funcText.indexOf('=>');
            if (arrowIndex > -1) {
                //console.log("Handle arrow function.");
                bodyText = 'return ' + funcText.substring(arrowIndex + 3);
            }
            else {
                throw new Error("Cannot parse function: " + funcText);
            }
        }
        var accessorTextInfo = getAccessorTextInfo(bodyText, option);
        info = {
            objParameterName: objParameterName,
            cxtParameterName: cxtParameterName,
            bodyText: bodyText,
            accessorText: accessorTextInfo.accessorText,
            quotedTextInfos: accessorTextInfo.quotedTextInfos,
            funcTokens: parseGetPropFuncTokens(accessorTextInfo.accessorText),
        };
        if (option.maxGetPropCacheSize > 0) {
            getPropCaches[cacheKey] = info;
            getPropCacheKeys.push(cacheKey);
            if (getPropCacheKeys.length > option.maxGetPropCacheSize) {
                var cacheKeyToRemove = getPropCacheKeys.shift();
                delete getPropCaches[cacheKeyToRemove];
            }
        }
        return info;
    }
    function parseGetPropFuncTokens(accessorText) {
        var tokens = [];
        while (accessorText) {
            var openBracketIndex = accessorText.indexOf('[');
            var closeBracketIndex = accessorText.indexOf(']');
            var dotIndex = accessorText.indexOf('.');
            var propName = '';
            var propNameSource = ePropNameSource.none;
            // if (dotIndex == 0) {
            //     accessorText = accessorText.substr(dotIndex + 1);
            //     continue;
            // }
            if (openBracketIndex > -1 && closeBracketIndex <= -1) {
                throw new Error('Found open bracket but not close bracket.');
            }
            if (openBracketIndex <= -1 && closeBracketIndex > -1) {
                throw new Error('Found close bracket but not open bracket.');
            }
            if (dotIndex > -1 &&
                (dotIndex < openBracketIndex || openBracketIndex <= -1)) {
                propName = accessorText.substr(0, dotIndex);
                accessorText = accessorText.substr(dotIndex + 1);
                propNameSource = ePropNameSource.beforeDot;
            }
            else if (openBracketIndex > -1 &&
                (openBracketIndex < dotIndex || dotIndex <= -1)) {
                if (openBracketIndex > 0) {
                    propName = accessorText.substr(0, openBracketIndex);
                    accessorText = accessorText.substr(openBracketIndex);
                    propNameSource = ePropNameSource.beforeBracket;
                }
                else {
                    propName = accessorText.substr(openBracketIndex + 1, closeBracketIndex - 1);
                    accessorText = accessorText.substr(closeBracketIndex + 1);
                    propNameSource = ePropNameSource.inBracket;
                }
            }
            else {
                propName = accessorText;
                accessorText = '';
                propNameSource = ePropNameSource.last;
            }
            propName = propName.trim();
            if (propName == '') {
                continue;
            }
            //console.log(propName);
            tokens.push({
                propName: propName,
                propNameSource: propNameSource,
                subAccessorText: accessorText,
            });
        }
        return tokens;
    }
    function getAccessorTextInfo(bodyText, option) {
        var returnIndex = bodyText.indexOf('return ');
        if (!option.disableAllCheck && !option.disableHasReturnCheck) {
            if (returnIndex <= -1) {
                throw new Error("getProp() function has no 'return' keyword.");
            }
        }
        if (!option.disableAllCheck && !option.disableExtraStatementCheck) {
            var otherBodyText = bodyText.substr(0, returnIndex);
            otherBodyText = otherBodyText.replace(/['"]use strict['"];*/g, '');
            otherBodyText = otherBodyText.trim();
            if (otherBodyText != '') {
                throw new Error("getProp() function has statements other than 'return': " +
                    otherBodyText);
            }
        }
        var accessorText = bodyText.substr(returnIndex + 7).trim();
        if (accessorText[accessorText.length - 1] == ';') {
            accessorText = accessorText.substring(0, accessorText.length - 1);
        }
        accessorText = accessorText.trim();
        return parseTextInQuotes(accessorText, option);
    }
    function parseTextInQuotes(accessorText, option) {
        var quotedTextInfos = {};
        var index = 0;
        while (true) {
            var singleQuoteIndex = accessorText.indexOf("'");
            var doubleQuoteIndex = accessorText.indexOf('"');
            var varName = '#' + index++;
            if (singleQuoteIndex <= -1 && doubleQuoteIndex <= -1)
                break;
            var matches = undefined;
            var quoteIndex = void 0;
            if (doubleQuoteIndex > -1 &&
                (doubleQuoteIndex < singleQuoteIndex || singleQuoteIndex <= -1)) {
                matches = /("[^"\\]*(?:\\.[^"\\]*)*")/.exec(accessorText);
                quoteIndex = doubleQuoteIndex;
            }
            else if (singleQuoteIndex > -1 &&
                (singleQuoteIndex < doubleQuoteIndex || doubleQuoteIndex <= -1)) {
                matches = /('[^'\\]*(?:\\.[^'\\]*)*')/.exec(accessorText);
                quoteIndex = singleQuoteIndex;
            }
            if (matches) {
                quotedTextInfos[varName] = matches[1];
                accessorText =
                    accessorText.substr(0, quoteIndex) +
                        varName +
                        accessorText.substr(matches.index + matches[1].length);
            }
            else {
                throw new Error('Invalid text in quotes: ' + accessorText);
            }
        }
        return {
            accessorText: accessorText,
            quotedTextInfos: quotedTextInfos,
        };
    }
    iassign.default = iassign;
    iassign.deepFreeze = function (obj) { return (iassign.freeze ? deepFreeze(obj) : obj); };
    return iassign;
});
function getPropByPaths(obj, paths) {
    paths = paths.slice();
    var value = obj;
    while (paths.length > 0) {
        var path = paths.shift();
        value = value[path];
    }
    return value;
}
