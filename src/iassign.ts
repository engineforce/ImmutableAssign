
// Immutable Assign
function iassign<TObj, TProp, TContext>(
    obj: TObj,
    getProp: (obj: TObj, context: TContext) => TProp,
    setProp: (prop: TProp) => TProp,
    ctx?: TContext): TObj {

    // Quick check if getProp() is valid.
    let value = getProp(obj, ctx);

    var getPropBodyText = getFuncBodyText(getProp);

    let accessorText = getPropBodyText.substr(getPropBodyText.indexOf("return ") + 7).trim();
    if (accessorText[accessorText.length - 1] == ";") {
        accessorText = accessorText.substring(0, accessorText.length - 1);
    }
    accessorText = accessorText.trim();

    let propIndex = 0;
    let propValue = undefined;

    while (accessorText) {
        let openBracketIndex = accessorText.indexOf("[");
        let closeBracketIndex = accessorText.indexOf("]");
        let dotIndex = accessorText.indexOf(".");
        let propName = "";
        let propNameSource = ePropNameSource.none;
        if (dotIndex == 0) {
            accessorText = accessorText.substr(dotIndex + 1);
            continue;
        }

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

        //console.log(propName);

        if (propIndex <= 0) {
            obj = quickCopy(obj);
            propValue = obj;
        }
        else {
            let prevPropValue = propValue;

            if (propNameSource == ePropNameSource.inBracket && isNaN(<any>propName)) {
                let propNameInQuote = extractTextInQuote(propName);
                if (propNameInQuote == undefined) {
                    propName = eval(`'use strict'; ${propName}`);
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

enum ePropNameSource {
    none,
    beforeDot,
    beforeBracket,
    inBracket,
    last,
}

function getFuncBodyText(func: Function) {
    var funcText = func.toString();
    return funcText.substring(funcText.indexOf("{") + 1, funcText.lastIndexOf("}"));
}

function quickCopy<T>(value: T): T {
    let copyValue: any = {};
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



