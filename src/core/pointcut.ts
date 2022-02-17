import 'reflect-metadata'
import { AdviceKeys, Advice, AdviceTypes, Advices } from './advice'

type PointcutMatches = {
    type?: PointcutType
    namespace?: string
    className?: string
    methodName?: string
}
export type PointcutType = 'proto' | 'static' | '*'
export interface PointcutClassType {
    rules: PointcutRules
    advices: Advices
    matches: (ctx: PointcutMatches) => boolean
    registAdvice<T extends AdviceKeys>(type: T, advice: Advice<T>): void
    findAdvice(type: AdviceKeys): AdviceTypes
    normalizedRules(rules: PointcutRules): Array<PointcutRuleType | RegExp | string>
    toRegRule(rule: string): void
}

export type PointcutMap = Map<string, PointcutClass>

export type PointcutRuleType = {
    type: PointcutType
    namespace: RegExp | string
    className: RegExp | string
    methodName: RegExp | string
}

export type PointcutRules = string | RegExp | PointcutRuleType | Array<PointcutRuleType | RegExp | string>

/**
 * Pointcut类
 */
export class PointcutClass implements PointcutClassType {
    rules: PointcutRules = '' // 类匹配规则
    advices: Advices = {} // 对应的aspect
    constructor(rules: PointcutRules) {
        this.rules = this.normalizedRules(rules)
    }

    /**
     * 注册advice
     * @param type {AdviceKeys}
     * @param advice {Aspect[AdviceKeys]}
     */
    registAdvice<T extends AdviceKeys>(type: T, advice: Advice<T>) {
        this.advices[type] = advice
    }

    /**
     * 查找advice
     * @param type {AdviceKeys}
     * @returns Aspect[AdviceKeys]
     */
    findAdvice<T extends AdviceKeys>(type: T): Advice<T> {
        return this.advices[type]
    }

    /**
     * 格式化rules
     * @param rules 切点匹配规则
     * @returns
     */
    normalizedRules(rules: PointcutRules) {
        let _rules = rules
        if (!rules) {
            throw new Error('rules is requried')
        }

        if (typeof rules === 'string') {
            _rules = (rules as string).split('&&').map((r) => r.trim())
        }

        if (!Array.isArray(rules)) {
            _rules = [rules]
        }

        _rules = (_rules as Array<PointcutRuleType | RegExp | string>).map((rule) => {
            if (rule instanceof RegExp) {
                return rule
            }

            if (typeof rule === 'string') {
                return this.toRegRule(rule)
            }

            if (!rule.className) {
                throw new Error('The property className of PointcutRuleType is required')
            }

            if (!rule.methodName) {
                throw new Error('The property methodName of PointcutRuleType is required')
            }

            'type,namespace,className,methodName'.split(',').forEach((k) => {
                if (typeof rule[k] === 'string') {
                    rule[k] = this.toRegRule(rule[k])
                }
            })

            return rule
        })

        return _rules
    }

    toRegRule(rule: string) {
        const reg = new RegExp(`^${rule.replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*')}$`, 'g')

        return reg
    }

    eq(type, rules) {
        return rules === this.rules
    }

    /**
     * 判断类及类方法匹配
     * @param className {string} 类名称
     * @param propKey {string} 类方法
     * @returns Boolean
     */
    matches(ctx: PointcutMatches): boolean {
        const { namespace = '', className = '', methodName = '', type = 'proto' } = ctx
        const ctxStr = `${namespace ? `${namespace}:` : ''}${className}.${methodName}`
        if (!className || !methodName) return false

        return (this.rules as Array<PointcutRuleType | RegExp | string>).some((rule) => {
            if (rule instanceof RegExp) {
                if (type === 'proto') {
                    return rule.test(`proto ${ctxStr}`) || rule.test(ctxStr)
                }
                if (type === 'static') {
                    return rule.test(`static ${ctxStr}`)
                }
            }

            rule = rule as PointcutRuleType
            return (
                (!rule.type || rule.type === type) &&
                (!rule.namespace || (rule.namespace as RegExp).test(namespace)) &&
                (!rule.className || (rule.className as RegExp).test(className)) &&
                (!rule.methodName || (rule.methodName as RegExp).test(methodName))
            )
        })
    }
}

/**
 * 切点装饰器
 * @returns void
 */
export const Pointcut = () => (target: any, propKey: string, descriptor: PropertyDescriptor) => {
    const pointcutRules = target[propKey]

    const metaKey = `MetaData:pointcuts`
    let pointcuts: PointcutMap = Reflect.getMetadata(metaKey, target)
    if (!pointcuts) {
        pointcuts = new Map<string, PointcutClass>()
    }

    const pointCut: PointcutClass = new PointcutClass(pointcutRules)
    pointcuts.set(propKey, pointCut)

    Reflect.defineMetadata(metaKey, pointcuts, target)

    return descriptor
}
