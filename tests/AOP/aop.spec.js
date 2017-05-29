describe('Aop', function () {
  var targetObj,
      executionPoints, // array have excution events
      argPassingAdvice, // advice to inject parameters to target
      argsToTarget, // arguments
      targetFnReturn,
      Target = function () {
        var self = this;
        this.targetFn = function () {
          expect(this).toBe(self);
        }
      };

  beforeEach(function () {
    targetObj = {
      targetFn: function () {
        targetFnReturn = 3;
        executionPoints.push('targetFn');
        argsToTarget = Array.prototype.slice.call(arguments, 0);
        return targetFnReturn;
      }
    };

    executionPoints = [];

    argPassingAdvice = function (targetInfo) {
      return targetInfo.fn.apply(this, targetInfo.args);
    }

    argsToTarget = [];
  });

  describe('Aop.around(fnName, advice, fnObj)', function () {
    it('When target function is called, run advice', function () {
      var targetObj = {
        targetFn: function () {}
      };

      var excutedAdvice = false;
      var advice = function () {
        excutedAdvice = true;
      };

      Aop.around('targetFn', advice, targetObj);
      targetObj.targetFn();
      expect(excutedAdvice).toBe(true);
    });

    it('advice wrap target called', function () {
      var wrappingAdvice = function(targetInfo) {
        executionPoints.push('wrappingAdvice - Start');
        targetInfo.fn();
        executionPoints.push('wrappingAdvice - End');
      };

      Aop.around('targetFn', wrappingAdvice, targetObj);
      targetObj.targetFn();
      expect(executionPoints).toEqual(['wrappingAdvice - Start', 'targetFn', 'wrappingAdvice - End']);
    });

    it('chain advices', function () {
      var adviceFactory = function (adviceID) {
        return (function (targetInfo) {
          executionPoints.push('wrappingAdvice - Start ' + adviceID);
          targetInfo.fn();
          executionPoints.push('wrappingAdvice - End ' + adviceID);
        });
      }
      Aop.around('targetFn', adviceFactory('inner'), targetObj);
      Aop.around('targetFn', adviceFactory('outer'), targetObj);
      targetObj.targetFn();
      expect(executionPoints).toEqual([
        'wrappingAdvice - Start outer',
        'wrappingAdvice - Start inner',
        'targetFn',
        'wrappingAdvice - End inner',
        'wrappingAdvice - End outer'
      ]);
    });

    it('advice can pass parameters to target', function () {
      Aop.around('targetFn', argPassingAdvice, targetObj);
      targetObj.targetFn('a', 'b');
      expect(argsToTarget).toEqual(['a', 'b']);
    });

    it('can reference targets return value', function () {
      Aop.around('targetFn', argPassingAdvice, targetObj);
      var returnedValue = targetObj.targetFn();
      expect(returnedValue).toBe(targetFnReturn);
    });

    it('concern object\'s context', function () {
      var targetInstance = new Target();
      var spyOnInstance = spyOn(targetInstance, 'targetFn').and.callThrough();
      Aop.around('targetFn', argPassingAdvice, targetInstance);
      targetInstance.targetFn();
      expect(spyOnInstance).toHaveBeenCalled();
    });
  });

  describe('Aop.next.call(context, targetInfo)', function () {
    var advice = function (targetInfo) {
      return Aop.next.call(this, targetInfo);
    };
    var originalFn;
    beforeEach(function () {
      originalFn = targetObj.targetFn;
      Aop.around('targetFn', advice, targetObj);
    });

    it('call function in targetInfo.fn', function () {
      targetObj.targetFn();
      expect(executionPoints).toEqual(['targetFn']);
    });

    it('pass arguments to targetInfo.args', function () {
      targetObj.targetFn('a', 'b');
      expect(argsToTarget).toEqual(['a', 'b']);
    });

    it('return value from targetInfo.fn', function () {
      var returned = targetObj.targetFn();
      expect(returned).toEqual(targetFnReturn);
    });

    it('concern object\'s context', function () {
      var targetInstance = new Target();
      var spyOnInstance = spyOn(targetInstance, 'targetFn').and.callThrough();
      Aop.around('targetFn', advice, targetInstance);
      targetInstance.targetFn();
      expect(spyOnInstance).toHaveBeenCalled();
    });
  })
});
