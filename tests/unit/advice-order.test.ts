import { Aspect, Before, After, Pointcut, Around, AfterReturning, Weaving } from '../../src/index'

let order = 0

describe('The order of different aspect', () => {
    @Aspect()
    class OrderAspect {
        static order = 1
        @Pointcut()
        get pointcut() {
            return 'ProtoMethod.fetch*'
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('Thte order of the before adive of OrderAspect is 2', () => {
                expect(++order).toBe(2)
            })
        }

        @AfterReturning({ value: 'pointcut' })
        afterReturningAction() {
            test('Thte order of the after returning adive of OrderAspect is 8', () => {
                expect(++order).toBe(8)
            })
        }

        @After({ value: 'pointcut' })
        afterAction() {
            test('Thte order of the after adive of OrderAspect is 9', () => {
                expect(++order).toBe(9)
            })
        }

        @Around({ value: 'pointcut' })
        aroundAction(jp) {
            test('Thte order of the before around adive of OrderAspect is 1', () => {
                expect(++order).toBe(1)
            })
            const rst = jp.proceed()
            test('Thte order of the after around adive of OrderAspect is 10', () => {
                expect(++order).toBe(10)
            })
            return rst
        }
    }

    @Aspect()
    class OrderAspect1 {
        static order = 2
        @Pointcut()
        get pointcut() {
            return 'ProtoMethod.fetch*'
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('Thte order of the before adive of OrderAspect1 is 4', () => {
                expect(++order).toBe(4)
            })
        }

        @AfterReturning({ value: 'pointcut' })
        afterReturningAction(jp, rst) {
            test('Thte order of the afterreturning adive of OrderAspect1 is 5', () => {
                expect(++order).toBe(5)
            })
        }

        @After({ value: 'pointcut' })
        afterAction(jp, rst) {
            test('Thte order of the after adive of OrderAspect1 is 6', () => {
                expect(++order).toBe(6)
            })
        }

        @Around({ value: 'pointcut' })
        aroundAction(jp) {
            test('Thte order of the before around adive of OrderAspect1 is 3', () => {
                expect(++order).toBe(3)
            })
            const rst = jp.proceed()
            test('Thte order of the after around adive of OrderAspect1 is 7', () => {
                expect(++order).toBe(7)
            })
            return rst
        }
    }

    @Weaving()
    class ProtoMethod {
        fetchSomething() {
            return 123
        }
    }

    const pm = new ProtoMethod()
    pm.fetchSomething()
})
