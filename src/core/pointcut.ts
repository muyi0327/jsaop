import 'reflect-metadata'
import { AdviceKeys, Advice, AdviceTypes, Advices } from './advice'

type PointcutMatches = {
    namespace?: string
    className?: string
    methodName?: string
}
export type PointcutType = 'proto' | 'static'
export interface PointcutClassType {
    rules: PointcutRules
    advices: Advices
    matches: (ctx: PointcutMatches) => boolean
    registAdvice<T extends AdviceKeys>(type: T, advice: Advice<T>): void
    findAdvice(type: AdviceKeys): AdviceTypes
    normalizedRules(rules: PointcutRules): Array<PointcutRuleType | RegExp | string>
    toRegRule(rule: string): void
}

export type PointcutMap = { [s: string]: PointcutClass }
export type PointcutRuleType = {
    namespace: RegExp | string
    className: RegExp | string
    methodName: RegExp | string
}
export type PointcutRules = string | RegExp | PointcutRuleType | Array<PointcutRuleType | RegExp | string>

/**
 * Pointcut类
 */
export class PointcutClass implements PointcutClassType {
    rules: PointcutRules // 类匹配规则
    type: string // 成员类型
    advices: Advices = {} // 对应的aspect

    constructor(rules: PointcutRules, type: PointcutType = 'proto') {
        this.rules = this.normalizedRules(rules)
        this.type = type
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
    findAdvice(type: AdviceKeys): AdviceTypes {
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

            if (typeof rule == 'string') {
                return this.toRegRule(rule)
            }

            if (!rule['className']) {
                throw new Error('The property className of PointcutRuleType is required')
            }

            if (!rule['methodName']) {
                throw new Error('The property methodName of PointcutRuleType is required')
            }

            'namespace,className,methodName'.split(',').forEach((k) => {
                if (typeof rule[k] === 'string') {
                    rule[k] = this.toRegRule(rule[k])
                }
            })

            return rule
        })

        return _rules
    }

    toRegRule(rule: string) {
        let reg: RegExp
        if (rule[0] === '?') {
            reg = new RegExp(
                '^[_\\w]' + rule.substring(1).replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') + '$',
                'g'
            )
        } else if (rule[0] === '*') {
            reg = new RegExp(
                '^([_\\w]?|[_\\w][_\\w\\d]*)' +
                    rule.substring(1).replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') +
                    '$',
                'g'
            )
        } else {
            reg = new RegExp('^' + rule.replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') + '$', 'g')
        }

        return reg
    }

    eq(type, rules) {
        return type === this.type && rules === this.rules
    }

    /**
     * 判断类及类方法匹配
     * @param className {string} 类名称
     * @param propKey {string} 类方法
     * @returns Boolean
     */
    matches(ctx: PointcutMatches): boolean {
        let { namespace = '', className = '', methodName = '' } = ctx
        let ctxStr = `${namespace ? namespace + ':' : ''}${className}.${methodName}`
        if (!className || !methodName) return false

        return (this.rules as Array<PointcutRuleType | RegExp | string>).some((rule) => {
            if (rule instanceof RegExp) return rule.test(ctxStr)
            rule = rule as PointcutRuleType
            return (
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
export const Pointcut =
    (type: PointcutType = 'proto') =>
    (target: any, propKey: string, descriptor: PropertyDescriptor) => {
        let pointcutRules = target[propKey]

        let metaKey: string = `MetaData:pointcuts`
        let pointcuts: Map<string, PointcutClass> = Reflect.getMetadata(metaKey, target)
        if (!pointcuts) {
            pointcuts = new Map()
        }

        let pointCut: PointcutClass = new PointcutClass(pointcutRules, type)
        pointcuts.set(propKey, pointCut)

        Reflect.defineMetadata(metaKey, pointcuts, target)

        return descriptor
    }
