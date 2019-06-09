'use strict';

declare var define;

interface ICopyFunc {
  <T>(value: T, propName: string): T;
}

interface IIassignOption {
  freeze?: boolean; // Deep freeze both input and output
  freezeInput?: boolean; // Deep freeze input
  freezeOutput?: boolean; // Deep freeze output
  useConstructor?: boolean; // Uses the constructor to create new instances
  copyFunc?: ICopyFunc; // Custom copy function, can be used to handle special types, e.g., Map, Set

  disableAllCheck?: boolean;
  disableHasReturnCheck?: boolean;
  // Disable validation for extra statements in the getProp() function,
  // which is needed when running the coverage, e.g., istanbul.js does add
  // instrument statements in our getProp() function, which can be safely ignored.
  disableExtraStatementCheck?: boolean;

  // Default: 100
  maxGetPropCacheSize?: number;

  // Return the same object if setProp() returns its parameter (i.e., reference pointer not changed).
  ignoreIfNoChange?: boolean;
}

type getPropFunc<TObj, TProp, TContext> = (
  obj: TObj,
  context: TContext
) => TProp;
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
  <TObj>(obj: TObj, setProp: setPropFunc<TObj>, option?: IIassignOption): TObj;

  <TObj, TProp, TContext>(
    obj: TObj,
    getProp: getPropFunc<TObj, TProp, TContext>,
    setProp: setPropFunc<TProp>,
    context?: TContext,
    option?: IIassignOption
  ): TObj;

  <TObj, TProp, TContext>(
    obj: TObj,
    propPaths: (string | number)[],
    setProp: setPropFunc<TProp>,
    context?: TContext,
    option?: IIassignOption
  ): TObj;

  // functional programming friendly style, moved obj to the last parameter and supports currying
  fp<TObj, TProp, TContext>(
    option: IIassignOption,
    getPropOrPropPath: getPropFunc<TObj, TProp, TContext> | (string | number)[],
    setProp: setPropFunc<TProp>,
    context?: TContext,
    obj?: TObj
  ): TObj;

  // In ES6, you cannot set property on imported module directly, because they are default
  // to readonly, in this case you need to use this method.
  setOption(option: IIassignOption);

  deepFreeze<T>(obj: T): T;

  // ES6 default export
  default: IIassign;
}

