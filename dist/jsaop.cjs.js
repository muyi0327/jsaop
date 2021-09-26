
/**
 * jsaop.js v1.0.4
 * (c) 2021-2021 muyi0327 <yfdezhuye@163.com> (https://github.com/muyi0327)
 * Released under the MIT License.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (Object.prototype.hasOwnProperty.call(b, p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        { throw new TypeError("Class extends value " + String(b) + " is not a constructor or null"); }
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var JoinPoint = (function () {
    function JoinPoint(jp) {
        this.args = [];
        var target = jp.target, args = jp.args, thisArg = jp.thisArg, value = jp.value;
        this.target = target;
        this.args = args;
        this.thisArg = thisArg;
        this.value = value;
    }
    return JoinPoint;
}());
var ProceedJoinPoint = (function (_super) {
    __extends(ProceedJoinPoint, _super);
    function ProceedJoinPoint(pjp) {
        var _this = this;
        var target = pjp.target, args = pjp.args, thisArg = pjp.thisArg, value = pjp.value, proceed = pjp.proceed;
        _this = _super.call(this, { target: target, args: args, thisArg: thisArg, value: value }) || this;
        _this.proceed = proceed;
        return _this;
    }
    return ProceedJoinPoint;
}(JoinPoint));

var isPromise = function (fn) {
    return !!fn && typeof fn.then === "function" && fn[Symbol.toStringTag] === "Promise";
};
var AOP = (function () {
    function AOP() {
        this.aspects = {};
    }
    AOP.prototype.regist = function (name) {
        var pointcuts = {};
        this.aspects[name] = pointcuts;
    };
    AOP.prototype.has = function (name) {
        return this.aspects.hasOwnProperty(name);
    };
    AOP.prototype.get = function (name) {
        return this.aspects[name];
    };
    AOP.prototype.clear = function () {
        this.aspects = {};
    };
    AOP.prototype.forEach = function (cb) {
        var _this = this;
        Object.keys(this.aspects).forEach(function (i) {
            var aspect = _this.aspects[i];
            cb(aspect);
        });
    };
    AOP.prototype.fitler = function (cb) {
        var p = [];
        this.forEach(function (aspect) {
            Object.keys(aspect).forEach(function (i) {
                var pointcut = aspect[i];
                if (cb(pointcut)) {
                    p.push(pointcut);
                }
            });
        });
        return p;
    };
    return AOP;
}());
var OriginAspects = new AOP();
var Aspect = function () { return function (target) {
    var name = target.name;
    if (!OriginAspects.has(name)) {
        OriginAspects.regist(name);
    }
}; };
var Weaving = function (opts) {
    return function (target) {
        var _a = opts || {}, _b = _a.namespace, namespace = _b === void 0 ? "" : _b; _a.blackList;
        var proto = target.prototype;
        var props = Object.getOwnPropertyNames(target.prototype);
        var statics = Object.getOwnPropertyNames(target);
        var originTarget = target;
        var weavePointcut = function (keys, ctx, type) {
            return keys.forEach(function (prop) {
                var pointcuts = OriginAspects.fitler(function (pointcut) {
                    return (pointcut &&
                        pointcut.type === type &&
                        pointcut.matches({
                            namespace: namespace,
                            className: target.name,
                            methodName: prop,
                        }));
                });
                if (!!pointcuts && !!pointcuts.length) {
                    var value_1 = ctx[prop];
                    Object.defineProperty(ctx, prop, {
                        writable: true,
                        enumerable: true,
                        value: function () {
                            var args = [].slice.call(arguments);
                            var thisArg = this;
                            var joinpint = new JoinPoint({
                                target: originTarget,
                                thisArg: this,
                                value: value_1,
                                args: args,
                            });
                            var index = -1;
                            var len = pointcuts.length;
                            var executeChain = function () {
                                index++;
                                var pointcut = pointcuts[index];
                                if (pointcut instanceof PointcutClass) {
                                    var before_1 = pointcut.findAdvice("before");
                                    var after_1 = pointcut.findAdvice("after");
                                    var around = pointcut.findAdvice("around");
                                    var afterThrowing_1 = pointcut.findAdvice("afterThrowing");
                                    var afterReturning_1 = pointcut.findAdvice("afterReturning");
                                    var proceed = function () {
                                        var rst = null;
                                        var err = null;
                                        if (before_1) {
                                            before_1(joinpint);
                                        }
                                        try {
                                            if (index < len - 1) {
                                                rst = executeChain();
                                            }
                                            else {
                                                rst = value_1.apply(thisArg, args);
                                            }
                                        }
                                        catch (error) {
                                            err = error;
                                        }
                                        if (isPromise(rst)) {
                                            return new Promise(function (resolve, reject) {
                                                rst.then(function (res) {
                                                    resolve(res);
                                                    afterReturning_1 && afterReturning_1(joinpint, res);
                                                    after_1 && after_1(joinpint, res, null);
                                                }, function (error) {
                                                    err = error;
                                                    reject(err);
                                                    afterThrowing_1 && afterThrowing_1(joinpint, err);
                                                    after_1 && after_1(joinpint, null, err);
                                                });
                                            });
                                        }
                                        else {
                                            if (err) {
                                                afterThrowing_1 && afterThrowing_1(joinpint, err);
                                            }
                                            else {
                                                afterReturning_1 && afterReturning_1(joinpint, rst);
                                            }
                                            after_1 && after_1(joinpint, rst, err);
                                            return rst;
                                        }
                                    };
                                    if (around) {
                                        var proceedJoinpint = new ProceedJoinPoint({
                                            target: joinpint.target,
                                            proceed: proceed,
                                            value: joinpint.value,
                                            args: joinpint.args,
                                            thisArg: joinpint.thisArg,
                                        });
                                        return around(proceedJoinpint);
                                    }
                                    else {
                                        return proceed();
                                    }
                                }
                            };
                            return executeChain();
                        },
                    });
                }
            });
        };
        weavePointcut(props, proto, "proto");
        weavePointcut(statics, target, "static");
        return target;
    };
};

var PointcutClass = (function () {
    function PointcutClass(rules, type) {
        if (type === void 0) { type = 'proto'; }
        this.advices = {};
        this.rules = this.normalizedRules(rules);
        this.type = type;
    }
    PointcutClass.prototype.registAdvice = function (type, advice) {
        this.advices[type] = advice;
    };
    PointcutClass.prototype.findAdvice = function (type) {
        return this.advices[type];
    };
    PointcutClass.prototype.normalizedRules = function (rules) {
        var _this = this;
        var _rules = rules;
        if (!rules) {
            throw new Error('rules is requried');
        }
        if (typeof rules === 'string') {
            _rules = rules.split('&&').map(function (r) { return r.trim(); });
        }
        if (!Array.isArray(rules)) {
            _rules = [rules];
        }
        _rules = _rules.map(function (rule) {
            if (rule instanceof RegExp) {
                return rule;
            }
            if (typeof rule == 'string') {
                return _this.toRegRule(rule);
            }
            if (!rule['className']) {
                throw new Error('The property className of PointcutRuleType is required');
            }
            if (!rule['methodName']) {
                throw new Error('The property methodName of PointcutRuleType is required');
            }
            'namespace,className,methodName'.split(',').forEach(function (k) {
                if (typeof rule[k] === 'string') {
                    rule[k] = _this.toRegRule(rule[k]);
                }
            });
            return rule;
        });
        return _rules;
    };
    PointcutClass.prototype.toRegRule = function (rule) {
        var reg;
        if (rule[0] === '?') {
            reg = new RegExp('^[_\\w]' + rule.substring(1).replace(/\?/ig, '[_\\w\\d]').replace(/\*/ig, '[_\\w\\d]*') + '$', 'g');
        }
        else if (rule[0] === '*') {
            reg = new RegExp('^([_\\w]?|[_\\w][_\\w\\d]*)' + rule.substring(1).replace(/\?/ig, '[_\\w\\d]').replace(/\*/ig, '[_\\w\\d]*') + '$', 'g');
        }
        else {
            reg = new RegExp('^' + rule.replace(/\?/ig, '[_\\w\\d]').replace(/\*/ig, '[_\\w\\d]*') + '$', 'g');
        }
        return reg;
    };
    PointcutClass.prototype.matches = function (ctx) {
        var _a = ctx.namespace, namespace = _a === void 0 ? '' : _a, _b = ctx.className, className = _b === void 0 ? '' : _b, _c = ctx.methodName, methodName = _c === void 0 ? '' : _c;
        var ctxStr = "" + (namespace ? namespace + ':' : '') + className + "." + methodName;
        if (!className || !methodName)
            { return false; }
        return this.rules.some(function (rule) {
            if (rule instanceof RegExp)
                { return rule.test(ctxStr); }
            rule = rule;
            return (!rule.namespace || rule.namespace.test(namespace)) &&
                (!rule.className || rule.className.test(className)) &&
                (!rule.methodName || rule.methodName.test(methodName));
        });
    };
    return PointcutClass;
}());
var Pointcut = function (type) { return function (target, propKey, descriptor) {
    var name = target.constructor.name;
    var aspect;
    var pointcutRules = target[propKey];
    if (!OriginAspects.has(name)) {
        OriginAspects.regist(name);
    }
    aspect = OriginAspects.get(name);
    aspect[propKey] = new PointcutClass(pointcutRules, type);
    return descriptor;
}; };

var createAdvice = function (type) { return function (options) {
    var pointcutKey = options.value;
    return function (target, key, descriptor) {
        var fun = descriptor.value;
        var name = target.constructor.name;
        var pointcut;
        var aspect;
        if (aspect = OriginAspects.get(name)) {
            if (pointcut = aspect[pointcutKey]) {
                pointcut.registAdvice(type, fun);
            }
        }
        return descriptor;
    };
}; };
var Before = createAdvice('before');
var After = createAdvice('after');
var Around = createAdvice('around');
var AfterReturning = createAdvice('afterReturning');
var AfterThrowing = createAdvice('afterThrowing');

exports.After = After;
exports.AfterReturning = AfterReturning;
exports.AfterThrowing = AfterThrowing;
exports.Around = Around;
exports.Aspect = Aspect;
exports.Before = Before;
exports.Pointcut = Pointcut;
exports.Weaving = Weaving;
