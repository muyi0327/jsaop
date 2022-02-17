export interface JoinPointType {
    target: any
    args: any[]
    thisArg: any
    method: any
    timestamp?: string | number
}

export interface ProceedingJoinPointType extends JoinPointType {
    proceed: () => any
}

/**
 * 连接点类
 */
export class JoinPoint {
    public readonly target: any // 目标类

    public readonly args: any[] = [] // 执行方法参数

    public readonly thisArg: any // 方法上下文

    public readonly method: any // 成员

    public timestamp: string | number // 成员

    constructor(jp: JoinPointType) {
        const { target, args, thisArg, method, timestamp = '' } = jp
        this.target = target
        this.args = args
        this.thisArg = thisArg
        this.method = method
        this.timestamp = timestamp
    }

    public setTimestamp(timestamp) {
        this.timestamp = timestamp
    }
}

export class ProceedingJoinPoint extends JoinPoint {
    public proceed!: Function //

    constructor(pjp: ProceedingJoinPointType) {
        const { target, args, thisArg, method, proceed } = pjp
        super({ target, args, thisArg, method })
        this.proceed = proceed
    }
}
