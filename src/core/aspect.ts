import { PointcutClass, PointcutMap, PointcutType } from './pointcut'
import { JoinPoint, ProceedJoinPoint } from './joinpoint'
import { AfterAdviceType, AfterReturningAdviceType, AfterThrowAdviceType, BeforeAdviceType, AroundAdviceType } from './advice'
export type AspectMap = { [s: string]: PointcutMap }
export interface WeavingOpts {
    blackList?: Array<string>;
    namespace?: string;
}

const isPromise = (fn) => !!fn && typeof fn.then === 'function' && fn[Symbol.toStringTag] === 'Promise'

/**
 * Aspects管理类
 */
export class AOP {
    public aspects: AspectMap = {}

    /**
     * 注册aspect
     * @param name 
     */
    regist(name: string) {
        let pointcuts: PointcutMap = {}
        this.aspects[name] = pointcuts
    }

    /**
     * 判断是否已经注册aspect
     * @param name 
     * @returns 
     */
    has(name: string): boolean {
        return this.aspects.hasOwnProperty(name)
    }

    /**
     * 查找aspect
     * @param name 
     * @returns 
     */
    get(name: string): PointcutMap | undefined {
        return this.aspects[name]
    }

    /**
     * 清楚所以aspect
     */
    clear() {
        this.aspects = {}
    }

    /**
     * aspects迭代器
     * @param cb 
     */
    forEach(cb) {
        Object.keys(this.aspects).forEach((i) => {
            let aspect = this.aspects[i]
            cb(aspect)
        })
    }

    /**
     * 查询符合条件的切点
     * @param cb {(pointcut: PointcutMap) => boolean} 过滤函数;
     * @returns PointcutMap[]
     */
    fitler(cb: (pointcut: PointcutClass) => boolean): PointcutClass[] {
        let p: PointcutClass[] = []
        this.forEach((aspect: PointcutMap) => {
            Object.keys(aspect).forEach((i) => {
                let pointcut = aspect[i]
                if (cb(pointcut)) {
                    p.push(pointcut)
                }
            })
        })

        return p
    }
}

// 全局唯一aspects
export const OriginAspects = new AOP()

/**
 * Aspect装饰器
 * @param target 
 */
export const Aspect: () => ClassDecorator = () => (target) => {
    let name: string = target.name
    if (!OriginAspects.has(name)) {
        OriginAspects.regist(name)
    }
}


/**
 * 织入装饰器
 * @returns 
 */
export const Weaving: (opts?: WeavingOpts) => ClassDecorator = (opts?: WeavingOpts) => <TFunction extends Function>(target: TFunction) => {
    let { namespace = '', blackList = [] } = opts || {}
    let proto = target.prototype
    let props = Object.getOwnPropertyNames(target.prototype)
    let statics = Object.getOwnPropertyNames(target)
    let originTarget = target

    //织入切点
    const weavePointcut = (keys: string[], ctx: any, type: PointcutType) => keys.forEach((prop: string) => {
        // let value = ctx[prop]
        // if (typeof value === 'function') {
        let pointcuts: PointcutClass[] = OriginAspects.fitler((pointcut) => {
            return pointcut && pointcut.type === type && pointcut.matches({ namespace, className: target.name, methodName: prop })
        })

        if (!!pointcuts && !!pointcuts.length) {
            let value = ctx[prop]
            Object.defineProperty(ctx, prop, {
                writable: true,
                enumerable: true,
                value: function () {
                    let args = [].slice.call(arguments)
                    let thisArg = this
                    let joinpint = new JoinPoint({ target: originTarget, thisArg: this, value, args })
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
                            let afterReturning = pointcut.findAdvice('afterReturning') as AfterReturningAdviceType

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
                                        rst = value.apply(thisArg, args)
                                    }
                                } catch (error) {
                                    err = error
                                }

                                if (isPromise(rst)) {
                                    return new Promise((resolve, reject) => {
                                        rst.then((res: any) => {
                                            resolve(res)
                                            afterReturning && afterReturning(joinpint, res)
                                            after && after(joinpint, res, null)
                                        }, error => {
                                            err = error
                                            reject(err)
                                            afterThrowing && afterThrowing(joinpint, err)
                                            after && after(joinpint, null, err)
                                        })
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
        //}
    })

    // 织入原型切点
    weavePointcut(props, proto, 'proto')
    // 织入静态切点
    weavePointcut(statics, target, 'static')

    return target
}
