## jsaop

jsaop是一个前端AOP工具。用于在面向对象编程开发模式中，对目标方法织入通知(Advice)。从而实现业务代码和功能性代码分离解耦。

### 版本日志 2021-07-13

1. 调整属性检查会触发目标类的get执行问题

### 适用场景
1. 面向对象开发模式，基于typescript或者es6均可
2. 埋点、日志、异常收集等需要跟业务逻辑分离的逻辑代码

### 准备工作

#### 安装
```shell
npm i --save @jsaop/jsaop
```
或者
```shell
yarn add --save @jsaop/jsaop
```

### 应用
#### 开启decorator支持

1. **ts文件配置tsconfig.json，js文件配置jsconfig.json**

```js
{
    "compilerOptions": {
        // ...
        // 启用装饰器
        "experimentalDecorators": true
        // ...
    }
}
```
<br />

2. **配置babel**

babel需要配置decorator和class语法支持，需要用到下面两个plugin

yarn安装plugin

```shell

yarn add @babel/plugin-proposal-decorators -D

```


npm安装plugin

```shell

npm i @babel/plugin-proposal-decorators -D

```

配置信息(.babelrc / babel.config.js / babel.config.js)

@babel/plugin-proposal-decorators需要开启legacy(值为true)，同时启用setPublicClassFields、setClassMethods，以支持和使用stage1的decorator语法。

