import { Aspect, Before, After, Pointcut, Around, AfterReturning, AfterThrowing, Weaving } from '../../src/index'

describe('advices with static method', () => {
    let order = -1

    @Aspect()
    class StaticMethodAspect {
        @Pointcut('static')
        get pointcut() {
            return 'StaticMethod.fetch*'
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('The order of Before adive is 1', () => {
                expect(++order).toBe(1)
            })

            test('Before advice JoinPoint', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('StaticMethod')
                expect(jp.thisArg === StaticMethod).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })

        }

        @AfterReturning({ value: 'pointcut' })
        afterReturningAction(jp, rst) {
            test('The order of AfterReturning adive is 2', () => {
                expect(++order).toBe(2)
            })

            test('AfterReturning Adive JoinPoint', () => {
                expect(jp.target.name).toBe('StaticMethod')
            })

            test('The parameter result of AfterReturning Advice is 456', () => {
                expect(rst).toBe(456)
            })
        }

        @After({ value: 'pointcut' })
        afterAction(jp, rst) {
            test('The order of After Adive is 3', () => {
                expect(++order).toBe(3)
            })

            test('After Adive JoinPoint', () => {
                expect(jp.target.name).toBe('StaticMethod')
            })

            test('The parameter result of After Advice is 456', () => {
                expect(rst).toBe(456)
            })
        }

        @Around({ value: 'pointcut' })
        aroundAction(jp) {
            test('The order of Around adive is 0 -- (before proceed)', () => {
                expect(++order).toBe(0)
            })

            let rst = jp.proceed()

            test('The order of Around adive is 4 -- (after proceed)', () => {
                expect(++order).toBe(4)
            })

            test('Around adive JoinPoint', () => {
                expect(jp.target.name).toBe('StaticMethod')
                expect(typeof jp.proceed).toBe('function')
            })

            test('The result of Proceed Function is 456', () => {
                expect(rst).toBe(456)
            })
            return rst
        }
    }

    @Weaving()
    class StaticMethod {
        static fetchSomething() {

            return 456
        }
    }

    StaticMethod.fetchSomething()
})
