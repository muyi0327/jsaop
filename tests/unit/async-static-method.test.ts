import { Aspect, Before, After, Pointcut, Around, AfterReturning, AfterThrowing, Weaving } from '../../src/index'

describe('advices with async static method', () => {
    let o = ['BeforeAround', 'Before', 'AfterReturning', 'After', 'AfterAround']
    test(`shold advices order is ${o.join(', ')}`, async () => {
        let orders: Array<string> = []
        @Aspect()
        class AsyncMethodAspect {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod.fetch*'
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
        class AsyncMethod {
            static async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await AsyncMethod.fetchSomething()
        expect(orders.join()).toBe(o.join())
    })

    test(`Check the parameters joinpoint of Before Advices`, async () => {
        let _jp
        @Aspect()
        class AsyncMethodAspect1 {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod1.fetch*'
            }

            @Before({ value: 'pointcut' })
            beforeAction(jp) {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod1')
                expect(jp.thisArg === AsyncMethod1).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }
        }

        @Weaving()
        class AsyncMethod1 {
            static async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await AsyncMethod1.fetchSomething()


    })

    test(`Check the parameters joinpoint and result of AfterReturning Advices`, async () => {
        let _jp, _rst
        @Aspect()
        class AsyncMethodAspect2 {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod2.fetch*'
            }

            @AfterReturning({ value: 'pointcut' })
            afterReturningAction(jp, rst) {
                expect(rst).toBe(456)
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod2')
                expect(jp.thisArg === AsyncMethod2).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }
        }

        @Weaving()
        class AsyncMethod2 {
            static async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await AsyncMethod2.fetchSomething()


    })

    test(`Check the parameters joinpoint and result of After Advices`, async () => {
        let _jp, _rst
        @Aspect()
        class AsyncMethodAspect3 {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod3.fetch*'
            }

            @After({ value: 'pointcut' })
            afterAction(jp, rst) {
                expect(rst).toBe(456)
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod3')
                expect(jp.thisArg === AsyncMethod3).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }
        }

        @Weaving()
        class AsyncMethod3 {
            static async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await AsyncMethod3.fetchSomething()


    })

    test(`Check the parameters joinpoint and result of Around Advices`, async () => {
        @Aspect()
        class AsyncMethodAspect5 {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod5.fetch*'
            }

            @Around({ value: 'pointcut' })
            async aroundAction(jp) {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod5')
                expect(jp.thisArg === AsyncMethod5).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
                expect(jp.proceed instanceof Function).toBe(true)
                return jp.proceed()
            }
        }

        @Weaving()
        class AsyncMethod5 {
            static async fetchSomething() {
                return await new Promise((resolve) => {
                    setTimeout(() => resolve(456), 30)
                })
            }
        }

        await AsyncMethod5.fetchSomething()


    })

    test('Check the parameters err and result of AfterThrowing Advice', async () => {
        @Aspect()
        class AsyncMethodAspect4 {
            @Pointcut('static')
            get pointcut() {
                return 'AsyncMethod4.fetch*'
            }

            @Before({ value: 'pointcut' })
            beforeAction(jp) {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod4')
                expect(jp.thisArg === AsyncMethod4).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }

            @AfterThrowing({ value: 'pointcut' })
            afterThrowingAction(jp, err) {
                expect(err).toEqual('error')

                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod4')
                expect(jp.thisArg === AsyncMethod4).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }

            @After({ value: 'pointcut' })
            afterAction(jp, rst, err) {
                expect(err).toEqual('error')
                expect(rst).toBeFalsy()

                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('AsyncMethod4')
                expect(jp.thisArg === AsyncMethod4).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            }
        }

        @Weaving()
        class AsyncMethod4 {
            static fetchSomething() {
                return new Promise((resolve) => {
                    throw 'error'
                })
            }
        }

        AsyncMethod4.fetchSomething()
    })
})
