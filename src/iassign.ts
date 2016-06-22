"use strict";

// Immutable Assign
function iassign<TObj, TProp, TContext>(
    obj: TObj,                                          // Object to set property, it will not be modified
    getProp: (obj: TObj, context: TContext) => TProp,   // Function to get property to be updated.
    setProp: (prop: TProp) => TProp,                    // Function to set property
    context?: TContext): TObj {                             // Context to be used in getProp() 

    // Check if getProp() is valid
    let value = getProp(obj, context);

    let getPropFuncInfo = parseGetPropFuncInfo(getProp);
    let accessorText = getAccessorText(getPropFuncInfo.bodyText);

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
                let propNameInQuote = extractTextInQuote(propName);
                if (propNameInQuote == undefined) {
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
                else {
                    propName = propNameInQuote;
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

    return obj;
}

enum ePropNameSource {
    none,
    beforeDot,
    beforeBracket,
    inBracket,
    last,
}

function parseGetPropFuncInfo(func: Function) {
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

    return {
        objParameterName: objParameterName,
        cxtParameterName: cxtParameterName,
        bodyText: funcText.substring(funcText.indexOf("{") + 1, funcText.lastIndexOf("}"))
    }
}

function getAccessorText(bodyText: string) {

    let returnIndex = bodyText.indexOf("return ");

    if (!(<any>iassign).disableAllCheck && !(<any>iassign).disableHasReturnCheck) {
        if (returnIndex <= -1) {
            throw new Error("getProp() function has no 'return' keyword.");
        }
    }

    if (!(<any>iassign).disableAllCheck && !(<any>iassign).disableExtraStatementCheck) {
        let otherBodyText = bodyText.substr(0, returnIndex).trim();
        if (otherBodyText != "") {
            throw new Error("getProp() function has statements other than 'return': " + otherBodyText);
        }
    }

    let accessorText = bodyText.substr(returnIndex + 7).trim();
    if (accessorText[accessorText.length - 1] == ";") {
        accessorText = accessorText.substring(0, accessorText.length - 1);
    }
    accessorText = accessorText.trim();
    return accessorText;
}

function quickCopy<T>(value: T): T {

    if (value != undefined && !(value instanceof Date)) {
        if (value instanceof Array) {
            return (<any>value).slice();
        }
        else if (typeof (value) === "object") {
            let copyValue: any = {};
            for (var key in value) {
                copyValue[key] = value[key];
            }
            return copyValue;
        }
    }

    return value;
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

function extractTextInQuote(text: string): string {
    let quoteMarks = ["'", '"'];

    for (let mark of quoteMarks) {
        if (text[0] == mark) {
            let regex = new RegExp(`^[${mark}]([^${mark}]*)[${mark}]$`);
            let match = regex.exec(text);
            if (match) {
                return match[1];
            }
        }
    }

    return undefined;
}

export = iassign;



