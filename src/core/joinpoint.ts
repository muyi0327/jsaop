export interface JoinPointType {
    target: any
    args: any[]
    thisArg: any
    value: any
}

export interface ProceedJoinPointType extends JoinPointType {
    proceed: () => any
}

/**
 * 连接点类
 */
export class JoinPoint {
    public readonly target: any // 目标类
    public readonly args: any[] = [] // 执行方法参数
    public readonly thisArg: any // 方法上下文
    public readonly value: any // 成员

    constructor(jp: JoinPointType) {
        let { target, args, thisArg, value } = jp
        this.target = target
        this.args = args
        this.thisArg = thisArg
        this.value = value
    }
}

export class ProceedJoinPoint extends JoinPoint {
    public proceed!: Function //
    constructor(pjp: ProceedJoinPointType) {
        let { target, args, thisArg, value, proceed } = pjp
        super({ target, args, thisArg, value })
        this.proceed = proceed
    }
}
