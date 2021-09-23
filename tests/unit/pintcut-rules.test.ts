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

describe('Check the rules of PointcutClass', () => {
    @Aspect()
    class PointcutAspect {
        @Pointcut()
        get pointcut() {
            return 'PointcutClass.fetch*'
        }

        @Pointcut()
        get pointcut1() {
            return /^([\d\w][_./-\w\d]*[:]?)?PointcutClass.do[\w\d]+$/
        }

        @Pointcut()
        get pointcut2() {
            return {
                className: 'PointcutClass',
                methodName: 'submit*'
            }
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('Check the rules type of string', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass')
                expect(jp.thisArg instanceof PointcutClass).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }

        @Before({ value: 'pointcut1' })
        afterAction(jp) {
            test('Check the rules type of RegExp', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass')
                expect(jp.thisArg instanceof PointcutClass).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }

        @AfterReturning({ value: 'pointcut2' })
        afterReturningAction(jp) {
            test('Check the rules type of RuleType', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass')
                expect(jp.thisArg instanceof PointcutClass).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }
    }

    @Weaving()
    class PointcutClass {
        fetchSomething() {
            return 123
        }

        doSomething() {
            return 456
        }

        submitUser() {
            return 'success'
        }
    }

    new PointcutClass().fetchSomething()
    new PointcutClass().doSomething()
    new PointcutClass().submitUser()

    let time = -1
    @Aspect()
    class PointcutAspect1 {
        @Pointcut()
        get pointcut() {
            return 'PointcutClass1.fetch* && PointcutClass1.do*'
        }

        @Pointcut()
        get pointcut1() {
            return [`PointcutClass1.get*`, `PointcutClass1.set*`]
        }

        @Before({ value: 'pointcut' })
        beforeAction1(jp) {
            test(`Check the rules type of string and contain "&&"  (time:${++time})`, () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass1')
                expect(jp.thisArg instanceof PointcutClass1).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }

        @After({ value: 'pointcut1' })
        afterAction1(jp) {
            test(`Check the rules type of Array<RegExp | string> (time:${++time})`, () => {
                expect(jp.target.name).toBe('PointcutClass1')
                expect(jp.thisArg instanceof PointcutClass1).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }
    }

    @Weaving()
    class PointcutClass1 {
        name: string = ''
        fetchSomething() {
            return 123
        }

        doSomething() {
            return 456
        }

        getName() {
            return this.name
        }

        setName(name: string) {
            this.name = name
        }
    }

    let p = new PointcutClass1()

    p.fetchSomething()
    p.doSomething()
    p.setName('Tome')
    p.getName()

    @Aspect()
    class PointcutAspect2 {
        @Pointcut()
        get pointcut() {
            return 'com.fe.test:PointcutClass2.fetch*'
        }

        @Pointcut()
        get pointcut1() {
            return /^([\d\w][_./-\w\d]*[:]?)?PointcutClass2.do[\w\d]+$/
        }

        @Before({ value: 'pointcut' })
        beforeAction(jp) {
            test('Check the rules contain namespace, and rules type of string', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass2')
                expect(jp.thisArg instanceof PointcutClass2).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }

        @Before({ value: 'pointcut1' })
        afterAction(jp) {
            test('Check the rules contain namespace, and rules type of RegExp', () => {
                expect(jp.args.length).toBe(0)
                expect(jp.target.name).toBe('PointcutClass2')
                expect(jp.thisArg instanceof PointcutClass2).toBe(true)
                expect(jp.value instanceof Function).toBe(true)
            })
        }
    }

    @Weaving({ namespace: 'com.fe.test' })
    class PointcutClass2 {
        fetchSomething() {
            return 123
        }

        doSomething() {
            return 456
        }
    }

    let p1 = new PointcutClass2()
    p1.doSomething()
    p1.fetchSomething()
})
