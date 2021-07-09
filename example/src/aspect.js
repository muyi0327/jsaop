import { Aspect, Before, After, Pointcut, Around, AfterReturning, AfterThrowing, Weaving } from '@jsaop/jsaop'

@Aspect
class ProtoMethodAspect {
    @Pointcut()
    get pointcut() {
        return 'ProtoMethod.do*'
    }

    @Pointcut('static')
    get pointcut1() {
        return 'ProtoMethod.create*'
    }

    @Before({ value: 'pointcut' })
    beforeAction(jp) {
        console.log('before action', jp)
    }

    @AfterReturning({ value: 'pointcut' })
    afterReturningAction(jp, rst) {
        console.log('after returning action', jp, rst)
    }

    @AfterThrowing({ value: 'pointcut' })
    afterThrowingAction(jp, err) {
        console.log('after throwing action', jp, err)
    }

    @After({ value: 'pointcut' })
    afterAction(jp, rst) {
        console.log('after action', jp, rst)
    }

    @Around({ value: 'pointcut' })
    async aroundAction(jp) {
        console.log('before around action', jp)
        let rst = await jp.proceed()
        console.log('after around action', jp)
        return rst
    }


    @Before({ value: 'pointcut1' })
    beforeAction1(jp) {
        console.log('before1 action', jp)
    }

    @After({ value: 'pointcut1' })
    afterAction1(jp) {
        console.log('after1 action', jp)
    }
}

@Weaving()
class ProtoMethod {

    static createInstance() {
        return new ProtoMethod()
    }

    fetchSomething() {
        return new Promise((resolve) => {
            resolve(123)
            //throw 'error'
        })
    }

    doSomething() {
        //JSON.parse('{name:123}')
        return Promise.resolve(456)
    }
}


new ProtoMethod().doSomething()

ProtoMethod.createInstance()
