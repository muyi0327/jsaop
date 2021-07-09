import { Aspect, Before, After, Pointcut, Around, AfterReturning, AfterThrowing, Weaving } from '../../src/index'

describe('advices with async prototype method', () => {
    let o = ['BeforeAround', 'Before', 'AfterReturning', 'After', 'AfterAround']
    test(`shold advices order is ${o.join(', ')}`, async () => {
        let orders: Array<string> = []
        @Aspect()
        class AsyncProtoMethodAspect {
            @Pointcut()
            get pointcut() {
                return 'AsyncProtoMethod.fetch*'
            }

            @Before({ value: 'pointcut' })
            beforeAction(jp) {
                orders.push('Before')
            }

            @AfterReturning({ value: 'pointcut' })
            afterReturningAction(jp, rst) {
                orders.push('AfterReturning')
            }

            @After({ value: 'pointcut' })
            afterAction(jp, rst) {
                orders.push('After')
            }

            @Around({ value: 'pointcut' })
            async aroundAction(jp) {
                orders.push('BeforeAround')
                let rst = await jp.proceed()
                orders.push('AfterAround')
                return rst
            }
        }

        @Weaving()
        class AsyncProtoMethod {
            async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await new AsyncProtoMethod().fetchSomething()
        expect(orders.join()).toBe(o.join())
    })

    test(`The parameters joinpoint of Before Advices`, async () => {
        let _jp
        @Aspect()
        class AsyncProtoMethodAspect1 {
            @Pointcut()
            get pointcut() {
                return 'AsyncProtoMethod1.fetch*'
            }

            @Before({ value: 'pointcut' })
            beforeAction(jp) {
                _jp = jp
            }
        }

        @Weaving()
        class AsyncProtoMethod1 {
            async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await new AsyncProtoMethod1().fetchSomething()

        expect(_jp.args.length).toBe(0)
        expect(_jp.target.name).toBe('AsyncProtoMethod1')
        expect(_jp.thisArg instanceof AsyncProtoMethod1).toBe(true)
        expect(_jp.value instanceof Function).toBe(true)
    })

    test(`The parameters joinpoint and result of AfterReturning Advices`, async () => {
        let _jp, _rst
        @Aspect()
        class AsyncProtoMethodAspect2 {
            @Pointcut()
            get pointcut() {
                return 'AsyncProtoMethod2.fetch*'
            }

            @AfterReturning({ value: 'pointcut' })
            afterReturningAction(jp, rst) {
                _jp = jp
                _rst = rst
            }
        }

        @Weaving()
        class AsyncProtoMethod2 {
            async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await new AsyncProtoMethod2().fetchSomething()

        expect(_rst).toBe(456)
        expect(_jp.args.length).toBe(0)
        expect(_jp.target.name).toBe('AsyncProtoMethod2')
        expect(_jp.thisArg instanceof AsyncProtoMethod2).toBe(true)
        expect(_jp.value instanceof Function).toBe(true)
    })

    test(`The parameters joinpoint and result of After Advices`, async () => {
        let _jp, _rst
        @Aspect()
        class AsyncProtoMethodAspect3 {
            @Pointcut()
            get pointcut() {
                return 'AsyncProtoMethod3.fetch*'
            }

            @After({ value: 'pointcut' })
            afterAction(jp, rst) {
                _jp = jp
                _rst = rst
            }
        }

        @Weaving()
        class AsyncProtoMethod3 {
            async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await new AsyncProtoMethod3().fetchSomething()

        expect(_rst).toBe(456)
        expect(_jp.args.length).toBe(0)
        expect(_jp.target.name).toBe('AsyncProtoMethod3')
        expect(_jp.thisArg instanceof AsyncProtoMethod3).toBe(true)
        expect(_jp.value instanceof Function).toBe(true)
    })

    test(`The parameters joinpoint and error of AfterThrowing Advices`, (done) => {
        let _err
        //expect.assertions(1)
        @Aspect()
        class AsyncProtoMethodAspect4 {
            @Pointcut()
            get pointcut() {
                return 'AsyncProtoMethod4.fetch*'
            }

            @AfterThrowing({ value: 'pointcut' })
            afterThrowingAction(jp, err) {
                _err = err
                //expect(err).toBe(true)
                expect(jp.args.length).toBe(0)
                // expect(_jp.target.name).toBe('AsyncProtoMethod4')
                // expect(_jp.thisArg === AsyncProtoMethod4).toBe(true)
                // expect(_jp.value instanceof Function).toBe(true)
            }
        }

        @Weaving()
        class AsyncProtoMethod4 {
            async fetchSomething() {
                return await new Promise((resolve, reject) => {
                    throw 'error'
                })
            }
        }

        new AsyncProtoMethod4().fetchSomething().catch(err => { done() })
    })
})
