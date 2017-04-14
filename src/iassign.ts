"use strict";

// TODO: handle comments in getProp() function.

declare var define;

interface IIassignOption {
    freeze?: boolean;                        // Deep freeze both input and output
    freezeInput?: boolean;                   // Deep freeze input
    freezeOutput?: boolean;                  // Deep freeze output
    disableAllCheck?: boolean;
    disableHasReturnCheck?: boolean;
    // Disable validation for extra statements in the getProp() function, 
    // which is needed when running the coverage, e.g., istanbul.js does add 
    // instrument statements in our getProp() function, which can be safely ignored. 
    disableExtraStatementCheck?: boolean;

    // Default: 100
    maxGetPropCacheSize?: number;
}

type getPropFunc<TObj, TProp, TContext> = (obj: TObj, context: TContext) => TProp;
type setPropFunc<TProp> = (prop: TProp) => TProp;

interface IIassign extends IIassignOption {

    // Intellisense for the TObj parameter in getProp will only work if we remove the auto added closing bracket of iassign, 
    // and manually add the closing bracket at last. i.e., 
    //
    //   1. Type iassign( in the editor
    //   2. Most editor will auto complete with closing bracket, e.g., iassign()
    //   3. If we continue to type without removing the closing bracket, e.g., iassign(nested, (n) => n.),
    //      editor such as VS Code will not show any intellisense for "n"
    //   4. We must remove the closing bracket of iassign(), and intellisense will be shown for "n"

    <TObj, TProp, TContext>(
        obj: TObj,
        getProp: getPropFunc<TObj, TProp, TContext>,
        setProp: setPropFunc<TProp>,
        context?: TContext,
        option?: IIassignOption): TObj;

    <TObj>(
        obj: TObj,
        setProp: setPropFunc<TObj>,
        option?: IIassignOption): TObj;

    // functional programming friendly style, moved obj to the last parameter and supports currying
    fp<TObj, TProp, TContext>(
        option: IIassignOption,
        getProp: getPropFunc<TObj, TProp, TContext>,
        setProp: setPropFunc<TProp>,
        context?: TContext,
        obj?: TObj): TObj;
}

