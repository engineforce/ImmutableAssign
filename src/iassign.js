(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
        // Browser globals (root is window)
        var require_1 = function (name) {
            if (name == "deep-freeze" && root.deepFreeze) {
                return root.deepFreeze;
            }
            throw new Error("Unable to require: " + name);
        };
        root.iassign = factory(require_1, {});
    }
})(this, function (require, exports) {
    //import deepFreeze = require("deep-freeze");
    try {
        var deepFreeze = require("deep-freeze");
    }
    catch (ex) {
        console.warn("Cannot load deep-freeze module, however you can still use iassign() function.");
    }
    var iassign = _iassign;
    // Immutable Assign
    function _iassign(obj, // Object to set property, it will not be modified.
        getProp, // Function to get property to be updated. Must be pure function.
        setProp, // Function to set property.
        context, // (Optional) Context to be used in getProp().
        option) {
        if (option) {
            option = extend({}, iassign, option);
        }
        else {
            option = iassign;
        }
        if (deepFreeze && (option.freeze || option.freezeInput)) {
            deepFreeze(obj);
        }
        // Check if getProp() is valid
        var value = getProp(obj, context);
        var getPropFuncInfo = parseGetPropFuncInfo(getProp, option);
        var accessorText = getPropFuncInfo.accessorText;
        var propIndex = 0;
        var propValue = undefined;
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
            if (propIndex <= 0) {
                propValue = quickCopy(obj);
                if (!accessorText) {
                    propValue = setProp(propValue);
                }
                obj = propValue;
            }
            else {
                var prevPropValue = propValue;
                if (propNameSource == ePropNameSource.inBracket && isNaN(propName)) {
                    if (propName[0] == "#") {
                        var quotedPropName = getPropFuncInfo.quotedTextInfos[propName];
                        if (!quotedPropName) {
                            throw new Error("Cannot find quoted text for " + quotedPropName);
                        }
                        propName = eval(quotedPropName);
                    }
                    else {
                        var statement = "'use strict';\n";
                        if (getPropFuncInfo.objParameterName) {
                            statement += "var " + getPropFuncInfo.objParameterName + " = arguments[1];\n";
                        }
                        if (getPropFuncInfo.cxtParameterName) {
                            statement += "var " + getPropFuncInfo.cxtParameterName + " = arguments[2];\n";
                        }
                        statement += "" + propName;
                        propName = evalStatement(statement, obj, context);
                    }
                }
                propValue = propValue[propName];
                propValue = quickCopy(propValue);
                if (!accessorText) {
                    propValue = setProp(propValue);
                }
                prevPropValue[propName] = propValue;
            }
            //console.log(propValue);
            propIndex++;
        }
        if (deepFreeze && (option.freeze || option.freezeOutput)) {
            deepFreeze(obj);
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
    function parseGetPropFuncInfo(func, option) {
        var funcText = func.toString();
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
        var bodyText = funcText.substring(funcText.indexOf("{") + 1, funcText.lastIndexOf("}"));
        var accessorTextInfo = getAccessorTextInfo(bodyText, option);
        return {
            objParameterName: objParameterName,
            cxtParameterName: cxtParameterName,
            bodyText: bodyText,
            accessorText: accessorTextInfo.accessorText,
            quotedTextInfos: accessorTextInfo.quotedTextInfos,
        };
    }
    function getAccessorTextInfo(bodyText, option) {
        var returnIndex = bodyText.indexOf("return ");
        if (!option.disableAllCheck && !option.disableHasReturnCheck) {
            if (returnIndex <= -1) {
                throw new Error("getProp() function has no 'return' keyword.");
            }
        }
        if (!option.disableAllCheck && !option.disableExtraStatementCheck) {
            var otherBodyText = bodyText.substr(0, returnIndex).trim();
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
