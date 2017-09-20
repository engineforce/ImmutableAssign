"use strict";

declare var define;

interface ICopyFunc {
    <T>(value: T, propName: string): T
}

interface IIassignOption {
    freeze?: boolean;                        // Deep freeze both input and output
    freezeInput?: boolean;                   // Deep freeze input
    freezeOutput?: boolean;                  // Deep freeze output
    useConstructor?: boolean;                // Uses the constructor to create new instances
    copyFunc?: ICopyFunc;                    // Custom copy function, can be used to handle special types, e.g., Map, Set

    // Return the same object if setProp() returns its parameter (i.e., reference pointer not changed).
    ignoreIfNoChange?: boolean;
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

    // In ES6, you cannot set property on imported module directly, because they are default
    // to readonly, in this case you need to use this method.
    setOption(option: IIassignOption);

    // ES6 default export
    default: IIassign;
}

(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        try {
            var deepFreeze: DeepFreeze.DeepFreezeInterface = require("deep-freeze-strict");
            var proxyPolyfill = require('./Libs/proxy');
        } catch (ex) {
            console.warn("Cannot load deep-freeze-strict module, however you can still use iassign() function.");
        }

        var v = factory(deepFreeze, proxyPolyfill, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["deep-freeze-strict", './Libs/proxy', "exports"], factory);
    } else {
        // Browser globals (root is window)
        root.iassign = factory(root.deepFreeze, undefined, {});
    }
})(this, function (deepFreeze, proxyPolyfill, exports) {

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

    iassign.setOption = function (option) {
        copyOption(iassign, option);
    }

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

        option = copyOption(undefined, option, iassign);

        if (deepFreeze && (option.freeze || option.freezeInput)) {
            deepFreeze(obj);
        }

        if (!getProp) {

            let newValue = undefined;
            if (option.ignoreIfNoChange) {
                newValue = setProp(<any>obj);
                if (<any>newValue === <any>obj) {
                    return obj;
                }
            }

            obj = quickCopy(obj, undefined, option.useConstructor, option.copyFunc);
            obj = option.ignoreIfNoChange ? newValue : <any>setProp(<any>obj);
        }
        else {
            // Check if getProp() is valid
            let value = getProp(obj, context);

            let newValue = undefined;
            if (option.ignoreIfNoChange) {
                newValue = setProp(value);
                if (newValue === value) {
                    return obj;
                }
            }

            const propPath = getPropPath(getProp, obj, context, option);
            if (!propPath) {
                throw new Error('getProp() function does not return a part of obj');
            }

            obj = updateProperty(obj, setProp, newValue, context, propPath, option);
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

    function getPropPath<TObj, TProp, TContext>(getProp: getPropFunc<TObj, TProp, TContext>, obj: TObj, context: TContext, option: IIassignOption): string[] {
        // will be a double map, both original values and proxied objects will have the path indexed
        const pathMap = new Map<any, string[]>();
        const handlers = {
            get: (target: any, prop: string) => {
                switch (prop) {
                    // Allows this object be used as a primitive for self-referential access (e.g. obj.a[obj.b])
                    // See http://www.adequatelygood.com/Object-to-Primitive-Conversions-in-JavaScript.html
                    case 'valueOf':
                        return () => target.valueOf();
                    case 'toString':
                        return () => target.toString();
                }
                const nextValue = target[prop];
                if (nextValue === undefined || nextValue === null) {
                    return nextValue;
                }
                let nextObj;
                if (typeof nextValue !== 'object') {
                    nextObj = {
                        valueOf: () => nextValue,
                        toString: () => nextValue.toString(),
                    };
                } else {
                    nextObj = quickCopy(nextValue, prop, option.useConstructor, option.copyFunc);
                }
                const prevPath = pathMap.get(target) || [];
                const nextPath = prevPath.concat(prop);
                const proxied = new Proxy(nextObj, handlers);
                pathMap.set(nextObj, nextPath);
                pathMap.set(proxied, nextPath);
                return proxied;
            },
        };
        let coreObj = quickCopy(obj, undefined, option.useConstructor, option.copyFunc);
        coreObj = new Proxy(coreObj, handlers);
        pathMap.set(coreObj, []);
        pathMap.set(obj, []);
        return pathMap.get(getProp(coreObj, context));
    }

    // For performance
    function copyOption(target: IIassignOption = {}, option: IIassignOption, defaultOption?: IIassignOption) {

        if (defaultOption) {
            target.freeze = defaultOption.freeze;
            target.freezeInput = defaultOption.freezeInput;
            target.freezeOutput = defaultOption.freezeOutput;
            target.useConstructor = defaultOption.useConstructor;
            target.copyFunc = defaultOption.copyFunc;
            target.ignoreIfNoChange = defaultOption.ignoreIfNoChange;
        }

        if (option) {
            if (option.freeze != undefined) { target.freeze = option.freeze; }
            if (option.freezeInput != undefined) { target.freezeInput = option.freezeInput; }
            if (option.freezeOutput != undefined) { target.freezeOutput = option.freezeOutput; }
            if (option.useConstructor != undefined) { target.useConstructor = option.useConstructor; }
            if (option.copyFunc != undefined) { target.copyFunc = option.copyFunc; }
            if (option.ignoreIfNoChange != undefined) { target.ignoreIfNoChange = option.ignoreIfNoChange; }
        }

        return target;
    }

    function updateProperty<TObj, TProp, TContext>(
        obj: TObj,
        setProp: setPropFunc<TProp>,
        newValue: TProp,
        context: TContext,
        propPath: string[],
        option: IIassignOption): TObj {

            let propValue: any = quickCopy(obj, undefined, option.useConstructor, option.copyFunc);
            obj = propValue;
            if (!propPath.length) {
                return option.ignoreIfNoChange ? newValue : setProp(propValue) as any;
            }

            for (var propIndex = 0; propIndex < propPath.length; ++propIndex) {
                const propName = propPath[propIndex];
                const isLast = propIndex + 1 === propPath.length;

                const prevPropValue = propValue;

                propValue = propValue[propName];
                propValue = quickCopy(propValue, propName, option.useConstructor, option.copyFunc);

                if (isLast) {
                    propValue = option.ignoreIfNoChange ? newValue : setProp(propValue);
                }

                prevPropValue[propName] = propValue;
            }

        return obj;
    }

    function quickCopy<T>(value: T, propName: string, useConstructor: boolean, copyFunc: ICopyFunc): T {

        if (value != undefined && !(value instanceof Date)) {
            if (value instanceof Array) {
                return (<any>value).slice();
            }
            else if (typeof (value) === "object") {
                if (useConstructor) {
                    const target = new (value as any).constructor();
                    return extend(target, value);
                }
                else if (copyFunc) {
                    let newValue = copyFunc(value, propName);
                    if (newValue != undefined)
                        return newValue;
                }

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

    iassign.default = iassign;
    return iassign;
});
