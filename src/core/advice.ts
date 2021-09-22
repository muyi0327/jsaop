import 'reflect-metadata'
import { JoinPoint, ProceedJoinPoint } from "./joinpoint"

type PointcutOpts = { value: string }
type AdviceDecorator = (options: PointcutOpts) => MethodDecorator

export type AfterAdviceType = (joinPoint: JoinPoint, result: any, error: Error | null) => void
export type AfterReturningAdviceType = (joinPoint: JoinPoint, result: any) => any
export type AfterThrowAdviceType = (joinPoint: JoinPoint, error: Error | null) => void
export type BeforeAdviceType = (joinPoint: JoinPoint) => void
export type AroundAdviceType = (joinPoint: ProceedJoinPoint) => any
export type AdviceKeys = keyof Advices
export type AdviceTypes = Advices[AdviceKeys]
export type Advice<T extends AdviceKeys> = Advices[T]

export interface Advices {
    after?: AfterAdviceType;
    afterReturning?: AfterReturningAdviceType;
    afterThrowing?: AfterThrowAdviceType;
    before?: BeforeAdviceType;
    around?: AroundAdviceType;
}

// 创建advice
const createAdvice = (type: AdviceKeys) => (options: PointcutOpts) => {
    let pointcutName: string = options.value
    let metaKey = 'MetaData:pointcuts'
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
        let fun = descriptor.value
        let pointcuts = Reflect.getMetadata(metaKey, target)
        let pt = pointcuts.get(pointcutName)
        pt.registAdvice(type, fun)
        pointcuts.set(pointcutName, pt)
        Reflect.defineMetadata(metaKey, pointcuts, target)

        return descriptor
    }
}

export const Before: AdviceDecorator = createAdvice('before')
export const After: AdviceDecorator = createAdvice('after')
export const Around: AdviceDecorator = createAdvice('around')
export const AfterReturning: AdviceDecorator = createAdvice('afterReturning')
export const AfterThrowing: AdviceDecorator = createAdvice('afterThrowing')
