describe('Aop', function () {
  var targetObj,
      executionPoints; // array have excution events

  beforeEach(function () {
    targetObj = {
      targetFn: function () {
        executionPoints.push('targetFn');
      }
    };
    executionPoints = [];
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
  });
});