import 'reflect-metadata'
import { PointcutClass, PointcutMap, PointcutType } from './pointcut'
import { JoinPoint, ProceedJoinPoint } from './joinpoint'
import {
    AfterAdviceType,
    AfterReturningAdviceType,
    AfterThrowAdviceType,
    BeforeAdviceType,
    AroundAdviceType
} from './advice'

export type AspectMap = { [s: string]: PointcutMap }

export interface WeavingOpts {
    blackList?: Array<string>
    namespace?: string
}

const isPromise = (fn) => !!fn && typeof fn.then === 'function' && fn[Symbol.toStringTag] === 'Promise'

/**
 * Aspects管理类
 */
export const AOP: Array<any> = []

/**
 * Aspect装饰器
 * @param target
 */
export const Aspect: () => ClassDecorator = () => (target) => {
    AOP.push(target)
}

/**
 * 织入装饰器
 * @returns
 */
export const Weaving: (opts?: WeavingOpts) => ClassDecorator =
    (opts?: WeavingOpts) =>
    <TFunction extends Function>(target: TFunction) => {
        let { namespace = '', blackList = [] } = opts || {}
        let proto = target.prototype
        let props = Object.getOwnPropertyNames(target.prototype)
        let statics = Object.getOwnPropertyNames(target)
        let originTarget = target

        //织入切点
        const weavePointcut = (keys: string[], ctx: any, type: PointcutType) =>
            keys.forEach((prop: string) => {
                let value = ctx[prop]
                if (typeof value === 'function') {
                    // 获取上一次执行缓存的pointcuts
                    let pointcuts: any[] = Reflect.getMetadata('MetaData:pointcuts', target)

                    if (!pointcuts || !pointcuts.length) {
                        pointcuts = AOP.reduce((rst, aspect) => {
                            let pts = Reflect.getMetadata('MetaData:pointcuts', aspect.prototype)

                            if (!pts) {
                                return rst
                            }

                            return rst.concat(
                                Array.from<PointcutClass>(pts.values()).filter(
                                    (pointcut) =>
                                        pointcut &&
                                        pointcut.type === type &&
                                        pointcut.matches({
                                            namespace,
                                            className: target.name,
                                            methodName: prop
                                        })
                                )
                            )
                        }, [])

                        Reflect.defineMetadata('Metadata:pointcuts', pointcuts, target)
                    }

                    if (!!pointcuts && !!pointcuts.length) {
                        let value = ctx[prop]
                        Object.defineProperty(ctx, prop, {
                            writable: true,
                            enumerable: true,
                            value: function () {
                                let args = [].slice.call(arguments)
                                let thisArg = this
                                let joinpint = new JoinPoint({
                                    target: originTarget,
                                    thisArg: this,
                                    value,
                                    args
                                })
                                let index = -1
                                let len = pointcuts.length

                                // 多切点递归执行
                                const executeChain = () => {
                                    index++
                                    let pointcut: any = pointcuts[index]

                                    if (pointcut instanceof PointcutClass) {
                                        let before = pointcut.findAdvice('before') as BeforeAdviceType
                                        let after = pointcut.findAdvice('after') as AfterAdviceType
                                        let around = pointcut.findAdvice('around') as AroundAdviceType
                                        let afterThrowing = pointcut.findAdvice('afterThrowing') as AfterThrowAdviceType
                                        let afterReturning = pointcut.findAdvice(
                                            'afterReturning'
                                        ) as AfterReturningAdviceType

                                        const proceed = () => {
                                            let rst: any = null
                                            let err: Error | null = null

                                            if (before) {
                                                before(joinpint)
                                            }

                                            try {
                                                if (index < len - 1) {
                                                    rst = executeChain()
                                                } else {
                                                    rst = Reflect.apply(value, thisArg, args)
                                                }
                                            } catch (error: any) {
                                                err = error
                                            }

                                            if (isPromise(rst)) {
                                                return new Promise((resolve, reject) => {
                                                    rst.then(
                                                        (res: any) => {
                                                            resolve(res)
                                                            afterReturning && afterReturning(joinpint, res)
                                                            after && after(joinpint, res, null)
                                                        },
                                                        (error) => {
                                                            err = error
                                                            reject(err)
                                                            afterThrowing && afterThrowing(joinpint, err)
                                                            after && after(joinpint, null, err)
                                                        }
                                                    )
                                                })
                                            } else {
                                                if (err) {
                                                    afterThrowing && afterThrowing(joinpint, err)
                                                } else {
                                                    afterReturning && afterReturning(joinpint, rst)
                                                }

                                                after && after(joinpint, rst, err)

                                                return rst
                                            }
                                        }

                                        if (around) {
                                            let proceedJoinpint = new ProceedJoinPoint({
                                                target: joinpint.target,
                                                proceed,
                                                value: joinpint.value,
                                                args: joinpint.args,
                                                thisArg: joinpint.thisArg
                                            })
                                            return around(proceedJoinpint)
                                        } else {
                                            return proceed()
                                        }
                                    }
                                }

                                return executeChain()
                            }
                        })
                    }
                }
            })

        // 织入原型切点
        weavePointcut(props, proto, 'proto')
        // 织入静态切点
        weavePointcut(statics, target, 'static')

        return target
    }
