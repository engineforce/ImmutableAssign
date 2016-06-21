"use strict";
// Immutable Assign
function iassign(obj, // Object to set property, it will not be modified
    getProp, // Function to get property to be updated.
    setProp, // Function to set property
    ctx) {
    // Check if getProp() is valid
    var value = getProp(obj, ctx);
    var getPropBodyText = getFuncBodyText(getProp);
    var accessorText = getAccessorText(getPropBodyText);
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
            obj = quickCopy(obj);
            propValue = obj;
        }
        else {
            var prevPropValue = propValue;
            if (propNameSource == ePropNameSource.inBracket && isNaN(propName)) {
                var propNameInQuote = extractTextInQuote(propName);
                if (propNameInQuote == undefined) {
                    propName = eval("'use strict'; " + propName);
                }
                else {
                    propName = propNameInQuote;
                }
            }
            propValue = propValue[propName];
            if (propValue != undefined && !(propValue instanceof Date)) {
                if (propValue instanceof Array) {
                    propValue = propValue.slice();
                }
                else if (typeof (propValue) === "object") {
                    propValue = quickCopy(propValue);
                }
            }
            if (!accessorText) {
                propValue = setProp(propValue);
            }
            prevPropValue[propName] = propValue;
        }
        //console.log(propValue);
        propIndex++;
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
function getFuncBodyText(func) {
    var funcText = func.toString();
    return funcText.substring(funcText.indexOf("{") + 1, funcText.lastIndexOf("}"));
}
function getAccessorText(bodyText) {
    var returnIndex = bodyText.indexOf("return ");
    if (!iassign.disableAllCheck && !iassign.disableHasReturnCheck) {
        if (returnIndex <= -1) {
            throw new Error("getProp() function has no 'return' keyword.");
        }
    }
    if (!iassign.disableAllCheck && !iassign.disableExtraStatementCheck) {
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
    return accessorText;
}
function quickCopy(value) {
    var copyValue = {};
    for (var key in value) {
        copyValue[key] = value[key];
    }
    return copyValue;
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
function extractTextInQuote(text) {
    var quoteMarks = ["'", '"'];
    for (var _i = 0, quoteMarks_1 = quoteMarks; _i < quoteMarks_1.length; _i++) {
        var mark = quoteMarks_1[_i];
        if (text[0] == mark) {
            var regex = new RegExp("^[" + mark + "]([^" + mark + "]*)[" + mark + "]$");
            var match = regex.exec(text);
            if (match) {
                return match[1];
            }
        }
    }
    return undefined;
}
module.exports = iassign;
