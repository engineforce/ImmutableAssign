
declare namespace ImmutableAssign {
    interface IIassign {
        <TObj, TProp, TContext>(
            obj: TObj,
            getProp: (obj: TObj, context: TContext) => TProp,
            setProp: (prop: TProp) => TProp,
            context?: TContext): TObj;

        freeze?: boolean;
        freezeInput?: boolean;
        freezeOutput?: boolean;
        disableAllCheck?: boolean;
        disableHasReturnCheck?: boolean;
        disableExtraStatementCheck?: boolean;
    }    
}



//declare function iassign<TObj, TProp, TContext>(obj: TObj, getProp: (obj: TObj, context: TContext) => TProp, setProp: (prop: TProp) => TProp, context?: TContext): TObj;
//export = iassign;

declare module "immutable-assign" {
    let iassign: ImmutableAssign.IIassign;
    export = iassign;
}
