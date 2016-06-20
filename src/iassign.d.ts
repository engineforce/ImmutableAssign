declare function iassign<TObj, TProp, TContext>(obj: TObj, getProp: (obj: TObj, context: TContext) => TProp, setProp: (prop: TProp) => TProp, ctx?: TContext): TObj;
export = iassign;