具体可以参考[babel官网相关信息](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#docsNav)

```json
{
    "assumptions": {
        "setClassMethods": true,
        "setComputedProperties":true,
        "setPublicClassFields": true
    },
    "presets": [
        ["@babel/preset-env", {
            "modules": false
        }]
    ],
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }]
    ]
}
```
<br />

#### 1. 基本用法

```js
import {Aspect, Before, After, Around, Pointcut, Weaving} from '@jsaop/jsaop'

@Aspect()
class TestAspect{
    @Pointcut()
    get pointcut(){
        return 'app.tsa.pages:TestPage.do*'
    }

    @Before({value:'pointcut'})
    beforeAction(jp){
        console.log('before action:',jp)
    }

    @After({value:'pointcut'})
    afterAction(jp, rst, err){
        console.log('after action:', jp, rst, err)
    }
}

@Weaving({namespace:'app.tsa.pages'})
class TestPage{
    doSomeThing(){
        console.log('doSomeThing')
        return 'success'
    }
}

new TestPage().doSomeThing()

```
<br />

#### 2. 支持异步async/await和Promise

```js
import {Aspect, Before, After, Around, Pointcut, Weaving} from '@jsaop/jsaop'

@Aspect()
class TestAspect{
    //...
}

@Weaving()
class TestPage{
    async doSomeThing(){
        console.log('doSomeThing')
        await return Promise.resolve('success')
    }
}

new TestPage().doSomeThing()

```
<br />

### API文档说明
<br />

#### 切面(Aspect)
切面由切点(PointCut)和增强(Advice)组成，它既包括了横切逻辑的定义，也包括了连接点(JoinPoint)的定义，AOP就是将切面所定义的横切逻辑织入到切面所制定的连接点中。

这是一个完整的Aspect定义实例，包括切点pointcut，增强beforeAction和afterAction，以及连接点匹配逻辑'app.tsa.pages:TestPage.do*'

```js
@Aspect()
class TestAspect{
    @Pointcut()
    get pointcut(){
        return 'app.tsa.pages:TestPage.do*'
    }

    @Before({value:'pointcut'})
    beforeAction(jp){
        console.log('before action:',jp)
    }

    @After({value:'pointcut'})
    afterAction(jp, rst, err){
        console.log('after action:', jp, rst, err)
    }
}

```
<br />

#### Weaving(织入)

把切面织入目标位置，语法@Weaving(opts:WeavingOpts)

```ts
interface WeavingOpts {
    blackList?: Array<string>; // 排除掉方法名，跳执行效率
    namespace?: string;// 命名空间
}
```

实例

```ts
@Weaving({namespace:'app.fe.pages'})
class TestPage{
    async doSomeThing(){
        await return Promise.resolve('success')
    }
}
```

<br />

#### 连接点(JoinPoint) 

程序执行的某个特定位置，如某个方法调用前，调用后，方法抛出异常后，这些代码中的特定点称为连接点。通常作为[通知(Advice)](#advice)的参数出现

```ts
interface JoinPoint {
    target: any; // 目标类
    args: any[]; // 目标方法参数
    thisArg: any; // this指向，目标类的实例，目标方法的上下文context
    value: any; // 目标方法
    // ...
}
```
<br />

#### 切入点(Pointcut)

每个程序的连接点有多个，如何定位到某个感兴趣的连接点，就需要通过切点来定位。

定义Pointcut语法格式 

```js
@Pointcut([type]) 
get [pointcut name](){
    return [pointcut rules]
} 
```

1. type:'prototype'|'static'指方法类型，原型方法(prototype)和静态方法(static)；
2. pointcut name切点名称；
3. pointcut rules匹配规则: **命名空间?:类名.方法名称(namespace?:className.methodName)**

例如

```js
@Pointcut('prototype')
get pointcut(){
    return 'app.tsa.pages:TestPage.do*'
}
```

**rules:PointcutRules匹配说明**

1. **匹配类型**
```ts
type PointcutRuleType = { 
    namespace?: RegExp | string; 
    className: RegExp | string; 
    methodName: RegExp | string 
}

type PointcutRules = string | RegExp | PointcutRuleType | Array<PointcutRuleType | RegExp | string>
```
2. **string类型匹配**

匹配命名空间app.tsa.pages，TestPage类，以do开头的任意方法

```js
'app.tsa.pages:TestPage.do*'
```

多个匹配规则可以用 && 分割

```js
'app.tsa.pages:TestPage.do* && app.tsa.pages:ArticlePage.submit*'
```

3. **正则匹配**

任意命名空间(可省)，SomeClass类，以do开头的任意方法
```js
/^([\d\w][_./-\w\d]*[:]?)?SomeClass.do[\w\d]+$/
```

4. **PointcutRuleType匹配**

```js
@Pointcut()
get pointcut() {
    return {
        className: 'SomeClass',
        methodName: 'submit*'
    }
}
```

5. **支持数组放置上述单个或者多个匹配规则**

```js
@Pointcut()
get pointcut() {
    return [
        'app.tsa.pages:TestPage.do*',
        'app.tsa.pages:ArticlePage.submit*',
        /^([\d\w][_./-\w\d]*[:]?)?SomeClass.do[\w\d]+$/
    ]
}
```

6. **"*"匹配多个字符，"?"匹配单个字符**

7. **namespace可以省略，但不建议这么做，因为匹配基于className和methodName，极易发生冲突**


<br />

#### 通知(Advice)<a id="advice">~</a>

1. **前置通知(Before Advice)**
语法@Before({value:[pointcut name]})，目标动作执行之前织入通知。
前置通知只有一个参数，即：连接点jp:JoinPoint

```js
    @Before({value:'pointcut'})
    beforeAction(jp){
        console.log('Before action:',jp)
    }
```
<br />

2. **后置通知(After Advice)**
语法@After({value:[pointcut name]})，目标动作执行之后织入通知，无论成功，还是发生异常都会执行。
后置通知有三个参数，分别是：连接点jp:JoinPoint, 返回值rst:any, 异常err: Error。

```js
    @After({value:'pointcut'})
    afterAction(jp, rst, err){
        console.log('After action:',jp, rst, err)
    }
```
<br />

3. **返回结果通知(AfterReturning Advice)**
语法@AfterReturning({value:[pointcut name]})，目标动作执行成功之后执行
后置通知有两个参数，分别是：连接点jp:JoinPoint, 结果rst:any

```js
    @AfterReturning({value:'pointcut'})
    afterReturningAction(jp, rst){
        console.log('AfterReturning action:',jp, rst)
    }
```
<br />

4. **异常通知(AfterThrowing Advice)**
语法@AfterThrowing({value:[pointcut name]})，目标动作执行发生异常后执行
后置通知有两个参数，分别是：连接点jp:JoinPoint, 结果err:Error

```js
    @AfterThrowing({value:'pointcut'})
    afterThrowingAction(jp, err){
        console.log('AfterThrowing action:',jp, err)
    }
```

5. **环绕通知(Around Advice)**
语法@Around({value:[pointcut name]})，目标动作执行发生异常后执行
后置通知有一个参数，即：连接点jp:ProceedJoinPoint。ProceedJoinPoint继承JoinPoint，含有一个procced方法，缓存了目标动作的执行，以及其他通知的执行

```js
    interface ProceedJoinPoint extends JoinPoint {
        new(jp: ProceedJoinPointType)
        procced(): any
    }
```

执行jp.procced()，才会触发执行动作

```js
    @Around({value:'pointcut'})
    aroundAction(jp){
        console.log('Before Around action:',jp)
        let rst = jp.procced()
        console.log('After Around action:',jp)

        return rst
    }
```

6. 通知执行顺序
* 正常执行顺序：

```js
    Around => Before => target method => AfterReturning => After => Around
```

* 发生异常执行顺序：

```js
    Around => Before => target method => AfterThrowing => After => Around
```

<br />

#### Tree Shaking 问题

Aspect类文件和目标类文件，属于隐式的依赖关系，很容易被Tree Shaking清理掉。有几种办法解决这个问题

1. package.json添加sideEffects清单，使文件不受tree shaking影响

```json
    {
        "sideEffects": [
            "./src/aspects/**/*.ts",
            "./src/assets/**/*.js",
            "./src/assets/**/*.scss",
            "./src/assets/**/*.css"
        ],
    }

```

2. babel-loader添加sideEffects清单， 使文件不受tree shaking影响

```js
    module: {
        rules: [
        {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            use: {
            loader: 'babel-loader',
            },
            sideEffects:  ['"./src/aspects/**/*.ts"']
        }
        ]
    }
```
<br />

#### 代码压缩开启混淆，造成Pointcut的rules匹配失效问题

1. 排除掉className和methodName混淆，以Terser为例

```js
    const TerserPlugin = require('terser-webpack-plugin')

    new TerserPlugin({
        cache: true, // 开启缓存，提升编译速度
        parallel: true, // 开启多进程,提升编译速度
        terserOptions: {
            mangle: true, // 混淆代码
            keep_classnames: true, // 保持classname不混淆(解决AOP动态匹配）
            keep_fnames: true// 函数、方法名称不混淆(解决AOP动态匹配）
        }
    })
```
