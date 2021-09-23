import {
    Aspect,
    Before,
    After,
    Pointcut,
    Around,
    AfterReturning,
    AfterThrowing,
    Weaving
} from '../../src/index'

describe('advices with prototype method', () => {
    let order = -1

    @Aspect()
    class ProtoMethodAspect {
        @Pointcut()
        get pointcut() {
            return 'ProtoMethod.fetch*'
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('Thte order of Before Adive is 1', () => {
                expect(++order).toBe(1)
            })

            test('Before advice JoinPoint', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('ProtoMethod')
                expect(jp.thisArg instanceof ProtoMethod).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }

        @AfterReturning({ value: 'pointcut' })
        afterReturningAction(jp, rst) {
            test('The order of AfterReturning Adive is 2', () => {
                expect(++order).toBe(2)
            })

            test('AfterReturning Adive JoinPoint', () => {
                expect(jp.target.name).toBe('ProtoMethod')
                expect(jp.args.length).toBe(0)
                expect(jp.thisArg instanceof ProtoMethod).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })

            test('The parameter result of AfterReturning Adive is 123', () => {
                expect(rst).toBe(123)
            })
        }

        @After({ value: 'pointcut' })
        afterAction(jp, rst) {
            test('The order After Adive is 3', () => {
                expect(++order).toBe(3)
            })

            test('After Adive JoinPoint', () => {
                expect(jp.target.name).toBe('ProtoMethod')
            })

            test('The parameter result of After adive is 123', () => {
                expect(rst).toBe(123)
            })
        }

        @Around({ value: 'pointcut' })
        aroundAction(jp) {
            test('The order Around Adive is 0 -- (before proceed)', () => {
                expect(++order).toBe(0)
            })

            let rst = jp.proceed()

            test('The Around Adive is 4 -- (after proceed)', () => {
                expect(++order).toBe(4)
            })

            test('Around Adive JoinPoint', () => {
                expect(jp.target.name).toBe('ProtoMethod')
                expect(typeof jp.proceed).toBe('function')
            })

            test('The result of Proceed Function is 123', () => {
                expect(rst).toBe(123)
            })

            return rst
        }
    }

    @Weaving()
    class ProtoMethod {
        fetchSomething() {
            return 123
        }

        doSomething() {
            JSON.parse('{name:123}')
            return 456
        }
    }

    var pm = new ProtoMethod()
    pm.fetchSomething()

    test('Check the parameters(joinpoint, result, error) of AfterThrowing Advice', () => {
        @Aspect()
        class ProtoMethodAspect1 {
            @Pointcut()
            get pointcut() {
                return 'ProtoMethod1.fetch*'
            }

            @AfterThrowing({ value: 'pointcut' })
            afterThrowingAction(jp, err) {
                expect(jp.args.length).toEqual(0)
                expect(jp.target.name).toBe('ProtoMethod1')
                expect(jp.thisArg instanceof ProtoMethod1).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
                expect(err).toEqual('error')
            }
        }

        @Weaving()
        class ProtoMethod1 {
            fetchSomething() {
                throw 'error'
            }
        }

        new ProtoMethod1().fetchSomething()
    })
})
