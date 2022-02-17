import 'reflect-metadata'
import { PointcutClass, PointcutType } from './pointcut'
import { JoinPoint, ProceedingJoinPoint } from './joinpoint'
import {
    AfterAdviceType,
    AfterReturningAdviceType,
    AfterThrowAdviceType,
    BeforeAdviceType,
    AroundAdviceType
} from './advice'

export interface WeavingOpts {
    blackList?: Array<string>
    namespace?: string
}

const isPromise = (fn: any) => !!fn && typeof fn.then === 'function' && fn[Symbol.toStringTag] === 'Promise'

/**
 * Aspects管理类
 */
export const AOP: Array<any> = []

/**
 * Aspect装饰器
 * @param target
 */
export const Aspect =
    (opts: { order?: number } = {}) =>
    (target) => {
        const { order } = opts
        if (!(order === undefined)) {
            target.order = order
        }

        AOP.push(target)
    }

/**
 * 织入装饰器
 * @returns
 */
export const Weaving: (opts?: WeavingOpts) => ClassDecorator =
    (opts?: WeavingOpts) =>
    <TFunction extends Function>(target: TFunction) => {
        const { namespace = '' } = opts || {}
        const proto = target.prototype
        const props = Object.getOwnPropertyNames(target.prototype)
        const statics = Object.getOwnPropertyNames(target)
        const originTarget = target

        // 排序
        const aspects = AOP.sort((a, b) => a.order - b.order)

        // 织入切点
        const weavePointcut = (keys: string[], ctx: any, type: PointcutType) =>
            keys.forEach((prop: string) => {
                const method = ctx[prop]
                if (typeof method === 'function') {
                    // 获取上一次执行缓存的pointcuts
                    let pointcuts: any[] = Reflect.getMetadata(
                        'MetaData:pointcuts',
                        type === 'static' ? target : target.prototype
                    )

                    if (!pointcuts || !pointcuts.length) {
                        pointcuts = aspects.reduce((rst, aspect) => {
                            const pts = Reflect.getMetadata('MetaData:pointcuts', aspect.prototype)

                            if (!pts) {
                                return rst
                            }

                            return rst.concat(
                                Array.from<PointcutClass>(pts.values()).filter(
                                    (pointcut) =>
                                        pointcut &&
                                        pointcut.matches({
                                            type,
                                            namespace,
                                            className: target.name,
                                            methodName: prop
                                        })
                                )
                            )
                        }, [])

                        Reflect.defineMetadata(
                            'Metadata:pointcuts',
                            pointcuts,
                            type === 'static' ? target : target.prototype
                        )
                    }

                    if (!!pointcuts && !!pointcuts.length) {
                        Object.defineProperty(ctx, prop, {
                            writable: true,
                            enumerable: true,
                            value(...args: any[]) {
                                const thisArg = this
                                const joinpint = new JoinPoint({
                                    target: originTarget,
                                    thisArg: this,
                                    method,
                                    args
                                })
                                let index = -1
                                const len = pointcuts.length

                                // 多切点递归执行
                                const executeChain = () => {
                                    index++
                                    const pointcut: any = pointcuts[index]

                                    if (pointcut instanceof PointcutClass) {
                                        const before = pointcut.findAdvice('before') as BeforeAdviceType
                                        const after = pointcut.findAdvice('after') as AfterAdviceType
                                        const around = pointcut.findAdvice('around') as AroundAdviceType
                                        const afterThrowing = pointcut.findAdvice(
                                            'afterThrowing'
                                        ) as AfterThrowAdviceType
                                        const afterReturning = pointcut.findAdvice(
                                            'afterReturning'
                                        ) as AfterReturningAdviceType

                                        const proceed = () => {
                                            let rst: any = null
                                            let bfrst: any = null
                                            let err: Error | null = null

                                            if (before) {
                                                bfrst = before(joinpint)
                                            }

                                            try {
                                                if (index < len - 1) {
                                                    rst = executeChain()
                                                } else {
                                                    rst = Reflect.apply(method, thisArg, args)
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
                                            }

                                            if (err) {
                                                afterThrowing && afterThrowing(joinpint, err)
                                            } else {
                                                afterReturning && afterReturning(joinpint, rst)
                                            }

                                            after && after(joinpint, rst, err)

                                            return rst
                                        }

                                        if (around) {
                                            const proceedJoinpint = new ProceedingJoinPoint({
                                                target: joinpint.target,
                                                proceed,
                                                method: joinpint.method,
                                                args: joinpint.args,
                                                thisArg: joinpint.thisArg
                                            })
                                            return around(proceedJoinpint)
                                        }

                                        return proceed()
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