(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        try {
            var deepFreeze: DeepFreeze.DeepFreezeInterface = require("deep-freeze");
        } catch (ex) {
            console.warn("Cannot load deep-freeze module, however you can still use iassign() function.");
        }

        var v = factory(deepFreeze, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["deep-freeze", "exports"], factory);
    } else {
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

        var toArray = function toArray(arr, from?) {
            return Array.prototype.slice.call(arr, from || 0);
        }

        var curry = function curry(fn /* variadic number of args */) {
            var args = toArray(arguments, 1);
            return function curried() {
                return fn.apply(this, args.concat(toArray(arguments)));
            };
        };

        return function autoCurry(fn, numArgs?) {
            numArgs = numArgs || fn.length;
            return function autoCurried() {
                if (arguments.length < numArgs) {
                    return numArgs - arguments.length > 0 ?
                        autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
                            numArgs - arguments.length) :
                        curry.apply(this, [fn].concat(toArray(arguments)));
                }
                else {
                    return fn.apply(this, arguments);
                }
            };
        };

    }());

    var iassign: IIassign = <any>_iassign;
    iassign.fp = autoCurry(_iassignFp);
    iassign.maxGetPropCacheSize = 100;

    // Immutable Assign
    function _iassign<TObj, TProp, TContext>(
        obj: TObj,                                                                   // Object to set property, it will not be modified.
        getPropOrSetProp: getPropFunc<TObj, TProp, TContext> | setPropFunc<TProp>,   // Function to get property to be updated. Must be pure function.
        setPropOrOption: setPropFunc<TProp> | IIassignOption,                        // Function to set property.
        contextOrUndefined?: TContext,                                               // (Optional) Context to be used in getProp().
        optionOrUndefined?: IIassignOption): TObj {

        let getProp = <getPropFunc<TObj, TProp, TContext>>getPropOrSetProp;
        let setProp = <setPropFunc<TProp>>setPropOrOption;
        let context = contextOrUndefined;
        let option = optionOrUndefined;

        if (typeof setPropOrOption !== "function") {
            getProp = undefined;
            setProp = <setPropFunc<TProp>>getPropOrSetProp;
            context = undefined;
            option = <IIassignOption>setPropOrOption;
        }

        option = copyOption(option);

        if (deepFreeze && (option.freeze || option.freezeInput)) {
            deepFreeze(obj);
        }

        if (!getProp) {
            obj = quickCopy(obj);
            obj = <any>setProp(<any>obj);
        }
        else {
            // Check if getProp() is valid
            let value = getProp(obj, context);

            let getPropFuncInfo = parseGetPropFuncInfo(getProp, option);

            obj = updateProperty(obj, setProp, context, getPropFuncInfo);
        }

        if (deepFreeze && (option.freeze || option.freezeOutput)) {
            deepFreeze(obj);
        }

        return obj;
    }

    function _iassignFp<TObj, TProp, TContext>(
        option: IIassignOption,
        getProp: getPropFunc<TObj, TProp, TContext>,
        setProp: setPropFunc<TProp>,
        context?: TContext,
        obj?: TObj
    ): TObj {

        return _iassign<TObj, TProp, TContext>(obj, getProp, setProp, context, option);
    }

    // For performance
    function copyOption(option) {
        let newOption: IIassign = <any>{};

        newOption.freeze = iassign.freeze;
        newOption.freezeInput = iassign.freezeInput;
        newOption.freezeOutput = iassign.freezeOutput;
        newOption.disableAllCheck = iassign.disableAllCheck;
        newOption.disableHasReturnCheck = iassign.disableHasReturnCheck;
        newOption.disableExtraStatementCheck = iassign.disableExtraStatementCheck;
        newOption.maxGetPropCacheSize = iassign.maxGetPropCacheSize;

        if (option) {
            if (option.freeze != undefined) { newOption.freeze = option.freeze; }
            if (option.freezeInput != undefined) { newOption.freezeInput = option.freezeInput; }
            if (option.freezeOutput != undefined) { newOption.freezeOutput = option.freezeOutput; }
            if (option.disableAllCheck != undefined) { newOption.disableAllCheck = option.disableAllCheck; }
            if (option.disableHasReturnCheck != undefined) { newOption.disableHasReturnCheck = option.disableHasReturnCheck; }
            if (option.disableExtraStatementCheck != undefined) { newOption.disableExtraStatementCheck = option.disableExtraStatementCheck; }
            if (option.maxGetPropCacheSize != undefined) { newOption.maxGetPropCacheSize = option.maxGetPropCacheSize; }
        }

        return newOption;
    }

    function updateProperty<TObj, TProp, TContext>(
        obj: TObj,
        setProp: setPropFunc<TProp>,
        context: TContext,
        getPropFuncInfo: IGetPropFuncInfo): TObj {

        let propValue = undefined;

        for (var propIndex = 0; propIndex < getPropFuncInfo.funcTokens.length; ++propIndex) {
            let {propName, propNameSource, subAccessorText, getPropName} = getPropFuncInfo.funcTokens[propIndex];

            //console.log(propName);

            if (propIndex <= 0) {
                propValue = quickCopy(obj);

                if (!subAccessorText) {
                    propValue = setProp(propValue);
                }

                obj = propValue;
            }
            else {
                let prevPropValue = propValue;
                if (propName == undefined) {
                    propName = getPropName(obj, context);
                }

                propValue = propValue[propName];
                propValue = quickCopy(propValue)

                if (!subAccessorText) {
                    propValue = setProp(propValue);
                }

                prevPropValue[propName] = propValue;
            }

            //console.log(propValue);
        }

        return obj;
    }

    interface IGetPropFuncToken {
        propName: string;
        propNameSource: ePropNameSource;
        subAccessorText: string;
        getPropName?: (obj, context) => string;
    }

    enum ePropNameSource {
        none,
        beforeDot,
        beforeBracket,
        inBracket,
        last,
    }

    interface IGetPropFuncInfo extends IParsedTextInQuotes {
        objParameterName: string;
        cxtParameterName: string;
        bodyText: string;
        funcTokens: IGetPropFuncToken[];
    }

    interface IParsedTextInQuotes {
        accessorText: string;
        quotedTextInfos: { [key: string]: string };
    }

    let getPropCaches: { [key: string]: IGetPropFuncInfo } = {};
    let getPropCacheKeys: string[] = [];

    function parseGetPropFuncInfo(func: Function, option: IIassignOption): IGetPropFuncInfo {
        let funcText = func.toString();

        let cacheKey = funcText + JSON.stringify(option);
        let info = getPropCaches[cacheKey];
        if (getPropCaches[cacheKey]) {
            return info;
        }

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

        let bodyStartIndex = funcText.indexOf("{");
        let bodyEndIndex = funcText.lastIndexOf("}");
        let bodyText = "";
        if (bodyStartIndex > -1 && bodyEndIndex > -1) {
            bodyText = funcText.substring(bodyStartIndex + 1, bodyEndIndex);
        }
        else {
            let arrowIndex = funcText.indexOf("=>");
            if (arrowIndex > -1) {
                //console.log("Handle arrow function.");
                bodyText = "return " + funcText.substring(arrowIndex + 3);
            }
            else {
                throw new Error(`Cannot parse function: ${funcText}`);
            }
        }

        let accessorTextInfo = getAccessorTextInfo(bodyText, option);

        info = {
            objParameterName: objParameterName,
            cxtParameterName: cxtParameterName,
            bodyText: bodyText,
            accessorText: accessorTextInfo.accessorText,
            quotedTextInfos: accessorTextInfo.quotedTextInfos,
            funcTokens: parseGetPropFuncTokens(accessorTextInfo.accessorText),
        }

        postProcessTokens(info);

        if (option.maxGetPropCacheSize > 0) {
            getPropCaches[cacheKey] = info;
            getPropCacheKeys.push(cacheKey);

            if (getPropCacheKeys.length > option.maxGetPropCacheSize) {
                debugger;
                let cacheKeyToRemove = getPropCacheKeys.shift();
                delete getPropCaches[cacheKeyToRemove];
            }
        }

        return info;
    }

    function parseGetPropFuncTokens(accessorText: string): IGetPropFuncToken[] {
        let tokens: IGetPropFuncToken[] = [];

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
            tokens.push({
                propName,
                propNameSource,
                subAccessorText: accessorText,
            });
        }

        return tokens;
    }

    function postProcessTokens(getPropFuncInfo: IGetPropFuncInfo) {
        for (var propIndex = 0; propIndex < getPropFuncInfo.funcTokens.length; ++propIndex) {
            let token = getPropFuncInfo.funcTokens[propIndex];
            let {propName, propNameSource, subAccessorText} = token;

            if (propNameSource == ePropNameSource.inBracket && isNaN(<any>propName)) {

                if (propName[0] == "#") {
                    let quotedPropName = getPropFuncInfo.quotedTextInfos[propName];
                    if (!quotedPropName) {
                        throw new Error("Cannot find quoted text for " + quotedPropName);
                    }
                    propName = eval(quotedPropName);
                    token.propName = propName;
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
                    token.propName = undefined;
                    token.getPropName = (obj, context) => {
                        return (<any>evalStatement)(statement, obj, context);
                    }
                }
            }
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
            let otherBodyText = bodyText.substr(0, returnIndex);
            otherBodyText = otherBodyText.replace(/['"]use strict['"];*/g, "");
            otherBodyText = otherBodyText.trim();
            if (otherBodyText != "") {
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

    function parseTextInQuotes(accessorText, option: IIassignOption): IParsedTextInQuotes {
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
                const target = Object.create(Object.getPrototypeOf(value));
                return extend(target, value);
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


