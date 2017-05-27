Aop = {
  around: function (fnName, advice, fnObj) {
    var originalFn = fnObj[fnName];

    fnObj[fnName] = function () {
      var targetContext = {};
      advice.call(targetContext, {fn: originalFn});
    }

  }
};