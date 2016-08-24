"use strict"

declare var define;

interface IIassignOption {
    freeze: boolean;                        // Deep freeze both input and output
    freezeInput: boolean;                   // Deep freeze input
    freezeOutput: boolean;                  // Deep freeze output
    disableAllCheck: boolean;
    disableHasReturnCheck: boolean;
    disableExtraStatementCheck: boolean;
}

interface IIassign extends IIassignOption {
    <TObj, TProp, TContext>(
        obj: TObj,
        getProp: (obj: TObj, context: TContext) => TProp,
        setProp: (prop: TProp) => TProp,
        context?: TContext,
        option?: IIassignOption): TObj;
}

(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    } else {
        // Browser globals (root is window)
        let require = (name) => {
            if (name == "deep-freeze" && root.deepFreeze) {
                return root.deepFreeze;
            }

            throw new Error("Unable to require: " + name);
        }
        root.iassign = factory(require, {});
    }
})(this, function (require, exports) {

    //import deepFreeze = require("deep-freeze");

    try {
        var deepFreeze: DeepFreeze.DeepFreezeInterface = require("deep-freeze");
    } catch (ex) {
        console.warn("Cannot load deep-freeze module, however you can still use iassign() function.");
    }

    var iassign: IIassign = <any>_iassign;

    // Immutable Assign
    function _iassign<TObj, TProp, TContext>(
        obj: TObj,                                          // Object to set property, it will not be modified.
        getProp: (obj: TObj, context: TContext) => TProp,   // Function to get property to be updated. Must be pure function.
        setProp: (prop: TProp) => TProp,                    // Function to set property.
        context?: TContext,                                 // (Optional) Context to be used in getProp().
        option?: IIassignOption): TObj {

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
        let value = getProp(obj, context);

        let getPropFuncInfo = parseGetPropFuncInfo(getProp, option);
        let accessorText = getPropFuncInfo.accessorText;

        let propIndex = 0;
        let propValue = undefined;

        while (accessorText) {
            let openBracketIndex = accessorText.indexOf("[");
            let closeBracketIndex = accessorText.indexOf("]");
            let dotIndex = accessorText.indexOf(".");
            let propName = "";
            let propNameSource = ePropNameSource.none;

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
                let prevPropValue = propValue;

                if (propNameSource == ePropNameSource.inBracket && isNaN(<any>propName)) {

                    if (propName[0] == "#") {
                        let quotedPropName = getPropFuncInfo.quotedTextInfos[propName];
                        if (!quotedPropName) {
                            throw new Error("Cannot find quoted text for " + quotedPropName);
                        }
                        propName = eval(quotedPropName);
                    }
                    else {
                        let statement = `'use strict';\n`;
                        if (getPropFuncInfo.objParameterName) {
                            statement += `var ${getPropFuncInfo.objParameterName} = arguments[1];\n`
                        }
                        if (getPropFuncInfo.cxtParameterName) {
                            statement += `var ${getPropFuncInfo.cxtParameterName} = arguments[2];\n`
                        }
                        statement += `${propName}`;
                        propName = (<any>evalStatement)(statement, obj, context);
                    }
                }

                propValue = propValue[propName];
                propValue = quickCopy(propValue)

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

    enum ePropNameSource {
        none,
        beforeDot,
        beforeBracket,
        inBracket,
        last,
    }

    function parseGetPropFuncInfo(func: Function, option: IIassignOption) {
        let funcText = func.toString();

        let matches = /\(([^\)]*)\)/.exec(funcText);
        var objParameterName = undefined;
        let cxtParameterName = undefined;
        if (matches) {
            let parametersText = matches[1];
            let parameters = parametersText.split(",");
            objParameterName = parameters[0];
            cxtParameterName = parameters[1];
        }

        if (objParameterName) {
            objParameterName = objParameterName.trim();
        }

        if (cxtParameterName) {
            cxtParameterName = cxtParameterName.trim();
        }

        let bodyText = funcText.substring(funcText.indexOf("{") + 1, funcText.lastIndexOf("}"));
        let accessorTextInfo = getAccessorTextInfo(bodyText, option);

        return {
            objParameterName: objParameterName,
            cxtParameterName: cxtParameterName,
            bodyText: bodyText,
            accessorText: accessorTextInfo.accessorText,
            quotedTextInfos: accessorTextInfo.quotedTextInfos,
        }
    }

    function getAccessorTextInfo(bodyText: string, option: IIassignOption) {

        let returnIndex = bodyText.indexOf("return ");

        if (!option.disableAllCheck && !option.disableHasReturnCheck) {
            if (returnIndex <= -1) {
                throw new Error("getProp() function has no 'return' keyword.");
            }
        }

        if (!option.disableAllCheck && !option.disableExtraStatementCheck) {
            let otherBodyText = bodyText.substr(0, returnIndex).trim();
            if (otherBodyText != "" && otherBodyText != '"use strict";') {
                throw new Error("getProp() function has statements other than 'return': " + otherBodyText);
            }
        }

        let accessorText = bodyText.substr(returnIndex + 7).trim();
        if (accessorText[accessorText.length - 1] == ";") {
            accessorText = accessorText.substring(0, accessorText.length - 1);
        }
        accessorText = accessorText.trim();

        return parseTextInQuotes(accessorText, option);
    }

    function parseTextInQuotes(accessorText, option: IIassignOption) {
        let quotedTextInfos: { [key: string]: string } = {}

        let index = 0;
        while (true) {
            let singleQuoteIndex = accessorText.indexOf("'");
            let doubleQuoteIndex = accessorText.indexOf('"');
            let varName = "#" + index++;

            if (singleQuoteIndex <= -1 && doubleQuoteIndex <= -1)
                break;

            let matches: RegExpExecArray = undefined;
            let quoteIndex: number;

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
            accessorText,
            quotedTextInfos,
        };
    }

    function quickCopy<T>(value: T): T {

        if (value != undefined && !(value instanceof Date)) {
            if (value instanceof Array) {
                return (<any>value).slice();
            }
            else if (typeof (value) === "object") {
                return extend({}, value);
            }
        }

        return value;
    }

    function extend(destination: any, ...sources) {
        for (var source of sources) {
            for (var key in source) {
                if (!Object.prototype.hasOwnProperty.call(source, key)) {
                    continue;
                }
                let value = source[key];
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


