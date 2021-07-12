export type AfterAdviceType = (joinPoint: JoinPoint, result: any, error: Error | null) => void
export type AfterReturningAdviceType = (joinPoint: JoinPoint, result: any) => any
export type AfterThrowAdviceType = (joinPoint: JoinPoint, error: Error | null) => void
export type BeforeAdviceType = (joinPoint: JoinPoint) => void
export type AroundAdviceType = (joinPoint: ProceedJoinPoint) => any
export type AdviceKeys = keyof Advices
export type AdviceTypes = Advices[AdviceKeys]
export type PointcutOpts = { value: string }
export type AdviceDecorator = (options: PointcutOpts) => MethodDecorator

export interface Advices {
    after?: AfterAdviceType;
    afterReturning?: AfterReturningAdviceType;
    afterThrowing?: AfterThrowAdviceType;
    before?: BeforeAdviceType;
    around?: AroundAdviceType;
}

export interface JoinPointType {
    target: any;
    args: any[];
    thisArg: any;
    value: any
}

export interface ProceedJoinPointType extends JoinPointType {
    proceed: () => any
}

export interface WeavingOpts {
    blackList?: Array<string>;
    namespace?: string;
}

export type PointcutType = 'proto' | 'static'

export type PointcutRuleType = {
    namespace?: RegExp | string;
    className: RegExp | string;
    methodName: RegExp | string
}

export type PointcutRules = string | RegExp | PointcutRuleType | Array<PointcutRuleType | RegExp | string>

export interface JoinPoint {
    target: any;
    args: any[];
    thisArg: any;
    value: any
    new(jp: JoinPointType)
}

export interface ProceedJoinPoint extends JoinPoint {
    new(jp: ProceedJoinPointType)
    procced(): any
}

export type PointcutMatches = { namespace?: string, className?: string; methodName?: string }

export interface PointcutClass {
    rules: PointcutRules;
    advices: Advices;
    matches: (ctx: PointcutMatches) => boolean;
    registAdvice<T extends AdviceKeys>(type: T, advice: Advice<T>): void;
    findAdvice(type: AdviceKeys): AdviceTypes;
    normalizedRules(rules: PointcutRules): Array<PointcutRuleType | RegExp | string>;
    toRegRule(rule: string): void;
}

declare const Pointcut = (type?: PointcutType) => MethodDecorator
declare const Before: AdviceDecorator
declare const After: AdviceDecorator
declare const AfterReturning: AdviceDecorator
declare const AfterThrowing: AdviceDecorator
declare const Around: AdviceDecorator
declare const Aspect: () => ClassDecorator
declare const Weaving: (opts?: WeavingOpts | undefined) => ClassDecorator
