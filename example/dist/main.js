(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@jsaop/jsaop')) :
  typeof define === 'function' && define.amd ? define(['@jsaop/jsaop'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jsaop));
}(this, (function (jsaop) { 'use strict';

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object.keys(descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object.defineProperty(target, property, desc);
      desc = null;
    }

    return desc;
  }

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _dec10, _class3;
  (_dec = jsaop.Pointcut(), _dec2 = jsaop.Pointcut('static'), _dec3 = jsaop.Before({
    value: 'pointcut'
  }), _dec4 = jsaop.AfterReturning({
    value: 'pointcut'
  }), _dec5 = jsaop.AfterThrowing({
    value: 'pointcut'
  }), _dec6 = jsaop.After({
    value: 'pointcut'
  }), _dec7 = jsaop.Around({
    value: 'pointcut'
  }), _dec8 = jsaop.Before({
    value: 'pointcut1'
  }), _dec9 = jsaop.After({
    value: 'pointcut1'
  }), jsaop.Aspect(_class = (_class2 = class ProtoMethodAspect {
    get pointcut() {
      return 'ProtoMethod.do*';
    }

    get pointcut1() {
      return 'ProtoMethod.create*';
    }

    beforeAction(jp) {
      console.log('before action', jp);
    }

    afterReturningAction(jp, rst) {
      console.log('after returning action', jp, rst);
    }

    afterThrowingAction(jp, err) {
      console.log('after throwing action', jp, err);
    }

    afterAction(jp, rst) {
      console.log('after action', jp, rst);
    }

    async aroundAction(jp) {
      console.log('before around action', jp);
      let rst = await jp.proceed();
      console.log('after around action', jp);
      return rst;
    }

    beforeAction1(jp) {
      console.log('before1 action', jp);
    }

    afterAction1(jp) {
      console.log('after1 action', jp);
    }

  }, (_applyDecoratedDescriptor(_class2.prototype, "pointcut", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "pointcut"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "pointcut1", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "pointcut1"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "beforeAction", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "beforeAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "afterReturningAction", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "afterReturningAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "afterThrowingAction", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "afterThrowingAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "afterAction", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "afterAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "aroundAction", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "aroundAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "beforeAction1", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "beforeAction1"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "afterAction1", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "afterAction1"), _class2.prototype)), _class2)) || _class);
  let ProtoMethod = (_dec10 = jsaop.Weaving(), _dec10(_class3 = class ProtoMethod {
    static createInstance() {
      return new ProtoMethod();
    }

    fetchSomething() {
      return new Promise(resolve => {
        resolve(123); //throw 'error'
      });
    }

    doSomething() {
      //JSON.parse('{name:123}')
      return Promise.resolve(456);
    }

  }) || _class3);
  new ProtoMethod().doSomething();
  ProtoMethod.createInstance();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2FzcGVjdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3BlY3QsIEJlZm9yZSwgQWZ0ZXIsIFBvaW50Y3V0LCBBcm91bmQsIEFmdGVyUmV0dXJuaW5nLCBBZnRlclRocm93aW5nLCBXZWF2aW5nIH0gZnJvbSAnQGpzYW9wL2pzYW9wJ1xuXG5AQXNwZWN0XG5jbGFzcyBQcm90b01ldGhvZEFzcGVjdCB7XG4gICAgQFBvaW50Y3V0KClcbiAgICBnZXQgcG9pbnRjdXQoKSB7XG4gICAgICAgIHJldHVybiAnUHJvdG9NZXRob2QuZG8qJ1xuICAgIH1cblxuICAgIEBQb2ludGN1dCgnc3RhdGljJylcbiAgICBnZXQgcG9pbnRjdXQxKCkge1xuICAgICAgICByZXR1cm4gJ1Byb3RvTWV0aG9kLmNyZWF0ZSonXG4gICAgfVxuXG4gICAgQEJlZm9yZSh7IHZhbHVlOiAncG9pbnRjdXQnIH0pXG4gICAgYmVmb3JlQWN0aW9uKGpwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdiZWZvcmUgYWN0aW9uJywganApXG4gICAgfVxuXG4gICAgQEFmdGVyUmV0dXJuaW5nKHsgdmFsdWU6ICdwb2ludGN1dCcgfSlcbiAgICBhZnRlclJldHVybmluZ0FjdGlvbihqcCwgcnN0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciByZXR1cm5pbmcgYWN0aW9uJywganAsIHJzdClcbiAgICB9XG5cbiAgICBAQWZ0ZXJUaHJvd2luZyh7IHZhbHVlOiAncG9pbnRjdXQnIH0pXG4gICAgYWZ0ZXJUaHJvd2luZ0FjdGlvbihqcCwgZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciB0aHJvd2luZyBhY3Rpb24nLCBqcCwgZXJyKVxuICAgIH1cblxuICAgIEBBZnRlcih7IHZhbHVlOiAncG9pbnRjdXQnIH0pXG4gICAgYWZ0ZXJBY3Rpb24oanAsIHJzdCkge1xuICAgICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgYWN0aW9uJywganAsIHJzdClcbiAgICB9XG5cbiAgICBAQXJvdW5kKHsgdmFsdWU6ICdwb2ludGN1dCcgfSlcbiAgICBhc3luYyBhcm91bmRBY3Rpb24oanApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZSBhcm91bmQgYWN0aW9uJywganApXG4gICAgICAgIGxldCByc3QgPSBhd2FpdCBqcC5wcm9jZWVkKClcbiAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGFyb3VuZCBhY3Rpb24nLCBqcClcbiAgICAgICAgcmV0dXJuIHJzdFxuICAgIH1cblxuXG4gICAgQEJlZm9yZSh7IHZhbHVlOiAncG9pbnRjdXQxJyB9KVxuICAgIGJlZm9yZUFjdGlvbjEoanApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2JlZm9yZTEgYWN0aW9uJywganApXG4gICAgfVxuXG4gICAgQEFmdGVyKHsgdmFsdWU6ICdwb2ludGN1dDEnIH0pXG4gICAgYWZ0ZXJBY3Rpb24xKGpwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhZnRlcjEgYWN0aW9uJywganApXG4gICAgfVxufVxuXG5AV2VhdmluZygpXG5jbGFzcyBQcm90b01ldGhvZCB7XG5cbiAgICBzdGF0aWMgY3JlYXRlSW5zdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvdG9NZXRob2QoKVxuICAgIH1cblxuICAgIGZldGNoU29tZXRoaW5nKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoMTIzKVxuICAgICAgICAgICAgLy90aHJvdyAnZXJyb3InXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZG9Tb21ldGhpbmcoKSB7XG4gICAgICAgIC8vSlNPTi5wYXJzZSgne25hbWU6MTIzfScpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoNDU2KVxuICAgIH1cbn1cblxuXG5uZXcgUHJvdG9NZXRob2QoKS5kb1NvbWV0aGluZygpXG5cblByb3RvTWV0aG9kLmNyZWF0ZUluc3RhbmNlKClcbiJdLCJuYW1lcyI6WyJQb2ludGN1dCIsIkJlZm9yZSIsInZhbHVlIiwiQWZ0ZXJSZXR1cm5pbmciLCJBZnRlclRocm93aW5nIiwiQWZ0ZXIiLCJBcm91bmQiLCJBc3BlY3QiLCJQcm90b01ldGhvZEFzcGVjdCIsInBvaW50Y3V0IiwicG9pbnRjdXQxIiwiYmVmb3JlQWN0aW9uIiwianAiLCJjb25zb2xlIiwibG9nIiwiYWZ0ZXJSZXR1cm5pbmdBY3Rpb24iLCJyc3QiLCJhZnRlclRocm93aW5nQWN0aW9uIiwiZXJyIiwiYWZ0ZXJBY3Rpb24iLCJhcm91bmRBY3Rpb24iLCJwcm9jZWVkIiwiYmVmb3JlQWN0aW9uMSIsImFmdGVyQWN0aW9uMSIsIlByb3RvTWV0aG9kIiwiV2VhdmluZyIsImNyZWF0ZUluc3RhbmNlIiwiZmV0Y2hTb21ldGhpbmciLCJQcm9taXNlIiwicmVzb2x2ZSIsImRvU29tZXRoaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFJS0EsY0FBUSxZQUtSQSxjQUFRLENBQUMsUUFBRCxXQUtSQyxZQUFNLENBQUM7RUFBRUMsRUFBQUEsS0FBSyxFQUFFO0VBQVQsQ0FBRCxXQUtOQyxvQkFBYyxDQUFDO0VBQUVELEVBQUFBLEtBQUssRUFBRTtFQUFULENBQUQsV0FLZEUsbUJBQWEsQ0FBQztFQUFFRixFQUFBQSxLQUFLLEVBQUU7RUFBVCxDQUFELFdBS2JHLFdBQUssQ0FBQztFQUFFSCxFQUFBQSxLQUFLLEVBQUU7RUFBVCxDQUFELFdBS0xJLFlBQU0sQ0FBQztFQUFFSixFQUFBQSxLQUFLLEVBQUU7RUFBVCxDQUFELFdBU05ELFlBQU0sQ0FBQztFQUFFQyxFQUFBQSxLQUFLLEVBQUU7RUFBVCxDQUFELFdBS05HLFdBQUssQ0FBQztFQUFFSCxFQUFBQSxLQUFLLEVBQUU7RUFBVCxDQUFELEdBOUNUSyxpQ0FBRCxNQUNNQyxpQkFETixDQUN3QjtFQUVSLE1BQVJDLFFBQVEsR0FBRztFQUNYLFdBQU8saUJBQVA7RUFDSDs7RUFHWSxNQUFUQyxTQUFTLEdBQUc7RUFDWixXQUFPLHFCQUFQO0VBQ0g7O0VBR0RDLEVBQUFBLFlBQVksQ0FBQ0MsRUFBRCxFQUFLO0VBQ2JDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkJGLEVBQTdCO0VBQ0g7O0VBR0RHLEVBQUFBLG9CQUFvQixDQUFDSCxFQUFELEVBQUtJLEdBQUwsRUFBVTtFQUMxQkgsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksd0JBQVosRUFBc0NGLEVBQXRDLEVBQTBDSSxHQUExQztFQUNIOztFQUdEQyxFQUFBQSxtQkFBbUIsQ0FBQ0wsRUFBRCxFQUFLTSxHQUFMLEVBQVU7RUFDekJMLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHVCQUFaLEVBQXFDRixFQUFyQyxFQUF5Q00sR0FBekM7RUFDSDs7RUFHREMsRUFBQUEsV0FBVyxDQUFDUCxFQUFELEVBQUtJLEdBQUwsRUFBVTtFQUNqQkgsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QkYsRUFBNUIsRUFBZ0NJLEdBQWhDO0VBQ0g7O0VBR2lCLFFBQVpJLFlBQVksQ0FBQ1IsRUFBRCxFQUFLO0VBQ25CQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ0YsRUFBcEM7RUFDQSxRQUFJSSxHQUFHLEdBQUcsTUFBTUosRUFBRSxDQUFDUyxPQUFILEVBQWhCO0VBQ0FSLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBQW1DRixFQUFuQztFQUNBLFdBQU9JLEdBQVA7RUFDSDs7RUFJRE0sRUFBQUEsYUFBYSxDQUFDVixFQUFELEVBQUs7RUFDZEMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZ0JBQVosRUFBOEJGLEVBQTlCO0VBQ0g7O0VBR0RXLEVBQUFBLFlBQVksQ0FBQ1gsRUFBRCxFQUFLO0VBQ2JDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkJGLEVBQTdCO0VBQ0g7O0VBaERtQjtNQW9EbEJZLHdCQURMQyxhQUFPLHFCQUFSLE1BQ01ELFdBRE4sQ0FDa0I7RUFFTyxTQUFkRSxjQUFjLEdBQUc7RUFDcEIsV0FBTyxJQUFJRixXQUFKLEVBQVA7RUFDSDs7RUFFREcsRUFBQUEsY0FBYyxHQUFHO0VBQ2IsV0FBTyxJQUFJQyxPQUFKLENBQWFDLE9BQUQsSUFBYTtFQUM1QkEsTUFBQUEsT0FBTyxDQUFDLEdBQUQsQ0FBUCxDQUQ0QjtFQUcvQixLQUhNLENBQVA7RUFJSDs7RUFFREMsRUFBQUEsV0FBVyxHQUFHO0VBQ1Y7RUFDQSxXQUFPRixPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsR0FBaEIsQ0FBUDtFQUNIOztFQWhCYTtFQW9CbEIsSUFBSUwsV0FBSixHQUFrQk0sV0FBbEI7RUFFQU4sV0FBVyxDQUFDRSxjQUFaOzs7Ozs7In0=
