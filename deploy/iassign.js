"use strict";
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        try {
            var deepFreeze = require("deep-freeze");
        }
        catch (ex) {
            console.warn("Cannot load deep-freeze module, however you can still use iassign() function.");
        }
        var v = factory(deepFreeze, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["deep-freeze", "exports"], factory);
    }
    else {
        // Browser globals (root is window)
        root.iassign = factory(root.deepFreeze, {});
    }
})(this, function (deepFreeze, exports) {
    //import deepFreeze = require("deep-freeze");
    // try {
    //     var deepFreeze: DeepFreeze.DeepFreezeInterface = require("deep-freeze");
    // } catch (ex) {
    //     console.warn("Cannot load deep-freeze module, however you can still use iassign() function.");
    // }
    var autoCurry = (function () {
        var toArray = function toArray(arr, from) {
            return Array.prototype.slice.call(arr, from || 0);
        };
        var curry = function curry(fn /* variadic number of args */) {
            var args = toArray(arguments, 1);
            return function curried() {
                return fn.apply(this, args.concat(toArray(arguments)));
            };
        };
        return function autoCurry(fn, numArgs) {
            numArgs = numArgs || fn.length;
            return function autoCurried() {
                if (arguments.length < numArgs) {
                    return numArgs - arguments.length > 0 ?
                        autoCurry(curry.apply(this, [fn].concat(toArray(arguments))), numArgs - arguments.length) :
                        curry.apply(this, [fn].concat(toArray(arguments)));
                }
                else {
                    return fn.apply(this, arguments);
                }
            };
        };
    }());
    var iassign = _iassign;
    iassign.fp = autoCurry(_iassignFp);
    iassign.maxGetPropCacheSize = 100;
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
        option = copyOption(option);
        if (deepFreeze && (option.freeze || option.freezeInput)) {
            deepFreeze(obj);
        }
        if (!getProp) {
            obj = quickCopy(obj);
            obj = setProp(obj);
        }
        else {
            // Check if getProp() is valid
            var value = getProp(obj, context);
            var getPropFuncInfo = parseGetPropFuncInfo(getProp, option);
            obj = updateProperty(obj, setProp, context, getPropFuncInfo);
        }
        if (deepFreeze && (option.freeze || option.freezeOutput)) {
            deepFreeze(obj);
        }
        return obj;
    }
    function _iassignFp(option, getProp, setProp, context, obj) {
        return _iassign(obj, getProp, setProp, context, option);
    }
    // For performance
    function copyOption(option) {
        var newOption = {};
        newOption.freeze = iassign.freeze;
        newOption.freezeInput = iassign.freezeInput;
        newOption.freezeOutput = iassign.freezeOutput;
        newOption.disableAllCheck = iassign.disableAllCheck;
        newOption.disableHasReturnCheck = iassign.disableHasReturnCheck;
        newOption.disableExtraStatementCheck = iassign.disableExtraStatementCheck;
        newOption.maxGetPropCacheSize = iassign.maxGetPropCacheSize;
        if (option) {
            if (option.freeze != undefined) {
                newOption.freeze = option.freeze;
            }
            if (option.freezeInput != undefined) {
                newOption.freezeInput = option.freezeInput;
            }
            if (option.freezeOutput != undefined) {
                newOption.freezeOutput = option.freezeOutput;
            }
            if (option.disableAllCheck != undefined) {
                newOption.disableAllCheck = option.disableAllCheck;
            }
            if (option.disableHasReturnCheck != undefined) {
                newOption.disableHasReturnCheck = option.disableHasReturnCheck;
            }
            if (option.disableExtraStatementCheck != undefined) {
                newOption.disableExtraStatementCheck = option.disableExtraStatementCheck;
            }
            if (option.maxGetPropCacheSize != undefined) {
                newOption.maxGetPropCacheSize = option.maxGetPropCacheSize;
            }
        }
        return newOption;
    }
    function updateProperty(obj, setProp, context, getPropFuncInfo) {
        var propValue = undefined;
        for (var propIndex = 0; propIndex < getPropFuncInfo.funcTokens.length; ++propIndex) {
            var _a = getPropFuncInfo.funcTokens[propIndex], propName = _a.propName, propNameSource = _a.propNameSource, subAccessorText = _a.subAccessorText, getPropName = _a.getPropName;
            //console.log(propName);
            if (propIndex <= 0) {
                propValue = quickCopy(obj);
                if (!subAccessorText) {
                    propValue = setProp(propValue);
                }
                obj = propValue;
            }
            else {
                var prevPropValue = propValue;
                if (propName == undefined) {
                    propName = getPropName(obj, context);
                }
                propValue = propValue[propName];
                propValue = quickCopy(propValue);
                if (!subAccessorText) {
                    propValue = setProp(propValue);
                }
                prevPropValue[propName] = propValue;
            }
        }
        return obj;
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
            var parameters = parametersText.split(",");
            objParameterName = parameters[0];
            cxtParameterName = parameters[1];
        }
        if (objParameterName) {
            objParameterName = objParameterName.trim();
        }
        if (cxtParameterName) {
            cxtParameterName = cxtParameterName.trim();
        }
        var bodyStartIndex = funcText.indexOf("{");
        var bodyEndIndex = funcText.lastIndexOf("}");
        var bodyText = "";
        if (bodyStartIndex > -1 && bodyEndIndex > -1) {
            bodyText = funcText.substring(bodyStartIndex + 1, bodyEndIndex);
        }
        else {
            var arrowIndex = funcText.indexOf("=>");
            if (arrowIndex > -1) {
                //console.log("Handle arrow function.");
                bodyText = "return " + funcText.substring(arrowIndex + 3);
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
        postProcessTokens(info);
        if (option.maxGetPropCacheSize > 0) {
            getPropCaches[cacheKey] = info;
            getPropCacheKeys.push(cacheKey);
            if (getPropCacheKeys.length > option.maxGetPropCacheSize) {
                debugger;
                var cacheKeyToRemove = getPropCacheKeys.shift();
                delete getPropCaches[cacheKeyToRemove];
            }
        }
        return info;
    }
    function parseGetPropFuncTokens(accessorText) {
        var tokens = [];
        while (accessorText) {
            var openBracketIndex = accessorText.indexOf("[");
            var closeBracketIndex = accessorText.indexOf("]");
            var dotIndex = accessorText.indexOf(".");
            var propName = "";
            var propNameSource = ePropNameSource.none;
            // if (dotIndex == 0) {
            //     accessorText = accessorText.substr(dotIndex + 1);
            //     continue;
            // }
            if (openBracketIndex > -1 && closeBracketIndex <= -1) {
                throw new Error("Found open bracket but not close bracket.");
            }
            if (openBracketIndex <= -1 && closeBracketIndex > -1) {
                throw new Error("Found close bracket but not open bracket.");
            }
            if (dotIndex > -1 && (dotIndex < openBracketIndex || openBracketIndex <= -1)) {
                propName = accessorText.substr(0, dotIndex);
                accessorText = accessorText.substr(dotIndex + 1);
                propNameSource = ePropNameSource.beforeDot;
            }
            else if (openBracketIndex > -1 && (openBracketIndex < dotIndex || dotIndex <= -1)) {
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
                accessorText = "";
                propNameSource = ePropNameSource.last;
            }
            propName = propName.trim();
            if (propName == "") {
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
    function postProcessTokens(getPropFuncInfo) {
        var _loop_1 = function() {
            var token = getPropFuncInfo.funcTokens[propIndex];
            var propName = token.propName, propNameSource = token.propNameSource, subAccessorText = token.subAccessorText;
            if (propNameSource == ePropNameSource.inBracket && isNaN(propName)) {
                if (propName[0] == "#") {
                    var quotedPropName = getPropFuncInfo.quotedTextInfos[propName];
                    if (!quotedPropName) {
                        throw new Error("Cannot find quoted text for " + quotedPropName);
                    }
                    propName = eval(quotedPropName);
                    token.propName = propName;
                }
                else {
                    var statement_1 = "'use strict';\n";
                    if (getPropFuncInfo.objParameterName) {
                        statement_1 += "var " + getPropFuncInfo.objParameterName + " = arguments[1];\n";
                    }
                    if (getPropFuncInfo.cxtParameterName) {
                        statement_1 += "var " + getPropFuncInfo.cxtParameterName + " = arguments[2];\n";
                    }
                    statement_1 += "" + propName;
                    token.propName = undefined;
                    token.getPropName = function (obj, context) {
                        return evalStatement(statement_1, obj, context);
                    };
                }
            }
        };
        for (var propIndex = 0; propIndex < getPropFuncInfo.funcTokens.length; ++propIndex) {
            _loop_1();
        }
    }
    function getAccessorTextInfo(bodyText, option) {
        var returnIndex = bodyText.indexOf("return ");
        if (!option.disableAllCheck && !option.disableHasReturnCheck) {
            if (returnIndex <= -1) {
                throw new Error("getProp() function has no 'return' keyword.");
            }
        }
        if (!option.disableAllCheck && !option.disableExtraStatementCheck) {
            var otherBodyText = bodyText.substr(0, returnIndex);
            otherBodyText = otherBodyText.replace(/['"]use strict['"];*/g, "");
            otherBodyText = otherBodyText.trim();
            if (otherBodyText != "") {
                throw new Error("getProp() function has statements other than 'return': " + otherBodyText);
            }
        }
        var accessorText = bodyText.substr(returnIndex + 7).trim();
        if (accessorText[accessorText.length - 1] == ";") {
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
            var varName = "#" + index++;
            if (singleQuoteIndex <= -1 && doubleQuoteIndex <= -1)
                break;
            var matches = undefined;
            var quoteIndex = void 0;
            if (doubleQuoteIndex > -1 && (doubleQuoteIndex < singleQuoteIndex || singleQuoteIndex <= -1)) {
                matches = /("[^"\\]*(?:\\.[^"\\]*)*")/.exec(accessorText);
                quoteIndex = doubleQuoteIndex;
            }
            else if (singleQuoteIndex > -1 && (singleQuoteIndex < doubleQuoteIndex || doubleQuoteIndex <= -1)) {
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
                throw new Error("Invalid text in quotes: " + accessorText);
            }
        }
        return {
            accessorText: accessorText,
            quotedTextInfos: quotedTextInfos,
        };
    }
    function quickCopy(value) {
        if (value != undefined && !(value instanceof Date)) {
            if (value instanceof Array) {
                return value.slice();
            }
            else if (typeof (value) === "object") {
                var target = createInstanceAs(value);
                return extend(target, value);
            }
        }
        return value;
    }
    function createInstanceAs(obj) {
        if (obj == undefined)
            throw Error("obj is null or undefined.");
        return new obj.constructor();
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
    function evalStatement() {
        return eval(arguments[0]);
    }
    // function isTextInQuote(text: string): boolean {
    //     let quoteMarks = ["'", '"'];
    //     for (let mark of quoteMarks) {
    //         if (text[0] == mark && text[text.length-1] == mark) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    // function extractTextInQuote(text: string): string {
    //     let quoteMarks = ["'", '"'];
    //     for (let mark of quoteMarks) {
    //         if (text[0] == mark) {
    //             let regex = new RegExp(`^[${mark}]([^${mark}]*)[${mark}]$`);
    //             let match = regex.exec(text);
    //             if (match) {
    //                 return match[1];
    //             }
    //         }
    //     }
    //     return undefined;
    // }
    return iassign;
});
//declare var iassign: IIassign;
//export = iassign;
