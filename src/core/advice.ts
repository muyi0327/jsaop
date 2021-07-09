import { JoinPoint, ProceedJoinPoint } from "./joinpoint"
import { PointcutClass, PointcutMap } from "./pointcut"
import { OriginAspects, AspectMap } from './aspect'

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
    let pointcutKey: string = options.value

    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {

        let fun = descriptor.value
        let name: string = target.constructor.name
        let pointcut: PointcutClass | undefined | null
        let aspect: PointcutMap | undefined

        if (aspect = OriginAspects.get(name)) {
            if (pointcut = aspect[pointcutKey]) {
                pointcut.registAdvice(type, fun)
            }
        }

        return descriptor
    }
}

export const Before: AdviceDecorator = createAdvice('before')
export const After: AdviceDecorator = createAdvice('after')
export const Around: AdviceDecorator = createAdvice('around')
export const AfterReturning: AdviceDecorator = createAdvice('afterReturning')
export const AfterThrowing: AdviceDecorator = createAdvice('afterThrowing')