(function(root: any, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    try {
      var deepFreeze: DeepFreeze.DeepFreezeInterface = require('deep-freeze-strict');
    } catch (ex) {
      console.warn(
        'Cannot load deep-freeze-strict module, however you can still use iassign() function.'
      );
    }

    const v = factory(deepFreeze, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === 'function' && define.amd) {
    define(['deep-freeze-strict', 'exports'], factory);
  } else {
    // Browser globals (root is window)
    root.iassign = factory(root.deepFreeze, {});
  }
})(this, function(deepFreeze, exports) {
  const autoCurry = (function() {
    const toArray = function toArray(arr, from?) {
      return Array.prototype.slice.call(arr, from || 0);
    };

    const curry = function curry(fn /* variadic number of args */) {
      const args = toArray(arguments, 1);
      return function curried() {
        return fn.apply(undefined, args.concat(toArray(arguments)));
      };
    };

    return function autoCurry(fn, numArgs?) {
      numArgs = numArgs || fn.length;
      return function autoCurried() {
        if (arguments.length < numArgs) {
          return numArgs - arguments.length > 0
            ? autoCurry(
                curry.apply(undefined, [fn].concat(toArray(arguments))),
                numArgs - arguments.length
              )
            : curry.apply(undefined, [fn].concat(toArray(arguments)));
        } else {
          return fn.apply(undefined, arguments);
        }
      };
    };
  })();

  const iassign: IIassign = <any>_iassign;
  iassign.fp = autoCurry(_iassignFp);
  iassign.maxGetPropCacheSize = 100;

  iassign.freeze =
    typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

  iassign.setOption = function(option) {
    copyOption(iassign, option);
  };

  // Immutable Assign
  function _iassign<TObj, TProp, TContext>(
    obj: TObj, // Object to set property, it will not be modified.
    getPropOrSetPropOrPaths:
      | getPropFunc<TObj, TProp, TContext>
      | setPropFunc<TProp>
      | (string | number)[], // Function to get property to be updated. Must be pure function.
    setPropOrOption: setPropFunc<TProp> | IIassignOption, // Function to set property.
    contextOrUndefined?: TContext, // (Optional) Context to be used in getProp().
    optionOrUndefined?: IIassignOption
  ): TObj {
    let getProp = <getPropFunc<TObj, TProp, TContext>>getPropOrSetPropOrPaths;
    let propPaths = undefined;
    let setProp = <setPropFunc<TProp>>setPropOrOption;
    let context = contextOrUndefined;
    let option = optionOrUndefined;

    if (typeof setPropOrOption !== 'function') {
      getProp = undefined;
      setProp = <setPropFunc<TProp>>getPropOrSetPropOrPaths;
      context = undefined;
      option = <IIassignOption>setPropOrOption;
    } else {
      if (getProp instanceof Array) {
        propPaths = getProp;
      }
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
    } else {
      let newValue = undefined;
      if (!propPaths) {
        if (option.ignoreIfNoChange) {
          // Check if getProp() is valid
          let value = getProp(obj, context);

          newValue = setProp(value);
          if (newValue === value) {
            return obj;
          }
        }

        let funcText = getProp.toString();
        let arrowIndex = funcText.indexOf('=>');
        if (arrowIndex <= -1) {
          let returnIndex = funcText.indexOf('return ');
          if (returnIndex <= -1) {
            throw new Error('getProp() function does not return a part of obj');
          }
        }

        propPaths = getPropPath(getProp, obj, context, option);
      } else {
        if (option.ignoreIfNoChange) {
          // Check if getProp() is valid
          let value = getPropByPaths(obj, propPaths);

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

  function _iassignFp<
    TObj,
    TProp,
    TContext
  >(option: IIassignOption, getProp: getPropFunc<TObj, TProp, TContext>, setProp: setPropFunc<TProp>, context?: TContext, obj?: TObj): TObj {
    return _iassign<
      TObj,
      TProp,
      TContext
    >(obj, getProp, setProp, context, option);
  }

  function getPropPath<
    TObj,
    TProp,
    TContext
  >(getProp: getPropFunc<TObj, TProp, TContext>, obj: TObj, context: TContext, option: IIassignOption): string[] {
    let paths = [];
    let objCopy;
    let propValue;
    if (typeof Proxy === 'undefined') {
      propValue = getProp(obj, context);
      objCopy = _getPropPathViaProperty(obj, paths);
    } else {
      objCopy = _getPropPathViaProxy(obj, paths);
    }
    getProp(objCopy, context);

    // Check propValue === undefined for performance
    if (typeof Proxy === 'undefined' && propValue === undefined) {
      const functionInfo = parseGetPropFuncInfo(getProp, option);

      if (paths.length != functionInfo.funcTokens.length - 1) {
        const remainingFunctionTokens = functionInfo.funcTokens.slice(
          paths.length + 1
        );

        for (const token of remainingFunctionTokens) {
          if (
            token.propNameSource == ePropNameSource.inBracket &&
            isNaN(<any>token.propName)
          ) {
            throw new Error(
              `Cannot handle ${
                token.propName
              } when the property it point to is undefined.`
            );
          }
        }

        paths = [...paths, ...remainingFunctionTokens.map((s) => s.propName)];
      }
    }

    return paths;
  }

  function _getPropPathViaProperty(obj, paths: string[], level = 0): any {
    let objCopy = quickCopy(obj, paths[level - 1]);
    const propertyNames = getOwnPropertyNames(obj);
    propertyNames.forEach(function(propKey) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, propKey);
      if (descriptor && (!(obj instanceof Array) || propKey != 'length')) {
        const copyDescriptor = {
          enumerable: descriptor.enumerable,
          configurable: false,
          get: function() {
            if (level == paths.length) {
              paths.push(propKey);
              let propValue = obj[propKey];
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

  function _getPropPathViaProxy(obj, paths: string[], level = 0): any {
    const handlers = {
      get: (target: any, propKey: string) => {
        let propValue = obj[propKey];

        if (level == paths.length) {
          paths.push(propKey);

          if (typeof propValue === 'object' && propValue != null) {
            return _getPropPathViaProxy(propValue, paths, level + 1);
          }
        }

        return propValue;
      }
    };

    return new Proxy(quickCopy(obj, paths[level - 1]), handlers);
  }

  // For performance
  function copyOption(
    target: IIassignOption = {},
    option: IIassignOption,
    defaultOption?: IIassignOption
  ) {
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

  function updateProperty<
    TObj,
    TProp,
    TContext
  >(obj: TObj, setProp: setPropFunc<TProp>, newValue: TProp, context: TContext, propPaths: string[], option: IIassignOption): TObj {
    let propValue: any = quickCopy(
      obj,
      undefined,
      option.useConstructor,
      option.copyFunc
    );
    obj = propValue;
    if (!propPaths.length) {
      return option.ignoreIfNoChange ? newValue : (setProp(propValue) as any);
    }

    for (let propIndex = 0; propIndex < propPaths.length; ++propIndex) {
      const propName = propPaths[propIndex];
      const isLast = propIndex + 1 === propPaths.length;

      const prevPropValue = propValue;

      propValue = propValue[propName];
      propValue = quickCopy(
        propValue,
        propName,
        option.useConstructor,
        option.copyFunc
      );

      if (isLast) {
        propValue = option.ignoreIfNoChange ? newValue : setProp(propValue);
      }

      prevPropValue[propName] = propValue;
    }

    return obj;
  }

  function quickCopy<
    T
  >(value: T, propName?: string, useConstructor?: boolean, copyFunc?: ICopyFunc): T {
    if (value != undefined && !(value instanceof Date)) {
      if (value instanceof Array) {
        return (<any>value).slice();
      } else if (typeof value === 'object') {
        if (useConstructor) {
          const target = new (value as any).constructor();
          return extend(target, value);
        } else if (copyFunc) {
          let newValue = copyFunc(value, propName);
          if (newValue != undefined) return newValue;
        }

        return extend({}, value);
      }
    }

    return value;
  }

  function extend(destination: any, source) {
    for (let key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      let value = source[key];
      destination[key] = value;
    }
    return destination;
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
    last
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

  function parseGetPropFuncInfo(
    func: Function,
    option: IIassignOption
  ): IGetPropFuncInfo {
    let funcText = func.toString();

    let cacheKey = funcText + JSON.stringify(option);
    let info = getPropCaches[cacheKey];
    if (getPropCaches[cacheKey]) {
      return info;
    }

    let matches = /\(([^\)]*)\)/.exec(funcText);
    let objParameterName = undefined;
    let cxtParameterName = undefined;
    if (matches) {
      let parametersText = matches[1];
      let parameters = parametersText.split(',');
      objParameterName = parameters[0];
      cxtParameterName = parameters[1];
    }

    if (objParameterName) {
      objParameterName = objParameterName.trim();
    }

    if (cxtParameterName) {
      cxtParameterName = cxtParameterName.trim();
    }

    let bodyStartIndex = funcText.indexOf('{');
    let bodyEndIndex = funcText.lastIndexOf('}');
    let bodyText = '';
    if (bodyStartIndex > -1 && bodyEndIndex > -1) {
      bodyText = funcText.substring(bodyStartIndex + 1, bodyEndIndex);
    } else {
      let arrowIndex = funcText.indexOf('=>');
      if (arrowIndex > -1) {
        //console.log("Handle arrow function.");
        bodyText = 'return ' + funcText.substring(arrowIndex + 3);
      } else {
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
      funcTokens: parseGetPropFuncTokens(accessorTextInfo.accessorText)
    };

    if (option.maxGetPropCacheSize > 0) {
      getPropCaches[cacheKey] = info;
      getPropCacheKeys.push(cacheKey);

      if (getPropCacheKeys.length > option.maxGetPropCacheSize) {
        let cacheKeyToRemove = getPropCacheKeys.shift();
        delete getPropCaches[cacheKeyToRemove];
      }
    }

    return info;
  }

  function parseGetPropFuncTokens(accessorText: string): IGetPropFuncToken[] {
    let tokens: IGetPropFuncToken[] = [];

    while (accessorText) {
      let openBracketIndex = accessorText.indexOf('[');
      let closeBracketIndex = accessorText.indexOf(']');
      let dotIndex = accessorText.indexOf('.');
      let propName = '';
      let propNameSource = ePropNameSource.none;

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

      if (
        dotIndex > -1 &&
        (dotIndex < openBracketIndex || openBracketIndex <= -1)
      ) {
        propName = accessorText.substr(0, dotIndex);
        accessorText = accessorText.substr(dotIndex + 1);
        propNameSource = ePropNameSource.beforeDot;
      } else if (
        openBracketIndex > -1 &&
        (openBracketIndex < dotIndex || dotIndex <= -1)
      ) {
        if (openBracketIndex > 0) {
          propName = accessorText.substr(0, openBracketIndex);
          accessorText = accessorText.substr(openBracketIndex);
          propNameSource = ePropNameSource.beforeBracket;
        } else {
          propName = accessorText.substr(
            openBracketIndex + 1,
            closeBracketIndex - 1
          );
          accessorText = accessorText.substr(closeBracketIndex + 1);
          propNameSource = ePropNameSource.inBracket;
        }
      } else {
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
        propName,
        propNameSource,
        subAccessorText: accessorText
      });
    }

    return tokens;
  }

  function getAccessorTextInfo(bodyText: string, option: IIassignOption) {
    let returnIndex = bodyText.indexOf('return ');

    if (!option.disableAllCheck && !option.disableHasReturnCheck) {
      if (returnIndex <= -1) {
        throw new Error("getProp() function has no 'return' keyword.");
      }
    }

    if (!option.disableAllCheck && !option.disableExtraStatementCheck) {
      let otherBodyText = bodyText.substr(0, returnIndex);
      otherBodyText = otherBodyText.replace(/['"]use strict['"];*/g, '');
      otherBodyText = otherBodyText.trim();
      if (otherBodyText != '') {
        throw new Error(
          "getProp() function has statements other than 'return': " +
            otherBodyText
        );
      }
    }

    let accessorText = bodyText.substr(returnIndex + 7).trim();
    if (accessorText[accessorText.length - 1] == ';') {
      accessorText = accessorText.substring(0, accessorText.length - 1);
    }
    accessorText = accessorText.trim();

    return parseTextInQuotes(accessorText, option);
  }

  function parseTextInQuotes(
    accessorText,
    option: IIassignOption
  ): IParsedTextInQuotes {
    let quotedTextInfos: { [key: string]: string } = {};

    let index = 0;
    while (true) {
      let singleQuoteIndex = accessorText.indexOf("'");
      let doubleQuoteIndex = accessorText.indexOf('"');
      let varName = '#' + index++;

      if (singleQuoteIndex <= -1 && doubleQuoteIndex <= -1) break;

      let matches: RegExpExecArray = undefined;
      let quoteIndex: number;

      if (
        doubleQuoteIndex > -1 &&
        (doubleQuoteIndex < singleQuoteIndex || singleQuoteIndex <= -1)
      ) {
        matches = /("[^"\\]*(?:\\.[^"\\]*)*")/.exec(accessorText);
        quoteIndex = doubleQuoteIndex;
      } else if (
        singleQuoteIndex > -1 &&
        (singleQuoteIndex < doubleQuoteIndex || doubleQuoteIndex <= -1)
      ) {
        matches = /('[^'\\]*(?:\\.[^'\\]*)*')/.exec(accessorText);
        quoteIndex = singleQuoteIndex;
      }

      if (matches) {
        quotedTextInfos[varName] = matches[1];
        accessorText =
          accessorText.substr(0, quoteIndex) +
          varName +
          accessorText.substr(matches.index + matches[1].length);
      } else {
        throw new Error('Invalid text in quotes: ' + accessorText);
      }
    }

    return {
      accessorText,
      quotedTextInfos
    };
  }

  iassign.default = iassign;
  iassign.deepFreeze = (obj) => (iassign.freeze ? deepFreeze(obj) : obj);
  return iassign;
});

function getPropByPaths(obj, paths: (string | number)[]) {
  paths = paths.slice();
  let value = obj;

  while (paths.length > 0) {
    let path = paths.shift();
    value = value[path];
  }

  return value;
}

// Android 5: Object.getOwnPropertyNames does not support primitive values gracefully.
function getOwnPropertyNames(obj: any) {
  if (typeof obj !== 'object') {
    return [];
  }

  return Object.getOwnPropertyNames(obj);
}
