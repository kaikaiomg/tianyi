(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["common/vendor"],{

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime-module.js");


/***/ }),

/***/ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function isFn (fn) {
  return typeof fn === 'function'
}

function isStr (str) {
  return typeof str === 'string'
}

function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

const SYNC_API_RE = /hideKeyboard|upx2px|canIUse|^create|Sync$|Manager$/;

const CONTEXT_API_RE = /^create|Manager$/;

const CALLBACK_API_RE = /^on/;

function isContextApi (name) {
  return CONTEXT_API_RE.test(name)
}
function isSyncApi (name) {
  return SYNC_API_RE.test(name)
}

function isCallbackApi (name) {
  return CALLBACK_API_RE.test(name)
}

function handlePromise (promise) {
  return promise.then(data => {
    return [null, data]
  })
    .catch(err => [err])
}

function shouldPromise (name) {
  if (isSyncApi(name)) {
    return false
  }
  if (isCallbackApi(name)) {
    return false
  }
  return true
}

function promisify (name, api) {
  if (!shouldPromise(name)) {
    return api
  }
  return function promiseApi (options = {}, ...params) {
    if (isFn(options.success) || isFn(options.fail) || isFn(options.complete)) {
      return api(options, ...params)
    }
    return handlePromise(new Promise((resolve, reject) => {
      api(Object.assign({}, options, {
        success: resolve,
        fail: reject
      }), ...params);
      /* eslint-disable no-extend-native */
      Promise.prototype.finally = function (callback) {
        const promise = this.constructor;
        return this.then(
          value => promise.resolve(callback()).then(() => value),
          reason => promise.resolve(callback()).then(() => {
            throw reason
          })
        )
      };
    }))
  }
}

const EPS = 1e-4;
const BASE_DEVICE_WIDTH = 750;
let isIOS = false;
let deviceWidth = 0;
let deviceDPR = 0;

function checkDeviceWidth () {
  const {
    platform,
    pixelRatio,
    windowWidth
  } = wx.getSystemInfoSync(); // uni=>wx runtime 编译目标是 uni 对象，内部不允许直接使用 uni

  deviceWidth = windowWidth;
  deviceDPR = pixelRatio;
  isIOS = platform === 'ios';
}

function upx2px (number, newDeviceWidth) {
  if (deviceWidth === 0) {
    checkDeviceWidth();
  }

  number = Number(number);
  if (number === 0) {
    return 0
  }
  let result = (number / BASE_DEVICE_WIDTH) * (newDeviceWidth || deviceWidth);
  if (result < 0) {
    result = -result;
  }
  result = Math.floor(result + EPS);
  if (result === 0) {
    if (deviceDPR === 1 || !isIOS) {
      return 1
    } else {
      return 0.5
    }
  }
  return number < 0 ? -result : result
}

var protocols = {};

const CALLBACKS = ['success', 'fail', 'cancel', 'complete'];

function processCallback (methodName, method, returnValue) {
  return function (res) {
    return method(processReturnValue(methodName, res, returnValue))
  }
}

function processArgs (methodName, fromArgs, argsOption = {}, returnValue = {}, keepFromArgs = false) {
  if (isPlainObject(fromArgs)) { // 一般 api 的参数解析
    const toArgs = keepFromArgs === true ? fromArgs : {}; // returnValue 为 false 时，说明是格式化返回值，直接在返回值对象上修改赋值
    if (isFn(argsOption)) {
      argsOption = argsOption(fromArgs, toArgs) || {};
    }
    for (let key in fromArgs) {
      if (hasOwn(argsOption, key)) {
        let keyOption = argsOption[key];
        if (isFn(keyOption)) {
          keyOption = keyOption(fromArgs[key], fromArgs, toArgs);
        }
        if (!keyOption) { // 不支持的参数
          console.warn(`微信小程序 ${methodName}暂不支持${key}`);
        } else if (isStr(keyOption)) { // 重写参数 key
          toArgs[keyOption] = fromArgs[key];
        } else if (isPlainObject(keyOption)) { // {name:newName,value:value}可重新指定参数 key:value
          toArgs[keyOption.name ? keyOption.name : key] = keyOption.value;
        }
      } else if (CALLBACKS.includes(key)) {
        toArgs[key] = processCallback(methodName, fromArgs[key], returnValue);
      } else {
        if (!keepFromArgs) {
          toArgs[key] = fromArgs[key];
        }
      }
    }
    return toArgs
  } else if (isFn(fromArgs)) {
    fromArgs = processCallback(methodName, fromArgs, returnValue);
  }
  return fromArgs
}

function processReturnValue (methodName, res, returnValue, keepReturnValue = false) {
  if (isFn(protocols.returnValue)) { // 处理通用 returnValue
    res = protocols.returnValue(methodName, res);
  }
  return processArgs(methodName, res, returnValue, {}, keepReturnValue)
}

function wrapper (methodName, method) {
  if (hasOwn(protocols, methodName)) {
    const protocol = protocols[methodName];
    if (!protocol) { // 暂不支持的 api
      return function () {
        console.error(`微信小程序 暂不支持${methodName}`);
      }
    }
    return function (arg1, arg2) { // 目前 api 最多两个参数
      let options = protocol;
      if (isFn(protocol)) {
        options = protocol(arg1);
      }

      arg1 = processArgs(methodName, arg1, options.args, options.returnValue);

      const returnValue = wx[options.name || methodName](arg1, arg2);
      if (isSyncApi(methodName)) { // 同步 api
        return processReturnValue(methodName, returnValue, options.returnValue, isContextApi(methodName))
      }
      return returnValue
    }
  }
  return method
}

const todoApis = Object.create(null);

const TODOS = [
  'subscribePush',
  'unsubscribePush',
  'onPush',
  'offPush',
  'share'
];

function createTodoApi (name) {
  return function todoApi ({
    fail,
    complete
  }) {
    const res = {
      errMsg: `${name}:fail:暂不支持 ${name} 方法`
    };
    isFn(fail) && fail(res);
    isFn(complete) && complete(res);
  }
}

TODOS.forEach(function (name) {
  todoApis[name] = createTodoApi(name);
});

var providers = {
  oauth: ['weixin'],
  share: ['weixin'],
  payment: ['wxpay'],
  push: ['weixin']
};

function getProvider ({
  service,
  success,
  fail,
  complete
}) {
  let res = false;
  if (providers[service]) {
    res = {
      errMsg: 'getProvider:ok',
      service,
      provider: providers[service]
    };
    isFn(success) && success(res);
  } else {
    res = {
      errMsg: 'getProvider:fail:服务[' + service + ']不存在'
    };
    isFn(fail) && fail(res);
  }
  isFn(complete) && complete(res);
}

var extraApi = /*#__PURE__*/Object.freeze({
  getProvider: getProvider
});



var api = /*#__PURE__*/Object.freeze({

});

let uni = {};

if (typeof Proxy !== 'undefined') {
  uni = new Proxy({}, {
    get (target, name) {
      if (name === 'upx2px') {
        return upx2px
      }
      if (api[name]) {
        return promisify(name, api[name])
      }
      if (extraApi[name]) {
        return promisify(name, extraApi[name])
      }
      if (todoApis[name]) {
        return promisify(name, todoApis[name])
      }
      if (!hasOwn(wx, name) && !hasOwn(protocols, name)) {
        return
      }
      return promisify(name, wrapper(name, wx[name]))
    }
  });
} else {
  uni.upx2px = upx2px;

  Object.keys(todoApis).forEach(name => {
    uni[name] = promisify(name, todoApis[name]);
  });

  Object.keys(extraApi).forEach(name => {
    uni[name] = promisify(name, todoApis[name]);
  });

  Object.keys(api).forEach(name => {
    uni[name] = promisify(name, api[name]);
  });

  Object.keys(wx).forEach(name => {
    if (hasOwn(wx, name) || hasOwn(protocols, name)) {
      uni[name] = promisify(name, wrapper(name, wx[name]));
    }
  });
}

var uni$1 = uni;

/* harmony default export */ __webpack_exports__["default"] = (uni$1);


/***/ }),

/***/ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js ***!
  \****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);


function callHook$1(vm, hook, params) {
  var handlers = vm.$options[hook];
  if (hook === 'onError' && handlers) {
    handlers = [handlers];
  }
  if(typeof handlers === 'function'){
    handlers = [handlers]
  }

  var ret;
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
//      try {
        ret = handlers[i].call(vm, params);
//       } catch (e) {//fixed by xxxxxx
//         handleError(e, vm, (hook + " hook"));
//       }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }

  // for child
  if (vm.$children.length) {
    vm.$children.forEach(function (v) {
      return callHook$1(v, hook, params);
    });
  }

  return ret
}

function getRootVueVm(page) {
  return page.$vm.$root;
}

/* harmony default export */ __webpack_exports__["default"] = (function (App) {
  return {
    // 页面的初始数据
    data: {
      $root: {}
    },

    // mp lifecycle for vue
    // 生命周期函数--监听页面加载
    onLoad:function onLoad(query) {
      //页面加载的时候
      var app = new vue__WEBPACK_IMPORTED_MODULE_0___default.a(App);
      // 挂载Vue对象到page上
      this.$vm = app;
      var rootVueVM = app.$root;
      rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
      
      //初始化mp对象
      if (!rootVueVM.$mp) {
        rootVueVM.$mp = {};
      }
      var mp = rootVueVM.$mp;
      mp.mpType = 'page';
      mp.page = this;
      mp.query = query;
      mp.status = 'load';
      //mount 要在 mp.status = 'load';赋值之后，不然mount方法会重复添加微信Page
      //具体原因参考mpvue核心库源码，_initMP方法
      app.$mount();
    },

    handleProxy: function handleProxy(e) {
      var rootVueVM = getRootVueVm(this);
      return rootVueVM.$handleProxyWithVue(e)
    },

    // 生命周期函数--监听页面显示
    onShow:function onShow() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'show';
      callHook$1(rootVueVM, 'onShow');
      //   // 只有页面需要 setData
      rootVueVM.$nextTick(function () {
        rootVueVM._initDataToMP();
      });
    },

    // 生命周期函数--监听页面初次渲染完成
    onReady:function onReady() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'ready';
      callHook$1(rootVueVM, 'onReady');
    },

    // 生命周期函数--监听页面隐藏
    onHide: function onHide() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'hide';
      callHook$1(rootVueVM, 'onHide');
    },

    // 生命周期函数--监听页面卸载
    onUnload: function onUnload() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onUnload');
      rootVueVM.$destroy();
    },

    // 页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh: function onPullDownRefresh() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onPullDownRefresh');
    },

    // 页面上拉触底事件的处理函数
    onReachBottom: function onReachBottom() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onReachBottom');
    },

    // Do something when page scroll
    onPageScroll: function onPageScroll(options) {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onPageScroll', options);
    },

    // 当前是 tab 页时，点击 tab 时触发
    onTabItemTap: function onTabItemTap(options) {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onTabItemTap', options);
    },
		
    // // 用户点击右上角分享
    onShareAppMessage: App.onShareAppMessage ?
      function (options) {
        var rootVueVM = getRootVueVm(this);
        return callHook$1(rootVueVM, 'onShareAppMessage', options);
      } : null,

    //fixed by xxxxxx
    onNavigationBarButtonTap: function onNavigationBarButtonTap(options) {
        var rootVueVM = getRootVueVm(this);
    		callHook$1(rootVueVM, "onNavigationBarButtonTap", options)
    },
    onNavigationBarSearchInputChanged: function onNavigationBarSearchInputChanged(options) {
        var rootVueVM = getRootVueVm(this);
    		callHook$1(rootVueVM, "onNavigationBarSearchInputChanged", options)
    },
    onNavigationBarSearchInputConfirmed: function onNavigationBarSearchInputConfirmed(options) {
        var rootVueVM = getRootVueVm(this);
    		callHook$1(rootVueVM, "onNavigationBarSearchInputConfirmed", options)
    },
    onNavigationBarSearchInputClicked: function onNavigationBarSearchInputClicked(options) {
        var rootVueVM = getRootVueVm(this);
    		callHook$1(rootVueVM, "onNavigationBarSearchInputClicked", options)
    },
    onBackPress: function onBackPress(options) {
        var rootVueVM = getRootVueVm(this);
    		return callHook$1(rootVueVM, "onBackPress",options)
    },
		$getAppWebview:function (e) {
				return plus.webview.getWebviewById('' + this.__wxWebviewId__)
		}
  };
});


/***/ }),

/***/ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// fix env
try {
    if (!global) global = {}
    global.process = global.process || {}
    global.process.env = global.process.env || {}
    global.App = global.App || App
    global.Page = global.Page || Page
    global.Component = global.Component || Component
    global.getApp = global.getApp || getApp
} catch (e) {}

;(function(global, factory) {
     true
        ? (module.exports = factory())
        : undefined
})(this, function() {
    "use strict"

    //fixed by xxxxxx
    function calcDiff(holder, key, newObj, oldObj) {
        if (newObj === oldObj || newObj === undefined) {
            return
        }

        if (newObj == null || oldObj == null || typeof newObj !== typeof oldObj) {
            holder[key] = newObj
        } else if (Array.isArray(newObj) && Array.isArray(oldObj)) {
            if (newObj.length === oldObj.length) {
                for (var i = 0, len = newObj.length; i < len; ++i) {
                    calcDiff(holder, key + "[" + i + "]", newObj[i], oldObj[i])
                }
            } else {
                holder[key] = newObj
            }
        } else if (typeof newObj === "object" && typeof oldObj === "object") {
            var newKeys = Object.keys(newObj)
            var oldKeys = Object.keys(oldObj)

            if (newKeys.length !== oldKeys.length) {
                holder[key] = newObj
            } else {
                var allKeysSet = Object.create(null)
                for (var i = 0, len = newKeys.length; i < len; ++i) {
                    allKeysSet[newKeys[i]] = true
                    allKeysSet[oldKeys[i]] = true
                }
                if (Object.keys(allKeysSet).length !== newKeys.length) {
                    holder[key] = newObj
                } else {
                    for (var i = 0, len = newKeys.length; i < len; ++i) {
                        var k = newKeys[i]
                        calcDiff(holder, key + "." + k, newObj[k], oldObj[k])
                    }
                }
            }
        } else if (newObj !== oldObj) {
            holder[key] = newObj
        }
    }

    function diff(newObj, oldObj) {
        var keys = Object.keys(newObj)
        var diffResult = {}
        for (var i = 0, len = keys.length; i < len; ++i) {
            var k = keys[i]
            var oldKeyPath = k.split(".")
            var oldValue = oldObj[oldKeyPath[0]]
            for (var j = 1, jlen = oldKeyPath.length; j < jlen && oldValue !== undefined; ++j) {
                oldValue = oldValue[oldKeyPath[j]]
            }
            calcDiff(diffResult, k, newObj[k], oldValue)
        }
        return diffResult
    }

    /*  */

    // these helpers produces better vm code in JS engines due to their
    // explicitness and function inlining
    function isUndef(v) {
        return v === undefined || v === null
    }

    function isDef(v) {
        return v !== undefined && v !== null
    }

    function isTrue(v) {
        return v === true
    }

    function isFalse(v) {
        return v === false
    }

    /**
     * Check if value is primitive
     */
    function isPrimitive(value) {
        return typeof value === "string" || typeof value === "number"
    }

    /**
     * Quick object check - this is primarily used to tell
     * Objects from primitive values when we know the value
     * is a JSON-compliant type.
     */
    function isObject(obj) {
        return obj !== null && typeof obj === "object"
    }

    var _toString = Object.prototype.toString

    /**
     * Strict object type check. Only returns true
     * for plain JavaScript objects.
     */
    function isPlainObject(obj) {
        return _toString.call(obj) === "[object Object]"
    }

    function isRegExp(v) {
        return _toString.call(v) === "[object RegExp]"
    }

    /**
     * Check if val is a valid array index.
     */
    function isValidArrayIndex(val) {
        var n = parseFloat(val)
        return n >= 0 && Math.floor(n) === n && isFinite(val)
    }

    /**
     * Convert a value to a string that is actually rendered.
     */
    function toString(val) {
        return val == null
            ? ""
            : typeof val === "object"
                ? JSON.stringify(val, null, 2)
                : String(val)
    }

    /**
     * Convert a input value to a number for persistence.
     * If the conversion fails, return original string.
     */
    function toNumber(val) {
        var n = parseFloat(val)
        return isNaN(n) ? val : n
    }

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     */
    function makeMap(str, expectsLowerCase) {
        var map = Object.create(null)
        var list = str.split(",")
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true
        }
        return expectsLowerCase
            ? function(val) {
                  return map[val.toLowerCase()]
              }
            : function(val) {
                  return map[val]
              }
    }

    /**
     * Check if a tag is a built-in tag.
     */
    var isBuiltInTag = makeMap("slot,component", true)

    /**
     * Check if a attribute is a reserved attribute.
     */
    var isReservedAttribute = makeMap("key,ref,slot,is")

    /**
     * Remove an item from an array
     */
    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item)
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Check whether the object has the property.
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty

    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    /**
     * Create a cached version of a pure function.
     */
    function cached(fn) {
        var cache = Object.create(null)
        return function cachedFn(str) {
            var hit = cache[str]
            return hit || (cache[str] = fn(str))
        }
    }

    /**
     * Camelize a hyphen-delimited string.
     */
    var camelizeRE = /-(\w)/g
    var camelize = cached(function(str) {
        return str.replace(camelizeRE, function(_, c) {
            return c ? c.toUpperCase() : ""
        })
    })

    /**
     * Capitalize a string.
     */
    var capitalize = cached(function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    })

    /**
     * Hyphenate a camelCase string.
     */
    var hyphenateRE = /([^-])([A-Z])/g
    var hyphenate = cached(function(str) {
        return str
            .replace(hyphenateRE, "$1-$2")
            .replace(hyphenateRE, "$1-$2")
            .toLowerCase()
    })

    /**
     * Simple bind, faster than native
     */
    function bind(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length
            return l ? (l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a)) : fn.call(ctx)
        }
        // record original fn length
        boundFn._length = fn.length
        return boundFn
    }

    /**
     * Convert an Array-like object to a real Array.
     */
    function toArray(list, start) {
        start = start || 0
        var i = list.length - start
        var ret = new Array(i)
        while (i--) {
            ret[i] = list[i + start]
        }
        return ret
    }

    /**
     * Mix properties into target object.
     */
    function extend(to, _from) {
        for (var key in _from) {
            to[key] = _from[key]
        }
        return to
    }

    /**
     * Merge an Array of Objects into a single Object.
     */
    function toObject(arr) {
        var res = {}
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i])
            }
        }
        return res
    }

    /**
     * Perform no operation.
     * Stubbing args to make Flow happy without leaving useless transpiled code
     * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
     */
    function noop(a, b, c) {}

    /**
     * Always return false.
     */
    var no = function(a, b, c) {
        return false
    }

    /**
     * Return same value
     */
    var identity = function(_) {
        return _
    }

    /**
     * Generate a static keys string from compiler modules.
     */

    /**
     * Check if two values are loosely equal - that is,
     * if they are plain objects, do they have the same shape?
     */
    function looseEqual(a, b) {
        var isObjectA = isObject(a)
        var isObjectB = isObject(b)
        if (isObjectA && isObjectB) {
            try {
                return JSON.stringify(a) === JSON.stringify(b)
            } catch (e) {
                // possible circular reference
                return a === b
            }
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) {
                return i
            }
        }
        return -1
    }

    /**
     * Ensure a function is called only once.
     */
    function once(fn) {
        var called = false
        return function() {
            if (!called) {
                called = true
                fn.apply(this, arguments)
            }
        }
    }

    var SSR_ATTR = "data-server-rendered"

    var ASSET_TYPES = ["component", "directive", "filter"]

    var LIFECYCLE_HOOKS = [
        "beforeCreate",
        "created",
        "beforeMount",
        "mounted",
        "beforeUpdate",
        "updated",
        "beforeDestroy",
        "destroyed",
        "activated",
        "deactivated",
        "onLaunch",
        "onLoad",
        "onShow",
        "onReady",
        "onHide",
        "onUnload",
        "onPullDownRefresh",
        "onReachBottom",
        "onShareAppMessage",
        "onPageScroll",
        "onTabItemTap",
        "attached",
        "ready",
        "moved",
        "detached",
        "onUniNViewMessage", //fixed by xxxxxx
        "onNavigationBarButtonTap", //fixed by xxxxxx
        "onBackPress",//fixed by xxxxxx
    ]

    /*  */

    var config = {
        /**
         * Option merge strategies (used in core/util/options)
         */
        optionMergeStrategies: Object.create(null),

        /**
         * Whether to suppress warnings.
         */
        silent: false,

        /**
         * Show production mode tip message on boot?
         */
        productionTip: "production" !== "production",

        /**
         * Whether to enable devtools
         */
        devtools: "production" !== "production",

        /**
         * Whether to record perf
         */
        performance: false,

        /**
         * Error handler for watcher errors
         */
        errorHandler: null,

        /**
         * Warn handler for watcher warns
         */
        warnHandler: null,

        /**
         * Ignore certain custom elements
         */
        ignoredElements: [],

        /**
         * Custom user key aliases for v-on
         */
        keyCodes: Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         */
        isReservedTag: no,

        /**
         * Check if an attribute is reserved so that it cannot be used as a component
         * prop. This is platform-dependent and may be overwritten.
         */
        isReservedAttr: no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         */
        isUnknownElement: no,

        /**
         * Get the namespace of an element
         */
        getTagNamespace: noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName: identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp: no,

        /**
         * Exposed for legacy reasons
         */
        _lifecycleHooks: LIFECYCLE_HOOKS
    }

    /*  */

    var emptyObject = Object.freeze({})

    /**
     * Check if a string starts with $ or _
     */
    function isReserved(str) {
        var c = (str + "").charCodeAt(0)
        return c === 0x24 || c === 0x5f
    }

    /**
     * Define a property.
     */
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        })
    }

    /**
     * Parse simple path.
     */
    var bailRE = /[^\w.$]/

    function parsePath(path) {
        if (bailRE.test(path)) {
            return
        }
        var segments = path.split(".")
        return function(obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj) {
                    return
                }
                obj = obj[segments[i]]
            }
            return obj
        }
    }

    /*  */

    var warn = noop

    var formatComponentName = null // work around flow check

    /*  */

    function handleError(err, vm, info) {
        if (config.errorHandler) {
            config.errorHandler.call(null, err, vm, info)
        } else {
            if (inBrowser && typeof console !== "undefined") {
                console.error(err)
            } else {
                throw err
            }
        }
    }

    /*  */

    // can we use __proto__?
    var hasProto = "__proto__" in {}

    // Browser environment sniffing
    var inBrowser = typeof window !== "undefined"
    var UA = ["mpvue-runtime"].join()
    var isIE = UA && /msie|trident/.test(UA)
    var isIE9 = UA && UA.indexOf("msie 9.0") > 0
    var isEdge = UA && UA.indexOf("edge/") > 0
    var isAndroid = UA && UA.indexOf("android") > 0
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

    // Firefix has a "watch" function on Object.prototype...
    var nativeWatch = {}.watch

    var supportsPassive = false
    if (inBrowser) {
        try {
            var opts = {}
            Object.defineProperty(opts, "passive", {
                get: function get() {
                    /* istanbul ignore next */
                    supportsPassive = true
                }
            }) // https://github.com/facebook/flow/issues/285
            window.addEventListener("test-passive", null, opts)
        } catch (e) {}
    }

    // this needs to be lazy-evaled because vue may be required before
    // vue-server-renderer can set VUE_ENV
    var _isServer
    var isServerRendering = function() {
        if (_isServer === undefined) {
            /* istanbul ignore if */
            if (!inBrowser && typeof global !== "undefined") {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global["process"].env.VUE_ENV === "server"
            } else {
                _isServer = false
            }
        }
        return _isServer
    }

    // detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

    /* istanbul ignore next */
    function isNative(Ctor) {
        return typeof Ctor === "function" && /native code/.test(Ctor.toString())
    }

    var hasSymbol =
        typeof Symbol !== "undefined" &&
        isNative(Symbol) &&
        typeof Reflect !== "undefined" &&
        isNative(Reflect.ownKeys)

    /**
     * Defer a task to execute it asynchronously.
     */
    var nextTick = (function() {
        var callbacks = []
        var pending = false
        var timerFunc

        function nextTickHandler() {
            pending = false
            var copies = callbacks.slice(0)
            callbacks.length = 0
            for (var i = 0; i < copies.length; i++) {
                copies[i]()
            }
        }

        // the nextTick behavior leverages the microtask queue, which can be accessed
        // via either native Promise.then or MutationObserver.
        // MutationObserver has wider support, however it is seriously bugged in
        // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
        // completely stops working after triggering a few times... so, if native
        // Promise is available, we will use it:
        /* istanbul ignore if */
        if (typeof Promise !== "undefined" && isNative(Promise)) {
            var p = Promise.resolve()
            var logError = function(err) {
                console.error(err)
            }
            timerFunc = function() {
                p.then(nextTickHandler).catch(logError)
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if (isIOS) {
                    setTimeout(noop)
                }
            }
            // } else if (typeof MutationObserver !== 'undefined' && (
            //   isNative(MutationObserver) ||
            //   // PhantomJS and iOS 7.x
            //   MutationObserver.toString() === '[object MutationObserverConstructor]'
            // )) {
            //   // use MutationObserver where native Promise is not available,
            //   // e.g. PhantomJS IE11, iOS7, Android 4.4
            //   var counter = 1
            //   var observer = new MutationObserver(nextTickHandler)
            //   var textNode = document.createTextNode(String(counter))
            //   observer.observe(textNode, {
            //     characterData: true
            //   })
            //   timerFunc = () => {
            //     counter = (counter + 1) % 2
            //     textNode.data = String(counter)
            //   }
        } else {
            // fallback to setTimeout
            /* istanbul ignore next */
            timerFunc = function() {
                setTimeout(nextTickHandler, 0)
            }
        }

        return function queueNextTick(cb, ctx) {
            var _resolve
            callbacks.push(function() {
                if (cb) {
                    try {
                        cb.call(ctx)
                    } catch (e) {
                        handleError(e, ctx, "nextTick")
                    }
                } else if (_resolve) {
                    _resolve(ctx)
                }
            })
            if (!pending) {
                pending = true
                timerFunc()
            }
            if (!cb && typeof Promise !== "undefined") {
                return new Promise(function(resolve, reject) {
                    _resolve = resolve
                })
            }
        }
    })()

    var _Set
    /* istanbul ignore if */
    if (typeof Set !== "undefined" && isNative(Set)) {
        // use native Set when available.
        _Set = Set
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        _Set = (function() {
            function Set() {
                this.set = Object.create(null)
            }
            Set.prototype.has = function has(key) {
                return this.set[key] === true
            }
            Set.prototype.add = function add(key) {
                this.set[key] = true
            }
            Set.prototype.clear = function clear() {
                this.set = Object.create(null)
            }

            return Set
        })()
    }

    /*  */

    var uid$1 = 0

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */
    var Dep = function Dep() {
        this.id = uid$1++
        this.subs = []
    }

    Dep.prototype.addSub = function addSub(sub) {
        this.subs.push(sub)
    }

    Dep.prototype.removeSub = function removeSub(sub) {
        remove(this.subs, sub)
    }

    Dep.prototype.depend = function depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    Dep.prototype.notify = function notify() {
        // stabilize the subscriber list first
        var subs = this.subs.slice()
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }

    // the current target watcher being evaluated.
    // this is globally unique because there could be only one
    // watcher being evaluated at any time.
    Dep.target = null
    var targetStack = []

    function pushTarget(_target) {
        if (Dep.target) {
            targetStack.push(Dep.target)
        }
        Dep.target = _target
    }

    function popTarget() {
        Dep.target = targetStack.pop()
    }

    /*
     * not type checking this file because flow doesn't play well with
     * dynamically accessing methods on Array prototype
     */

    var arrayProto = Array.prototype
    var arrayMethods = Object.create(arrayProto)
    ;["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function(method) {
        // cache original method
        var original = arrayProto[method]
        def(arrayMethods, method, function mutator() {
            var args = [],
                len = arguments.length
            while (len--) args[len] = arguments[len]

            var result = original.apply(this, args)
            var ob = this.__ob__
            var inserted
            switch (method) {
                case "push":
                case "unshift":
                    inserted = args
                    break
                case "splice":
                    inserted = args.slice(2)
                    break
            }
            if (inserted) {
                ob.observeArray(inserted)
            }
            // notify change
            ob.dep.notify()
            return result
        })
    })

    /*  */

    var arrayKeys = Object.getOwnPropertyNames(arrayMethods)

    /**
     * By default, when a reactive property is set, the new value is
     * also converted to become reactive. However when passing down props,
     * we don't want to force conversion because the value may be a nested value
     * under a frozen data structure. Converting it would defeat the optimization.
     */
    var observerState = {
        shouldConvert: true
    }

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     */
    var Observer = function Observer(value) {
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0
        def(value, "__ob__", this)
        if (Array.isArray(value)) {
            var augment = hasProto ? protoAugment : copyAugment
            augment(value, arrayMethods, arrayKeys)
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj)
        for (var i = 0; i < keys.length; i++) {
            defineReactive$$1(obj, keys[i], obj[keys[i]])
        }
    }

    /**
     * Observe a list of Array items.
     */
    Observer.prototype.observeArray = function observeArray(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }

    // helpers

    /**
     * Augment an target Object or Array by intercepting
     * the prototype chain using __proto__
     */
    function protoAugment(target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src
        /* eslint-enable no-proto */
    }

    /**
     * Augment an target Object or Array by defining
     * hidden properties.
     */
    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i]
            def(target, key, src[key])
        }
    }

    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     */
    function observe(value, asRootData) {
        if (!isObject(value)) {
            return
        }
        var ob
        if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
            ob = value.__ob__
        } else if (
            observerState.shouldConvert &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            !value._isVue
        ) {
            ob = new Observer(value)
        }
        if (asRootData && ob) {
            ob.vmCount++
        }
        return ob
    }

    /**
     * Define a reactive property on an Object.
     */
    function defineReactive$$1(obj, key, val, customSetter, shallow) {
        var dep = new Dep()

        var property = Object.getOwnPropertyDescriptor(obj, key)
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get
        var setter = property && property.set

        var childOb = !shallow && observe(val)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val
                if (Dep.target) {
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                    }
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
                return value
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if (false) {}
                if (setter) {
                    setter.call(obj, newVal)
                } else {
                    val = newVal
                }
                childOb = !shallow && observe(newVal)
                dep.notify()
            }
        })
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     */
    function set(target, key, val) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.length = Math.max(target.length, key)
            target.splice(key, 1, val)
            return val
        }
        if (hasOwn(target, key)) {
            target[key] = val
            return val
        }
        var ob = target.__ob__
        if (target._isVue || (ob && ob.vmCount)) {
             false &&
                false
            return val
        }
        if (!ob) {
            target[key] = val
            return val
        }
        defineReactive$$1(ob.value, key, val)
        ob.dep.notify()
        return val
    }

    /**
     * Delete a property and trigger change if necessary.
     */
    function del(target, key) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1)
            return
        }
        var ob = target.__ob__
        if (target._isVue || (ob && ob.vmCount)) {
             false &&
                false
            return
        }
        if (!hasOwn(target, key)) {
            return
        }
        delete target[key]
        if (!ob) {
            return
        }
        ob.dep.notify()
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for (var e = void 0, i = 0, l = value.length; i < l; i++) {
            e = value[i]
            e && e.__ob__ && e.__ob__.dep.depend()
            if (Array.isArray(e)) {
                dependArray(e)
            }
        }
    }

    /*  */

    /**
     * Option overwriting strategies are functions that handle
     * how to merge a parent option value and a child option
     * value into the final value.
     */
    var strats = config.optionMergeStrategies

    /**
     * Options with restrictions
     */
    /**
     * Helper that recursively merges two data objects together.
     */
    function mergeData(to, from) {
        if (!from) {
            return to
        }
        var key, toVal, fromVal
        var keys = Object.keys(from)
        for (var i = 0; i < keys.length; i++) {
            key = keys[i]
            toVal = to[key]
            fromVal = from[key]
            if (!hasOwn(to, key)) {
                set(to, key, fromVal)
            } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
                mergeData(toVal, fromVal)
            }
        }
        return to
    }

    /**
     * Data
     */
    function mergeDataOrFn(parentVal, childVal, vm) {
        if (!vm) {
            // in a Vue.extend merge, both should be functions
            if (!childVal) {
                return parentVal
            }
            if (!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn() {
                return mergeData(
                    typeof childVal === "function" ? childVal.call(this) : childVal,
                    parentVal.call(this)
                )
            }
        } else if (parentVal || childVal) {
            return function mergedInstanceDataFn() {
                // instance merge
                var instanceData = typeof childVal === "function" ? childVal.call(vm) : childVal
                var defaultData = typeof parentVal === "function" ? parentVal.call(vm) : undefined
                if (instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    }

    strats.data = function(parentVal, childVal, vm) {
        if (!vm) {
            if (childVal && typeof childVal !== "function") {
                 false &&
                    false

                return parentVal
            }
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    }

    /**
     * Hooks and props are merged as arrays.
     */
    function mergeHook(parentVal, childVal) {
        return childVal
            ? parentVal
                ? parentVal.concat(childVal)
                : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
            : parentVal
    }

    LIFECYCLE_HOOKS.forEach(function(hook) {
        strats[hook] = mergeHook
    })

    /**
     * Assets
     *
     * When a vm is present (instance creation), we need to do
     * a three-way merge between constructor options, instance
     * options and parent options.
     */
    function mergeAssets(parentVal, childVal) {
        var res = Object.create(parentVal || null)
        return childVal ? extend(res, childVal) : res
    }

    ASSET_TYPES.forEach(function(type) {
        strats[type + "s"] = mergeAssets
    })

    /**
     * Watchers.
     *
     * Watchers hashes should not overwrite one
     * another, so we merge them as arrays.
     */
    strats.watch = function(parentVal, childVal) {
        // work around Firefox's Object.prototype.watch...
        if (parentVal === nativeWatch) {
            parentVal = undefined
        }
        if (childVal === nativeWatch) {
            childVal = undefined
        }
        /* istanbul ignore if */
        if (!childVal) {
            return Object.create(parentVal || null)
        }
        if (!parentVal) {
            return childVal
        }
        var ret = {}
        extend(ret, parentVal)
        for (var key in childVal) {
            var parent = ret[key]
            var child = childVal[key]
            if (parent && !Array.isArray(parent)) {
                parent = [parent]
            }
            ret[key] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child]
        }
        return ret
    }

    /**
     * Other object hashes.
     */
    strats.props = strats.methods = strats.inject = strats.computed = function(
        parentVal,
        childVal
    ) {
        if (!childVal) {
            return Object.create(parentVal || null)
        }
        if (!parentVal) {
            return childVal
        }
        var ret = Object.create(null)
        extend(ret, parentVal)
        extend(ret, childVal)
        return ret
    }
    strats.provide = mergeDataOrFn

    /**
     * Default strategy.
     */
    var defaultStrat = function(parentVal, childVal) {
        return childVal === undefined ? parentVal : childVal
    }

    /**
     * Ensure all props option syntax are normalized into the
     * Object-based format.
     */
    function normalizeProps(options) {
        var props = options.props
        if (!props) {
            return
        }
        var res = {}
        var i, val, name
        if (Array.isArray(props)) {
            i = props.length
            while (i--) {
                val = props[i]
                if (typeof val === "string") {
                    name = camelize(val)
                    res[name] = {
                        type: null
                    }
                } else {
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key]
                name = camelize(key)
                res[name] = isPlainObject(val)
                    ? val
                    : {
                          type: val
                      }
            }
        }
        options.props = res
    }

    /**
     * Normalize all injections into Object-based format
     */
    function normalizeInject(options) {
        var inject = options.inject
        if (Array.isArray(inject)) {
            var normalized = (options.inject = {})
            for (var i = 0; i < inject.length; i++) {
                normalized[inject[i]] = inject[i]
            }
        }
    }

    /**
     * Normalize raw function directives into object format.
     */
    function normalizeDirectives(options) {
        var dirs = options.directives
        if (dirs) {
            for (var key in dirs) {
                var def = dirs[key]
                if (typeof def === "function") {
                    dirs[key] = {
                        bind: def,
                        update: def
                    }
                }
            }
        }
    }

    /**
     * Merge two option objects into a new one.
     * Core utility used in both instantiation and inheritance.
     */
    function mergeOptions(parent, child, vm) {
        if (typeof child === "function") {
            child = child.options
        }

        normalizeProps(child)
        normalizeInject(child)
        normalizeDirectives(child)
        var extendsFrom = child.extends
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm)
        }
        if (child.mixins) {
            for (var i = 0, l = child.mixins.length; i < l; i++) {
                parent = mergeOptions(parent, child.mixins[i], vm)
            }
        }
        var options = {}
        var key
        for (key in parent) {
            mergeField(key)
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key)
            }
        }

        function mergeField(key) {
            var strat = strats[key] || defaultStrat
            options[key] = strat(parent[key], child[key], vm, key)
        }
        return options
    }

    /**
     * Resolve an asset.
     * This function is used because child instances need access
     * to assets defined in its ancestor chain.
     */
    function resolveAsset(options, type, id, warnMissing) {
        /* istanbul ignore if */
        if (typeof id !== "string") {
            return
        }
        var assets = options[type]
        // check local registration variations first
        if (hasOwn(assets, id)) {
            return assets[id]
        }
        var camelizedId = camelize(id)
        if (hasOwn(assets, camelizedId)) {
            return assets[camelizedId]
        }
        var PascalCaseId = capitalize(camelizedId)
        if (hasOwn(assets, PascalCaseId)) {
            return assets[PascalCaseId]
        }
        // fallback to prototype chain
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
        if (false) {}
        return res
    }

    /*  */

    function validateProp(key, propOptions, propsData, vm) {
        var prop = propOptions[key]
        var absent = !hasOwn(propsData, key)
        var value = propsData[key]
        // handle boolean props
        if (isType(Boolean, prop.type)) {
            if (absent && !hasOwn(prop, "default")) {
                value = false
            } else if (!isType(String, prop.type) && (value === "" || value === hyphenate(key))) {
                value = true
            }
        }
        // check default value
        if (value === undefined) {
            value = getPropDefaultValue(vm, prop, key)
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert
            observerState.shouldConvert = true
            observe(value)
            observerState.shouldConvert = prevShouldConvert
        }
        return value
    }

    /**
     * Get the default value of a prop.
     */
    function getPropDefaultValue(vm, prop, key) {
        // no default, return undefined
        if (!hasOwn(prop, "default")) {
            return undefined
        }
        var def = prop.default
        // warn against non-factory defaults for Object & Array
        if (false) {}
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if (
            vm &&
            vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm._props[key] !== undefined
        ) {
            return vm._props[key]
        }
        // call factory function for non-Function types
        // a value is Function if its prototype is function even across different execution context
        return typeof def === "function" && getType(prop.type) !== "Function" ? def.call(vm) : def
    }

    /**
     * Use function string name to check built-in types,
     * because a simple equality check will fail when running
     * across different vms / iframes.
     */
    function getType(fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/)
        return match ? match[1] : ""
    }

    function isType(type, fn) {
        if (!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for (var i = 0, len = fn.length; i < len; i++) {
            if (getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }

    /*  */

    /* not type checking this file because flow doesn't play well with Proxy */

    var mark
    var measure

    /*  */

    var VNode = function VNode(
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions,
        asyncFactory
    ) {
        this.tag = tag
        this.data = data
        this.children = children
        this.text = text
        this.elm = elm
        this.ns = undefined
        this.context = context
        this.functionalContext = undefined
        this.key = data && data.key
        this.componentOptions = componentOptions
        this.componentInstance = undefined
        this.parent = undefined
        this.raw = false
        this.isStatic = false
        this.isRootInsert = true
        this.isComment = false
        this.isCloned = false
        this.isOnce = false
        this.asyncFactory = asyncFactory
        this.asyncMeta = undefined
        this.isAsyncPlaceholder = false
    }

    var prototypeAccessors = {
        child: {}
    }

    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    prototypeAccessors.child.get = function() {
        return this.componentInstance
    }

    Object.defineProperties(VNode.prototype, prototypeAccessors)

    var createEmptyVNode = function(text) {
        if (text === void 0) text = ""

        var node = new VNode()
        node.text = text
        node.isComment = true
        return node
    }

    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

    // optimized shallow clone
    // used for static nodes and slot nodes because they may be reused across
    // multiple renders, cloning them avoids errors when DOM manipulations rely
    // on their elm reference.
    function cloneVNode(vnode) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions,
            vnode.asyncFactory
        )
        cloned.ns = vnode.ns
        cloned.isStatic = vnode.isStatic
        cloned.key = vnode.key
        cloned.isComment = vnode.isComment
        cloned.isCloned = true
        return cloned
    }

    function cloneVNodes(vnodes) {
        var len = vnodes.length
        var res = new Array(len)
        for (var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i])
        }
        return res
    }

    /*  */

    var normalizeEvent = cached(function(name) {
        var passive = name.charAt(0) === "&"
        name = passive ? name.slice(1) : name
        var once$$1 = name.charAt(0) === "~" // Prefixed last, checked first
        name = once$$1 ? name.slice(1) : name
        var capture = name.charAt(0) === "!"
        name = capture ? name.slice(1) : name
        return {
            name: name,
            once: once$$1,
            capture: capture,
            passive: passive
        }
    })

    function createFnInvoker(fns) {
        function invoker() {
            var arguments$1 = arguments

            var fns = invoker.fns
            if (Array.isArray(fns)) {
                var cloned = fns.slice()
                for (var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1)
                }
            } else {
                // return handler return value for single handlers
                return fns.apply(null, arguments)
            }
        }
        invoker.fns = fns
        return invoker
    }

    function updateListeners(on, oldOn, add, remove$$1, vm) {
        var name, cur, old, event
        for (name in on) {
            cur = on[name]
            old = oldOn[name]
            event = normalizeEvent(name)
            if (isUndef(cur)) {
                 false &&
                    false
            } else if (isUndef(old)) {
                if (isUndef(cur.fns)) {
                    cur = on[name] = createFnInvoker(cur)
                }
                add(event.name, cur, event.once, event.capture, event.passive)
            } else if (cur !== old) {
                old.fns = cur
                on[name] = old
            }
        }
        for (name in oldOn) {
            if (isUndef(on[name])) {
                event = normalizeEvent(name)
                remove$$1(event.name, oldOn[name], event.capture)
            }
        }
    }

    /*  */

    /*  */

    function extractPropsFromVNodeData(data, Ctor, tag) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        var propOptions = Ctor.options.props
        if (isUndef(propOptions)) {
            return
        }
        var res = {}
        var attrs = data.attrs
        var props = data.props
        if (isDef(attrs) || isDef(props)) {
            for (var key in propOptions) {
                var altKey = hyphenate(key)
                checkProp(res, props, key, altKey, true) ||
                    checkProp(res, attrs, key, altKey, false)
            }
        }
        return res
    }

    function checkProp(res, hash, key, altKey, preserve) {
        if (isDef(hash)) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key]
                if (!preserve) {
                    delete hash[key]
                }
                return true
            } else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey]
                if (!preserve) {
                    delete hash[altKey]
                }
                return true
            }
        }
        return false
    }

    /*  */

    // The template compiler attempts to minimize the need for normalization by
    // statically analyzing the template at compile time.
    //
    // For plain HTML markup, normalization can be completely skipped because the
    // generated render function is guaranteed to return Array<VNode>. There are
    // two cases where extra normalization is needed:

    // 1. When the children contains components - because a functional component
    // may return an Array instead of a single root. In this case, just a simple
    // normalization is needed - if any child is an Array, we flatten the whole
    // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
    // because functional components already normalize their own children.
    function simpleNormalizeChildren(children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

    // 2. When the children contains constructs that always generated nested Arrays,
    // e.g. <template>, <slot>, v-for, or when the children is provided by user
    // with hand-written render functions / JSX. In such cases a full normalization
    // is needed to cater to all possible types of children values.
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined
    }

    function isTextNode(node) {
        return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = []
        var i, c, last
        for (i = 0; i < children.length; i++) {
            c = children[i]
            if (isUndef(c) || typeof c === "boolean") {
                continue
            }
            last = res[res.length - 1]
            //  nested
            if (Array.isArray(c)) {
                res.push.apply(res, normalizeArrayChildren(c, (nestedIndex || "") + "_" + i))
            } else if (isPrimitive(c)) {
                if (isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    last.text += String(c)
                } else if (c !== "") {
                    // convert primitive to vnode
                    res.push(createTextVNode(c))
                }
            } else {
                if (isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[res.length - 1] = createTextVNode(last.text + c.text)
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if (
                        isTrue(children._isVList) &&
                        isDef(c.tag) &&
                        isUndef(c.key) &&
                        isDef(nestedIndex)
                    ) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__"
                    }
                    res.push(c)
                }
            }
        }
        return res
    }

    /*  */

    function ensureCtor(comp, base) {
        if (comp.__esModule && comp.default) {
            comp = comp.default
        }
        return isObject(comp) ? base.extend(comp) : comp
    }

    function createAsyncPlaceholder(factory, data, context, children, tag) {
        var node = createEmptyVNode()
        node.asyncFactory = factory
        node.asyncMeta = {
            data: data,
            context: context,
            children: children,
            tag: tag
        }
        return node
    }

    function resolveAsyncComponent(factory, baseCtor, context) {
        if (isTrue(factory.error) && isDef(factory.errorComp)) {
            return factory.errorComp
        }

        if (isDef(factory.resolved)) {
            return factory.resolved
        }

        if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
            return factory.loadingComp
        }

        if (isDef(factory.contexts)) {
            // already pending
            factory.contexts.push(context)
        } else {
            var contexts = (factory.contexts = [context])
            var sync = true

            var forceRender = function() {
                for (var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate()
                }
            }

            var resolve = once(function(res) {
                // cache resolved
                factory.resolved = ensureCtor(res, baseCtor)
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if (!sync) {
                    forceRender()
                }
            })

            var reject = once(function(reason) {
                 false &&
                    false
                if (isDef(factory.errorComp)) {
                    factory.error = true
                    forceRender()
                }
            })

            var res = factory(resolve, reject)

            if (isObject(res)) {
                if (typeof res.then === "function") {
                    // () => Promise
                    if (isUndef(factory.resolved)) {
                        res.then(resolve, reject)
                    }
                } else if (isDef(res.component) && typeof res.component.then === "function") {
                    res.component.then(resolve, reject)

                    if (isDef(res.error)) {
                        factory.errorComp = ensureCtor(res.error, baseCtor)
                    }

                    if (isDef(res.loading)) {
                        factory.loadingComp = ensureCtor(res.loading, baseCtor)
                        if (res.delay === 0) {
                            factory.loading = true
                        } else {
                            setTimeout(function() {
                                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                                    factory.loading = true
                                    forceRender()
                                }
                            }, res.delay || 200)
                        }
                    }

                    if (isDef(res.timeout)) {
                        setTimeout(function() {
                            if (isUndef(factory.resolved)) {
                                reject(null)
                            }
                        }, res.timeout)
                    }
                }
            }

            sync = false
            // return in case resolved synchronously
            return factory.loading ? factory.loadingComp : factory.resolved
        }
    }

    /*  */

    function getFirstComponentChild(children) {
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                var c = children[i]
                if (isDef(c) && isDef(c.componentOptions)) {
                    return c
                }
            }
        }
    }

    /*  */

    /*  */

    function initEvents(vm) {
        vm._events = Object.create(null)
        vm._hasHookEvent = false
        // init parent attached events
        var listeners = vm.$options._parentListeners
        if (listeners) {
            updateComponentListeners(vm, listeners)
        }
    }

    var target

    function add(event, fn, once$$1) {
        if (once$$1) {
            target.$once(event, fn)
        } else {
            target.$on(event, fn)
        }
    }

    function remove$1(event, fn) {
        target.$off(event, fn)
    }

    function updateComponentListeners(vm, listeners, oldListeners) {
        target = vm
        updateListeners(listeners, oldListeners || {}, add, remove$1, vm)
    }

    function eventsMixin(Vue) {
        var hookRE = /^hook:/
        Vue.prototype.$on = function(event, fn) {
            var this$1 = this

            var vm = this
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this$1.$on(event[i], fn)
                }
            } else {
                ;(vm._events[event] || (vm._events[event] = [])).push(fn)
                // optimize hook:event cost by using a boolean flag marked at registration
                // instead of a hash lookup
                if (hookRE.test(event)) {
                    vm._hasHookEvent = true
                }
            }
            return vm
        }

        Vue.prototype.$once = function(event, fn) {
            var vm = this

            function on() {
                vm.$off(event, on)
                fn.apply(vm, arguments)
            }
            on.fn = fn
            vm.$on(event, on)
            return vm
        }

        Vue.prototype.$off = function(event, fn) {
            var this$1 = this

            var vm = this
            // all
            if (!arguments.length) {
                vm._events = Object.create(null)
                return vm
            }
            // array of events
            if (Array.isArray(event)) {
                for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
                    this$1.$off(event[i$1], fn)
                }
                return vm
            }
            // specific event
            var cbs = vm._events[event]
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null
                return vm
            }
            // specific handler
            var cb
            var i = cbs.length
            while (i--) {
                cb = cbs[i]
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1)
                    break
                }
            }
            return vm
        }

        Vue.prototype.$emit = function(event) {
            var vm = this
            var cbs = vm._events[event]
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs
                var args = toArray(arguments, 1)
                for (var i = 0, l = cbs.length; i < l; i++) {
                    try {
                        cbs[i].apply(vm, args)
                    } catch (e) {
                        handleError(e, vm, 'event handler for "' + event + '"')
                    }
                }
            }
            return vm
        }
    }

    /*  */

    /**
     * Runtime helper for resolving raw children VNodes into a slot object.
     */
    function resolveSlots(children, context) {
        var slots = {}
        if (!children) {
            return slots
        }
        var defaultSlot = []
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i]
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if (
                (child.context === context || child.functionalContext === context) &&
                child.data &&
                child.data.slot != null
            ) {
                var name = child.data.slot
                var slot = slots[name] || (slots[name] = [])
                if (child.tag === "template") {
                    slot.push.apply(slot, child.children)
                } else {
                    slot.push(child)
                }
            } else {
                defaultSlot.push(child)
            }
        }
        // ignore whitespace
        if (!defaultSlot.every(isWhitespace)) {
            slots.default = defaultSlot
        }
        return slots
    }

    function isWhitespace(node) {
        return node.isComment || node.text === " "
    }

    function resolveScopedSlots(
        fns, // see flow/vnode
        res
    ) {
        res = res || {}
        for (var i = 0; i < fns.length; i++) {
            if (Array.isArray(fns[i])) {
                resolveScopedSlots(fns[i], res)
            } else {
                res[fns[i].key] = fns[i].fn
            }
        }
        return res
    }

    /*  */

    var activeInstance = null

    function initLifecycle(vm) {
        var options = vm.$options

        // locate first non-abstract parent
        var parent = options.parent
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent
            }
            parent.$children.push(vm)
        }

        vm.$parent = parent
        vm.$root = parent ? parent.$root : vm

        vm.$children = []
        vm.$refs = {}

        vm._watcher = null
        vm._inactive = null
        vm._directInactive = false
        vm._isMounted = false
        vm._isDestroyed = false
        vm._isBeingDestroyed = false
    }

    function lifecycleMixin(Vue) {
        Vue.prototype._update = function(vnode, hydrating) {
            var vm = this
            if (vm._isMounted) {
                callHook(vm, "beforeUpdate")
            }
            var prevEl = vm.$el
            var prevVnode = vm._vnode
            var prevActiveInstance = activeInstance
            activeInstance = vm
            vm._vnode = vnode
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if (!prevVnode) {
                // initial render
                vm.$el = vm.__patch__(
                    vm.$el,
                    vnode,
                    hydrating,
                    false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                )
                // no need for the ref nodes after initial patch
                // this prevents keeping a detached DOM tree in memory (#5851)
                vm.$options._parentElm = vm.$options._refElm = null
            } else {
                // updates
                vm.$el = vm.__patch__(prevVnode, vnode)
            }
            activeInstance = prevActiveInstance
            // update __vue__ reference
            if (prevEl) {
                prevEl.__vue__ = null
            }
            if (vm.$el) {
                vm.$el.__vue__ = vm
            }
            // if parent is an HOC, update its $el as well
            if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        }

        Vue.prototype.$forceUpdate = function() {
            var vm = this
            if (vm._watcher) {
                vm._watcher.update()
            }
        }

        Vue.prototype.$destroy = function() {
            var vm = this
            if (vm._isBeingDestroyed) {
                return
            }
            callHook(vm, "beforeDestroy")
            vm._isBeingDestroyed = true
            // remove self from parent
            var parent = vm.$parent
            if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                remove(parent.$children, vm)
            }
            // teardown watchers
            if (vm._watcher) {
                vm._watcher.teardown()
            }
            var i = vm._watchers.length
            while (i--) {
                vm._watchers[i].teardown()
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if (vm._data.__ob__) {
                vm._data.__ob__.vmCount--
            }
            // call the last hook...
            vm._isDestroyed = true
            // invoke destroy hooks on current rendered tree
            vm.__patch__(vm._vnode, null)
            // fire destroyed hook
            callHook(vm, "destroyed")
            // turn off all instance listeners.
            vm.$off()
            // remove __vue__ reference
            if (vm.$el) {
                vm.$el.__vue__ = null
            }
        }
    }

    function mountComponent(vm, el, hydrating) {
        vm.$el = el
        if (!vm.$options.render) {
            vm.$options.render = createEmptyVNode
        }
        callHook(vm, "beforeMount")

        var updateComponent
        /* istanbul ignore if */
        if (false) {} else {
            updateComponent = function() {
                vm._update(vm._render(), hydrating)
            }
        }

        vm._watcher = new Watcher(vm, updateComponent, noop)
        hydrating = false

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (vm.$vnode == null) {
            vm._isMounted = true
            callHook(vm, "mounted")
        }
        return vm
    }

    function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
        var hasChildren = !!(
            renderChildren || // has new static slots
            vm.$options._renderChildren || // has old static slots
            parentVnode.data.scopedSlots || // has new scoped slots
            vm.$scopedSlots !== emptyObject
        ) // has old scoped slots

        vm.$options._parentVnode = parentVnode
        vm.$vnode = parentVnode // update vm's placeholder node without re-render

        if (vm._vnode) {
            // update child tree's parent
            vm._vnode.parent = parentVnode
        }
        vm.$options._renderChildren = renderChildren

        // update $attrs and $listensers hash
        // these are also reactive so they may trigger child update if the child
        // used them during render
        vm.$attrs = parentVnode.data && parentVnode.data.attrs
        vm.$listeners = listeners

        // update props
        if (propsData && vm.$options.props) {
            observerState.shouldConvert = false
            var props = vm._props
            var propKeys = vm.$options._propKeys || []
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i]
                props[key] = validateProp(key, vm.$options.props, propsData, vm)
            }
            observerState.shouldConvert = true
            // keep a copy of raw propsData
            vm.$options.propsData = propsData
        }

        // update listeners
        if (listeners) {
            var oldListeners = vm.$options._parentListeners
            vm.$options._parentListeners = listeners
            updateComponentListeners(vm, listeners, oldListeners)
        }
        // resolve slots + force update if has children
        if (hasChildren) {
            vm.$slots = resolveSlots(renderChildren, parentVnode.context)
            vm.$forceUpdate()
        }
    }

    function isInInactiveTree(vm) {
        while (vm && (vm = vm.$parent)) {
            if (vm._inactive) {
                return true
            }
        }
        return false
    }

    function activateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = false
            if (isInInactiveTree(vm)) {
                return
            }
        } else if (vm._directInactive) {
            return
        }
        if (vm._inactive || vm._inactive === null) {
            vm._inactive = false
            for (var i = 0; i < vm.$children.length; i++) {
                activateChildComponent(vm.$children[i])
            }
            callHook(vm, "activated")
        }
    }

    function deactivateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = true
            if (isInInactiveTree(vm)) {
                return
            }
        }
        if (!vm._inactive) {
            vm._inactive = true
            for (var i = 0; i < vm.$children.length; i++) {
                deactivateChildComponent(vm.$children[i])
            }
            callHook(vm, "deactivated")
        }
    }

    function callHook(vm, hook) {
        var handlers = vm.$options[hook]
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm)
                } catch (e) {
                    handleError(e, vm, hook + " hook")
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit("hook:" + hook)
        }
    }

    /*  */

    var MAX_UPDATE_COUNT = 100

    var queue = []
    var activatedChildren = []
    var has = {}
    var circular = {}
    var waiting = false
    var flushing = false
    var index = 0

    /**
     * Reset the scheduler's state.
     */
    function resetSchedulerState() {
        index = queue.length = activatedChildren.length = 0
        has = {}
        waiting = flushing = false
    }

    /**
     * Flush both queues and run the watchers.
     */
    function flushSchedulerQueue() {
        flushing = true
        var watcher, id

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function(a, b) {
            return a.id - b.id
        })

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index]
            id = watcher.id
            has[id] = null
            watcher.run()
            // in dev build, check and stop circular updates.
            if (false) {}
        }

        // keep copies of post queues before resetting state
        var activatedQueue = activatedChildren.slice()
        var updatedQueue = queue.slice()

        resetSchedulerState()

        // call component updated and activated hooks
        callActivatedHooks(activatedQueue)
        callUpdatedHooks(updatedQueue)

        // devtool hook
        /* istanbul ignore if */
        if (devtools && config.devtools) {
            devtools.emit("flush")
        }
    }

    function callUpdatedHooks(queue) {
        var i = queue.length
        while (i--) {
            var watcher = queue[i]
            var vm = watcher.vm
            if (vm._watcher === watcher && vm._isMounted) {
                callHook(vm, "updated")
            }
        }
    }

    /**
     * Queue a kept-alive component that was activated during patch.
     * The queue will be processed after the entire tree has been patched.
     */
    function queueActivatedComponent(vm) {
        // setting _inactive to false here so that a render function can
        // rely on checking whether it's in an inactive tree (e.g. router-view)
        vm._inactive = false
        activatedChildren.push(vm)
    }

    function callActivatedHooks(queue) {
        for (var i = 0; i < queue.length; i++) {
            queue[i]._inactive = true
            activateChildComponent(queue[i], true /* true */)
        }
    }

    /**
     * Push a watcher into the watcher queue.
     * Jobs with duplicate IDs will be skipped unless it's
     * pushed when the queue is being flushed.
     */
    function queueWatcher(watcher) {
        var id = watcher.id
        if (has[id] == null) {
            has[id] = true
            if (!flushing) {
                queue.push(watcher)
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1
                while (i > index && queue[i].id > watcher.id) {
                    i--
                }
                queue.splice(i + 1, 0, watcher)
            }
            // queue the flush
            if (!waiting) {
                waiting = true
                nextTick(flushSchedulerQueue)
            }
        }
    }

    /*  */

    var uid$2 = 0

    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     */
    var Watcher = function Watcher(vm, expOrFn, cb, options) {
        this.vm = vm
        vm._watchers.push(this)
        // options
        if (options) {
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid$2 // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        this.newDeps = []
        this.depIds = new _Set()
        this.newDepIds = new _Set()
        this.expression = ""
        // parse expression for getter
        if (typeof expOrFn === "function") {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn)
            if (!this.getter) {
                this.getter = function() {}
                 false &&
                    false
            }
        }
        this.value = this.lazy ? undefined : this.get()
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    Watcher.prototype.get = function get() {
        pushTarget(this)
        var value
        var vm = this.vm
        try {
            value = this.getter.call(vm, vm)
        } catch (e) {
            if (this.user) {
                handleError(e, vm, 'getter for watcher "' + this.expression + '"')
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value)
            }
            popTarget()
            this.cleanupDeps()
        }
        return value
    }

    /**
     * Add a dependency to this directive.
     */
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }

    /**
     * Clean up for dependency collection.
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps() {
        var this$1 = this

        var i = this.deps.length
        while (i--) {
            var dep = this$1.deps[i]
            if (!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1)
            }
        }
        var tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    Watcher.prototype.update = function update() {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            this.run()
        } else {
            queueWatcher(this)
        }
    }

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    Watcher.prototype.run = function run() {
        if (this.active) {
            var value = this.get()
            if (
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                isObject(value) ||
                this.deep
            ) {
                // set new value
                var oldValue = this.value
                this.value = value
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue)
                    } catch (e) {
                        handleError(e, this.vm, 'callback for watcher "' + this.expression + '"')
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    Watcher.prototype.evaluate = function evaluate() {
        this.value = this.get()
        this.dirty = false
    }

    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend() {
        var this$1 = this

        var i = this.deps.length
        while (i--) {
            this$1.deps[i].depend()
        }
    }

    /**
     * Remove self from all dependencies' subscriber list.
     */
    Watcher.prototype.teardown = function teardown() {
        var this$1 = this

        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            var i = this.deps.length
            while (i--) {
                this$1.deps[i].removeSub(this$1)
            }
            this.active = false
        }
    }

    /**
     * Recursively traverse an object to evoke all converted
     * getters, so that every nested property inside the object
     * is collected as a "deep" dependency.
     */
    var seenObjects = new _Set()

    function traverse(val) {
        seenObjects.clear()
        _traverse(val, seenObjects)
    }

    function _traverse(val, seen) {
        var i, keys
        var isA = Array.isArray(val)
        if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id
            if (seen.has(depId)) {
                return
            }
            seen.add(depId)
        }
        if (isA) {
            i = val.length
            while (i--) {
                _traverse(val[i], seen)
            }
        } else {
            keys = Object.keys(val)
            i = keys.length
            while (i--) {
                _traverse(val[keys[i]], seen)
            }
        }
    }

    /*  */

    var sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    }

    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return this[sourceKey][key]
        }
        sharedPropertyDefinition.set = function proxySetter(val) {
            this[sourceKey][key] = val
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }

    function initState(vm) {
        vm._watchers = []
        var opts = vm.$options
        if (opts.props) {
            initProps(vm, opts.props)
        }
        if (opts.methods) {
            initMethods(vm, opts.methods)
        }
        if (opts.data) {
            initData(vm)
        } else {
            observe((vm._data = {}), true /* asRootData */)
        }
        if (opts.computed) {
            initComputed(vm, opts.computed)
        }
        if (opts.watch && opts.watch !== nativeWatch) {
            initWatch(vm, opts.watch)
        }
    }

    function checkOptionType(vm, name) {
        var option = vm.$options[name]
        if (!isPlainObject(option)) {
            warn('component option "' + name + '" should be an object.', vm)
        }
    }

    function initProps(vm, propsOptions) {
        var propsData = vm.$options.propsData || {}
        var props = (vm._props = {})
        // cache prop keys so that future props updates can iterate using Array
        // instead of dynamic object key enumeration.
        var keys = (vm.$options._propKeys = [])
        var isRoot = !vm.$parent
        // root instance props should be converted
        observerState.shouldConvert = isRoot
        var loop = function(key) {
            keys.push(key)
            var value = validateProp(key, propsOptions, propsData, vm)
            /* istanbul ignore else */
            {
                defineReactive$$1(props, key, value)
            }
            // static props are already proxied on the component's prototype
            // during Vue.extend(). We only need to proxy props defined at
            // instantiation here.
            if (!(key in vm)) {
                proxy(vm, "_props", key)
            }
        }

        for (var key in propsOptions) loop(key)
        observerState.shouldConvert = true
    }

    function initData(vm) {
        var data = vm.$options.data
        data = vm._data = typeof data === "function" ? getData(data, vm) : data || {}
        if (!isPlainObject(data)) {
            data = {}
             false &&
                false
        }
        // proxy data on instance
        var keys = Object.keys(data)
        var props = vm.$options.props
        var methods = vm.$options.methods
        var i = keys.length
        while (i--) {
            var key = keys[i]
            if (props && hasOwn(props, key)) {
                 false &&
                    false
            } else if (!isReserved(key)) {
                proxy(vm, "_data", key)
            }
        }
        // observe data
        observe(data, true /* asRootData */)
    }

    function getData(data, vm) {
        try {
            return data.call(vm)
        } catch (e) {
            handleError(e, vm, "data()")
            return {}
        }
    }

    var computedWatcherOptions = {
        lazy: true
    }

    function initComputed(vm, computed) {
         false && false
        var watchers = (vm._computedWatchers = Object.create(null))

        for (var key in computed) {
            var userDef = computed[key]
            var getter = typeof userDef === "function" ? userDef : userDef.get
            watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)

            // component-defined computed properties are already defined on the
            // component prototype. We only need to define computed properties defined
            // at instantiation here.
            if (!(key in vm)) {
                defineComputed(vm, key, userDef)
            } else {
            }
        }
    }

    function defineComputed(target, key, userDef) {
        if (typeof userDef === "function") {
            sharedPropertyDefinition.get = createComputedGetter(key)
            sharedPropertyDefinition.set = noop
        } else {
            sharedPropertyDefinition.get = userDef.get
                ? userDef.cache !== false
                    ? createComputedGetter(key)
                    : userDef.get
                : noop
            sharedPropertyDefinition.set = userDef.set ? userDef.set : noop
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }

    function createComputedGetter(key) {
        return function computedGetter() {
            var watcher = this._computedWatchers && this._computedWatchers[key]
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate()
                }
                if (Dep.target) {
                    watcher.depend()
                }
                return watcher.value
            }
        }
    }

    function initMethods(vm, methods) {
         false && false
        var props = vm.$options.props
        for (var key in methods) {
            vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
        }
    }

    function initWatch(vm, watch) {
         false && false
        for (var key in watch) {
            var handler = watch[key]
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i])
                }
            } else {
                createWatcher(vm, key, handler)
            }
        }
    }

    function createWatcher(vm, keyOrFn, handler, options) {
        if (isPlainObject(handler)) {
            options = handler
            handler = handler.handler
        }
        if (typeof handler === "string") {
            handler = vm[handler]
        }
        return vm.$watch(keyOrFn, handler, options)
    }

    function stateMixin(Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {}
        dataDef.get = function() {
            return this._data
        }
        var propsDef = {}
        propsDef.get = function() {
            return this._props
        }
        Object.defineProperty(Vue.prototype, "$data", dataDef)
        Object.defineProperty(Vue.prototype, "$props", propsDef)

        Vue.prototype.$set = set
        Vue.prototype.$delete = del

        Vue.prototype.$watch = function(expOrFn, cb, options) {
            var vm = this
            if (isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options)
            }
            options = options || {}
            options.user = true
            var watcher = new Watcher(vm, expOrFn, cb, options)
            if (options.immediate) {
                cb.call(vm, watcher.value)
            }
            return function unwatchFn() {
                watcher.teardown()
            }
        }
    }

    /*  */

    function initProvide(vm) {
        var provide = vm.$options.provide
        if (provide) {
            vm._provided = typeof provide === "function" ? provide.call(vm) : provide
        }
    }

    function initInjections(vm) {
        var result = resolveInject(vm.$options.inject, vm)
        if (result) {
            observerState.shouldConvert = false
            Object.keys(result).forEach(function(key) {
                /* istanbul ignore else */
                {
                    defineReactive$$1(vm, key, result[key])
                }
            })
            observerState.shouldConvert = true
        }
    }

    function resolveInject(inject, vm) {
        if (inject) {
            // inject is :any because flow is not smart enough to figure out cached
            var result = Object.create(null)
            var keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i]
                var provideKey = inject[key]
                var source = vm
                while (source) {
                    if (source._provided && provideKey in source._provided) {
                        result[key] = source._provided[provideKey]
                        break
                    }
                    source = source.$parent
                }
                if (false) {}
            }
            return result
        }
    }

    /*  */

    function createFunctionalComponent(Ctor, propsData, data, context, children) {
        var props = {}
        var propOptions = Ctor.options.props
        if (isDef(propOptions)) {
            for (var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData || {})
            }
        } else {
            if (isDef(data.attrs)) {
                mergeProps(props, data.attrs)
            }
            if (isDef(data.props)) {
                mergeProps(props, data.props)
            }
        }
        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var _context = Object.create(context)
        var h = function(a, b, c, d) {
            return createElement(_context, a, b, c, d, true)
        }
        var vnode = Ctor.options.render.call(null, h, {
            data: data,
            props: props,
            children: children,
            parent: context,
            listeners: data.on || {},
            injections: resolveInject(Ctor.options.inject, context),
            slots: function() {
                return resolveSlots(children, context)
            }
        })
        if (vnode instanceof VNode) {
            vnode.functionalContext = context
            vnode.functionalOptions = Ctor.options
            if (data.slot) {
                ;(vnode.data || (vnode.data = {})).slot = data.slot
            }
        }
        return vnode
    }

    function mergeProps(to, from) {
        for (var key in from) {
            to[camelize(key)] = from[key]
        }
    }

    /*  */

    // hooks to be invoked on component VNodes during patch
    var componentVNodeHooks = {
        init: function init(vnode, hydrating, parentElm, refElm) {
            if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
                var child = (vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance,
                    parentElm,
                    refElm
                ))
                child.$mount(hydrating ? vnode.elm : undefined, hydrating)
            } else if (vnode.data.keepAlive) {
                // kept-alive components, treat as a patch
                var mountedNode = vnode // work around flow
                componentVNodeHooks.prepatch(mountedNode, mountedNode)
            }
        },

        prepatch: function prepatch(oldVnode, vnode) {
            var options = vnode.componentOptions
            var child = (vnode.componentInstance = oldVnode.componentInstance)
            updateChildComponent(
                child,
                options.propsData, // updated props
                options.listeners, // updated listeners
                vnode, // new parent vnode
                options.children // new children
            )
        },

        insert: function insert(vnode) {
            var context = vnode.context
            var componentInstance = vnode.componentInstance

            if (!componentInstance._isMounted) {
                componentInstance._isMounted = true
                callHook(componentInstance, "mounted")
            }
            if (vnode.data.keepAlive) {
                if (context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance)
                } else {
                    activateChildComponent(componentInstance, true /* direct */)
                }
            }
        },

        destroy: function destroy(vnode) {
            var componentInstance = vnode.componentInstance
            if (!componentInstance._isDestroyed) {
                if (!vnode.data.keepAlive) {
                    componentInstance.$destroy()
                } else {
                    deactivateChildComponent(componentInstance, true /* direct */)
                }
            }
        }
    }

    var hooksToMerge = Object.keys(componentVNodeHooks)

    function createComponent(Ctor, data, context, children, tag) {
        if (isUndef(Ctor)) {
            return
        }

        var baseCtor = context.$options._base

        // plain options object: turn it into a constructor
        if (isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor)
        }

        // if at this stage it's not a constructor or an async component factory,
        // reject.
        if (typeof Ctor !== "function") {
            return
        }

        // async component
        var asyncFactory
        if (isUndef(Ctor.cid)) {
            asyncFactory = Ctor
            Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
            if (Ctor === undefined) {
                // return a placeholder node for async component, which is rendered
                // as a comment node but preserves all the raw information for the node.
                // the information will be used for async server-rendering and hydration.
                return createAsyncPlaceholder(asyncFactory, data, context, children, tag)
            }
        }

        data = data || {}

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor)

        // transform component v-model data into props & events
        if (isDef(data.model)) {
            transformModel(Ctor.options, data)
        }

        // extract props
        var propsData = extractPropsFromVNodeData(data, Ctor, tag)

        // functional component
        if (isTrue(Ctor.options.functional)) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // keep listeners
        var listeners = data.on

        if (isTrue(Ctor.options.abstract)) {
            // abstract components do not keep anything
            // other than props & listeners & slot

            // work around flow
            var slot = data.slot
            data = {}
            if (slot) {
                data.slot = slot
            }
        }

        // merge component management hooks onto the placeholder node
        mergeHooks(data)

        // return a placeholder vnode
        var name = Ctor.options.name || tag
        var vnode = new VNode(
            "vue-component-" + Ctor.cid + (name ? "-" + name : ""),
            data,
            undefined,
            undefined,
            undefined,
            context,
            {
                Ctor: Ctor,
                propsData: propsData,
                listeners: listeners,
                tag: tag,
                children: children
            },
            asyncFactory
        )
        return vnode
    }

    function createComponentInstanceForVnode(
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent, // activeInstance in lifecycle state
        parentElm,
        refElm
    ) {
        var vnodeComponentOptions = vnode.componentOptions
        var options = {
            _isComponent: true,
            parent: parent,
            propsData: vnodeComponentOptions.propsData,
            _componentTag: vnodeComponentOptions.tag,
            _parentVnode: vnode,
            _parentListeners: vnodeComponentOptions.listeners,
            _renderChildren: vnodeComponentOptions.children,
            _parentElm: parentElm || null,
            _refElm: refElm || null
        }
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate
        if (isDef(inlineTemplate)) {
            options.render = inlineTemplate.render
            options.staticRenderFns = inlineTemplate.staticRenderFns
        }
        return new vnodeComponentOptions.Ctor(options)
    }

    function mergeHooks(data) {
        if (!data.hook) {
            data.hook = {}
        }
        for (var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i]
            var fromParent = data.hook[key]
            var ours = componentVNodeHooks[key]
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours
        }
    }

    function mergeHook$1(one, two) {
        return function(a, b, c, d) {
            one(a, b, c, d)
            two(a, b, c, d)
        }
    }

    // transform component v-model info (value and callback) into
    // prop and event handler respectively.
    function transformModel(options, data) {
        var prop = (options.model && options.model.prop) || "value"
        var event = (options.model && options.model.event) || "input"
        ;(data.props || (data.props = {}))[prop] = data.model.value
        var on = data.on || (data.on = {})
        if (isDef(on[event])) {
            on[event] = [data.model.callback].concat(on[event])
        } else {
            on[event] = data.model.callback
        }
    }

    /*  */

    var SIMPLE_NORMALIZE = 1
    var ALWAYS_NORMALIZE = 2

    // wrapper function for providing a more flexible interface
    // without getting yelled at by flow
    function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children
            children = data
            data = undefined
        }
        if (isTrue(alwaysNormalize)) {
            normalizationType = ALWAYS_NORMALIZE
        }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement(context, tag, data, children, normalizationType) {
        if (isDef(data) && isDef(data.__ob__)) {
             false &&
                false
            return createEmptyVNode()
        }
        // object syntax in v-bind
        if (isDef(data) && isDef(data.is)) {
            tag = data.is
        }
        if (!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // warn against non-primitive key
        if (
            false
        ) {}
        // support single function children as default scoped slot
        if (Array.isArray(children) && typeof children[0] === "function") {
            data = data || {}
            data.scopedSlots = {
                default: children[0]
            }
            children.length = 0
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children)
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children)
        }
        var vnode, ns
        if (typeof tag === "string") {
            var Ctor
            ns = config.getTagNamespace(tag)
            if (config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag),
                    data,
                    children,
                    undefined,
                    undefined,
                    context
                )
            } else if (isDef((Ctor = resolveAsset(context.$options, "components", tag)))) {
                // component
                vnode = createComponent(Ctor, data, context, children, tag)
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(tag, data, children, undefined, undefined, context)
            }
        } else {
            // direct component options / constructor
            vnode = createComponent(tag, data, context, children)
        }
        if (isDef(vnode)) {
            if (ns) {
                applyNS(vnode, ns)
            }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS(vnode, ns) {
        vnode.ns = ns
        if (vnode.tag === "foreignObject") {
            // use default namespace inside foreignObject
            return
        }
        if (isDef(vnode.children)) {
            for (var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i]
                if (isDef(child.tag) && isUndef(child.ns)) {
                    applyNS(child, ns)
                }
            }
        }
    }

    /*  */

    /**
     * Runtime helper for rendering v-for lists.
     */
    function renderList(val, render) {
        var ret, i, l, keys, key
        if (Array.isArray(val) || typeof val === "string") {
            ret = new Array(val.length)
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i)
            }
        } else if (typeof val === "number") {
            ret = new Array(val)
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i)
            }
        } else if (isObject(val)) {
            keys = Object.keys(val)
            ret = new Array(keys.length)
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i]
                ret[i] = render(val[key], key, i)
            }
        }
        if (isDef(ret)) {
            ret._isVList = true
        }
        return ret
    }

    /*  */

    /**
     * Runtime helper for rendering <slot>
     */
    function renderSlot(name, fallback, props, bindObject) {
        var scopedSlotFn = this.$scopedSlots[name]
        if (scopedSlotFn) {
            // scoped slot
            props = props || {}
            if (bindObject) {
                props = extend(extend({}, bindObject), props)
            }
            return scopedSlotFn(props) || fallback
        } else {
            var slotNodes = this.$slots[name]
            // warn duplicate slot usage
            if (slotNodes && "production" !== "production") {
                slotNodes._rendered &&
                    warn(
                        'Duplicate presence of slot "' +
                            name +
                            '" found in the same render tree ' +
                            "- this will likely cause render errors.",
                        this
                    )
                slotNodes._rendered = true
            }
            return slotNodes || fallback
        }
    }

    /*  */

    /**
     * Runtime helper for resolving filters
     */
    function resolveFilter(id) {
        return resolveAsset(this.$options, "filters", id, true) || identity
    }

    /*  */

    /**
     * Runtime helper for checking keyCodes from config.
     */
    function checkKeyCodes(eventKeyCode, key, builtInAlias) {
        var keyCodes = config.keyCodes[key] || builtInAlias
        if (Array.isArray(keyCodes)) {
            return keyCodes.indexOf(eventKeyCode) === -1
        } else {
            return keyCodes !== eventKeyCode
        }
    }

    /*  */

    /**
     * Runtime helper for merging v-bind="object" into a VNode's data.
     */
    function bindObjectProps(data, tag, value, asProp, isSync) {
        if (value) {
            if (!isObject(value)) {
                 false &&
                    false
            } else {
                if (Array.isArray(value)) {
                    value = toObject(value)
                }
                var hash
                var loop = function(key) {
                    if (key === "class" || key === "style" || isReservedAttribute(key)) {
                        hash = data
                    } else {
                        var type = data.attrs && data.attrs.type
                        hash =
                            asProp || config.mustUseProp(tag, type, key)
                                ? data.domProps || (data.domProps = {})
                                : data.attrs || (data.attrs = {})
                    }
                    if (!(key in hash)) {
                        hash[key] = value[key]

                        if (isSync) {
                            var on = data.on || (data.on = {})
                            on["update:" + key] = function($event) {
                                value[key] = $event
                            }
                        }
                    }
                }

                for (var key in value) loop(key)
            }
        }
        return data
    }

    /*  */

    /**
     * Runtime helper for rendering static trees.
     */
    function renderStatic(index, isInFor) {
        var tree = this._staticTrees[index]
        // if has already-rendered static tree and not inside v-for,
        // we can reuse the same tree by doing a shallow clone.
        if (tree && !isInFor) {
            return Array.isArray(tree) ? cloneVNodes(tree) : cloneVNode(tree)
        }
        // otherwise, render a fresh tree.
        tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(
            this._renderProxy
        )
        markStatic(tree, "__static__" + index, false)
        return tree
    }

    /**
     * Runtime helper for v-once.
     * Effectively it means marking the node as static with a unique key.
     */
    function markOnce(tree, index, key) {
        markStatic(tree, "__once__" + index + (key ? "_" + key : ""), true)
        return tree
    }

    function markStatic(tree, key, isOnce) {
        if (Array.isArray(tree)) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] && typeof tree[i] !== "string") {
                    markStaticNode(tree[i], key + "_" + i, isOnce)
                }
            }
        } else {
            markStaticNode(tree, key, isOnce)
        }
    }

    function markStaticNode(node, key, isOnce) {
        node.isStatic = true
        node.key = key
        node.isOnce = isOnce
    }

    /*  */

    function bindObjectListeners(data, value) {
        if (value) {
            if (!isPlainObject(value)) {
                 false &&
                    false
            } else {
                var on = (data.on = data.on ? extend({}, data.on) : {})
                for (var key in value) {
                    var existing = on[key]
                    var ours = value[key]
                    on[key] = existing ? [].concat(ours, existing) : ours
                }
            }
        }
        return data
    }

    /*  */

    function initRender(vm) {
        vm._vnode = null // the root of the child tree
        vm._staticTrees = null
        var parentVnode = (vm.$vnode = vm.$options._parentVnode) // the placeholder node in parent tree
        var renderContext = parentVnode && parentVnode.context
        vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext)
        vm.$scopedSlots = emptyObject
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, false)
        }
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, true)
        }

        // $attrs & $listeners are exposed for easier HOC creation.
        // they need to be reactive so that HOCs using them are always updated
        var parentData = parentVnode && parentVnode.data
        /* istanbul ignore else */
        {
            defineReactive$$1(vm, "$attrs", parentData && parentData.attrs, null, true)
            defineReactive$$1(vm, "$listeners", parentData && parentData.on, null, true)
        }
    }

    function renderMixin(Vue) {
        Vue.prototype.$nextTick = function(fn) {
            return nextTick(fn, this)
        }

        Vue.prototype._render = function() {
            var vm = this
            var ref = vm.$options
            var render = ref.render
            var staticRenderFns = ref.staticRenderFns
            var _parentVnode = ref._parentVnode

            if (vm._isMounted) {
                // clone slot nodes on re-renders
                for (var key in vm.$slots) {
                    vm.$slots[key] = cloneVNodes(vm.$slots[key])
                }
            }

            vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject

            if (staticRenderFns && !vm._staticTrees) {
                vm._staticTrees = []
            }
            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            vm.$vnode = _parentVnode
            // render self
            var vnode
            try {
                vnode = render.call(vm._renderProxy, vm.$createElement)
            } catch (e) {
                handleError(e, vm, "render function")
                // return error render result,
                // or previous vnode to prevent render error causing blank component
                /* istanbul ignore else */
                {
                    vnode = vm._vnode
                }
            }
            // return empty vnode in case the render function errored out
            if (!(vnode instanceof VNode)) {
                if (false) {}
                vnode = createEmptyVNode()
            }
            // set parent
            vnode.parent = _parentVnode
            return vnode
        }

        // internal render helpers.
        // these are exposed on the instance prototype to reduce generated render
        // code size.
        Vue.prototype._o = markOnce
        Vue.prototype._n = toNumber
        Vue.prototype._s = toString
        Vue.prototype._l = renderList
        Vue.prototype._t = renderSlot
        Vue.prototype._q = looseEqual
        Vue.prototype._i = looseIndexOf
        Vue.prototype._m = renderStatic
        Vue.prototype._f = resolveFilter
        Vue.prototype._k = checkKeyCodes
        Vue.prototype._b = bindObjectProps
        Vue.prototype._v = createTextVNode
        Vue.prototype._e = createEmptyVNode
        Vue.prototype._u = resolveScopedSlots
        Vue.prototype._g = bindObjectListeners
    }

    /*  */

    var uid = 0

    function initMixin(Vue) {
        Vue.prototype._init = function(options) {
            var vm = this
            // a uid
            vm._uid = uid++

            var startTag, endTag
            /* istanbul ignore if */
            if (false) {}

            // a flag to avoid this being observed
            vm._isVue = true
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options)
            } else {
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                )
            }
            /* istanbul ignore else */
            {
                vm._renderProxy = vm
            }
            // expose real self
            vm._self = vm
            initLifecycle(vm)
            initEvents(vm)
            initRender(vm)
            callHook(vm, "beforeCreate")
            initInjections(vm) // resolve injections before data/props
            initState(vm)
            initProvide(vm) // resolve provide after data/props
            callHook(vm, "created")

            /* istanbul ignore if */
            if (false) {}

            if (vm.$options.el) {
                vm.$mount(vm.$options.el)
            }
        }
    }

    function initInternalComponent(vm, options) {
        var opts = (vm.$options = Object.create(vm.constructor.options))
        // doing this because it's faster than dynamic enumeration.
        opts.parent = options.parent
        opts.propsData = options.propsData
        opts._parentVnode = options._parentVnode
        opts._parentListeners = options._parentListeners
        opts._renderChildren = options._renderChildren
        opts._componentTag = options._componentTag
        opts._parentElm = options._parentElm
        opts._refElm = options._refElm
        if (options.render) {
            opts.render = options.render
            opts.staticRenderFns = options.staticRenderFns
        }
    }

    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options
        if (Ctor.super) {
            var superOptions = resolveConstructorOptions(Ctor.super)
            var cachedSuperOptions = Ctor.superOptions
            if (superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                Ctor.superOptions = superOptions
                // check if there are any late-modified/attached options (#4976)
                var modifiedOptions = resolveModifiedOptions(Ctor)
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions)
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
                if (options.name) {
                    options.components[options.name] = Ctor
                }
            }
        }
        return options
    }

    function resolveModifiedOptions(Ctor) {
        var modified
        var latest = Ctor.options
        var extended = Ctor.extendOptions
        var sealed = Ctor.sealedOptions
        for (var key in latest) {
            if (latest[key] !== sealed[key]) {
                if (!modified) {
                    modified = {}
                }
                modified[key] = dedupe(latest[key], extended[key], sealed[key])
            }
        }
        return modified
    }

    function dedupe(latest, extended, sealed) {
        // compare latest and sealed to ensure lifecycle hooks won't be duplicated
        // between merges
        if (Array.isArray(latest)) {
            var res = []
            sealed = Array.isArray(sealed) ? sealed : [sealed]
            extended = Array.isArray(extended) ? extended : [extended]
            for (var i = 0; i < latest.length; i++) {
                // push original options and not sealed options to exclude duplicated options
                if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i])
                }
            }
            return res
        } else {
            return latest
        }
    }

    function Vue$3(options) {
        if (false) {}
        this._init(options)
    }

    initMixin(Vue$3)
    stateMixin(Vue$3)
    eventsMixin(Vue$3)
    lifecycleMixin(Vue$3)
    renderMixin(Vue$3)

    /*  */

    function initUse(Vue) {
        Vue.use = function(plugin) {
            var installedPlugins = this._installedPlugins || (this._installedPlugins = [])
            if (installedPlugins.indexOf(plugin) > -1) {
                return this
            }

            // additional parameters
            var args = toArray(arguments, 1)
            args.unshift(this)
            if (typeof plugin.install === "function") {
                plugin.install.apply(plugin, args)
            } else if (typeof plugin === "function") {
                plugin.apply(null, args)
            }
            installedPlugins.push(plugin)
            return this
        }
    }

    /*  */

    function initMixin$1(Vue) {
        Vue.mixin = function(mixin) {
            this.options = mergeOptions(this.options, mixin)
            return this
        }
    }

    /*  */

    function initExtend(Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        Vue.cid = 0
        var cid = 1

        /**
         * Class inheritance
         */
        Vue.extend = function(extendOptions) {
            extendOptions = extendOptions || {}
            var Super = this
            var SuperId = Super.cid
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
            if (cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }

            var name = extendOptions.name || Super.options.name
            var Sub = function VueComponent(options) {
                this._init(options)
            }
            Sub.prototype = Object.create(Super.prototype)
            Sub.prototype.constructor = Sub
            Sub.cid = cid++
            Sub.options = mergeOptions(Super.options, extendOptions)
            Sub["super"] = Super

            // For props and computed properties, we define the proxy getters on
            // the Vue instances at extension time, on the extended prototype. This
            // avoids Object.defineProperty calls for each instance created.
            if (Sub.options.props) {
                initProps$1(Sub)
            }
            if (Sub.options.computed) {
                initComputed$1(Sub)
            }

            // allow further extension/mixin/plugin usage
            Sub.extend = Super.extend
            Sub.mixin = Super.mixin
            Sub.use = Super.use

            // create asset registers, so extended classes
            // can have their private assets too.
            ASSET_TYPES.forEach(function(type) {
                Sub[type] = Super[type]
            })
            // enable recursive self-lookup
            if (name) {
                Sub.options.components[name] = Sub
            }

            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options
            Sub.extendOptions = extendOptions
            Sub.sealedOptions = extend({}, Sub.options)

            // cache constructor
            cachedCtors[SuperId] = Sub
            return Sub
        }
    }

    function initProps$1(Comp) {
        var props = Comp.options.props
        for (var key in props) {
            proxy(Comp.prototype, "_props", key)
        }
    }

    function initComputed$1(Comp) {
        var computed = Comp.options.computed
        for (var key in computed) {
            defineComputed(Comp.prototype, key, computed[key])
        }
    }

    /*  */

    function initAssetRegisters(Vue) {
        /**
         * Create asset registration methods.
         */
        ASSET_TYPES.forEach(function(type) {
            Vue[type] = function(id, definition) {
                if (!definition) {
                    return this.options[type + "s"][id]
                } else {
                    /* istanbul ignore if */
                    if (type === "component" && isPlainObject(definition)) {
                        definition.name = definition.name || id
                        definition = this.options._base.extend(definition)
                    }
                    if (type === "directive" && typeof definition === "function") {
                        definition = {
                            bind: definition,
                            update: definition
                        }
                    }
                    this.options[type + "s"][id] = definition
                    return definition
                }
            }
        })
    }

    /*  */

    var patternTypes = [String, RegExp, Array]

    function getComponentName(opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    function matches(pattern, name) {
        if (Array.isArray(pattern)) {
            return pattern.indexOf(name) > -1
        } else if (typeof pattern === "string") {
            return pattern.split(",").indexOf(name) > -1
        } else if (isRegExp(pattern)) {
            return pattern.test(name)
        }
        /* istanbul ignore next */
        return false
    }

    function pruneCache(cache, current, filter) {
        for (var key in cache) {
            var cachedNode = cache[key]
            if (cachedNode) {
                var name = getComponentName(cachedNode.componentOptions)
                if (name && !filter(name)) {
                    if (cachedNode !== current) {
                        pruneCacheEntry(cachedNode)
                    }
                    cache[key] = null
                }
            }
        }
    }

    function pruneCacheEntry(vnode) {
        if (vnode) {
            vnode.componentInstance.$destroy()
        }
    }

    var KeepAlive = {
        name: "keep-alive",
        abstract: true,

        props: {
            include: patternTypes,
            exclude: patternTypes
        },

        created: function created() {
            this.cache = Object.create(null)
        },

        destroyed: function destroyed() {
            var this$1 = this

            for (var key in this$1.cache) {
                pruneCacheEntry(this$1.cache[key])
            }
        },

        watch: {
            include: function include(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return matches(val, name)
                })
            },
            exclude: function exclude(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return !matches(val, name)
                })
            }
        },

        render: function render() {
            var vnode = getFirstComponentChild(this.$slots.default)
            var componentOptions = vnode && vnode.componentOptions
            if (componentOptions) {
                // check pattern
                var name = getComponentName(componentOptions)
                if (
                    name &&
                    ((this.include && !matches(this.include, name)) ||
                        (this.exclude && matches(this.exclude, name)))
                ) {
                    return vnode
                }
                var key =
                    vnode.key == null
                        ? // same constructor may get registered as different local components
                          // so cid alone is not enough (#3269)
                          componentOptions.Ctor.cid +
                          (componentOptions.tag ? "::" + componentOptions.tag : "")
                        : vnode.key
                if (this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance
                } else {
                    this.cache[key] = vnode
                }
                vnode.data.keepAlive = true
            }
            return vnode
        }
    }

    var builtInComponents = {
        KeepAlive: KeepAlive
    }

    /*  */

    function initGlobalAPI(Vue) {
        // config
        var configDef = {}
        configDef.get = function() {
            return config
        }
        Object.defineProperty(Vue, "config", configDef)

        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn: warn,
            extend: extend,
            mergeOptions: mergeOptions,
            defineReactive: defineReactive$$1
        }

        Vue.set = set
        Vue.delete = del
        Vue.nextTick = nextTick

        Vue.options = Object.create(null)
        ASSET_TYPES.forEach(function(type) {
            Vue.options[type + "s"] = Object.create(null)
        })

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue

        extend(Vue.options.components, builtInComponents)

        initUse(Vue)
        initMixin$1(Vue)
        initExtend(Vue)
        initAssetRegisters(Vue)
    }

    initGlobalAPI(Vue$3)

    Object.defineProperty(Vue$3.prototype, "$isServer", {
        get: isServerRendering
    })

    Object.defineProperty(Vue$3.prototype, "$ssrContext", {
        get: function get() {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    })

    Vue$3.version = "2.4.1"
    Vue$3.mpvueVersion = "1.0.12"

    /* globals renderer */

    var isReservedTag = makeMap(
        "template,script,style,element,content,slot,link,meta,svg,view," +
            "a,div,img,image,text,span,richtext,input,switch,textarea,spinner,select," +
            "slider,slider-neighbor,indicator,trisition,trisition-group,canvas," +
            "list,cell,header,loading,loading-indicator,refresh,scrollable,scroller," +
            "video,web,embed,tabbar,tabheader,datepicker,timepicker,marquee,countdown",
        true
    )

    // these are reserved for web because they are directly compiled away
    // during template compilation
    var isReservedAttr = makeMap("style,class")

    // Elements that you can, intentionally, leave open (and which close themselves)
    // more flexable than web
    var canBeLeftOpenTag = makeMap(
        "web,spinner,switch,video,textarea,canvas," + "indicator,marquee,countdown",
        true
    )

    var isUnaryTag = makeMap("embed,img,image,input,link,meta", true)

    function mustUseProp() {
        /* console.log('mustUseProp') */
    }

    function getTagNamespace() {
        /* console.log('getTagNamespace') */
    }

    function isUnknownElement() {
        /* console.log('isUnknownElement') */
    }

    function getComKey(vm) {
        return vm && vm.$attrs ? vm.$attrs["mpcomid"] : "0"
    }

    // 用于小程序的 event type 到 web 的 event
    var eventTypeMap = {
        tap: ["tap", "click"],
        touchstart: ["touchstart"],
        touchmove: ["touchmove"],
        touchcancel: ["touchcancel"],
        touchend: ["touchend"],
        longtap: ["longtap"],
        input: ["input"],
        blur: ["change", "blur"],
        submit: ["submit"],
        focus: ["focus"],
        scrolltoupper: ["scrolltoupper"],
        scrolltolower: ["scrolltolower"],
        scroll: ["scroll"]
    }

    /*  */

    // import { namespaceMap } from 'mp/util/index'

    var obj = {}

    function createElement$1(tagName, vnode) {
        return obj
    }

    function createElementNS(namespace, tagName) {
        return obj
    }

    function createTextNode(text) {
        return obj
    }

    function createComment(text) {
        return obj
    }

    function insertBefore(parentNode, newNode, referenceNode) {}

    function removeChild(node, child) {}

    function appendChild(node, child) {}

    function parentNode(node) {
        return obj
    }

    function nextSibling(node) {
        return obj
    }

    function tagName(node) {
        return "div"
    }

    function setTextContent(node, text) {
        return obj
    }

    function setAttribute(node, key, val) {
        return obj
    }

    var nodeOps = Object.freeze({
        createElement: createElement$1,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        setAttribute: setAttribute
    })

    /*  */

    var ref = {
        create: function create(_, vnode) {
            registerRef(vnode)
        },
        update: function update(oldVnode, vnode) {
            if (oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true)
                registerRef(vnode)
            }
        },
        destroy: function destroy(vnode) {
            registerRef(vnode, true)
        }
    }

    function registerRef(vnode, isRemoval) {
        var key = vnode.data.ref
        if (!key) {
            return
        }

        var vm = vnode.context
        var ref = vnode.componentInstance || vnode.elm
        var refs = vm.$refs
        if (isRemoval) {
            if (Array.isArray(refs[key])) {
                remove(refs[key], ref)
            } else if (refs[key] === ref) {
                refs[key] = undefined
            }
        } else {
            if (vnode.data.refInFor) {
                if (!Array.isArray(refs[key])) {
                    refs[key] = [ref]
                } else if (refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref)
                }
            } else {
                refs[key] = ref
            }
        }
    }

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/paldepind/snabbdom/blob/master/LICENSE
     *
     * modified by Evan You (@yyx990803)
     *

    /*
     * Not type-checking this because this file is perf-critical and the cost
     * of making flow understand it is not worth it.
     */

    var emptyNode = new VNode("", {}, [])

    var hooks = ["create", "activate", "update", "remove", "destroy"]

    function sameVnode(a, b) {
        return (
            a.key === b.key &&
            ((a.tag === b.tag &&
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b)) ||
                (isTrue(a.isAsyncPlaceholder) &&
                    a.asyncFactory === b.asyncFactory &&
                    isUndef(b.asyncFactory.error)))
        )
    }

    // Some browsers do not support dynamically changing type for <input>
    // so they need to be treated as different nodes
    function sameInputType(a, b) {
        if (a.tag !== "input") {
            return true
        }
        var i
        var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type
        var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type
        return typeA === typeB
    }

    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var i, key
        var map = {}
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key
            if (isDef(key)) {
                map[key] = i
            }
        }
        return map
    }

    function createPatchFunction(backend) {
        var i, j
        var cbs = {}

        var modules = backend.modules
        var nodeOps = backend.nodeOps

        for (i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = []
            for (j = 0; j < modules.length; ++j) {
                if (isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]])
                }
            }
        }

        function emptyNodeAt(elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb(childElm, listeners) {
            function remove$$1() {
                if (--remove$$1.listeners === 0) {
                    removeNode(childElm)
                }
            }
            remove$$1.listeners = listeners
            return remove$$1
        }

        function removeNode(el) {
            var parent = nodeOps.parentNode(el)
            // element may have already been removed due to v-html / v-text
            if (isDef(parent)) {
                nodeOps.removeChild(parent, el)
            }
        }

        var inPre = 0

        function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested // for transition enter check
            if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }

            var data = vnode.data
            var children = vnode.children
            var tag = vnode.tag
            if (isDef(tag)) {
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode)
                setScope(vnode)

                /* istanbul ignore if */
                {
                    createChildren(vnode, children, insertedVnodeQueue)
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue)
                    }
                    insert(parentElm, vnode.elm, refElm)
                }

                if (false) {}
            } else if (isTrue(vnode.isComment)) {
                vnode.elm = nodeOps.createComment(vnode.text)
                insert(parentElm, vnode.elm, refElm)
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text)
                insert(parentElm, vnode.elm, refElm)
            }
        }

        function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i = vnode.data
            if (isDef(i)) {
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive
                if (isDef((i = i.hook)) && isDef((i = i.init))) {
                    i(vnode, false /* hydrating */, parentElm, refElm)
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue)
                    if (isTrue(isReactivated)) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
                    }
                    return true
                }
            }
        }

        function initComponent(vnode, insertedVnodeQueue) {
            if (isDef(vnode.data.pendingInsert)) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
                vnode.data.pendingInsert = null
            }
            vnode.elm = vnode.componentInstance.$el
            if (isPatchable(vnode)) {
                invokeCreateHooks(vnode, insertedVnodeQueue)
                setScope(vnode)
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode)
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode)
            }
        }

        function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode
            while (innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode
                if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode)
                    }
                    insertedVnodeQueue.push(innerNode)
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm)
        }

        function insert(parent, elm, ref$$1) {
            if (isDef(parent)) {
                if (isDef(ref$$1)) {
                    if (ref$$1.parentNode === parent) {
                        nodeOps.insertBefore(parent, elm, ref$$1)
                    }
                } else {
                    nodeOps.appendChild(parent, elm)
                }
            }
        }

        function createChildren(vnode, children, insertedVnodeQueue) {
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
                }
            } else if (isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
            }
        }

        function isPatchable(vnode) {
            while (vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode
            }
            return isDef(vnode.tag)
        }

        function invokeCreateHooks(vnode, insertedVnodeQueue) {
            for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode)
            }
            i = vnode.data.hook // Reuse variable
            if (isDef(i)) {
                if (isDef(i.create)) {
                    i.create(emptyNode, vnode)
                }
                if (isDef(i.insert)) {
                    insertedVnodeQueue.push(vnode)
                }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope(vnode) {
            var i
            var ancestor = vnode
            while (ancestor) {
                if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
                    nodeOps.setAttribute(vnode.elm, i, "")
                }
                ancestor = ancestor.parent
            }
            // for slot content they should also get the scopeId from the host instance.
            if (
                isDef((i = activeInstance)) &&
                i !== vnode.context &&
                isDef((i = i.$options._scopeId))
            ) {
                nodeOps.setAttribute(vnode.elm, i, "")
            }
        }

        function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm)
            }
        }

        function invokeDestroyHook(vnode) {
            var i, j
            var data = vnode.data
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.destroy))) {
                    i(vnode)
                }
                for (i = 0; i < cbs.destroy.length; ++i) {
                    cbs.destroy[i](vnode)
                }
            }
            if (isDef((i = vnode.children))) {
                for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j])
                }
            }
        }

        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx]
                if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                        removeAndInvokeRemoveHook(ch)
                        invokeDestroyHook(ch)
                    } else {
                        // Text node
                        removeNode(ch.elm)
                    }
                }
            }
        }

        function removeAndInvokeRemoveHook(vnode, rm) {
            if (isDef(rm) || isDef(vnode.data)) {
                var i
                var listeners = cbs.remove.length + 1
                if (isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners
                } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners)
                }
                // recursively invoke hooks on child component root node
                if (
                    isDef((i = vnode.componentInstance)) &&
                    isDef((i = i._vnode)) &&
                    isDef(i.data)
                ) {
                    removeAndInvokeRemoveHook(i, rm)
                }
                for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm)
                }
                if (isDef((i = vnode.data.hook)) && isDef((i = i.remove))) {
                    i(vnode, rm)
                } else {
                    rm()
                }
            } else {
                removeNode(vnode.elm)
            }
        }

        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            var oldStartIdx = 0
            var newStartIdx = 0
            var oldEndIdx = oldCh.length - 1
            var oldStartVnode = oldCh[0]
            var oldEndVnode = oldCh[oldEndIdx]
            var newEndIdx = newCh.length - 1
            var newStartVnode = newCh[0]
            var newEndVnode = newCh[newEndIdx]
            var oldKeyToIdx, idxInOld, elmToMove, refElm

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly

            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
                } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx]
                } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
                    oldStartVnode = oldCh[++oldStartIdx]
                    newStartVnode = newCh[++newStartIdx]
                } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newEndVnode = newCh[--newEndIdx]
                } else if (sameVnode(oldStartVnode, newEndVnode)) {
                    // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
                    canMove &&
                        nodeOps.insertBefore(
                            parentElm,
                            oldStartVnode.elm,
                            nodeOps.nextSibling(oldEndVnode.elm)
                        )
                    oldStartVnode = oldCh[++oldStartIdx]
                    newEndVnode = newCh[--newEndIdx]
                } else if (sameVnode(oldEndVnode, newStartVnode)) {
                    // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newStartVnode = newCh[++newStartIdx]
                } else {
                    if (isUndef(oldKeyToIdx)) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                    }
                    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
                    if (isUndef(idxInOld)) {
                        // New element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
                        newStartVnode = newCh[++newStartIdx]
                    } else {
                        elmToMove = oldCh[idxInOld]
                        /* istanbul ignore if */
                        if (false) {}
                        if (sameVnode(elmToMove, newStartVnode)) {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
                            oldCh[idxInOld] = undefined
                            canMove &&
                                nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)
                            newStartVnode = newCh[++newStartIdx]
                        } else {
                            // same key but different element. treat as new element
                            createElm(
                                newStartVnode,
                                insertedVnodeQueue,
                                parentElm,
                                oldStartVnode.elm
                            )
                            newStartVnode = newCh[++newStartIdx]
                        }
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
            }
        }

        function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            if (oldVnode === vnode) {
                return
            }

            var elm = (vnode.elm = oldVnode.elm)

            if (isTrue(oldVnode.isAsyncPlaceholder)) {
                if (isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
                } else {
                    vnode.isAsyncPlaceholder = true
                }
                return
            }

            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            if (
                isTrue(vnode.isStatic) &&
                isTrue(oldVnode.isStatic) &&
                vnode.key === oldVnode.key &&
                (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
            ) {
                vnode.componentInstance = oldVnode.componentInstance
                return
            }

            var i
            var data = vnode.data
            if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
                i(oldVnode, vnode)
            }

            var oldCh = oldVnode.children
            var ch = vnode.children
            if (isDef(data) && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) {
                    cbs.update[i](oldVnode, vnode)
                }
                if (isDef((i = data.hook)) && isDef((i = i.update))) {
                    i(oldVnode, vnode)
                }
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) {
                        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
                    }
                } else if (isDef(ch)) {
                    if (isDef(oldVnode.text)) {
                        nodeOps.setTextContent(elm, "")
                    }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
                } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1)
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, "")
                }
            } else if (oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text)
            }
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.postpatch))) {
                    i(oldVnode, vnode)
                }
            }
        }

        function invokeInsertHook(vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if (isTrue(initial) && isDef(vnode.parent)) {
                vnode.parent.data.pendingInsert = queue
            } else {
                for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i])
                }
            }
        }

        var bailed = false
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap("attrs,style,class,staticClass,staticStyle,key")

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate(elm, vnode, insertedVnodeQueue) {
            if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                vnode.elm = elm
                vnode.isAsyncPlaceholder = true
                return true
            }
            vnode.elm = elm
            var tag = vnode.tag
            var data = vnode.data
            var children = vnode.children
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.init))) {
                    i(vnode, true /* hydrating */)
                }
                if (isDef((i = vnode.componentInstance))) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue)
                    return true
                }
            }
            if (isDef(tag)) {
                if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue)
                    } else {
                        var childrenMatch = true
                        var childNode = elm.firstChild
                        for (var i$1 = 0; i$1 < children.length; i$1++) {
                            if (
                                !childNode ||
                                !hydrate(childNode, children[i$1], insertedVnodeQueue)
                            ) {
                                childrenMatch = false
                                break
                            }
                            childNode = childNode.nextSibling
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if (!childrenMatch || childNode) {
                            if (
                                false
                            ) {}
                            return false
                        }
                    }
                }
                if (isDef(data)) {
                    for (var key in data) {
                        if (!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue)
                            break
                        }
                    }
                }
            } else if (elm.data !== vnode.text) {
                elm.data = vnode.text
            }
            return true
        }

        return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            if (isUndef(vnode)) {
                if (isDef(oldVnode)) {
                    invokeDestroyHook(oldVnode)
                }
                return
            }

            var isInitialPatch = false
            var insertedVnodeQueue = []

            if (isUndef(oldVnode)) {
                // empty mount (likely as component), create new root element
                isInitialPatch = true
                createElm(vnode, insertedVnodeQueue, parentElm, refElm)
            } else {
                var isRealElement = isDef(oldVnode.nodeType)
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
                } else {
                    if (isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                            oldVnode.removeAttribute(SSR_ATTR)
                            hydrating = true
                        }
                        if (isTrue(hydrating)) {
                            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true)
                                return oldVnode
                            } else {
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        oldVnode = emptyNodeAt(oldVnode)
                    }
                    // replacing existing element
                    var oldElm = oldVnode.elm
                    var parentElm$1 = nodeOps.parentNode(oldElm)
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    )

                    if (isDef(vnode.parent)) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent
                        while (ancestor) {
                            ancestor.elm = vnode.elm
                            ancestor = ancestor.parent
                        }
                        if (isPatchable(vnode)) {
                            for (var i = 0; i < cbs.create.length; ++i) {
                                cbs.create[i](emptyNode, vnode.parent)
                            }
                        }
                    }

                    if (isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0)
                    } else if (isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode)
                    }
                }
            }

            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
            return vnode.elm
        }
    }

    /*  */

    // import baseModules from 'core/vdom/modules/index'
    // const platformModules = []
    // import platformModules from 'web/runtime/modules/index'

    // the directive module should be applied last, after all
    // built-in modules have been applied.
    // const modules = platformModules.concat(baseModules)
    var modules = [ref]

    var corePatch = createPatchFunction({
        nodeOps: nodeOps,
        modules: modules
    })

    function patch() {
        corePatch.apply(this, arguments)
        this.$updateDataToMP()
    }

    function callHook$1(vm, hook, params) {
        var handlers = vm.$options[hook]
        if (hook === "onError" && handlers) {
            handlers = [handlers]
        }

        var ret
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    ret = handlers[i].call(vm, params)
                } catch (e) {
                    handleError(e, vm, hook + " hook")
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit("hook:" + hook)
        }

        // for child
        if (vm.$children.length) {
            vm.$children.forEach(function(v) {
                return callHook$1(v, hook, params)
            })
        }

        return ret
    }

    // mpType 小程序实例的类型，可能的值是 'app', 'page'
    // rootVueVM 是 vue 的根组件实例，子组件中访问 this.$root 可得
    function getGlobalData(app, rootVueVM) {
        var mp = rootVueVM.$mp
        if (app && app.globalData) {
            mp.appOptions = app.globalData.appOptions
        }
    }

    // 格式化 properties 属性，并给每个属性加上 observer 方法

    // properties 的 一些类型 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html
    // properties: {
    //   paramA: Number,
    //   myProperty: { // 属性名
    //     type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
    //     value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
    //     observer: function(newVal, oldVal, changedPath) {
    //        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    //        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
    //     }
    //   },
    // }

    // props 的一些类型 https://cn.vuejs.org/v2/guide/components-props.html#ad
    // props: {
    //   // 基础的类型检查 (`null` 匹配任何类型)
    //   propA: Number,
    //   // 多个可能的类型
    //   propB: [String, Number],
    //   // 必填的字符串
    //   propC: {
    //     type: String,
    //     required: true
    //   },
    //   // 带有默认值的数字
    //   propD: {
    //     type: Number,
    //     default: 100
    //   },
    //   // 带有默认值的对象
    //   propE: {
    //     type: Object,
    //     // 对象或数组且一定会从一个工厂函数返回默认值
    //     default: function () {
    //       return { message: 'hello' }
    //     }
    //   },
    //   // 自定义验证函数
    //   propF: {
    //     validator: function (value) {
    //       // 这个值必须匹配下列字符串中的一个
    //       return ['success', 'warning', 'danger'].indexOf(value) !== -1
    //     }
    //   }
    // }

    // core/util/options
    function normalizeProps$1(props, res, vm) {
        if (!props) {
            return
        }
        var i, val, name
        if (Array.isArray(props)) {
            i = props.length
            while (i--) {
                val = props[i]
                if (typeof val === "string") {
                    name = camelize(val)
                    res[name] = {
                        type: null
                    }
                } else {
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key]
                name = camelize(key)
                res[name] = isPlainObject(val)
                    ? val
                    : {
                          type: val
                      }
            }
        }

        // fix vueProps to properties
        for (var key$1 in res) {
            if (res.hasOwnProperty(key$1)) {
                var item = res[key$1]
                if (item.default) {
                    item.value = item.default
                }
                var oldObserver = item.observer
                item.observer = function(newVal, oldVal) {
                    vm[name] = newVal
                    // 先修改值再触发原始的 observer，跟 watch 行为保持一致
                    if (typeof oldObserver === "function") {
                        oldObserver.call(vm, newVal, oldVal)
                    }
                }
            }
        }

        return res
    }

    function normalizeProperties(vm) {
        var properties = vm.$options.properties
        var vueProps = vm.$options.props
        var res = {}

        normalizeProps$1(properties, res, vm)
        normalizeProps$1(vueProps, res, vm)

        return res
    }

    /**
     * 把 properties 中的属性 proxy 到 vm 上
     */
    function initMpProps(vm) {
        var mpProps = (vm._mpProps = {})
        var keys = Object.keys(vm.$options.properties || {})
        keys.forEach(function(key) {
            if (!(key in vm)) {
                proxy(vm, "_mpProps", key)
                mpProps[key] = undefined // for observe
            }
        })
        observe(mpProps, true)
    }

    function initMP(mpType, next) {
        var rootVueVM = this.$root
        if (!rootVueVM.$mp) {
            rootVueVM.$mp = {}
        }

        var mp = rootVueVM.$mp

        // Please do not register multiple Pages
        // if (mp.registered) {
        if (mp.status) {
            // 处理子组件的小程序生命周期
            if (mpType === "app") {
                callHook$1(this, "onLaunch", mp.appOptions)
            } else {
                callHook$1(this, "onLoad", mp.query)
                // callHook$1(this, "onReady") // 避免 onReady触发两次
            }
            return next()
        }
        // mp.registered = true

        mp.mpType = mpType
        mp.status = "register"

        if (mpType === "app") {
            global.App({
                // 页面的初始数据
                globalData: {
                    appOptions: {}
                },

                handleProxy: function handleProxy(e) {
                    return rootVueVM.$handleProxyWithVue(e)
                },

                // Do something initial when launch.
                onLaunch: function onLaunch(options) {
                    if (options === void 0) options = {}

                    mp.app = this
                    mp.status = "launch"
                    this.globalData.appOptions = mp.appOptions = options
                    callHook$1(rootVueVM, "onLaunch", options)
                    next()
                },

                // Do something when app show.
                onShow: function onShow(options) {
                    if (options === void 0) options = {}

                    mp.status = "show"
                    this.globalData.appOptions = mp.appOptions = options
                    callHook$1(rootVueVM, "onShow", options)
                },

                // Do something when app hide.
                onHide: function onHide() {
                    mp.status = "hide"
                    callHook$1(rootVueVM, "onHide")
                },

                onError: function onError(err) {
                    callHook$1(rootVueVM, "onError", err)
                },
                //fixed by xxxxxx
                onUniNViewMessage: function onUniNViewMessage(e) {
                    callHook$1(rootVueVM, "onUniNViewMessage", e)
                }
            })
        } else if (mpType === "component") {
            initMpProps(rootVueVM)

            global.Component({
                // 小程序原生的组件属性
                properties: normalizeProperties(rootVueVM),
                // 页面的初始数据
                data: {
                    $root: {}
                },
                methods: {
                    handleProxy: function handleProxy(e) {
                        return rootVueVM.$handleProxyWithVue(e)
                    }
                },
                // mp lifecycle for vue
                // 组件生命周期函数，在组件实例进入页面节点树时执行，注意此时不能调用 setData
                created: function created() {
                    mp.status = "created"
                    mp.page = this
                },
                // 组件生命周期函数，在组件实例进入页面节点树时执行
                attached: function attached() {
                    mp.status = "attached"
                    callHook$1(rootVueVM, "attached")
                },
                // 组件生命周期函数，在组件布局完成后执行，此时可以获取节点信息（使用 SelectorQuery ）
                ready: function ready() {
                    mp.status = "ready"

                    callHook$1(rootVueVM, "ready")
                    next()

                    // 只有页面需要 setData
                    rootVueVM.$nextTick(function() {
                        rootVueVM._initDataToMP()
                    })
                },
                // 组件生命周期函数，在组件实例被移动到节点树另一个位置时执行
                moved: function moved() {
                    callHook$1(rootVueVM, "moved")
                },
                // 组件生命周期函数，在组件实例被从页面节点树移除时执行
                detached: function detached() {
                    mp.status = "detached"
                    callHook$1(rootVueVM, "detached")
                }
            })
        } else {
            var app = global.getApp()
    
            
            global.Page({
                // 页面的初始数据
                data: {
                    $root: {}
                },

                handleProxy: function handleProxy(e) {
                    return rootVueVM.$handleProxyWithVue(e)
                },

                // mp lifecycle for vue
                // 生命周期函数--监听页面加载
                onLoad: function onLoad(query) {
                    rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
                    mp.page = this
                    mp.query = query
                    mp.status = "load"
                    getGlobalData(app, rootVueVM)
                    //仅load时重置数据
                    if (rootVueVM.$options && typeof rootVueVM.$options.data === "function") {
                    		Object.assign(rootVueVM.$data, rootVueVM.$options.data())
                    }
                    callHook$1(rootVueVM, "onLoad", query)
                },

                // 生命周期函数--监听页面显示
                onShow: function onShow() {
                    rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
                    mp.page = this
                    mp.status = "show"
                
                    callHook$1(rootVueVM, "onShow")
                    
                    //   // 只有页面需要 setData
                    rootVueVM.$nextTick(function () {
                    	rootVueVM._initDataToMP();
                    });
                },

                // 生命周期函数--监听页面初次渲染完成
                onReady: function onReady() {
                    mp.status = "ready"

                    callHook$1(rootVueVM, "onReady")
                    next()
                },

                // 生命周期函数--监听页面隐藏
                onHide: function onHide() {
                    mp.status = "hide"
                    callHook$1(rootVueVM, "onHide")
                },

                // 生命周期函数--监听页面卸载
                onUnload: function onUnload() {
                    mp.status = "unload"
                    callHook$1(rootVueVM, "onUnload")
                    mp.page = null
                },

                // 页面相关事件处理函数--监听用户下拉动作
                onPullDownRefresh: function onPullDownRefresh() {
                    callHook$1(rootVueVM, "onPullDownRefresh")
                },

                // 页面上拉触底事件的处理函数
                onReachBottom: function onReachBottom() {
                    callHook$1(rootVueVM, "onReachBottom")
                },

                // 用户点击右上角分享
                onShareAppMessage: rootVueVM.$options.onShareAppMessage
                    ? function(options) {
                          return callHook$1(rootVueVM, "onShareAppMessage", options)
                      }
                    : null,

                // Do something when page scroll
                onPageScroll: function onPageScroll(options) {
                    callHook$1(rootVueVM, "onPageScroll", options)
                },

                // 当前是 tab 页时，点击 tab 时触发
                onTabItemTap: function onTabItemTap(options) {
                    callHook$1(rootVueVM, "onTabItemTap", options)
                }
            })
        }
    }

    // 节流方法，性能优化
    // 全局的命名约定，为了节省编译的包大小一律采取形象的缩写，说明如下。
    // $c === $child
    // $k === $comKey

    // 新型的被拍平的数据结构
    // {
    //   $root: {
    //     '1-1'{
    //       // ... data
    //     },
    //     '1.2-1': {
    //       // ... data1
    //     },
    //     '1.2-2': {
    //       // ... data2
    //     }
    //   }
    // }

    function getVmData(vm) {
        // 确保当前 vm 所有数据被同步
        var dataKeys = [].concat(
            Object.keys(vm._data || {}),
            Object.keys(vm._props || {}),
            Object.keys(vm._mpProps || {}),
            Object.keys(vm._computedWatchers || {})
        )
        return dataKeys.reduce(function(res, key) {
            res[key] = vm[key]
            return res
        }, {})
    }

    function getParentComKey(vm, res) {
        if (res === void 0) res = []

        var ref = vm || {}
        var $parent = ref.$parent
        if (!$parent) {
            return res
        }
        res.unshift(getComKey($parent))
        if ($parent.$parent) {
            return getParentComKey($parent, res)
        }
        return res
    }

    function formatVmData(vm) {
        var $p = getParentComKey(vm).join(",")
        var $k = $p + ($p ? "," : "") + getComKey(vm)

        // getVmData 这儿获取当前组件内的所有数据，包含 props、computed 的数据
        // 改动 vue.runtime 所获的的核心能力
        var data = Object.assign(getVmData(vm), {
            $k: $k,
            $kk: $k + ",",
            $p: $p
        })
        var key = "$root." + $k
        var res = {}
        res[key] = data
        return res
    }

    function collectVmData(vm, res) {
        if (res === void 0) res = {}

        var vms = vm.$children
        if (vms && vms.length) {
            vms.forEach(function(v) {
                return collectVmData(v, res)
            })
        }
        return Object.assign(res, formatVmData(vm))
    }

    /**
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     * 自动合并 data
     *
     * @param  {function}   func      传入函数
     * @param  {number}     wait      表示时间窗口的间隔
     * @param  {object}     options   如果想忽略开始边界上的调用，传入{leading: false}。
     *                                如果想忽略结尾边界上的调用，传入{trailing: false}
     * @return {function}             返回客户调用函数
     */
    function throttle(func, wait, options) {
        var context, args, result
        var timeout = null
        // 上次执行时间点
        var previous = 0
        if (!options) {
            options = {}
        }
        // 延迟执行函数
        function later() {
            // 若设定了开始边界不执行选项，上次执行时间始终为0
            previous = options.leading === false ? 0 : Date.now()
            timeout = null
            result = func.apply(context, args)
            if (!timeout) {
                context = args = null
            }
        }
        return function(handle, data) {
            var now = Date.now()
            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) {
                previous = now
            }
            // 延迟执行时间间隔
            var remaining = wait - (now - previous)
            context = this
            args = args ? [handle, Object.assign(args[1], data)] : [handle, data]
            // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining大于时间窗口wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout)
                timeout = null
                previous = now
                result = func.apply(context, args)
                if (!timeout) {
                    context = args = null
                }
                // 如果延迟执行不存在，且没有设定结尾边界不执行选项
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining)
            }
            return result
        }
    }

    // 优化频繁的 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
    var throttleSetData = throttle(function(handle, data) {
        handle(data)
    }, 50)

    function getPage(vm) {
        var rootVueVM = vm.$root
        var ref = rootVueVM.$mp || {}
        var mpType = ref.mpType
        if (mpType === void 0) mpType = ""
        var page = ref.page

        // 优化后台态页面进行 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
        if (mpType === "app" || !page || typeof page.setData !== "function") {
            return
        }
        return page
    }

    // 优化每次 setData 都传递大量新数据
    function updateDataToMP() {
        var page = getPage(this)
        if (!page) {
            return
        }

        var data = JSON.parse(JSON.stringify(formatVmData(this)))
        //fixed by xxxxxx
        throttleSetData(page.setData.bind(page), diff(data, page.data))
    }

    function initDataToMP() {
        var page = getPage(this)
        if (!page) {
            return
        }

        var data = collectVmData(this.$root)
        //fixed by xxxxxx
        page.setData(JSON.parse(JSON.stringify(data)))
    }

    function getVM(vm, comkeys) {
        if (comkeys === void 0) comkeys = []

        var keys = comkeys.slice(1)
        if (!keys.length) {
            return vm
        }

        return keys.reduce(function(res, key) {
            var len = res.$children.length
            for (var i = 0; i < len; i++) {
                var v = res.$children[i]
                var k = getComKey(v)
                if (k === key) {
                    res = v
                    return res
                }
            }
            return res
        }, vm)
    }

    function getHandle(vnode, eventid, eventTypes) {
        if (eventTypes === void 0) eventTypes = []

        var res = []
        if (!vnode || !vnode.tag) {
            return res
        }

        var ref = vnode || {}
        var data = ref.data
        if (data === void 0) data = {}
        var children = ref.children
        if (children === void 0) children = []
        var componentInstance = ref.componentInstance
        if (componentInstance) {
            // 增加 slot 情况的处理
            // Object.values 会多增加几行编译后的代码
            Object.keys(componentInstance.$slots).forEach(function(slotKey) {
                var slot = componentInstance.$slots[slotKey]
                var slots = Array.isArray(slot) ? slot : [slot]
                slots.forEach(function(node) {
                    res = res.concat(getHandle(node, eventid, eventTypes))
                })
            })
        } else {
            // 避免遍历超出当前组件的 vm
            children.forEach(function(node) {
                res = res.concat(getHandle(node, eventid, eventTypes))
            })
        }

        var attrs = data.attrs
        var on = data.on
        if (attrs && on && attrs["eventid"] === eventid) {
            eventTypes.forEach(function(et) {
                var h = on[et]
                if (typeof h === "function") {
                    res.push(h)
                } else if (Array.isArray(h)) {
                    res = res.concat(h)
                }
            })
            return res
        }

        return res
    }

    function getWebEventByMP(e) {
        var type = e.type
        var timeStamp = e.timeStamp
        var touches = e.touches
        var detail = e.detail
        if (detail === void 0) detail = {}
        var target = e.target
        if (target === void 0) target = {}
        var currentTarget = e.currentTarget
        if (currentTarget === void 0) currentTarget = {}
        var x = detail.x
        var y = detail.y
        var event = {
            mp: e,
            type: type,
            timeStamp: timeStamp,
            x: x,
            y: y,
            target: Object.assign({}, target, detail),
            detail: detail, //fixed by xxxxxx
            currentTarget: currentTarget,
            stopPropagation: noop,
            preventDefault: noop
        }

        if (touches && touches.length) {
            Object.assign(event, touches[0])
            event.touches = touches
        }
        return event
    }

    function handleProxyWithVue(e) {
        var rootVueVM = this.$root
        var type = e.type
        var target = e.target
        if (target === void 0) target = {}
        var currentTarget = e.currentTarget
        var ref = currentTarget || target
        var dataset = ref.dataset
        if (dataset === void 0) dataset = {}
        var comkey = dataset.comkey
        if (comkey === void 0) comkey = ""
        var eventid = dataset.eventid
        var vm = getVM(rootVueVM, comkey.split(","))

        if (!vm) {
            return
        }

        var webEventTypes = eventTypeMap[type] || [type]
        var handles = getHandle(vm._vnode, eventid, webEventTypes)

        // TODO, enevt 还需要处理更多
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Event
        if (handles.length) {
            var event = getWebEventByMP(e)
            if (handles.length === 1) {
                var result = handles[0](event)
                return result
            }
            handles.forEach(function(h) {
                return h(event)
            })
        }
    }

    // for platforms
    // import config from 'core/config'
    // install platform specific utils
    Vue$3.config.mustUseProp = mustUseProp
    Vue$3.config.isReservedTag = isReservedTag
    Vue$3.config.isReservedAttr = isReservedAttr
    Vue$3.config.getTagNamespace = getTagNamespace
    Vue$3.config.isUnknownElement = isUnknownElement

    // install platform patch function
    Vue$3.prototype.__patch__ = patch

    // public mount method
    Vue$3.prototype.$mount = function(el, hydrating) {
        var this$1 = this

        // el = el && inBrowser ? query(el) : undefined
        // return mountComponent(this, el, hydrating)

        // 初始化小程序生命周期相关
        var options = this.$options

        if (options && (options.render || options.mpType)) {
            var mpType = options.mpType
            if (mpType === void 0) mpType = "page"
            return this._initMP(mpType, function() {
                return mountComponent(this$1, undefined, undefined)
            })
        } else {
            return mountComponent(this, undefined, undefined)
        }
    }

    // for mp
    Vue$3.prototype._initMP = initMP

    Vue$3.prototype.$updateDataToMP = updateDataToMP
    Vue$3.prototype._initDataToMP = initDataToMP

    Vue$3.prototype.$handleProxyWithVue = handleProxyWithVue

    /*  */

    return Vue$3
})

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=script&lang=js&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;













var _wxCanvas = _interopRequireDefault(__webpack_require__(/*! ./wx-canvas */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\wx-canvas.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};var ownKeys = Object.keys(source);if (typeof Object.getOwnPropertySymbols === 'function') {ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {return Object.getOwnPropertyDescriptor(source, sym).enumerable;}));}ownKeys.forEach(function (key) {_defineProperty(target, key, source[key]);});}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var _default2 =

{
  props: {
    echarts: {
      required: true,
      type: Object,
      default: function _default() {
        return null;
      } },

    onInit: {
      required: true,
      type: Function,
      default: null },

    canvasId: {
      type: String,
      default: 'ec-canvas' },

    lazyLoad: {
      type: Boolean,
      default: false },

    disableTouch: {
      type: Boolean,
      default: false },

    throttleTouch: {
      type: Boolean,
      default: false } },


  onReady: function onReady() {
    if (!this.echarts) {
      console.warn('组件需绑定 echarts 变量，例：<ec-canvas id="mychart-dom-bar" ' +
      'canvas-id="mychart-bar" :echarts="echarts"></ec-canvas>');
      return;
    }

    if (!this.lazyLoad) this.init();
  },
  methods: {
    init: function init() {var _this = this;
      var version = wx.version.version.split('.').map(function (n) {return parseInt(n, 10);});
      var isValid = version[0] > 1 || version[0] === 1 && version[1] > 9 ||
      version[0] === 1 && version[1] === 9 && version[2] >= 91;
      if (!isValid) {
        console.error('微信基础库版本过低，需大于等于 1.9.91。' +
        '参见：https://github.com/ecomfe/echarts-for-weixin' +
        '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82');
        return;
      }

      if (!this.onInit) {
        console.warn('请传入 onInit 函数进行初始化');
        return;
      }var

      canvasId = this.canvasId;
      this.ctx = wx.createCanvasContext(canvasId);

      var canvas = new _wxCanvas.default(this.ctx, canvasId);

      this.echarts.setCanvasCreator(function () {return canvas;});

      var query = wx.createSelectorQuery();
      query.select("#".concat(canvasId)).boundingClientRect(function (res) {
        if (!res) {
          setTimeout(function () {return _this.init();}, 50);
          return;
        }
        _this.chart = _this.onInit(canvas, res.width, res.height);
      }).exec();
    },
    canvasToTempFilePath: function canvasToTempFilePath(opt) {var
      canvasId = this.canvasId;
      this.ctx.draw(true, function () {
        wx.canvasToTempFilePath(_objectSpread({
          canvasId: canvasId },
        opt));

      });
    },
    touchStart: function touchStart(e) {var
      disableTouch = this.disableTouch,chart = this.chart;
      if (disableTouch || !chart || !e.mp.touches.length) return;
      var touch = e.mp.touches[0];
      chart._zr.handler.dispatch('mousedown', {
        zrX: touch.x,
        zrY: touch.y });

      chart._zr.handler.dispatch('mousemove', {
        zrX: touch.x,
        zrY: touch.y });

    },
    touchMove: function touchMove(e) {var

      disableTouch =
      this.disableTouch,throttleTouch = this.throttleTouch,chart = this.chart,lastMoveTime = this.lastMoveTime;
      if (disableTouch || !chart || !e.mp.touches.length) return;

      if (throttleTouch) {
        var currMoveTime = Date.now();
        if (currMoveTime - lastMoveTime < 240) return;
        this.lastMoveTime = currMoveTime;
      }

      var touch = e.mp.touches[0];
      chart._zr.handler.dispatch('mousemove', {
        zrX: touch.x,
        zrY: touch.y });

    },
    touchEnd: function touchEnd(e) {var
      disableTouch = this.disableTouch,chart = this.chart;
      if (disableTouch || !chart) return;
      var touch = e.mp.changedTouches ? e.mp.changedTouches[0] : {};
      chart._zr.handler.dispatch('mouseup', {
        zrX: touch.x,
        zrY: touch.y });

      chart._zr.handler.dispatch('click', {
        zrX: touch.x,
        zrY: touch.y });

    } } };exports.default = _default2;

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=script&lang=js&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=script&lang=js& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _regenerator = _interopRequireDefault(__webpack_require__(/*! ./node_modules/@babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);}_next(undefined);});};}var _default2 =























{
  name: 'navigationview',

  props: {
    current: {
      type: Number,
      default: 0 },

    values: {
      type: Array,
      default: function _default() {
        return [];
      } },


    activeColor: {
      type: String,
      default: '#007aff' },

    styleType: {
      type: String,
      default: 'button' },


    commenturl: null,
    tishicont: null,
    refreshurl: null },


  data: function data() {
    return {
      picker_date_day: '时间',
      filter_picker_name: '教学楼',
      filter_fanwei: ['教学A楼', '教学楼', '教学C楼', '教学D楼', '教学E楼', '益新食堂', '尔美食堂', '山明食堂', '水秀食堂', '教学G楼', '宿舍p楼', '图书馆'],
      luyouData: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}] };



  },
  onLoad: function () {var _onLoad = _asyncToGenerator( /*#__PURE__*/_regenerator.default.mark(function _callee() {return _regenerator.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:case "end":return _context.stop();}}}, _callee, this);}));function onLoad() {return _onLoad.apply(this, arguments);}return onLoad;}(),



  computed: {

    wrapStyle: function wrapStyle() {
      var styleString = '';
      switch (this.styleType) {
        case 'text':
          styleString = "border:0;";
          break;
        default:
          styleString = "border-color: ".concat(this.activeColor);
          break;}

      return styleString;
    },
    itemStyle: function itemStyle() {
      var styleString = '';
      switch (this.styleType) {
        case 'text':
          styleString = "color:#000;border-left:0;";
          break;
        default:
          styleString = "color:".concat(this.activeColor, ";border-color:").concat(this.activeColor, ";");
          break;}

      return styleString;
    },
    activeStyle: function activeStyle() {
      var styleString = '';
      switch (this.styleType) {
        case 'text':
          styleString = "color:".concat(this.activeColor, ";border-left:0;border-bottom-style:solid;");
          break;
        default:
          styleString = "color:#fff;border-color:".concat(this.activeColor, ";background-color:").concat(this.activeColor);
          break;}

      return styleString;
    } },

  methods: {

    pickerChange: function pickerChange(evt) {
      this.filter_picker_name = this.filter_fanwei[evt.detail.value];
      this.picker_date_day = '时间';
      this.$emit('changehouse', this.filter_picker_name);

    },
    dateChange_day: function dateChange_day(evt) {
      this.picker_date_day = evt.detail.value;
      this.filter_picker_name = '教学楼';
      this.$emit('changedate', this.picker_date_day);
    },


    onClick: function onClick(index) {
      if (this.current !== index) {
        this.current = index;
        this.$emit('clickItem', index);
      }
    } } };exports.default = _default2;

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=style&index=0&lang=css&":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=style&index=0&lang=css& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime-module.js":
/*!************************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime-module.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() {
  return this || (typeof self === "object" && self);
})() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = __webpack_require__(/*! ./runtime */ "./node_modules/regenerator-runtime/runtime.js");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}


/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() {
    return this || (typeof self === "object" && self);
  })() || Function("return this")()
);


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=template&id=4f83ca6f&scoped=true&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=template&id=4f83ca6f&scoped=true& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.canvasId
    ? _c("canvas", {
        staticClass: "ec-canvas",
        attrs: {
          id: _vm.canvasId,
          canvasId: _vm.canvasId,
          eventid: "9ae280a2-0"
        },
        on: {
          touchstart: _vm.touchStart,
          touchmove: _vm.touchMove,
          touchend: _vm.touchEnd,
          error: _vm.error
        }
      })
    : _vm._e()
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=template&id=df3c47b6&":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=template&id=df3c47b6& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "view",
    {
      staticStyle: {
        width: "700rpx",
        "justify-content": "space-between",
        "align-items": "center",
        "z-index": "31",
        "background-color": "#EFEFEF",
        padding: "0rpx 25rpx"
      }
    },
    [
      _c(
        "picker",
        {
          staticClass: "icontext",
          staticStyle: { "font-size": "23rpx" },
          attrs: { range: _vm.filter_fanwei, eventid: "c4bea296-0" },
          on: { change: _vm.pickerChange }
        },
        [_vm._v(_vm._s(_vm.filter_picker_name) + "  ")]
      ),
      _c(
        "view",
        {
          staticStyle: {
            margin: "14rpx 0rpx",
            height: "44rpx",
            width: "320rpx"
          }
        },
        [
          _c(
            "view",
            {
              staticClass: "segmented-control",
              class: _vm.styleType,
              style: _vm.wrapStyle
            },
            _vm._l(_vm.values, function(item, index) {
              return _c(
                "view",
                {
                  key: index,
                  staticClass: "segmented-control-item",
                  class: _vm.styleType,
                  style:
                    index === _vm.current ? _vm.activeStyle : _vm.itemStyle,
                  attrs: { eventid: "c4bea296-1-" + index },
                  on: {
                    click: function($event) {
                      _vm.onClick(index)
                    }
                  }
                },
                [_vm._v(_vm._s(item))]
              )
            })
          )
        ]
      ),
      _c(
        "picker",
        {
          staticClass: "icontext",
          staticStyle: { "font-size": "23rpx" },
          attrs: {
            mode: "date",
            start: "2018-01-01",
            end: "2019-03-01",
            eventid: "c4bea296-2"
          },
          on: { change: _vm.dateChange_day }
        },
        [_vm._v(_vm._s(_vm.picker_date_day) + "  ")]
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponent; });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "./node_modules/vuex/dist/vuex.esm.js":
/*!********************************************!*\
  !*** ./node_modules/vuex/dist/vuex.esm.js ***!
  \********************************************/
/*! exports provided: Store, install, mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Store", function() { return Store; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "install", function() { return install; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapState", function() { return mapState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapMutations", function() { return mapMutations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapGetters", function() { return mapGetters; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapActions", function() { return mapActions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createNamespacedHelpers", function() { return createNamespacedHelpers; });
/**
 * vuex v3.0.1
 * (c) 2017 Evan You
 * @license MIT
 */
var applyMixin = function (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
};

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */


/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Module = function Module (rawModule, runtime) {
  this.runtime = runtime;
  this._children = Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
};

var prototypeAccessors$1 = { namespaced: { configurable: true } };

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module;
};

Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key];
};

Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};

Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};

Object.defineProperties( Module.prototype, prototypeAccessors$1 );

var ModuleCollection = function ModuleCollection (rawRootModule) {
  // register root module (Vuex.Store options)
  this.register([], rawRootModule, false);
};

ModuleCollection.prototype.get = function get (path) {
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update([], this.root, rawRootModule);
};

ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  if (true) {
    assertRawModule(path, rawModule);
  }

  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};

ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key);
};

function update (path, targetModule, newModule) {
  if (true) {
    assertRawModule(path, newModule);
  }

  // update target module
  targetModule.update(newModule);

  // update nested modules
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (true) {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
            'manual reload is needed'
          );
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}

var functionAssert = {
  assert: function (value) { return typeof value === 'function'; },
  expected: 'function'
};

var objectAssert = {
  assert: function (value) { return typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'); },
  expected: 'function or object with "handler" function'
};

var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(function (key) {
    if (!rawModule[key]) { return }

    var assertOptions = assertTypes[key];

    forEachValue(rawModule[key], function (value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}

function makeAssertionMessage (path, key, type, value, expected) {
  var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
  if (path.length > 0) {
    buf += " in module \"" + (path.join('.')) + "\"";
  }
  buf += " is " + (JSON.stringify(value)) + ".";
  return buf
}

var Vue; // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #731
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  if (true) {
    assert(Vue, "must call Vue.use(Vuex) before creating a store instance.");
    assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");
    assert(this instanceof Store, "Store must be called with the new operator.");
  }

  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  var state = options.state; if ( state === void 0 ) state = {};
  if (typeof state === 'function') {
    state = state() || {};
  }

  // store internal state
  this._committing = false;
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();

  // bind commit and dispatch to self
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };

  // strict mode
  this.strict = strict;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state);

  // apply plugins
  plugins.forEach(function (plugin) { return plugin(this$1); });

  if (Vue.config.devtools) {
    devtoolPlugin(this);
  }
};

var prototypeAccessors = { state: { configurable: true } };

prototypeAccessors.state.get = function () {
  return this._vm._data.$$state
};

prototypeAccessors.state.set = function (v) {
  if (true) {
    assert(false, "Use store.replaceState() to explicit replace store state.");
  }
};

Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown mutation type: " + type));
    }
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  });
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

  if (
     true &&
    options && options.silent
  ) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    );
  }
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
    var this$1 = this;

  // check object-style dispatch
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var action = { type: type, payload: payload };
  var entry = this._actions[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown action type: " + type));
    }
    return
  }

  this._actionSubscribers.forEach(function (sub) { return sub(action, this$1.state); });

  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
};

Store.prototype.subscribeAction = function subscribeAction (fn) {
  return genericSubscribe(fn, this._actionSubscribers)
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  if (true) {
    assert(typeof getter === 'function', "store.watch only accepts a function.");
  }
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm._data.$$state = state;
  });
};

Store.prototype.registerModule = function registerModule (path, rawModule, options) {
    if ( options === void 0 ) options = {};

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
    assert(path.length > 0, 'cannot register the root module by using registerModule.');
  }

  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  // reset store to update getters...
  resetStoreVM(this, this.state);
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }

  this._modules.unregister(path);
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1));
    Vue.delete(parentState, path[path.length - 1]);
  });
  resetStore(this);
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  }
}

function resetStore (store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  var state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}

function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); };
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state);
    });
  }

  var local = module.context = makeLocalContext(store, namespace, path);

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ( true && !store._actions[type]) {
          console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ( true && !store._mutations[type]) {
          console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      store.commit(type, payload, options);
    }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () { return store.getters; }
        : function () { return makeLocalGetters(store, namespace); }
    },
    state: {
      get: function () { return getNestedState(store.state, path); }
    }
  });

  return local
}

function makeLocalGetters (store, namespace) {
  var gettersProxy = {};

  var splitPos = namespace.length;
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    var localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    });
  });

  return gettersProxy
}

function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload);
  });
}

function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (true) {
      console.error(("[vuex] duplicate getter key: " + type));
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  };
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, function () {
    if (true) {
      assert(store._committing, "Do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, sync: true });
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (true) {
    assert(typeof type === 'string', ("Expects string as the type, but found " + (typeof type) + "."));
  }

  return { type: type, payload: payload, options: options }
}

function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (true) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      );
    }
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}

var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var commit = this.$store.commit;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
        if (!module) {
          return
        }
        commit = module.context.commit;
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if ( true && !(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val));
        return
      }
      return this.$store.getters[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var dispatch = this.$store.dispatch;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
        if (!module) {
          return
        }
        dispatch = module.context.dispatch;
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var createNamespacedHelpers = function (namespace) { return ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
}); };

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];
  if ( true && !module) {
    console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
  }
  return module
}

var index_esm = {
  Store: Store,
  install: install,
  version: '3.0.1',
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions,
  createNamespacedHelpers: createNamespacedHelpers
};


/* harmony default export */ __webpack_exports__["default"] = (index_esm);


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\echarts\\echarts.tree.min.js":
/*!*****************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/echarts/echarts.tree.min.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
!function (t, e) { true ? e(exports) : undefined;}(void 0, function (t) {"use strict";function e(t) {var e = {},n = {},i = t.match(/Firefox\/([\d.]+)/),r = t.match(/MSIE\s([\d.]+)/) || t.match(/Trident\/.+?rv:(([\d.]+))/),a = t.match(/Edge\/([\d.]+)/),o = /micromessenger/i.test(t);return i && (n.firefox = !0, n.version = i[1]), r && (n.ie = !0, n.version = r[1]), a && (n.edge = !0, n.version = a[1]), o && (n.weChat = !0), { browser: n, os: e, node: !1, canvasSupported: !!document.createElement("canvas").getContext, svgSupported: "undefined" != typeof SVGRect, touchEventsSupported: "ontouchstart" in window && !n.ie && !n.edge, pointerEventsSupported: "onpointerdown" in window && (n.edge || n.ie && n.version >= 11), domSupported: "undefined" != typeof document };}function n(t, e) {"createCanvas" === t && (pp = null), dp[t] = e;}function i(t) {if (null == t || "object" != typeof t) return t;var e = t,n = ap.call(t);if ("[object Array]" === n) {if (!B(t)) {e = [];for (var r = 0, a = t.length; a > r; r++) {e[r] = i(t[r]);}}} else if (rp[n]) {if (!B(t)) {var o = t.constructor;if (t.constructor.from) e = o.from(t);else {e = new o(t.length);for (var r = 0, a = t.length; a > r; r++) {e[r] = i(t[r]);}}}} else if (!ip[n] && !B(t) && !T(t)) {e = {};for (var s in t) {t.hasOwnProperty(s) && (e[s] = i(t[s]));}}return e;}function r(t, e, n) {if (!M(e) || !M(t)) return n ? i(e) : t;for (var a in e) {if (e.hasOwnProperty(a)) {var o = t[a],s = e[a];!M(s) || !M(o) || _(s) || _(o) || T(s) || T(o) || S(s) || S(o) || B(s) || B(o) ? !n && a in t || (t[a] = i(e[a], !0)) : r(o, s, n);}}return t;}function a(t, e) {for (var n = t[0], i = 1, a = t.length; a > i; i++) {n = r(n, t[i], e);}return n;}function o(t, e) {for (var n in e) {e.hasOwnProperty(n) && (t[n] = e[n]);}return t;}function s(t, e, n) {for (var i in e) {e.hasOwnProperty(i) && (n ? null != e[i] : null == t[i]) && (t[i] = e[i]);}return t;}function l() {return pp || (pp = fp().getContext("2d")), pp;}function u(t, e) {if (t) {if (t.indexOf) return t.indexOf(e);for (var n = 0, i = t.length; i > n; n++) {if (t[n] === e) return n;}}return -1;}function h(t, e) {function n() {}var i = t.prototype;n.prototype = e.prototype, t.prototype = new n();for (var r in i) {t.prototype[r] = i[r];}t.prototype.constructor = t, t.superClass = e;}function c(t, e, n) {t = "prototype" in t ? t.prototype : t, e = "prototype" in e ? e.prototype : e, s(t, e, n);}function d(t) {return t ? "string" == typeof t ? !1 : "number" == typeof t.length : void 0;}function f(t, e, n) {if (t && e) if (t.forEach && t.forEach === sp) t.forEach(e, n);else if (t.length === +t.length) for (var i = 0, r = t.length; r > i; i++) {e.call(n, t[i], i, t);} else for (var a in t) {t.hasOwnProperty(a) && e.call(n, t[a], a, t);}}function p(t, e, n) {if (t && e) {if (t.map && t.map === hp) return t.map(e, n);for (var i = [], r = 0, a = t.length; a > r; r++) {i.push(e.call(n, t[r], r, t));}return i;}}function g(t, e, n, i) {if (t && e) {if (t.reduce && t.reduce === cp) return t.reduce(e, n, i);for (var r = 0, a = t.length; a > r; r++) {n = e.call(i, n, t[r], r, t);}return n;}}function v(t, e, n) {if (t && e) {if (t.filter && t.filter === lp) return t.filter(e, n);for (var i = [], r = 0, a = t.length; a > r; r++) {e.call(n, t[r], r, t) && i.push(t[r]);}return i;}}function m(t, e, n) {if (t && e) for (var i = 0, r = t.length; r > i; i++) {if (e.call(n, t[i], i, t)) return t[i];}}function y(t, e) {var n = up.call(arguments, 2);return function () {return t.apply(e, n.concat(up.call(arguments)));};}function x(t) {var e = up.call(arguments, 1);return function () {return t.apply(this, e.concat(up.call(arguments)));};}function _(t) {return "[object Array]" === ap.call(t);}function w(t) {return "function" == typeof t;}function b(t) {return "[object String]" === ap.call(t);}function M(t) {var e = typeof t;return "function" === e || !!t && "object" == e;}function S(t) {return !!ip[ap.call(t)];}function I(t) {return !!rp[ap.call(t)];}function T(t) {return "object" == typeof t && "number" == typeof t.nodeType && "object" == typeof t.ownerDocument;}function A(t) {return t !== t;}function C() {for (var t = 0, e = arguments.length; e > t; t++) {if (null != arguments[t]) return arguments[t];}}function D(t, e) {return null != t ? t : e;}function k(t, e, n) {return null != t ? t : null != e ? e : n;}function P() {return Function.call.apply(up, arguments);}function L(t) {if ("number" == typeof t) return [t, t, t, t];var e = t.length;return 2 === e ? [t[0], t[1], t[0], t[1]] : 3 === e ? [t[0], t[1], t[2], t[1]] : t;}function O(t, e) {if (!t) throw new Error(e);}function z(t) {return null == t ? null : "function" == typeof t.trim ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");}function E(t) {t[gp] = !0;}function B(t) {return t[gp];}function R(t) {function e(t, e) {n ? i.set(t, e) : i.set(e, t);}var n = _(t);this.data = {};var i = this;t instanceof R ? t.each(e) : t && f(t, e);}function N(t) {return new R(t);}function F(t, e) {for (var n = new t.constructor(t.length + e.length), i = 0; i < t.length; i++) {n[i] = t[i];}var r = t.length;for (i = 0; i < e.length; i++) {n[i + r] = e[i];}return n;}function V() {}function W(t, e) {var n = new mp(2);return null == t && (t = 0), null == e && (e = 0), n[0] = t, n[1] = e, n;}function G(t, e) {return t[0] = e[0], t[1] = e[1], t;}function H(t) {var e = new mp(2);return e[0] = t[0], e[1] = t[1], e;}function Z(t, e, n) {return t[0] = e, t[1] = n, t;}function X(t, e, n) {return t[0] = e[0] + n[0], t[1] = e[1] + n[1], t;}function Y(t, e, n, i) {return t[0] = e[0] + n[0] * i, t[1] = e[1] + n[1] * i, t;}function q(t, e, n) {return t[0] = e[0] - n[0], t[1] = e[1] - n[1], t;}function j(t) {return Math.sqrt(U(t));}function U(t) {return t[0] * t[0] + t[1] * t[1];}function $(t, e, n) {return t[0] = e[0] * n[0], t[1] = e[1] * n[1], t;}function K(t, e, n) {return t[0] = e[0] / n[0], t[1] = e[1] / n[1], t;}function Q(t, e) {return t[0] * e[0] + t[1] * e[1];}function J(t, e, n) {return t[0] = e[0] * n, t[1] = e[1] * n, t;}function te(t, e) {var n = j(e);return 0 === n ? (t[0] = 0, t[1] = 0) : (t[0] = e[0] / n, t[1] = e[1] / n), t;}function ee(t, e) {return Math.sqrt((t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1]));}function ne(t, e) {return (t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1]);}function ie(t, e) {return t[0] = -e[0], t[1] = -e[1], t;}function re(t, e, n, i) {return t[0] = e[0] + i * (n[0] - e[0]), t[1] = e[1] + i * (n[1] - e[1]), t;}function ae(t, e, n) {var i = e[0],r = e[1];return t[0] = n[0] * i + n[2] * r + n[4], t[1] = n[1] * i + n[3] * r + n[5], t;}function oe(t, e, n) {return t[0] = Math.min(e[0], n[0]), t[1] = Math.min(e[1], n[1]), t;}function se(t, e, n) {return t[0] = Math.max(e[0], n[0]), t[1] = Math.max(e[1], n[1]), t;}function le() {this.on("mousedown", this._dragStart, this), this.on("mousemove", this._drag, this), this.on("mouseup", this._dragEnd, this), this.on("globalout", this._dragEnd, this);}function ue(t, e) {return { target: t, topTarget: e && e.topTarget };}function he(t, e) {var n = t._$eventProcessor;return null != e && n && n.normalizeQuery && (e = n.normalizeQuery(e)), e;}function ce(t) {return t.getBoundingClientRect ? t.getBoundingClientRect() : { left: 0, top: 0 };}function de(t, e, n, i) {return n = n || {}, i || !np.canvasSupported ? fe(t, e, n) : np.browser.firefox && null != e.layerX && e.layerX !== e.offsetX ? (n.zrX = e.layerX, n.zrY = e.layerY) : null != e.offsetX ? (n.zrX = e.offsetX, n.zrY = e.offsetY) : fe(t, e, n), n;}function fe(t, e, n) {var i = ce(t);n.zrX = e.clientX - i.left, n.zrY = e.clientY - i.top;}function pe(t, e, n) {if (e = e || window.event, null != e.zrX) return e;var i = e.type,r = i && i.indexOf("touch") >= 0;if (r) {var a = "touchend" != i ? e.targetTouches[0] : e.changedTouches[0];a && de(t, a, e, n);} else de(t, e, e, n), e.zrDelta = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;var o = e.button;return null == e.which && void 0 !== o && Tp.test(e.type) && (e.which = 1 & o ? 1 : 2 & o ? 3 : 4 & o ? 2 : 0), e;}function ge(t, e, n) {Ip ? t.addEventListener(e, n) : t.attachEvent("on" + e, n);}function ve(t, e, n) {Ip ? t.removeEventListener(e, n) : t.detachEvent("on" + e, n);}function me(t) {return t.which > 1;}function ye(t, e, n) {return { type: t, event: n, target: e.target, topTarget: e.topTarget, cancelBubble: !1, offsetX: n.zrX, offsetY: n.zrY, gestureEvent: n.gestureEvent, pinchX: n.pinchX, pinchY: n.pinchY, pinchScale: n.pinchScale, wheelDelta: n.zrDelta, zrByTouch: n.zrByTouch, which: n.which, stop: xe };}function xe() {Ap(this.event);}function _e() {}function we(t, e, n) {if (t[t.rectHover ? "rectContain" : "contain"](e, n)) {for (var i, r = t; r;) {if (r.clipPath && !r.clipPath.contain(e, n)) return !1;r.silent && (i = !0), r = r.parent;}return i ? Cp : !0;}return !1;}function be() {var t = new Pp(6);return Me(t), t;}function Me(t) {return t[0] = 1, t[1] = 0, t[2] = 0, t[3] = 1, t[4] = 0, t[5] = 0, t;}function Se(t, e) {return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t;}function Ie(t, e, n) {var i = e[0] * n[0] + e[2] * n[1],r = e[1] * n[0] + e[3] * n[1],a = e[0] * n[2] + e[2] * n[3],o = e[1] * n[2] + e[3] * n[3],s = e[0] * n[4] + e[2] * n[5] + e[4],l = e[1] * n[4] + e[3] * n[5] + e[5];return t[0] = i, t[1] = r, t[2] = a, t[3] = o, t[4] = s, t[5] = l, t;}function Te(t, e, n) {return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4] + n[0], t[5] = e[5] + n[1], t;}function Ae(t, e, n) {var i = e[0],r = e[2],a = e[4],o = e[1],s = e[3],l = e[5],u = Math.sin(n),h = Math.cos(n);return t[0] = i * h + o * u, t[1] = -i * u + o * h, t[2] = r * h + s * u, t[3] = -r * u + h * s, t[4] = h * a + u * l, t[5] = h * l - u * a, t;}function Ce(t, e, n) {var i = n[0],r = n[1];return t[0] = e[0] * i, t[1] = e[1] * r, t[2] = e[2] * i, t[3] = e[3] * r, t[4] = e[4] * i, t[5] = e[5] * r, t;}function De(t, e) {var n = e[0],i = e[2],r = e[4],a = e[1],o = e[3],s = e[5],l = n * o - a * i;return l ? (l = 1 / l, t[0] = o * l, t[1] = -a * l, t[2] = -i * l, t[3] = n * l, t[4] = (i * s - o * r) * l, t[5] = (a * r - n * s) * l, t) : null;}function ke(t) {var e = be();return Se(e, t), e;}function Pe(t) {return t > zp || -zp > t;}function Le(t) {this._target = t.target, this._life = t.life || 1e3, this._delay = t.delay || 0, this._initialized = !1, this.loop = null == t.loop ? !1 : t.loop, this.gap = t.gap || 0, this.easing = t.easing || "Linear", this.onframe = t.onframe, this.ondestroy = t.ondestroy, this.onrestart = t.onrestart, this._pausedTime = 0, this._paused = !1;}function Oe(t) {return t = Math.round(t), 0 > t ? 0 : t > 255 ? 255 : t;}function ze(t) {return t = Math.round(t), 0 > t ? 0 : t > 360 ? 360 : t;}function Ee(t) {return 0 > t ? 0 : t > 1 ? 1 : t;}function Be(t) {return Oe(t.length && "%" === t.charAt(t.length - 1) ? parseFloat(t) / 100 * 255 : parseInt(t, 10));}function Re(t) {return Ee(t.length && "%" === t.charAt(t.length - 1) ? parseFloat(t) / 100 : parseFloat(t));}function Ne(t, e, n) {return 0 > n ? n += 1 : n > 1 && (n -= 1), 1 > 6 * n ? t + (e - t) * n * 6 : 1 > 2 * n ? e : 2 > 3 * n ? t + (e - t) * (2 / 3 - n) * 6 : t;}function Fe(t, e, n) {return t + (e - t) * n;}function Ve(t, e, n, i, r) {return t[0] = e, t[1] = n, t[2] = i, t[3] = r, t;}function We(t, e) {return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t;}function Ge(t, e) {jp && We(jp, e), jp = qp.put(t, jp || e.slice());}function He(t, e) {if (t) {e = e || [];var n = qp.get(t);if (n) return We(e, n);t += "";var i = t.replace(/ /g, "").toLowerCase();if (i in Yp) return We(e, Yp[i]), Ge(t, e), e;if ("#" !== i.charAt(0)) {var r = i.indexOf("("),a = i.indexOf(")");if (-1 !== r && a + 1 === i.length) {var o = i.substr(0, r),s = i.substr(r + 1, a - (r + 1)).split(","),l = 1;switch (o) {case "rgba":if (4 !== s.length) return void Ve(e, 0, 0, 0, 1);l = Re(s.pop());case "rgb":return 3 !== s.length ? void Ve(e, 0, 0, 0, 1) : (Ve(e, Be(s[0]), Be(s[1]), Be(s[2]), l), Ge(t, e), e);case "hsla":return 4 !== s.length ? void Ve(e, 0, 0, 0, 1) : (s[3] = Re(s[3]), Ze(s, e), Ge(t, e), e);case "hsl":return 3 !== s.length ? void Ve(e, 0, 0, 0, 1) : (Ze(s, e), Ge(t, e), e);default:return;}}Ve(e, 0, 0, 0, 1);} else {if (4 === i.length) {var u = parseInt(i.substr(1), 16);return u >= 0 && 4095 >= u ? (Ve(e, (3840 & u) >> 4 | (3840 & u) >> 8, 240 & u | (240 & u) >> 4, 15 & u | (15 & u) << 4, 1), Ge(t, e), e) : void Ve(e, 0, 0, 0, 1);}if (7 === i.length) {var u = parseInt(i.substr(1), 16);return u >= 0 && 16777215 >= u ? (Ve(e, (16711680 & u) >> 16, (65280 & u) >> 8, 255 & u, 1), Ge(t, e), e) : void Ve(e, 0, 0, 0, 1);}}}}function Ze(t, e) {var n = (parseFloat(t[0]) % 360 + 360) % 360 / 360,i = Re(t[1]),r = Re(t[2]),a = .5 >= r ? r * (i + 1) : r + i - r * i,o = 2 * r - a;return e = e || [], Ve(e, Oe(255 * Ne(o, a, n + 1 / 3)), Oe(255 * Ne(o, a, n)), Oe(255 * Ne(o, a, n - 1 / 3)), 1), 4 === t.length && (e[3] = t[3]), e;}function Xe(t) {if (t) {var e,n,i = t[0] / 255,r = t[1] / 255,a = t[2] / 255,o = Math.min(i, r, a),s = Math.max(i, r, a),l = s - o,u = (s + o) / 2;if (0 === l) e = 0, n = 0;else {n = .5 > u ? l / (s + o) : l / (2 - s - o);var h = ((s - i) / 6 + l / 2) / l,c = ((s - r) / 6 + l / 2) / l,d = ((s - a) / 6 + l / 2) / l;i === s ? e = d - c : r === s ? e = 1 / 3 + h - d : a === s && (e = 2 / 3 + c - h), 0 > e && (e += 1), e > 1 && (e -= 1);}var f = [360 * e, n, u];return null != t[3] && f.push(t[3]), f;}}function Ye(t, e) {var n = He(t);if (n) {for (var i = 0; 3 > i; i++) {n[i] = 0 > e ? n[i] * (1 - e) | 0 : (255 - n[i]) * e + n[i] | 0, n[i] > 255 ? n[i] = 255 : t[i] < 0 && (n[i] = 0);}return Qe(n, 4 === n.length ? "rgba" : "rgb");}}function qe(t) {var e = He(t);return e ? ((1 << 24) + (e[0] << 16) + (e[1] << 8) + +e[2]).toString(16).slice(1) : void 0;}function je(t, e, n) {if (e && e.length && t >= 0 && 1 >= t) {n = n || [];var i = t * (e.length - 1),r = Math.floor(i),a = Math.ceil(i),o = e[r],s = e[a],l = i - r;return n[0] = Oe(Fe(o[0], s[0], l)), n[1] = Oe(Fe(o[1], s[1], l)), n[2] = Oe(Fe(o[2], s[2], l)), n[3] = Ee(Fe(o[3], s[3], l)), n;}}function Ue(t, e, n) {if (e && e.length && t >= 0 && 1 >= t) {var i = t * (e.length - 1),r = Math.floor(i),a = Math.ceil(i),o = He(e[r]),s = He(e[a]),l = i - r,u = Qe([Oe(Fe(o[0], s[0], l)), Oe(Fe(o[1], s[1], l)), Oe(Fe(o[2], s[2], l)), Ee(Fe(o[3], s[3], l))], "rgba");return n ? { color: u, leftIndex: r, rightIndex: a, value: i } : u;}}function $e(t, e, n, i) {return t = He(t), t ? (t = Xe(t), null != e && (t[0] = ze(e)), null != n && (t[1] = Re(n)), null != i && (t[2] = Re(i)), Qe(Ze(t), "rgba")) : void 0;}function Ke(t, e) {return t = He(t), t && null != e ? (t[3] = Ee(e), Qe(t, "rgba")) : void 0;}function Qe(t, e) {if (t && t.length) {var n = t[0] + "," + t[1] + "," + t[2];return ("rgba" === e || "hsva" === e || "hsla" === e) && (n += "," + t[3]), e + "(" + n + ")";}}function Je(t, e) {return t[e];}function tn(t, e, n) {t[e] = n;}function en(t, e, n) {return (e - t) * n + t;}function nn(t, e, n) {return n > .5 ? e : t;}function rn(t, e, n, i, r) {var a = t.length;if (1 == r) for (var o = 0; a > o; o++) {i[o] = en(t[o], e[o], n);} else for (var s = a && t[0].length, o = 0; a > o; o++) {for (var l = 0; s > l; l++) {i[o][l] = en(t[o][l], e[o][l], n);}}}function an(t, e, n) {var i = t.length,r = e.length;if (i !== r) {var a = i > r;if (a) t.length = r;else for (var o = i; r > o; o++) {t.push(1 === n ? e[o] : Qp.call(e[o]));}}for (var s = t[0] && t[0].length, o = 0; o < t.length; o++) {if (1 === n) isNaN(t[o]) && (t[o] = e[o]);else for (var l = 0; s > l; l++) {isNaN(t[o][l]) && (t[o][l] = e[o][l]);}}}function on(t, e, n) {if (t === e) return !0;var i = t.length;if (i !== e.length) return !1;if (1 === n) {for (var r = 0; i > r; r++) {if (t[r] !== e[r]) return !1;}} else for (var a = t[0].length, r = 0; i > r; r++) {for (var o = 0; a > o; o++) {if (t[r][o] !== e[r][o]) return !1;}}return !0;}function sn(t, e, n, i, r, a, o, s, l) {var u = t.length;if (1 == l) for (var h = 0; u > h; h++) {s[h] = ln(t[h], e[h], n[h], i[h], r, a, o);} else for (var c = t[0].length, h = 0; u > h; h++) {for (var d = 0; c > d; d++) {s[h][d] = ln(t[h][d], e[h][d], n[h][d], i[h][d], r, a, o);}}}function ln(t, e, n, i, r, a, o) {var s = .5 * (n - t),l = .5 * (i - e);return (2 * (e - n) + s + l) * o + (-3 * (e - n) - 2 * s - l) * a + s * r + e;}function un(t) {if (d(t)) {var e = t.length;if (d(t[0])) {for (var n = [], i = 0; e > i; i++) {n.push(Qp.call(t[i]));}return n;}return Qp.call(t);}return t;}function hn(t) {return t[0] = Math.floor(t[0]), t[1] = Math.floor(t[1]), t[2] = Math.floor(t[2]), "rgba(" + t.join(",") + ")";}function cn(t) {var e = t[t.length - 1].value;return d(e && e[0]) ? 2 : 1;}function dn(t, e, n, i, r, a) {var o = t._getter,s = t._setter,l = "spline" === e,u = i.length;if (u) {var h,c = i[0].value,f = d(c),p = !1,g = !1,v = f ? cn(i) : 0;i.sort(function (t, e) {return t.time - e.time;}), h = i[u - 1].time;for (var m = [], y = [], x = i[0].value, _ = !0, w = 0; u > w; w++) {m.push(i[w].time / h);var b = i[w].value;if (f && on(b, x, v) || !f && b === x || (_ = !1), x = b, "string" == typeof b) {var M = He(b);M ? (b = M, p = !0) : g = !0;}y.push(b);}if (a || !_) {for (var S = y[u - 1], w = 0; u - 1 > w; w++) {f ? an(y[w], S, v) : !isNaN(y[w]) || isNaN(S) || g || p || (y[w] = S);}f && an(o(t._target, r), S, v);var I,T,A,C,D,k,P = 0,L = 0;if (p) var O = [0, 0, 0, 0];var z = function z(t, e) {var n;if (0 > e) n = 0;else if (L > e) {for (I = Math.min(P + 1, u - 1), n = I; n >= 0 && !(m[n] <= e); n--) {;}n = Math.min(n, u - 2);} else {for (n = P; u > n && !(m[n] > e); n++) {;}n = Math.min(n - 1, u - 2);}P = n, L = e;var i = m[n + 1] - m[n];if (0 !== i) if (T = (e - m[n]) / i, l) {if (C = y[n], A = y[0 === n ? n : n - 1], D = y[n > u - 2 ? u - 1 : n + 1], k = y[n > u - 3 ? u - 1 : n + 2], f) sn(A, C, D, k, T, T * T, T * T * T, o(t, r), v);else {var a;if (p) a = sn(A, C, D, k, T, T * T, T * T * T, O, 1), a = hn(O);else {if (g) return nn(C, D, T);a = ln(A, C, D, k, T, T * T, T * T * T);}s(t, r, a);}} else if (f) rn(y[n], y[n + 1], T, o(t, r), v);else {var a;if (p) rn(y[n], y[n + 1], T, O, 1), a = hn(O);else {if (g) return nn(y[n], y[n + 1], T);a = en(y[n], y[n + 1], T);}s(t, r, a);}},E = new Le({ target: t._target, life: h, loop: t._loop, delay: t._delay, onframe: z, ondestroy: n });return e && "spline" !== e && (E.easing = e), E;}}}function fn(t, e, n, i, r, a, o, s) {function l() {h--, h || a && a();}b(i) ? (a = r, r = i, i = 0) : w(r) ? (a = r, r = "linear", i = 0) : w(i) ? (a = i, i = 0) : w(n) ? (a = n, n = 500) : n || (n = 500), t.stopAnimation(), pn(t, "", t, e, n, i, s);var u = t.animators.slice(),h = u.length;h || a && a();for (var c = 0; c < u.length; c++) {u[c].done(l).start(r, o);}}function pn(t, e, n, i, r, a, o) {var s = {},l = 0;for (var u in i) {i.hasOwnProperty(u) && (null != n[u] ? M(i[u]) && !d(i[u]) ? pn(t, e ? e + "." + u : u, n[u], i[u], r, a, o) : (o ? (s[u] = n[u], gn(t, e, u, i[u])) : s[u] = i[u], l++) : null == i[u] || o || gn(t, e, u, i[u]));}l > 0 && t.animate(e, !1).when(null == r ? 500 : r, s).delay(a || 0);}function gn(t, e, n, i) {if (e) {var r = {};r[e] = {}, r[e][n] = i, t.attr(r);} else t.attr(n, i);}function vn(t, e, n, i) {0 > n && (t += n, n = -n), 0 > i && (e += i, i = -i), this.x = t, this.y = e, this.width = n, this.height = i;}function mn(t) {for (var e = 0; t >= cg;) {e |= 1 & t, t >>= 1;}return t + e;}function yn(t, e, n, i) {var r = e + 1;if (r === n) return 1;if (i(t[r++], t[e]) < 0) {for (; n > r && i(t[r], t[r - 1]) < 0;) {r++;}xn(t, e, r);} else for (; n > r && i(t[r], t[r - 1]) >= 0;) {r++;}return r - e;}function xn(t, e, n) {for (n--; n > e;) {var i = t[e];t[e++] = t[n], t[n--] = i;}}function _n(t, e, n, i, r) {for (i === e && i++; n > i; i++) {for (var a, o = t[i], s = e, l = i; l > s;) {a = s + l >>> 1, r(o, t[a]) < 0 ? l = a : s = a + 1;}var u = i - s;switch (u) {case 3:t[s + 3] = t[s + 2];case 2:t[s + 2] = t[s + 1];case 1:t[s + 1] = t[s];break;default:for (; u > 0;) {t[s + u] = t[s + u - 1], u--;}}t[s] = o;}}function wn(t, e, n, i, r, a) {var o = 0,s = 0,l = 1;if (a(t, e[n + r]) > 0) {for (s = i - r; s > l && a(t, e[n + r + l]) > 0;) {o = l, l = (l << 1) + 1, 0 >= l && (l = s);}l > s && (l = s), o += r, l += r;} else {for (s = r + 1; s > l && a(t, e[n + r - l]) <= 0;) {o = l, l = (l << 1) + 1, 0 >= l && (l = s);}l > s && (l = s);var u = o;o = r - l, l = r - u;}for (o++; l > o;) {var h = o + (l - o >>> 1);a(t, e[n + h]) > 0 ? o = h + 1 : l = h;}return l;}function bn(t, e, n, i, r, a) {var o = 0,s = 0,l = 1;if (a(t, e[n + r]) < 0) {for (s = r + 1; s > l && a(t, e[n + r - l]) < 0;) {o = l, l = (l << 1) + 1, 0 >= l && (l = s);}l > s && (l = s);var u = o;o = r - l, l = r - u;} else {for (s = i - r; s > l && a(t, e[n + r + l]) >= 0;) {o = l, l = (l << 1) + 1, 0 >= l && (l = s);}l > s && (l = s), o += r, l += r;}for (o++; l > o;) {var h = o + (l - o >>> 1);a(t, e[n + h]) < 0 ? l = h : o = h + 1;}return l;}function Mn(t, e) {function n(t, e) {l[c] = t, u[c] = e, c += 1;}function i() {for (; c > 1;) {var t = c - 2;if (t >= 1 && u[t - 1] <= u[t] + u[t + 1] || t >= 2 && u[t - 2] <= u[t] + u[t - 1]) u[t - 1] < u[t + 1] && t--;else if (u[t] > u[t + 1]) break;a(t);}}function r() {for (; c > 1;) {var t = c - 2;t > 0 && u[t - 1] < u[t + 1] && t--, a(t);}}function a(n) {var i = l[n],r = u[n],a = l[n + 1],h = u[n + 1];u[n] = r + h, n === c - 3 && (l[n + 1] = l[n + 2], u[n + 1] = u[n + 2]), c--;var d = bn(t[a], t, i, r, 0, e);i += d, r -= d, 0 !== r && (h = wn(t[i + r - 1], t, a, h, h - 1, e), 0 !== h && (h >= r ? o(i, r, a, h) : s(i, r, a, h)));}function o(n, i, r, a) {var o = 0;for (o = 0; i > o; o++) {d[o] = t[n + o];}var s = 0,l = r,u = n;if (t[u++] = t[l++], 0 !== --a) {if (1 === i) {for (o = 0; a > o; o++) {t[u + o] = t[l + o];}return void (t[u + a] = d[s]);}for (var c, f, p, g = h;;) {c = 0, f = 0, p = !1;do {if (e(t[l], d[s]) < 0) {if (t[u++] = t[l++], f++, c = 0, 0 === --a) {p = !0;break;}} else if (t[u++] = d[s++], c++, f = 0, 1 === --i) {p = !0;break;}} while (g > (c | f));if (p) break;do {if (c = bn(t[l], d, s, i, 0, e), 0 !== c) {for (o = 0; c > o; o++) {t[u + o] = d[s + o];}if (u += c, s += c, i -= c, 1 >= i) {p = !0;break;}}if (t[u++] = t[l++], 0 === --a) {p = !0;break;}if (f = wn(d[s], t, l, a, 0, e), 0 !== f) {for (o = 0; f > o; o++) {t[u + o] = t[l + o];}if (u += f, l += f, a -= f, 0 === a) {p = !0;break;}}if (t[u++] = d[s++], 1 === --i) {p = !0;break;}g--;} while (c >= dg || f >= dg);if (p) break;0 > g && (g = 0), g += 2;}if (h = g, 1 > h && (h = 1), 1 === i) {for (o = 0; a > o; o++) {t[u + o] = t[l + o];}t[u + a] = d[s];} else {if (0 === i) throw new Error();for (o = 0; i > o; o++) {t[u + o] = d[s + o];}}} else for (o = 0; i > o; o++) {t[u + o] = d[s + o];}}function s(n, i, r, a) {var o = 0;for (o = 0; a > o; o++) {d[o] = t[r + o];}var s = n + i - 1,l = a - 1,u = r + a - 1,c = 0,f = 0;if (t[u--] = t[s--], 0 !== --i) {if (1 === a) {for (u -= i, s -= i, f = u + 1, c = s + 1, o = i - 1; o >= 0; o--) {t[f + o] = t[c + o];}return void (t[u] = d[l]);}for (var p = h;;) {var g = 0,v = 0,m = !1;do {if (e(d[l], t[s]) < 0) {if (t[u--] = t[s--], g++, v = 0, 0 === --i) {m = !0;break;}} else if (t[u--] = d[l--], v++, g = 0, 1 === --a) {m = !0;break;}} while (p > (g | v));if (m) break;do {if (g = i - bn(d[l], t, n, i, i - 1, e), 0 !== g) {for (u -= g, s -= g, i -= g, f = u + 1, c = s + 1, o = g - 1; o >= 0; o--) {t[f + o] = t[c + o];}if (0 === i) {m = !0;break;}}if (t[u--] = d[l--], 1 === --a) {m = !0;break;}if (v = a - wn(t[s], d, 0, a, a - 1, e), 0 !== v) {for (u -= v, l -= v, a -= v, f = u + 1, c = l + 1, o = 0; v > o; o++) {t[f + o] = d[c + o];}if (1 >= a) {m = !0;break;}}if (t[u--] = t[s--], 0 === --i) {m = !0;break;}p--;} while (g >= dg || v >= dg);if (m) break;0 > p && (p = 0), p += 2;}if (h = p, 1 > h && (h = 1), 1 === a) {for (u -= i, s -= i, f = u + 1, c = s + 1, o = i - 1; o >= 0; o--) {t[f + o] = t[c + o];}t[u] = d[l];} else {if (0 === a) throw new Error();for (c = u - (a - 1), o = 0; a > o; o++) {t[c + o] = d[o];}}} else for (c = u - (a - 1), o = 0; a > o; o++) {t[c + o] = d[o];}}var l,u,h = dg,c = 0,d = [];l = [], u = [], this.mergeRuns = i, this.forceMergeRuns = r, this.pushRun = n;}function Sn(t, e, n, i) {n || (n = 0), i || (i = t.length);var r = i - n;if (!(2 > r)) {var a = 0;if (cg > r) return a = yn(t, n, i, e), void _n(t, n, i, n + a, e);var o = new Mn(t, e),s = mn(r);do {if (a = yn(t, n, i, e), s > a) {var l = r;l > s && (l = s), _n(t, n, n + l, n + a, e), a = l;}o.pushRun(n, a), o.mergeRuns(), r -= a, n += a;} while (0 !== r);o.forceMergeRuns();}}function In(t, e) {return t.zlevel === e.zlevel ? t.z === e.z ? t.z2 - e.z2 : t.z - e.z : t.zlevel - e.zlevel;}function Tn(t, e, n) {var i = null == e.x ? 0 : e.x,r = null == e.x2 ? 1 : e.x2,a = null == e.y ? 0 : e.y,o = null == e.y2 ? 0 : e.y2;e.global || (i = i * n.width + n.x, r = r * n.width + n.x, a = a * n.height + n.y, o = o * n.height + n.y), i = isNaN(i) ? 0 : i, r = isNaN(r) ? 1 : r, a = isNaN(a) ? 0 : a, o = isNaN(o) ? 0 : o;var s = t.createLinearGradient(i, a, r, o);return s;}function An(t, e, n) {var i = n.width,r = n.height,a = Math.min(i, r),o = null == e.x ? .5 : e.x,s = null == e.y ? .5 : e.y,l = null == e.r ? .5 : e.r;e.global || (o = o * i + n.x, s = s * r + n.y, l *= a);var u = t.createRadialGradient(o, s, 0, o, s, l);return u;}function Cn() {return !1;}function Dn(t, e, n) {var i = fp(),r = e.getWidth(),a = e.getHeight(),o = i.style;return o && (o.position = "absolute", o.left = 0, o.top = 0, o.width = r + "px", o.height = a + "px", i.setAttribute("data-zr-dom-id", t)), i.width = r * n, i.height = a * n, i;}function kn(t) {if ("string" == typeof t) {var e = Sg.get(t);return e && e.image;}return t;}function Pn(t, e, n, i, r) {if (t) {if ("string" == typeof t) {if (e && e.__zrImageSrc === t || !n) return e;var a = Sg.get(t),o = { hostEl: n, cb: i, cbPayload: r };return a ? (e = a.image, !On(e) && a.pending.push(o)) : (!e && (e = new Image()), e.onload = e.onerror = Ln, Sg.put(t, e.__cachedImgObj = { image: e, pending: [o] }), e.src = e.__zrImageSrc = t), e;}return t;}return e;}function Ln() {var t = this.__cachedImgObj;this.onload = this.onerror = this.__cachedImgObj = null;for (var e = 0; e < t.pending.length; e++) {var n = t.pending[e],i = n.cb;i && i(this, n.cbPayload), n.hostEl.dirty();}t.pending.length = 0;}function On(t) {return t && t.width && t.height;}function zn(t, e) {e = e || Dg;var n = t + ":" + e;if (Ig[n]) return Ig[n];for (var i = (t + "").split("\n"), r = 0, a = 0, o = i.length; o > a; a++) {r = Math.max(Yn(i[a], e).width, r);}return Tg > Ag && (Tg = 0, Ig = {}), Tg++, Ig[n] = r, r;}function En(t, e, n, i, r, a, o) {return a ? Rn(t, e, n, i, r, a, o) : Bn(t, e, n, i, r, o);}function Bn(t, e, n, i, r, a) {var o = qn(t, e, r, a),s = zn(t, e);r && (s += r[1] + r[3]);var l = o.outerHeight,u = Nn(0, s, n),h = Fn(0, l, i),c = new vn(u, h, s, l);return c.lineHeight = o.lineHeight, c;}function Rn(t, e, n, i, r, a, o) {var s = jn(t, { rich: a, truncate: o, font: e, textAlign: n, textPadding: r }),l = s.outerWidth,u = s.outerHeight,h = Nn(0, l, n),c = Fn(0, u, i);return new vn(h, c, l, u);}function Nn(t, e, n) {return "right" === n ? t -= e : "center" === n && (t -= e / 2), t;}function Fn(t, e, n) {return "middle" === n ? t -= e / 2 : "bottom" === n && (t -= e), t;}function Vn(t, e, n) {var i = e.x,r = e.y,a = e.height,o = e.width,s = a / 2,l = "left",u = "top";switch (t) {case "left":i -= n, r += s, l = "right", u = "middle";break;case "right":i += n + o, r += s, u = "middle";break;case "top":i += o / 2, r -= n, l = "center", u = "bottom";break;case "bottom":i += o / 2, r += a + n, l = "center";break;case "inside":i += o / 2, r += s, l = "center", u = "middle";break;case "insideLeft":i += n, r += s, u = "middle";break;case "insideRight":i += o - n, r += s, l = "right", u = "middle";break;case "insideTop":i += o / 2, r += n, l = "center";break;case "insideBottom":i += o / 2, r += a - n, l = "center", u = "bottom";break;case "insideTopLeft":i += n, r += n;break;case "insideTopRight":i += o - n, r += n, l = "right";break;case "insideBottomLeft":i += n, r += a - n, u = "bottom";break;case "insideBottomRight":i += o - n, r += a - n, l = "right", u = "bottom";}return { x: i, y: r, textAlign: l, textVerticalAlign: u };}function Wn(t, e, n, i, r) {if (!e) return "";var a = (t + "").split("\n");r = Gn(e, n, i, r);for (var o = 0, s = a.length; s > o; o++) {a[o] = Hn(a[o], r);}return a.join("\n");}function Gn(t, e, n, i) {i = o({}, i), i.font = e;var n = D(n, "...");i.maxIterations = D(i.maxIterations, 2);var r = i.minChar = D(i.minChar, 0);i.cnCharWidth = zn("国", e);var a = i.ascCharWidth = zn("a", e);i.placeholder = D(i.placeholder, "");for (var s = t = Math.max(0, t - 1), l = 0; r > l && s >= a; l++) {s -= a;}var u = zn(n);return u > s && (n = "", u = 0), s = t - u, i.ellipsis = n, i.ellipsisWidth = u, i.contentWidth = s, i.containerWidth = t, i;}function Hn(t, e) {var n = e.containerWidth,i = e.font,r = e.contentWidth;if (!n) return "";var a = zn(t, i);if (n >= a) return t;for (var o = 0;; o++) {if (r >= a || o >= e.maxIterations) {t += e.ellipsis;break;}var s = 0 === o ? Zn(t, r, e.ascCharWidth, e.cnCharWidth) : a > 0 ? Math.floor(t.length * r / a) : 0;t = t.substr(0, s), a = zn(t, i);}return "" === t && (t = e.placeholder), t;}function Zn(t, e, n, i) {for (var r = 0, a = 0, o = t.length; o > a && e > r; a++) {var s = t.charCodeAt(a);r += s >= 0 && 127 >= s ? n : i;}return a;}function Xn(t) {return zn("国", t);}function Yn(t, e) {return kg.measureText(t, e);}function qn(t, e, n, i) {null != t && (t += "");var r = Xn(e),a = t ? t.split("\n") : [],o = a.length * r,s = o;if (n && (s += n[0] + n[2]), t && i) {var l = i.outerHeight,u = i.outerWidth;if (null != l && s > l) t = "", a = [];else if (null != u) for (var h = Gn(u - (n ? n[1] + n[3] : 0), e, i.ellipsis, { minChar: i.minChar, placeholder: i.placeholder }), c = 0, d = a.length; d > c; c++) {a[c] = Hn(a[c], h);}}return { lines: a, height: o, outerHeight: s, lineHeight: r };}function jn(t, e) {var n = { lines: [], width: 0, height: 0 };if (null != t && (t += ""), !t) return n;for (var i, r = Cg.lastIndex = 0; null != (i = Cg.exec(t));) {var a = i.index;a > r && Un(n, t.substring(r, a)), Un(n, i[2], i[1]), r = Cg.lastIndex;}r < t.length && Un(n, t.substring(r, t.length));var o = n.lines,s = 0,l = 0,u = [],h = e.textPadding,c = e.truncate,d = c && c.outerWidth,f = c && c.outerHeight;h && (null != d && (d -= h[1] + h[3]), null != f && (f -= h[0] + h[2]));for (var p = 0; p < o.length; p++) {for (var g = o[p], v = 0, m = 0, y = 0; y < g.tokens.length; y++) {var x = g.tokens[y],_ = x.styleName && e.rich[x.styleName] || {},w = x.textPadding = _.textPadding,b = x.font = _.font || e.font,M = x.textHeight = D(_.textHeight, Xn(b));if (w && (M += w[0] + w[2]), x.height = M, x.lineHeight = k(_.textLineHeight, e.textLineHeight, M), x.textAlign = _ && _.textAlign || e.textAlign, x.textVerticalAlign = _ && _.textVerticalAlign || "middle", null != f && s + x.lineHeight > f) return { lines: [], width: 0, height: 0 };x.textWidth = zn(x.text, b);var S = _.textWidth,I = null == S || "auto" === S;if ("string" == typeof S && "%" === S.charAt(S.length - 1)) x.percentWidth = S, u.push(x), S = 0;else {if (I) {S = x.textWidth;var T = _.textBackgroundColor,A = T && T.image;A && (A = kn(A), On(A) && (S = Math.max(S, A.width * M / A.height)));}var C = w ? w[1] + w[3] : 0;S += C;var P = null != d ? d - m : null;null != P && S > P && (!I || C > P ? (x.text = "", x.textWidth = S = 0) : (x.text = Wn(x.text, P - C, b, c.ellipsis, { minChar: c.minChar }), x.textWidth = zn(x.text, b), S = x.textWidth + C));}m += x.width = S, _ && (v = Math.max(v, x.lineHeight));}g.width = m, g.lineHeight = v, s += v, l = Math.max(l, m);}n.outerWidth = n.width = D(e.textWidth, l), n.outerHeight = n.height = D(e.textHeight, s), h && (n.outerWidth += h[1] + h[3], n.outerHeight += h[0] + h[2]);for (var p = 0; p < u.length; p++) {var x = u[p],L = x.percentWidth;x.width = parseInt(L, 10) / 100 * l;}return n;}function Un(t, e, n) {for (var i = "" === e, r = e.split("\n"), a = t.lines, o = 0; o < r.length; o++) {var s = r[o],l = { styleName: n, text: s, isLineHolder: !s && !i };if (o) a.push({ tokens: [l] });else {var u = (a[a.length - 1] || (a[0] = { tokens: [] })).tokens,h = u.length;1 === h && u[0].isLineHolder ? u[0] = l : (s || !h || i) && u.push(l);}}}function $n(t) {var e = (t.fontSize || t.fontFamily) && [t.fontStyle, t.fontWeight, (t.fontSize || 12) + "px", t.fontFamily || "sans-serif"].join(" ");return e && z(e) || t.textFont || t.font;}function Kn(t, e) {var n,i,r,a,o = e.x,s = e.y,l = e.width,u = e.height,h = e.r;0 > l && (o += l, l = -l), 0 > u && (s += u, u = -u), "number" == typeof h ? n = i = r = a = h : h instanceof Array ? 1 === h.length ? n = i = r = a = h[0] : 2 === h.length ? (n = r = h[0], i = a = h[1]) : 3 === h.length ? (n = h[0], i = a = h[1], r = h[2]) : (n = h[0], i = h[1], r = h[2], a = h[3]) : n = i = r = a = 0;var c;n + i > l && (c = n + i, n *= l / c, i *= l / c), r + a > l && (c = r + a, r *= l / c, a *= l / c), i + r > u && (c = i + r, i *= u / c, r *= u / c), n + a > u && (c = n + a, n *= u / c, a *= u / c), t.moveTo(o + n, s), t.lineTo(o + l - i, s), 0 !== i && t.arc(o + l - i, s + i, i, -Math.PI / 2, 0), t.lineTo(o + l, s + u - r), 0 !== r && t.arc(o + l - r, s + u - r, r, 0, Math.PI / 2), t.lineTo(o + a, s + u), 0 !== a && t.arc(o + a, s + u - a, a, Math.PI / 2, Math.PI), t.lineTo(o, s + n), 0 !== n && t.arc(o + n, s + n, n, Math.PI, 1.5 * Math.PI);}function Qn(t) {return Jn(t), f(t.rich, Jn), t;}function Jn(t) {if (t) {t.font = $n(t);var e = t.textAlign;"middle" === e && (e = "center"), t.textAlign = null == e || Pg[e] ? e : "left";var n = t.textVerticalAlign || t.textBaseline;"center" === n && (n = "middle"), t.textVerticalAlign = null == n || Lg[n] ? n : "top";var i = t.textPadding;i && (t.textPadding = L(t.textPadding));}}function ti(t, e, n, i, r, a) {i.rich ? ni(t, e, n, i, r) : ei(t, e, n, i, r, a);}function ei(t, e, n, i, r, a) {var o = a && a.style,s = o && "text" === a.type,l = i.font || Dg;s && l === (o.font || Dg) || (e.font = l);var u = t.__computedFont;t.__styleFont !== l && (t.__styleFont = l, u = t.__computedFont = e.font);var h = i.textPadding,c = t.__textCotentBlock;(!c || t.__dirtyText) && (c = t.__textCotentBlock = qn(n, u, h, i.truncate));var d = c.outerHeight,f = c.lines,p = c.lineHeight,g = ui(d, i, r),v = g.baseX,m = g.baseY,y = g.textAlign || "left",x = g.textVerticalAlign;ri(e, i, r, v, m);var _ = Fn(m, d, x),w = v,b = _,M = oi(i);if (M || h) {var S = zn(n, u),I = S;h && (I += h[1] + h[3]);var T = Nn(v, I, y);M && si(t, e, i, T, _, I, d), h && (w = pi(v, y, h), b += h[0]);}e.textAlign = y, e.textBaseline = "middle";for (var A = 0; A < Og.length; A++) {var C = Og[A],D = C[0],k = C[1],P = i[D];s && P === o[D] || (e[k] = gg(e, k, P || C[2]));}b += p / 2;var L = i.textStrokeWidth,O = s ? o.textStrokeWidth : null,z = !s || L !== O,E = !s || z || i.textStroke !== o.textStroke,B = ci(i.textStroke, L),R = di(i.textFill);if (B && (z && (e.lineWidth = L), E && (e.strokeStyle = B)), R && (!s || i.textFill !== o.textFill || o.textBackgroundColor) && (e.fillStyle = R), 1 === f.length) B && e.strokeText(f[0], w, b), R && e.fillText(f[0], w, b);else for (var A = 0; A < f.length; A++) {B && e.strokeText(f[A], w, b), R && e.fillText(f[A], w, b), b += p;}}function ni(t, e, n, i, r) {var a = t.__textCotentBlock;(!a || t.__dirtyText) && (a = t.__textCotentBlock = jn(n, i)), ii(t, e, a, i, r);}function ii(t, e, n, i, r) {var a = n.width,o = n.outerWidth,s = n.outerHeight,l = i.textPadding,u = ui(s, i, r),h = u.baseX,c = u.baseY,d = u.textAlign,f = u.textVerticalAlign;ri(e, i, r, h, c);var p = Nn(h, o, d),g = Fn(c, s, f),v = p,m = g;l && (v += l[3], m += l[0]);var y = v + a;oi(i) && si(t, e, i, p, g, o, s);for (var x = 0; x < n.lines.length; x++) {for (var _, w = n.lines[x], b = w.tokens, M = b.length, S = w.lineHeight, I = w.width, T = 0, A = v, C = y, D = M - 1; M > T && (_ = b[T], !_.textAlign || "left" === _.textAlign);) {ai(t, e, _, i, S, m, A, "left"), I -= _.width, A += _.width, T++;}for (; D >= 0 && (_ = b[D], "right" === _.textAlign);) {ai(t, e, _, i, S, m, C, "right"), I -= _.width, C -= _.width, D--;}for (A += (a - (A - v) - (y - C) - I) / 2; D >= T;) {_ = b[T], ai(t, e, _, i, S, m, A + _.width / 2, "center"), A += _.width, T++;}m += S;}}function ri(t, e, n, i, r) {if (n && e.textRotation) {var a = e.textOrigin;"center" === a ? (i = n.width / 2 + n.x, r = n.height / 2 + n.y) : a && (i = a[0] + n.x, r = a[1] + n.y), t.translate(i, r), t.rotate(-e.textRotation), t.translate(-i, -r);}}function ai(t, e, n, i, r, a, o, s) {var l = i.rich[n.styleName] || {};l.text = n.text;var u = n.textVerticalAlign,h = a + r / 2;"top" === u ? h = a + n.height / 2 : "bottom" === u && (h = a + r - n.height / 2), !n.isLineHolder && oi(l) && si(t, e, l, "right" === s ? o - n.width : "center" === s ? o - n.width / 2 : o, h - n.height / 2, n.width, n.height);var c = n.textPadding;c && (o = pi(o, s, c), h -= n.height / 2 - c[2] - n.textHeight / 2), hi(e, "shadowBlur", k(l.textShadowBlur, i.textShadowBlur, 0)), hi(e, "shadowColor", l.textShadowColor || i.textShadowColor || "transparent"), hi(e, "shadowOffsetX", k(l.textShadowOffsetX, i.textShadowOffsetX, 0)), hi(e, "shadowOffsetY", k(l.textShadowOffsetY, i.textShadowOffsetY, 0)), hi(e, "textAlign", s), hi(e, "textBaseline", "middle"), hi(e, "font", n.font || Dg);var d = ci(l.textStroke || i.textStroke, p),f = di(l.textFill || i.textFill),p = D(l.textStrokeWidth, i.textStrokeWidth);d && (hi(e, "lineWidth", p), hi(e, "strokeStyle", d), e.strokeText(n.text, o, h)), f && (hi(e, "fillStyle", f), e.fillText(n.text, o, h));}function oi(t) {return t.textBackgroundColor || t.textBorderWidth && t.textBorderColor;}function si(t, e, n, i, r, a, o) {var s = n.textBackgroundColor,l = n.textBorderWidth,u = n.textBorderColor,h = b(s);if (hi(e, "shadowBlur", n.textBoxShadowBlur || 0), hi(e, "shadowColor", n.textBoxShadowColor || "transparent"), hi(e, "shadowOffsetX", n.textBoxShadowOffsetX || 0), hi(e, "shadowOffsetY", n.textBoxShadowOffsetY || 0), h || l && u) {e.beginPath();var c = n.textBorderRadius;c ? Kn(e, { x: i, y: r, width: a, height: o, r: c }) : e.rect(i, r, a, o), e.closePath();}if (h) {if (hi(e, "fillStyle", s), null != n.fillOpacity) {var d = e.globalAlpha;e.globalAlpha = n.fillOpacity * n.opacity, e.fill(), e.globalAlpha = d;} else e.fill();} else if (w(s)) hi(e, "fillStyle", s(n)), e.fill();else if (M(s)) {var f = s.image;f = Pn(f, null, t, li, s), f && On(f) && e.drawImage(f, i, r, a, o);}if (l && u) if (hi(e, "lineWidth", l), hi(e, "strokeStyle", u), null != n.strokeOpacity) {var d = e.globalAlpha;e.globalAlpha = n.strokeOpacity * n.opacity, e.stroke(), e.globalAlpha = d;} else e.stroke();}function li(t, e) {e.image = t;}function ui(t, e, n) {var i = e.x || 0,r = e.y || 0,a = e.textAlign,o = e.textVerticalAlign;if (n) {var s = e.textPosition;if (s instanceof Array) i = n.x + fi(s[0], n.width), r = n.y + fi(s[1], n.height);else {var l = Vn(s, n, e.textDistance);i = l.x, r = l.y, a = a || l.textAlign, o = o || l.textVerticalAlign;}var u = e.textOffset;u && (i += u[0], r += u[1]);}return { baseX: i, baseY: r, textAlign: a, textVerticalAlign: o };}function hi(t, e, n) {return t[e] = gg(t, e, n), t[e];}function ci(t, e) {return null == t || 0 >= e || "transparent" === t || "none" === t ? null : t.image || t.colorStops ? "#000" : t;}function di(t) {return null == t || "none" === t ? null : t.image || t.colorStops ? "#000" : t;}function fi(t, e) {return "string" == typeof t ? t.lastIndexOf("%") >= 0 ? parseFloat(t) / 100 * e : parseFloat(t) : t;}function pi(t, e, n) {return "right" === e ? t - n[1] : "center" === e ? t + n[3] / 2 - n[1] / 2 : t + n[3];}function gi(t, e) {return null != t && (t || e.textBackgroundColor || e.textBorderWidth && e.textBorderColor || e.textPadding);}function vi(t) {t = t || {}, og.call(this, t);for (var e in t) {t.hasOwnProperty(e) && "style" !== e && (this[e] = t[e]);}this.style = new mg(t.style, this), this._rect = null, this.__clipPaths = [];}function mi(t) {vi.call(this, t);
  }function yi(t) {return parseInt(t, 10);}function xi(t) {return t ? t.__builtin__ ? !0 : "function" != typeof t.resize || "function" != typeof t.refresh ? !1 : !0 : !1;}function _i(t, e, n) {return Vg.copy(t.getBoundingRect()), t.transform && Vg.applyTransform(t.transform), Wg.width = e, Wg.height = n, !Vg.intersect(Wg);}function wi(t, e) {if (t == e) return !1;if (!t || !e || t.length !== e.length) return !0;for (var n = 0; n < t.length; n++) {if (t[n] !== e[n]) return !0;}}function bi(t, e) {for (var n = 0; n < t.length; n++) {var i = t[n];i.setTransform(e), e.beginPath(), i.buildPath(e, i.shape), e.clip(), i.restoreTransform(e);}}function Mi(t, e) {var n = document.createElement("div");return n.style.cssText = ["position:relative", "overflow:hidden", "width:" + t + "px", "height:" + e + "px", "padding:0", "margin:0", "border-width:0"].join(";") + ";", n;}function Si(t) {var e = t[1][0] - t[0][0],n = t[1][1] - t[0][1];return Math.sqrt(e * e + n * n);}function Ii(t) {return [(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2];}function Ti(t) {return "mousewheel" === t && np.browser.firefox ? "DOMMouseScroll" : t;}function Ai(t, e, n) {var i = t._gestureMgr;"start" === n && i.clear();var r = i.recognize(e, t.handler.findHover(e.zrX, e.zrY, null).target, t.dom);if ("end" === n && i.clear(), r) {var a = r.type;e.gestureEvent = a, t.handler.dispatchToElement({ target: r.target }, a, r.event);}}function Ci(t) {t._touching = !0, clearTimeout(t._touchTimer), t._touchTimer = setTimeout(function () {t._touching = !1;}, 700);}function Di(t) {var e = t.pointerType;return "pen" === e || "touch" === e;}function ki(t) {function e(t, e) {return function () {return e._touching ? void 0 : t.apply(e, arguments);};}f(jg, function (e) {t._handlers[e] = y(Kg[e], t);}), f($g, function (e) {t._handlers[e] = y(Kg[e], t);}), f(qg, function (n) {t._handlers[n] = e(Kg[n], t);});}function Pi(t) {function e(e, n) {f(e, function (e) {ge(t, Ti(e), n._handlers[e]);}, n);}Sp.call(this), this.dom = t, this._touching = !1, this._touchTimer, this._gestureMgr = new Zg(), this._handlers = {}, ki(this), np.pointerEventsSupported ? e($g, this) : (np.touchEventsSupported && e(jg, this), e(qg, this));}function Li(t, e) {var n = new iv(tp(), t, e);return ev[n.id] = n, n;}function Oi(t) {if (t) t.dispose();else {for (var e in ev) {ev.hasOwnProperty(e) && ev[e].dispose();}ev = {};}return this;}function zi(t) {return ev[t];}function Ei(t, e) {tv[t] = e;}function Bi(t) {delete ev[t];}function Ri(t) {return t instanceof Array ? t : null == t ? [] : [t];}function Ni(t, e, n) {if (t) {t[e] = t[e] || {}, t.emphasis = t.emphasis || {}, t.emphasis[e] = t.emphasis[e] || {};for (var i = 0, r = n.length; r > i; i++) {var a = n[i];!t.emphasis[e].hasOwnProperty(a) && t[e].hasOwnProperty(a) && (t.emphasis[e][a] = t[e][a]);}}}function Fi(t) {return !ov(t) || sv(t) || t instanceof Date ? t : t.value;}function Vi(t) {return ov(t) && !(t instanceof Array);}function Wi(t, e) {e = (e || []).slice();var n = p(t || [], function (t) {return { exist: t };});return av(e, function (t, i) {if (ov(t)) {for (var r = 0; r < n.length; r++) {if (!n[r].option && null != t.id && n[r].exist.id === t.id + "") return n[r].option = t, void (e[i] = null);}for (var r = 0; r < n.length; r++) {var a = n[r].exist;if (!(n[r].option || null != a.id && null != t.id || null == t.name || Zi(t) || Zi(a) || a.name !== t.name + "")) return n[r].option = t, void (e[i] = null);}}}), av(e, function (t) {if (ov(t)) {for (var e = 0; e < n.length; e++) {var i = n[e].exist;if (!n[e].option && !Zi(i) && null == t.id) {n[e].option = t;break;}}e >= n.length && n.push({ option: t });}}), n;}function Gi(t) {var e = N();av(t, function (t) {var n = t.exist;n && e.set(n.id, t);}), av(t, function (t) {var n = t.option;O(!n || null == n.id || !e.get(n.id) || e.get(n.id) === t, "id duplicates: " + (n && n.id)), n && null != n.id && e.set(n.id, t), !t.keyInfo && (t.keyInfo = {});}), av(t, function (t, n) {var i = t.exist,r = t.option,a = t.keyInfo;if (ov(r)) {if (a.name = null != r.name ? r.name + "" : i ? i.name : lv + n, i) a.id = i.id;else if (null != r.id) a.id = r.id + "";else {var o = 0;do {a.id = "\x00" + a.name + "\x00" + o++;} while (e.get(a.id));}e.set(a.id, t);}});}function Hi(t) {var e = t.name;return !(!e || !e.indexOf(lv));}function Zi(t) {return ov(t) && t.id && 0 === (t.id + "").indexOf("\x00_ec_\x00");}function Xi(t, e) {return null != e.dataIndexInside ? e.dataIndexInside : null != e.dataIndex ? _(e.dataIndex) ? p(e.dataIndex, function (e) {return t.indexOfRawIndex(e);}) : t.indexOfRawIndex(e.dataIndex) : null != e.name ? _(e.name) ? p(e.name, function (e) {return t.indexOfName(e);}) : t.indexOfName(e.name) : void 0;}function Yi() {var t = "__\x00ec_inner_" + hv++ + "_" + Math.random().toFixed(5);return function (e) {return e[t] || (e[t] = {});};}function qi(t, e, n) {if (b(e)) {var i = {};i[e + "Index"] = 0, e = i;}var r = n && n.defaultMainType;!r || ji(e, r + "Index") || ji(e, r + "Id") || ji(e, r + "Name") || (e[r + "Index"] = 0);var a = {};return av(e, function (i, r) {var i = e[r];if ("dataIndex" === r || "dataIndexInside" === r) return void (a[r] = i);var o = r.match(/^(\w+)(Index|Id|Name)$/) || [],s = o[1],l = (o[2] || "").toLowerCase();if (!(!s || !l || null == i || "index" === l && "none" === i || n && n.includeMainTypes && u(n.includeMainTypes, s) < 0)) {var h = { mainType: s };("index" !== l || "all" !== i) && (h[l] = i);var c = t.queryComponents(h);a[s + "Models"] = c, a[s + "Model"] = c[0];}}), a;}function ji(t, e) {return t && t.hasOwnProperty(e);}function Ui(t, e, n) {t.setAttribute ? t.setAttribute(e, n) : t[e] = n;}function $i(t, e) {return t.getAttribute ? t.getAttribute(e) : t[e];}function Ki(t) {return "auto" === t ? np.domSupported ? "html" : "richText" : t || "html";}function Qi(t) {var e = { main: "", sub: "" };return t && (t = t.split(cv), e.main = t[0] || "", e.sub = t[1] || ""), e;}function Ji(t) {O(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(t), 'componentType "' + t + '" illegal');}function tr(t) {t.$constructor = t, t.extend = function (t) {var e = this,n = function n() {t.$constructor ? t.$constructor.apply(this, arguments) : e.apply(this, arguments);};return o(n.prototype, t), n.extend = this.extend, n.superCall = nr, n.superApply = ir, h(n, this), n.superClass = e, n;};}function er(t) {var e = ["__\x00is_clz", fv++, Math.random().toFixed(3)].join("_");t.prototype[e] = !0, t.isInstance = function (t) {return !(!t || !t[e]);};}function nr(t, e) {var n = P(arguments, 2);return this.superClass.prototype[e].apply(t, n);}function ir(t, e, n) {return this.superClass.prototype[e].apply(t, n);}function rr(t, e) {function n(t) {var e = i[t.main];return e && e[dv] || (e = i[t.main] = {}, e[dv] = !0), e;}e = e || {};var i = {};if (t.registerClass = function (t, e) {if (e) if (Ji(e), e = Qi(e), e.sub) {if (e.sub !== dv) {var r = n(e);r[e.sub] = t;}} else i[e.main] = t;return t;}, t.getClass = function (t, e, n) {var r = i[t];if (r && r[dv] && (r = e ? r[e] : null), n && !r) throw new Error(e ? "Component " + t + "." + (e || "") + " not exists. Load it first." : t + ".type should be specified.");return r;}, t.getClassesByMainType = function (t) {t = Qi(t);var e = [],n = i[t.main];return n && n[dv] ? f(n, function (t, n) {n !== dv && e.push(t);}) : e.push(n), e;}, t.hasClass = function (t) {return t = Qi(t), !!i[t.main];}, t.getAllClassMainTypes = function () {var t = [];return f(i, function (e, n) {t.push(n);}), t;}, t.hasSubTypes = function (t) {t = Qi(t);var e = i[t.main];return e && e[dv];}, t.parseClassType = Qi, e.registerWhenExtend) {var r = t.extend;r && (t.extend = function (e) {var n = r.call(this, e);return t.registerClass(n, e.type);});}return t;}function ar(t) {return t > -wv && wv > t;}function or(t) {return t > wv || -wv > t;}function sr(t, e, n, i, r) {var a = 1 - r;return a * a * (a * t + 3 * r * e) + r * r * (r * i + 3 * a * n);}function lr(t, e, n, i, r) {var a = 1 - r;return 3 * (((e - t) * a + 2 * (n - e) * r) * a + (i - n) * r * r);}function ur(t, e, n, i, r, a) {var o = i + 3 * (e - n) - t,s = 3 * (n - 2 * e + t),l = 3 * (e - t),u = t - r,h = s * s - 3 * o * l,c = s * l - 9 * o * u,d = l * l - 3 * s * u,f = 0;if (ar(h) && ar(c)) {if (ar(s)) a[0] = 0;else {var p = -l / s;p >= 0 && 1 >= p && (a[f++] = p);}} else {var g = c * c - 4 * h * d;if (ar(g)) {var v = c / h,p = -s / o + v,m = -v / 2;p >= 0 && 1 >= p && (a[f++] = p), m >= 0 && 1 >= m && (a[f++] = m);} else if (g > 0) {var y = _v(g),x = h * s + 1.5 * o * (-c + y),_ = h * s + 1.5 * o * (-c - y);x = 0 > x ? -xv(-x, Sv) : xv(x, Sv), _ = 0 > _ ? -xv(-_, Sv) : xv(_, Sv);var p = (-s - (x + _)) / (3 * o);p >= 0 && 1 >= p && (a[f++] = p);} else {var w = (2 * h * s - 3 * o * c) / (2 * _v(h * h * h)),b = Math.acos(w) / 3,M = _v(h),S = Math.cos(b),p = (-s - 2 * M * S) / (3 * o),m = (-s + M * (S + Mv * Math.sin(b))) / (3 * o),I = (-s + M * (S - Mv * Math.sin(b))) / (3 * o);p >= 0 && 1 >= p && (a[f++] = p), m >= 0 && 1 >= m && (a[f++] = m), I >= 0 && 1 >= I && (a[f++] = I);}}return f;}function hr(t, e, n, i, r) {var a = 6 * n - 12 * e + 6 * t,o = 9 * e + 3 * i - 3 * t - 9 * n,s = 3 * e - 3 * t,l = 0;if (ar(o)) {if (or(a)) {var u = -s / a;u >= 0 && 1 >= u && (r[l++] = u);}} else {var h = a * a - 4 * o * s;if (ar(h)) r[0] = -a / (2 * o);else if (h > 0) {var c = _v(h),u = (-a + c) / (2 * o),d = (-a - c) / (2 * o);u >= 0 && 1 >= u && (r[l++] = u), d >= 0 && 1 >= d && (r[l++] = d);}}return l;}function cr(t, e, n, i, r, a) {var o = (e - t) * r + t,s = (n - e) * r + e,l = (i - n) * r + n,u = (s - o) * r + o,h = (l - s) * r + s,c = (h - u) * r + u;a[0] = t, a[1] = o, a[2] = u, a[3] = c, a[4] = c, a[5] = h, a[6] = l, a[7] = i;}function dr(t, e, n, i, r, a, o, s, l, u, h) {var c,d,f,p,g,v = .005,m = 1 / 0;Iv[0] = l, Iv[1] = u;for (var y = 0; 1 > y; y += .05) {Tv[0] = sr(t, n, r, o, y), Tv[1] = sr(e, i, a, s, y), p = wp(Iv, Tv), m > p && (c = y, m = p);}m = 1 / 0;for (var x = 0; 32 > x && !(bv > v); x++) {d = c - v, f = c + v, Tv[0] = sr(t, n, r, o, d), Tv[1] = sr(e, i, a, s, d), p = wp(Tv, Iv), d >= 0 && m > p ? (c = d, m = p) : (Av[0] = sr(t, n, r, o, f), Av[1] = sr(e, i, a, s, f), g = wp(Av, Iv), 1 >= f && m > g ? (c = f, m = g) : v *= .5);}return h && (h[0] = sr(t, n, r, o, c), h[1] = sr(e, i, a, s, c)), _v(m);}function fr(t, e, n, i) {var r = 1 - i;return r * (r * t + 2 * i * e) + i * i * n;}function pr(t, e, n, i) {return 2 * ((1 - i) * (e - t) + i * (n - e));}function gr(t, e, n, i, r) {var a = t - 2 * e + n,o = 2 * (e - t),s = t - i,l = 0;if (ar(a)) {if (or(o)) {var u = -s / o;u >= 0 && 1 >= u && (r[l++] = u);}} else {var h = o * o - 4 * a * s;if (ar(h)) {var u = -o / (2 * a);u >= 0 && 1 >= u && (r[l++] = u);} else if (h > 0) {var c = _v(h),u = (-o + c) / (2 * a),d = (-o - c) / (2 * a);u >= 0 && 1 >= u && (r[l++] = u), d >= 0 && 1 >= d && (r[l++] = d);}}return l;}function vr(t, e, n) {var i = t + n - 2 * e;return 0 === i ? .5 : (t - e) / i;}function mr(t, e, n, i, r) {var a = (e - t) * i + t,o = (n - e) * i + e,s = (o - a) * i + a;r[0] = t, r[1] = a, r[2] = s, r[3] = s, r[4] = o, r[5] = n;}function yr(t, e, n, i, r, a, o, s, l) {var u,h = .005,c = 1 / 0;Iv[0] = o, Iv[1] = s;for (var d = 0; 1 > d; d += .05) {Tv[0] = fr(t, n, r, d), Tv[1] = fr(e, i, a, d);var f = wp(Iv, Tv);c > f && (u = d, c = f);}c = 1 / 0;for (var p = 0; 32 > p && !(bv > h); p++) {var g = u - h,v = u + h;Tv[0] = fr(t, n, r, g), Tv[1] = fr(e, i, a, g);var f = wp(Tv, Iv);if (g >= 0 && c > f) u = g, c = f;else {Av[0] = fr(t, n, r, v), Av[1] = fr(e, i, a, v);var m = wp(Av, Iv);1 >= v && c > m ? (u = v, c = m) : h *= .5;}}return l && (l[0] = fr(t, n, r, u), l[1] = fr(e, i, a, u)), _v(c);}function xr(t, e, n) {if (0 !== t.length) {var i,r = t[0],a = r[0],o = r[0],s = r[1],l = r[1];for (i = 1; i < t.length; i++) {r = t[i], a = Cv(a, r[0]), o = Dv(o, r[0]), s = Cv(s, r[1]), l = Dv(l, r[1]);}e[0] = a, e[1] = s, n[0] = o, n[1] = l;}}function _r(t, e, n, i, r, a) {r[0] = Cv(t, n), r[1] = Cv(e, i), a[0] = Dv(t, n), a[1] = Dv(e, i);}function wr(t, e, n, i, r, a, o, s, l, u) {var h,c = hr,d = sr,f = c(t, n, r, o, Bv);for (l[0] = 1 / 0, l[1] = 1 / 0, u[0] = -1 / 0, u[1] = -1 / 0, h = 0; f > h; h++) {var p = d(t, n, r, o, Bv[h]);l[0] = Cv(p, l[0]), u[0] = Dv(p, u[0]);}for (f = c(e, i, a, s, Rv), h = 0; f > h; h++) {var g = d(e, i, a, s, Rv[h]);l[1] = Cv(g, l[1]), u[1] = Dv(g, u[1]);}l[0] = Cv(t, l[0]), u[0] = Dv(t, u[0]), l[0] = Cv(o, l[0]), u[0] = Dv(o, u[0]), l[1] = Cv(e, l[1]), u[1] = Dv(e, u[1]), l[1] = Cv(s, l[1]), u[1] = Dv(s, u[1]);}function br(t, e, n, i, r, a, o, s) {var l = vr,u = fr,h = Dv(Cv(l(t, n, r), 1), 0),c = Dv(Cv(l(e, i, a), 1), 0),d = u(t, n, r, h),f = u(e, i, a, c);o[0] = Cv(t, r, d), o[1] = Cv(e, a, f), s[0] = Dv(t, r, d), s[1] = Dv(e, a, f);}function Mr(t, e, n, i, r, a, o, s, l) {var u = oe,h = se,c = Math.abs(r - a);if (1e-4 > c % Lv && c > 1e-4) return s[0] = t - n, s[1] = e - i, l[0] = t + n, void (l[1] = e + i);if (Ov[0] = Pv(r) * n + t, Ov[1] = kv(r) * i + e, zv[0] = Pv(a) * n + t, zv[1] = kv(a) * i + e, u(s, Ov, zv), h(l, Ov, zv), r %= Lv, 0 > r && (r += Lv), a %= Lv, 0 > a && (a += Lv), r > a && !o ? a += Lv : a > r && o && (r += Lv), o) {var d = a;a = r, r = d;}for (var f = 0; a > f; f += Math.PI / 2) {f > r && (Ev[0] = Pv(f) * n + t, Ev[1] = kv(f) * i + e, u(s, Ev, s), h(l, Ev, l));}}function Sr(t, e, n, i, r, a, o) {if (0 === r) return !1;var s = r,l = 0,u = t;if (o > e + s && o > i + s || e - s > o && i - s > o || a > t + s && a > n + s || t - s > a && n - s > a) return !1;if (t === n) return Math.abs(a - t) <= s / 2;l = (e - i) / (t - n), u = (t * i - n * e) / (t - n);var h = l * a - o + u,c = h * h / (l * l + 1);return s / 2 * s / 2 >= c;}function Ir(t, e, n, i, r, a, o, s, l, u, h) {if (0 === l) return !1;var c = l;if (h > e + c && h > i + c && h > a + c && h > s + c || e - c > h && i - c > h && a - c > h && s - c > h || u > t + c && u > n + c && u > r + c && u > o + c || t - c > u && n - c > u && r - c > u && o - c > u) return !1;var d = dr(t, e, n, i, r, a, o, s, u, h, null);return c / 2 >= d;}function Tr(t, e, n, i, r, a, o, s, l) {if (0 === o) return !1;var u = o;if (l > e + u && l > i + u && l > a + u || e - u > l && i - u > l && a - u > l || s > t + u && s > n + u && s > r + u || t - u > s && n - u > s && r - u > s) return !1;var h = yr(t, e, n, i, r, a, s, l, null);return u / 2 >= h;}function Ar(t) {return t %= Kv, 0 > t && (t += Kv), t;}function Cr(t, e, n, i, r, a, o, s, l) {if (0 === o) return !1;var u = o;s -= t, l -= e;var h = Math.sqrt(s * s + l * l);if (h - u > n || n > h + u) return !1;if (Math.abs(i - r) % Qv < 1e-4) return !0;if (a) {var c = i;i = Ar(r), r = Ar(c);} else i = Ar(i), r = Ar(r);i > r && (r += Qv);var d = Math.atan2(l, s);return 0 > d && (d += Qv), d >= i && r >= d || d + Qv >= i && r >= d + Qv;}function Dr(t, e, n, i, r, a) {if (a > e && a > i || e > a && i > a) return 0;if (i === e) return 0;var o = e > i ? 1 : -1,s = (a - e) / (i - e);(1 === s || 0 === s) && (o = e > i ? .5 : -.5);var l = s * (n - t) + t;return l === r ? 1 / 0 : l > r ? o : 0;}function kr(t, e) {return Math.abs(t - e) < em;}function Pr() {var t = im[0];im[0] = im[1], im[1] = t;}function Lr(t, e, n, i, r, a, o, s, l, u) {if (u > e && u > i && u > a && u > s || e > u && i > u && a > u && s > u) return 0;var h = ur(e, i, a, s, u, nm);if (0 === h) return 0;for (var c, d, f = 0, p = -1, g = 0; h > g; g++) {var v = nm[g],m = 0 === v || 1 === v ? .5 : 1,y = sr(t, n, r, o, v);l > y || (0 > p && (p = hr(e, i, a, s, im), im[1] < im[0] && p > 1 && Pr(), c = sr(e, i, a, s, im[0]), p > 1 && (d = sr(e, i, a, s, im[1]))), f += 2 == p ? v < im[0] ? e > c ? m : -m : v < im[1] ? c > d ? m : -m : d > s ? m : -m : v < im[0] ? e > c ? m : -m : c > s ? m : -m);}return f;}function Or(t, e, n, i, r, a, o, s) {if (s > e && s > i && s > a || e > s && i > s && a > s) return 0;var l = gr(e, i, a, s, nm);if (0 === l) return 0;var u = vr(e, i, a);if (u >= 0 && 1 >= u) {for (var h = 0, c = fr(e, i, a, u), d = 0; l > d; d++) {var f = 0 === nm[d] || 1 === nm[d] ? .5 : 1,p = fr(t, n, r, nm[d]);o > p || (h += nm[d] < u ? e > c ? f : -f : c > a ? f : -f);}return h;}var f = 0 === nm[0] || 1 === nm[0] ? .5 : 1,p = fr(t, n, r, nm[0]);return o > p ? 0 : e > a ? f : -f;}function zr(t, e, n, i, r, a, o, s) {if (s -= e, s > n || -n > s) return 0;var l = Math.sqrt(n * n - s * s);nm[0] = -l, nm[1] = l;var u = Math.abs(i - r);if (1e-4 > u) return 0;if (1e-4 > u % tm) {i = 0, r = tm;var h = a ? 1 : -1;return o >= nm[0] + t && o <= nm[1] + t ? h : 0;}if (a) {var l = i;i = Ar(r), r = Ar(l);} else i = Ar(i), r = Ar(r);i > r && (r += tm);for (var c = 0, d = 0; 2 > d; d++) {var f = nm[d];if (f + t > o) {var p = Math.atan2(s, f),h = a ? 1 : -1;0 > p && (p = tm + p), (p >= i && r >= p || p + tm >= i && r >= p + tm) && (p > Math.PI / 2 && p < 1.5 * Math.PI && (h = -h), c += h);}}return c;}function Er(t, e, n, i, r) {for (var a = 0, o = 0, s = 0, l = 0, u = 0, h = 0; h < t.length;) {var c = t[h++];switch (c === Jv.M && h > 1 && (n || (a += Dr(o, s, l, u, i, r))), 1 == h && (o = t[h], s = t[h + 1], l = o, u = s), c) {case Jv.M:l = t[h++], u = t[h++], o = l, s = u;break;case Jv.L:if (n) {if (Sr(o, s, t[h], t[h + 1], e, i, r)) return !0;} else a += Dr(o, s, t[h], t[h + 1], i, r) || 0;o = t[h++], s = t[h++];break;case Jv.C:if (n) {if (Ir(o, s, t[h++], t[h++], t[h++], t[h++], t[h], t[h + 1], e, i, r)) return !0;} else a += Lr(o, s, t[h++], t[h++], t[h++], t[h++], t[h], t[h + 1], i, r) || 0;o = t[h++], s = t[h++];break;case Jv.Q:if (n) {if (Tr(o, s, t[h++], t[h++], t[h], t[h + 1], e, i, r)) return !0;} else a += Or(o, s, t[h++], t[h++], t[h], t[h + 1], i, r) || 0;o = t[h++], s = t[h++];break;case Jv.A:var d = t[h++],f = t[h++],p = t[h++],g = t[h++],v = t[h++],m = t[h++],y = (t[h++], 1 - t[h++]),x = Math.cos(v) * p + d,_ = Math.sin(v) * g + f;h > 1 ? a += Dr(o, s, x, _, i, r) : (l = x, u = _);var w = (i - d) * g / p + d;if (n) {if (Cr(d, f, g, v, v + m, y, e, w, r)) return !0;} else a += zr(d, f, g, v, v + m, y, w, r);o = Math.cos(v + m) * p + d, s = Math.sin(v + m) * g + f;break;case Jv.R:l = o = t[h++], u = s = t[h++];var b = t[h++],M = t[h++],x = l + b,_ = u + M;if (n) {if (Sr(l, u, x, u, e, i, r) || Sr(x, u, x, _, e, i, r) || Sr(x, _, l, _, e, i, r) || Sr(l, _, l, u, e, i, r)) return !0;} else a += Dr(x, u, x, _, i, r), a += Dr(l, _, l, u, i, r);break;case Jv.Z:if (n) {if (Sr(o, s, l, u, e, i, r)) return !0;} else a += Dr(o, s, l, u, i, r);o = l, s = u;}}return n || kr(s, u) || (a += Dr(o, s, l, u, i, r) || 0), 0 !== a;}function Br(t, e, n) {return Er(t, 0, !1, e, n);}function Rr(t, e, n, i) {return Er(t, e, !0, n, i);}function Nr(t) {vi.call(this, t), this.path = null;}function Fr(t, e, n, i, r, a, o, s, l, u, h) {var c = l * (gm / 180),d = pm(c) * (t - n) / 2 + fm(c) * (e - i) / 2,f = -1 * fm(c) * (t - n) / 2 + pm(c) * (e - i) / 2,p = d * d / (o * o) + f * f / (s * s);p > 1 && (o *= dm(p), s *= dm(p));var g = (r === a ? -1 : 1) * dm((o * o * s * s - o * o * f * f - s * s * d * d) / (o * o * f * f + s * s * d * d)) || 0,v = g * o * f / s,m = g * -s * d / o,y = (t + n) / 2 + pm(c) * v - fm(c) * m,x = (e + i) / 2 + fm(c) * v + pm(c) * m,_ = ym([1, 0], [(d - v) / o, (f - m) / s]),w = [(d - v) / o, (f - m) / s],b = [(-1 * d - v) / o, (-1 * f - m) / s],M = ym(w, b);mm(w, b) <= -1 && (M = gm), mm(w, b) >= 1 && (M = 0), 0 === a && M > 0 && (M -= 2 * gm), 1 === a && 0 > M && (M += 2 * gm), h.addData(u, y, x, o, s, _, M, c, a);}function Vr(t) {if (!t) return new $v();for (var e, n = 0, i = 0, r = n, a = i, o = new $v(), s = $v.CMD, l = t.match(xm), u = 0; u < l.length; u++) {for (var h, c = l[u], d = c.charAt(0), f = c.match(_m) || [], p = f.length, g = 0; p > g; g++) {f[g] = parseFloat(f[g]);}for (var v = 0; p > v;) {var m,y,x,_,w,b,M,S = n,I = i;switch (d) {case "l":n += f[v++], i += f[v++], h = s.L, o.addData(h, n, i);break;case "L":n = f[v++], i = f[v++], h = s.L, o.addData(h, n, i);break;case "m":n += f[v++], i += f[v++], h = s.M, o.addData(h, n, i), r = n, a = i, d = "l";break;case "M":n = f[v++], i = f[v++], h = s.M, o.addData(h, n, i), r = n, a = i, d = "L";break;case "h":n += f[v++], h = s.L, o.addData(h, n, i);break;case "H":n = f[v++], h = s.L, o.addData(h, n, i);break;case "v":i += f[v++], h = s.L, o.addData(h, n, i);break;case "V":i = f[v++], h = s.L, o.addData(h, n, i);break;case "C":h = s.C, o.addData(h, f[v++], f[v++], f[v++], f[v++], f[v++], f[v++]), n = f[v - 2], i = f[v - 1];break;case "c":h = s.C, o.addData(h, f[v++] + n, f[v++] + i, f[v++] + n, f[v++] + i, f[v++] + n, f[v++] + i), n += f[v - 2], i += f[v - 1];break;case "S":m = n, y = i;var T = o.len(),A = o.data;e === s.C && (m += n - A[T - 4], y += i - A[T - 3]), h = s.C, S = f[v++], I = f[v++], n = f[v++], i = f[v++], o.addData(h, m, y, S, I, n, i);break;case "s":m = n, y = i;var T = o.len(),A = o.data;e === s.C && (m += n - A[T - 4], y += i - A[T - 3]), h = s.C, S = n + f[v++], I = i + f[v++], n += f[v++], i += f[v++], o.addData(h, m, y, S, I, n, i);break;case "Q":S = f[v++], I = f[v++], n = f[v++], i = f[v++], h = s.Q, o.addData(h, S, I, n, i);break;case "q":S = f[v++] + n, I = f[v++] + i, n += f[v++], i += f[v++], h = s.Q, o.addData(h, S, I, n, i);break;case "T":m = n, y = i;var T = o.len(),A = o.data;e === s.Q && (m += n - A[T - 4], y += i - A[T - 3]), n = f[v++], i = f[v++], h = s.Q, o.addData(h, m, y, n, i);break;case "t":m = n, y = i;var T = o.len(),A = o.data;e === s.Q && (m += n - A[T - 4], y += i - A[T - 3]), n += f[v++], i += f[v++], h = s.Q, o.addData(h, m, y, n, i);break;case "A":x = f[v++], _ = f[v++], w = f[v++], b = f[v++], M = f[v++], S = n, I = i, n = f[v++], i = f[v++], h = s.A, Fr(S, I, n, i, b, M, x, _, w, h, o);break;case "a":x = f[v++], _ = f[v++], w = f[v++], b = f[v++], M = f[v++], S = n, I = i, n += f[v++], i += f[v++], h = s.A, Fr(S, I, n, i, b, M, x, _, w, h, o);}}("z" === d || "Z" === d) && (h = s.Z, o.addData(h), n = r, i = a), e = h;}return o.toStatic(), o;}function Wr(t, e) {var n = Vr(t);return e = e || {}, e.buildPath = function (t) {if (t.setData) {t.setData(n.data);var e = t.getContext();e && t.rebuildPath(e);} else {var e = t;n.rebuildPath(e);}}, e.applyTransform = function (t) {cm(n, t), this.dirty(!0);}, e;}function Gr(t, e) {return new Nr(Wr(t, e));}function Hr(t, e) {return Nr.extend(Wr(t, e));}function Zr(t, e) {for (var n = [], i = t.length, r = 0; i > r; r++) {var a = t[r];a.path || a.createPathProxy(), a.__dirtyPath && a.buildPath(a.path, a.shape, !0), n.push(a.path);}var o = new Nr(e);return o.createPathProxy(), o.buildPath = function (t) {t.appendPath(n);var e = t.getContext();e && t.rebuildPath(e);}, o;}function Xr(t, e, n, i, r, a, o) {var s = .5 * (n - t),l = .5 * (i - e);return (2 * (e - n) + s + l) * o + (-3 * (e - n) - 2 * s - l) * a + s * r + e;}function Yr(t, e, n) {var i = e.points,r = e.smooth;if (i && i.length >= 2) {if (r && "spline" !== r) {var a = Cm(i, r, n, e.smoothConstraint);t.moveTo(i[0][0], i[0][1]);for (var o = i.length, s = 0; (n ? o : o - 1) > s; s++) {var l = a[2 * s],u = a[2 * s + 1],h = i[(s + 1) % o];t.bezierCurveTo(l[0], l[1], u[0], u[1], h[0], h[1]);}} else {"spline" === r && (i = Am(i, n)), t.moveTo(i[0][0], i[0][1]);for (var s = 1, c = i.length; c > s; s++) {t.lineTo(i[s][0], i[s][1]);}}n && t.closePath();}}function qr(t, e, n) {var i = t.cpx2,r = t.cpy2;return null === i || null === r ? [(n ? lr : sr)(t.x1, t.cpx1, t.cpx2, t.x2, e), (n ? lr : sr)(t.y1, t.cpy1, t.cpy2, t.y2, e)] : [(n ? pr : fr)(t.x1, t.cpx1, t.x2, e), (n ? pr : fr)(t.y1, t.cpy1, t.y2, e)];}function jr(t) {vi.call(this, t), this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.notClear = !0;}function Ur(t) {return Nr.extend(t);}function $r(t, e) {return Hr(t, e);}function Kr(t, e, n, i) {var r = Gr(t, e);return n && ("center" === i && (n = Jr(n, r.getBoundingRect())), ta(r, n)), r;}function Qr(t, e, n) {var i = new mi({ style: { image: t, x: e.x, y: e.y, width: e.width, height: e.height }, onload: function onload(t) {if ("center" === n) {var r = { width: t.width, height: t.height };i.setStyle(Jr(e, r));}} });return i;}function Jr(t, e) {var n,i = e.width / e.height,r = t.height * i;r <= t.width ? n = t.height : (r = t.width, n = r / i);var a = t.x + t.width / 2,o = t.y + t.height / 2;return { x: a - r / 2, y: o - n / 2, width: r, height: n };}function ta(t, e) {if (t.applyTransform) {var n = t.getBoundingRect(),i = n.calculateTransform(e);t.applyTransform(i);}}function ea(t) {var e = t.shape,n = t.style.lineWidth;return Wm(2 * e.x1) === Wm(2 * e.x2) && (e.x1 = e.x2 = ia(e.x1, n, !0)), Wm(2 * e.y1) === Wm(2 * e.y2) && (e.y1 = e.y2 = ia(e.y1, n, !0)), t;}function na(t) {var e = t.shape,n = t.style.lineWidth,i = e.x,r = e.y,a = e.width,o = e.height;return e.x = ia(e.x, n, !0), e.y = ia(e.y, n, !0), e.width = Math.max(ia(i + a, n, !1) - e.x, 0 === a ? 0 : 1), e.height = Math.max(ia(r + o, n, !1) - e.y, 0 === o ? 0 : 1), t;}function ia(t, e, n) {var i = Wm(2 * t);return (i + Wm(e)) % 2 === 0 ? i / 2 : (i + (n ? 1 : -1)) / 2;}function ra(t) {return null != t && "none" !== t;}function aa(t) {if ("string" != typeof t) return t;var e = Ym.get(t);return e || (e = Ye(t, -.1), 1e4 > qm && (Ym.set(t, e), qm++)), e;}function oa(t) {if (t.__hoverStlDirty) {t.__hoverStlDirty = !1;var e = t.__hoverStl;if (!e) return void (t.__normalStl = null);var n = t.__normalStl = {},i = t.style;for (var r in e) {null != e[r] && (n[r] = i[r]);}n.fill = i.fill, n.stroke = i.stroke;}}function sa(t) {var e = t.__hoverStl;if (e && !t.__highlighted) {var n = t.useHoverLayer;t.__highlighted = n ? "layer" : "plain";var i = t.__zr;if (i || !n) {var r = t,a = t.style;n && (r = i.addHover(t), a = r.style), Ca(a), n || oa(r), a.extendFrom(e), la(a, e, "fill"), la(a, e, "stroke"), Aa(a), n || (t.dirty(!1), t.z2 += 1);}}}function la(t, e, n) {!ra(e[n]) && ra(t[n]) && (t[n] = aa(t[n]));}function ua(t) {t.__highlighted && (ha(t), t.__highlighted = !1);}function ha(t) {var e = t.__highlighted;if ("layer" === e) t.__zr && t.__zr.removeHover(t);else if (e) {var n = t.style,i = t.__normalStl;i && (Ca(n), t.setStyle(i), Aa(n), t.z2 -= 1);}}function ca(t, e) {t.isGroup ? t.traverse(function (t) {!t.isGroup && e(t);}) : e(t);}function da(t, e) {e = t.__hoverStl = e !== !1 && (e || {}), t.__hoverStlDirty = !0, t.__highlighted && (ua(t), sa(t));}function fa(t) {return t && t.__isEmphasisEntered;}function pa(t) {this.__hoverSilentOnTouch && t.zrByTouch || !this.__isEmphasisEntered && ca(this, sa);}function ga(t) {this.__hoverSilentOnTouch && t.zrByTouch || !this.__isEmphasisEntered && ca(this, ua);}function va() {this.__isEmphasisEntered = !0, ca(this, sa);}function ma() {this.__isEmphasisEntered = !1, ca(this, ua);}function ya(t, e, n) {t.isGroup ? t.traverse(function (t) {!t.isGroup && da(t, t.hoverStyle || e);}) : da(t, t.hoverStyle || e), xa(t, n);}function xa(t, e) {var n = e === !1;if (t.__hoverSilentOnTouch = null != e && e.hoverSilentOnTouch, !n || t.__hoverStyleTrigger) {var i = n ? "off" : "on";t[i]("mouseover", pa)[i]("mouseout", ga), t[i]("emphasis", va)[i]("normal", ma), t.__hoverStyleTrigger = !n;}}function _a(t, e, n, i, r, a, o) {r = r || Zm;var s,l = r.labelFetcher,u = r.labelDataIndex,h = r.labelDimIndex,c = n.getShallow("show"),d = i.getShallow("show");(c || d) && (l && (s = l.getFormattedLabel(u, "normal", null, h)), null == s && (s = w(r.defaultText) ? r.defaultText(u, r) : r.defaultText));var f = c ? s : null,p = d ? D(l ? l.getFormattedLabel(u, "emphasis", null, h) : null, s) : null;(null != f || null != p) && (wa(t, n, a, r), wa(e, i, o, r, !0)), t.text = f, e.text = p;}function wa(t, e, n, i, r) {return Ma(t, e, i, r), n && o(t, n), t;}function ba(t, e, n) {var i,r = { isRectText: !0 };n === !1 ? i = !0 : r.autoColor = n, Ma(t, e, r, i);}function Ma(t, e, n, i) {if (n = n || Zm, n.isRectText) {var r = e.getShallow("position") || (i ? null : "inside");"outside" === r && (r = "top"), t.textPosition = r, t.textOffset = e.getShallow("offset");var a = e.getShallow("rotate");null != a && (a *= Math.PI / 180), t.textRotation = a, t.textDistance = D(e.getShallow("distance"), i ? null : 5);}var o,s = e.ecModel,l = s && s.option.textStyle,u = Sa(e);if (u) {o = {};for (var h in u) {if (u.hasOwnProperty(h)) {var c = e.getModel(["rich", h]);Ia(o[h] = {}, c, l, n, i);}}}return t.rich = o, Ia(t, e, l, n, i, !0), n.forceRich && !n.textStyle && (n.textStyle = {}), t;}function Sa(t) {for (var e; t && t !== t.ecModel;) {var n = (t.option || Zm).rich;if (n) {e = e || {};for (var i in n) {n.hasOwnProperty(i) && (e[i] = 1);}}t = t.parentModel;}return e;}function Ia(t, e, n, i, r, a) {n = !r && n || Zm, t.textFill = Ta(e.getShallow("color"), i) || n.color, t.textStroke = Ta(e.getShallow("textBorderColor"), i) || n.textBorderColor, t.textStrokeWidth = D(e.getShallow("textBorderWidth"), n.textBorderWidth), t.insideRawTextPosition = t.textPosition, r || (a && (t.insideRollbackOpt = i, Aa(t)), null == t.textFill && (t.textFill = i.autoColor)), t.fontStyle = e.getShallow("fontStyle") || n.fontStyle, t.fontWeight = e.getShallow("fontWeight") || n.fontWeight, t.fontSize = e.getShallow("fontSize") || n.fontSize, t.fontFamily = e.getShallow("fontFamily") || n.fontFamily, t.textAlign = e.getShallow("align"), t.textVerticalAlign = e.getShallow("verticalAlign") || e.getShallow("baseline"), t.textLineHeight = e.getShallow("lineHeight"), t.textWidth = e.getShallow("width"), t.textHeight = e.getShallow("height"), t.textTag = e.getShallow("tag"), a && i.disableBox || (t.textBackgroundColor = Ta(e.getShallow("backgroundColor"), i), t.textPadding = e.getShallow("padding"), t.textBorderColor = Ta(e.getShallow("borderColor"), i), t.textBorderWidth = e.getShallow("borderWidth"), t.textBorderRadius = e.getShallow("borderRadius"), t.textBoxShadowColor = e.getShallow("shadowColor"), t.textBoxShadowBlur = e.getShallow("shadowBlur"), t.textBoxShadowOffsetX = e.getShallow("shadowOffsetX"), t.textBoxShadowOffsetY = e.getShallow("shadowOffsetY")), t.textShadowColor = e.getShallow("textShadowColor") || n.textShadowColor, t.textShadowBlur = e.getShallow("textShadowBlur") || n.textShadowBlur, t.textShadowOffsetX = e.getShallow("textShadowOffsetX") || n.textShadowOffsetX, t.textShadowOffsetY = e.getShallow("textShadowOffsetY") || n.textShadowOffsetY;}function Ta(t, e) {return "auto" !== t ? t : e && e.autoColor ? e.autoColor : null;}function Aa(t) {var e = t.insideRollbackOpt;if (e && null == t.textFill) {var n,i = e.useInsideStyle,r = t.insideRawTextPosition,a = e.autoColor;i !== !1 && (i === !0 || e.isRectText && r && "string" == typeof r && r.indexOf("inside") >= 0) ? (n = { textFill: null, textStroke: t.textStroke, textStrokeWidth: t.textStrokeWidth }, t.textFill = "#fff", null == t.textStroke && (t.textStroke = a, null == t.textStrokeWidth && (t.textStrokeWidth = 2))) : null != a && (n = { textFill: null }, t.textFill = a), n && (t.insideRollback = n);}}function Ca(t) {var e = t.insideRollback;e && (t.textFill = e.textFill, t.textStroke = e.textStroke, t.textStrokeWidth = e.textStrokeWidth, t.insideRollback = null);}function Da(t, e) {var n = e || e.getModel("textStyle");return z([t.fontStyle || n && n.getShallow("fontStyle") || "", t.fontWeight || n && n.getShallow("fontWeight") || "", (t.fontSize || n && n.getShallow("fontSize") || 12) + "px", t.fontFamily || n && n.getShallow("fontFamily") || "sans-serif"].join(" "));}function ka(t, e, n, i, r, a) {"function" == typeof r && (a = r, r = null);var o = i && i.isAnimationEnabled();if (o) {var s = t ? "Update" : "",l = i.getShallow("animationDuration" + s),u = i.getShallow("animationEasing" + s),h = i.getShallow("animationDelay" + s);"function" == typeof h && (h = h(r, i.getAnimationDelayParams ? i.getAnimationDelayParams(e, r) : null)), "function" == typeof l && (l = l(r)), l > 0 ? e.animateTo(n, l, h || 0, u, a, !!a) : (e.stopAnimation(), e.attr(n), a && a());} else e.stopAnimation(), e.attr(n), a && a();}function Pa(t, e, n, i, r) {ka(!0, t, e, n, i, r);}function La(t, e, n, i, r) {ka(!1, t, e, n, i, r);}function Oa(t, e) {for (var n = Me([]); t && t !== e;) {Ie(n, t.getLocalTransform(), n), t = t.parent;}return n;}function za(t, e, n) {return e && !d(e) && (e = Ep.getLocalTransform(e)), n && (e = De([], e)), ae([], t, e);}function Ea(t, e, n) {var i = 0 === e[4] || 0 === e[5] || 0 === e[0] ? 1 : Math.abs(2 * e[4] / e[0]),r = 0 === e[4] || 0 === e[5] || 0 === e[2] ? 1 : Math.abs(2 * e[4] / e[2]),a = ["left" === t ? -i : "right" === t ? i : 0, "top" === t ? -r : "bottom" === t ? r : 0];return a = za(a, e, n), Math.abs(a[0]) > Math.abs(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";}function Ba(t, e, n) {function i(t) {var e = {};return t.traverse(function (t) {!t.isGroup && t.anid && (e[t.anid] = t);}), e;}function r(t) {var e = { position: H(t.position), rotation: t.rotation };return t.shape && (e.shape = o({}, t.shape)), e;}if (t && e) {var a = i(t);e.traverse(function (t) {if (!t.isGroup && t.anid) {var e = a[t.anid];if (e) {var i = r(t);t.attr(r(e)), Pa(t, i, n, t.dataIndex);}}});}}function Ra(t, e) {return p(t, function (t) {var n = t[0];n = Gm(n, e.x), n = Hm(n, e.x + e.width);var i = t[1];return i = Gm(i, e.y), i = Hm(i, e.y + e.height), [n, i];});}function Na(t, e) {var n = Gm(t.x, e.x),i = Hm(t.x + t.width, e.x + e.width),r = Gm(t.y, e.y),a = Hm(t.y + t.height, e.y + e.height);return i >= n && a >= r ? { x: n, y: r, width: i - n, height: a - r } : void 0;}function Fa(t, e, n) {e = o({ rectHover: !0 }, e);var i = e.style = { strokeNoScale: !0 };return n = n || { x: -1, y: -1, width: 2, height: 2 }, t ? 0 === t.indexOf("image://") ? (i.image = t.slice(8), s(i, n), new mi(e)) : Kr(t.replace("path://", ""), e, n, "center") : void 0;}function Va(t, e, n) {this.parentModel = e, this.ecModel = n, this.option = t;}function Wa(t, e, n) {for (var i = 0; i < e.length && (!e[i] || (t = t && "object" == typeof t ? t[e[i]] : null, null != t)); i++) {;}return null == t && n && (t = n.get(e)), t;}function Ga(t, e) {var n = ty(t).getParent;return n ? n.call(t, e) : t.parentModel;}function Ha(t) {return [t || "", ey++, Math.random().toFixed(5)].join("_");}function Za(t) {var e = {};return t.registerSubTypeDefaulter = function (t, n) {t = Qi(t), e[t.main] = n;}, t.determineSubType = function (n, i) {var r = i.type;if (!r) {var a = Qi(n).main;t.hasSubTypes(n) && e[a] && (r = e[a](i));}return r;}, t;}function Xa(t, e) {function n(t) {var n = {},a = [];return f(t, function (o) {var s = i(n, o),l = s.originalDeps = e(o),h = r(l, t);s.entryCount = h.length, 0 === s.entryCount && a.push(o), f(h, function (t) {u(s.predecessor, t) < 0 && s.predecessor.push(t);var e = i(n, t);u(e.successor, t) < 0 && e.successor.push(o);});}), { graph: n, noEntryList: a };}function i(t, e) {return t[e] || (t[e] = { predecessor: [], successor: [] }), t[e];}function r(t, e) {var n = [];return f(t, function (t) {u(e, t) >= 0 && n.push(t);}), n;}t.topologicalTravel = function (t, e, i, r) {function a(t) {l[t].entryCount--, 0 === l[t].entryCount && u.push(t);}function o(t) {h[t] = !0, a(t);}if (t.length) {var s = n(e),l = s.graph,u = s.noEntryList,h = {};for (f(t, function (t) {h[t] = !0;}); u.length;) {var c = u.pop(),d = l[c],p = !!h[c];p && (i.call(r, c, d.originalDeps.slice()), delete h[c]), f(d.successor, p ? o : a);}f(h, function () {throw new Error("Circle dependency may exists");});}};}function Ya(t) {return t.replace(/^\s+/, "").replace(/\s+$/, "");}function qa(t, e, n, i) {var r = e[1] - e[0],a = n[1] - n[0];if (0 === r) return 0 === a ? n[0] : (n[0] + n[1]) / 2;if (i) {if (r > 0) {if (t <= e[0]) return n[0];if (t >= e[1]) return n[1];} else {if (t >= e[0]) return n[0];if (t <= e[1]) return n[1];}} else {if (t === e[0]) return n[0];if (t === e[1]) return n[1];}return (t - e[0]) / r * a + n[0];}function ja(t, e) {switch (t) {case "center":case "middle":t = "50%";break;case "left":case "top":t = "0%";break;case "right":case "bottom":t = "100%";}return "string" == typeof t ? Ya(t).match(/%$/) ? parseFloat(t) / 100 * e : parseFloat(t) : null == t ? 0 / 0 : +t;}function Ua(t, e, n) {return null == e && (e = 10), e = Math.min(Math.max(0, e), 20), t = (+t).toFixed(e), n ? t : +t;}function $a(t) {return t.sort(function (t, e) {return t - e;}), t;}function Ka(t) {if (t = +t, isNaN(t)) return 0;for (var e = 1, n = 0; Math.round(t * e) / e !== t;) {e *= 10, n++;}return n;}function Qa(t) {var e = t.toString(),n = e.indexOf("e");if (n > 0) {var i = +e.slice(n + 1);return 0 > i ? -i : 0;}var r = e.indexOf(".");return 0 > r ? 0 : e.length - 1 - r;}function Ja(t, e) {var n = Math.log,i = Math.LN10,r = Math.floor(n(t[1] - t[0]) / i),a = Math.round(n(Math.abs(e[1] - e[0])) / i),o = Math.min(Math.max(-r + a, 0), 20);return isFinite(o) ? o : 20;}function to(t, e, n) {if (!t[e]) return 0;var i = g(t, function (t, e) {return t + (isNaN(e) ? 0 : e);}, 0);if (0 === i) return 0;for (var r = Math.pow(10, n), a = p(t, function (t) {return (isNaN(t) ? 0 : t) / i * r * 100;}), o = 100 * r, s = p(a, function (t) {return Math.floor(t);}), l = g(s, function (t, e) {return t + e;}, 0), u = p(a, function (t, e) {return t - s[e];}); o > l;) {for (var h = Number.NEGATIVE_INFINITY, c = null, d = 0, f = u.length; f > d; ++d) {u[d] > h && (h = u[d], c = d);}++s[c], u[c] = 0, ++l;}return s[e] / r;}function eo(t) {var e = 2 * Math.PI;return (t % e + e) % e;}function no(t) {return t > -ny && ny > t;}function io(t) {if (t instanceof Date) return t;if ("string" == typeof t) {var e = ry.exec(t);if (!e) return new Date(0 / 0);if (e[8]) {var n = +e[4] || 0;return "Z" !== e[8].toUpperCase() && (n -= e[8].slice(0, 3)), new Date(Date.UTC(+e[1], +(e[2] || 1) - 1, +e[3] || 1, n, +(e[5] || 0), +e[6] || 0, +e[7] || 0));}return new Date(+e[1], +(e[2] || 1) - 1, +e[3] || 1, +e[4] || 0, +(e[5] || 0), +e[6] || 0, +e[7] || 0);}return new Date(null == t ? 0 / 0 : Math.round(t));}function ro(t) {return Math.pow(10, ao(t));}function ao(t) {return Math.floor(Math.log(t) / Math.LN10);}function oo(t, e) {var n,i = ao(t),r = Math.pow(10, i),a = t / r;return n = e ? 1.5 > a ? 1 : 2.5 > a ? 2 : 4 > a ? 3 : 7 > a ? 5 : 10 : 1 > a ? 1 : 2 > a ? 2 : 3 > a ? 3 : 5 > a ? 5 : 10, t = n * r, i >= -20 ? +t.toFixed(0 > i ? -i : 0) : t;}function so(t, e) {var n = (t.length - 1) * e + 1,i = Math.floor(n),r = +t[i - 1],a = n - i;return a ? r + a * (t[i] - r) : r;}function lo(t) {function e(t, n, i) {return t.interval[i] < n.interval[i] || t.interval[i] === n.interval[i] && (t.close[i] - n.close[i] === (i ? -1 : 1) || !i && e(t, n, 1));}t.sort(function (t, n) {return e(t, n, 0) ? -1 : 1;});for (var n = -1 / 0, i = 1, r = 0; r < t.length;) {for (var a = t[r].interval, o = t[r].close, s = 0; 2 > s; s++) {a[s] <= n && (a[s] = n, o[s] = s ? 1 : 1 - i), n = a[s], i = o[s];}a[0] === a[1] && o[0] * o[1] !== 1 ? t.splice(r, 1) : r++;}return t;}function uo(t) {return t - parseFloat(t) >= 0;}function ho(t) {return isNaN(t) ? "-" : (t = (t + "").split("."), t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : ""));}function co(t, e) {return t = (t || "").toLowerCase().replace(/-(.)/g, function (t, e) {return e.toUpperCase();}), e && t && (t = t.charAt(0).toUpperCase() + t.slice(1)), t;}function fo(t) {return null == t ? "" : (t + "").replace(sy, function (t, e) {return ly[e];});}function po(t, e, n) {_(e) || (e = [e]);var i = e.length;if (!i) return "";for (var r = e[0].$vars || [], a = 0; a < r.length; a++) {var o = uy[a];t = t.replace(hy(o), hy(o, 0));}for (var s = 0; i > s; s++) {for (var l = 0; l < r.length; l++) {var u = e[s][r[l]];t = t.replace(hy(uy[l], s), n ? fo(u) : u);}}return t;}function go(t, e, n) {return f(e, function (e, i) {t = t.replace("{" + i + "}", n ? fo(e) : e);}), t;}function vo(t, e) {t = b(t) ? { color: t, extraCssText: e } : t || {};var n = t.color,i = t.type,e = t.extraCssText,r = t.renderMode || "html",a = t.markerId || "X";return n ? "html" === r ? "subItem" === i ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:' + fo(n) + ";" + (e || "") + '"></span>' : '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + fo(n) + ";" + (e || "") + '"></span>' : { renderMode: r, content: "{marker" + a + "|}  ", style: { color: n } } : "";
  }function mo(t, e) {return t += "", "0000".substr(0, e - t.length) + t;}function yo(t, e, n) {("week" === t || "month" === t || "quarter" === t || "half-year" === t || "year" === t) && (t = "MM-dd\nyyyy");var i = io(e),r = n ? "UTC" : "",a = i["get" + r + "FullYear"](),o = i["get" + r + "Month"]() + 1,s = i["get" + r + "Date"](),l = i["get" + r + "Hours"](),u = i["get" + r + "Minutes"](),h = i["get" + r + "Seconds"](),c = i["get" + r + "Milliseconds"]();return t = t.replace("MM", mo(o, 2)).replace("M", o).replace("yyyy", a).replace("yy", a % 100).replace("dd", mo(s, 2)).replace("d", s).replace("hh", mo(l, 2)).replace("h", l).replace("mm", mo(u, 2)).replace("m", u).replace("ss", mo(h, 2)).replace("s", h).replace("SSS", mo(c, 3));}function xo(t) {return t ? t.charAt(0).toUpperCase() + t.substr(1) : t;}function _o(t, e, n, i, r) {var a = 0,o = 0;null == i && (i = 1 / 0), null == r && (r = 1 / 0);var s = 0;e.eachChild(function (l, u) {var h,c,d = l.position,f = l.getBoundingRect(),p = e.childAt(u + 1),g = p && p.getBoundingRect();if ("horizontal" === t) {var v = f.width + (g ? -g.x + f.x : 0);h = a + v, h > i || l.newline ? (a = 0, h = v, o += s + n, s = f.height) : s = Math.max(s, f.height);} else {var m = f.height + (g ? -g.y + f.y : 0);c = o + m, c > r || l.newline ? (a += s + n, o = 0, c = m, s = f.width) : s = Math.max(s, f.width);}l.newline || (d[0] = a, d[1] = o, "horizontal" === t ? a = h + n : o = c + n);});}function wo(t, e, n) {n = oy(n || 0);var i = e.width,r = e.height,a = ja(t.left, i),o = ja(t.top, r),s = ja(t.right, i),l = ja(t.bottom, r),u = ja(t.width, i),h = ja(t.height, r),c = n[2] + n[0],d = n[1] + n[3],f = t.aspect;switch (isNaN(u) && (u = i - s - d - a), isNaN(h) && (h = r - l - c - o), null != f && (isNaN(u) && isNaN(h) && (f > i / r ? u = .8 * i : h = .8 * r), isNaN(u) && (u = f * h), isNaN(h) && (h = u / f)), isNaN(a) && (a = i - s - u - d), isNaN(o) && (o = r - l - h - c), t.left || t.right) {case "center":a = i / 2 - u / 2 - n[3];break;case "right":a = i - u - d;}switch (t.top || t.bottom) {case "middle":case "center":o = r / 2 - h / 2 - n[0];break;case "bottom":o = r - h - c;}a = a || 0, o = o || 0, isNaN(u) && (u = i - d - a - (s || 0)), isNaN(h) && (h = r - c - o - (l || 0));var p = new vn(a + n[3], o + n[0], u, h);return p.margin = n, p;}function bo(t, e, n) {function i(n, i) {var o = {},l = 0,u = {},h = 0,c = 2;if (py(n, function (e) {u[e] = t[e];}), py(n, function (t) {r(e, t) && (o[t] = u[t] = e[t]), a(o, t) && l++, a(u, t) && h++;}), s[i]) return a(e, n[1]) ? u[n[2]] = null : a(e, n[2]) && (u[n[1]] = null), u;if (h !== c && l) {if (l >= c) return o;for (var d = 0; d < n.length; d++) {var f = n[d];if (!r(o, f) && r(t, f)) {o[f] = t[f];break;}}return o;}return u;}function r(t, e) {return t.hasOwnProperty(e);}function a(t, e) {return null != t[e] && "auto" !== t[e];}function o(t, e, n) {py(t, function (t) {e[t] = n[t];});}!M(n) && (n = {});var s = n.ignoreSize;!_(s) && (s = [s, s]);var l = i(vy[0], 0),u = i(vy[1], 1);o(vy[0], t, l), o(vy[1], t, u);}function Mo(t) {return So({}, t);}function So(t, e) {return e && t && py(gy, function (n) {e.hasOwnProperty(n) && (t[n] = e[n]);}), t;}function Io(t) {var e = [];return f(_y.getClassesByMainType(t), function (t) {e = e.concat(t.prototype.dependencies || []);}), e = p(e, function (t) {return Qi(t).main;}), "dataset" !== t && u(e, "dataset") <= 0 && e.unshift("dataset"), e;}function To(t, e) {for (var n = t.length, i = 0; n > i; i++) {if (t[i].length > e) return t[i];}return t[n - 1];}function Ao(t) {var e = t.get("coordinateSystem"),n = { coordSysName: e, coordSysDims: [], axisMap: N(), categoryAxisMap: N() },i = Iy[e];return i ? (i(t, n, n.axisMap, n.categoryAxisMap), n) : void 0;}function Co(t) {return "category" === t.get("type");}function Do(t) {this.fromDataset = t.fromDataset, this.data = t.data || (t.sourceFormat === Dy ? {} : []), this.sourceFormat = t.sourceFormat || ky, this.seriesLayoutBy = t.seriesLayoutBy || Ly, this.dimensionsDefine = t.dimensionsDefine, this.encodeDefine = t.encodeDefine && N(t.encodeDefine), this.startIndex = t.startIndex || 0, this.dimensionsDetectCount = t.dimensionsDetectCount;}function ko(t) {var e = t.option.source,n = ky;if (I(e)) n = Py;else if (_(e)) {0 === e.length && (n = Ay);for (var i = 0, r = e.length; r > i; i++) {var a = e[i];if (null != a) {if (_(a)) {n = Ay;break;}if (M(a)) {n = Cy;break;}}}} else if (M(e)) {for (var o in e) {if (e.hasOwnProperty(o) && d(e[o])) {n = Dy;break;}}} else if (null != e) throw new Error("Invalid data");zy(t).sourceFormat = n;}function Po(t) {return zy(t).source;}function Lo(t) {zy(t).datasetMap = N();}function Oo(t) {var e = t.option,n = e.data,i = I(n) ? Py : Ty,r = !1,a = e.seriesLayoutBy,o = e.sourceHeader,s = e.dimensions,l = Fo(t);if (l) {var u = l.option;n = u.source, i = zy(l).sourceFormat, r = !0, a = a || u.seriesLayoutBy, null == o && (o = u.sourceHeader), s = s || u.dimensions;}var h = zo(n, i, a, o, s),c = e.encode;!c && l && (c = No(t, l, n, i, a, h)), zy(t).source = new Do({ data: n, fromDataset: r, seriesLayoutBy: a, sourceFormat: i, dimensionsDefine: h.dimensionsDefine, startIndex: h.startIndex, dimensionsDetectCount: h.dimensionsDetectCount, encodeDefine: c });}function zo(t, e, n, i, r) {if (!t) return { dimensionsDefine: Eo(r) };var a, o, s;if (e === Ay) "auto" === i || null == i ? Bo(function (t) {null != t && "-" !== t && (b(t) ? null == o && (o = 1) : o = 0);}, n, t, 10) : o = i ? 1 : 0, r || 1 !== o || (r = [], Bo(function (t, e) {r[e] = null != t ? t : "";}, n, t)), a = r ? r.length : n === Oy ? t.length : t[0] ? t[0].length : null;else if (e === Cy) r || (r = Ro(t), s = !0);else if (e === Dy) r || (r = [], s = !0, f(t, function (t, e) {r.push(e);}));else if (e === Ty) {var l = Fi(t[0]);a = _(l) && l.length || 1;}var u;return s && f(r, function (t, e) {"name" === (M(t) ? t.name : t) && (u = e);}), { startIndex: o, dimensionsDefine: Eo(r), dimensionsDetectCount: a, potentialNameDimIndex: u };}function Eo(t) {if (t) {var e = N();return p(t, function (t) {if (t = o({}, M(t) ? t : { name: t }), null == t.name) return t;t.name += "", null == t.displayName && (t.displayName = t.name);var n = e.get(t.name);return n ? t.name += "-" + n.count++ : e.set(t.name, { count: 1 }), t;});}}function Bo(t, e, n, i) {if (null == i && (i = 1 / 0), e === Oy) for (var r = 0; r < n.length && i > r; r++) {t(n[r] ? n[r][0] : null, r);} else for (var a = n[0] || [], r = 0; r < a.length && i > r; r++) {t(a[r], r);}}function Ro(t) {for (var e, n = 0; n < t.length && !(e = t[n++]);) {;}if (e) {var i = [];return f(e, function (t, e) {i.push(e);}), i;}}function No(t, e, n, i, r, a) {var o = Ao(t),s = {},l = [],u = [],h = t.subType,c = N(["pie", "map", "funnel"]),d = N(["line", "bar", "pictorialBar", "scatter", "effectScatter", "candlestick", "boxplot"]);if (o && null != d.get(h)) {var p = t.ecModel,g = zy(p).datasetMap,v = e.uid + "_" + r,m = g.get(v) || g.set(v, { categoryWayDim: 1, valueWayDim: 0 });f(o.coordSysDims, function (t) {if (null == o.firstCategoryDimIndex) {var e = m.valueWayDim++;s[t] = e, u.push(e);} else if (o.categoryAxisMap.get(t)) s[t] = 0, l.push(0);else {var e = m.categoryWayDim++;s[t] = e, u.push(e);}});} else if (null != c.get(h)) {for (var y, x = 0; 5 > x && null == y; x++) {Wo(n, i, r, a.dimensionsDefine, a.startIndex, x) || (y = x);}if (null != y) {s.value = y;var _ = a.potentialNameDimIndex || Math.max(y - 1, 0);u.push(_), l.push(_);}}return l.length && (s.itemName = l), u.length && (s.seriesName = u), s;}function Fo(t) {var e = t.option,n = e.data;return n ? void 0 : t.ecModel.getComponent("dataset", e.datasetIndex || 0);}function Vo(t, e) {return Wo(t.data, t.sourceFormat, t.seriesLayoutBy, t.dimensionsDefine, t.startIndex, e);}function Wo(t, e, n, i, r, a) {function o(t) {return null != t && isFinite(t) && "" !== t ? !1 : b(t) && "-" !== t ? !0 : void 0;}var s,l = 5;if (I(t)) return !1;var u;if (i && (u = i[a], u = M(u) ? u.name : u), e === Ay) {if (n === Oy) {for (var h = t[a], c = 0; c < (h || []).length && l > c; c++) {if (null != (s = o(h[r + c]))) return s;}} else for (var c = 0; c < t.length && l > c; c++) {var d = t[r + c];if (d && null != (s = o(d[a]))) return s;}} else if (e === Cy) {if (!u) return;for (var c = 0; c < t.length && l > c; c++) {var f = t[c];if (f && null != (s = o(f[u]))) return s;}} else if (e === Dy) {if (!u) return;var h = t[u];if (!h || I(h)) return !1;for (var c = 0; c < h.length && l > c; c++) {if (null != (s = o(h[c]))) return s;}} else if (e === Ty) for (var c = 0; c < t.length && l > c; c++) {var f = t[c],p = Fi(f);if (!_(p)) return !1;if (null != (s = o(p[a]))) return s;}return !1;}function Go(t, e) {if (e) {var n = e.seiresIndex,i = e.seriesId,r = e.seriesName;return null != n && t.componentIndex !== n || null != i && t.id !== i || null != r && t.name !== r;}}function Ho(t, e) {var n = t.color && !t.colorLayer;f(e, function (e, a) {"colorLayer" === a && n || _y.hasClass(a) || ("object" == typeof e ? t[a] = t[a] ? r(t[a], e, !1) : i(e) : null == t[a] && (t[a] = e));});}function Zo(t) {t = t, this.option = {}, this.option[Ey] = 1, this._componentsMap = N({ series: [] }), this._seriesIndices, this._seriesIndicesMap, Ho(t, this._theme.option), r(t, by, !1), this.mergeOption(t);}function Xo(t, e) {_(e) || (e = e ? [e] : []);var n = {};return f(e, function (e) {n[e] = (t.get(e) || []).slice();}), n;}function Yo(t, e, n) {var i = e.type ? e.type : n ? n.subType : _y.determineSubType(t, e);return i;}function qo(t, e) {t._seriesIndicesMap = N(t._seriesIndices = p(e, function (t) {return t.componentIndex;}) || []);}function jo(t, e) {return e.hasOwnProperty("subType") ? v(t, function (t) {return t.subType === e.subType;}) : t;}function Uo(t) {f(Ry, function (e) {this[e] = y(t[e], t);}, this);}function $o() {this._coordinateSystems = [];}function Ko(t) {this._api = t, this._timelineOptions = [], this._mediaList = [], this._mediaDefault, this._currentMediaIndices = [], this._optionBackup, this._newBaseOption;}function Qo(t, e, n) {var i,r,a = [],o = [],s = t.timeline;if (t.baseOption && (r = t.baseOption), (s || t.options) && (r = r || {}, a = (t.options || []).slice()), t.media) {r = r || {};var l = t.media;Fy(l, function (t) {t && t.option && (t.query ? o.push(t) : i || (i = t));});}return r || (r = t), r.timeline || (r.timeline = s), Fy([r].concat(a).concat(p(o, function (t) {return t.option;})), function (t) {Fy(e, function (e) {e(t, n);});}), { baseOption: r, timelineOptions: a, mediaDefault: i, mediaList: o };}function Jo(t, e, n) {var i = { width: e, height: n, aspectratio: e / n },r = !0;return f(t, function (t, e) {var n = e.match(Hy);if (n && n[1] && n[2]) {var a = n[1],o = n[2].toLowerCase();ts(i[o], t, a) || (r = !1);}}), r;}function ts(t, e, n) {return "min" === n ? t >= e : "max" === n ? e >= t : t === e;}function es(t, e) {return t.join(",") === e.join(",");}function ns(t, e) {e = e || {}, Fy(e, function (e, n) {if (null != e) {var i = t[n];if (_y.hasClass(n)) {e = Ri(e), i = Ri(i);var r = Wi(i, e);t[n] = Wy(r, function (t) {return t.option && t.exist ? Gy(t.exist, t.option, !0) : t.exist || t.option;});} else t[n] = Gy(i, e, !0);}});}function is(t) {var e = t && t.itemStyle;if (e) for (var n = 0, i = Yy.length; i > n; n++) {var a = Yy[n],o = e.normal,s = e.emphasis;o && o[a] && (t[a] = t[a] || {}, t[a].normal ? r(t[a].normal, o[a]) : t[a].normal = o[a], o[a] = null), s && s[a] && (t[a] = t[a] || {}, t[a].emphasis ? r(t[a].emphasis, s[a]) : t[a].emphasis = s[a], s[a] = null);}}function rs(t, e, n) {if (t && t[e] && (t[e].normal || t[e].emphasis)) {var i = t[e].normal,r = t[e].emphasis;i && (n ? (t[e].normal = t[e].emphasis = null, s(t[e], i)) : t[e] = i), r && (t.emphasis = t.emphasis || {}, t.emphasis[e] = r);}}function as(t) {rs(t, "itemStyle"), rs(t, "lineStyle"), rs(t, "areaStyle"), rs(t, "label"), rs(t, "labelLine"), rs(t, "upperLabel"), rs(t, "edgeLabel");}function os(t, e) {var n = Xy(t) && t[e],i = Xy(n) && n.textStyle;if (i) for (var r = 0, a = uv.length; a > r; r++) {var e = uv[r];i.hasOwnProperty(e) && (n[e] = i[e]);}}function ss(t) {t && (as(t), os(t, "label"), t.emphasis && os(t.emphasis, "label"));}function ls(t) {if (Xy(t)) {is(t), as(t), os(t, "label"), os(t, "upperLabel"), os(t, "edgeLabel"), t.emphasis && (os(t.emphasis, "label"), os(t.emphasis, "upperLabel"), os(t.emphasis, "edgeLabel"));var e = t.markPoint;e && (is(e), ss(e));var n = t.markLine;n && (is(n), ss(n));var i = t.markArea;i && ss(i);var r = t.data;if ("graph" === t.type) {r = r || t.nodes;var a = t.links || t.edges;if (a && !I(a)) for (var o = 0; o < a.length; o++) {ss(a[o]);}f(t.categories, function (t) {as(t);});}if (r && !I(r)) for (var o = 0; o < r.length; o++) {ss(r[o]);}var e = t.markPoint;if (e && e.data) for (var s = e.data, o = 0; o < s.length; o++) {ss(s[o]);}var n = t.markLine;if (n && n.data) for (var l = n.data, o = 0; o < l.length; o++) {_(l[o]) ? (ss(l[o][0]), ss(l[o][1])) : ss(l[o]);}"gauge" === t.type ? (os(t, "axisLabel"), os(t, "title"), os(t, "detail")) : "treemap" === t.type ? (rs(t.breadcrumb, "itemStyle"), f(t.levels, function (t) {as(t);})) : "tree" === t.type && as(t.leaves);}}function us(t) {return _(t) ? t : t ? [t] : [];}function hs(t) {return (_(t) ? t[0] : t) || {};}function cs(t, e) {e = e.split(",");for (var n = t, i = 0; i < e.length && (n = n && n[e[i]], null != n); i++) {;}return n;}function ds(t, e, n, i) {e = e.split(",");for (var r, a = t, o = 0; o < e.length - 1; o++) {r = e[o], null == a[r] && (a[r] = {}), a = a[r];}(i || null == a[e[o]]) && (a[e[o]] = n);}function fs(t) {f(jy, function (e) {e[0] in t && !(e[1] in t) && (t[e[1]] = t[e[0]]);});}function ps(t) {f(t, function (e, n) {var i = [],r = [0 / 0, 0 / 0],a = [e.stackResultDimension, e.stackedOverDimension],o = e.data,s = e.isStackedByIndex,l = o.map(a, function (a, l, u) {var h = o.get(e.stackedDimension, u);if (isNaN(h)) return r;var c, d;s ? d = o.getRawIndex(u) : c = o.get(e.stackedByDimension, u);for (var f = 0 / 0, p = n - 1; p >= 0; p--) {var g = t[p];if (s || (d = g.data.rawIndexOf(g.stackedByDimension, c)), d >= 0) {var v = g.data.getByRawIndex(g.stackResultDimension, d);if (h >= 0 && v > 0 || 0 >= h && 0 > v) {h += v, f = v;break;}}}return i[0] = h, i[1] = f, i;});o.hostModel.setData(l), e.data = l;});}function gs(t, e) {Do.isInstance(t) || (t = Do.seriesDataToSource(t)), this._source = t;var n = this._data = t.data,i = t.sourceFormat;i === Py && (this._offset = 0, this._dimSize = e, this._data = n);var r = Jy[i === Ay ? i + "_" + t.seriesLayoutBy : i];o(this, r);}function vs() {return this._data.length;}function ms(t) {return this._data[t];}function ys(t) {for (var e = 0; e < t.length; e++) {this._data.push(t[e]);}}function xs(t, e, n) {return null != n ? t[n] : t;}function _s(t, e, n, i) {return ws(t[i], this._dimensionInfos[e]);}function ws(t, e) {var n = e && e.type;if ("ordinal" === n) {var i = e && e.ordinalMeta;return i ? i.parseAndCollect(t) : t;}return "time" === n && "number" != typeof t && null != t && "-" !== t && (t = +io(t)), null == t || "" === t ? 0 / 0 : +t;}function bs(t, e, n) {if (t) {var i = t.getRawDataItem(e);if (null != i) {var r,a,o = t.getProvider().getSource().sourceFormat,s = t.getDimensionInfo(n);return s && (r = s.name, a = s.index), tx[o](i, e, a, r);}}}function Ms(t, e, n) {if (t) {var i = t.getProvider().getSource().sourceFormat;if (i === Ty || i === Cy) {var r = t.getRawDataItem(e);return i !== Ty || M(r) || (r = null), r ? r[n] : void 0;}}}function Ss(t) {return new Is(t);}function Is(t) {t = t || {}, this._reset = t.reset, this._plan = t.plan, this._count = t.count, this._onDirty = t.onDirty, this._dirty = !0, this.context;}function Ts(t, e, n, i, r, a) {ax.reset(n, i, r, a), t._callingProgress = e, t._callingProgress({ start: n, end: i, count: i - n, next: ax.next }, t.context);}function As(t, e) {t._dueIndex = t._outputDueEnd = t._dueEnd = 0, t._settedOutputEnd = null;var n, i;!e && t._reset && (n = t._reset(t.context), n && n.progress && (i = n.forceFirstProgress, n = n.progress), _(n) && !n.length && (n = null)), t._progress = n, t._modBy = t._modDataCount = null;var r = t._downstream;return r && r.dirty(), i;}function Cs(t) {var e = t.name;Hi(t) || (t.name = Ds(t) || e);}function Ds(t) {var e = t.getRawData(),n = e.mapDimension("seriesName", !0),i = [];return f(n, function (t) {var n = e.getDimensionInfo(t);n.displayName && i.push(n.displayName);}), i.join(" ");}function ks(t) {return t.model.getRawData().count();}function Ps(t) {var e = t.model;return e.setData(e.getRawData().cloneShallow()), Ls;}function Ls(t, e) {t.end > e.outputData.count() && e.model.getRawData().cloneShallow(e.outputData);}function Os(t, e) {f(t.CHANGABLE_METHODS, function (n) {t.wrapMethod(n, x(zs, e));});}function zs(t) {var e = Es(t);e && e.setOutputEnd(this.count());}function Es(t) {var e = (t.ecModel || {}).scheduler,n = e && e.getPipeline(t.uid);if (n) {var i = n.currentTask;if (i) {var r = i.agentStubMap;r && (i = r.get(t.uid));}return i;}}function Bs() {this.group = new hg(), this.uid = Ha("viewChart"), this.renderTask = Ss({ plan: Fs, reset: Vs }), this.renderTask.context = { view: this };}function Rs(t, e) {if (t && (t.trigger(e), "group" === t.type)) for (var n = 0; n < t.childCount(); n++) {Rs(t.childAt(n), e);}}function Ns(t, e, n) {var i = Xi(t, e);null != i ? f(Ri(i), function (e) {Rs(t.getItemGraphicEl(e), n);}) : t.eachItemGraphicEl(function (t) {Rs(t, n);});}function Fs(t) {return dx(t.model);}function Vs(t) {var e = t.model,n = t.ecModel,i = t.api,r = t.payload,a = e.pipelineContext.progressiveRender,o = t.view,s = r && cx(r).updateMethod,l = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";return "render" !== l && o[l](e, n, i, r), px[l];}function Ws(t, e, n) {function i() {h = new Date().getTime(), c = null, t.apply(o, s || []);}var r,a,o,s,l,u = 0,h = 0,c = null;e = e || 0;var d = function d() {r = new Date().getTime(), o = this, s = arguments;var t = l || e,d = l || n;l = null, a = r - (d ? u : h) - t, clearTimeout(c), d ? c = setTimeout(i, t) : a >= 0 ? i() : c = setTimeout(i, -a), u = r;};return d.clear = function () {c && (clearTimeout(c), c = null);}, d.debounceNextCall = function (t) {l = t;}, d;}function Gs(t, e, n, i) {var r = t[e];if (r) {var a = r[gx] || r,o = r[mx],s = r[vx];if (s !== n || o !== i) {if (null == n || !i) return t[e] = a;r = t[e] = Ws(a, n, "debounce" === i), r[gx] = a, r[mx] = i, r[vx] = n;}return r;}}function Hs(t, e) {var n = t[e];n && n[gx] && (t[e] = n[gx]);}function Zs(t, e, n, i) {this.ecInstance = t, this.api = e, this.unfinished;var n = this._dataProcessorHandlers = n.slice(),i = this._visualHandlers = i.slice();this._allHandlers = n.concat(i), this._stageTaskMap = N();}function Xs(t, e, n, i, r) {function a(t, e) {return t.setDirty && (!t.dirtyMap || t.dirtyMap.get(e.__pipeline.id));}r = r || {};var o;f(e, function (e) {if (!r.visualType || r.visualType === e.visualType) {var s = t._stageTaskMap.get(e.uid),l = s.seriesTaskMap,u = s.overallTask;if (u) {var h,c = u.agentStubMap;c.each(function (t) {a(r, t) && (t.dirty(), h = !0);}), h && u.dirty(), Ix(u, i);var d = t.getPerformArgs(u, r.block);c.each(function (t) {t.perform(d);}), o |= u.perform(d);} else l && l.each(function (s) {a(r, s) && s.dirty();var l = t.getPerformArgs(s, r.block);l.skip = !e.performRawSeries && n.isSeriesFiltered(s.context.model), Ix(s, i), o |= s.perform(l);});}}), t.unfinished |= o;}function Ys(t, e, n, i, r) {function a(n) {var a = n.uid,s = o.get(a) || o.set(a, Ss({ plan: Qs, reset: Js, count: el }));s.context = { model: n, ecModel: i, api: r, useClearVisual: e.isVisual && !e.isLayout, plan: e.plan, reset: e.reset, scheduler: t }, nl(t, n, s);}var o = n.seriesTaskMap || (n.seriesTaskMap = N()),s = e.seriesType,l = e.getTargetSeries;e.createOnAllSeries ? i.eachRawSeries(a) : s ? i.eachRawSeriesByType(s, a) : l && l(i, r).each(a);var u = t._pipelineMap;o.each(function (t, e) {u.get(e) || (t.dispose(), o.removeKey(e));});}function qs(t, e, n, i, r) {function a(e) {var n = e.uid,i = s.get(n);i || (i = s.set(n, Ss({ reset: Us, onDirty: Ks })), o.dirty()), i.context = { model: e, overallProgress: h, modifyOutputEnd: c }, i.agent = o, i.__block = h, nl(t, e, i);}var o = n.overallTask = n.overallTask || Ss({ reset: js });o.context = { ecModel: i, api: r, overallReset: e.overallReset, scheduler: t };var s = o.agentStubMap = o.agentStubMap || N(),l = e.seriesType,u = e.getTargetSeries,h = !0,c = e.modifyOutputEnd;l ? i.eachRawSeriesByType(l, a) : u ? u(i, r).each(a) : (h = !1, f(i.getSeries(), a));var d = t._pipelineMap;s.each(function (t, e) {d.get(e) || (t.dispose(), o.dirty(), s.removeKey(e));});}function js(t) {t.overallReset(t.ecModel, t.api, t.payload);}function Us(t) {return t.overallProgress && $s;}function $s() {this.agent.dirty(), this.getDownstream().dirty();}function Ks() {this.agent && this.agent.dirty();}function Qs(t) {return t.plan && t.plan(t.model, t.ecModel, t.api, t.payload);}function Js(t) {t.useClearVisual && t.data.clearAllVisual();var e = t.resetDefines = Ri(t.reset(t.model, t.ecModel, t.api, t.payload));return e.length > 1 ? p(e, function (t, e) {return tl(e);}) : Tx;}function tl(t) {return function (e, n) {var i = n.data,r = n.resetDefines[t];if (r && r.dataEach) for (var a = e.start; a < e.end; a++) {r.dataEach(i, a);} else r && r.progress && r.progress(e, i);};}function el(t) {return t.data.count();}function nl(t, e, n) {var i = e.uid,r = t._pipelineMap.get(i);!r.head && (r.head = n), r.tail && r.tail.pipe(n), r.tail = n, n.__idxInPipeline = r.count++, n.__pipeline = r;}function il(t) {Ax = null;try {t(Cx, Dx);} catch (e) {}return Ax;}function rl(t, e) {for (var n in e.prototype) {t[n] = V;}}function al(t) {if (b(t)) {var e = new DOMParser();t = e.parseFromString(t, "text/xml");}for (9 === t.nodeType && (t = t.firstChild); "svg" !== t.nodeName.toLowerCase() || 1 !== t.nodeType;) {t = t.nextSibling;}return t;}function ol() {this._defs = {}, this._root = null, this._isDefine = !1, this._isText = !1;}function sl(t, e) {for (var n = t.firstChild; n;) {if (1 === n.nodeType) {var i = n.getAttribute("offset");i = i.indexOf("%") > 0 ? parseInt(i, 10) / 100 : i ? parseFloat(i) : 0;var r = n.getAttribute("stop-color") || "#000000";e.addColorStop(i, r);}n = n.nextSibling;}}function ll(t, e) {t && t.__inheritedStyle && (e.__inheritedStyle || (e.__inheritedStyle = {}), s(e.__inheritedStyle, t.__inheritedStyle));}function ul(t) {for (var e = z(t).split(Rx), n = [], i = 0; i < e.length; i += 2) {var r = parseFloat(e[i]),a = parseFloat(e[i + 1]);n.push([r, a]);}return n;}function hl(t, e, n, i) {var r = e.__inheritedStyle || {},a = "text" === e.type;if (1 === t.nodeType && (dl(t, e), o(r, fl(t)), !i)) for (var s in Vx) {if (Vx.hasOwnProperty(s)) {var l = t.getAttribute(s);null != l && (r[Vx[s]] = l);}}var u = a ? "textFill" : "fill",h = a ? "textStroke" : "stroke";e.style = e.style || new mg();var c = e.style;null != r.fill && c.set(u, cl(r.fill, n)), null != r.stroke && c.set(h, cl(r.stroke, n)), f(["lineWidth", "opacity", "fillOpacity", "strokeOpacity", "miterLimit", "fontSize"], function (t) {var e = "lineWidth" === t && a ? "textStrokeWidth" : t;null != r[t] && c.set(e, parseFloat(r[t]));}), r.textBaseline && "auto" !== r.textBaseline || (r.textBaseline = "alphabetic"), "alphabetic" === r.textBaseline && (r.textBaseline = "bottom"), "start" === r.textAlign && (r.textAlign = "left"), "end" === r.textAlign && (r.textAlign = "right"), f(["lineDashOffset", "lineCap", "lineJoin", "fontWeight", "fontFamily", "fontStyle", "textAlign", "textBaseline"], function (t) {null != r[t] && c.set(t, r[t]);}), r.lineDash && (e.style.lineDash = z(r.lineDash).split(Rx)), c[h] && "none" !== c[h] && (e[h] = !0), e.__inheritedStyle = r;}function cl(t, e) {var n = e && t && t.match(Wx);if (n) {var i = z(n[1]),r = e[i];return r;}return t;}function dl(t, e) {var n = t.getAttribute("transform");if (n) {n = n.replace(/,/g, " ");var i = null,r = [];n.replace(Gx, function (t, e, n) {r.push(e, n);});for (var a = r.length - 1; a > 0; a -= 2) {var o = r[a],s = r[a - 1];switch (i = i || be(), s) {case "translate":o = z(o).split(Rx), Te(i, i, [parseFloat(o[0]), parseFloat(o[1] || 0)]);break;case "scale":o = z(o).split(Rx), Ce(i, i, [parseFloat(o[0]), parseFloat(o[1] || o[0])]);break;case "rotate":o = z(o).split(Rx), Ae(i, i, parseFloat(o[0]));break;case "skew":o = z(o).split(Rx), console.warn("Skew transform is not supported yet");break;case "matrix":var o = z(o).split(Rx);i[0] = parseFloat(o[0]), i[1] = parseFloat(o[1]), i[2] = parseFloat(o[2]), i[3] = parseFloat(o[3]), i[4] = parseFloat(o[4]), i[5] = parseFloat(o[5]);}}}e.setLocalTransform(i);}function fl(t) {var e = t.getAttribute("style"),n = {};if (!e) return n;var i = {};Hx.lastIndex = 0;for (var r; null != (r = Hx.exec(e));) {i[r[1]] = r[2];}for (var a in Vx) {Vx.hasOwnProperty(a) && null != i[a] && (n[Vx[a]] = i[a]);}return n;}function pl(t, e, n) {var i = e / t.width,r = n / t.height,a = Math.min(i, r),o = [a, a],s = [-(t.x + t.width / 2) * a + e / 2, -(t.y + t.height / 2) * a + n / 2];return { scale: o, position: s };}function gl(t) {return function (e, n, i) {e = e && e.toLowerCase(), Sp.prototype[t].call(this, e, n, i);};}function vl() {Sp.call(this);}function ml(t, e, n) {function r(t, e) {return t.__prio - e.__prio;}n = n || {}, "string" == typeof e && (e = w_[e]), this.id, this.group, this._dom = t;var a = "canvas",o = this._zr = Li(t, { renderer: n.renderer || a, devicePixelRatio: n.devicePixelRatio, width: n.width, height: n.height });this._throttledZrFlush = Ws(y(o.flush, o), 17);var e = i(e);e && $y(e, !0), this._theme = e, this._chartsViews = [], this._chartsMap = {}, this._componentsViews = [], this._componentsMap = {}, this._coordSysMgr = new $o();var s = this._api = El(this);Sn(__, r), Sn(m_, r), this._scheduler = new Zs(this, s, m_, __), Sp.call(this, this._ecEventProcessor = new Bl()), this._messageCenter = new vl(), this._initEvents(), this.resize = y(this.resize, this), this._pendingActions = [], o.animation.on("frame", this._onframe, this), Il(o, this), E(this);}function yl(t, e, n) {var i,r = this._model,a = this._coordSysMgr.getCoordinateSystems();e = qi(r, e);for (var o = 0; o < a.length; o++) {var s = a[o];if (s[t] && null != (i = s[t](r, e, n))) return i;}}function xl(t) {var e = t._model,n = t._scheduler;n.restorePipelines(e), n.prepareStageTasks(), Tl(t, "component", e, n), Tl(t, "chart", e, n), n.plan();}function _l(t, e, n, i, r) {function a(i) {i && i.__alive && i[e] && i[e](i.__model, o, t._api, n);}var o = t._model;if (!i) return void jx(t._componentsViews.concat(t._chartsViews), a);var s = {};s[i + "Id"] = n[i + "Id"], s[i + "Index"] = n[i + "Index"], s[i + "Name"] = n[i + "Name"];var l = { mainType: i, query: s };r && (l.subType = r);var u = n.excludeSeriesId;null != u && (u = N(Ri(u))), o && o.eachComponent(l, function (e) {u && null != u.get(e.id) || a(t["series" === i ? "_chartsMap" : "_componentsMap"][e.__viewId]);}, t);}function wl(t, e) {var n = t._chartsMap,i = t._scheduler;e.eachSeries(function (t) {i.updateStreamModes(t, n[t.__viewId]);});}function bl(t, e) {var n = t.type,i = t.escapeConnect,r = g_[n],a = r.actionInfo,l = (a.update || "update").split(":"),u = l.pop();l = null != l[0] && Kx(l[0]), this[u_] = !0;var h = [t],c = !1;t.batch && (c = !0, h = p(t.batch, function (e) {return e = s(o({}, e), t), e.batch = null, e;}));var d,f = [],g = "highlight" === n || "downplay" === n;jx(h, function (t) {d = r.action(t, this._model, this._api), d = d || o({}, t), d.type = a.event || d.type, f.push(d), g ? _l(this, u, t, "series") : l && _l(this, u, t, l.main, l.sub);}, this), "none" === u || g || l || (this[h_] ? (xl(this), f_.update.call(this, t), this[h_] = !1) : f_[u].call(this, t)), d = c ? { type: a.event || n, escapeConnect: i, batch: f } : f[0], this[u_] = !1, !e && this._messageCenter.trigger(d.type, d);}function Ml(t) {for (var e = this._pendingActions; e.length;) {var n = e.shift();bl.call(this, n, t);}}function Sl(t) {!t && this.trigger("updated");}function Il(t, e) {t.on("rendered", function () {e.trigger("rendered"), !t.animation.isFinished() || e[h_] || e._scheduler.unfinished || e._pendingActions.length || e.trigger("finished");});}function Tl(t, e, n, i) {function r(t) {var e = "_ec_" + t.id + "_" + t.type,r = s[e];if (!r) {var h = Kx(t.type),c = a ? lx.getClass(h.main, h.sub) : Bs.getClass(h.sub);r = new c(), r.init(n, u), s[e] = r, o.push(r), l.add(r.group);}t.__viewId = r.__id = e, r.__alive = !0, r.__model = t, r.group.__ecComponentInfo = { mainType: t.mainType, index: t.componentIndex }, !a && i.prepareView(r, t, n, u);}for (var a = "component" === e, o = a ? t._componentsViews : t._chartsViews, s = a ? t._componentsMap : t._chartsMap, l = t._zr, u = t._api, h = 0; h < o.length; h++) {o[h].__alive = !1;}a ? n.eachComponent(function (t, e) {"series" !== t && r(e);}) : n.eachSeries(r);for (var h = 0; h < o.length;) {var c = o[h];c.__alive ? h++ : (!a && c.renderTask.dispose(), l.remove(c.group), c.dispose(n, u), o.splice(h, 1), delete s[c.__id], c.__id = c.group.__ecComponentInfo = null);}}function Al(t) {t.clearColorPalette(), t.eachSeries(function (t) {t.clearColorPalette();});}function Cl(t, e, n, i) {Dl(t, e, n, i), jx(t._chartsViews, function (t) {t.__alive = !1;}), kl(t, e, n, i), jx(t._chartsViews, function (t) {t.__alive || t.remove(e, n);});}function Dl(t, e, n, i, r) {jx(r || t._componentsViews, function (t) {var r = t.__model;t.render(r, e, n, i), zl(r, t);});}function kl(t, e, n, i, r) {var a,o = t._scheduler;e.eachSeries(function (e) {var n = t._chartsMap[e.__viewId];n.__alive = !0;var s = n.renderTask;o.updatePayload(s, i), r && r.get(e.uid) && s.dirty(), a |= s.perform(o.getPerformArgs(s)), n.group.silent = !!e.get("silent"), zl(e, n), Ol(e, n);}), o.unfinished |= a, Ll(t._zr, e), _x(t._zr.dom, e);}function Pl(t, e) {jx(x_, function (n) {n(t, e);});}function Ll(t, e) {var n = t.storage,i = 0;n.traverse(function (t) {t.isGroup || i++;}), i > e.get("hoverLayerThreshold") && !np.node && n.traverse(function (t) {t.isGroup || (t.useHoverLayer = !0);});}function Ol(t, e) {var n = t.get("blendMode") || null;e.group.traverse(function (t) {t.isGroup || t.style.blend !== n && t.setStyle("blend", n), t.eachPendingDisplayable && t.eachPendingDisplayable(function (t) {t.setStyle("blend", n);});});}function zl(t, e) {var n = t.get("z"),i = t.get("zlevel");e.group.traverse(function (t) {"group" !== t.type && (null != n && (t.z = n), null != i && (t.zlevel = i));});}function El(t) {var e = t._coordSysMgr;return o(new Uo(t), { getCoordinateSystems: y(e.getCoordinateSystems, e), getComponentByElement: function getComponentByElement(e) {for (; e;) {var n = e.__ecComponentInfo;if (null != n) return t._model.getComponent(n.mainType, n.index);e = e.parent;}} });}function Bl() {this.eventInfo;}function Rl(t) {function e(t, e) {for (var n = 0; n < t.length; n++) {var i = t[n];i[a] = e;}}var n = 0,i = 1,r = 2,a = "__connectUpdateStatus";jx(v_, function (o, s) {t._messageCenter.on(s, function (o) {if (S_[t.group] && t[a] !== n) {if (o && o.escapeConnect) return;var s = t.makeActionFromEvent(o),l = [];jx(M_, function (e) {e !== t && e.group === t.group && l.push(e);}), e(l, n), jx(l, function (t) {t[a] !== i && t.dispatchAction(s);}), e(l, r);}});});}function Nl(t, e, n) {var i = Gl(t);if (i) return i;var r = new ml(t, e, n);return r.id = "ec_" + I_++, M_[r.id] = r, Ui(t, A_, r.id), Rl(r), r;}function Fl(t) {if (_(t)) {var e = t;t = null, jx(e, function (e) {null != e.group && (t = e.group);}), t = t || "g_" + T_++, jx(e, function (e) {e.group = t;});}return S_[t] = !0, t;}function Vl(t) {S_[t] = !1;}function Wl(t) {"string" == typeof t ? t = M_[t] : t instanceof ml || (t = Gl(t)), t instanceof ml && !t.isDisposed() && t.dispose();}function Gl(t) {return M_[$i(t, A_)];}function Hl(t) {return M_[t];}function Zl(t, e) {w_[t] = e;}function Xl(t) {y_.push(t);}function Yl(t, e) {Jl(m_, t, e, e_);}function ql(t) {x_.push(t);}function jl(t, e, n) {"function" == typeof e && (n = e, e = "");var i = $x(t) ? t.type : [t, t = { event: e }][0];t.event = (t.event || i).toLowerCase(), e = t.event, qx(c_.test(i) && c_.test(e)), g_[i] || (g_[i] = { action: n, actionInfo: t }), v_[e] = i;}function Ul(t, e) {$o.register(t, e);}function $l(t) {var e = $o.get(t);return e ? e.getDimensionsInfo ? e.getDimensionsInfo() : e.dimensions.slice() : void 0;}function Kl(t, e) {Jl(__, t, e, i_, "layout");}function Ql(t, e) {Jl(__, t, e, a_, "visual");}function Jl(t, e, n, i, r) {(Ux(e) || $x(e)) && (n = e, e = i);var a = Zs.wrapStageHandler(n, r);return a.__prio = e, a.__raw = n, t.push(a), a;}function tu(t, e) {b_[t] = e;}function eu(t) {return _y.extend(t);}function nu(t) {return lx.extend(t);}function iu(t) {return sx.extend(t);}function ru(t) {return Bs.extend(t);}function au(t) {n("createCanvas", t);}function ou(t, e, n) {Xx.registerMap(t, e, n);}function su(t) {var e = Xx.retrieveMap(t);return e && e[0] && { geoJson: e[0].geoJSON, specialAreas: e[0].specialAreas };}function lu(t) {return t;}function uu(t, e, n, i, r) {this._old = t, this._new = e, this._oldKeyGetter = n || lu, this._newKeyGetter = i || lu, this.context = r;}function hu(t, e, n, i, r) {for (var a = 0; a < t.length; a++) {var o = "_ec_" + r[i](t[a], a),s = e[o];null == s ? (n.push(o), e[o] = a) : (s.length || (e[o] = s = [s]), s.push(a));}}function cu(t) {var e = {},n = e.encode = {},i = N(),r = [],a = [];f(t.dimensions, function (e) {var o = t.getDimensionInfo(e),s = o.coordDim;if (s) {var l = n[s];n.hasOwnProperty(s) || (l = n[s] = []), l[o.coordDimIndex] = e, o.isExtraCoord || (i.set(s, 1), fu(o.type) && (r[0] = e)), o.defaultTooltip && a.push(e);}k_.each(function (t, e) {var i = n[e];n.hasOwnProperty(e) || (i = n[e] = []);var r = o.otherDims[e];null != r && r !== !1 && (i[r] = o.name);});});var o = [],s = {};i.each(function (t, e) {var i = n[e];s[e] = i[0], o = o.concat(i);}), e.dataDimsOnCoord = o, e.encodeFirstDimNotExtra = s;var l = n.label;l && l.length && (r = l.slice());var u = n.tooltip;return u && u.length ? a = u.slice() : a.length || (a = r.slice()), n.defaultedLabel = r, n.defaultedTooltip = a, e;}function du(t) {return "category" === t ? "ordinal" : "time" === t ? "time" : "float";}function fu(t) {return !("ordinal" === t || "time" === t);}function pu(t) {return t._rawCount > 65535 ? E_ : B_;}function gu(t) {var e = t.constructor;return e === Array ? t.slice() : new e(t);}function vu(t, e) {f(R_.concat(e.__wrappedMethods || []), function (n) {e.hasOwnProperty(n) && (t[n] = e[n]);}), t.__wrappedMethods = e.__wrappedMethods, f(N_, function (n) {t[n] = i(e[n]);}), t._calculationInfo = o(e._calculationInfo);}function mu(t) {var e = t._invertedIndicesMap;f(e, function (n, i) {var r = t._dimensionInfos[i],a = r.ordinalMeta;if (a) {n = e[i] = new E_(a.categories.length);for (var o = 0; o < n.length; o++) {n[o] = 0 / 0;}for (var o = 0; o < t._count; o++) {n[t.get(i, o)] = o;}}});}function yu(t, e, n) {var i;if (null != e) {var r = t._chunkSize,a = Math.floor(n / r),o = n % r,s = t.dimensions[e],l = t._storage[s][a];if (l) {i = l[o];var u = t._dimensionInfos[s].ordinalMeta;u && u.categories.length && (i = u.categories[i]);}}return i;}function xu(t) {return t;}function _u(t) {return t < this._count && t >= 0 ? this._indices[t] : -1;}function wu(t, e) {var n = t._idList[e];return null == n && (n = yu(t, t._idDimIdx, e)), null == n && (n = O_ + e), n;}function bu(t) {return _(t) || (t = [t]), t;}function Mu(t, e) {var n = t.dimensions,i = new F_(p(n, t.getDimensionInfo, t), t.hostModel);vu(i, t);for (var r = i._storage = {}, a = t._storage, o = 0; o < n.length; o++) {var s = n[o];a[s] && (u(e, s) >= 0 ? (r[s] = Su(a[s]), i._rawExtent[s] = Iu(), i._extent[s] = null) : r[s] = a[s]);}return i;}function Su(t) {for (var e = new Array(t.length), n = 0; n < t.length; n++) {e[n] = gu(t[n]);}return e;}function Iu() {return [1 / 0, -1 / 0];}function Tu(t, e, n) {function r(t, e, n) {null != k_.get(e) ? t.otherDims[e] = n : (t.coordDim = e, t.coordDimIndex = n, h.set(e, !0));}Do.isInstance(e) || (e = Do.seriesDataToSource(e)), n = n || {}, t = (t || []).slice();for (var a = (n.dimsDef || []).slice(), l = N(n.encodeDef), u = N(), h = N(), c = [], d = Au(e, t, a, n.dimCount), p = 0; d > p; p++) {var g = a[p] = o({}, M(a[p]) ? a[p] : { name: a[p] }),v = g.name,m = c[p] = { otherDims: {} };null != v && null == u.get(v) && (m.name = m.displayName = v, u.set(v, p)), null != g.type && (m.type = g.type), null != g.displayName && (m.displayName = g.displayName);}l.each(function (t, e) {if (t = Ri(t).slice(), 1 === t.length && t[0] < 0) return void l.set(e, !1);var n = l.set(e, []);f(t, function (t, i) {b(t) && (t = u.get(t)), null != t && d > t && (n[i] = t, r(c[t], e, i));});});var y = 0;f(t, function (t) {var e, t, n, a;if (b(t)) e = t, t = {};else {e = t.name;var o = t.ordinalMeta;t.ordinalMeta = null, t = i(t), t.ordinalMeta = o, n = t.dimsDef, a = t.otherDims, t.name = t.coordDim = t.coordDimIndex = t.dimsDef = t.otherDims = null;}var u = l.get(e);if (u !== !1) {var u = Ri(u);if (!u.length) for (var h = 0; h < (n && n.length || 1); h++) {for (; y < c.length && null != c[y].coordDim;) {y++;}y < c.length && u.push(y++);}f(u, function (i, o) {var l = c[i];if (r(s(l, t), e, o), null == l.name && n) {var u = n[o];!M(u) && (u = { name: u }), l.name = l.displayName = u.name, l.defaultTooltip = u.defaultTooltip;}a && s(l.otherDims, a);});}});var x = n.generateCoord,_ = n.generateCoordCount,w = null != _;_ = x ? _ || 1 : 0;for (var S = x || "value", I = 0; d > I; I++) {var m = c[I] = c[I] || {},T = m.coordDim;null == T && (m.coordDim = Cu(S, h, w), m.coordDimIndex = 0, (!x || 0 >= _) && (m.isExtraCoord = !0), _--), null == m.name && (m.name = Cu(m.coordDim, u)), null == m.type && Vo(e, I, m.name) && (m.type = "ordinal");}return c;}function Au(t, e, n, i) {var r = Math.max(t.dimensionsDetectCount || 1, e.length, n.length, i || 0);return f(e, function (t) {var e = t.dimsDef;e && (r = Math.max(r, e.length));
    }), r;}function Cu(t, e, n) {if (n || null != e.get(t)) {for (var i = 0; null != e.get(t + i);) {i++;}t += i;}return e.set(t, !0), t;}function Du(t, e, n) {n = n || {};var i,r,a,o,s = n.byIndex,l = n.stackedCoordDimension,u = !(!t || !t.get("stack"));if (f(e, function (t, n) {b(t) && (e[n] = t = { name: t }), u && !t.isExtraCoord && (s || i || !t.ordinalMeta || (i = t), r || "ordinal" === t.type || "time" === t.type || l && l !== t.coordDim || (r = t));}), !r || s || i || (s = !0), r) {a = "__\x00ecstackresult", o = "__\x00ecstackedover", i && (i.createInvertedIndices = !0);var h = r.coordDim,c = r.type,d = 0;f(e, function (t) {t.coordDim === h && d++;}), e.push({ name: a, coordDim: h, coordDimIndex: d, type: c, isExtraCoord: !0, isCalculationCoord: !0 }), d++, e.push({ name: o, coordDim: o, coordDimIndex: d, type: c, isExtraCoord: !0, isCalculationCoord: !0 });}return { stackedDimension: r && r.name, stackedByDimension: i && i.name, isStackedByIndex: s, stackedOverDimension: o, stackResultDimension: a };}function ku(t, e) {return !!e && e === t.getCalculationInfo("stackedDimension");}function Pu(t, e) {return ku(t, e) ? t.getCalculationInfo("stackResultDimension") : e;}function Lu(t, e, n) {n = n || {}, Do.isInstance(t) || (t = Do.seriesDataToSource(t));var i,r = e.get("coordinateSystem"),a = $o.get(r),o = Ao(e);o && (i = p(o.coordSysDims, function (t) {var e = { name: t },n = o.axisMap.get(t);if (n) {var i = n.get("type");e.type = du(i);}return e;})), i || (i = a && (a.getDimensionsInfo ? a.getDimensionsInfo() : a.dimensions.slice()) || ["x", "y"]);var s,l,u = G_(t, { coordDimensions: i, generateCoord: n.generateCoord });o && f(u, function (t, e) {var n = t.coordDim,i = o.categoryAxisMap.get(n);i && (null == s && (s = e), t.ordinalMeta = i.getOrdinalMeta()), null != t.otherDims.itemName && (l = !0);}), l || null == s || (u[s].otherDims.itemName = 0);var h = Du(e, u),c = new F_(u, e);c.setCalculationInfo(h);var d = null != s && Ou(t) ? function (t, e, n, i) {return i === s ? n : this.defaultDimValueGetter(t, e, n, i);} : null;return c.hasItemOption = !1, c.initData(t, null, d), c;}function Ou(t) {if (t.sourceFormat === Ty) {var e = zu(t.data || []);return null != e && !_(Fi(e));}}function zu(t) {for (var e = 0; e < t.length && null == t[e];) {e++;}return t[e];}function Eu(t) {this._setting = t || {}, this._extent = [1 / 0, -1 / 0], this._interval = 0, this.init && this.init.apply(this, arguments);}function Bu(t) {this.categories = t.categories || [], this._needCollect = t.needCollect, this._deduplication = t.deduplication, this._map;}function Ru(t) {return t._map || (t._map = N(t.categories));}function Nu(t) {return M(t) && null != t.value ? t.value : t + "";}function Fu(t, e, n, i) {var r = {},a = t[1] - t[0],o = r.interval = oo(a / e, !0);null != n && n > o && (o = r.interval = n), null != i && o > i && (o = r.interval = i);var s = r.intervalPrecision = Vu(o),l = r.niceTickExtent = [Y_(Math.ceil(t[0] / o) * o, s), Y_(Math.floor(t[1] / o) * o, s)];return Gu(l, t), r;}function Vu(t) {return Qa(t) + 2;}function Wu(t, e, n) {t[e] = Math.max(Math.min(t[e], n[1]), n[0]);}function Gu(t, e) {!isFinite(t[0]) && (t[0] = e[0]), !isFinite(t[1]) && (t[1] = e[1]), Wu(t, 0, e), Wu(t, 1, e), t[0] > t[1] && (t[0] = t[1]);}function Hu(t, e, n, i) {var r = [];if (!t) return r;var a = 1e4;e[0] < n[0] && r.push(e[0]);for (var o = n[0]; o <= n[1] && (r.push(o), o = Y_(o + t, i), o !== r[r.length - 1]);) {if (r.length > a) return [];}return e[1] > (r.length ? r[r.length - 1] : n[1]) && r.push(e[1]), r;}function Zu(t) {return t.get("stack") || U_ + t.seriesIndex;}function Xu(t) {return t.dim + t.index;}function Yu(t, e) {var n = [];return e.eachSeriesByType(t, function (t) {Ku(t) && !Qu(t) && n.push(t);}), n;}function qu(t) {var e = [];return f(t, function (t) {var n = t.getData(),i = t.coordinateSystem,r = i.getBaseAxis(),a = r.getExtent(),o = "category" === r.type ? r.getBandWidth() : Math.abs(a[1] - a[0]) / n.count(),s = ja(t.get("barWidth"), o),l = ja(t.get("barMaxWidth"), o),u = t.get("barGap"),h = t.get("barCategoryGap");e.push({ bandWidth: o, barWidth: s, barMaxWidth: l, barGap: u, barCategoryGap: h, axisKey: Xu(r), stackId: Zu(t) });}), ju(e);}function ju(t) {var e = {};f(t, function (t) {var n = t.axisKey,i = t.bandWidth,r = e[n] || { bandWidth: i, remainedWidth: i, autoWidthCount: 0, categoryGap: "20%", gap: "30%", stacks: {} },a = r.stacks;e[n] = r;var o = t.stackId;a[o] || r.autoWidthCount++, a[o] = a[o] || { width: 0, maxWidth: 0 };var s = t.barWidth;s && !a[o].width && (a[o].width = s, s = Math.min(r.remainedWidth, s), r.remainedWidth -= s);var l = t.barMaxWidth;l && (a[o].maxWidth = l);var u = t.barGap;null != u && (r.gap = u);var h = t.barCategoryGap;null != h && (r.categoryGap = h);});var n = {};return f(e, function (t, e) {n[e] = {};var i = t.stacks,r = t.bandWidth,a = ja(t.categoryGap, r),o = ja(t.gap, 1),s = t.remainedWidth,l = t.autoWidthCount,u = (s - a) / (l + (l - 1) * o);u = Math.max(u, 0), f(i, function (t) {var e = t.maxWidth;e && u > e && (e = Math.min(e, s), t.width && (e = Math.min(e, t.width)), s -= e, t.width = e, l--);}), u = (s - a) / (l + (l - 1) * o), u = Math.max(u, 0);var h,c = 0;f(i, function (t) {t.width || (t.width = u), h = t, c += t.width * (1 + o);}), h && (c -= h.width * o);var d = -c / 2;f(i, function (t, i) {n[e][i] = n[e][i] || { offset: d, width: t.width }, d += t.width * (1 + o);});}), n;}function Uu(t, e, n) {if (t && e) {var i = t[Xu(e)];return null != i && null != n && (i = i[Zu(n)]), i;}}function $u(t, e) {var n = Yu(t, e),i = qu(n),r = {};f(n, function (t) {var e = t.getData(),n = t.coordinateSystem,a = n.getBaseAxis(),o = Zu(t),s = i[Xu(a)][o],l = s.offset,u = s.width,h = n.getOtherAxis(a),c = t.get("barMinHeight") || 0;r[o] = r[o] || [], e.setLayout({ offset: l, size: u });for (var d = e.mapDimension(h.dim), f = e.mapDimension(a.dim), p = ku(e, d), g = h.isHorizontal(), v = Ju(a, h, p), m = 0, y = e.count(); y > m; m++) {var x = e.get(d, m),_ = e.get(f, m);if (!isNaN(x)) {var w = x >= 0 ? "p" : "n",b = v;p && (r[o][_] || (r[o][_] = { p: v, n: v }), b = r[o][_][w]);var M, S, I, T;if (g) {var A = n.dataToPoint([x, _]);M = b, S = A[1] + l, I = A[0] - v, T = u, Math.abs(I) < c && (I = (0 > I ? -1 : 1) * c), p && (r[o][_][w] += I);} else {var A = n.dataToPoint([_, x]);M = A[0] + l, S = b, I = u, T = A[1] - v, Math.abs(T) < c && (T = (0 >= T ? -1 : 1) * c), p && (r[o][_][w] += T);}e.setItemLayout(m, { x: M, y: S, width: I, height: T });}}}, this);}function Ku(t) {return t.coordinateSystem && "cartesian2d" === t.coordinateSystem.type;}function Qu(t) {return t.pipelineContext && t.pipelineContext.large;}function Ju(t, e) {var n,i,r = e.getGlobalExtent();r[0] > r[1] ? (n = r[1], i = r[0]) : (n = r[0], i = r[1]);var a = e.toGlobalCoord(e.dataToCoord(0));return n > a && (a = n), a > i && (a = i), a;}function th(t, e) {return dw(t, cw(e));}function eh(t, e) {var n,i,r,a = t.type,o = e.getMin(),s = e.getMax(),l = null != o,u = null != s,h = t.getExtent();"ordinal" === a ? n = e.getCategories().length : (i = e.get("boundaryGap"), _(i) || (i = [i || 0, i || 0]), "boolean" == typeof i[0] && (i = [0, 0]), i[0] = ja(i[0], 1), i[1] = ja(i[1], 1), r = h[1] - h[0] || Math.abs(h[0])), null == o && (o = "ordinal" === a ? n ? 0 : 0 / 0 : h[0] - i[0] * r), null == s && (s = "ordinal" === a ? n ? n - 1 : 0 / 0 : h[1] + i[1] * r), "dataMin" === o ? o = h[0] : "function" == typeof o && (o = o({ min: h[0], max: h[1] })), "dataMax" === s ? s = h[1] : "function" == typeof s && (s = s({ min: h[0], max: h[1] })), (null == o || !isFinite(o)) && (o = 0 / 0), (null == s || !isFinite(s)) && (s = 0 / 0), t.setBlank(A(o) || A(s) || "ordinal" === a && !t.getOrdinalMeta().categories.length), e.getNeedCrossZero() && (o > 0 && s > 0 && !l && (o = 0), 0 > o && 0 > s && !u && (s = 0));var c = e.ecModel;if (c && "time" === a) {var d,p = Yu("bar", c);if (f(p, function (t) {d |= t.getBaseAxis() === e.axis;}), d) {var g = qu(p),v = nh(o, s, e, g);o = v.min, s = v.max;}}return [o, s];}function nh(t, e, n, i) {var r = n.axis.getExtent(),a = r[1] - r[0],o = Uu(i, n.axis);if (void 0 === o) return { min: t, max: e };var s = 1 / 0;f(o, function (t) {s = Math.min(t.offset, s);});var l = -1 / 0;f(o, function (t) {l = Math.max(t.offset + t.width, l);}), s = Math.abs(s), l = Math.abs(l);var u = s + l,h = e - t,c = 1 - (s + l) / a,d = h / c - h;return e += d * (l / u), t -= d * (s / u), { min: t, max: e };}function ih(t, e) {var n = eh(t, e),i = null != e.getMin(),r = null != e.getMax(),a = e.get("splitNumber");"log" === t.type && (t.base = e.get("logBase"));var o = t.type;t.setExtent(n[0], n[1]), t.niceExtent({ splitNumber: a, fixMin: i, fixMax: r, minInterval: "interval" === o || "time" === o ? e.get("minInterval") : null, maxInterval: "interval" === o || "time" === o ? e.get("maxInterval") : null });var s = e.get("interval");null != s && t.setInterval && t.setInterval(s);}function rh(t, e) {if (e = e || t.get("type")) switch (e) {case "category":return new X_(t.getOrdinalMeta ? t.getOrdinalMeta() : t.getCategories(), [1 / 0, -1 / 0]);case "value":return new j_();default:return (Eu.getClass(e) || j_).create(t);}}function ah(t) {var e = t.scale.getExtent(),n = e[0],i = e[1];return !(n > 0 && i > 0 || 0 > n && 0 > i);}function oh(t) {var e = t.getLabelModel().get("formatter"),n = "category" === t.type ? t.scale.getExtent()[0] : null;return "string" == typeof e ? e = function (e) {return function (n) {return n = t.scale.getLabel(n), e.replace("{value}", null != n ? n : "");};}(e) : "function" == typeof e ? function (i, r) {return null != n && (r = i - n), e(sh(t, i), r);} : function (e) {return t.scale.getLabel(e);};}function sh(t, e) {return "category" === t.type ? t.scale.getLabel(e) : e;}function lh(t) {var e = t.model,n = t.scale;if (e.get("axisLabel.show") && !n.isBlank()) {var i,r,a = "category" === t.type,o = n.getExtent();a ? r = n.count() : (i = n.getTicks(), r = i.length);var s,l = t.getLabelModel(),u = oh(t),h = 1;r > 40 && (h = Math.ceil(r / 40));for (var c = 0; r > c; c += h) {var d = i ? i[c] : o[0] + c,f = u(d),p = l.getTextRect(f),g = uh(p, l.get("rotate") || 0);s ? s.union(g) : s = g;}return s;}}function uh(t, e) {var n = e * Math.PI / 180,i = t.plain(),r = i.width,a = i.height,o = r * Math.cos(n) + a * Math.sin(n),s = r * Math.sin(n) + a * Math.cos(n),l = new vn(i.x, i.y, o, s);return l;}function hh(t, e) {if ("image" !== this.type) {var n = this.style,i = this.shape;i && "line" === i.symbolType ? n.stroke = t : this.__isEmptyBrush ? (n.stroke = t, n.fill = e || "#fff") : (n.fill && (n.fill = t), n.stroke && (n.stroke = t)), this.dirty(!1);}}function ch(t, e, n, i, r, a, o) {var s = 0 === t.indexOf("empty");s && (t = t.substr(5, 1).toLowerCase() + t.substr(6));var l;return l = 0 === t.indexOf("image://") ? Qr(t.slice(8), new vn(e, n, i, r), o ? "center" : "cover") : 0 === t.indexOf("path://") ? Kr(t.slice(7), {}, new vn(e, n, i, r), o ? "center" : "cover") : new Tw({ shape: { symbolType: t, x: e, y: n, width: i, height: r } }), l.__isEmptyBrush = s, l.setColor = hh, l.setColor(a), l;}function dh(t) {return Lu(t.getSource(), t);}function fh(t, e) {var n = e;Va.isInstance(e) || (n = new Va(e), c(n, yw));var i = rh(n);return i.setExtent(t[0], t[1]), ih(i, n), i;}function ph(t) {c(t, yw);}function gh(t, e) {return Math.abs(t - e) < Dw;}function vh(t, e, n) {var i = 0,r = t[0];if (!r) return !1;for (var a = 1; a < t.length; a++) {var o = t[a];i += Dr(r[0], r[1], o[0], o[1], e, n), r = o;}var s = t[0];return gh(r[0], s[0]) && gh(r[1], s[1]) || (i += Dr(r[0], r[1], s[0], s[1], e, n)), 0 !== i;}function mh(t, e, n) {if (this.name = t, this.geometries = e, n) n = [n[0], n[1]];else {var i = this.getBoundingRect();n = [i.x + i.width / 2, i.y + i.height / 2];}this.center = n;}function yh(t) {if (!t.UTF8Encoding) return t;var e = t.UTF8Scale;null == e && (e = 1024);for (var n = t.features, i = 0; i < n.length; i++) {for (var r = n[i], a = r.geometry, o = a.coordinates, s = a.encodeOffsets, l = 0; l < o.length; l++) {var u = o[l];if ("Polygon" === a.type) o[l] = xh(u, s[l], e);else if ("MultiPolygon" === a.type) for (var h = 0; h < u.length; h++) {var c = u[h];u[h] = xh(c, s[l][h], e);}}}return t.UTF8Encoding = !1, t;}function xh(t, e, n) {for (var i = [], r = e[0], a = e[1], o = 0; o < t.length; o += 2) {var s = t.charCodeAt(o) - 64,l = t.charCodeAt(o + 1) - 64;s = s >> 1 ^ -(1 & s), l = l >> 1 ^ -(1 & l), s += r, l += a, r = s, a = l, i.push([s / n, l / n]);}return i;}function _h(t) {return "category" === t.type ? bh(t) : Ih(t);}function wh(t, e) {return "category" === t.type ? Sh(t, e) : { ticks: t.scale.getTicks() };}function bh(t) {var e = t.getLabelModel(),n = Mh(t, e);return !e.get("show") || t.scale.isBlank() ? { labels: [], labelCategoryInterval: n.labelCategoryInterval } : n;}function Mh(t, e) {var n = Th(t, "labels"),i = zh(e),r = Ah(n, i);if (r) return r;var a, o;return w(i) ? a = Oh(t, i) : (o = "auto" === i ? Dh(t) : i, a = Lh(t, o)), Ch(n, i, { labels: a, labelCategoryInterval: o });}function Sh(t, e) {var n = Th(t, "ticks"),i = zh(e),r = Ah(n, i);if (r) return r;var a, o;if ((!e.get("show") || t.scale.isBlank()) && (a = []), w(i)) a = Oh(t, i, !0);else if ("auto" === i) {var s = Mh(t, t.getLabelModel());o = s.labelCategoryInterval, a = p(s.labels, function (t) {return t.tickValue;});} else o = i, a = Lh(t, o, !0);return Ch(n, i, { ticks: a, tickCategoryInterval: o });}function Ih(t) {var e = t.scale.getTicks(),n = oh(t);return { labels: p(e, function (e, i) {return { formattedLabel: n(e, i), rawLabel: t.scale.getLabel(e), tickValue: e };}) };}function Th(t, e) {return Pw(t)[e] || (Pw(t)[e] = []);}function Ah(t, e) {for (var n = 0; n < t.length; n++) {if (t[n].key === e) return t[n].value;}}function Ch(t, e, n) {return t.push({ key: e, value: n }), n;}function Dh(t) {var e = Pw(t).autoInterval;return null != e ? e : Pw(t).autoInterval = t.calculateCategoryInterval();}function kh(t) {var e = Ph(t),n = oh(t),i = (e.axisRotate - e.labelRotate) / 180 * Math.PI,r = t.scale,a = r.getExtent(),o = r.count();if (a[1] - a[0] < 1) return 0;var s = 1;o > 40 && (s = Math.max(1, Math.floor(o / 40)));for (var l = a[0], u = t.dataToCoord(l + 1) - t.dataToCoord(l), h = Math.abs(u * Math.cos(i)), c = Math.abs(u * Math.sin(i)), d = 0, f = 0; l <= a[1]; l += s) {var p = 0,g = 0,v = En(n(l), e.font, "center", "top");p = 1.3 * v.width, g = 1.3 * v.height, d = Math.max(d, p, 7), f = Math.max(f, g, 7);}var m = d / h,y = f / c;isNaN(m) && (m = 1 / 0), isNaN(y) && (y = 1 / 0);var x = Math.max(0, Math.floor(Math.min(m, y))),_ = Pw(t.model),w = _.lastAutoInterval,b = _.lastTickCount;return null != w && null != b && Math.abs(w - x) <= 1 && Math.abs(b - o) <= 1 && w > x ? x = w : (_.lastTickCount = o, _.lastAutoInterval = x), x;}function Ph(t) {var e = t.getLabelModel();return { axisRotate: t.getRotate ? t.getRotate() : t.isHorizontal && !t.isHorizontal() ? 90 : 0, labelRotate: e.get("rotate") || 0, font: e.getFont() };}function Lh(t, e, n) {function i(t) {l.push(n ? t : { formattedLabel: r(t), rawLabel: a.getLabel(t), tickValue: t });}var r = oh(t),a = t.scale,o = a.getExtent(),s = t.getLabelModel(),l = [],u = Math.max((e || 0) + 1, 1),h = o[0],c = a.count();0 !== h && u > 1 && c / u > 2 && (h = Math.round(Math.ceil(h / u) * u));var d = { min: s.get("showMinLabel"), max: s.get("showMaxLabel") };d.min && h !== o[0] && i(o[0]);for (var f = h; f <= o[1]; f += u) {i(f);}return d.max && f !== o[1] && i(o[1]), l;}function Oh(t, e, n) {var i = t.scale,r = oh(t),a = [];return f(i.getTicks(), function (t) {var o = i.getLabel(t);e(t, o) && a.push(n ? t : { formattedLabel: r(t), rawLabel: o, tickValue: t });}), a;}function zh(t) {var e = t.get("interval");return null == e ? "auto" : e;}function Eh(t, e) {var n = t[1] - t[0],i = e,r = n / i / 2;t[0] += r, t[1] -= r;}function Bh(t, e, n, i, r) {function a(t, e) {return h ? t > e : e > t;}var o = e.length;if (t.onBand && !i && o) {var s,l = t.getExtent();if (1 === o) e[0].coord = l[0], s = e[1] = { coord: l[0] };else {var u = e[1].coord - e[0].coord;f(e, function (t) {t.coord -= u / 2;var e = e || 0;e % 2 > 0 && (t.coord -= u / (2 * (e + 1)));}), s = { coord: e[o - 1].coord + u }, e.push(s);}var h = l[0] > l[1];a(e[0].coord, l[0]) && (r ? e[0].coord = l[0] : e.shift()), r && a(l[0], e[0].coord) && e.unshift({ coord: l[0] }), a(l[1], s.coord) && (r ? s.coord = l[1] : e.pop()), r && a(s.coord, l[1]) && e.push({ coord: l[1] });}}function Rh(t) {return this._axes[t];}function Nh(t) {Rw.call(this, t);}function Fh(t, e) {return e.type || (e.data ? "category" : "value");}function Vh(t, e) {return t.getCoordSysModel() === e;}function Wh(t, e, n) {this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this._initCartesian(t, e, n), this.model = t;}function Gh(t, e, n, i) {function r(t) {return t.dim + "_" + t.index;}n.getAxesOnZeroOf = function () {return a ? [a] : [];};var a,o = t[e],s = n.model,l = s.get("axisLine.onZero"),u = s.get("axisLine.onZeroAxisIndex");if (l) {if (null != u) Hh(o[u]) && (a = o[u]);else for (var h in o) {if (o.hasOwnProperty(h) && Hh(o[h]) && !i[r(o[h])]) {a = o[h];break;}}a && (i[r(a)] = !0);}}function Hh(t) {return t && "category" !== t.type && "time" !== t.type && ah(t);}function Zh(t, e) {var n = t.getExtent(),i = n[0] + n[1];t.toGlobalCoord = "x" === t.dim ? function (t) {return t + e;} : function (t) {return i - t + e;}, t.toLocalCoord = "x" === t.dim ? function (t) {return t - e;} : function (t) {return i - t + e;};}function Xh(t) {return p(Yw, function (e) {var n = t.getReferringComponents(e)[0];return n;});}function Yh(t) {return "cartesian2d" === t.get("coordinateSystem");}function qh(t, e) {var n = t.mapDimension("defaultedLabel", !0),i = n.length;if (1 === i) return bs(t, e, n[0]);if (i) {for (var r = [], a = 0; a < n.length; a++) {var o = bs(t, e, n[a]);r.push(o);}return r.join(" ");}}function jh(t, e, n, i, r, a) {var o = n.getModel("label"),s = n.getModel("emphasis.label");_a(t, e, o, s, { labelFetcher: r, labelDataIndex: a, defaultText: qh(r.getData(), a), isRectText: !0, autoColor: i }), Uh(t), Uh(e);}function Uh(t, e) {"outside" === t.textPosition && (t.textPosition = e);}function $h(t, e, n) {n.style.text = null, Pa(n, { shape: { width: 0 } }, e, t, function () {n.parent && n.parent.remove(n);});}function Kh(t, e, n) {n.style.text = null, Pa(n, { shape: { r: n.shape.r0 } }, e, t, function () {n.parent && n.parent.remove(n);});}function Qh(t, e, n, i, r, a, o, l) {var u = e.getItemVisual(n, "color"),h = e.getItemVisual(n, "opacity"),c = i.getModel("itemStyle"),d = i.getModel("emphasis.itemStyle").getBarItemStyle();l || t.setShape("r", c.get("barBorderRadius") || 0), t.useStyle(s({ fill: u, opacity: h }, c.getBarItemStyle()));var f = i.getShallow("cursor");f && t.attr("cursor", f);var p = o ? r.height > 0 ? "bottom" : "top" : r.width > 0 ? "left" : "right";l || jh(t.style, d, i, u, a, n, p), ya(t, d);}function Jh(t, e) {var n = t.get($w) || 0;return Math.min(n, Math.abs(e.width), Math.abs(e.height));}function tc(t, e, n) {var i = t.getData(),r = [],a = i.getLayout("valueAxisHorizontal") ? 1 : 0;r[1 - a] = i.getLayout("valueAxisStart");var o = new Jw({ shape: { points: i.getLayout("largePoints") }, incremental: !!n, __startPoint: r, __valueIdx: a });e.add(o), ec(o, t, i);}function ec(t, e, n) {var i = n.getVisual("borderColor") || n.getVisual("color"),r = e.getModel("itemStyle").getItemStyle(["color", "borderColor"]);t.useStyle(r), t.style.fill = null, t.style.stroke = i, t.style.lineWidth = n.getLayout("barWidth");}function nc(t) {var e = { componentType: t.mainType, componentIndex: t.componentIndex };return e[t.mainType + "Index"] = t.componentIndex, e;}function ic(t, e, n, i) {var r,a,o = eo(n - t.rotation),s = i[0] > i[1],l = "start" === e && !s || "start" !== e && s;return no(o - tb / 2) ? (a = l ? "bottom" : "top", r = "center") : no(o - 1.5 * tb) ? (a = l ? "top" : "bottom", r = "center") : (a = "middle", r = 1.5 * tb > o && o > tb / 2 ? l ? "left" : "right" : l ? "right" : "left"), { rotation: o, textAlign: r, textVerticalAlign: a };}function rc(t) {var e = t.get("tooltip");return t.get("silent") || !(t.get("triggerEvent") || e && e.show);}function ac(t, e, n) {var i = t.get("axisLabel.showMinLabel"),r = t.get("axisLabel.showMaxLabel");e = e || [], n = n || [];var a = e[0],o = e[1],s = e[e.length - 1],l = e[e.length - 2],u = n[0],h = n[1],c = n[n.length - 1],d = n[n.length - 2];i === !1 ? (oc(a), oc(u)) : sc(a, o) && (i ? (oc(o), oc(h)) : (oc(a), oc(u))), r === !1 ? (oc(s), oc(c)) : sc(l, s) && (r ? (oc(l), oc(d)) : (oc(s), oc(c)));}function oc(t) {t && (t.ignore = !0);}function sc(t, e) {var n = t && t.getBoundingRect().clone(),i = e && e.getBoundingRect().clone();if (n && i) {var r = Me([]);return Ae(r, r, -t.rotation), n.applyTransform(Ie([], r, t.getLocalTransform())), i.applyTransform(Ie([], r, e.getLocalTransform())), n.intersect(i);}}function lc(t) {return "middle" === t || "center" === t;}function uc(t, e, n) {var i = e.axis;if (e.get("axisTick.show") && !i.scale.isBlank()) {for (var r = e.getModel("axisTick"), a = r.getModel("lineStyle"), o = r.get("length"), l = i.getTicksCoords(), u = [], h = [], c = t._transform, d = [], f = 0; f < l.length; f++) {var p = l[f].coord;u[0] = p, u[1] = 0, h[0] = p, h[1] = n.tickDirection * o, c && (ae(u, u, c), ae(h, h, c));var g = new Lm(ea({ anid: "tick_" + l[f].tickValue, shape: { x1: u[0], y1: u[1], x2: h[0], y2: h[1] }, style: s(a.getLineStyle(), { stroke: e.get("axisLine.lineStyle.color") }), z2: 2, silent: !0 }));t.group.add(g), d.push(g);}return d;}}function hc(t, e, n) {var i = e.axis,r = C(n.axisLabelShow, e.get("axisLabel.show"));if (r && !i.scale.isBlank()) {var a = e.getModel("axisLabel"),o = a.get("margin"),s = i.getViewLabels(),l = (C(n.labelRotate, a.get("rotate")) || 0) * tb / 180,u = ib(n.rotation, l, n.labelDirection),h = e.getCategories(!0),c = [],d = rc(e),p = e.get("triggerEvent");return f(s, function (r, s) {var l = r.tickValue,f = r.formattedLabel,g = r.rawLabel,v = a;h && h[l] && h[l].textStyle && (v = new Va(h[l].textStyle, a, e.ecModel));var m = v.getTextColor() || e.get("axisLine.lineStyle.color"),y = i.dataToCoord(l),x = [y, n.labelOffset + n.labelDirection * o],_ = new wm({ anid: "label_" + l, position: x, rotation: u.rotation, silent: d, z2: 10 });wa(_.style, v, { text: f, textAlign: v.getShallow("align", !0) || u.textAlign, textVerticalAlign: v.getShallow("verticalAlign", !0) || v.getShallow("baseline", !0) || u.textVerticalAlign, textFill: "function" == typeof m ? m("category" === i.type ? g : "value" === i.type ? l + "" : l, s) : m }), p && (_.eventData = nc(e), _.eventData.targetType = "axisLabel", _.eventData.value = g), t._dumbGroup.add(_), _.updateTransform(), c.push(_), t.group.add(_), _.decomposeTransform();}), c;}}function cc(t, e) {var n = { axesInfo: {}, seriesInvolved: !1, coordSysAxesInfo: {}, coordSysMap: {} };return dc(n, t, e), n.seriesInvolved && pc(n, t), n;}function dc(t, e, n) {var i = e.getComponent("tooltip"),r = e.getComponent("axisPointer"),a = r.get("link", !0) || [],o = [];rb(n.getCoordinateSystems(), function (n) {function s(i, s, l) {var h = l.model.getModel("axisPointer", r),d = h.get("show");if (d && ("auto" !== d || i || _c(h))) {null == s && (s = h.get("triggerTooltip")), h = i ? fc(l, c, r, e, i, s) : h;var f = h.get("snap"),p = wc(l.model),g = s || f || "category" === l.type,v = t.axesInfo[p] = { key: p, axis: l, coordSys: n, axisPointerModel: h, triggerTooltip: s, involveSeries: g, snap: f, useHandle: _c(h), seriesModels: [] };u[p] = v, t.seriesInvolved |= g;var m = gc(a, l);if (null != m) {var y = o[m] || (o[m] = { axesInfo: {} });y.axesInfo[p] = v, y.mapper = a[m].mapper, v.linkGroup = y;}}}if (n.axisPointerEnabled) {var l = wc(n.model),u = t.coordSysAxesInfo[l] = {};t.coordSysMap[l] = n;var h = n.model,c = h.getModel("tooltip", i);if (rb(n.getAxes(), ab(s, !1, null)), n.getTooltipAxes && i && c.get("show")) {var d = "axis" === c.get("trigger"),f = "cross" === c.get("axisPointer.type"),p = n.getTooltipAxes(c.get("axisPointer.axis"));(d || f) && rb(p.baseAxes, ab(s, f ? "cross" : !0, d)), f && rb(p.otherAxes, ab(s, "cross", !1));}}});}function fc(t, e, n, r, a, o) {var l = e.getModel("axisPointer"),u = {};rb(["type", "snap", "lineStyle", "shadowStyle", "label", "animation", "animationDurationUpdate", "animationEasingUpdate", "z"], function (t) {u[t] = i(l.get(t));}), u.snap = "category" !== t.type && !!o, "cross" === l.get("type") && (u.type = "line");var h = u.label || (u.label = {});if (null == h.show && (h.show = !1), "cross" === a) {var c = l.get("label.show");if (h.show = null != c ? c : !0, !o) {var d = u.lineStyle = l.get("crossStyle");d && s(h, d.textStyle);}}return t.model.getModel("axisPointer", new Va(u, n, r));}function pc(t, e) {e.eachSeries(function (e) {var n = e.coordinateSystem,i = e.get("tooltip.trigger", !0),r = e.get("tooltip.show", !0);n && "none" !== i && i !== !1 && "item" !== i && r !== !1 && e.get("axisPointer.show", !0) !== !1 && rb(t.coordSysAxesInfo[wc(n.model)], function (t) {var i = t.axis;n.getAxis(i.dim) === i && (t.seriesModels.push(e), null == t.seriesDataCount && (t.seriesDataCount = 0), t.seriesDataCount += e.getData().count());});}, this);}function gc(t, e) {for (var n = e.model, i = e.dim, r = 0; r < t.length; r++) {var a = t[r] || {};if (vc(a[i + "AxisId"], n.id) || vc(a[i + "AxisIndex"], n.componentIndex) || vc(a[i + "AxisName"], n.name)) return r;}}function vc(t, e) {return "all" === t || _(t) && u(t, e) >= 0 || t === e;}function mc(t) {var e = yc(t);if (e) {var n = e.axisPointerModel,i = e.axis.scale,r = n.option,a = n.get("status"),o = n.get("value");null != o && (o = i.parse(o));var s = _c(n);null == a && (r.status = s ? "show" : "hide");var l = i.getExtent().slice();l[0] > l[1] && l.reverse(), (null == o || o > l[1]) && (o = l[1]), o < l[0] && (o = l[0]), r.value = o, s && (r.status = e.axis.scale.isBlank() ? "hide" : "show");}}function yc(t) {var e = (t.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;return e && e.axesInfo[wc(t)];}function xc(t) {var e = yc(t);return e && e.axisPointerModel;}function _c(t) {return !!t.get("handle.show");}function wc(t) {return t.type + "||" + t.id;}function bc(t, e, n, i, r, a) {var o = ob.getAxisPointerClass(t.axisPointerClass);if (o) {var s = xc(e);s ? (t._axisPointer || (t._axisPointer = new o())).render(e, s, i, a) : Mc(t, i);}}function Mc(t, e, n) {var i = t._axisPointer;i && i.dispose(e, n), t._axisPointer = null;}function Sc(t, e, n) {n = n || {};var i = t.coordinateSystem,r = e.axis,a = {},o = r.getAxesOnZeroOf()[0],s = r.position,l = o ? "onZero" : s,u = r.dim,h = i.getRect(),c = [h.x, h.x + h.width, h.y, h.y + h.height],d = { left: 0, right: 1, top: 0, bottom: 1, onZero: 2 },f = e.get("offset") || 0,p = "x" === u ? [c[2] - f, c[3] + f] : [c[0] - f, c[1] + f];if (o) {var g = o.toGlobalCoord(o.dataToCoord(0));p[d.onZero] = Math.max(Math.min(g, p[1]), p[0]);}a.position = ["y" === u ? p[d[l]] : c[0], "x" === u ? p[d[l]] : c[3]], a.rotation = Math.PI / 2 * ("x" === u ? 0 : 1);var v = { top: -1, bottom: 1, left: -1, right: 1 };a.labelDirection = a.tickDirection = a.nameDirection = v[s], a.labelOffset = o ? p[d[s]] - p[d.onZero] : 0, e.get("axisTick.inside") && (a.tickDirection = -a.tickDirection), C(n.labelInside, e.get("axisLabel.inside")) && (a.labelDirection = -a.labelDirection);var m = e.get("axisLabel.rotate");return a.labelRotate = "top" === l ? -m : m, a.z2 = 1, a;}function Ic(t, e, n) {hg.call(this), this.updateData(t, e, n);}function Tc(t) {return [t[0] / 2, t[1] / 2];}function Ac(t, e) {this.parent.drift(t, e);}function Cc() {!fa(this) && kc.call(this);}function Dc() {!fa(this) && Pc.call(this);}function kc() {if (!this.incremental && !this.useHoverLayer) {var t = this.__symbolOriginalScale,e = t[1] / t[0];this.animateTo({ scale: [Math.max(1.1 * t[0], t[0] + 3), Math.max(1.1 * t[1], t[1] + 3 * e)] }, 400, "elasticOut");}}function Pc() {this.incremental || this.useHoverLayer || this.animateTo({ scale: this.__symbolOriginalScale }, 400, "elasticOut");}function Lc(t) {this.group = new hg(), this._symbolCtor = t || Ic;}function Oc(t, e, n, i) {return !(!e || isNaN(e[0]) || isNaN(e[1]) || i.isIgnore && i.isIgnore(n) || i.clipShape && !i.clipShape.contain(e[0], e[1]) || "none" === t.getItemVisual(n, "symbol"));}function zc(t) {return null == t || M(t) || (t = { isIgnore: t }), t || {};}function Ec(t) {var e = t.hostModel;return { itemStyle: e.getModel("itemStyle").getItemStyle(["color"]), hoverItemStyle: e.getModel("emphasis.itemStyle").getItemStyle(), symbolRotate: e.get("symbolRotate"), symbolOffset: e.get("symbolOffset"), hoverAnimation: e.get("hoverAnimation"), labelModel: e.getModel("label"), hoverLabelModel: e.getModel("emphasis.label"), cursorStyle: e.get("cursor") };}function Bc(t, e, n) {var i,r = t.getBaseAxis(),a = t.getOtherAxis(r),o = Rc(a, n),s = r.dim,l = a.dim,u = e.mapDimension(l),h = e.mapDimension(s),c = "x" === l || "radius" === l ? 1 : 0,d = p(t.dimensions, function (t) {return e.mapDimension(t);}),f = e.getCalculationInfo("stackResultDimension");return (i |= ku(e, d[0])) && (d[0] = f), (i |= ku(e, d[1])) && (d[1] = f), { dataDimsForPoint: d, valueStart: o, valueAxisDim: l, baseAxisDim: s, stacked: !!i, valueDim: u, baseDim: h, baseDataOffset: c, stackedOverDimension: e.getCalculationInfo("stackedOverDimension") };}function Rc(t, e) {var n = 0,i = t.scale.getExtent();return "start" === e ? n = i[0] : "end" === e ? n = i[1] : i[0] > 0 ? n = i[0] : i[1] < 0 && (n = i[1]), n;}function Nc(t, e, n, i) {var r = 0 / 0;t.stacked && (r = n.get(n.getCalculationInfo("stackedOverDimension"), i)), isNaN(r) && (r = t.valueStart);var a = t.baseDataOffset,o = [];return o[a] = n.get(t.baseDim, i), o[1 - a] = r, e.dataToPoint(o);}function Fc(t, e) {var n = [];return e.diff(t).add(function (t) {n.push({ cmd: "+", idx: t });}).update(function (t, e) {n.push({ cmd: "=", idx: e, idx1: t });}).remove(function (t) {n.push({ cmd: "-", idx: t });}).execute(), n;}function Vc(t) {return isNaN(t[0]) || isNaN(t[1]);}function Wc(t, e, n, i, r, a, o, s, l, u) {return "none" !== u && u ? Gc.apply(this, arguments) : Hc.apply(this, arguments);}function Gc(t, e, n, i, r, a, o, s, l, u, h) {for (var c = 0, d = n, f = 0; i > f; f++) {var p = e[d];if (d >= r || 0 > d) break;if (Vc(p)) {if (h) {d += a;continue;}break;}if (d === n) t[a > 0 ? "moveTo" : "lineTo"](p[0], p[1]);else if (l > 0) {var g = e[c],v = "y" === u ? 1 : 0,m = (p[v] - g[v]) * l;bb(Sb, g), Sb[v] = g[v] + m, bb(Ib, p), Ib[v] = p[v] - m, t.bezierCurveTo(Sb[0], Sb[1], Ib[0], Ib[1], p[0], p[1]);} else t.lineTo(p[0], p[1]);c = d, d += a;}return f;}function Hc(t, e, n, i, r, a, o, s, l, u, h) {for (var c = 0, d = n, f = 0; i > f; f++) {var p = e[d];if (d >= r || 0 > d) break;if (Vc(p)) {if (h) {d += a;continue;}break;}if (d === n) t[a > 0 ? "moveTo" : "lineTo"](p[0], p[1]), bb(Sb, p);else if (l > 0) {var g = d + a,v = e[g];if (h) for (; v && Vc(e[g]);) {g += a, v = e[g];}var m = .5,y = e[c],v = e[g];if (!v || Vc(v)) bb(Ib, p);else {Vc(v) && !h && (v = p), q(Mb, v, y);var x, _;if ("x" === u || "y" === u) {var w = "x" === u ? 0 : 1;x = Math.abs(p[w] - y[w]), _ = Math.abs(p[w] - v[w]);} else x = _p(p, y), _ = _p(p, v);m = _ / (_ + x), wb(Ib, p, Mb, -l * (1 - m));}xb(Sb, Sb, s), _b(Sb, Sb, o), xb(Ib, Ib, s), _b(Ib, Ib, o), t.bezierCurveTo(Sb[0], Sb[1], Ib[0], Ib[1], p[0], p[1]), wb(Sb, p, Mb, l * m);} else t.lineTo(p[0], p[1]);c = d, d += a;}return f;}function Zc(t, e) {var n = [1 / 0, 1 / 0],i = [-1 / 0, -1 / 0];if (e) for (var r = 0; r < t.length; r++) {var a = t[r];a[0] < n[0] && (n[0] = a[0]), a[1] < n[1] && (n[1] = a[1]), a[0] > i[0] && (i[0] = a[0]), a[1] > i[1] && (i[1] = a[1]);}return { min: e ? n : i, max: e ? i : n };}function Xc(t, e) {if (t.length === e.length) {for (var n = 0; n < t.length; n++) {var i = t[n],r = e[n];if (i[0] !== r[0] || i[1] !== r[1]) return;}return !0;}}function Yc(t) {return "number" == typeof t ? t : t ? .5 : 0;}function qc(t) {var e = t.getGlobalExtent();if (t.onBand) {var n = t.getBandWidth() / 2 - 1,i = e[1] > e[0] ? 1 : -1;e[0] += i * n, e[1] -= i * n;}return e;}function jc(t, e, n) {if (!n.valueDim) return [];for (var i = [], r = 0, a = e.count(); a > r; r++) {i.push(Nc(n, t, e, r));}return i;}function Uc(t, e, n, i) {var r = qc(t.getAxis("x")),a = qc(t.getAxis("y")),o = t.getBaseAxis().isHorizontal(),s = Math.min(r[0], r[1]),l = Math.min(a[0], a[1]),u = Math.max(r[0], r[1]) - s,h = Math.max(a[0], a[1]) - l;if (n) s -= .5, u += .5, l -= .5, h += .5;else {var c = i.get("lineStyle.width") || 2,d = i.get("clipOverflow") ? c / 2 : Math.max(u, h);o ? (l -= d, h += 2 * d) : (s -= d, u += 2 * d);}var f = new Pm({ shape: { x: s, y: l, width: u, height: h } });return e && (f.shape[o ? "width" : "height"] = 0, La(f, { shape: { width: u, height: h } }, i)), f;}function $c(t, e, n, i) {var r = t.getAngleAxis(),a = t.getRadiusAxis(),o = a.getExtent().slice();o[0] > o[1] && o.reverse();var s = r.getExtent(),l = Math.PI / 180;n && (o[0] -= .5, o[1] += .5);var u = new Im({ shape: { cx: Ua(t.cx, 1), cy: Ua(t.cy, 1), r0: Ua(o[0], 1), r: Ua(o[1], 1), startAngle: -s[0] * l, endAngle: -s[1] * l, clockwise: r.inverse } });return e && (u.shape.endAngle = -s[0] * l, La(u, { shape: { endAngle: -s[1] * l } }, i)), u;}function Kc(t, e, n, i) {return "polar" === t.type ? $c(t, e, n, i) : Uc(t, e, n, i);}function Qc(t, e, n) {for (var i = e.getBaseAxis(), r = "x" === i.dim || "radius" === i.dim ? 0 : 1, a = [], o = 0; o < t.length - 1; o++) {var s = t[o + 1],l = t[o];a.push(l);var u = [];switch (n) {case "end":u[r] = s[r], u[1 - r] = l[1 - r], a.push(u);break;case "middle":var h = (l[r] + s[r]) / 2,c = [];u[r] = c[r] = h, u[1 - r] = l[1 - r], c[1 - r] = s[1 - r], a.push(u), a.push(c);break;default:u[r] = l[r], u[1 - r] = s[1 - r], a.push(u);}}return t[o] && a.push(t[o]), a;}function Jc(t, e) {var n = t.getVisual("visualMeta");if (n && n.length && t.count() && "cartesian2d" === e.type) {for (var i, r, a = n.length - 1; a >= 0; a--) {var o = n[a].dimension,s = t.dimensions[o],l = t.getDimensionInfo(s);if (i = l && l.coordDim, "x" === i || "y" === i) {r = n[a];break;}}if (r) {var u = e.getAxis(i),h = p(r.stops, function (t) {return { coord: u.toGlobalCoord(u.dataToCoord(t.value)), color: t.color };}),c = h.length,d = r.outerColors.slice();c && h[0].coord > h[c - 1].coord && (h.reverse(), d.reverse());var g = 10,v = h[0].coord - g,m = h[c - 1].coord + g,y = m - v;if (.001 > y) return "transparent";f(h, function (t) {t.offset = (t.coord - v) / y;}), h.push({ offset: c ? h[c - 1].offset : .5, color: d[1] || "transparent" }), h.unshift({ offset: c ? h[0].offset : .5, color: d[0] || "transparent" });var x = new Nm(0, 0, 0, 0, h, !0);return x[i] = v, x[i + "2"] = m, x;}}}function td(t, e, n) {var i = t.get("showAllSymbol"),r = "auto" === i;if (!i || r) {var a = n.getAxesByScale("ordinal")[0];if (a && (!r || !ed(a, e))) {var o = e.mapDimension(a.dim),s = {};return f(a.getViewLabels(), function (t) {s[t.tickValue] = 1;}), function (t) {return !s.hasOwnProperty(e.get(o, t));};}}}function ed(t, e) {var n = t.getExtent(),i = Math.abs(n[1] - n[0]) / t.scale.count();isNaN(i) && (i = 0);for (var r = e.count(), a = Math.max(1, Math.round(r / 5)), o = 0; r > o; o += a) {if (1.5 * Ic.getSymbolSize(e, o)[t.isHorizontal() ? 1 : 0] > i) return !1;}return !0;}function nd(t, e, n, i) {var r = e.getData(),a = this.dataIndex,o = r.getName(a),s = e.get("selectedOffset");i.dispatchAction({ type: "pieToggleSelect", from: t, name: o, seriesId: e.id }), r.each(function (t) {id(r.getItemGraphicEl(t), r.getItemLayout(t), e.isSelected(r.getName(t)), s, n);});}function id(t, e, n, i, r) {var a = (e.startAngle + e.endAngle) / 2,o = Math.cos(a),s = Math.sin(a),l = n ? i : 0,u = [o * l, s * l];r ? t.animate().when(200, { position: u }).start("bounceOut") : t.attr("position", u);}function rd(t, e) {function n() {a.ignore = a.hoverIgnore, o.ignore = o.hoverIgnore;}function i() {a.ignore = a.normalIgnore, o.ignore = o.normalIgnore;}hg.call(this);var r = new Im({ z2: 2 }),a = new km(),o = new wm();this.add(r), this.add(a), this.add(o), this.updateData(t, e, !0), this.on("emphasis", n).on("normal", i).on("mouseover", n).on("mouseout", i);}function ad(t, e, n, i, r, a, o) {function s(e, n, i) {for (var r = e; n > r; r++) {if (t[r].y += i, r > e && n > r + 1 && t[r + 1].y > t[r].y + t[r].height) return void l(r, i / 2);}l(n - 1, i / 2);}function l(e, n) {for (var i = e; i >= 0 && (t[i].y -= n, !(i > 0 && t[i].y > t[i - 1].y + t[i - 1].height)); i--) {;}}function u(t, e, n, i, r, a) {for (var o = a > 0 ? e ? Number.MAX_VALUE : 0 : e ? Number.MAX_VALUE : 0, s = 0, l = t.length; l > s; s++) {if ("center" !== t[s].position) {var u = Math.abs(t[s].y - i),h = t[s].len,c = t[s].len2,d = r + h > u ? Math.sqrt((r + h + c) * (r + h + c) - u * u) : Math.abs(t[s].x - n);e && d >= o && (d = o - 10), !e && o >= d && (d = o + 10), t[s].x = n + d * a, o = d;}}}t.sort(function (t, e) {return t.y - e.y;});for (var h, c = 0, d = t.length, f = [], p = [], g = 0; d > g; g++) {h = t[g].y - c, 0 > h && s(g, d, -h, r), c = t[g].y + t[g].height;}0 > o - c && l(d - 1, c - o);for (var g = 0; d > g; g++) {t[g].y >= n ? p.push(t[g]) : f.push(t[g]);}u(f, !1, e, n, i, r), u(p, !0, e, n, i, r);}function od(t, e, n, i, r, a) {for (var o = [], s = [], l = 0; l < t.length; l++) {t[l].x < e ? o.push(t[l]) : s.push(t[l]);}ad(s, e, n, i, 1, r, a), ad(o, e, n, i, -1, r, a);for (var l = 0; l < t.length; l++) {var u = t[l].linePoints;if (u) {var h = u[1][0] - u[2][0];u[2][0] = t[l].x < e ? t[l].x + 3 : t[l].x - 3, u[1][1] = u[2][1] = t[l].y, u[1][0] = u[2][0] + h;}}}function sd(t, e) {var n = t.get("center"),i = e.getWidth(),r = e.getHeight(),a = Math.min(i, r),o = ja(n[0], e.getWidth()),s = ja(n[1], e.getHeight()),l = ja(t.get("radius"), a / 2);return { cx: o, cy: s, r: l };}function ld(t, e) {return e && ("string" == typeof e ? t = e.replace("{value}", null != t ? t : "") : "function" == typeof e && (t = e(t))), t;}function ud(t, e, n) {var i,r = {},a = "toggleSelected" === t;return n.eachComponent("legend", function (n) {a && null != i ? n[i ? "select" : "unSelect"](e.name) : (n[t](e.name), i = n.isSelected(e.name));var o = n.getData();f(o, function (t) {var e = t.get("name");if ("\n" !== e && "" !== e) {var i = n.isSelected(e);
          r[e] = r.hasOwnProperty(e) ? r[e] && i : i;}});}), { name: e.name, selected: r };}function hd(t, e) {var n = oy(e.get("padding")),i = e.getItemStyle(["color", "opacity"]);i.fill = e.get("backgroundColor");var t = new Pm({ shape: { x: t.x - n[3], y: t.y - n[0], width: t.width + n[1] + n[3], height: t.height + n[0] + n[2], r: e.get("borderRadius") }, style: i, silent: !0, z2: -1 });return t;}function cd(t, e) {e.dispatchAction({ type: "legendToggleSelect", name: t });}function dd(t, e, n, i) {var r = n.getZr().storage.getDisplayList()[0];r && r.useHoverLayer || n.dispatchAction({ type: "highlight", seriesName: t, name: e, excludeSeriesId: i });}function fd(t, e, n, i) {var r = n.getZr().storage.getDisplayList()[0];r && r.useHoverLayer || n.dispatchAction({ type: "downplay", seriesName: t, name: e, excludeSeriesId: i });}function pd(t, e, n) {var i = t.getOrient(),r = [1, 1];r[i.index] = 0, bo(e, n, { type: "box", ignoreSize: r });}function gd(t, e, n, i, r) {var a = t.axis;if (!a.scale.isBlank() && a.containData(e)) {if (!t.involveSeries) return void n.showPointer(t, e);var s = vd(e, t),l = s.payloadBatch,u = s.snapToValue;l[0] && null == r.seriesIndex && o(r, l[0]), !i && t.snap && a.containData(u) && null != u && (e = u), n.showPointer(t, e, l, r), n.showTooltip(t, s, u);}}function vd(t, e) {var n = e.axis,i = n.dim,r = t,a = [],o = Number.MAX_VALUE,s = -1;return rM(e.seriesModels, function (e) {var l,u,h = e.getData().mapDimension(i, !0);if (e.getAxisTooltipData) {var c = e.getAxisTooltipData(h, t, n);u = c.dataIndices, l = c.nestestValue;} else {if (u = e.getData().indicesOfNearest(h[0], t, "category" === n.type ? .5 : null), !u.length) return;l = e.getData().get(h[0], u[0]);}if (null != l && isFinite(l)) {var d = t - l,f = Math.abs(d);o >= f && ((o > f || d >= 0 && 0 > s) && (o = f, s = d, r = l, a.length = 0), rM(u, function (t) {a.push({ seriesIndex: e.seriesIndex, dataIndexInside: t, dataIndex: e.getData().getRawIndex(t) });}));}}), { payloadBatch: a, snapToValue: r };}function md(t, e, n, i) {t[e.key] = { value: n, payloadBatch: i };}function yd(t, e, n, i) {var r = n.payloadBatch,a = e.axis,o = a.model,s = e.axisPointerModel;if (e.triggerTooltip && r.length) {var l = e.coordSys.model,u = wc(l),h = t.map[u];h || (h = t.map[u] = { coordSysId: l.id, coordSysIndex: l.componentIndex, coordSysType: l.type, coordSysMainType: l.mainType, dataByAxis: [] }, t.list.push(h)), h.dataByAxis.push({ axisDim: a.dim, axisIndex: o.componentIndex, axisType: o.type, axisId: o.id, value: i, valueLabelOpt: { precision: s.get("label.precision"), formatter: s.get("label.formatter") }, seriesDataIndices: r.slice() });}}function xd(t, e, n) {var i = n.axesInfo = [];rM(e, function (e, n) {var r = e.axisPointerModel.option,a = t[n];a ? (!e.useHandle && (r.status = "show"), r.value = a.value, r.seriesDataIndices = (a.payloadBatch || []).slice()) : !e.useHandle && (r.status = "hide"), "show" === r.status && i.push({ axisDim: e.axis.dim, axisIndex: e.axis.model.componentIndex, value: r.value });});}function _d(t, e, n, i) {if (Sd(e) || !t.list.length) return void i({ type: "hideTip" });var r = ((t.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};i({ type: "showTip", escapeConnect: !0, x: e[0], y: e[1], tooltipOption: n.tooltipOption, position: n.position, dataIndexInside: r.dataIndexInside, dataIndex: r.dataIndex, seriesIndex: r.seriesIndex, dataByCoordSys: t.list });}function wd(t, e, n) {var i = n.getZr(),r = "axisPointerLastHighlights",a = oM(i)[r] || {},o = oM(i)[r] = {};rM(t, function (t) {var e = t.axisPointerModel.option;"show" === e.status && rM(e.seriesDataIndices, function (t) {var e = t.seriesIndex + " | " + t.dataIndex;o[e] = t;});});var s = [],l = [];f(a, function (t, e) {!o[e] && l.push(t);}), f(o, function (t, e) {!a[e] && s.push(t);}), l.length && n.dispatchAction({ type: "downplay", escapeConnect: !0, batch: l }), s.length && n.dispatchAction({ type: "highlight", escapeConnect: !0, batch: s });}function bd(t, e) {for (var n = 0; n < (t || []).length; n++) {var i = t[n];if (e.axis.dim === i.axisDim && e.axis.model.componentIndex === i.axisIndex) return i;}}function Md(t) {var e = t.axis.model,n = {},i = n.axisDim = t.axis.dim;return n.axisIndex = n[i + "AxisIndex"] = e.componentIndex, n.axisName = n[i + "AxisName"] = e.name, n.axisId = n[i + "AxisId"] = e.id, n;}function Sd(t) {return !t || null == t[0] || isNaN(t[0]) || null == t[1] || isNaN(t[1]);}function Id(t, e, n) {if (!np.node) {var i = e.getZr();lM(i).records || (lM(i).records = {}), Td(i, e);var r = lM(i).records[t] || (lM(i).records[t] = {});r.handler = n;}}function Td(t, e) {function n(n, i) {t.on(n, function (n) {var r = kd(e);uM(lM(t).records, function (t) {t && i(t, n, r.dispatchAction);}), Ad(r.pendings, e);});}lM(t).initialized || (lM(t).initialized = !0, n("click", x(Dd, "click")), n("mousemove", x(Dd, "mousemove")), n("globalout", Cd));}function Ad(t, e) {var n,i = t.showTip.length,r = t.hideTip.length;i ? n = t.showTip[i - 1] : r && (n = t.hideTip[r - 1]), n && (n.dispatchAction = null, e.dispatchAction(n));}function Cd(t, e, n) {t.handler("leave", null, n);}function Dd(t, e, n, i) {e.handler(t, n, i);}function kd(t) {var e = { showTip: [], hideTip: [] },n = function n(i) {var r = e[i.type];r ? r.push(i) : (i.dispatchAction = n, t.dispatchAction(i));};return { dispatchAction: n, pendings: e };}function Pd(t, e) {if (!np.node) {var n = e.getZr(),i = (lM(n).records || {})[t];i && (lM(n).records[t] = null);}}function Ld() {}function Od(t, e, n, i) {zd(cM(n).lastProp, i) || (cM(n).lastProp = i, e ? Pa(n, i, t) : (n.stopAnimation(), n.attr(i)));}function zd(t, e) {if (M(t) && M(e)) {var n = !0;return f(e, function (e, i) {n = n && zd(t[i], e);}), !!n;}return t === e;}function Ed(t, e) {t[e.get("label.show") ? "show" : "hide"]();}function Bd(t) {return { position: t.position.slice(), rotation: t.rotation || 0 };}function Rd(t, e, n) {var i = e.get("z"),r = e.get("zlevel");t && t.traverse(function (t) {"group" !== t.type && (null != i && (t.z = i), null != r && (t.zlevel = r), t.silent = n);});}function Nd(t) {var e,n = t.get("type"),i = t.getModel(n + "Style");return "line" === n ? (e = i.getLineStyle(), e.fill = null) : "shadow" === n && (e = i.getAreaStyle(), e.stroke = null), e;}function Fd(t, e, n, i, r) {var a = n.get("value"),o = Wd(a, e.axis, e.ecModel, n.get("seriesDataIndices"), { precision: n.get("label.precision"), formatter: n.get("label.formatter") }),s = n.getModel("label"),l = oy(s.get("padding") || 0),u = s.getFont(),h = En(o, u),c = r.position,d = h.width + l[1] + l[3],f = h.height + l[0] + l[2],p = r.align;"right" === p && (c[0] -= d), "center" === p && (c[0] -= d / 2);var g = r.verticalAlign;"bottom" === g && (c[1] -= f), "middle" === g && (c[1] -= f / 2), Vd(c, d, f, i);var v = s.get("backgroundColor");v && "auto" !== v || (v = e.get("axisLine.lineStyle.color")), t.label = { shape: { x: 0, y: 0, width: d, height: f, r: s.get("borderRadius") }, position: c.slice(), style: { text: o, textFont: u, textFill: s.getTextColor(), textPosition: "inside", fill: v, stroke: s.get("borderColor") || "transparent", lineWidth: s.get("borderWidth") || 0, shadowBlur: s.get("shadowBlur"), shadowColor: s.get("shadowColor"), shadowOffsetX: s.get("shadowOffsetX"), shadowOffsetY: s.get("shadowOffsetY") }, z2: 10 };}function Vd(t, e, n, i) {var r = i.getWidth(),a = i.getHeight();t[0] = Math.min(t[0] + e, r) - e, t[1] = Math.min(t[1] + n, a) - n, t[0] = Math.max(t[0], 0), t[1] = Math.max(t[1], 0);}function Wd(t, e, n, i, r) {t = e.scale.parse(t);var a = e.scale.getLabel(t, { precision: r.precision }),o = r.formatter;if (o) {var s = { value: sh(e, t), seriesData: [] };f(i, function (t) {var e = n.getSeriesByIndex(t.seriesIndex),i = t.dataIndexInside,r = e && e.getDataParams(i);r && s.seriesData.push(r);}), b(o) ? a = o.replace("{value}", a) : w(o) && (a = o(s));}return a;}function Gd(t, e, n) {var i = be();return Ae(i, i, n.rotation), Te(i, i, n.position), za([t.dataToCoord(e), (n.labelOffset || 0) + (n.labelDirection || 1) * (n.labelMargin || 0)], i);}function Hd(t, e, n, i, r, a) {var o = eb.innerTextLayout(n.rotation, 0, n.labelDirection);n.labelMargin = r.get("label.margin"), Fd(e, i, r, a, { position: Gd(i.axis, t, n), align: o.textAlign, verticalAlign: o.textVerticalAlign });}function Zd(t, e, n) {return n = n || 0, { x1: t[n], y1: t[1 - n], x2: e[n], y2: e[1 - n] };}function Xd(t, e, n) {return n = n || 0, { x: t[n], y: t[1 - n], width: e[n], height: e[1 - n] };}function Yd(t, e) {var n = {};return n[e.dim + "AxisIndex"] = e.index, t.getCartesian(n);}function qd(t) {return "x" === t.dim ? 0 : 1;}function jd(t) {var e = "cubic-bezier(0.23, 1, 0.32, 1)",n = "left " + t + "s " + e + ",top " + t + "s " + e;return p(yM, function (t) {return t + "transition:" + n;}).join(";");}function Ud(t) {var e = [],n = t.get("fontSize"),i = t.getTextColor();return i && e.push("color:" + i), e.push("font:" + t.getFont()), n && e.push("line-height:" + Math.round(3 * n / 2) + "px"), vM(["decoration", "align"], function (n) {var i = t.get(n);i && e.push("text-" + n + ":" + i);}), e.join(";");}function $d(t) {var e = [],n = t.get("transitionDuration"),i = t.get("backgroundColor"),r = t.getModel("textStyle"),a = t.get("padding");return n && e.push(jd(n)), i && (np.canvasSupported ? e.push("background-Color:" + i) : (e.push("background-Color:#" + qe(i)), e.push("filter:alpha(opacity=70)"))), vM(["width", "color", "radius"], function (n) {var i = "border-" + n,r = mM(i),a = t.get(r);null != a && e.push(i + ":" + a + ("color" === n ? "" : "px"));}), e.push(Ud(r)), null != a && e.push("padding:" + oy(a).join("px ") + "px"), e.join(";") + ";";}function Kd(t, e) {if (np.wxa) return null;var n = document.createElement("div"),i = this._zr = e.getZr();this.el = n, this._x = e.getWidth() / 2, this._y = e.getHeight() / 2, t.appendChild(n), this._container = t, this._show = !1, this._hideTimeout;var r = this;n.onmouseenter = function () {r._enterable && (clearTimeout(r._hideTimeout), r._show = !0), r._inContent = !0;}, n.onmousemove = function (e) {if (e = e || window.event, !r._enterable) {var n = i.handler;pe(t, e, !0), n.dispatch("mousemove", e);}}, n.onmouseleave = function () {r._enterable && r._show && r.hideLater(r._hideDelay), r._inContent = !1;};}function Qd(t) {this._zr = t.getZr(), this._show = !1, this._hideTimeout;}function Jd(t) {for (var e = t.pop(); t.length;) {var n = t.pop();n && (Va.isInstance(n) && (n = n.get("tooltip", !0)), "string" == typeof n && (n = { formatter: n }), e = new Va(n, e, e.ecModel));}return e;}function tf(t, e) {return t.dispatchAction || y(e.dispatchAction, e);}function ef(t, e, n, i, r, a, o) {var s = n.getOuterSize(),l = s.width,u = s.height;return null != a && (t + l + a > i ? t -= l + a : t += a), null != o && (e + u + o > r ? e -= u + o : e += o), [t, e];}function nf(t, e, n, i, r) {var a = n.getOuterSize(),o = a.width,s = a.height;return t = Math.min(t + o, i) - o, e = Math.min(e + s, r) - s, t = Math.max(t, 0), e = Math.max(e, 0), [t, e];}function rf(t, e, n) {var i = n[0],r = n[1],a = 5,o = 0,s = 0,l = e.width,u = e.height;switch (t) {case "inside":o = e.x + l / 2 - i / 2, s = e.y + u / 2 - r / 2;break;case "top":o = e.x + l / 2 - i / 2, s = e.y - r - a;break;case "bottom":o = e.x + l / 2 - i / 2, s = e.y + u + a;break;case "left":o = e.x - i - a, s = e.y + u / 2 - r / 2;break;case "right":o = e.x + l + a, s = e.y + u / 2 - r / 2;}return [o, s];}function af(t) {return "center" === t || "middle" === t;}function of(t) {Ni(t, "label", ["show"]);}function sf(t) {return !(isNaN(parseFloat(t.x)) && isNaN(parseFloat(t.y)));}function lf(t) {return !isNaN(parseFloat(t.x)) && !isNaN(parseFloat(t.y));}function uf(t, e, n, i, r, a) {var o = [],s = ku(e, i),l = s ? e.getCalculationInfo("stackResultDimension") : i,u = pf(e, l, t),h = e.indicesOfNearest(l, u)[0];o[r] = e.get(n, h), o[a] = e.get(i, h);var c = Ka(e.get(i, h));return c = Math.min(c, 20), c >= 0 && (o[a] = +o[a].toFixed(c)), o;}function hf(t, e) {var n = t.getData(),r = t.coordinateSystem;if (e && !lf(e) && !_(e.coord) && r) {var a = r.dimensions,o = cf(e, n, r, t);if (e = i(e), e.type && DM[e.type] && o.baseAxis && o.valueAxis) {var s = AM(a, o.baseAxis.dim),l = AM(a, o.valueAxis.dim);e.coord = DM[e.type](n, o.baseDataDim, o.valueDataDim, s, l), e.value = e.coord[l];} else {for (var u = [null != e.xAxis ? e.xAxis : e.radiusAxis, null != e.yAxis ? e.yAxis : e.angleAxis], h = 0; 2 > h; h++) {DM[u[h]] && (u[h] = pf(n, n.mapDimension(a[h]), u[h]));}e.coord = u;}}return e;}function cf(t, e, n, i) {var r = {};return null != t.valueIndex || null != t.valueDim ? (r.valueDataDim = null != t.valueIndex ? e.getDimension(t.valueIndex) : t.valueDim, r.valueAxis = n.getAxis(df(i, r.valueDataDim)), r.baseAxis = n.getOtherAxis(r.valueAxis), r.baseDataDim = e.mapDimension(r.baseAxis.dim)) : (r.baseAxis = i.getBaseAxis(), r.valueAxis = n.getOtherAxis(r.baseAxis), r.baseDataDim = e.mapDimension(r.baseAxis.dim), r.valueDataDim = e.mapDimension(r.valueAxis.dim)), r;}function df(t, e) {var n = t.getData(),i = n.dimensions;e = n.getDimension(e);for (var r = 0; r < i.length; r++) {var a = n.getDimensionInfo(i[r]);if (a.name === e) return a.coordDim;}}function ff(t, e) {return t && t.containData && e.coord && !sf(e) ? t.containData(e.coord) : !0;}function pf(t, e, n) {if ("average" === n) {var i = 0,r = 0;return t.each(e, function (t) {isNaN(t) || (i += t, r++);}), i / r;}return "median" === n ? t.getMedian(e) : t.getDataExtent(e, !0)["max" === n ? 1 : 0];}function gf(t) {return !isNaN(t) && !isFinite(t);}function vf(t, e, n) {var i = 1 - t;return gf(e[i]) && gf(n[i]);}function mf(t, e) {var n = e.coord[0],i = e.coord[1];return "cartesian2d" === t.type && n && i && (vf(1, n, i, t) || vf(0, n, i, t)) ? !0 : ff(t, { coord: n, x: e.x0, y: e.y0 }) || ff(t, { coord: i, x: e.x1, y: e.y1 });}function yf(t, e, n, i, r) {var a,o = i.coordinateSystem,s = t.getItemModel(e),l = ja(s.get(n[0]), r.getWidth()),u = ja(s.get(n[1]), r.getHeight());if (isNaN(l) || isNaN(u)) {if (i.getMarkerPosition) a = i.getMarkerPosition(t.getValues(n, e));else {var h = t.get(n[0], e),c = t.get(n[1], e),d = [h, c];o.clampData && o.clampData(d, d), a = o.dataToPoint(d, !0);}if ("cartesian2d" === o.type) {var f = o.getAxis("x"),p = o.getAxis("y"),h = t.get(n[0], e),c = t.get(n[1], e);gf(h) ? a[0] = f.toGlobalCoord(f.getExtent()["x0" === n[0] ? 0 : 1]) : gf(c) && (a[1] = p.toGlobalCoord(p.getExtent()["y0" === n[1] ? 0 : 1]));}isNaN(l) || (a[0] = l), isNaN(u) || (a[1] = u);} else a = [l, u];return a;}function xf(t, e, n) {var i,r,a = ["x0", "y0", "x1", "y1"];t ? (i = p(t && t.dimensions, function (t) {var n = e.getData(),i = n.getDimensionInfo(n.mapDimension(t)) || {};return s({ name: t }, i);}), r = new F_(p(a, function (t, e) {return { name: t, type: i[e % 2].type };}), n)) : (i = [{ name: "value", type: "float" }], r = new F_(i, n));var o = p(n.get("data"), x(PM, e, t, n));t && (o = v(o, x(mf, t)));var l = t ? function (t, e, n, i) {return t.coord[Math.floor(i / 2)][i % 2];} : function (t) {return t.value;};return r.initData(o, null, l), r.hasItemOption = !0, r;}function _f(t) {return u(zM, t) >= 0;}function wf(t, e) {t = t.slice();var n = p(t, xo);e = (e || []).slice();var i = p(e, xo);return function (r, a) {f(t, function (t, o) {for (var s = { name: t, capital: n[o] }, l = 0; l < e.length; l++) {s[e[l]] = t + i[l];}r.call(a, s);});};}function bf(t, e, n) {function i(t, e) {return u(e.nodes, t) >= 0;}function r(t, i) {var r = !1;return e(function (e) {f(n(t, e) || [], function (t) {i.records[e.name][t] && (r = !0);});}), r;}function a(t, i) {i.nodes.push(t), e(function (e) {f(n(t, e) || [], function (t) {i.records[e.name][t] = !0;});});}return function (n) {function o(t) {!i(t, s) && r(t, s) && (a(t, s), l = !0);}var s = { nodes: [], records: {} };if (e(function (t) {s.records[t.name] = {};}), !n) return s;a(n, s);var l;do {l = !1, t(o);} while (l);return s;};}function Mf(t, e, n) {var i = [1 / 0, -1 / 0];return BM(n, function (t) {var n = t.getData();n && BM(n.mapDimension(e, !0), function (t) {var e = n.getApproximateExtent(t);e[0] < i[0] && (i[0] = e[0]), e[1] > i[1] && (i[1] = e[1]);});}), i[1] < i[0] && (i = [0 / 0, 0 / 0]), Sf(t, i), i;}function Sf(t, e) {var n = t.getAxisModel(),i = n.getMin(!0),r = "category" === n.get("type"),a = r && n.getCategories().length;null != i && "dataMin" !== i && "function" != typeof i ? e[0] = i : r && (e[0] = a > 0 ? 0 : 0 / 0);var o = n.getMax(!0);return null != o && "dataMax" !== o && "function" != typeof o ? e[1] = o : r && (e[1] = a > 0 ? a - 1 : 0 / 0), n.get("scale", !0) || (e[0] > 0 && (e[0] = 0), e[1] < 0 && (e[1] = 0)), e;}function If(t, e) {var n = t.getAxisModel(),i = t._percentWindow,r = t._valueWindow;if (i) {var a = Ja(r, [0, 500]);a = Math.min(a, 20);var o = e || 0 === i[0] && 100 === i[1];n.setRange(o ? null : +r[0].toFixed(a), o ? null : +r[1].toFixed(a));}}function Tf(t) {var e = t._minMaxSpan = {},n = t._dataZoomModel;BM(["min", "max"], function (i) {e[i + "Span"] = n.get(i + "Span");var r = n.get(i + "ValueSpan");if (null != r && (e[i + "ValueSpan"] = r, r = t.getAxisModel().axis.scale.parse(r), null != r)) {var a = t._dataExtent;e[i + "Span"] = qa(a[0] + r, a, [0, 100], !0);}});}function Af(t) {var e = {};return FM(["start", "end", "startValue", "endValue", "throttle"], function (n) {t.hasOwnProperty(n) && (e[n] = t[n]);}), e;}function Cf(t, e) {var n = t._rangePropMode,i = t.get("rangeMode");FM([["start", "startValue"], ["end", "endValue"]], function (t, r) {var a = null != e[t[0]],o = null != e[t[1]];a && !o ? n[r] = "percent" : !a && o ? n[r] = "value" : i ? n[r] = i[r] : a && (n[r] = "percent");});}function Df(t, e) {var n = t[e] - t[1 - e];return { span: Math.abs(n), sign: n > 0 ? -1 : 0 > n ? 1 : e ? -1 : 1 };}function kf(t, e) {return Math.min(e[1], Math.max(e[0], t));}function Pf(t) {var e = { x: "y", y: "x", radius: "angle", angle: "radius" };return e[t];}function Lf(t) {return "vertical" === t ? "ns-resize" : "ew-resize";}function Of(t, e) {return !!zf(t)[e];}function zf(t) {return t[iS] || (t[iS] = {});}function Ef(t) {this.pointerChecker, this._zr = t, this._opt = {};var e = y,n = e(Bf, this),r = e(Rf, this),a = e(Nf, this),o = e(Ff, this),l = e(Vf, this);Sp.call(this), this.setPointerChecker = function (t) {this.pointerChecker = t;}, this.enable = function (e, u) {this.disable(), this._opt = s(i(u) || {}, { zoomOnMouseWheel: !0, moveOnMouseMove: !0, moveOnMouseWheel: !1, preventDefaultMouseMove: !0 }), null == e && (e = !0), (e === !0 || "move" === e || "pan" === e) && (t.on("mousedown", n), t.on("mousemove", r), t.on("mouseup", a)), (e === !0 || "scale" === e || "zoom" === e) && (t.on("mousewheel", o), t.on("pinch", l));}, this.disable = function () {t.off("mousedown", n), t.off("mousemove", r), t.off("mouseup", a), t.off("mousewheel", o), t.off("pinch", l);}, this.dispose = this.disable, this.isDragging = function () {return this._dragging;}, this.isPinching = function () {return this._pinching;};}function Bf(t) {if (!(me(t) || t.target && t.target.draggable)) {var e = t.offsetX,n = t.offsetY;this.pointerChecker && this.pointerChecker(t, e, n) && (this._x = e, this._y = n, this._dragging = !0);}}function Rf(t) {if (!me(t) && Hf("moveOnMouseMove", t, this._opt) && this._dragging && "pinch" !== t.gestureEvent && !Of(this._zr, "globalPan")) {var e = t.offsetX,n = t.offsetY,i = this._x,r = this._y,a = e - i,o = n - r;this._x = e, this._y = n, this._opt.preventDefaultMouseMove && Ap(t.event), Gf(this, "pan", "moveOnMouseMove", t, { dx: a, dy: o, oldX: i, oldY: r, newX: e, newY: n });}}function Nf(t) {me(t) || (this._dragging = !1);}function Ff(t) {var e = Hf("zoomOnMouseWheel", t, this._opt),n = Hf("moveOnMouseWheel", t, this._opt),i = t.wheelDelta,r = Math.abs(i),a = t.offsetX,o = t.offsetY;if (0 !== i && (e || n)) {if (e) {var s = r > 3 ? 1.4 : r > 1 ? 1.2 : 1.1,l = i > 0 ? s : 1 / s;Wf(this, "zoom", "zoomOnMouseWheel", t, { scale: l, originX: a, originY: o });}if (n) {var u = Math.abs(i),h = (i > 0 ? 1 : -1) * (u > 3 ? .4 : u > 1 ? .15 : .05);Wf(this, "scrollMove", "moveOnMouseWheel", t, { scrollDelta: h, originX: a, originY: o });}}}function Vf(t) {if (!Of(this._zr, "globalPan")) {var e = t.pinchScale > 1 ? 1.1 : 1 / 1.1;Wf(this, "zoom", null, t, { scale: e, originX: t.pinchX, originY: t.pinchY });}}function Wf(t, e, n, i, r) {t.pointerChecker && t.pointerChecker(i, r.originX, r.originY) && (Ap(i.event), Gf(t, e, n, i, r));}function Gf(t, e, n, i, r) {r.isAvailableBehavior = y(Hf, null, n, i), t.trigger(e, r);}function Hf(t, e, n) {var i = n[t];return !t || i && (!b(i) || e.event[i + "Key"]);}function Zf(t, e) {var n = qf(t),i = e.dataZoomId,r = e.coordId;f(n, function (t) {var n = t.dataZoomInfos;n[i] && u(e.allCoordIds, r) < 0 && (delete n[i], t.count--);}), Uf(n);var a = n[r];a || (a = n[r] = { coordId: r, dataZoomInfos: {}, count: 0 }, a.controller = jf(t, a), a.dispatchAction = x($f, t)), !a.dataZoomInfos[i] && a.count++, a.dataZoomInfos[i] = e;var o = Kf(a.dataZoomInfos);a.controller.enable(o.controlType, o.opt), a.controller.setPointerChecker(e.containsPoint), Gs(a, "dispatchAction", e.dataZoomModel.get("throttle", !0), "fixRate");}function Xf(t, e) {var n = qf(t);f(n, function (t) {t.controller.dispose();var n = t.dataZoomInfos;n[e] && (delete n[e], t.count--);}), Uf(n);}function Yf(t) {return t.type + "\x00_" + t.id;}function qf(t) {var e = t.getZr();return e[rS] || (e[rS] = {});}function jf(t, e) {var n = new Ef(t.getZr());return f(["pan", "zoom", "scrollMove"], function (t) {n.on(t, function (n) {var i = [];f(e.dataZoomInfos, function (r) {if (n.isAvailableBehavior(r.dataZoomModel.option)) {var a = (r.getRange || {})[t],o = a && a(e.controller, n);!r.dataZoomModel.get("disabled", !0) && o && i.push({ dataZoomId: r.dataZoomId, start: o[0], end: o[1] });}}), i.length && e.dispatchAction(i);});}), n;}function Uf(t) {f(t, function (e, n) {e.count || (e.controller.dispose(), delete t[n]);});}function $f(t, e) {t.dispatchAction({ type: "dataZoom", batch: e });}function Kf(t) {var e,n = "type_",i = { type_true: 2, type_move: 1, type_false: 0, type_undefined: -1 },r = !0;return f(t, function (t) {var a = t.dataZoomModel,o = a.get("disabled", !0) ? !1 : a.get("zoomLock", !0) ? "move" : !0;i[n + o] > i[n + e] && (e = o), r &= a.get("preventDefaultMouseMove", !0);}), { controlType: e, opt: { zoomOnMouseWheel: !0, moveOnMouseMove: !0, moveOnMouseWheel: !0, preventDefaultMouseMove: !!r } };}function Qf(t) {return function (e, n, i, r) {var a = this._range,o = a.slice(),s = e.axisModels[0];if (s) {var l = t(o, s, e, n, i, r);return HM(l, o, [0, 100], "all"), this._range = o, a[0] !== o[0] || a[1] !== o[1] ? o : void 0;}};}var Jf = 2311,tp = function tp() {return Jf++;},ep = {};ep = "object" == typeof wx && "function" == typeof wx.getSystemInfoSync ? { browser: {}, os: {}, node: !1, wxa: !0, canvasSupported: !0, svgSupported: !1, touchEventsSupported: !0, domSupported: !1 } : "undefined" == typeof document && "undefined" != typeof self ? { browser: {}, os: {}, node: !1, worker: !0, canvasSupported: !0, domSupported: !1 } : "undefined" == typeof navigator ? { browser: {}, os: {}, node: !0, worker: !1, canvasSupported: !0, svgSupported: !0, domSupported: !1 } : e(navigator.userAgent);var np = ep,ip = { "[object Function]": 1, "[object RegExp]": 1, "[object Date]": 1, "[object Error]": 1, "[object CanvasGradient]": 1, "[object CanvasPattern]": 1, "[object Image]": 1, "[object Canvas]": 1 },rp = { "[object Int8Array]": 1, "[object Uint8Array]": 1, "[object Uint8ClampedArray]": 1, "[object Int16Array]": 1, "[object Uint16Array]": 1, "[object Int32Array]": 1, "[object Uint32Array]": 1, "[object Float32Array]": 1, "[object Float64Array]": 1 },ap = Object.prototype.toString,op = Array.prototype,sp = op.forEach,lp = op.filter,up = op.slice,hp = op.map,cp = op.reduce,dp = {},fp = function fp() {return dp.createCanvas();};dp.createCanvas = function () {return document.createElement("canvas");};var pp,gp = "__ec_primitive__";R.prototype = { constructor: R, get: function get(t) {return this.data.hasOwnProperty(t) ? this.data[t] : null;}, set: function set(t, e) {return this.data[t] = e;}, each: function each(t, e) {void 0 !== e && (t = y(t, e));for (var n in this.data) {this.data.hasOwnProperty(n) && t(this.data[n], n);}}, removeKey: function removeKey(t) {delete this.data[t];} };var vp = (Object.freeze || Object)({ $override: n, clone: i, merge: r, mergeAll: a, extend: o, defaults: s, createCanvas: fp, getContext: l, indexOf: u, inherits: h, mixin: c, isArrayLike: d, each: f, map: p, reduce: g, filter: v, find: m, bind: y, curry: x, isArray: _, isFunction: w, isString: b, isObject: M, isBuiltInObject: S, isTypedArray: I, isDom: T, eqNaN: A, retrieve: C, retrieve2: D, retrieve3: k, slice: P, normalizeCssArray: L, assert: O, trim: z, setAsPrimitive: E, isPrimitive: B, createHashMap: N, concatArray: F, noop: V }),mp = "undefined" == typeof Float32Array ? Array : Float32Array,yp = j,xp = U,_p = ee,wp = ne,bp = (Object.freeze || Object)({ create: W, copy: G, clone: H, set: Z, add: X, scaleAndAdd: Y, sub: q, len: j, length: yp, lenSquare: U, lengthSquare: xp, mul: $, div: K, dot: Q, scale: J, normalize: te, distance: ee, dist: _p, distanceSquare: ne, distSquare: wp, negate: ie, lerp: re, applyTransform: ae, min: oe, max: se });le.prototype = { constructor: le, _dragStart: function _dragStart(t) {var e = t.target;e && e.draggable && (this._draggingTarget = e, e.dragging = !0, this._x = t.offsetX, this._y = t.offsetY, this.dispatchToElement(ue(e, t), "dragstart", t.event));}, _drag: function _drag(t) {var e = this._draggingTarget;if (e) {var n = t.offsetX,i = t.offsetY,r = n - this._x,a = i - this._y;this._x = n, this._y = i, e.drift(r, a, t), this.dispatchToElement(ue(e, t), "drag", t.event);var o = this.findHover(n, i, e).target,s = this._dropTarget;this._dropTarget = o, e !== o && (s && o !== s && this.dispatchToElement(ue(s, t), "dragleave", t.event), o && o !== s && this.dispatchToElement(ue(o, t), "dragenter", t.event));}}, _dragEnd: function _dragEnd(t) {var e = this._draggingTarget;e && (e.dragging = !1), this.dispatchToElement(ue(e, t), "dragend", t.event), this._dropTarget && this.dispatchToElement(ue(this._dropTarget, t), "drop", t.event), this._draggingTarget = null, this._dropTarget = null;} };var Mp = Array.prototype.slice,Sp = function Sp(t) {this._$handlers = {}, this._$eventProcessor = t;};Sp.prototype = { constructor: Sp, one: function one(t, e, n, i) {var r = this._$handlers;if ("function" == typeof e && (i = n, n = e, e = null), !n || !t) return this;e = he(this, e), r[t] || (r[t] = []);for (var a = 0; a < r[t].length; a++) {if (r[t][a].h === n) return this;}return r[t].push({ h: n, one: !0, query: e, ctx: i || this }), this;}, on: function on(t, e, n, i) {var r = this._$handlers;if ("function" == typeof e && (i = n, n = e, e = null), !n || !t) return this;e = he(this, e), r[t] || (r[t] = []);for (var a = 0; a < r[t].length; a++) {if (r[t][a].h === n) return this;}return r[t].push({ h: n, one: !1, query: e, ctx: i || this }), this;}, isSilent: function isSilent(t) {var e = this._$handlers;return e[t] && e[t].length;}, off: function off(t, e) {var n = this._$handlers;if (!t) return this._$handlers = {}, this;if (e) {if (n[t]) {for (var i = [], r = 0, a = n[t].length; a > r; r++) {n[t][r].h !== e && i.push(n[t][r]);}n[t] = i;}n[t] && 0 === n[t].length && delete n[t];} else delete n[t];return this;}, trigger: function trigger(t) {var e = this._$handlers[t],n = this._$eventProcessor;if (e) {var i = arguments,r = i.length;r > 3 && (i = Mp.call(i, 1));for (var a = e.length, o = 0; a > o;) {var s = e[o];if (n && n.filter && null != s.query && !n.filter(t, s.query)) o++;else {switch (r) {case 1:s.h.call(s.ctx);break;case 2:s.h.call(s.ctx, i[1]);break;case 3:s.h.call(s.ctx, i[1], i[2]);break;default:s.h.apply(s.ctx, i);}s.one ? (e.splice(o, 1), a--) : o++;}}}return n && n.afterTrigger && n.afterTrigger(t), this;}, triggerWithContext: function triggerWithContext(t) {var e = this._$handlers[t],n = this._$eventProcessor;if (e) {var i = arguments,r = i.length;r > 4 && (i = Mp.call(i, 1, i.length - 1));for (var a = i[i.length - 1], o = e.length, s = 0; o > s;) {var l = e[s];if (n && n.filter && null != l.query && !n.filter(t, l.query)) s++;else {switch (r) {case 1:l.h.call(a);break;case 2:l.h.call(a, i[1]);break;case 3:l.h.call(a, i[1], i[2]);break;default:l.h.apply(a, i);}l.one ? (e.splice(s, 1), o--) : s++;}}}return n && n.afterTrigger && n.afterTrigger(t), this;} };var Ip = "undefined" != typeof window && !!window.addEventListener,Tp = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,Ap = Ip ? function (t) {t.preventDefault(), t.stopPropagation(), t.cancelBubble = !0;} : function (t) {t.returnValue = !1, t.cancelBubble = !0;},Cp = "silent";_e.prototype.dispose = function () {};var Dp = ["click", "dblclick", "mousewheel", "mouseout", "mouseup", "mousedown", "mousemove", "contextmenu"],kp = function kp(t, e, n, i) {Sp.call(this), this.storage = t, this.painter = e, this.painterRoot = i, n = n || new _e(), this.proxy = null, this._hovered = {}, this._lastTouchMoment, this._lastX, this._lastY, le.call(this), this.setHandlerProxy(n);};kp.prototype = { constructor: kp, setHandlerProxy: function setHandlerProxy(t) {this.proxy && this.proxy.dispose(), t && (f(Dp, function (e) {t.on && t.on(e, this[e], this);}, this), t.handler = this), this.proxy = t;}, mousemove: function mousemove(t) {var e = t.zrX,n = t.zrY,i = this._hovered,r = i.target;r && !r.__zr && (i = this.findHover(i.x, i.y), r = i.target);var a = this._hovered = this.findHover(e, n),o = a.target,s = this.proxy;s.setCursor && s.setCursor(o ? o.cursor : "default"), r && o !== r && this.dispatchToElement(i, "mouseout", t), this.dispatchToElement(a, "mousemove", t), o && o !== r && this.dispatchToElement(a, "mouseover", t);}, mouseout: function mouseout(t) {this.dispatchToElement(this._hovered, "mouseout", t);var e,n = t.toElement || t.relatedTarget;do {n = n && n.parentNode;} while (n && 9 != n.nodeType && !(e = n === this.painterRoot));!e && this.trigger("globalout", { event: t });}, resize: function resize() {this._hovered = {};}, dispatch: function dispatch(t, e) {var n = this[t];n && n.call(this, e);}, dispose: function dispose() {this.proxy.dispose(), this.storage = this.proxy = this.painter = null;}, setCursorStyle: function setCursorStyle(t) {var e = this.proxy;e.setCursor && e.setCursor(t);}, dispatchToElement: function dispatchToElement(t, e, n) {t = t || {};var i = t.target;if (!i || !i.silent) {for (var r = "on" + e, a = ye(e, t, n); i && (i[r] && (a.cancelBubble = i[r].call(i, a)), i.trigger(e, a), i = i.parent, !a.cancelBubble);) {;}a.cancelBubble || (this.trigger(e, a), this.painter && this.painter.eachOtherLayer(function (t) {"function" == typeof t[r] && t[r].call(t, a), t.trigger && t.trigger(e, a);}));}}, findHover: function findHover(t, e, n) {for (var i = this.storage.getDisplayList(), r = { x: t, y: e }, a = i.length - 1; a >= 0; a--) {var o;if (i[a] !== n && !i[a].ignore && (o = we(i[a], t, e)) && (!r.topTarget && (r.topTarget = i[a]), o !== Cp)) {r.target = i[a];break;}}return r;} }, f(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function (t) {kp.prototype[t] = function (e) {var n = this.findHover(e.zrX, e.zrY),i = n.target;if ("mousedown" === t) this._downEl = i, this._downPoint = [e.zrX, e.zrY], this._upEl = i;else if ("mouseup" === t) this._upEl = i;else if ("click" === t) {if (this._downEl !== this._upEl || !this._downPoint || _p(this._downPoint, [e.zrX, e.zrY]) > 4) return;this._downPoint = null;}this.dispatchToElement(n, t, e);};}), c(kp, Sp), c(kp, le);var Pp = "undefined" == typeof Float32Array ? Array : Float32Array,Lp = (Object.freeze || Object)({ create: be, identity: Me, copy: Se, mul: Ie, translate: Te, rotate: Ae, scale: Ce, invert: De, clone: ke }),Op = Me,zp = 5e-5,Ep = function Ep(t) {t = t || {}, t.position || (this.position = [0, 0]), null == t.rotation && (this.rotation = 0), t.scale || (this.scale = [1, 1]), this.origin = this.origin || null;},Bp = Ep.prototype;Bp.transform = null, Bp.needLocalTransform = function () {return Pe(this.rotation) || Pe(this.position[0]) || Pe(this.position[1]) || Pe(this.scale[0] - 1) || Pe(this.scale[1] - 1);};var Rp = [];Bp.updateTransform = function () {var t = this.parent,e = t && t.transform,n = this.needLocalTransform(),i = this.transform;if (!n && !e) return void (i && Op(i));i = i || be(), n ? this.getLocalTransform(i) : Op(i), e && (n ? Ie(i, t.transform, i) : Se(i, t.transform)), this.transform = i;var r = this.globalScaleRatio;if (null != r && 1 !== r) {this.getGlobalScale(Rp);var a = Rp[0] < 0 ? -1 : 1,o = Rp[1] < 0 ? -1 : 1,s = ((Rp[0] - a) * r + a) / Rp[0] || 0,l = ((Rp[1] - o) * r + o) / Rp[1] || 0;i[0] *= s, i[1] *= s, i[2] *= l, i[3] *= l;}this.invTransform = this.invTransform || be(), De(this.invTransform, i);}, Bp.getLocalTransform = function (t) {return Ep.getLocalTransform(this, t);}, Bp.setTransform = function (t) {var e = this.transform,n = t.dpr || 1;e ? t.setTransform(n * e[0], n * e[1], n * e[2], n * e[3], n * e[4], n * e[5]) : t.setTransform(n, 0, 0, n, 0, 0);}, Bp.restoreTransform = function (t) {var e = t.dpr || 1;t.setTransform(e, 0, 0, e, 0, 0);};var Np = [],Fp = be();Bp.setLocalTransform = function (t) {if (t) {var e = t[0] * t[0] + t[1] * t[1],n = t[2] * t[2] + t[3] * t[3],i = this.position,r = this.scale;Pe(e - 1) && (e = Math.sqrt(e)), Pe(n - 1) && (n = Math.sqrt(n)), t[0] < 0 && (e = -e), t[3] < 0 && (n = -n), i[0] = t[4], i[1] = t[5], r[0] = e, r[1] = n, this.rotation = Math.atan2(-t[1] / n, t[0] / e);}}, Bp.decomposeTransform = function () {if (this.transform) {var t = this.parent,e = this.transform;t && t.transform && (Ie(Np, t.invTransform, e), e = Np);var n = this.origin;n && (n[0] || n[1]) && (Fp[4] = n[0], Fp[5] = n[1], Ie(Np, e, Fp), Np[4] -= n[0], Np[5] -= n[1], e = Np), this.setLocalTransform(e);}}, Bp.getGlobalScale = function (t) {var e = this.transform;return t = t || [], e ? (t[0] = Math.sqrt(e[0] * e[0] + e[1] * e[1]), t[1] = Math.sqrt(e[2] * e[2] + e[3] * e[3]), e[0] < 0 && (t[0] = -t[0]), e[3] < 0 && (t[1] = -t[1]), t) : (t[0] = 1, t[1] = 1, t);}, Bp.transformCoordToLocal = function (t, e) {var n = [t, e],i = this.invTransform;return i && ae(n, n, i), n;}, Bp.transformCoordToGlobal = function (t, e) {var n = [t, e],i = this.transform;return i && ae(n, n, i), n;}, Ep.getLocalTransform = function (t, e) {e = e || [], Op(e);var n = t.origin,i = t.scale || [1, 1],r = t.rotation || 0,a = t.position || [0, 0];return n && (e[4] -= n[0], e[5] -= n[1]), Ce(e, e, i), r && Ae(e, e, r), n && (e[4] += n[0], e[5] += n[1]), e[4] += a[0], e[5] += a[1], e;};var Vp = { linear: function linear(t) {return t;}, quadraticIn: function quadraticIn(t) {return t * t;}, quadraticOut: function quadraticOut(t) {return t * (2 - t);}, quadraticInOut: function quadraticInOut(t) {return (t *= 2) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1);}, cubicIn: function cubicIn(t) {return t * t * t;}, cubicOut: function cubicOut(t) {return --t * t * t + 1;}, cubicInOut: function cubicInOut(t) {return (t *= 2) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2);}, quarticIn: function quarticIn(t) {return t * t * t * t;}, quarticOut: function quarticOut(t) {return 1 - --t * t * t * t;}, quarticInOut: function quarticInOut(t) {return (t *= 2) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2);}, quinticIn: function quinticIn(t) {return t * t * t * t * t;}, quinticOut: function quinticOut(t) {return --t * t * t * t * t + 1;}, quinticInOut: function quinticInOut(t) {return (t *= 2) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2);}, sinusoidalIn: function sinusoidalIn(t) {return 1 - Math.cos(t * Math.PI / 2);}, sinusoidalOut: function sinusoidalOut(t) {return Math.sin(t * Math.PI / 2);}, sinusoidalInOut: function sinusoidalInOut(t) {return .5 * (1 - Math.cos(Math.PI * t));}, exponentialIn: function exponentialIn(t) {return 0 === t ? 0 : Math.pow(1024, t - 1);}, exponentialOut: function exponentialOut(t) {return 1 === t ? 1 : 1 - Math.pow(2, -10 * t);}, exponentialInOut: function exponentialInOut(t) {return 0 === t ? 0 : 1 === t ? 1 : (t *= 2) < 1 ? .5 * Math.pow(1024, t - 1) : .5 * (-Math.pow(2, -10 * (t - 1)) + 2);}, circularIn: function circularIn(t) {return 1 - Math.sqrt(1 - t * t);}, circularOut: function circularOut(t) {return Math.sqrt(1 - --t * t);}, circularInOut: function circularInOut(t) {return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1);}, elasticIn: function elasticIn(t) {var e,n = .1,i = .4;return 0 === t ? 0 : 1 === t ? 1 : (!n || 1 > n ? (n = 1, e = i / 4) : e = i * Math.asin(1 / n) / (2 * Math.PI), -(n * Math.pow(2, 10 * (t -= 1)) * Math.sin(2 * (t - e) * Math.PI / i)));}, elasticOut: function elasticOut(t) {var e,n = .1,i = .4;return 0 === t ? 0 : 1 === t ? 1 : (!n || 1 > n ? (n = 1, e = i / 4) : e = i * Math.asin(1 / n) / (2 * Math.PI), n * Math.pow(2, -10 * t) * Math.sin(2 * (t - e) * Math.PI / i) + 1);}, elasticInOut: function elasticInOut(t) {var e,n = .1,i = .4;return 0 === t ? 0 : 1 === t ? 1 : (!n || 1 > n ? (n = 1, e = i / 4) : e = i * Math.asin(1 / n) / (2 * Math.PI), (t *= 2) < 1 ? -.5 * n * Math.pow(2, 10 * (t -= 1)) * Math.sin(2 * (t - e) * Math.PI / i) : n * Math.pow(2, -10 * (t -= 1)) * Math.sin(2 * (t - e) * Math.PI / i) * .5 + 1);}, backIn: function backIn(t) {var e = 1.70158;return t * t * ((e + 1) * t - e);}, backOut: function backOut(t) {var e = 1.70158;return --t * t * ((e + 1) * t + e) + 1;}, backInOut: function backInOut(t) {var e = 2.5949095;return (t *= 2) < 1 ? .5 * t * t * ((e + 1) * t - e) : .5 * ((t -= 2) * t * ((e + 1) * t + e) + 2);}, bounceIn: function bounceIn(t) {return 1 - Vp.bounceOut(1 - t);}, bounceOut: function bounceOut(t) {return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;}, bounceInOut: function bounceInOut(t) {return .5 > t ? .5 * Vp.bounceIn(2 * t) : .5 * Vp.bounceOut(2 * t - 1) + .5;} };Le.prototype = { constructor: Le, step: function step(t, e) {if (this._initialized || (this._startTime = t + this._delay, this._initialized = !0), this._paused) return void (this._pausedTime += e);var n = (t - this._startTime - this._pausedTime) / this._life;if (!(0 > n)) {n = Math.min(n, 1);
        var i = this.easing,r = "string" == typeof i ? Vp[i] : i,a = "function" == typeof r ? r(n) : n;return this.fire("frame", a), 1 == n ? this.loop ? (this.restart(t), "restart") : (this._needsRemove = !0, "destroy") : null;}}, restart: function restart(t) {var e = (t - this._startTime - this._pausedTime) % this._life;this._startTime = t - e + this.gap, this._pausedTime = 0, this._needsRemove = !1;}, fire: function fire(t, e) {t = "on" + t, this[t] && this[t](this._target, e);}, pause: function pause() {this._paused = !0;}, resume: function resume() {this._paused = !1;} };var Wp = function Wp() {this.head = null, this.tail = null, this._len = 0;},Gp = Wp.prototype;Gp.insert = function (t) {var e = new Hp(t);return this.insertEntry(e), e;}, Gp.insertEntry = function (t) {this.head ? (this.tail.next = t, t.prev = this.tail, t.next = null, this.tail = t) : this.head = this.tail = t, this._len++;}, Gp.remove = function (t) {var e = t.prev,n = t.next;e ? e.next = n : this.head = n, n ? n.prev = e : this.tail = e, t.next = t.prev = null, this._len--;}, Gp.len = function () {return this._len;}, Gp.clear = function () {this.head = this.tail = null, this._len = 0;};var Hp = function Hp(t) {this.value = t, this.next, this.prev;},Zp = function Zp(t) {this._list = new Wp(), this._map = {}, this._maxSize = t || 10, this._lastRemovedEntry = null;},Xp = Zp.prototype;Xp.put = function (t, e) {var n = this._list,i = this._map,r = null;if (null == i[t]) {var a = n.len(),o = this._lastRemovedEntry;if (a >= this._maxSize && a > 0) {var s = n.head;n.remove(s), delete i[s.key], r = s.value, this._lastRemovedEntry = s;}o ? o.value = e : o = new Hp(e), o.key = t, n.insertEntry(o), i[t] = o;}return r;}, Xp.get = function (t) {var e = this._map[t],n = this._list;return null != e ? (e !== n.tail && (n.remove(e), n.insertEntry(e)), e.value) : void 0;}, Xp.clear = function () {this._list.clear(), this._map = {};};var Yp = { transparent: [0, 0, 0, 0], aliceblue: [240, 248, 255, 1], antiquewhite: [250, 235, 215, 1], aqua: [0, 255, 255, 1], aquamarine: [127, 255, 212, 1], azure: [240, 255, 255, 1], beige: [245, 245, 220, 1], bisque: [255, 228, 196, 1], black: [0, 0, 0, 1], blanchedalmond: [255, 235, 205, 1], blue: [0, 0, 255, 1], blueviolet: [138, 43, 226, 1], brown: [165, 42, 42, 1], burlywood: [222, 184, 135, 1], cadetblue: [95, 158, 160, 1], chartreuse: [127, 255, 0, 1], chocolate: [210, 105, 30, 1], coral: [255, 127, 80, 1], cornflowerblue: [100, 149, 237, 1], cornsilk: [255, 248, 220, 1], crimson: [220, 20, 60, 1], cyan: [0, 255, 255, 1], darkblue: [0, 0, 139, 1], darkcyan: [0, 139, 139, 1], darkgoldenrod: [184, 134, 11, 1], darkgray: [169, 169, 169, 1], darkgreen: [0, 100, 0, 1], darkgrey: [169, 169, 169, 1], darkkhaki: [189, 183, 107, 1], darkmagenta: [139, 0, 139, 1], darkolivegreen: [85, 107, 47, 1], darkorange: [255, 140, 0, 1], darkorchid: [153, 50, 204, 1], darkred: [139, 0, 0, 1], darksalmon: [233, 150, 122, 1], darkseagreen: [143, 188, 143, 1], darkslateblue: [72, 61, 139, 1], darkslategray: [47, 79, 79, 1], darkslategrey: [47, 79, 79, 1], darkturquoise: [0, 206, 209, 1], darkviolet: [148, 0, 211, 1], deeppink: [255, 20, 147, 1], deepskyblue: [0, 191, 255, 1], dimgray: [105, 105, 105, 1], dimgrey: [105, 105, 105, 1], dodgerblue: [30, 144, 255, 1], firebrick: [178, 34, 34, 1], floralwhite: [255, 250, 240, 1], forestgreen: [34, 139, 34, 1], fuchsia: [255, 0, 255, 1], gainsboro: [220, 220, 220, 1], ghostwhite: [248, 248, 255, 1], gold: [255, 215, 0, 1], goldenrod: [218, 165, 32, 1], gray: [128, 128, 128, 1], green: [0, 128, 0, 1], greenyellow: [173, 255, 47, 1], grey: [128, 128, 128, 1], honeydew: [240, 255, 240, 1], hotpink: [255, 105, 180, 1], indianred: [205, 92, 92, 1], indigo: [75, 0, 130, 1], ivory: [255, 255, 240, 1], khaki: [240, 230, 140, 1], lavender: [230, 230, 250, 1], lavenderblush: [255, 240, 245, 1], lawngreen: [124, 252, 0, 1], lemonchiffon: [255, 250, 205, 1], lightblue: [173, 216, 230, 1], lightcoral: [240, 128, 128, 1], lightcyan: [224, 255, 255, 1], lightgoldenrodyellow: [250, 250, 210, 1], lightgray: [211, 211, 211, 1], lightgreen: [144, 238, 144, 1], lightgrey: [211, 211, 211, 1], lightpink: [255, 182, 193, 1], lightsalmon: [255, 160, 122, 1], lightseagreen: [32, 178, 170, 1], lightskyblue: [135, 206, 250, 1], lightslategray: [119, 136, 153, 1], lightslategrey: [119, 136, 153, 1], lightsteelblue: [176, 196, 222, 1], lightyellow: [255, 255, 224, 1], lime: [0, 255, 0, 1], limegreen: [50, 205, 50, 1], linen: [250, 240, 230, 1], magenta: [255, 0, 255, 1], maroon: [128, 0, 0, 1], mediumaquamarine: [102, 205, 170, 1], mediumblue: [0, 0, 205, 1], mediumorchid: [186, 85, 211, 1], mediumpurple: [147, 112, 219, 1], mediumseagreen: [60, 179, 113, 1], mediumslateblue: [123, 104, 238, 1], mediumspringgreen: [0, 250, 154, 1], mediumturquoise: [72, 209, 204, 1], mediumvioletred: [199, 21, 133, 1], midnightblue: [25, 25, 112, 1], mintcream: [245, 255, 250, 1], mistyrose: [255, 228, 225, 1], moccasin: [255, 228, 181, 1], navajowhite: [255, 222, 173, 1], navy: [0, 0, 128, 1], oldlace: [253, 245, 230, 1], olive: [128, 128, 0, 1], olivedrab: [107, 142, 35, 1], orange: [255, 165, 0, 1], orangered: [255, 69, 0, 1], orchid: [218, 112, 214, 1], palegoldenrod: [238, 232, 170, 1], palegreen: [152, 251, 152, 1], paleturquoise: [175, 238, 238, 1], palevioletred: [219, 112, 147, 1], papayawhip: [255, 239, 213, 1], peachpuff: [255, 218, 185, 1], peru: [205, 133, 63, 1], pink: [255, 192, 203, 1], plum: [221, 160, 221, 1], powderblue: [176, 224, 230, 1], purple: [128, 0, 128, 1], red: [255, 0, 0, 1], rosybrown: [188, 143, 143, 1], royalblue: [65, 105, 225, 1], saddlebrown: [139, 69, 19, 1], salmon: [250, 128, 114, 1], sandybrown: [244, 164, 96, 1], seagreen: [46, 139, 87, 1], seashell: [255, 245, 238, 1], sienna: [160, 82, 45, 1], silver: [192, 192, 192, 1], skyblue: [135, 206, 235, 1], slateblue: [106, 90, 205, 1], slategray: [112, 128, 144, 1], slategrey: [112, 128, 144, 1], snow: [255, 250, 250, 1], springgreen: [0, 255, 127, 1], steelblue: [70, 130, 180, 1], tan: [210, 180, 140, 1], teal: [0, 128, 128, 1], thistle: [216, 191, 216, 1], tomato: [255, 99, 71, 1], turquoise: [64, 224, 208, 1], violet: [238, 130, 238, 1], wheat: [245, 222, 179, 1], white: [255, 255, 255, 1], whitesmoke: [245, 245, 245, 1], yellow: [255, 255, 0, 1], yellowgreen: [154, 205, 50, 1] },qp = new Zp(20),jp = null,Up = je,$p = Ue,Kp = (Object.freeze || Object)({ parse: He, lift: Ye, toHex: qe, fastLerp: je, fastMapToColor: Up, lerp: Ue, mapToColor: $p, modifyHSL: $e, modifyAlpha: Ke, stringify: Qe }),Qp = Array.prototype.slice,Jp = function Jp(t, e, n, i) {this._tracks = {}, this._target = t, this._loop = e || !1, this._getter = n || Je, this._setter = i || tn, this._clipCount = 0, this._delay = 0, this._doneList = [], this._onframeList = [], this._clipList = [];};Jp.prototype = { when: function when(t, e) {var n = this._tracks;for (var i in e) {if (e.hasOwnProperty(i)) {if (!n[i]) {n[i] = [];var r = this._getter(this._target, i);if (null == r) continue;0 !== t && n[i].push({ time: 0, value: un(r) });}n[i].push({ time: t, value: e[i] });}}return this;}, during: function during(t) {return this._onframeList.push(t), this;}, pause: function pause() {for (var t = 0; t < this._clipList.length; t++) {this._clipList[t].pause();}this._paused = !0;}, resume: function resume() {for (var t = 0; t < this._clipList.length; t++) {this._clipList[t].resume();}this._paused = !1;}, isPaused: function isPaused() {return !!this._paused;}, _doneCallback: function _doneCallback() {this._tracks = {}, this._clipList.length = 0;for (var t = this._doneList, e = t.length, n = 0; e > n; n++) {t[n].call(this);}}, start: function start(t, e) {var n,i = this,r = 0,a = function a() {r--, r || i._doneCallback();};for (var o in this._tracks) {if (this._tracks.hasOwnProperty(o)) {var s = dn(this, t, a, this._tracks[o], o, e);s && (this._clipList.push(s), r++, this.animation && this.animation.addClip(s), n = s);}}if (n) {var l = n.onframe;n.onframe = function (t, e) {l(t, e);for (var n = 0; n < i._onframeList.length; n++) {i._onframeList[n](t, e);}};}return r || this._doneCallback(), this;}, stop: function stop(t) {for (var e = this._clipList, n = this.animation, i = 0; i < e.length; i++) {var r = e[i];t && r.onframe(this._target, 1), n && n.removeClip(r);}e.length = 0;}, delay: function delay(t) {return this._delay = t, this;}, done: function done(t) {return t && this._doneList.push(t), this;}, getClips: function getClips() {return this._clipList;} };var tg = 1;"undefined" != typeof window && (tg = Math.max(window.devicePixelRatio || 1, 1));var eg = 0,ng = tg,ig = function ig() {};1 === eg ? ig = function ig() {for (var t in arguments) {throw new Error(arguments[t]);}} : eg > 1 && (ig = function ig() {for (var t in arguments) {console.log(arguments[t]);}});var rg = ig,ag = function ag() {this.animators = [];};ag.prototype = { constructor: ag, animate: function animate(t, e) {var n,i = !1,r = this,a = this.__zr;if (t) {var o = t.split("."),s = r;i = "shape" === o[0];for (var l = 0, h = o.length; h > l; l++) {s && (s = s[o[l]]);}s && (n = s);} else n = r;if (!n) return void rg('Property "' + t + '" is not existed in element ' + r.id);var c = r.animators,d = new Jp(n, e);return d.during(function () {r.dirty(i);}).done(function () {c.splice(u(c, d), 1);}), c.push(d), a && a.animation.addAnimator(d), d;}, stopAnimation: function stopAnimation(t) {for (var e = this.animators, n = e.length, i = 0; n > i; i++) {e[i].stop(t);}return e.length = 0, this;}, animateTo: function animateTo(t, e, n, i, r, a) {fn(this, t, e, n, i, r, a);}, animateFrom: function animateFrom(t, e, n, i, r, a) {fn(this, t, e, n, i, r, a, !0);} };var og = function og(t) {Ep.call(this, t), Sp.call(this, t), ag.call(this, t), this.id = t.id || tp();};og.prototype = { type: "element", name: "", __zr: null, ignore: !1, clipPath: null, isGroup: !1, drift: function drift(t, e) {switch (this.draggable) {case "horizontal":e = 0;break;case "vertical":t = 0;}var n = this.transform;n || (n = this.transform = [1, 0, 0, 1, 0, 0]), n[4] += t, n[5] += e, this.decomposeTransform(), this.dirty(!1);}, beforeUpdate: function beforeUpdate() {}, afterUpdate: function afterUpdate() {}, update: function update() {this.updateTransform();}, traverse: function traverse() {}, attrKV: function attrKV(t, e) {if ("position" === t || "scale" === t || "origin" === t) {if (e) {var n = this[t];n || (n = this[t] = []), n[0] = e[0], n[1] = e[1];}} else this[t] = e;}, hide: function hide() {this.ignore = !0, this.__zr && this.__zr.refresh();}, show: function show() {this.ignore = !1, this.__zr && this.__zr.refresh();}, attr: function attr(t, e) {if ("string" == typeof t) this.attrKV(t, e);else if (M(t)) for (var n in t) {t.hasOwnProperty(n) && this.attrKV(n, t[n]);}return this.dirty(!1), this;}, setClipPath: function setClipPath(t) {var e = this.__zr;e && t.addSelfToZr(e), this.clipPath && this.clipPath !== t && this.removeClipPath(), this.clipPath = t, t.__zr = e, t.__clipTarget = this, this.dirty(!1);}, removeClipPath: function removeClipPath() {var t = this.clipPath;t && (t.__zr && t.removeSelfFromZr(t.__zr), t.__zr = null, t.__clipTarget = null, this.clipPath = null, this.dirty(!1));}, addSelfToZr: function addSelfToZr(t) {this.__zr = t;var e = this.animators;if (e) for (var n = 0; n < e.length; n++) {t.animation.addAnimator(e[n]);}this.clipPath && this.clipPath.addSelfToZr(t);}, removeSelfFromZr: function removeSelfFromZr(t) {this.__zr = null;var e = this.animators;if (e) for (var n = 0; n < e.length; n++) {t.animation.removeAnimator(e[n]);}this.clipPath && this.clipPath.removeSelfFromZr(t);} }, c(og, ag), c(og, Ep), c(og, Sp);var sg = ae,lg = Math.min,ug = Math.max;vn.prototype = { constructor: vn, union: function union(t) {var e = lg(t.x, this.x),n = lg(t.y, this.y);this.width = ug(t.x + t.width, this.x + this.width) - e, this.height = ug(t.y + t.height, this.y + this.height) - n, this.x = e, this.y = n;}, applyTransform: function () {var t = [],e = [],n = [],i = [];return function (r) {if (r) {t[0] = n[0] = this.x, t[1] = i[1] = this.y, e[0] = i[0] = this.x + this.width, e[1] = n[1] = this.y + this.height, sg(t, t, r), sg(e, e, r), sg(n, n, r), sg(i, i, r), this.x = lg(t[0], e[0], n[0], i[0]), this.y = lg(t[1], e[1], n[1], i[1]);var a = ug(t[0], e[0], n[0], i[0]),o = ug(t[1], e[1], n[1], i[1]);this.width = a - this.x, this.height = o - this.y;}};}(), calculateTransform: function calculateTransform(t) {var e = this,n = t.width / e.width,i = t.height / e.height,r = be();return Te(r, r, [-e.x, -e.y]), Ce(r, r, [n, i]), Te(r, r, [t.x, t.y]), r;}, intersect: function intersect(t) {if (!t) return !1;t instanceof vn || (t = vn.create(t));var e = this,n = e.x,i = e.x + e.width,r = e.y,a = e.y + e.height,o = t.x,s = t.x + t.width,l = t.y,u = t.y + t.height;return !(o > i || n > s || l > a || r > u);}, contain: function contain(t, e) {var n = this;return t >= n.x && t <= n.x + n.width && e >= n.y && e <= n.y + n.height;}, clone: function clone() {return new vn(this.x, this.y, this.width, this.height);}, copy: function copy(t) {this.x = t.x, this.y = t.y, this.width = t.width, this.height = t.height;}, plain: function plain() {return { x: this.x, y: this.y, width: this.width, height: this.height };} }, vn.create = function (t) {return new vn(t.x, t.y, t.width, t.height);};var hg = function hg(t) {t = t || {}, og.call(this, t);for (var e in t) {t.hasOwnProperty(e) && (this[e] = t[e]);}this._children = [], this.__storage = null, this.__dirty = !0;};hg.prototype = { constructor: hg, isGroup: !0, type: "group", silent: !1, children: function children() {return this._children.slice();}, childAt: function childAt(t) {return this._children[t];}, childOfName: function childOfName(t) {for (var e = this._children, n = 0; n < e.length; n++) {if (e[n].name === t) return e[n];}}, childCount: function childCount() {return this._children.length;}, add: function add(t) {return t && t !== this && t.parent !== this && (this._children.push(t), this._doAdd(t)), this;}, addBefore: function addBefore(t, e) {if (t && t !== this && t.parent !== this && e && e.parent === this) {var n = this._children,i = n.indexOf(e);i >= 0 && (n.splice(i, 0, t), this._doAdd(t));}return this;}, _doAdd: function _doAdd(t) {t.parent && t.parent.remove(t), t.parent = this;var e = this.__storage,n = this.__zr;e && e !== t.__storage && (e.addToStorage(t), t instanceof hg && t.addChildrenToStorage(e)), n && n.refresh();}, remove: function remove(t) {var e = this.__zr,n = this.__storage,i = this._children,r = u(i, t);return 0 > r ? this : (i.splice(r, 1), t.parent = null, n && (n.delFromStorage(t), t instanceof hg && t.delChildrenFromStorage(n)), e && e.refresh(), this);}, removeAll: function removeAll() {var t,e,n = this._children,i = this.__storage;for (e = 0; e < n.length; e++) {t = n[e], i && (i.delFromStorage(t), t instanceof hg && t.delChildrenFromStorage(i)), t.parent = null;}return n.length = 0, this;}, eachChild: function eachChild(t, e) {for (var n = this._children, i = 0; i < n.length; i++) {var r = n[i];t.call(e, r, i);}return this;}, traverse: function traverse(t, e) {for (var n = 0; n < this._children.length; n++) {var i = this._children[n];t.call(e, i), "group" === i.type && i.traverse(t, e);}return this;}, addChildrenToStorage: function addChildrenToStorage(t) {for (var e = 0; e < this._children.length; e++) {var n = this._children[e];t.addToStorage(n), n instanceof hg && n.addChildrenToStorage(t);}}, delChildrenFromStorage: function delChildrenFromStorage(t) {for (var e = 0; e < this._children.length; e++) {var n = this._children[e];t.delFromStorage(n), n instanceof hg && n.delChildrenFromStorage(t);}}, dirty: function dirty() {return this.__dirty = !0, this.__zr && this.__zr.refresh(), this;}, getBoundingRect: function getBoundingRect(t) {for (var e = null, n = new vn(0, 0, 0, 0), i = t || this._children, r = [], a = 0; a < i.length; a++) {var o = i[a];if (!o.ignore && !o.invisible) {var s = o.getBoundingRect(),l = o.getLocalTransform(r);l ? (n.copy(s), n.applyTransform(l), e = e || n.clone(), e.union(n)) : (e = e || s.clone(), e.union(s));}}return e || n;} }, h(hg, og);var cg = 32,dg = 7,fg = function fg() {this._roots = [], this._displayList = [], this._displayListLen = 0;};fg.prototype = { constructor: fg, traverse: function traverse(t, e) {for (var n = 0; n < this._roots.length; n++) {this._roots[n].traverse(t, e);}}, getDisplayList: function getDisplayList(t, e) {return e = e || !1, t && this.updateDisplayList(e), this._displayList;}, updateDisplayList: function updateDisplayList(t) {this._displayListLen = 0;for (var e = this._roots, n = this._displayList, i = 0, r = e.length; r > i; i++) {this._updateAndAddDisplayable(e[i], null, t);}n.length = this._displayListLen, np.canvasSupported && Sn(n, In);}, _updateAndAddDisplayable: function _updateAndAddDisplayable(t, e, n) {if (!t.ignore || n) {t.beforeUpdate(), t.__dirty && t.update(), t.afterUpdate();var i = t.clipPath;if (i) {e = e ? e.slice() : [];for (var r = i, a = t; r;) {r.parent = a, r.updateTransform(), e.push(r), a = r, r = r.clipPath;}}if (t.isGroup) {for (var o = t._children, s = 0; s < o.length; s++) {var l = o[s];t.__dirty && (l.__dirty = !0), this._updateAndAddDisplayable(l, e, n);}t.__dirty = !1;} else t.__clipPaths = e, this._displayList[this._displayListLen++] = t;}}, addRoot: function addRoot(t) {t.__storage !== this && (t instanceof hg && t.addChildrenToStorage(this), this.addToStorage(t), this._roots.push(t));}, delRoot: function delRoot(t) {if (null == t) {for (var e = 0; e < this._roots.length; e++) {var n = this._roots[e];n instanceof hg && n.delChildrenFromStorage(this);}return this._roots = [], this._displayList = [], void (this._displayListLen = 0);}if (t instanceof Array) for (var e = 0, i = t.length; i > e; e++) {this.delRoot(t[e]);} else {var r = u(this._roots, t);r >= 0 && (this.delFromStorage(t), this._roots.splice(r, 1), t instanceof hg && t.delChildrenFromStorage(this));}}, addToStorage: function addToStorage(t) {return t && (t.__storage = this, t.dirty(!1)), this;}, delFromStorage: function delFromStorage(t) {return t && (t.__storage = null), this;}, dispose: function dispose() {this._renderList = this._roots = null;}, displayableSortFunc: In };var pg = { shadowBlur: 1, shadowOffsetX: 1, shadowOffsetY: 1, textShadowBlur: 1, textShadowOffsetX: 1, textShadowOffsetY: 1, textBoxShadowBlur: 1, textBoxShadowOffsetX: 1, textBoxShadowOffsetY: 1 },gg = function gg(t, e, n) {return pg.hasOwnProperty(e) ? n *= t.dpr : n;},vg = [["shadowBlur", 0], ["shadowOffsetX", 0], ["shadowOffsetY", 0], ["shadowColor", "#000"], ["lineCap", "butt"], ["lineJoin", "miter"], ["miterLimit", 10]],mg = function mg(t) {this.extendFrom(t, !1);};mg.prototype = { constructor: mg, fill: "#000", stroke: null, opacity: 1, fillOpacity: null, strokeOpacity: null, lineDash: null, lineDashOffset: 0, shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, lineWidth: 1, strokeNoScale: !1, text: null, font: null, textFont: null, fontStyle: null, fontWeight: null, fontSize: null, fontFamily: null, textTag: null, textFill: "#000", textStroke: null, textWidth: null, textHeight: null, textStrokeWidth: 0, textLineHeight: null, textPosition: "inside", textRect: null, textOffset: null, textAlign: null, textVerticalAlign: null, textDistance: 5, textShadowColor: "transparent", textShadowBlur: 0, textShadowOffsetX: 0, textShadowOffsetY: 0, textBoxShadowColor: "transparent", textBoxShadowBlur: 0, textBoxShadowOffsetX: 0, textBoxShadowOffsetY: 0, transformText: !1, textRotation: 0, textOrigin: null, textBackgroundColor: null, textBorderColor: null, textBorderWidth: 0, textBorderRadius: 0, textPadding: null, rich: null, truncate: null, blend: null, bind: function bind(t, e, n) {for (var i = this, r = n && n.style, a = !r, o = 0; o < vg.length; o++) {var s = vg[o],l = s[0];(a || i[l] !== r[l]) && (t[l] = gg(t, l, i[l] || s[1]));}if ((a || i.fill !== r.fill) && (t.fillStyle = i.fill), (a || i.stroke !== r.stroke) && (t.strokeStyle = i.stroke), (a || i.opacity !== r.opacity) && (t.globalAlpha = null == i.opacity ? 1 : i.opacity), (a || i.blend !== r.blend) && (t.globalCompositeOperation = i.blend || "source-over"), this.hasStroke()) {var u = i.lineWidth;t.lineWidth = u / (this.strokeNoScale && e && e.getLineScale ? e.getLineScale() : 1);}}, hasFill: function hasFill() {var t = this.fill;return null != t && "none" !== t;}, hasStroke: function hasStroke() {var t = this.stroke;return null != t && "none" !== t && this.lineWidth > 0;}, extendFrom: function extendFrom(t, e) {if (t) for (var n in t) {!t.hasOwnProperty(n) || e !== !0 && (e === !1 ? this.hasOwnProperty(n) : null == t[n]) || (this[n] = t[n]);}}, set: function set(t, e) {"string" == typeof t ? this[t] = e : this.extendFrom(t, !0);}, clone: function clone() {var t = new this.constructor();return t.extendFrom(this, !0), t;}, getGradient: function getGradient(t, e, n) {for (var i = "radial" === e.type ? An : Tn, r = i(t, e, n), a = e.colorStops, o = 0; o < a.length; o++) {r.addColorStop(a[o].offset, a[o].color);}return r;} };for (var yg = mg.prototype, xg = 0; xg < vg.length; xg++) {var _g = vg[xg];_g[0] in yg || (yg[_g[0]] = _g[1]);}mg.getGradient = yg.getGradient;var wg = function wg(t, e) {this.image = t, this.repeat = e, this.type = "pattern";};wg.prototype.getCanvasPattern = function (t) {return t.createPattern(this.image, this.repeat || "repeat");};var bg = function bg(t, e, n) {var i;n = n || ng, "string" == typeof t ? i = Dn(t, e, n) : M(t) && (i = t, t = i.id), this.id = t, this.dom = i;var r = i.style;r && (i.onselectstart = Cn, r["-webkit-user-select"] = "none", r["user-select"] = "none", r["-webkit-touch-callout"] = "none", r["-webkit-tap-highlight-color"] = "rgba(0,0,0,0)", r.padding = 0, r.margin = 0, r["border-width"] = 0), this.domBack = null, this.ctxBack = null, this.painter = e, this.config = null, this.clearColor = 0, this.motionBlur = !1, this.lastFrameAlpha = .7, this.dpr = n;};bg.prototype = { constructor: bg, __dirty: !0, __used: !1, __drawIndex: 0, __startIndex: 0, __endIndex: 0, incremental: !1, getElementCount: function getElementCount() {return this.__endIndex - this.__startIndex;}, initContext: function initContext() {this.ctx = this.dom.getContext("2d"), this.ctx.dpr = this.dpr;}, createBackBuffer: function createBackBuffer() {var t = this.dpr;this.domBack = Dn("back-" + this.id, this.painter, t), this.ctxBack = this.domBack.getContext("2d"), 1 != t && this.ctxBack.scale(t, t);}, resize: function resize(t, e) {var n = this.dpr,i = this.dom,r = i.style,a = this.domBack;r && (r.width = t + "px", r.height = e + "px"), i.width = t * n, i.height = e * n, a && (a.width = t * n, a.height = e * n, 1 != n && this.ctxBack.scale(n, n));}, clear: function clear(t, e) {var n = this.dom,i = this.ctx,r = n.width,a = n.height,e = e || this.clearColor,o = this.motionBlur && !t,s = this.lastFrameAlpha,l = this.dpr;if (o && (this.domBack || this.createBackBuffer(), this.ctxBack.globalCompositeOperation = "copy", this.ctxBack.drawImage(n, 0, 0, r / l, a / l)), i.clearRect(0, 0, r, a), e && "transparent" !== e) {var u;e.colorStops ? (u = e.__canvasGradient || mg.getGradient(i, e, { x: 0, y: 0, width: r, height: a }), e.__canvasGradient = u) : e.image && (u = wg.prototype.getCanvasPattern.call(e, i)), i.save(), i.fillStyle = u || e, i.fillRect(0, 0, r, a), i.restore();}if (o) {var h = this.domBack;i.save(), i.globalAlpha = s, i.drawImage(h, 0, 0, r, a), i.restore();}} };var Mg = "undefined" != typeof window && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function (t) {setTimeout(t, 16);},Sg = new Zp(50),Ig = {},Tg = 0,Ag = 5e3,Cg = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g,Dg = "12px sans-serif",kg = {};kg.measureText = function (t, e) {var n = l();return n.font = e || Dg, n.measureText(t);};var Pg = { left: 1, right: 1, center: 1 },Lg = { top: 1, bottom: 1, middle: 1 },Og = [["textShadowBlur", "shadowBlur", 0], ["textShadowOffsetX", "shadowOffsetX", 0], ["textShadowOffsetY", "shadowOffsetY", 0], ["textShadowColor", "shadowColor", "transparent"]],zg = new vn(),Eg = function Eg() {};Eg.prototype = { constructor: Eg, drawRectText: function drawRectText(t, e) {var n = this.style;e = n.textRect || e, this.__dirty && Qn(n, !0);var i = n.text;if (null != i && (i += ""), gi(i, n)) {t.save();var r = this.transform;n.transformText ? this.setTransform(t) : r && (zg.copy(e), zg.applyTransform(r), e = zg), ti(this, t, i, n, e), t.restore();}} }, vi.prototype = { constructor: vi, type: "displayable", __dirty: !0, invisible: !1, z: 0, z2: 0, zlevel: 0, draggable: !1, dragging: !1, silent: !1, culling: !1, cursor: "pointer", rectHover: !1, progressive: !1, incremental: !1, globalScaleRatio: 1, beforeBrush: function beforeBrush() {}, afterBrush: function afterBrush() {}, brush: function brush() {}, getBoundingRect: function getBoundingRect() {}, contain: function contain(t, e) {return this.rectContain(t, e);}, traverse: function traverse(t, e) {t.call(e, this);}, rectContain: function rectContain(t, e) {var n = this.transformCoordToLocal(t, e),i = this.getBoundingRect();return i.contain(n[0], n[1]);}, dirty: function dirty() {this.__dirty = this.__dirtyText = !0, this._rect = null, this.__zr && this.__zr.refresh();}, animateStyle: function animateStyle(t) {return this.animate("style", t);}, attrKV: function attrKV(t, e) {"style" !== t ? og.prototype.attrKV.call(this, t, e) : this.style.set(e);}, setStyle: function setStyle(t, e) {return this.style.set(t, e), this.dirty(!1), this;}, useStyle: function useStyle(t) {return this.style = new mg(t, this), this.dirty(!1), this;} }, h(vi, og), c(vi, Eg), mi.prototype = { constructor: mi, type: "image", brush: function brush(t, e) {var n = this.style,i = n.image;n.bind(t, this, e);var r = this._image = Pn(i, this._image, this, this.onload);if (r && On(r)) {var a = n.x || 0,o = n.y || 0,s = n.width,l = n.height,u = r.width / r.height;if (null == s && null != l ? s = l * u : null == l && null != s ? l = s / u : null == s && null == l && (s = r.width, l = r.height), this.setTransform(t), n.sWidth && n.sHeight) {var h = n.sx || 0,c = n.sy || 0;t.drawImage(r, h, c, n.sWidth, n.sHeight, a, o, s, l);} else if (n.sx && n.sy) {var h = n.sx,c = n.sy,d = s - h,f = l - c;t.drawImage(r, h, c, d, f, a, o, s, l);} else t.drawImage(r, a, o, s, l);null != n.text && (this.restoreTransform(t), this.drawRectText(t, this.getBoundingRect()));}}, getBoundingRect: function getBoundingRect() {var t = this.style;return this._rect || (this._rect = new vn(t.x || 0, t.y || 0, t.width || 0, t.height || 0)), this._rect;} }, h(mi, vi);var Bg = 1e5,Rg = 314159,Ng = .01,Fg = .001,Vg = new vn(0, 0, 0, 0),Wg = new vn(0, 0, 0, 0),Gg = function Gg(t, e, n) {this.type = "canvas";var i = !t.nodeName || "CANVAS" === t.nodeName.toUpperCase();this._opts = n = o({}, n || {}), this.dpr = n.devicePixelRatio || ng, this._singleCanvas = i, this.root = t;var r = t.style;r && (r["-webkit-tap-highlight-color"] = "transparent", r["-webkit-user-select"] = r["user-select"] = r["-webkit-touch-callout"] = "none", t.innerHTML = ""), this.storage = e;var a = this._zlevelList = [],s = this._layers = {};if (this._layerConfig = {}, this._needsManuallyCompositing = !1, i) {var l = t.width,u = t.height;null != n.width && (l = n.width), null != n.height && (u = n.height), this.dpr = n.devicePixelRatio || 1, t.width = l * this.dpr, t.height = u * this.dpr, this._width = l, this._height = u;var h = new bg(t, this, this.dpr);h.__builtin__ = !0, h.initContext(), s[Rg] = h, h.zlevel = Rg, a.push(Rg), this._domRoot = t;} else {this._width = this._getSize(0), this._height = this._getSize(1);var c = this._domRoot = Mi(this._width, this._height);t.appendChild(c);}this._hoverlayer = null, this._hoverElements = [];};Gg.prototype = { constructor: Gg, getType: function getType() {return "canvas";}, isSingleCanvas: function isSingleCanvas() {return this._singleCanvas;}, getViewportRoot: function getViewportRoot() {return this._domRoot;}, getViewportRootOffset: function getViewportRootOffset() {var t = this.getViewportRoot();return t ? { offsetLeft: t.offsetLeft || 0, offsetTop: t.offsetTop || 0 } : void 0;}, refresh: function refresh(t) {var e = this.storage.getDisplayList(!0),n = this._zlevelList;this._redrawId = Math.random(), this._paintList(e, t, this._redrawId);for (var i = 0; i < n.length; i++) {var r = n[i],a = this._layers[r];if (!a.__builtin__ && a.refresh) {var o = 0 === i ? this._backgroundColor : null;a.refresh(o);}}return this.refreshHover(), this;}, addHover: function addHover(t, e) {if (!t.__hoverMir) {var n = new t.constructor({ style: t.style, shape: t.shape, z: t.z, z2: t.z2, silent: t.silent });return n.__from = t, t.__hoverMir = n, e && n.setStyle(e), this._hoverElements.push(n), n;}}, removeHover: function removeHover(t) {var e = t.__hoverMir,n = this._hoverElements,i = u(n, e);i >= 0 && n.splice(i, 1), t.__hoverMir = null;}, clearHover: function clearHover() {for (var t = this._hoverElements, e = 0; e < t.length; e++) {var n = t[e].__from;n && (n.__hoverMir = null);}t.length = 0;}, refreshHover: function refreshHover() {var t = this._hoverElements,e = t.length,n = this._hoverlayer;if (n && n.clear(), e) {Sn(t, this.storage.displayableSortFunc), n || (n = this._hoverlayer = this.getLayer(Bg));var i = {};n.ctx.save();for (var r = 0; e > r;) {var a = t[r],o = a.__from;o && o.__zr ? (r++, o.invisible || (a.transform = o.transform, a.invTransform = o.invTransform, a.__clipPaths = o.__clipPaths, this._doPaintEl(a, n, !0, i))) : (t.splice(r, 1), o.__hoverMir = null, e--);}n.ctx.restore();}}, getHoverLayer: function getHoverLayer() {return this.getLayer(Bg);}, _paintList: function _paintList(t, e, n) {if (this._redrawId === n) {e = e || !1, this._updateLayerStatus(t);var i = this._doPaintList(t, e);if (this._needsManuallyCompositing && this._compositeManually(), !i) {var r = this;Mg(function () {r._paintList(t, e, n);});}}}, _compositeManually: function _compositeManually() {var t = this.getLayer(Rg).ctx,e = this._domRoot.width,n = this._domRoot.height;t.clearRect(0, 0, e, n), this.eachBuiltinLayer(function (i) {i.virtual && t.drawImage(i.dom, 0, 0, e, n);});}, _doPaintList: function _doPaintList(t, e) {for (var n = [], i = 0; i < this._zlevelList.length; i++) {var r = this._zlevelList[i],a = this._layers[r];a.__builtin__ && a !== this._hoverlayer && (a.__dirty || e) && n.push(a);}for (var o = !0, s = 0; s < n.length; s++) {var a = n[s],l = a.ctx,u = {};l.save();var h = e ? a.__startIndex : a.__drawIndex,c = !e && a.incremental && Date.now,d = c && Date.now(),p = a.zlevel === this._zlevelList[0] ? this._backgroundColor : null;if (a.__startIndex === a.__endIndex) a.clear(!1, p);else if (h === a.__startIndex) {var g = t[h];g.incremental && g.notClear && !e || a.clear(!1, p);}-1 === h && (console.error("For some unknown reason. drawIndex is -1"), h = a.__startIndex);for (var v = h; v < a.__endIndex; v++) {var m = t[v];if (this._doPaintEl(m, a, e, u), m.__dirty = m.__dirtyText = !1, c) {var y = Date.now() - d;if (y > 15) break;}}a.__drawIndex = v, a.__drawIndex < a.__endIndex && (o = !1), u.prevElClipPaths && l.restore(), l.restore();}return np.wxa && f(this._layers, function (t) {t && t.ctx && t.ctx.draw && t.ctx.draw();}), o;}, _doPaintEl: function _doPaintEl(t, e, n, i) {var r = e.ctx,a = t.transform;if (!(!e.__dirty && !n || t.invisible || 0 === t.style.opacity || a && !a[0] && !a[3] || t.culling && _i(t, this._width, this._height))) {var o = t.__clipPaths;(!i.prevElClipPaths || wi(o, i.prevElClipPaths)) && (i.prevElClipPaths && (e.ctx.restore(), i.prevElClipPaths = null, i.prevEl = null), o && (r.save(), bi(o, r), i.prevElClipPaths = o)), t.beforeBrush && t.beforeBrush(r), t.brush(r, i.prevEl || null), i.prevEl = t, t.afterBrush && t.afterBrush(r);}}, getLayer: function getLayer(t, e) {this._singleCanvas && !this._needsManuallyCompositing && (t = Rg);var n = this._layers[t];return n || (n = new bg("zr_" + t, this, this.dpr), n.zlevel = t, n.__builtin__ = !0, this._layerConfig[t] && r(n, this._layerConfig[t], !0), e && (n.virtual = e), this.insertLayer(t, n), n.initContext()), n;}, insertLayer: function insertLayer(t, e) {var n = this._layers,i = this._zlevelList,r = i.length,a = null,o = -1,s = this._domRoot;if (n[t]) return void rg("ZLevel " + t + " has been used already");if (!xi(e)) return void rg("Layer of zlevel " + t + " is not valid");if (r > 0 && t > i[0]) {for (o = 0; r - 1 > o && !(i[o] < t && i[o + 1] > t); o++) {;}a = n[i[o]];}if (i.splice(o + 1, 0, t), n[t] = e, !e.virtual) if (a) {var l = a.dom;l.nextSibling ? s.insertBefore(e.dom, l.nextSibling) : s.appendChild(e.dom);} else s.firstChild ? s.insertBefore(e.dom, s.firstChild) : s.appendChild(e.dom);}, eachLayer: function eachLayer(t, e) {var n,i,r = this._zlevelList;for (i = 0; i < r.length; i++) {n = r[i], t.call(e, this._layers[n], n);}}, eachBuiltinLayer: function eachBuiltinLayer(t, e) {var n,i,r,a = this._zlevelList;for (r = 0; r < a.length; r++) {i = a[r], n = this._layers[i], n.__builtin__ && t.call(e, n, i);}}, eachOtherLayer: function eachOtherLayer(t, e) {var n,i,r,a = this._zlevelList;for (r = 0; r < a.length; r++) {i = a[r], n = this._layers[i], n.__builtin__ || t.call(e, n, i);}}, getLayers: function getLayers() {return this._layers;}, _updateLayerStatus: function _updateLayerStatus(t) {function e(t) {r && (r.__endIndex !== t && (r.__dirty = !0), r.__endIndex = t);}if (this.eachBuiltinLayer(function (t) {t.__dirty = t.__used = !1;}), this._singleCanvas) for (var n = 1; n < t.length; n++) {var i = t[n];if (i.zlevel !== t[n - 1].zlevel || i.incremental) {this._needsManuallyCompositing = !0;break;}}for (var r = null, a = 0, n = 0; n < t.length; n++) {var o,i = t[n],s = i.zlevel;i.incremental ? (o = this.getLayer(s + Fg, this._needsManuallyCompositing), o.incremental = !0, a = 1) : o = this.getLayer(s + (a > 0 ? Ng : 0), this._needsManuallyCompositing), o.__builtin__ || rg("ZLevel " + s + " has been used by unkown layer " + o.id), o !== r && (o.__used = !0, o.__startIndex !== n && (o.__dirty = !0), o.__startIndex = n, o.__drawIndex = o.incremental ? -1 : n, e(n), r = o), i.__dirty && (o.__dirty = !0, o.incremental && o.__drawIndex < 0 && (o.__drawIndex = n));}e(n), this.eachBuiltinLayer(function (t) {!t.__used && t.getElementCount() > 0 && (t.__dirty = !0, t.__startIndex = t.__endIndex = t.__drawIndex = 0), t.__dirty && t.__drawIndex < 0 && (t.__drawIndex = t.__startIndex);});}, clear: function clear() {return this.eachBuiltinLayer(this._clearLayer), this;}, _clearLayer: function _clearLayer(t) {t.clear();}, setBackgroundColor: function setBackgroundColor(t) {this._backgroundColor = t;}, configLayer: function configLayer(t, e) {if (e) {var n = this._layerConfig;n[t] ? r(n[t], e, !0) : n[t] = e;for (var i = 0; i < this._zlevelList.length; i++) {var a = this._zlevelList[i];if (a === t || a === t + Ng) {var o = this._layers[a];r(o, n[t], !0);}}}}, delLayer: function delLayer(t) {var e = this._layers,n = this._zlevelList,i = e[t];i && (i.dom.parentNode.removeChild(i.dom), delete e[t], n.splice(u(n, t), 1));}, resize: function resize(t, e) {if (this._domRoot.style) {var n = this._domRoot;n.style.display = "none";var i = this._opts;if (null != t && (i.width = t), null != e && (i.height = e), t = this._getSize(0), e = this._getSize(1), n.style.display = "", this._width != t || e != this._height) {n.style.width = t + "px", n.style.height = e + "px";for (var r in this._layers) {this._layers.hasOwnProperty(r) && this._layers[r].resize(t, e);}f(this._progressiveLayers, function (n) {n.resize(t, e);}), this.refresh(!0);}this._width = t, this._height = e;} else {if (null == t || null == e) return;this._width = t, this._height = e, this.getLayer(Rg).resize(t, e);}return this;}, clearLayer: function clearLayer(t) {var e = this._layers[t];e && e.clear();}, dispose: function dispose() {this.root.innerHTML = "", this.root = this.storage = this._domRoot = this._layers = null;}, getRenderedCanvas: function getRenderedCanvas(t) {if (t = t || {}, this._singleCanvas && !this._compositeManually) return this._layers[Rg].dom;var e = new bg("image", this, t.pixelRatio || this.dpr);if (e.initContext(), e.clear(!1, t.backgroundColor || this._backgroundColor), t.pixelRatio <= this.dpr) {this.refresh();var n = e.dom.width,i = e.dom.height,r = e.ctx;this.eachLayer(function (t) {t.__builtin__ ? r.drawImage(t.dom, 0, 0, n, i) : t.renderToCanvas && (e.ctx.save(), t.renderToCanvas(e.ctx), e.ctx.restore());});} else for (var a = {}, o = this.storage.getDisplayList(!0), s = 0; s < o.length; s++) {var l = o[s];this._doPaintEl(l, e, !0, a);}return e.dom;}, getWidth: function getWidth() {return this._width;}, getHeight: function getHeight() {return this._height;}, _getSize: function _getSize(t) {var e = this._opts,n = ["width", "height"][t],i = ["clientWidth", "clientHeight"][t],r = ["paddingLeft", "paddingTop"][t],a = ["paddingRight", "paddingBottom"][t];if (null != e[n] && "auto" !== e[n]) return parseFloat(e[n]);var o = this.root,s = document.defaultView.getComputedStyle(o);return (o[i] || yi(s[n]) || yi(o.style[n])) - (yi(s[r]) || 0) - (yi(s[a]) || 0) | 0;}, pathToImage: function pathToImage(t, e) {e = e || this.dpr;var n = document.createElement("canvas"),i = n.getContext("2d"),r = t.getBoundingRect(),a = t.style,o = a.shadowBlur * e,s = a.shadowOffsetX * e,l = a.shadowOffsetY * e,u = a.hasStroke() ? a.lineWidth : 0,h = Math.max(u / 2, -s + o),c = Math.max(u / 2, s + o),d = Math.max(u / 2, -l + o),f = Math.max(u / 2, l + o),p = r.width + h + c,g = r.height + d + f;n.width = p * e, n.height = g * e, i.scale(e, e), i.clearRect(0, 0, p, g), i.dpr = e;var v = { position: t.position, rotation: t.rotation, scale: t.scale };t.position = [h - r.x, d - r.y], t.rotation = 0, t.scale = [1, 1], t.updateTransform(), t && t.brush(i);var m = mi,y = new m({ style: { x: 0, y: 0, image: n } });return null != v.position && (y.position = t.position = v.position), null != v.rotation && (y.rotation = t.rotation = v.rotation), null != v.scale && (y.scale = t.scale = v.scale), y;} };var Hg = function Hg(t) {t = t || {}, this.stage = t.stage || {}, this.onframe = t.onframe || function () {}, this._clips = [], this._running = !1, this._time, this._pausedTime, this._pauseStart, this._paused = !1, Sp.call(this);};Hg.prototype = { constructor: Hg, addClip: function addClip(t) {this._clips.push(t);}, addAnimator: function addAnimator(t) {t.animation = this;for (var e = t.getClips(), n = 0; n < e.length; n++) {this.addClip(e[n]);}}, removeClip: function removeClip(t) {var e = u(this._clips, t);
      e >= 0 && this._clips.splice(e, 1);}, removeAnimator: function removeAnimator(t) {for (var e = t.getClips(), n = 0; n < e.length; n++) {this.removeClip(e[n]);}t.animation = null;}, _update: function _update() {for (var t = new Date().getTime() - this._pausedTime, e = t - this._time, n = this._clips, i = n.length, r = [], a = [], o = 0; i > o; o++) {var s = n[o],l = s.step(t, e);l && (r.push(l), a.push(s));}for (var o = 0; i > o;) {n[o]._needsRemove ? (n[o] = n[i - 1], n.pop(), i--) : o++;}i = r.length;for (var o = 0; i > o; o++) {a[o].fire(r[o]);}this._time = t, this.onframe(e), this.trigger("frame", e), this.stage.update && this.stage.update();}, _startLoop: function _startLoop() {function t() {e._running && (Mg(t), !e._paused && e._update());}var e = this;this._running = !0, Mg(t);}, start: function start() {this._time = new Date().getTime(), this._pausedTime = 0, this._startLoop();}, stop: function stop() {this._running = !1;}, pause: function pause() {this._paused || (this._pauseStart = new Date().getTime(), this._paused = !0);}, resume: function resume() {this._paused && (this._pausedTime += new Date().getTime() - this._pauseStart, this._paused = !1);}, clear: function clear() {this._clips = [];}, isFinished: function isFinished() {return !this._clips.length;}, animate: function animate(t, e) {e = e || {};var n = new Jp(t, e.loop, e.getter, e.setter);return this.addAnimator(n), n;} }, c(Hg, Sp);var Zg = function Zg() {this._track = [];};Zg.prototype = { constructor: Zg, recognize: function recognize(t, e, n) {return this._doTrack(t, e, n), this._recognize(t);}, clear: function clear() {return this._track.length = 0, this;}, _doTrack: function _doTrack(t, e, n) {var i = t.touches;if (i) {for (var r = { points: [], touches: [], target: e, event: t }, a = 0, o = i.length; o > a; a++) {var s = i[a],l = de(n, s, {});r.points.push([l.zrX, l.zrY]), r.touches.push(s);}this._track.push(r);}}, _recognize: function _recognize(t) {for (var e in Xg) {if (Xg.hasOwnProperty(e)) {var n = Xg[e](this._track, t);if (n) return n;}}} };var Xg = { pinch: function pinch(t, e) {var n = t.length;if (n) {var i = (t[n - 1] || {}).points,r = (t[n - 2] || {}).points || i;if (r && r.length > 1 && i && i.length > 1) {var a = Si(i) / Si(r);!isFinite(a) && (a = 1), e.pinchScale = a;var o = Ii(i);return e.pinchX = o[0], e.pinchY = o[1], { type: "pinch", target: t[0].target, event: e };}}} },Yg = 300,qg = ["click", "dblclick", "mousewheel", "mouseout", "mouseup", "mousedown", "mousemove", "contextmenu"],jg = ["touchstart", "touchend", "touchmove"],Ug = { pointerdown: 1, pointerup: 1, pointermove: 1, pointerout: 1 },$g = p(qg, function (t) {var e = t.replace("mouse", "pointer");return Ug[e] ? e : t;}),Kg = { mousemove: function mousemove(t) {t = pe(this.dom, t), this.trigger("mousemove", t);}, mouseout: function mouseout(t) {t = pe(this.dom, t);var e = t.toElement || t.relatedTarget;if (e != this.dom) for (; e && 9 != e.nodeType;) {if (e === this.dom) return;e = e.parentNode;}this.trigger("mouseout", t);}, touchstart: function touchstart(t) {t = pe(this.dom, t), t.zrByTouch = !0, this._lastTouchMoment = new Date(), Ai(this, t, "start"), Kg.mousemove.call(this, t), Kg.mousedown.call(this, t), Ci(this);}, touchmove: function touchmove(t) {t = pe(this.dom, t), t.zrByTouch = !0, Ai(this, t, "change"), Kg.mousemove.call(this, t), Ci(this);}, touchend: function touchend(t) {t = pe(this.dom, t), t.zrByTouch = !0, Ai(this, t, "end"), Kg.mouseup.call(this, t), +new Date() - this._lastTouchMoment < Yg && Kg.click.call(this, t), Ci(this);}, pointerdown: function pointerdown(t) {Kg.mousedown.call(this, t);}, pointermove: function pointermove(t) {Di(t) || Kg.mousemove.call(this, t);}, pointerup: function pointerup(t) {Kg.mouseup.call(this, t);}, pointerout: function pointerout(t) {Di(t) || Kg.mouseout.call(this, t);} };f(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function (t) {Kg[t] = function (e) {e = pe(this.dom, e), this.trigger(t, e);};});var Qg = Pi.prototype;Qg.dispose = function () {for (var t = qg.concat(jg), e = 0; e < t.length; e++) {var n = t[e];ve(this.dom, Ti(n), this._handlers[n]);}}, Qg.setCursor = function (t) {this.dom.style && (this.dom.style.cursor = t || "default");}, c(Pi, Sp);var Jg = !np.canvasSupported,tv = { canvas: Gg },ev = {},nv = "4.0.5",iv = function iv(t, e, n) {n = n || {}, this.dom = e, this.id = t;var i = this,r = new fg(),a = n.renderer;if (Jg) {if (!tv.vml) throw new Error("You need to require 'zrender/vml/vml' to support IE8");a = "vml";} else a && tv[a] || (a = "canvas");var o = new tv[a](e, r, n, t);this.storage = r, this.painter = o;var s = np.node || np.worker ? null : new Pi(o.getViewportRoot());this.handler = new kp(r, o, s, o.root), this.animation = new Hg({ stage: { update: y(this.flush, this) } }), this.animation.start(), this._needsRefresh;var l = r.delFromStorage,u = r.addToStorage;r.delFromStorage = function (t) {l.call(r, t), t && t.removeSelfFromZr(i);}, r.addToStorage = function (t) {u.call(r, t), t.addSelfToZr(i);};};iv.prototype = { constructor: iv, getId: function getId() {return this.id;}, add: function add(t) {this.storage.addRoot(t), this._needsRefresh = !0;}, remove: function remove(t) {this.storage.delRoot(t), this._needsRefresh = !0;}, configLayer: function configLayer(t, e) {this.painter.configLayer && this.painter.configLayer(t, e), this._needsRefresh = !0;}, setBackgroundColor: function setBackgroundColor(t) {this.painter.setBackgroundColor && this.painter.setBackgroundColor(t), this._needsRefresh = !0;}, refreshImmediately: function refreshImmediately() {this._needsRefresh = !1, this.painter.refresh(), this._needsRefresh = !1;}, refresh: function refresh() {this._needsRefresh = !0;}, flush: function flush() {var t;this._needsRefresh && (t = !0, this.refreshImmediately()), this._needsRefreshHover && (t = !0, this.refreshHoverImmediately()), t && this.trigger("rendered");}, addHover: function addHover(t, e) {if (this.painter.addHover) {var n = this.painter.addHover(t, e);return this.refreshHover(), n;}}, removeHover: function removeHover(t) {this.painter.removeHover && (this.painter.removeHover(t), this.refreshHover());}, clearHover: function clearHover() {this.painter.clearHover && (this.painter.clearHover(), this.refreshHover());}, refreshHover: function refreshHover() {this._needsRefreshHover = !0;}, refreshHoverImmediately: function refreshHoverImmediately() {this._needsRefreshHover = !1, this.painter.refreshHover && this.painter.refreshHover();}, resize: function resize(t) {t = t || {}, this.painter.resize(t.width, t.height), this.handler.resize();}, clearAnimation: function clearAnimation() {this.animation.clear();}, getWidth: function getWidth() {return this.painter.getWidth();}, getHeight: function getHeight() {return this.painter.getHeight();}, pathToImage: function pathToImage(t, e) {return this.painter.pathToImage(t, e);}, setCursorStyle: function setCursorStyle(t) {this.handler.setCursorStyle(t);}, findHover: function findHover(t, e) {return this.handler.findHover(t, e);}, on: function on(t, e, n) {this.handler.on(t, e, n);}, off: function off(t, e) {this.handler.off(t, e);}, trigger: function trigger(t, e) {this.handler.trigger(t, e);}, clear: function clear() {this.storage.delRoot(), this.painter.clear();}, dispose: function dispose() {this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, Bi(this.id);} };var rv = (Object.freeze || Object)({ version: nv, init: Li, dispose: Oi, getInstance: zi, registerPainter: Ei }),av = f,ov = M,sv = _,lv = "series\x00",uv = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "rich", "tag", "color", "textBorderColor", "textBorderWidth", "width", "height", "lineHeight", "align", "verticalAlign", "baseline", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "padding"],hv = 0,cv = ".",dv = "___EC__COMPONENT__CONTAINER___",fv = 0,pv = function pv(t) {for (var e = 0; e < t.length; e++) {t[e][1] || (t[e][1] = t[e][0]);}return function (e, n, i) {for (var r = {}, a = 0; a < t.length; a++) {var o = t[a][1];if (!(n && u(n, o) >= 0 || i && u(i, o) < 0)) {var s = e.getShallow(o);null != s && (r[t[a][0]] = s);}}return r;};},gv = pv([["lineWidth", "width"], ["stroke", "color"], ["opacity"], ["shadowBlur"], ["shadowOffsetX"], ["shadowOffsetY"], ["shadowColor"]]),vv = { getLineStyle: function getLineStyle(t) {var e = gv(this, t),n = this.getLineDash(e.lineWidth);return n && (e.lineDash = n), e;}, getLineDash: function getLineDash(t) {null == t && (t = 1);var e = this.get("type"),n = Math.max(t, 2),i = 4 * t;return "solid" === e || null == e ? null : "dashed" === e ? [i, i] : [n, n];} },mv = pv([["fill", "color"], ["shadowBlur"], ["shadowOffsetX"], ["shadowOffsetY"], ["opacity"], ["shadowColor"]]),yv = { getAreaStyle: function getAreaStyle(t, e) {return mv(this, t, e);} },xv = Math.pow,_v = Math.sqrt,wv = 1e-8,bv = 1e-4,Mv = _v(3),Sv = 1 / 3,Iv = W(),Tv = W(),Av = W(),Cv = Math.min,Dv = Math.max,kv = Math.sin,Pv = Math.cos,Lv = 2 * Math.PI,Ov = W(),zv = W(),Ev = W(),Bv = [],Rv = [],Nv = { M: 1, L: 2, C: 3, Q: 4, A: 5, Z: 6, R: 7 },Fv = [],Vv = [],Wv = [],Gv = [],Hv = Math.min,Zv = Math.max,Xv = Math.cos,Yv = Math.sin,qv = Math.sqrt,jv = Math.abs,Uv = "undefined" != typeof Float32Array,$v = function $v(t) {this._saveData = !t, this._saveData && (this.data = []), this._ctx = null;};$v.prototype = { constructor: $v, _xi: 0, _yi: 0, _x0: 0, _y0: 0, _ux: 0, _uy: 0, _len: 0, _lineDash: null, _dashOffset: 0, _dashIdx: 0, _dashSum: 0, setScale: function setScale(t, e) {this._ux = jv(1 / ng / t) || 0, this._uy = jv(1 / ng / e) || 0;}, getContext: function getContext() {return this._ctx;}, beginPath: function beginPath(t) {return this._ctx = t, t && t.beginPath(), t && (this.dpr = t.dpr), this._saveData && (this._len = 0), this._lineDash && (this._lineDash = null, this._dashOffset = 0), this;}, moveTo: function moveTo(t, e) {return this.addData(Nv.M, t, e), this._ctx && this._ctx.moveTo(t, e), this._x0 = t, this._y0 = e, this._xi = t, this._yi = e, this;}, lineTo: function lineTo(t, e) {var n = jv(t - this._xi) > this._ux || jv(e - this._yi) > this._uy || this._len < 5;return this.addData(Nv.L, t, e), this._ctx && n && (this._needsDash() ? this._dashedLineTo(t, e) : this._ctx.lineTo(t, e)), n && (this._xi = t, this._yi = e), this;}, bezierCurveTo: function bezierCurveTo(t, e, n, i, r, a) {return this.addData(Nv.C, t, e, n, i, r, a), this._ctx && (this._needsDash() ? this._dashedBezierTo(t, e, n, i, r, a) : this._ctx.bezierCurveTo(t, e, n, i, r, a)), this._xi = r, this._yi = a, this;}, quadraticCurveTo: function quadraticCurveTo(t, e, n, i) {return this.addData(Nv.Q, t, e, n, i), this._ctx && (this._needsDash() ? this._dashedQuadraticTo(t, e, n, i) : this._ctx.quadraticCurveTo(t, e, n, i)), this._xi = n, this._yi = i, this;}, arc: function arc(t, e, n, i, r, a) {return this.addData(Nv.A, t, e, n, n, i, r - i, 0, a ? 0 : 1), this._ctx && this._ctx.arc(t, e, n, i, r, a), this._xi = Xv(r) * n + t, this._yi = Yv(r) * n + e, this;}, arcTo: function arcTo(t, e, n, i, r) {return this._ctx && this._ctx.arcTo(t, e, n, i, r), this;}, rect: function rect(t, e, n, i) {return this._ctx && this._ctx.rect(t, e, n, i), this.addData(Nv.R, t, e, n, i), this;}, closePath: function closePath() {this.addData(Nv.Z);var t = this._ctx,e = this._x0,n = this._y0;return t && (this._needsDash() && this._dashedLineTo(e, n), t.closePath()), this._xi = e, this._yi = n, this;}, fill: function fill(t) {t && t.fill(), this.toStatic();}, stroke: function stroke(t) {t && t.stroke(), this.toStatic();}, setLineDash: function setLineDash(t) {if (t instanceof Array) {this._lineDash = t, this._dashIdx = 0;for (var e = 0, n = 0; n < t.length; n++) {e += t[n];}this._dashSum = e;}return this;}, setLineDashOffset: function setLineDashOffset(t) {return this._dashOffset = t, this;}, len: function len() {return this._len;}, setData: function setData(t) {var e = t.length;this.data && this.data.length == e || !Uv || (this.data = new Float32Array(e));for (var n = 0; e > n; n++) {this.data[n] = t[n];}this._len = e;}, appendPath: function appendPath(t) {t instanceof Array || (t = [t]);for (var e = t.length, n = 0, i = this._len, r = 0; e > r; r++) {n += t[r].len();}Uv && this.data instanceof Float32Array && (this.data = new Float32Array(i + n));for (var r = 0; e > r; r++) {for (var a = t[r].data, o = 0; o < a.length; o++) {this.data[i++] = a[o];}}this._len = i;}, addData: function addData(t) {if (this._saveData) {var e = this.data;this._len + arguments.length > e.length && (this._expandData(), e = this.data);for (var n = 0; n < arguments.length; n++) {e[this._len++] = arguments[n];}this._prevCmd = t;}}, _expandData: function _expandData() {if (!(this.data instanceof Array)) {for (var t = [], e = 0; e < this._len; e++) {t[e] = this.data[e];}this.data = t;}}, _needsDash: function _needsDash() {return this._lineDash;}, _dashedLineTo: function _dashedLineTo(t, e) {var n,i,r = this._dashSum,a = this._dashOffset,o = this._lineDash,s = this._ctx,l = this._xi,u = this._yi,h = t - l,c = e - u,d = qv(h * h + c * c),f = l,p = u,g = o.length;for (h /= d, c /= d, 0 > a && (a = r + a), a %= r, f -= a * h, p -= a * c; h > 0 && t >= f || 0 > h && f >= t || 0 == h && (c > 0 && e >= p || 0 > c && p >= e);) {i = this._dashIdx, n = o[i], f += h * n, p += c * n, this._dashIdx = (i + 1) % g, h > 0 && l > f || 0 > h && f > l || c > 0 && u > p || 0 > c && p > u || s[i % 2 ? "moveTo" : "lineTo"](h >= 0 ? Hv(f, t) : Zv(f, t), c >= 0 ? Hv(p, e) : Zv(p, e));}h = f - t, c = p - e, this._dashOffset = -qv(h * h + c * c);}, _dashedBezierTo: function _dashedBezierTo(t, e, n, i, r, a) {var o,s,l,u,h,c = this._dashSum,d = this._dashOffset,f = this._lineDash,p = this._ctx,g = this._xi,v = this._yi,m = sr,y = 0,x = this._dashIdx,_ = f.length,w = 0;for (0 > d && (d = c + d), d %= c, o = 0; 1 > o; o += .1) {s = m(g, t, n, r, o + .1) - m(g, t, n, r, o), l = m(v, e, i, a, o + .1) - m(v, e, i, a, o), y += qv(s * s + l * l);}for (; _ > x && (w += f[x], !(w > d)); x++) {;}for (o = (w - d) / y; 1 >= o;) {u = m(g, t, n, r, o), h = m(v, e, i, a, o), x % 2 ? p.moveTo(u, h) : p.lineTo(u, h), o += f[x] / y, x = (x + 1) % _;}x % 2 !== 0 && p.lineTo(r, a), s = r - u, l = a - h, this._dashOffset = -qv(s * s + l * l);}, _dashedQuadraticTo: function _dashedQuadraticTo(t, e, n, i) {var r = n,a = i;n = (n + 2 * t) / 3, i = (i + 2 * e) / 3, t = (this._xi + 2 * t) / 3, e = (this._yi + 2 * e) / 3, this._dashedBezierTo(t, e, n, i, r, a);}, toStatic: function toStatic() {var t = this.data;t instanceof Array && (t.length = this._len, Uv && (this.data = new Float32Array(t)));}, getBoundingRect: function getBoundingRect() {Fv[0] = Fv[1] = Wv[0] = Wv[1] = Number.MAX_VALUE, Vv[0] = Vv[1] = Gv[0] = Gv[1] = -Number.MAX_VALUE;for (var t = this.data, e = 0, n = 0, i = 0, r = 0, a = 0; a < t.length;) {var o = t[a++];switch (1 == a && (e = t[a], n = t[a + 1], i = e, r = n), o) {case Nv.M:i = t[a++], r = t[a++], e = i, n = r, Wv[0] = i, Wv[1] = r, Gv[0] = i, Gv[1] = r;break;case Nv.L:_r(e, n, t[a], t[a + 1], Wv, Gv), e = t[a++], n = t[a++];break;case Nv.C:wr(e, n, t[a++], t[a++], t[a++], t[a++], t[a], t[a + 1], Wv, Gv), e = t[a++], n = t[a++];break;case Nv.Q:br(e, n, t[a++], t[a++], t[a], t[a + 1], Wv, Gv), e = t[a++], n = t[a++];break;case Nv.A:var s = t[a++],l = t[a++],u = t[a++],h = t[a++],c = t[a++],d = t[a++] + c,f = (t[a++], 1 - t[a++]);1 == a && (i = Xv(c) * u + s, r = Yv(c) * h + l), Mr(s, l, u, h, c, d, f, Wv, Gv), e = Xv(d) * u + s, n = Yv(d) * h + l;break;case Nv.R:i = e = t[a++], r = n = t[a++];var p = t[a++],g = t[a++];_r(i, r, i + p, r + g, Wv, Gv);break;case Nv.Z:e = i, n = r;}oe(Fv, Fv, Wv), se(Vv, Vv, Gv);}return 0 === a && (Fv[0] = Fv[1] = Vv[0] = Vv[1] = 0), new vn(Fv[0], Fv[1], Vv[0] - Fv[0], Vv[1] - Fv[1]);}, rebuildPath: function rebuildPath(t) {for (var e, n, i, r, a, o, s = this.data, l = this._ux, u = this._uy, h = this._len, c = 0; h > c;) {var d = s[c++];switch (1 == c && (i = s[c], r = s[c + 1], e = i, n = r), d) {case Nv.M:e = i = s[c++], n = r = s[c++], t.moveTo(i, r);break;case Nv.L:a = s[c++], o = s[c++], (jv(a - i) > l || jv(o - r) > u || c === h - 1) && (t.lineTo(a, o), i = a, r = o);break;case Nv.C:t.bezierCurveTo(s[c++], s[c++], s[c++], s[c++], s[c++], s[c++]), i = s[c - 2], r = s[c - 1];break;case Nv.Q:t.quadraticCurveTo(s[c++], s[c++], s[c++], s[c++]), i = s[c - 2], r = s[c - 1];break;case Nv.A:var f = s[c++],p = s[c++],g = s[c++],v = s[c++],m = s[c++],y = s[c++],x = s[c++],_ = s[c++],w = g > v ? g : v,b = g > v ? 1 : g / v,M = g > v ? v / g : 1,S = Math.abs(g - v) > .001,I = m + y;S ? (t.translate(f, p), t.rotate(x), t.scale(b, M), t.arc(0, 0, w, m, I, 1 - _), t.scale(1 / b, 1 / M), t.rotate(-x), t.translate(-f, -p)) : t.arc(f, p, w, m, I, 1 - _), 1 == c && (e = Xv(m) * g + f, n = Yv(m) * v + p), i = Xv(I) * g + f, r = Yv(I) * v + p;break;case Nv.R:e = i = s[c], n = r = s[c + 1], t.rect(s[c++], s[c++], s[c++], s[c++]);break;case Nv.Z:t.closePath(), i = e, r = n;}}} }, $v.CMD = Nv;var Kv = 2 * Math.PI,Qv = 2 * Math.PI,Jv = $v.CMD,tm = 2 * Math.PI,em = 1e-4,nm = [-1, -1, -1],im = [-1, -1],rm = wg.prototype.getCanvasPattern,am = Math.abs,om = new $v(!0);Nr.prototype = { constructor: Nr, type: "path", __dirtyPath: !0, strokeContainThreshold: 5, brush: function brush(t, e) {var n = this.style,i = this.path || om,r = n.hasStroke(),a = n.hasFill(),o = n.fill,s = n.stroke,l = a && !!o.colorStops,u = r && !!s.colorStops,h = a && !!o.image,c = r && !!s.image;if (n.bind(t, this, e), this.setTransform(t), this.__dirty) {var d;l && (d = d || this.getBoundingRect(), this._fillGradient = n.getGradient(t, o, d)), u && (d = d || this.getBoundingRect(), this._strokeGradient = n.getGradient(t, s, d));}l ? t.fillStyle = this._fillGradient : h && (t.fillStyle = rm.call(o, t)), u ? t.strokeStyle = this._strokeGradient : c && (t.strokeStyle = rm.call(s, t));var f = n.lineDash,p = n.lineDashOffset,g = !!t.setLineDash,v = this.getGlobalScale();if (i.setScale(v[0], v[1]), this.__dirtyPath || f && !g && r ? (i.beginPath(t), f && !g && (i.setLineDash(f), i.setLineDashOffset(p)), this.buildPath(i, this.shape, !1), this.path && (this.__dirtyPath = !1)) : (t.beginPath(), this.path.rebuildPath(t)), a) if (null != n.fillOpacity) {var m = t.globalAlpha;t.globalAlpha = n.fillOpacity * n.opacity, i.fill(t), t.globalAlpha = m;} else i.fill(t);if (f && g && (t.setLineDash(f), t.lineDashOffset = p), r) if (null != n.strokeOpacity) {var m = t.globalAlpha;t.globalAlpha = n.strokeOpacity * n.opacity, i.stroke(t), t.globalAlpha = m;} else i.stroke(t);f && g && t.setLineDash([]), null != n.text && (this.restoreTransform(t), this.drawRectText(t, this.getBoundingRect()));}, buildPath: function buildPath() {}, createPathProxy: function createPathProxy() {this.path = new $v();}, getBoundingRect: function getBoundingRect() {var t = this._rect,e = this.style,n = !t;if (n) {var i = this.path;i || (i = this.path = new $v()), this.__dirtyPath && (i.beginPath(), this.buildPath(i, this.shape, !1)), t = i.getBoundingRect();}if (this._rect = t, e.hasStroke()) {var r = this._rectWithStroke || (this._rectWithStroke = t.clone());if (this.__dirty || n) {r.copy(t);var a = e.lineWidth,o = e.strokeNoScale ? this.getLineScale() : 1;e.hasFill() || (a = Math.max(a, this.strokeContainThreshold || 4)), o > 1e-10 && (r.width += a / o, r.height += a / o, r.x -= a / o / 2, r.y -= a / o / 2);}return r;}return t;}, contain: function contain(t, e) {var n = this.transformCoordToLocal(t, e),i = this.getBoundingRect(),r = this.style;if (t = n[0], e = n[1], i.contain(t, e)) {var a = this.path.data;if (r.hasStroke()) {var o = r.lineWidth,s = r.strokeNoScale ? this.getLineScale() : 1;if (s > 1e-10 && (r.hasFill() || (o = Math.max(o, this.strokeContainThreshold)), Rr(a, o / s, t, e))) return !0;}if (r.hasFill()) return Br(a, t, e);}return !1;}, dirty: function dirty(t) {null == t && (t = !0), t && (this.__dirtyPath = t, this._rect = null), this.__dirty = this.__dirtyText = !0, this.__zr && this.__zr.refresh(), this.__clipTarget && this.__clipTarget.dirty();}, animateShape: function animateShape(t) {return this.animate("shape", t);}, attrKV: function attrKV(t, e) {"shape" === t ? (this.setShape(e), this.__dirtyPath = !0, this._rect = null) : vi.prototype.attrKV.call(this, t, e);}, setShape: function setShape(t, e) {var n = this.shape;if (n) {if (M(t)) for (var i in t) {t.hasOwnProperty(i) && (n[i] = t[i]);} else n[t] = e;this.dirty(!0);}return this;}, getLineScale: function getLineScale() {var t = this.transform;return t && am(t[0] - 1) > 1e-10 && am(t[3] - 1) > 1e-10 ? Math.sqrt(am(t[0] * t[3] - t[2] * t[1])) : 1;} }, Nr.extend = function (t) {var e = function e(_e2) {Nr.call(this, _e2), t.style && this.style.extendFrom(t.style, !1);var n = t.shape;if (n) {this.shape = this.shape || {};var i = this.shape;for (var r in n) {!i.hasOwnProperty(r) && n.hasOwnProperty(r) && (i[r] = n[r]);}}t.init && t.init.call(this, _e2);};h(e, Nr);for (var n in t) {"style" !== n && "shape" !== n && (e.prototype[n] = t[n]);}return e;}, h(Nr, vi);var sm = $v.CMD,lm = [[], [], []],um = Math.sqrt,hm = Math.atan2,cm = function cm(t, e) {var n,i,r,a,o,s,l = t.data,u = sm.M,h = sm.C,c = sm.L,d = sm.R,f = sm.A,p = sm.Q;for (r = 0, a = 0; r < l.length;) {switch (n = l[r++], a = r, i = 0, n) {case u:i = 1;break;case c:i = 1;break;case h:i = 3;break;case p:i = 2;break;case f:var g = e[4],v = e[5],m = um(e[0] * e[0] + e[1] * e[1]),y = um(e[2] * e[2] + e[3] * e[3]),x = hm(-e[1] / y, e[0] / m);l[r] *= m, l[r++] += g, l[r] *= y, l[r++] += v, l[r++] *= m, l[r++] *= y, l[r++] += x, l[r++] += x, r += 2, a = r;break;case d:s[0] = l[r++], s[1] = l[r++], ae(s, s, e), l[a++] = s[0], l[a++] = s[1], s[0] += l[r++], s[1] += l[r++], ae(s, s, e), l[a++] = s[0], l[a++] = s[1];}for (o = 0; i > o; o++) {var s = lm[o];s[0] = l[r++], s[1] = l[r++], ae(s, s, e), l[a++] = s[0], l[a++] = s[1];}}},dm = Math.sqrt,fm = Math.sin,pm = Math.cos,gm = Math.PI,vm = function vm(t) {return Math.sqrt(t[0] * t[0] + t[1] * t[1]);},mm = function mm(t, e) {return (t[0] * e[0] + t[1] * e[1]) / (vm(t) * vm(e));},ym = function ym(t, e) {return (t[0] * e[1] < t[1] * e[0] ? -1 : 1) * Math.acos(mm(t, e));},xm = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/gi,_m = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g,wm = function wm(t) {vi.call(this, t);};wm.prototype = { constructor: wm, type: "text", brush: function brush(t, e) {var n = this.style;this.__dirty && Qn(n, !0), n.fill = n.stroke = n.shadowBlur = n.shadowColor = n.shadowOffsetX = n.shadowOffsetY = null;var i = n.text;null != i && (i += ""), gi(i, n) && (this.setTransform(t), ti(this, t, i, n, null, e), this.restoreTransform(t));}, getBoundingRect: function getBoundingRect() {var t = this.style;if (this.__dirty && Qn(t, !0), !this._rect) {var e = t.text;null != e ? e += "" : e = "";var n = En(t.text + "", t.font, t.textAlign, t.textVerticalAlign, t.textPadding, t.rich);if (n.x += t.x || 0, n.y += t.y || 0, ci(t.textStroke, t.textStrokeWidth)) {var i = t.textStrokeWidth;n.x -= i / 2, n.y -= i / 2, n.width += i, n.height += i;}this._rect = n;}return this._rect;} }, h(wm, vi);var bm = Nr.extend({ type: "circle", shape: { cx: 0, cy: 0, r: 0 }, buildPath: function buildPath(t, e, n) {n && t.moveTo(e.cx + e.r, e.cy), t.arc(e.cx, e.cy, e.r, 0, 2 * Math.PI, !0);} }),Mm = [["shadowBlur", 0], ["shadowColor", "#000"], ["shadowOffsetX", 0], ["shadowOffsetY", 0]],Sm = function Sm(t) {return np.browser.ie && np.browser.version >= 11 ? function () {var e,n = this.__clipPaths,i = this.style;if (n) for (var r = 0; r < n.length; r++) {var a = n[r],o = a && a.shape,s = a && a.type;if (o && ("sector" === s && o.startAngle === o.endAngle || "rect" === s && (!o.width || !o.height))) {for (var l = 0; l < Mm.length; l++) {Mm[l][2] = i[Mm[l][0]], i[Mm[l][0]] = Mm[l][1];}e = !0;break;}}if (t.apply(this, arguments), e) for (var l = 0; l < Mm.length; l++) {i[Mm[l][0]] = Mm[l][2];}} : t;},Im = Nr.extend({ type: "sector", shape: { cx: 0, cy: 0, r0: 0, r: 0, startAngle: 0, endAngle: 2 * Math.PI, clockwise: !0 }, brush: Sm(Nr.prototype.brush), buildPath: function buildPath(t, e) {var n = e.cx,i = e.cy,r = Math.max(e.r0 || 0, 0),a = Math.max(e.r, 0),o = e.startAngle,s = e.endAngle,l = e.clockwise,u = Math.cos(o),h = Math.sin(o);t.moveTo(u * r + n, h * r + i), t.lineTo(u * a + n, h * a + i), t.arc(n, i, a, o, s, !l), t.lineTo(Math.cos(s) * r + n, Math.sin(s) * r + i), 0 !== r && t.arc(n, i, r, s, o, l), t.closePath();} }),Tm = Nr.extend({ type: "ring", shape: { cx: 0, cy: 0, r: 0, r0: 0 }, buildPath: function buildPath(t, e) {var n = e.cx,i = e.cy,r = 2 * Math.PI;t.moveTo(n + e.r, i), t.arc(n, i, e.r, 0, r, !1), t.moveTo(n + e.r0, i), t.arc(n, i, e.r0, 0, r, !0);} }),Am = function Am(t, e) {for (var n = t.length, i = [], r = 0, a = 1; n > a; a++) {r += ee(t[a - 1], t[a]);}var o = r / 2;o = n > o ? n : o;for (var a = 0; o > a; a++) {var s,l,u,h = a / (o - 1) * (e ? n : n - 1),c = Math.floor(h),d = h - c,f = t[c % n];e ? (s = t[(c - 1 + n) % n], l = t[(c + 1) % n], u = t[(c + 2) % n]) : (s = t[0 === c ? c : c - 1], l = t[c > n - 2 ? n - 1 : c + 1], u = t[c > n - 3 ? n - 1 : c + 2]);var p = d * d,g = d * p;i.push([Xr(s[0], f[0], l[0], u[0], d, p, g), Xr(s[1], f[1], l[1], u[1], d, p, g)]);}return i;},Cm = function Cm(t, e, n, i) {var r,a,o,s,l = [],u = [],h = [],c = [];if (i) {o = [1 / 0, 1 / 0], s = [-1 / 0, -1 / 0];for (var d = 0, f = t.length; f > d; d++) {oe(o, o, t[d]), se(s, s, t[d]);}oe(o, o, i[0]), se(s, s, i[1]);}for (var d = 0, f = t.length; f > d; d++) {var p = t[d];if (n) r = t[d ? d - 1 : f - 1], a = t[(d + 1) % f];else {if (0 === d || d === f - 1) {l.push(H(t[d]));continue;}r = t[d - 1], a = t[d + 1];}q(u, a, r), J(u, u, e);var g = ee(p, r),v = ee(p, a),m = g + v;0 !== m && (g /= m, v /= m), J(h, u, -g), J(c, u, v);var y = X([], p, h),x = X([], p, c);i && (se(y, y, o), oe(y, y, s), se(x, x, o), oe(x, x, s)), l.push(y), l.push(x);}return n && l.push(l.shift()), l;},Dm = Nr.extend({ type: "polygon", shape: { points: null, smooth: !1, smoothConstraint: null }, buildPath: function buildPath(t, e) {Yr(t, e, !0);} }),km = Nr.extend({ type: "polyline", shape: { points: null, smooth: !1, smoothConstraint: null }, style: { stroke: "#000", fill: null }, buildPath: function buildPath(t, e) {Yr(t, e, !1);} }),Pm = Nr.extend({ type: "rect", shape: { r: 0, x: 0, y: 0, width: 0, height: 0 }, buildPath: function buildPath(t, e) {var n = e.x,i = e.y,r = e.width,a = e.height;e.r ? Kn(t, e) : t.rect(n, i, r, a), t.closePath();} }),Lm = Nr.extend({ type: "line", shape: { x1: 0, y1: 0, x2: 0, y2: 0, percent: 1 }, style: { stroke: "#000", fill: null }, buildPath: function buildPath(t, e) {var n = e.x1,i = e.y1,r = e.x2,a = e.y2,o = e.percent;0 !== o && (t.moveTo(n, i), 1 > o && (r = n * (1 - o) + r * o, a = i * (1 - o) + a * o), t.lineTo(r, a));}, pointAt: function pointAt(t) {var e = this.shape;return [e.x1 * (1 - t) + e.x2 * t, e.y1 * (1 - t) + e.y2 * t];} }),Om = [],zm = Nr.extend({ type: "bezier-curve", shape: { x1: 0, y1: 0, x2: 0, y2: 0, cpx1: 0, cpy1: 0, percent: 1 }, style: { stroke: "#000", fill: null }, buildPath: function buildPath(t, e) {var n = e.x1,i = e.y1,r = e.x2,a = e.y2,o = e.cpx1,s = e.cpy1,l = e.cpx2,u = e.cpy2,h = e.percent;0 !== h && (t.moveTo(n, i), null == l || null == u ? (1 > h && (mr(n, o, r, h, Om), o = Om[1], r = Om[2], mr(i, s, a, h, Om), s = Om[1], a = Om[2]), t.quadraticCurveTo(o, s, r, a)) : (1 > h && (cr(n, o, l, r, h, Om), o = Om[1], l = Om[2], r = Om[3], cr(i, s, u, a, h, Om), s = Om[1], u = Om[2], a = Om[3]), t.bezierCurveTo(o, s, l, u, r, a)));}, pointAt: function pointAt(t) {return qr(this.shape, t, !1);}, tangentAt: function tangentAt(t) {var e = qr(this.shape, t, !0);return te(e, e);} }),Em = Nr.extend({ type: "arc", shape: { cx: 0, cy: 0, r: 0, startAngle: 0, endAngle: 2 * Math.PI, clockwise: !0 }, style: { stroke: "#000", fill: null }, buildPath: function buildPath(t, e) {var n = e.cx,i = e.cy,r = Math.max(e.r, 0),a = e.startAngle,o = e.endAngle,s = e.clockwise,l = Math.cos(a),u = Math.sin(a);t.moveTo(l * r + n, u * r + i), t.arc(n, i, r, a, o, !s);} }),Bm = Nr.extend({ type: "compound", shape: { paths: null }, _updatePathDirty: function _updatePathDirty() {for (var t = this.__dirtyPath, e = this.shape.paths, n = 0; n < e.length; n++) {t = t || e[n].__dirtyPath;}this.__dirtyPath = t, this.__dirty = this.__dirty || t;}, beforeBrush: function beforeBrush() {this._updatePathDirty();for (var t = this.shape.paths || [], e = this.getGlobalScale(), n = 0; n < t.length; n++) {t[n].path || t[n].createPathProxy(), t[n].path.setScale(e[0], e[1]);}}, buildPath: function buildPath(t, e) {for (var n = e.paths || [], i = 0; i < n.length; i++) {n[i].buildPath(t, n[i].shape, !0);}}, afterBrush: function afterBrush() {for (var t = this.shape.paths || [], e = 0; e < t.length; e++) {t[e].__dirtyPath = !1;}}, getBoundingRect: function getBoundingRect() {return this._updatePathDirty(), Nr.prototype.getBoundingRect.call(this);} }),Rm = function Rm(t) {this.colorStops = t || [];};Rm.prototype = { constructor: Rm, addColorStop: function addColorStop(t, e) {this.colorStops.push({ offset: t, color: e });} };var Nm = function Nm(t, e, n, i, r, a) {this.x = null == t ? 0 : t, this.y = null == e ? 0 : e, this.x2 = null == n ? 1 : n, this.y2 = null == i ? 0 : i, this.type = "linear", this.global = a || !1, Rm.call(this, r);};Nm.prototype = { constructor: Nm }, h(Nm, Rm);var Fm = function Fm(t, e, n, i, r) {this.x = null == t ? .5 : t, this.y = null == e ? .5 : e, this.r = null == n ? .5 : n, this.type = "radial", this.global = r || !1, Rm.call(this, i);};Fm.prototype = { constructor: Fm }, h(Fm, Rm), jr.prototype.incremental = !0, jr.prototype.clearDisplaybles = function () {this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.dirty(), this.notClear = !1;}, jr.prototype.addDisplayable = function (t, e) {e ? this._temporaryDisplayables.push(t) : this._displayables.push(t), this.dirty();}, jr.prototype.addDisplayables = function (t, e) {e = e || !1;for (var n = 0; n < t.length; n++) {this.addDisplayable(t[n], e);}}, jr.prototype.eachPendingDisplayable = function (t) {for (var e = this._cursor; e < this._displayables.length; e++) {t && t(this._displayables[e]);}for (var e = 0; e < this._temporaryDisplayables.length; e++) {t && t(this._temporaryDisplayables[e]);}}, jr.prototype.update = function () {this.updateTransform();for (var t = this._cursor; t < this._displayables.length; t++) {var e = this._displayables[t];e.parent = this, e.update(), e.parent = null;}for (var t = 0; t < this._temporaryDisplayables.length; t++) {var e = this._temporaryDisplayables[t];e.parent = this, e.update(), e.parent = null;}}, jr.prototype.brush = function (t) {for (var e = this._cursor; e < this._displayables.length; e++) {var n = this._displayables[e];n.beforeBrush && n.beforeBrush(t), n.brush(t, e === this._cursor ? null : this._displayables[e - 1]), n.afterBrush && n.afterBrush(t);}this._cursor = e;for (var e = 0; e < this._temporaryDisplayables.length; e++) {var n = this._temporaryDisplayables[e];n.beforeBrush && n.beforeBrush(t), n.brush(t, 0 === e ? null : this._temporaryDisplayables[e - 1]), n.afterBrush && n.afterBrush(t);}this._temporaryDisplayables = [], this.notClear = !0;};var Vm = [];jr.prototype.getBoundingRect = function () {if (!this._rect) {for (var t = new vn(1 / 0, 1 / 0, -1 / 0, -1 / 0), e = 0; e < this._displayables.length; e++) {var n = this._displayables[e],i = n.getBoundingRect().clone();n.needLocalTransform() && i.applyTransform(n.getLocalTransform(Vm)), t.union(i);}this._rect = t;}return this._rect;}, jr.prototype.contain = function (t, e) {var n = this.transformCoordToLocal(t, e),i = this.getBoundingRect();if (i.contain(n[0], n[1])) for (var r = 0; r < this._displayables.length; r++) {var a = this._displayables[r];if (a.contain(t, e)) return !0;}return !1;}, h(jr, vi);var Wm = Math.round,Gm = Math.max,Hm = Math.min,Zm = {},Xm = Zr,Ym = N(),qm = 0,jm = (Object.freeze || Object)({ extendShape: Ur, extendPath: $r, makePath: Kr, makeImage: Qr, mergePath: Xm, resizePath: ta, subPixelOptimizeLine: ea, subPixelOptimizeRect: na, subPixelOptimize: ia, setElementHoverStyle: da, isInEmphasis: fa, setHoverStyle: ya, setAsHoverStyleTrigger: xa, setLabelStyle: _a, setTextStyle: wa, setText: ba, getFont: Da, updateProps: Pa, initProps: La, getTransform: Oa, applyTransform: za, transformDirection: Ea, groupTransition: Ba, clipPointsByRect: Ra, clipRectByRect: Na, createIcon: Fa, Group: hg, Image: mi, Text: wm, Circle: bm, Sector: Im, Ring: Tm, Polygon: Dm, Polyline: km, Rect: Pm, Line: Lm, BezierCurve: zm, Arc: Em, IncrementalDisplayable: jr, CompoundPath: Bm, LinearGradient: Nm, RadialGradient: Fm, BoundingRect: vn }),Um = ["textStyle", "color"],$m = { getTextColor: function getTextColor(t) {var e = this.ecModel;return this.getShallow("color") || (!t && e ? e.get(Um) : null);}, getFont: function getFont() {return Da({ fontStyle: this.getShallow("fontStyle"), fontWeight: this.getShallow("fontWeight"), fontSize: this.getShallow("fontSize"), fontFamily: this.getShallow("fontFamily") }, this.ecModel);}, getTextRect: function getTextRect(t) {return En(t, this.getFont(), this.getShallow("align"), this.getShallow("verticalAlign") || this.getShallow("baseline"), this.getShallow("padding"), this.getShallow("rich"), this.getShallow("truncateText"));} },Km = pv([["fill", "color"], ["stroke", "borderColor"], ["lineWidth", "borderWidth"], ["opacity"], ["shadowBlur"], ["shadowOffsetX"], ["shadowOffsetY"], ["shadowColor"], ["textPosition"], ["textAlign"]]),Qm = { getItemStyle: function getItemStyle(t, e) {var n = Km(this, t, e),i = this.getBorderLineDash();return i && (n.lineDash = i), n;}, getBorderLineDash: function getBorderLineDash() {var t = this.get("borderType");return "solid" === t || null == t ? null : "dashed" === t ? [5, 5] : [1, 1];} },Jm = c,ty = Yi();Va.prototype = { constructor: Va, init: null, mergeOption: function mergeOption(t) {r(this.option, t, !0);}, get: function get(t, e) {return null == t ? this.option : Wa(this.option, this.parsePath(t), !e && Ga(this, t));}, getShallow: function getShallow(t, e) {var n = this.option,i = null == n ? n : n[t],r = !e && Ga(this, t);return null == i && r && (i = r.getShallow(t)), i;}, getModel: function getModel(t, e) {var n,i = null == t ? this.option : Wa(this.option, t = this.parsePath(t));return e = e || (n = Ga(this, t)) && n.getModel(t), new Va(i, e, this.ecModel);}, isEmpty: function isEmpty() {return null == this.option;}, restoreData: function restoreData() {}, clone: function clone() {var t = this.constructor;return new t(i(this.option));}, setReadOnly: function setReadOnly() {}, parsePath: function parsePath(t) {return "string" == typeof t && (t = t.split(".")), t;}, customizeGetParent: function customizeGetParent(t) {ty(this).getParent = t;}, isAnimationEnabled: function isAnimationEnabled() {if (!np.node) {if (null != this.option.animation) return !!this.option.animation;if (this.parentModel) return this.parentModel.isAnimationEnabled();}} }, tr(Va), er(Va), Jm(Va, vv), Jm(Va, yv), Jm(Va, $m), Jm(Va, Qm);var ey = 0,ny = 1e-4,iy = 9007199254740991,ry = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d\d)(?::(\d\d)(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/,ay = (Object.freeze || Object)({ linearMap: qa, parsePercent: ja, round: Ua, asc: $a, getPrecision: Ka, getPrecisionSafe: Qa, getPixelPrecision: Ja, getPercentWithPrecision: to, MAX_SAFE_INTEGER: iy, remRadian: eo, isRadianAroundZero: no, parseDate: io, quantity: ro, nice: oo, quantile: so, reformIntervals: lo, isNumeric: uo }),oy = L,sy = /([&<>"'])/g,ly = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" },uy = ["a", "b", "c", "d", "e", "f", "g"],hy = function hy(t, e) {return "{" + t + (null == e ? "" : e) + "}";},cy = Wn,dy = En,fy = (Object.freeze || Object)({ addCommas: ho, toCamelCase: co, normalizeCssArray: oy, encodeHTML: fo, formatTpl: po, formatTplSimple: go, getTooltipMarker: vo, formatTime: yo, capitalFirst: xo, truncateText: cy, getTextRect: dy }),py = f,gy = ["left", "right", "top", "bottom", "width", "height"],vy = [["width", "left", "right"], ["height", "top", "bottom"]],my = _o,yy = (x(_o, "vertical"), x(_o, "horizontal"), { getBoxLayoutParams: function getBoxLayoutParams() {return { left: this.get("left"), top: this.get("top"), right: this.get("right"), bottom: this.get("bottom"), width: this.get("width"), height: this.get("height") };} }),xy = Yi(),_y = Va.extend({ type: "component", id: "", name: "", mainType: "", subType: "", componentIndex: 0, defaultOption: null, ecModel: null, dependentModels: [], uid: null, layoutMode: null, $constructor: function $constructor(t, e, n, i) {Va.call(this, t, e, n, i), this.uid = Ha("ec_cpt_model");}, init: function init(t, e, n) {this.mergeDefaultAndTheme(t, n);}, mergeDefaultAndTheme: function mergeDefaultAndTheme(t, e) {var n = this.layoutMode,i = n ? Mo(t) : {},a = e.getTheme();r(t, a.get(this.mainType)), r(t, this.getDefaultOption()), n && bo(t, i, n);}, mergeOption: function mergeOption(t) {r(this.option, t, !0);var e = this.layoutMode;e && bo(this.option, t, e);}, optionUpdated: function optionUpdated() {}, getDefaultOption: function getDefaultOption() {var t = xy(this);if (!t.defaultOption) {for (var e = [], n = this.constructor; n;) {var i = n.prototype.defaultOption;i && e.push(i), n = n.superClass;}for (var a = {}, o = e.length - 1; o >= 0; o--) {a = r(a, e[o], !0);}t.defaultOption = a;}return t.defaultOption;}, getReferringComponents: function getReferringComponents(t) {return this.ecModel.queryComponents({ mainType: t, index: this.get(t + "Index", !0), id: this.get(t + "Id", !0) });} });rr(_y, { registerWhenExtend: !0 }), Za(_y), Xa(_y, Io), c(_y, yy);var wy = "";"undefined" != typeof navigator && (wy = navigator.platform || "");var by = { color: ["#c23531", "#2f4554", "#61a0a8", "#d48265", "#91c7ae", "#749f83", "#ca8622", "#bda29a", "#6e7074", "#546570", "#c4ccd3"], gradientColor: ["#f6efa6", "#d88273", "#bf444c"], textStyle: { fontFamily: wy.match(/^Win/) ? "Microsoft YaHei" : "sans-serif", fontSize: 12, fontStyle: "normal", fontWeight: "normal" }, blendMode: null, animation: "auto", animationDuration: 1e3, animationDurationUpdate: 300, animationEasing: "exponentialOut", animationEasingUpdate: "cubicOut", animationThreshold: 2e3, progressiveThreshold: 3e3, progressive: 400, hoverLayerThreshold: 3e3, useUTC: !1 },My = Yi(),Sy = { clearColorPalette: function clearColorPalette() {My(this).colorIdx = 0, My(this).colorNameMap = {};}, getColorFromPalette: function getColorFromPalette(t, e, n) {e = e || this;var i = My(e),r = i.colorIdx || 0,a = i.colorNameMap = i.colorNameMap || {};if (a.hasOwnProperty(t)) return a[t];var o = Ri(this.get("color", !0)),s = this.get("colorLayer", !0),l = null != n && s ? To(s, n) : o;if (l = l || o, l && l.length) {var u = l[r];return t && (a[t] = u), i.colorIdx = (r + 1) % l.length, u;}} },Iy = { cartesian2d: function cartesian2d(t, e, n, i) {var r = t.getReferringComponents("xAxis")[0],a = t.getReferringComponents("yAxis")[0];e.coordSysDims = ["x", "y"], n.set("x", r), n.set("y", a), Co(r) && (i.set("x", r), e.firstCategoryDimIndex = 0), Co(a) && (i.set("y", a), e.firstCategoryDimIndex = 1);
    }, singleAxis: function singleAxis(t, e, n, i) {var r = t.getReferringComponents("singleAxis")[0];e.coordSysDims = ["single"], n.set("single", r), Co(r) && (i.set("single", r), e.firstCategoryDimIndex = 0);}, polar: function polar(t, e, n, i) {var r = t.getReferringComponents("polar")[0],a = r.findAxisModel("radiusAxis"),o = r.findAxisModel("angleAxis");e.coordSysDims = ["radius", "angle"], n.set("radius", a), n.set("angle", o), Co(a) && (i.set("radius", a), e.firstCategoryDimIndex = 0), Co(o) && (i.set("angle", o), e.firstCategoryDimIndex = 1);}, geo: function geo(t, e) {e.coordSysDims = ["lng", "lat"];}, parallel: function parallel(t, e, n, i) {var r = t.ecModel,a = r.getComponent("parallel", t.get("parallelIndex")),o = e.coordSysDims = a.dimensions.slice();f(a.parallelAxisIndex, function (t, a) {var s = r.getComponent("parallelAxis", t),l = o[a];n.set(l, s), Co(s) && null == e.firstCategoryDimIndex && (i.set(l, s), e.firstCategoryDimIndex = a);});} },Ty = "original",Ay = "arrayRows",Cy = "objectRows",Dy = "keyedColumns",ky = "unknown",Py = "typedArray",Ly = "column",Oy = "row";Do.seriesDataToSource = function (t) {return new Do({ data: t, sourceFormat: I(t) ? Py : Ty, fromDataset: !1 });}, er(Do);var zy = Yi(),Ey = "\x00_ec_inner",By = Va.extend({ init: function init(t, e, n, i) {n = n || {}, this.option = null, this._theme = new Va(n), this._optionManager = i;}, setOption: function setOption(t, e) {O(!(Ey in t), "please use chart.getOption()"), this._optionManager.setOption(t, e), this.resetOption(null);}, resetOption: function resetOption(t) {var e = !1,n = this._optionManager;if (!t || "recreate" === t) {var i = n.mountOption("recreate" === t);this.option && "recreate" !== t ? (this.restoreData(), this.mergeOption(i)) : Zo.call(this, i), e = !0;}if (("timeline" === t || "media" === t) && this.restoreData(), !t || "recreate" === t || "timeline" === t) {var r = n.getTimelineOption(this);r && (this.mergeOption(r), e = !0);}if (!t || "recreate" === t || "media" === t) {var a = n.getMediaOption(this, this._api);a.length && f(a, function (t) {this.mergeOption(t, e = !0);}, this);}return e;}, mergeOption: function mergeOption(t) {function e(e, i) {var r = Ri(t[e]),s = Wi(a.get(e), r);Gi(s), f(s, function (t) {var n = t.option;M(n) && (t.keyInfo.mainType = e, t.keyInfo.subType = Yo(e, n, t.exist));});var l = Xo(a, i);n[e] = [], a.set(e, []), f(s, function (t, i) {var r = t.exist,s = t.option;if (O(M(s) || r, "Empty component definition"), s) {var u = _y.getClass(e, t.keyInfo.subType, !0);if (r && r instanceof u) r.name = t.keyInfo.name, r.mergeOption(s, this), r.optionUpdated(s, !1);else {var h = o({ dependentModels: l, componentIndex: i }, t.keyInfo);r = new u(s, this, this, h), o(r, h), r.init(s, this, this, h), r.optionUpdated(null, !0);}} else r.mergeOption({}, this), r.optionUpdated({}, !1);a.get(e)[i] = r, n[e][i] = r.option;}, this), "series" === e && qo(this, a.get("series"));}var n = this.option,a = this._componentsMap,s = [];Lo(this), f(t, function (t, e) {null != t && (_y.hasClass(e) ? e && s.push(e) : n[e] = null == n[e] ? i(t) : r(n[e], t, !0));}), _y.topologicalTravel(s, _y.getAllClassMainTypes(), e, this), this._seriesIndicesMap = N(this._seriesIndices = this._seriesIndices || []);}, getOption: function getOption() {var t = i(this.option);return f(t, function (e, n) {if (_y.hasClass(n)) {for (var e = Ri(e), i = e.length - 1; i >= 0; i--) {Zi(e[i]) && e.splice(i, 1);}t[n] = e;}}), delete t[Ey], t;}, getTheme: function getTheme() {return this._theme;}, getComponent: function getComponent(t, e) {var n = this._componentsMap.get(t);return n ? n[e || 0] : void 0;}, queryComponents: function queryComponents(t) {var e = t.mainType;if (!e) return [];var n = t.index,i = t.id,r = t.name,a = this._componentsMap.get(e);if (!a || !a.length) return [];var o;if (null != n) _(n) || (n = [n]), o = v(p(n, function (t) {return a[t];}), function (t) {return !!t;});else if (null != i) {var s = _(i);o = v(a, function (t) {return s && u(i, t.id) >= 0 || !s && t.id === i;});} else if (null != r) {var l = _(r);o = v(a, function (t) {return l && u(r, t.name) >= 0 || !l && t.name === r;});} else o = a.slice();return jo(o, t);}, findComponents: function findComponents(t) {function e(t) {var e = r + "Index",n = r + "Id",i = r + "Name";return !t || null == t[e] && null == t[n] && null == t[i] ? null : { mainType: r, index: t[e], id: t[n], name: t[i] };}function n(e) {return t.filter ? v(e, t.filter) : e;}var i = t.query,r = t.mainType,a = e(i),o = a ? this.queryComponents(a) : this._componentsMap.get(r);return n(jo(o, t));}, eachComponent: function eachComponent(t, e, n) {var i = this._componentsMap;if ("function" == typeof t) n = e, e = t, i.each(function (t, i) {f(t, function (t, r) {e.call(n, i, t, r);});});else if (b(t)) f(i.get(t), e, n);else if (M(t)) {var r = this.findComponents(t);f(r, e, n);}}, getSeriesByName: function getSeriesByName(t) {var e = this._componentsMap.get("series");return v(e, function (e) {return e.name === t;});}, getSeriesByIndex: function getSeriesByIndex(t) {return this._componentsMap.get("series")[t];}, getSeriesByType: function getSeriesByType(t) {var e = this._componentsMap.get("series");return v(e, function (e) {return e.subType === t;});}, getSeries: function getSeries() {return this._componentsMap.get("series").slice();}, getSeriesCount: function getSeriesCount() {return this._componentsMap.get("series").length;}, eachSeries: function eachSeries(t, e) {f(this._seriesIndices, function (n) {var i = this._componentsMap.get("series")[n];t.call(e, i, n);}, this);}, eachRawSeries: function eachRawSeries(t, e) {f(this._componentsMap.get("series"), t, e);}, eachSeriesByType: function eachSeriesByType(t, e, n) {f(this._seriesIndices, function (i) {var r = this._componentsMap.get("series")[i];r.subType === t && e.call(n, r, i);}, this);}, eachRawSeriesByType: function eachRawSeriesByType(t, e, n) {return f(this.getSeriesByType(t), e, n);}, isSeriesFiltered: function isSeriesFiltered(t) {return null == this._seriesIndicesMap.get(t.componentIndex);}, getCurrentSeriesIndices: function getCurrentSeriesIndices() {return (this._seriesIndices || []).slice();}, filterSeries: function filterSeries(t, e) {var n = v(this._componentsMap.get("series"), t, e);qo(this, n);}, restoreData: function restoreData(t) {var e = this._componentsMap;qo(this, e.get("series"));var n = [];e.each(function (t, e) {n.push(e);}), _y.topologicalTravel(n, _y.getAllClassMainTypes(), function (n) {f(e.get(n), function (e) {("series" !== n || !Go(e, t)) && e.restoreData();});});} });c(By, Sy);var Ry = ["getDom", "getZr", "getWidth", "getHeight", "getDevicePixelRatio", "dispatchAction", "isDisposed", "on", "off", "getDataURL", "getConnectedDataURL", "getModel", "getOption", "getViewOfComponentModel", "getViewOfSeriesModel"],Ny = {};$o.prototype = { constructor: $o, create: function create(t, e) {var n = [];f(Ny, function (i) {var r = i.create(t, e);n = n.concat(r || []);}), this._coordinateSystems = n;}, update: function update(t, e) {f(this._coordinateSystems, function (n) {n.update && n.update(t, e);});}, getCoordinateSystems: function getCoordinateSystems() {return this._coordinateSystems.slice();} }, $o.register = function (t, e) {Ny[t] = e;}, $o.get = function (t) {return Ny[t];};var Fy = f,Vy = i,Wy = p,Gy = r,Hy = /^(min|max)?(.+)$/;Ko.prototype = { constructor: Ko, setOption: function setOption(t, e) {t && f(Ri(t.series), function (t) {t && t.data && I(t.data) && E(t.data);}), t = Vy(t, !0);var n = this._optionBackup,i = Qo.call(this, t, e, !n);this._newBaseOption = i.baseOption, n ? (ns(n.baseOption, i.baseOption), i.timelineOptions.length && (n.timelineOptions = i.timelineOptions), i.mediaList.length && (n.mediaList = i.mediaList), i.mediaDefault && (n.mediaDefault = i.mediaDefault)) : this._optionBackup = i;}, mountOption: function mountOption(t) {var e = this._optionBackup;return this._timelineOptions = Wy(e.timelineOptions, Vy), this._mediaList = Wy(e.mediaList, Vy), this._mediaDefault = Vy(e.mediaDefault), this._currentMediaIndices = [], Vy(t ? e.baseOption : this._newBaseOption);}, getTimelineOption: function getTimelineOption(t) {var e,n = this._timelineOptions;if (n.length) {var i = t.getComponent("timeline");i && (e = Vy(n[i.getCurrentIndex()], !0));}return e;}, getMediaOption: function getMediaOption() {var t = this._api.getWidth(),e = this._api.getHeight(),n = this._mediaList,i = this._mediaDefault,r = [],a = [];if (!n.length && !i) return a;for (var o = 0, s = n.length; s > o; o++) {Jo(n[o].query, t, e) && r.push(o);}return !r.length && i && (r = [-1]), r.length && !es(r, this._currentMediaIndices) && (a = Wy(r, function (t) {return Vy(-1 === t ? i.option : n[t].option);})), this._currentMediaIndices = r, a;} };var Zy = f,Xy = M,Yy = ["areaStyle", "lineStyle", "nodeStyle", "linkStyle", "chordStyle", "label", "labelLine"],qy = function qy(t, e) {Zy(us(t.series), function (t) {Xy(t) && ls(t);});var n = ["xAxis", "yAxis", "radiusAxis", "angleAxis", "singleAxis", "parallelAxis", "radar"];e && n.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), Zy(n, function (e) {Zy(us(t[e]), function (t) {t && (os(t, "axisLabel"), os(t.axisPointer, "label"));});}), Zy(us(t.parallel), function (t) {var e = t && t.parallelAxisDefault;os(e, "axisLabel"), os(e && e.axisPointer, "label");}), Zy(us(t.calendar), function (t) {rs(t, "itemStyle"), os(t, "dayLabel"), os(t, "monthLabel"), os(t, "yearLabel");}), Zy(us(t.radar), function (t) {os(t, "name");}), Zy(us(t.geo), function (t) {Xy(t) && (ss(t), Zy(us(t.regions), function (t) {ss(t);}));}), Zy(us(t.timeline), function (t) {ss(t), rs(t, "label"), rs(t, "itemStyle"), rs(t, "controlStyle", !0);var e = t.data;_(e) && f(e, function (t) {M(t) && (rs(t, "label"), rs(t, "itemStyle"));});}), Zy(us(t.toolbox), function (t) {rs(t, "iconStyle"), Zy(t.feature, function (t) {rs(t, "iconStyle");});}), os(hs(t.axisPointer), "label"), os(hs(t.tooltip).axisPointer, "label");},jy = [["x", "left"], ["y", "top"], ["x2", "right"], ["y2", "bottom"]],Uy = ["grid", "geo", "parallel", "legend", "toolbox", "title", "visualMap", "dataZoom", "timeline"],$y = function $y(t, e) {qy(t, e), t.series = Ri(t.series), f(t.series, function (t) {if (M(t)) {var e = t.type;if (("pie" === e || "gauge" === e) && null != t.clockWise && (t.clockwise = t.clockWise), "gauge" === e) {var n = cs(t, "pointer.color");null != n && ds(t, "itemStyle.normal.color", n);}fs(t);}}), t.dataRange && (t.visualMap = t.dataRange), f(Uy, function (e) {var n = t[e];n && (_(n) || (n = [n]), f(n, function (t) {fs(t);}));});},Ky = function Ky(t) {var e = N();t.eachSeries(function (t) {var n = t.get("stack");if (n) {var i = e.get(n) || e.set(n, []),r = t.getData(),a = { stackResultDimension: r.getCalculationInfo("stackResultDimension"), stackedOverDimension: r.getCalculationInfo("stackedOverDimension"), stackedDimension: r.getCalculationInfo("stackedDimension"), stackedByDimension: r.getCalculationInfo("stackedByDimension"), isStackedByIndex: r.getCalculationInfo("isStackedByIndex"), data: r, seriesModel: t };if (!a.stackedDimension || !a.isStackedByIndex && !a.stackedByDimension) return;i.length && r.setCalculationInfo("stackedOnSeries", i[i.length - 1].seriesModel), i.push(a);}}), e.each(ps);},Qy = gs.prototype;Qy.pure = !1, Qy.persistent = !0, Qy.getSource = function () {return this._source;};var Jy = { arrayRows_column: { pure: !0, count: function count() {return Math.max(0, this._data.length - this._source.startIndex);}, getItem: function getItem(t) {return this._data[t + this._source.startIndex];}, appendData: ys }, arrayRows_row: { pure: !0, count: function count() {var t = this._data[0];return t ? Math.max(0, t.length - this._source.startIndex) : 0;}, getItem: function getItem(t) {t += this._source.startIndex;for (var e = [], n = this._data, i = 0; i < n.length; i++) {var r = n[i];e.push(r ? r[t] : null);}return e;}, appendData: function appendData() {throw new Error('Do not support appendData when set seriesLayoutBy: "row".');} }, objectRows: { pure: !0, count: vs, getItem: ms, appendData: ys }, keyedColumns: { pure: !0, count: function count() {var t = this._source.dimensionsDefine[0].name,e = this._data[t];return e ? e.length : 0;}, getItem: function getItem(t) {for (var e = [], n = this._source.dimensionsDefine, i = 0; i < n.length; i++) {var r = this._data[n[i].name];e.push(r ? r[t] : null);}return e;}, appendData: function appendData(t) {var e = this._data;f(t, function (t, n) {for (var i = e[n] || (e[n] = []), r = 0; r < (t || []).length; r++) {i.push(t[r]);}});} }, original: { count: vs, getItem: ms, appendData: ys }, typedArray: { persistent: !1, pure: !0, count: function count() {return this._data ? this._data.length / this._dimSize : 0;}, getItem: function getItem(t, e) {t -= this._offset, e = e || [];for (var n = this._dimSize * t, i = 0; i < this._dimSize; i++) {e[i] = this._data[n + i];}return e;}, appendData: function appendData(t) {this._data = t;}, clean: function clean() {this._offset += this.count(), this._data = null;} } },tx = { arrayRows: xs, objectRows: function objectRows(t, e, n, i) {return null != n ? t[i] : t;}, keyedColumns: xs, original: function original(t, e, n) {var i = Fi(t);return null != n && i instanceof Array ? i[n] : i;}, typedArray: xs },ex = { arrayRows: _s, objectRows: function objectRows(t, e) {return ws(t[e], this._dimensionInfos[e]);}, keyedColumns: _s, original: function original(t, e, n, i) {var r = t && (null == t.value ? t : t.value);return !this._rawData.pure && Vi(t) && (this.hasItemOption = !0), ws(r instanceof Array ? r[i] : r, this._dimensionInfos[e]);}, typedArray: function typedArray(t, e, n, i) {return t[i];} },nx = /\{@(.+?)\}/g,ix = { getDataParams: function getDataParams(t, e) {var n = this.getData(e),i = this.getRawValue(t, e),r = n.getRawIndex(t),a = n.getName(t),o = n.getRawDataItem(t),s = n.getItemVisual(t, "color"),l = this.ecModel.getComponent("tooltip"),u = l && l.get("renderMode"),h = Ki(u),c = this.mainType,d = "series" === c;return { componentType: c, componentSubType: this.subType, componentIndex: this.componentIndex, seriesType: d ? this.subType : null, seriesIndex: this.seriesIndex, seriesId: d ? this.id : null, seriesName: d ? this.name : null, name: a, dataIndex: r, data: o, dataType: e, value: i, color: s, marker: vo({ color: s, renderMode: h }), $vars: ["seriesName", "name", "value"] };}, getFormattedLabel: function getFormattedLabel(t, e, n, i, r) {e = e || "normal";var a = this.getData(n),o = a.getItemModel(t),s = this.getDataParams(t, n);null != i && s.value instanceof Array && (s.value = s.value[i]);var l = o.get("normal" === e ? [r || "label", "formatter"] : [e, r || "label", "formatter"]);if ("function" == typeof l) return s.status = e, l(s);if ("string" == typeof l) {var u = po(l, s);return u.replace(nx, function (e, n) {var i = n.length;return "[" === n.charAt(0) && "]" === n.charAt(i - 1) && (n = +n.slice(1, i - 1)), bs(a, t, n);});}}, getRawValue: function getRawValue(t, e) {return bs(this.getData(e), t);}, formatTooltip: function formatTooltip() {} },rx = Is.prototype;rx.perform = function (t) {function e(t) {return !(t >= 1) && (t = 1), t;}var n = this._upstream,i = t && t.skip;if (this._dirty && n) {var r = this.context;r.data = r.outputData = n.context.outputData;}this.__pipeline && (this.__pipeline.currentTask = this);var a;this._plan && !i && (a = this._plan(this.context));var o = e(this._modBy),s = this._modDataCount || 0,l = e(t && t.modBy),u = t && t.modDataCount || 0;(o !== l || s !== u) && (a = "reset");var h;(this._dirty || "reset" === a) && (this._dirty = !1, h = As(this, i)), this._modBy = l, this._modDataCount = u;var c = t && t.step;if (this._dueEnd = n ? n._outputDueEnd : this._count ? this._count(this.context) : 1 / 0, this._progress) {var d = this._dueIndex,f = Math.min(null != c ? this._dueIndex + c : 1 / 0, this._dueEnd);if (!i && (h || f > d)) {var p = this._progress;if (_(p)) for (var g = 0; g < p.length; g++) {Ts(this, p[g], d, f, l, u);} else Ts(this, p, d, f, l, u);}this._dueIndex = f;var v = null != this._settedOutputEnd ? this._settedOutputEnd : f;this._outputDueEnd = v;} else this._dueIndex = this._outputDueEnd = null != this._settedOutputEnd ? this._settedOutputEnd : this._dueEnd;return this.unfinished();};var ax = function () {function t() {return n > i ? i++ : null;}function e() {var t = i % o * r + Math.ceil(i / o),e = i >= n ? null : a > t ? t : i;return i++, e;}var n,i,r,a,o,s = { reset: function reset(l, u, h, c) {i = l, n = u, r = h, a = c, o = Math.ceil(a / r), s.next = r > 1 && a > 0 ? e : t;} };return s;}();rx.dirty = function () {this._dirty = !0, this._onDirty && this._onDirty(this.context);}, rx.unfinished = function () {return this._progress && this._dueIndex < this._dueEnd;}, rx.pipe = function (t) {(this._downstream !== t || this._dirty) && (this._downstream = t, t._upstream = this, t.dirty());}, rx.dispose = function () {this._disposed || (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, this._disposed = !0);}, rx.getUpstream = function () {return this._upstream;}, rx.getDownstream = function () {return this._downstream;}, rx.setOutputEnd = function (t) {this._outputDueEnd = this._settedOutputEnd = t;};var ox = Yi(),sx = _y.extend({ type: "series.__base__", seriesIndex: 0, coordinateSystem: null, defaultOption: null, legendDataProvider: null, visualColorAccessPath: "itemStyle.color", layoutMode: null, init: function init(t, e, n) {this.seriesIndex = this.componentIndex, this.dataTask = Ss({ count: ks, reset: Ps }), this.dataTask.context = { model: this }, this.mergeDefaultAndTheme(t, n), Oo(this);var i = this.getInitialData(t, n);Os(i, this), this.dataTask.context.data = i, ox(this).dataBeforeProcessed = i, Cs(this);}, mergeDefaultAndTheme: function mergeDefaultAndTheme(t, e) {var n = this.layoutMode,i = n ? Mo(t) : {},a = this.subType;_y.hasClass(a) && (a += "Series"), r(t, e.getTheme().get(this.subType)), r(t, this.getDefaultOption()), Ni(t, "label", ["show"]), this.fillDataTextStyle(t.data), n && bo(t, i, n);}, mergeOption: function mergeOption(t, e) {t = r(this.option, t, !0), this.fillDataTextStyle(t.data);var n = this.layoutMode;n && bo(this.option, t, n), Oo(this);var i = this.getInitialData(t, e);Os(i, this), this.dataTask.dirty(), this.dataTask.context.data = i, ox(this).dataBeforeProcessed = i, Cs(this);}, fillDataTextStyle: function fillDataTextStyle(t) {if (t && !I(t)) for (var e = ["show"], n = 0; n < t.length; n++) {t[n] && t[n].label && Ni(t[n], "label", e);}}, getInitialData: function getInitialData() {}, appendData: function appendData(t) {var e = this.getRawData();e.appendData(t.data);}, getData: function getData(t) {var e = Es(this);if (e) {var n = e.context.data;return null == t ? n : n.getLinkedData(t);}return ox(this).data;}, setData: function setData(t) {var e = Es(this);if (e) {var n = e.context;n.data !== t && e.modifyOutputEnd && e.setOutputEnd(t.count()), n.outputData = t, e !== this.dataTask && (n.data = t);}ox(this).data = t;}, getSource: function getSource() {return Po(this);}, getRawData: function getRawData() {return ox(this).dataBeforeProcessed;}, getBaseAxis: function getBaseAxis() {var t = this.coordinateSystem;return t && t.getBaseAxis && t.getBaseAxis();}, formatTooltip: function formatTooltip(t, e, n, i) {function r(n) {function r(t, n) {var r = c.getDimensionInfo(n);if (r && r.otherDims.tooltip !== !1) {var d = r.type,f = "sub" + o.seriesIndex + "at" + h,p = vo({ color: y, type: "subItem", renderMode: i, markerId: f }),g = "string" == typeof p ? p : p.content,v = (a ? g + fo(r.displayName || "-") + ": " : "") + fo("ordinal" === d ? t + "" : "time" === d ? e ? "" : yo("yyyy/MM/dd hh:mm:ss", t) : ho(t));v && s.push(v), l && (u[f] = y, ++h);}}var a = g(n, function (t, e, n) {var i = c.getDimensionInfo(n);return t |= i && i.tooltip !== !1 && null != i.displayName;}, 0),s = [];d.length ? f(d, function (e) {r(bs(c, t, e), e);}) : f(n, r);var p = a ? l ? "\n" : "<br/>" : "",v = p + s.join(p || ", ");return { renderMode: i, content: v, style: u };}function a(t) {return { renderMode: i, content: fo(ho(t)), style: u };}var o = this;i = i || "html";var s = "html" === i ? "<br/>" : "\n",l = "richText" === i,u = {},h = 0,c = this.getData(),d = c.mapDimension("defaultedTooltip", !0),p = d.length,v = this.getRawValue(t),m = _(v),y = c.getItemVisual(t, "color");M(y) && y.colorStops && (y = (y.colorStops[0] || {}).color), y = y || "transparent";var x = p > 1 || m && !p ? r(v) : a(p ? bs(c, t, d[0]) : m ? v[0] : v),w = x.content,b = o.seriesIndex + "at" + h,S = vo({ color: y, type: "item", renderMode: i, markerId: b });u[b] = y, ++h;var I = c.getName(t),T = this.name;Hi(this) || (T = ""), T = T ? fo(T) + (e ? ": " : s) : "";var A = "string" == typeof S ? S : S.content,C = e ? A + T + w : T + A + (I ? fo(I) + ": " + w : w);return { html: C, markers: u };}, isAnimationEnabled: function isAnimationEnabled() {if (np.node) return !1;var t = this.getShallow("animation");return t && this.getData().count() > this.getShallow("animationThreshold") && (t = !1), t;}, restoreData: function restoreData() {this.dataTask.dirty();}, getColorFromPalette: function getColorFromPalette(t, e, n) {var i = this.ecModel,r = Sy.getColorFromPalette.call(this, t, e, n);return r || (r = i.getColorFromPalette(t, e, n)), r;}, coordDimToDataDim: function coordDimToDataDim(t) {return this.getRawData().mapDimension(t, !0);}, getProgressive: function getProgressive() {return this.get("progressive");}, getProgressiveThreshold: function getProgressiveThreshold() {return this.get("progressiveThreshold");}, getAxisTooltipData: null, getTooltipPosition: null, pipeTask: null, preventIncremental: null, pipelineContext: null });c(sx, ix), c(sx, Sy);var lx = function lx() {this.group = new hg(), this.uid = Ha("viewComponent");};lx.prototype = { constructor: lx, init: function init() {}, render: function render() {}, dispose: function dispose() {}, filterForExposedEvent: null };var ux = lx.prototype;ux.updateView = ux.updateLayout = ux.updateVisual = function () {}, tr(lx), rr(lx, { registerWhenExtend: !0 });var hx = function hx() {var t = Yi();return function (e) {var n = t(e),i = e.pipelineContext,r = n.large,a = n.progressiveRender,o = n.large = i.large,s = n.progressiveRender = i.progressiveRender;return !!(r ^ o || a ^ s) && "reset";};},cx = Yi(),dx = hx();Bs.prototype = { type: "chart", init: function init() {}, render: function render() {}, highlight: function highlight(t, e, n, i) {Ns(t.getData(), i, "emphasis");}, downplay: function downplay(t, e, n, i) {Ns(t.getData(), i, "normal");}, remove: function remove() {this.group.removeAll();}, dispose: function dispose() {}, incrementalPrepareRender: null, incrementalRender: null, updateTransform: null, filterForExposedEvent: null };var fx = Bs.prototype;fx.updateView = fx.updateLayout = fx.updateVisual = function (t, e, n, i) {this.render(t, e, n, i);}, tr(Bs, ["dispose"]), rr(Bs, { registerWhenExtend: !0 }), Bs.markUpdateMethod = function (t, e) {cx(t).updateMethod = e;};var px = { incrementalPrepareRender: { progress: function progress(t, e) {e.view.incrementalRender(t, e.model, e.ecModel, e.api, e.payload);} }, render: { forceFirstProgress: !0, progress: function progress(t, e) {e.view.render(e.model, e.ecModel, e.api, e.payload);} } },gx = "\x00__throttleOriginMethod",vx = "\x00__throttleRate",mx = "\x00__throttleType",yx = { createOnAllSeries: !0, performRawSeries: !0, reset: function reset(t, e) {var n = t.getData(),i = (t.visualColorAccessPath || "itemStyle.color").split("."),r = t.get(i) || t.getColorFromPalette(t.name, null, e.getSeriesCount());if (n.setVisual("color", r), !e.isSeriesFiltered(t)) {"function" != typeof r || r instanceof Rm || n.each(function (e) {n.setItemVisual(e, "color", r(t.getDataParams(e)));});var a = function a(t, e) {var n = t.getItemModel(e),r = n.get(i, !0);null != r && t.setItemVisual(e, "color", r);};return { dataEach: n.hasItemOption ? a : null };}} },xx = { toolbox: { brush: { title: { rect: "矩形选择", polygon: "圈选", lineX: "横向选择", lineY: "纵向选择", keep: "保持选择", clear: "清除选择" } }, dataView: { title: "数据视图", lang: ["数据视图", "关闭", "刷新"] }, dataZoom: { title: { zoom: "区域缩放", back: "区域缩放还原" } }, magicType: { title: { line: "切换为折线图", bar: "切换为柱状图", stack: "切换为堆叠", tiled: "切换为平铺" } }, restore: { title: "还原" }, saveAsImage: { title: "保存为图片", lang: ["右键另存为图片"] } }, series: { typeNames: { pie: "饼图", bar: "柱状图", line: "折线图", scatter: "散点图", effectScatter: "涟漪散点图", radar: "雷达图", tree: "树图", treemap: "矩形树图", boxplot: "箱型图", candlestick: "K线图", k: "K线图", heatmap: "热力图", map: "地图", parallel: "平行坐标图", lines: "线图", graph: "关系图", sankey: "桑基图", funnel: "漏斗图", gauge: "仪表盘图", pictorialBar: "象形柱图", themeRiver: "主题河流图", sunburst: "旭日图" } }, aria: { general: { withTitle: "这是一个关于“{title}”的图表。", withoutTitle: "这是一个图表，" }, series: { single: { prefix: "", withName: "图表类型是{seriesType}，表示{seriesName}。", withoutName: "图表类型是{seriesType}。" }, multiple: { prefix: "它由{seriesCount}个图表系列组成。", withName: "第{seriesId}个系列是一个表示{seriesName}的{seriesType}，", withoutName: "第{seriesId}个系列是一个{seriesType}，", separator: { middle: "；", end: "。" } } }, data: { allData: "其数据是——", partialData: "其中，前{displayCnt}项是——", withName: "{name}的数据是{value}", withoutName: "{value}", separator: { middle: "，", end: "" } } } },_x = function _x(t, e) {function n(t, e) {if ("string" != typeof t) return t;var n = t;return f(e, function (t, e) {n = n.replace(new RegExp("\\{\\s*" + e + "\\s*\\}", "g"), t);}), n;}function i(t) {var e = o.get(t);if (null == e) {for (var n = t.split("."), i = xx.aria, r = 0; r < n.length; ++r) {i = i[n[r]];}return i;}return e;}function r() {var t = e.getModel("title").option;return t && t.length && (t = t[0]), t && t.text;}function a(t) {return xx.series.typeNames[t] || "自定义图";}var o = e.getModel("aria");if (o.get("show")) {if (o.get("description")) return void t.setAttribute("aria-label", o.get("description"));var s = 0;e.eachSeries(function () {++s;}, this);var l,u = o.get("data.maxCount") || 10,h = o.get("series.maxCount") || 10,c = Math.min(s, h);if (!(1 > s)) {var d = r();l = d ? n(i("general.withTitle"), { title: d }) : i("general.withoutTitle");var p = [],g = s > 1 ? "series.multiple.prefix" : "series.single.prefix";l += n(i(g), { seriesCount: s }), e.eachSeries(function (t, e) {if (c > e) {var r,o = t.get("name"),l = "series." + (s > 1 ? "multiple" : "single") + ".";r = i(o ? l + "withName" : l + "withoutName"), r = n(r, { seriesId: t.seriesIndex, seriesName: t.get("name"), seriesType: a(t.subType) });var h = t.getData();window.data = h, r += h.count() > u ? n(i("data.partialData"), { displayCnt: u }) : i("data.allData");for (var d = [], f = 0; f < h.count(); f++) {if (u > f) {var g = h.getName(f),v = bs(h, f);d.push(n(i(g ? "data.withName" : "data.withoutName"), { name: g, value: v }));}}r += d.join(i("data.separator.middle")) + i("data.separator.end"), p.push(r);}}), l += p.join(i("series.multiple.separator.middle")) + i("series.multiple.separator.end"), t.setAttribute("aria-label", l);}}},bx = Math.PI,Mx = function Mx(t, e) {e = e || {}, s(e, { text: "loading", color: "#c23531", textColor: "#000", maskColor: "rgba(255, 255, 255, 0.8)", zlevel: 0 });var n = new Pm({ style: { fill: e.maskColor }, zlevel: e.zlevel, z: 1e4 }),i = new Em({ shape: { startAngle: -bx / 2, endAngle: -bx / 2 + .1, r: 10 }, style: { stroke: e.color, lineCap: "round", lineWidth: 5 }, zlevel: e.zlevel, z: 10001 }),r = new Pm({ style: { fill: "none", text: e.text, textPosition: "right", textDistance: 10, textFill: e.textColor }, zlevel: e.zlevel, z: 10001 });i.animateShape(!0).when(1e3, { endAngle: 3 * bx / 2 }).start("circularInOut"), i.animateShape(!0).when(1e3, { startAngle: 3 * bx / 2 }).delay(300).start("circularInOut");var a = new hg();return a.add(i), a.add(r), a.add(n), a.resize = function () {var e = t.getWidth() / 2,a = t.getHeight() / 2;i.setShape({ cx: e, cy: a });var o = i.shape.r;r.setShape({ x: e - o, y: a - o, width: 2 * o, height: 2 * o }), n.setShape({ x: 0, y: 0, width: t.getWidth(), height: t.getHeight() });}, a.resize(), a;},Sx = Zs.prototype;Sx.restoreData = function (t, e) {t.restoreData(e), this._stageTaskMap.each(function (t) {var e = t.overallTask;e && e.dirty();});}, Sx.getPerformArgs = function (t, e) {if (t.__pipeline) {var n = this._pipelineMap.get(t.__pipeline.id),i = n.context,r = !e && n.progressiveEnabled && (!i || i.progressiveRender) && t.__idxInPipeline > n.blockIndex,a = r ? n.step : null,o = i && i.modDataCount,s = null != o ? Math.ceil(o / a) : null;return { step: a, modBy: s, modDataCount: o };}}, Sx.getPipeline = function (t) {return this._pipelineMap.get(t);}, Sx.updateStreamModes = function (t, e) {var n = this._pipelineMap.get(t.uid),i = t.getData(),r = i.count(),a = n.progressiveEnabled && e.incrementalPrepareRender && r >= n.threshold,o = t.get("large") && r >= t.get("largeThreshold"),s = "mod" === t.get("progressiveChunkMode") ? r : null;t.pipelineContext = n.context = { progressiveRender: a, modDataCount: s, large: o };}, Sx.restorePipelines = function (t) {var e = this,n = e._pipelineMap = N();t.eachSeries(function (t) {var i = t.getProgressive(),r = t.uid;n.set(r, { id: r, head: null, tail: null, threshold: t.getProgressiveThreshold(), progressiveEnabled: i && !(t.preventIncremental && t.preventIncremental()), blockIndex: -1, step: Math.round(i || 700), count: 0 }), nl(e, t, t.dataTask);});}, Sx.prepareStageTasks = function () {var t = this._stageTaskMap,e = this.ecInstance.getModel(),n = this.api;f(this._allHandlers, function (i) {var r = t.get(i.uid) || t.set(i.uid, []);i.reset && Ys(this, i, r, e, n), i.overallReset && qs(this, i, r, e, n);}, this);}, Sx.prepareView = function (t, e, n, i) {var r = t.renderTask,a = r.context;a.model = e, a.ecModel = n, a.api = i, r.__block = !t.incrementalPrepareRender, nl(this, e, r);}, Sx.performDataProcessorTasks = function (t, e) {Xs(this, this._dataProcessorHandlers, t, e, { block: !0 });}, Sx.performVisualTasks = function (t, e, n) {Xs(this, this._visualHandlers, t, e, n);}, Sx.performSeriesTasks = function (t) {var e;t.eachSeries(function (t) {e |= t.dataTask.perform();}), this.unfinished |= e;}, Sx.plan = function () {this._pipelineMap.each(function (t) {var e = t.tail;do {if (e.__block) {t.blockIndex = e.__idxInPipeline;break;}e = e.getUpstream();} while (e);});};var Ix = Sx.updatePayload = function (t, e) {"remain" !== e && (t.context.payload = e);},Tx = tl(0);Zs.wrapStageHandler = function (t, e) {return w(t) && (t = { overallReset: t, seriesType: il(t) }), t.uid = Ha("stageHandler"), e && (t.visualType = e), t;};var Ax,Cx = {},Dx = {};rl(Cx, By), rl(Dx, Uo), Cx.eachSeriesByType = Cx.eachRawSeriesByType = function (t) {Ax = t;}, Cx.eachComponent = function (t) {"series" === t.mainType && t.subType && (Ax = t.subType);};var kx = ["#37A2DA", "#32C5E9", "#67E0E3", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#E062AE", "#E690D1", "#e7bcf3", "#9d96f5", "#8378EA", "#96BFFF"],Px = { color: kx, colorLayer: [["#37A2DA", "#ffd85c", "#fd7b5f"], ["#37A2DA", "#67E0E3", "#FFDB5C", "#ff9f7f", "#E062AE", "#9d96f5"], ["#37A2DA", "#32C5E9", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#e7bcf3", "#8378EA", "#96BFFF"], kx] },Lx = "#eee",Ox = function Ox() {return { axisLine: { lineStyle: { color: Lx } }, axisTick: { lineStyle: { color: Lx } }, axisLabel: { textStyle: { color: Lx } }, splitLine: { lineStyle: { type: "dashed", color: "#aaa" } }, splitArea: { areaStyle: { color: Lx } } };},zx = ["#dd6b66", "#759aa0", "#e69d87", "#8dc1a9", "#ea7e53", "#eedd78", "#73a373", "#73b9bc", "#7289ab", "#91ca8c", "#f49f42"],Ex = { color: zx, backgroundColor: "#333", tooltip: { axisPointer: { lineStyle: { color: Lx }, crossStyle: { color: Lx } } }, legend: { textStyle: { color: Lx } }, textStyle: { color: Lx }, title: { textStyle: { color: Lx } }, toolbox: { iconStyle: { normal: { borderColor: Lx } } }, dataZoom: { textStyle: { color: Lx } }, visualMap: { textStyle: { color: Lx } }, timeline: { lineStyle: { color: Lx }, itemStyle: { normal: { color: zx[1] } }, label: { normal: { textStyle: { color: Lx } } }, controlStyle: { normal: { color: Lx, borderColor: Lx } } }, timeAxis: Ox(), logAxis: Ox(), valueAxis: Ox(), categoryAxis: Ox(), line: { symbol: "circle" }, graph: { color: zx }, gauge: { title: { textStyle: { color: Lx } } }, candlestick: { itemStyle: { normal: { color: "#FD1050", color0: "#0CF49B", borderColor: "#FD1050", borderColor0: "#0CF49B" } } } };Ex.categoryAxis.splitLine.show = !1, _y.extend({ type: "dataset", defaultOption: { seriesLayoutBy: Ly, sourceHeader: null, dimensions: null, source: null }, optionUpdated: function optionUpdated() {ko(this);} }), lx.extend({ type: "dataset" });var Bx = Nr.extend({ type: "ellipse", shape: { cx: 0, cy: 0, rx: 0, ry: 0 }, buildPath: function buildPath(t, e) {var n = .5522848,i = e.cx,r = e.cy,a = e.rx,o = e.ry,s = a * n,l = o * n;t.moveTo(i - a, r), t.bezierCurveTo(i - a, r - l, i - s, r - o, i, r - o), t.bezierCurveTo(i + s, r - o, i + a, r - l, i + a, r), t.bezierCurveTo(i + a, r + l, i + s, r + o, i, r + o), t.bezierCurveTo(i - s, r + o, i - a, r + l, i - a, r), t.closePath();} }),Rx = /[\s,]+/;ol.prototype.parse = function (t, e) {e = e || {};var n = al(t);if (!n) throw new Error("Illegal svg");var i = new hg();this._root = i;var r = n.getAttribute("viewBox") || "",a = parseFloat(n.getAttribute("width") || e.width),o = parseFloat(n.getAttribute("height") || e.height);isNaN(a) && (a = null), isNaN(o) && (o = null), hl(n, i, null, !0);for (var s = n.firstChild; s;) {this._parseNode(s, i), s = s.nextSibling;}var l, u;if (r) {var h = z(r).split(Rx);h.length >= 4 && (l = { x: parseFloat(h[0] || 0), y: parseFloat(h[1] || 0), width: parseFloat(h[2]), height: parseFloat(h[3]) });}if (l && null != a && null != o && (u = pl(l, a, o), !e.ignoreViewBox)) {var c = i;i = new hg(), i.add(c), c.scale = u.scale.slice(), c.position = u.position.slice();}return e.ignoreRootClip || null == a || null == o || i.setClipPath(new Pm({ shape: { x: 0, y: 0, width: a, height: o } })), { root: i, width: a, height: o, viewBoxRect: l, viewBoxTransform: u };}, ol.prototype._parseNode = function (t, e) {var n = t.nodeName.toLowerCase();"defs" === n ? this._isDefine = !0 : "text" === n && (this._isText = !0);var i;if (this._isDefine) {var r = Fx[n];if (r) {var a = r.call(this, t),o = t.getAttribute("id");o && (this._defs[o] = a);}} else {var r = Nx[n];r && (i = r.call(this, t, e), e.add(i));}for (var s = t.firstChild; s;) {1 === s.nodeType && this._parseNode(s, i), 3 === s.nodeType && this._isText && this._parseText(s, i), s = s.nextSibling;}"defs" === n ? this._isDefine = !1 : "text" === n && (this._isText = !1);}, ol.prototype._parseText = function (t, e) {if (1 === t.nodeType) {var n = t.getAttribute("dx") || 0,i = t.getAttribute("dy") || 0;this._textX += parseFloat(n), this._textY += parseFloat(i);}var r = new wm({ style: { text: t.textContent, transformText: !0 }, position: [this._textX || 0, this._textY || 0] });ll(e, r), hl(t, r, this._defs);var a = r.style.fontSize;a && 9 > a && (r.style.fontSize = 9, r.scale = r.scale || [1, 1], r.scale[0] *= a / 9, r.scale[1] *= a / 9);var o = r.getBoundingRect();return this._textX += o.width, e.add(r), r;};var Nx = { g: function g(t, e) {var n = new hg();return ll(e, n), hl(t, n, this._defs), n;}, rect: function rect(t, e) {var n = new Pm();return ll(e, n), hl(t, n, this._defs), n.setShape({ x: parseFloat(t.getAttribute("x") || 0), y: parseFloat(t.getAttribute("y") || 0), width: parseFloat(t.getAttribute("width") || 0), height: parseFloat(t.getAttribute("height") || 0) }), n;}, circle: function circle(t, e) {var n = new bm();return ll(e, n), hl(t, n, this._defs), n.setShape({ cx: parseFloat(t.getAttribute("cx") || 0), cy: parseFloat(t.getAttribute("cy") || 0), r: parseFloat(t.getAttribute("r") || 0) }), n;}, line: function line(t, e) {var n = new Lm();return ll(e, n), hl(t, n, this._defs), n.setShape({ x1: parseFloat(t.getAttribute("x1") || 0), y1: parseFloat(t.getAttribute("y1") || 0), x2: parseFloat(t.getAttribute("x2") || 0), y2: parseFloat(t.getAttribute("y2") || 0) }), n;}, ellipse: function ellipse(t, e) {var n = new Bx();return ll(e, n), hl(t, n, this._defs), n.setShape({ cx: parseFloat(t.getAttribute("cx") || 0), cy: parseFloat(t.getAttribute("cy") || 0), rx: parseFloat(t.getAttribute("rx") || 0), ry: parseFloat(t.getAttribute("ry") || 0) }), n;}, polygon: function polygon(t, e) {var n = t.getAttribute("points");n && (n = ul(n));var i = new Dm({ shape: { points: n || [] } });return ll(e, i), hl(t, i, this._defs), i;}, polyline: function polyline(t, e) {var n = new Nr();ll(e, n), hl(t, n, this._defs);var i = t.getAttribute("points");i && (i = ul(i));var r = new km({ shape: { points: i || [] } });return r;}, image: function image(t, e) {var n = new mi();return ll(e, n), hl(t, n, this._defs), n.setStyle({ image: t.getAttribute("xlink:href"), x: t.getAttribute("x"), y: t.getAttribute("y"), width: t.getAttribute("width"), height: t.getAttribute("height") }), n;}, text: function text(t, e) {var n = t.getAttribute("x") || 0,i = t.getAttribute("y") || 0,r = t.getAttribute("dx") || 0,a = t.getAttribute("dy") || 0;this._textX = parseFloat(n) + parseFloat(r), this._textY = parseFloat(i) + parseFloat(a);var o = new hg();return ll(e, o), hl(t, o, this._defs), o;}, tspan: function tspan(t, e) {var n = t.getAttribute("x"),i = t.getAttribute("y");null != n && (this._textX = parseFloat(n)), null != i && (this._textY = parseFloat(i));var r = t.getAttribute("dx") || 0,a = t.getAttribute("dy") || 0,o = new hg();return ll(e, o), hl(t, o, this._defs), this._textX += r, this._textY += a, o;}, path: function path(t, e) {var n = t.getAttribute("d") || "",i = Gr(n);return ll(e, i), hl(t, i, this._defs), i;} },Fx = { lineargradient: function lineargradient(t) {var e = parseInt(t.getAttribute("x1") || 0, 10),n = parseInt(t.getAttribute("y1") || 0, 10),i = parseInt(t.getAttribute("x2") || 10, 10),r = parseInt(t.getAttribute("y2") || 0, 10),a = new Nm(e, n, i, r);return sl(t, a), a;}, radialgradient: function radialgradient() {} },Vx = { fill: "fill", stroke: "stroke", "stroke-width": "lineWidth", opacity: "opacity", "fill-opacity": "fillOpacity", "stroke-opacity": "strokeOpacity", "stroke-dasharray": "lineDash", "stroke-dashoffset": "lineDashOffset", "stroke-linecap": "lineCap", "stroke-linejoin": "lineJoin", "stroke-miterlimit": "miterLimit", "font-family": "fontFamily", "font-size": "fontSize", "font-style": "fontStyle", "font-weight": "fontWeight", "text-align": "textAlign", "alignment-baseline": "textBaseline" },Wx = /url\(\s*#(.*?)\)/,Gx = /(translate|scale|rotate|skewX|skewY|matrix)\(([\-\s0-9\.e,]*)\)/g,Hx = /([^\s:;]+)\s*:\s*([^:;]+)/g,Zx = N(),Xx = { registerMap: function registerMap(t, e, n) {var i;
      return _(e) ? i = e : e.svg ? i = [{ type: "svg", source: e.svg, specialAreas: e.specialAreas }] : (e.geoJson && !e.features && (n = e.specialAreas, e = e.geoJson), i = [{ type: "geoJSON", source: e, specialAreas: n }]), f(i, function (t) {var e = t.type;"geoJson" === e && (e = t.type = "geoJSON");var n = Yx[e];n(t);}), Zx.set(t, i);}, retrieveMap: function retrieveMap(t) {return Zx.get(t);} },Yx = { geoJSON: function geoJSON(t) {var e = t.source;t.geoJSON = b(e) ? "undefined" != typeof JSON && JSON.parse ? JSON.parse(e) : new Function("return (" + e + ");")() : e;}, svg: function svg(t) {t.svgXML = al(t.source);} },qx = O,jx = f,Ux = w,$x = M,Kx = _y.parseClassType,Qx = "4.2.0",Jx = { zrender: "4.0.5" },t_ = 1,e_ = 1e3,n_ = 5e3,i_ = 1e3,r_ = 2e3,a_ = 3e3,o_ = 4e3,s_ = 5e3,l_ = { PROCESSOR: { FILTER: e_, STATISTIC: n_ }, VISUAL: { LAYOUT: i_, GLOBAL: r_, CHART: a_, COMPONENT: o_, BRUSH: s_ } },u_ = "__flagInMainProcess",h_ = "__optionUpdated",c_ = /^[a-zA-Z0-9_]+$/;vl.prototype.on = gl("on"), vl.prototype.off = gl("off"), vl.prototype.one = gl("one"), c(vl, Sp);var d_ = ml.prototype;d_._onframe = function () {if (!this._disposed) {var t = this._scheduler;if (this[h_]) {var e = this[h_].silent;this[u_] = !0, xl(this), f_.update.call(this), this[u_] = !1, this[h_] = !1, Ml.call(this, e), Sl.call(this, e);} else if (t.unfinished) {var n = t_,i = this._model,r = this._api;t.unfinished = !1;do {var a = +new Date();t.performSeriesTasks(i), t.performDataProcessorTasks(i), wl(this, i), t.performVisualTasks(i), kl(this, this._model, r, "remain"), n -= +new Date() - a;} while (n > 0 && t.unfinished);t.unfinished || this._zr.flush();}}}, d_.getDom = function () {return this._dom;}, d_.getZr = function () {return this._zr;}, d_.setOption = function (t, e, n) {var i;if ($x(e) && (n = e.lazyUpdate, i = e.silent, e = e.notMerge), this[u_] = !0, !this._model || e) {var r = new Ko(this._api),a = this._theme,o = this._model = new By(null, null, a, r);o.scheduler = this._scheduler, o.init(null, null, a, r);}this._model.setOption(t, y_), n ? (this[h_] = { silent: i }, this[u_] = !1) : (xl(this), f_.update.call(this), this._zr.flush(), this[h_] = !1, this[u_] = !1, Ml.call(this, i), Sl.call(this, i));}, d_.setTheme = function () {console.error("ECharts#setTheme() is DEPRECATED in ECharts 3.0");}, d_.getModel = function () {return this._model;}, d_.getOption = function () {return this._model && this._model.getOption();}, d_.getWidth = function () {return this._zr.getWidth();}, d_.getHeight = function () {return this._zr.getHeight();}, d_.getDevicePixelRatio = function () {return this._zr.painter.dpr || window.devicePixelRatio || 1;}, d_.getRenderedCanvas = function (t) {if (np.canvasSupported) {t = t || {}, t.pixelRatio = t.pixelRatio || 1, t.backgroundColor = t.backgroundColor || this._model.get("backgroundColor");var e = this._zr;return e.painter.getRenderedCanvas(t);}}, d_.getSvgDataUrl = function () {if (np.svgSupported) {var t = this._zr,e = t.storage.getDisplayList();return f(e, function (t) {t.stopAnimation(!0);}), t.painter.pathToDataUrl();}}, d_.getDataURL = function (t) {t = t || {};var e = t.excludeComponents,n = this._model,i = [],r = this;jx(e, function (t) {n.eachComponent({ mainType: t }, function (t) {var e = r._componentsMap[t.__viewId];e.group.ignore || (i.push(e), e.group.ignore = !0);});});var a = "svg" === this._zr.painter.getType() ? this.getSvgDataUrl() : this.getRenderedCanvas(t).toDataURL("image/" + (t && t.type || "png"));return jx(i, function (t) {t.group.ignore = !1;}), a;}, d_.getConnectedDataURL = function (t) {if (np.canvasSupported) {var e = this.group,n = Math.min,r = Math.max,a = 1 / 0;if (S_[e]) {var o = a,s = a,l = -a,u = -a,h = [],c = t && t.pixelRatio || 1;f(M_, function (a) {if (a.group === e) {var c = a.getRenderedCanvas(i(t)),d = a.getDom().getBoundingClientRect();o = n(d.left, o), s = n(d.top, s), l = r(d.right, l), u = r(d.bottom, u), h.push({ dom: c, left: d.left, top: d.top });}}), o *= c, s *= c, l *= c, u *= c;var d = l - o,p = u - s,g = fp();g.width = d, g.height = p;var v = Li(g);return jx(h, function (t) {var e = new mi({ style: { x: t.left * c - o, y: t.top * c - s, image: t.dom } });v.add(e);}), v.refreshImmediately(), g.toDataURL("image/" + (t && t.type || "png"));}return this.getDataURL(t);}}, d_.convertToPixel = x(yl, "convertToPixel"), d_.convertFromPixel = x(yl, "convertFromPixel"), d_.containPixel = function (t, e) {var n,i = this._model;return t = qi(i, t), f(t, function (t, i) {i.indexOf("Models") >= 0 && f(t, function (t) {var r = t.coordinateSystem;if (r && r.containPoint) n |= !!r.containPoint(e);else if ("seriesModels" === i) {var a = this._chartsMap[t.__viewId];a && a.containPoint && (n |= a.containPoint(e, t));}}, this);}, this), !!n;}, d_.getVisual = function (t, e) {var n = this._model;t = qi(n, t, { defaultMainType: "series" });var i = t.seriesModel,r = i.getData(),a = t.hasOwnProperty("dataIndexInside") ? t.dataIndexInside : t.hasOwnProperty("dataIndex") ? r.indexOfRawIndex(t.dataIndex) : null;return null != a ? r.getItemVisual(a, e) : r.getVisual(e);}, d_.getViewOfComponentModel = function (t) {return this._componentsMap[t.__viewId];}, d_.getViewOfSeriesModel = function (t) {return this._chartsMap[t.__viewId];};var f_ = { prepareAndUpdate: function prepareAndUpdate(t) {xl(this), f_.update.call(this, t);}, update: function update(t) {var e = this._model,n = this._api,i = this._zr,r = this._coordSysMgr,a = this._scheduler;if (e) {a.restoreData(e, t), a.performSeriesTasks(e), r.create(e, n), a.performDataProcessorTasks(e, t), wl(this, e), r.update(e, n), Al(e), a.performVisualTasks(e, t), Cl(this, e, n, t);var o = e.get("backgroundColor") || "transparent";if (np.canvasSupported) i.setBackgroundColor(o);else {var s = He(o);o = Qe(s, "rgb"), 0 === s[3] && (o = "transparent");}Pl(e, n);}}, updateTransform: function updateTransform(t) {var e = this._model,n = this,i = this._api;if (e) {var r = [];e.eachComponent(function (a, o) {var s = n.getViewOfComponentModel(o);if (s && s.__alive) if (s.updateTransform) {var l = s.updateTransform(o, e, i, t);l && l.update && r.push(s);} else r.push(s);});var a = N();e.eachSeries(function (r) {var o = n._chartsMap[r.__viewId];if (o.updateTransform) {var s = o.updateTransform(r, e, i, t);s && s.update && a.set(r.uid, 1);} else a.set(r.uid, 1);}), Al(e), this._scheduler.performVisualTasks(e, t, { setDirty: !0, dirtyMap: a }), kl(n, e, i, t, a), Pl(e, this._api);}}, updateView: function updateView(t) {var e = this._model;e && (Bs.markUpdateMethod(t, "updateView"), Al(e), this._scheduler.performVisualTasks(e, t, { setDirty: !0 }), Cl(this, this._model, this._api, t), Pl(e, this._api));}, updateVisual: function updateVisual(t) {f_.update.call(this, t);}, updateLayout: function updateLayout(t) {f_.update.call(this, t);} };d_.resize = function (t) {this._zr.resize(t);var e = this._model;if (this._loadingFX && this._loadingFX.resize(), e) {var n = e.resetOption("media"),i = t && t.silent;this[u_] = !0, n && xl(this), f_.update.call(this), this[u_] = !1, Ml.call(this, i), Sl.call(this, i);}}, d_.showLoading = function (t, e) {if ($x(t) && (e = t, t = ""), t = t || "default", this.hideLoading(), b_[t]) {var n = b_[t](this._api, e),i = this._zr;this._loadingFX = n, i.add(n);}}, d_.hideLoading = function () {this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;}, d_.makeActionFromEvent = function (t) {var e = o({}, t);return e.type = v_[t.type], e;}, d_.dispatchAction = function (t, e) {if ($x(e) || (e = { silent: !!e }), g_[t.type] && this._model) {if (this[u_]) return void this._pendingActions.push(t);bl.call(this, t, e.silent), e.flush ? this._zr.flush(!0) : e.flush !== !1 && np.browser.weChat && this._throttledZrFlush(), Ml.call(this, e.silent), Sl.call(this, e.silent);}}, d_.appendData = function (t) {var e = t.seriesIndex,n = this.getModel(),i = n.getSeriesByIndex(e);i.appendData(t), this._scheduler.unfinished = !0;}, d_.on = gl("on"), d_.off = gl("off"), d_.one = gl("one");var p_ = ["click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "globalout", "contextmenu"];d_._initEvents = function () {jx(p_, function (t) {this._zr.on(t, function (e) {var n,i = this.getModel(),r = e.target,a = "globalout" === t;if (a) n = {};else if (r && null != r.dataIndex) {var s = r.dataModel || i.getSeriesByIndex(r.seriesIndex);n = s && s.getDataParams(r.dataIndex, r.dataType, r) || {};} else r && r.eventData && (n = o({}, r.eventData));if (n) {var l = n.componentType,u = n.componentIndex;("markLine" === l || "markPoint" === l || "markArea" === l) && (l = "series", u = n.seriesIndex);var h = l && null != u && i.getComponent(l, u),c = h && this["series" === h.mainType ? "_chartsMap" : "_componentsMap"][h.__viewId];n.event = e, n.type = t, this._ecEventProcessor.eventInfo = { targetEl: r, packedEvent: n, model: h, view: c }, this.trigger(t, n);}}, this);}, this), jx(v_, function (t, e) {this._messageCenter.on(e, function (t) {this.trigger(e, t);}, this);}, this);}, d_.isDisposed = function () {return this._disposed;}, d_.clear = function () {this.setOption({ series: [] }, !0);}, d_.dispose = function () {if (!this._disposed) {this._disposed = !0, Ui(this.getDom(), A_, "");var t = this._api,e = this._model;jx(this._componentsViews, function (n) {n.dispose(e, t);}), jx(this._chartsViews, function (n) {n.dispose(e, t);}), this._zr.dispose(), delete M_[this.id];}}, c(ml, Sp), Bl.prototype = { constructor: Bl, normalizeQuery: function normalizeQuery(t) {var e = {},n = {},i = {};if (b(t)) {var r = Kx(t);e.mainType = r.main || null, e.subType = r.sub || null;} else {var a = ["Index", "Name", "Id"],o = { name: 1, dataIndex: 1, dataType: 1 };f(t, function (t, r) {for (var s = !1, l = 0; l < a.length; l++) {var u = a[l],h = r.lastIndexOf(u);if (h > 0 && h === r.length - u.length) {var c = r.slice(0, h);"data" !== c && (e.mainType = c, e[u.toLowerCase()] = t, s = !0);}}o.hasOwnProperty(r) && (n[r] = t, s = !0), s || (i[r] = t);});}return { cptQuery: e, dataQuery: n, otherQuery: i };}, filter: function filter(t, e) {function n(t, e, n, i) {return null == t[n] || e[i || n] === t[n];}var i = this.eventInfo;if (!i) return !0;var r = i.targetEl,a = i.packedEvent,o = i.model,s = i.view;if (!o || !s) return !0;var l = e.cptQuery,u = e.dataQuery;return n(l, o, "mainType") && n(l, o, "subType") && n(l, o, "index", "componentIndex") && n(l, o, "name") && n(l, o, "id") && n(u, a, "name") && n(u, a, "dataIndex") && n(u, a, "dataType") && (!s.filterForExposedEvent || s.filterForExposedEvent(t, e.otherQuery, r, a));}, afterTrigger: function afterTrigger() {this.eventInfo = null;} };var g_ = {},v_ = {},m_ = [],y_ = [],x_ = [],__ = [],w_ = {},b_ = {},M_ = {},S_ = {},I_ = new Date() - 0,T_ = new Date() - 0,A_ = "_echarts_instance_",C_ = Vl;Ql(r_, yx), Xl($y), Yl(n_, Ky), tu("default", Mx), jl({ type: "highlight", event: "highlight", update: "highlight" }, V), jl({ type: "downplay", event: "downplay", update: "downplay" }, V), Zl("light", Px), Zl("dark", Ex);var D_ = {};uu.prototype = { constructor: uu, add: function add(t) {return this._add = t, this;}, update: function update(t) {return this._update = t, this;}, remove: function remove(t) {return this._remove = t, this;}, execute: function execute() {var t,e = this._old,n = this._new,i = {},r = {},a = [],o = [];for (hu(e, i, a, "_oldKeyGetter", this), hu(n, r, o, "_newKeyGetter", this), t = 0; t < e.length; t++) {var s = a[t],l = r[s];if (null != l) {var u = l.length;u ? (1 === u && (r[s] = null), l = l.unshift()) : r[s] = null, this._update && this._update(l, t);} else this._remove && this._remove(t);}for (var t = 0; t < o.length; t++) {var s = o[t];if (r.hasOwnProperty(s)) {var l = r[s];if (null == l) continue;if (l.length) for (var h = 0, u = l.length; u > h; h++) {this._add && this._add(l[h]);} else this._add && this._add(l);}}} };var k_ = N(["tooltip", "label", "itemName", "itemId", "seriesName"]),P_ = M,L_ = "undefined",O_ = "e\x00\x00",z_ = { "float": typeof Float64Array === L_ ? Array : Float64Array, "int": typeof Int32Array === L_ ? Array : Int32Array, ordinal: Array, number: Array, time: Array },E_ = typeof Uint32Array === L_ ? Array : Uint32Array,B_ = typeof Uint16Array === L_ ? Array : Uint16Array,R_ = ["hasItemOption", "_nameList", "_idList", "_invertedIndicesMap", "_rawData", "_chunkSize", "_chunkCount", "_dimValueGetter", "_count", "_rawCount", "_nameDimIdx", "_idDimIdx"],N_ = ["_extent", "_approximateExtent", "_rawExtent"],F_ = function F_(t, e) {t = t || ["x", "y"];for (var n = {}, i = [], r = {}, a = 0; a < t.length; a++) {var o = t[a];b(o) && (o = { name: o });var s = o.name;o.type = o.type || "float", o.coordDim || (o.coordDim = s, o.coordDimIndex = 0), o.otherDims = o.otherDims || {}, i.push(s), n[s] = o, o.index = a, o.createInvertedIndices && (r[s] = []);}this.dimensions = i, this._dimensionInfos = n, this.hostModel = e, this.dataType, this._indices = null, this._count = 0, this._rawCount = 0, this._storage = {}, this._nameList = [], this._idList = [], this._optionModels = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this.hasItemVisual = {}, this._itemLayouts = [], this._graphicEls = [], this._chunkSize = 1e5, this._chunkCount = 0, this._rawData, this._rawExtent = {}, this._extent = {}, this._approximateExtent = {}, this._dimensionsSummary = cu(this), this._invertedIndicesMap = r, this._calculationInfo = {};},V_ = F_.prototype;V_.type = "list", V_.hasItemOption = !0, V_.getDimension = function (t) {return isNaN(t) || (t = this.dimensions[t] || t), t;}, V_.getDimensionInfo = function (t) {return this._dimensionInfos[this.getDimension(t)];}, V_.getDimensionsOnCoord = function () {return this._dimensionsSummary.dataDimsOnCoord.slice();}, V_.mapDimension = function (t, e) {var n = this._dimensionsSummary;if (null == e) return n.encodeFirstDimNotExtra[t];var i = n.encode[t];return e === !0 ? (i || []).slice() : i && i[e];}, V_.initData = function (t, e, n) {var i = Do.isInstance(t) || d(t);i && (t = new gs(t, this.dimensions.length)), this._rawData = t, this._storage = {}, this._indices = null, this._nameList = e || [], this._idList = [], this._nameRepeatCount = {}, n || (this.hasItemOption = !1), this.defaultDimValueGetter = ex[this._rawData.getSource().sourceFormat], this._dimValueGetter = n = n || this.defaultDimValueGetter, this._rawExtent = {}, this._initDataFromProvider(0, t.count()), t.pure && (this.hasItemOption = !1);}, V_.getProvider = function () {return this._rawData;}, V_.appendData = function (t) {var e = this._rawData,n = this.count();e.appendData(t);var i = e.count();e.persistent || (i += n), this._initDataFromProvider(n, i);}, V_._initDataFromProvider = function (t, e) {if (!(t >= e)) {for (var n, i = this._chunkSize, r = this._rawData, a = this._storage, o = this.dimensions, s = o.length, l = this._dimensionInfos, u = this._nameList, h = this._idList, c = this._rawExtent, d = this._nameRepeatCount = {}, f = this._chunkCount, p = f - 1, g = 0; s > g; g++) {var v = o[g];c[v] || (c[v] = Iu());var m = l[v];0 === m.otherDims.itemName && (n = this._nameDimIdx = g), 0 === m.otherDims.itemId && (this._idDimIdx = g);var y = z_[m.type];a[v] || (a[v] = []);var x = a[v][p];if (x && x.length < i) {for (var _ = new y(Math.min(e - p * i, i)), w = 0; w < x.length; w++) {_[w] = x[w];}a[v][p] = _;}for (var b = f * i; e > b; b += i) {a[v].push(new y(Math.min(e - b, i)));}this._chunkCount = a[v].length;}for (var M = new Array(s), S = t; e > S; S++) {M = r.getItem(S, M);for (var I = Math.floor(S / i), T = S % i, b = 0; s > b; b++) {var v = o[b],A = a[v][I],C = this._dimValueGetter(M, v, S, b);A[T] = C;var D = c[v];C < D[0] && (D[0] = C), C > D[1] && (D[1] = C);}if (!r.pure) {var k = u[S];if (M && null == k) if (null != M.name) u[S] = k = M.name;else if (null != n) {var P = o[n],L = a[P][I];if (L) {k = L[T];var O = l[P].ordinalMeta;O && O.categories.length && (k = O.categories[k]);}}var z = null == M ? null : M.id;null == z && null != k && (d[k] = d[k] || 0, z = k, d[k] > 0 && (z += "__ec__" + d[k]), d[k]++), null != z && (h[S] = z);}}!r.persistent && r.clean && r.clean(), this._rawCount = this._count = e, this._extent = {}, mu(this);}}, V_.count = function () {return this._count;}, V_.getIndices = function () {var t,e = this._indices;if (e) {var n = e.constructor,i = this._count;if (n === Array) {t = new n(i);for (var r = 0; i > r; r++) {t[r] = e[r];}} else t = new n(e.buffer, 0, i);} else for (var n = pu(this), t = new n(this.count()), r = 0; r < t.length; r++) {t[r] = r;}return t;}, V_.get = function (t, e) {if (!(e >= 0 && e < this._count)) return 0 / 0;var n = this._storage;if (!n[t]) return 0 / 0;e = this.getRawIndex(e);var i = Math.floor(e / this._chunkSize),r = e % this._chunkSize,a = n[t][i],o = a[r];return o;}, V_.getByRawIndex = function (t, e) {if (!(e >= 0 && e < this._rawCount)) return 0 / 0;var n = this._storage[t];if (!n) return 0 / 0;var i = Math.floor(e / this._chunkSize),r = e % this._chunkSize,a = n[i];return a[r];}, V_._getFast = function (t, e) {var n = Math.floor(e / this._chunkSize),i = e % this._chunkSize,r = this._storage[t][n];return r[i];}, V_.getValues = function (t, e) {var n = [];_(t) || (e = t, t = this.dimensions);for (var i = 0, r = t.length; r > i; i++) {n.push(this.get(t[i], e));}return n;}, V_.hasValue = function (t) {for (var e = this._dimensionsSummary.dataDimsOnCoord, n = this._dimensionInfos, i = 0, r = e.length; r > i; i++) {if ("ordinal" !== n[e[i]].type && isNaN(this.get(e[i], t))) return !1;}return !0;}, V_.getDataExtent = function (t) {t = this.getDimension(t);var e = this._storage[t],n = Iu();if (!e) return n;var i,r = this.count(),a = !this._indices;if (a) return this._rawExtent[t].slice();if (i = this._extent[t]) return i.slice();i = n;for (var o = i[0], s = i[1], l = 0; r > l; l++) {var u = this._getFast(t, this.getRawIndex(l));o > u && (o = u), u > s && (s = u);}return i = [o, s], this._extent[t] = i, i;}, V_.getApproximateExtent = function (t) {return t = this.getDimension(t), this._approximateExtent[t] || this.getDataExtent(t);}, V_.setApproximateExtent = function (t, e) {e = this.getDimension(e), this._approximateExtent[e] = t.slice();}, V_.getCalculationInfo = function (t) {return this._calculationInfo[t];}, V_.setCalculationInfo = function (t, e) {P_(t) ? o(this._calculationInfo, t) : this._calculationInfo[t] = e;}, V_.getSum = function (t) {var e = this._storage[t],n = 0;if (e) for (var i = 0, r = this.count(); r > i; i++) {var a = this.get(t, i);isNaN(a) || (n += a);}return n;}, V_.getMedian = function (t) {var e = [];this.each(t, function (t) {isNaN(t) || e.push(t);});var n = [].concat(e).sort(function (t, e) {return t - e;}),i = this.count();return 0 === i ? 0 : i % 2 === 1 ? n[(i - 1) / 2] : (n[i / 2] + n[i / 2 - 1]) / 2;}, V_.rawIndexOf = function (t, e) {var n = t && this._invertedIndicesMap[t],i = n[e];return null == i || isNaN(i) ? -1 : i;}, V_.indexOfName = function (t) {for (var e = 0, n = this.count(); n > e; e++) {if (this.getName(e) === t) return e;}return -1;}, V_.indexOfRawIndex = function (t) {if (!this._indices) return t;if (t >= this._rawCount || 0 > t) return -1;var e = this._indices,n = e[t];if (null != n && n < this._count && n === t) return t;for (var i = 0, r = this._count - 1; r >= i;) {var a = (i + r) / 2 | 0;if (e[a] < t) i = a + 1;else {if (!(e[a] > t)) return a;r = a - 1;}}return -1;}, V_.indicesOfNearest = function (t, e, n) {var i = this._storage,r = i[t],a = [];if (!r) return a;null == n && (n = 1 / 0);for (var o = Number.MAX_VALUE, s = -1, l = 0, u = this.count(); u > l; l++) {var h = e - this.get(t, l),c = Math.abs(h);n >= h && o >= c && ((o > c || h >= 0 && 0 > s) && (o = c, s = h, a.length = 0), a.push(l));}return a;}, V_.getRawIndex = xu, V_.getRawDataItem = function (t) {if (this._rawData.persistent) return this._rawData.getItem(this.getRawIndex(t));for (var e = [], n = 0; n < this.dimensions.length; n++) {var i = this.dimensions[n];e.push(this.get(i, t));}return e;}, V_.getName = function (t) {var e = this.getRawIndex(t);return this._nameList[e] || yu(this, this._nameDimIdx, e) || "";}, V_.getId = function (t) {return wu(this, this.getRawIndex(t));}, V_.each = function (t, e, n, i) {if (this._count) {"function" == typeof t && (i = n, n = e, e = t, t = []), n = n || i || this, t = p(bu(t), this.getDimension, this);for (var r = t.length, a = 0; a < this.count(); a++) {switch (r) {case 0:e.call(n, a);break;case 1:e.call(n, this.get(t[0], a), a);break;case 2:e.call(n, this.get(t[0], a), this.get(t[1], a), a);break;default:for (var o = 0, s = []; r > o; o++) {s[o] = this.get(t[o], a);}s[o] = a, e.apply(n, s);}}}}, V_.filterSelf = function (t, e, n, i) {if (this._count) {"function" == typeof t && (i = n, n = e, e = t, t = []), n = n || i || this, t = p(bu(t), this.getDimension, this);for (var r = this.count(), a = pu(this), o = new a(r), s = [], l = t.length, u = 0, h = t[0], c = 0; r > c; c++) {var d,f = this.getRawIndex(c);if (0 === l) d = e.call(n, c);else if (1 === l) {var g = this._getFast(h, f);d = e.call(n, g, c);} else {for (var v = 0; l > v; v++) {s[v] = this._getFast(h, f);}s[v] = c, d = e.apply(n, s);}d && (o[u++] = f);}return r > u && (this._indices = o), this._count = u, this._extent = {}, this.getRawIndex = this._indices ? _u : xu, this;}}, V_.selectRange = function (t) {if (this._count) {var e = [];for (var n in t) {t.hasOwnProperty(n) && e.push(n);}var i = e.length;if (i) {var r = this.count(),a = pu(this),o = new a(r),s = 0,l = e[0],u = t[l][0],h = t[l][1],c = !1;if (!this._indices) {var d = 0;if (1 === i) {for (var f = this._storage[e[0]], p = 0; p < this._chunkCount; p++) {for (var g = f[p], v = Math.min(this._count - p * this._chunkSize, this._chunkSize), m = 0; v > m; m++) {var y = g[m];(y >= u && h >= y || isNaN(y)) && (o[s++] = d), d++;}}c = !0;} else if (2 === i) {for (var f = this._storage[l], x = this._storage[e[1]], _ = t[e[1]][0], w = t[e[1]][1], p = 0; p < this._chunkCount; p++) {for (var g = f[p], b = x[p], v = Math.min(this._count - p * this._chunkSize, this._chunkSize), m = 0; v > m; m++) {var y = g[m],M = b[m];(y >= u && h >= y || isNaN(y)) && (M >= _ && w >= M || isNaN(M)) && (o[s++] = d), d++;}}c = !0;}}if (!c) if (1 === i) for (var m = 0; r > m; m++) {var S = this.getRawIndex(m),y = this._getFast(l, S);(y >= u && h >= y || isNaN(y)) && (o[s++] = S);} else for (var m = 0; r > m; m++) {for (var I = !0, S = this.getRawIndex(m), p = 0; i > p; p++) {var T = e[p],y = this._getFast(n, S);(y < t[T][0] || y > t[T][1]) && (I = !1);}I && (o[s++] = this.getRawIndex(m));}return r > s && (this._indices = o), this._count = s, this._extent = {}, this.getRawIndex = this._indices ? _u : xu, this;}}}, V_.mapArray = function (t, e, n, i) {"function" == typeof t && (i = n, n = e, e = t, t = []), n = n || i || this;var r = [];return this.each(t, function () {r.push(e && e.apply(this, arguments));}, n), r;}, V_.map = function (t, e, n, i) {n = n || i || this, t = p(bu(t), this.getDimension, this);var r = Mu(this, t);r._indices = this._indices, r.getRawIndex = r._indices ? _u : xu;for (var a = r._storage, o = [], s = this._chunkSize, l = t.length, u = this.count(), h = [], c = r._rawExtent, d = 0; u > d; d++) {for (var f = 0; l > f; f++) {h[f] = this.get(t[f], d);}h[l] = d;var g = e && e.apply(n, h);if (null != g) {"object" != typeof g && (o[0] = g, g = o);for (var v = this.getRawIndex(d), m = Math.floor(v / s), y = v % s, x = 0; x < g.length; x++) {var _ = t[x],w = g[x],b = c[_],M = a[_];M && (M[m][y] = w), w < b[0] && (b[0] = w), w > b[1] && (b[1] = w);}}}return r;}, V_.downSample = function (t, e, n, i) {for (var r = Mu(this, [t]), a = r._storage, o = [], s = Math.floor(1 / e), l = a[t], u = this.count(), h = this._chunkSize, c = r._rawExtent[t], d = new (pu(this))(u), f = 0, p = 0; u > p; p += s) {s > u - p && (s = u - p, o.length = s);for (var g = 0; s > g; g++) {var v = this.getRawIndex(p + g),m = Math.floor(v / h),y = v % h;o[g] = l[m][y];}var x = n(o),_ = this.getRawIndex(Math.min(p + i(o, x) || 0, u - 1)),w = Math.floor(_ / h),b = _ % h;l[w][b] = x, x < c[0] && (c[0] = x), x > c[1] && (c[1] = x), d[f++] = _;}return r._count = f, r._indices = d, r.getRawIndex = _u, r;}, V_.getItemModel = function (t) {var e = this.hostModel;return new Va(this.getRawDataItem(t), e, e && e.ecModel);}, V_.diff = function (t) {var e = this;return new uu(t ? t.getIndices() : [], this.getIndices(), function (e) {return wu(t, e);}, function (t) {return wu(e, t);});}, V_.getVisual = function (t) {var e = this._visual;return e && e[t];}, V_.setVisual = function (t, e) {if (P_(t)) for (var n in t) {t.hasOwnProperty(n) && this.setVisual(n, t[n]);} else this._visual = this._visual || {}, this._visual[t] = e;}, V_.setLayout = function (t, e) {if (P_(t)) for (var n in t) {t.hasOwnProperty(n) && this.setLayout(n, t[n]);} else this._layout[t] = e;}, V_.getLayout = function (t) {return this._layout[t];}, V_.getItemLayout = function (t) {return this._itemLayouts[t];}, V_.setItemLayout = function (t, e, n) {this._itemLayouts[t] = n ? o(this._itemLayouts[t] || {}, e) : e;}, V_.clearItemLayouts = function () {this._itemLayouts.length = 0;}, V_.getItemVisual = function (t, e, n) {var i = this._itemVisuals[t],r = i && i[e];return null != r || n ? r : this.getVisual(e);}, V_.setItemVisual = function (t, e, n) {var i = this._itemVisuals[t] || {},r = this.hasItemVisual;if (this._itemVisuals[t] = i, P_(e)) for (var a in e) {e.hasOwnProperty(a) && (i[a] = e[a], r[a] = !0);} else i[e] = n, r[e] = !0;}, V_.clearAllVisual = function () {this._visual = {}, this._itemVisuals = [], this.hasItemVisual = {};};var W_ = function W_(t) {t.seriesIndex = this.seriesIndex, t.dataIndex = this.dataIndex, t.dataType = this.dataType;};V_.setItemGraphicEl = function (t, e) {var n = this.hostModel;e && (e.dataIndex = t, e.dataType = this.dataType, e.seriesIndex = n && n.seriesIndex, "group" === e.type && e.traverse(W_, e)), this._graphicEls[t] = e;}, V_.getItemGraphicEl = function (t) {return this._graphicEls[t];}, V_.eachItemGraphicEl = function (t, e) {f(this._graphicEls, function (n, i) {n && t && t.call(e, n, i);});}, V_.cloneShallow = function (t) {if (!t) {var e = p(this.dimensions, this.getDimensionInfo, this);t = new F_(e, this.hostModel);}if (t._storage = this._storage, vu(t, this), this._indices) {var n = this._indices.constructor;t._indices = new n(this._indices);} else t._indices = null;return t.getRawIndex = t._indices ? _u : xu, t;}, V_.wrapMethod = function (t, e) {var n = this[t];"function" == typeof n && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(t), this[t] = function () {var t = n.apply(this, arguments);return e.apply(this, [t].concat(P(arguments)));});}, V_.TRANSFERABLE_METHODS = ["cloneShallow", "downSample", "map"], V_.CHANGABLE_METHODS = ["filterSelf", "selectRange"];var G_ = function G_(t, e) {return e = e || {}, Tu(e.coordDimensions || [], t, { dimsDef: e.dimensionsDefine || t.dimensionsDefine, encodeDef: e.encodeDefine || t.encodeDefine, dimCount: e.dimensionsCount, generateCoord: e.generateCoord, generateCoordCount: e.generateCoordCount });};Eu.prototype.parse = function (t) {return t;}, Eu.prototype.getSetting = function (t) {return this._setting[t];}, Eu.prototype.contain = function (t) {var e = this._extent;return t >= e[0] && t <= e[1];}, Eu.prototype.normalize = function (t) {var e = this._extent;return e[1] === e[0] ? .5 : (t - e[0]) / (e[1] - e[0]);}, Eu.prototype.scale = function (t) {var e = this._extent;return t * (e[1] - e[0]) + e[0];}, Eu.prototype.unionExtent = function (t) {var e = this._extent;t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]);}, Eu.prototype.unionExtentFromData = function (t, e) {this.unionExtent(t.getApproximateExtent(e));}, Eu.prototype.getExtent = function () {return this._extent.slice();}, Eu.prototype.setExtent = function (t, e) {var n = this._extent;isNaN(t) || (n[0] = t), isNaN(e) || (n[1] = e);}, Eu.prototype.isBlank = function () {return this._isBlank;}, Eu.prototype.setBlank = function (t) {this._isBlank = t;}, Eu.prototype.getLabel = null, tr(Eu), rr(Eu, { registerWhenExtend: !0 }), Bu.createByAxisModel = function (t) {var e = t.option,n = e.data,i = n && p(n, Nu);return new Bu({ categories: i, needCollect: !i, deduplication: e.dedplication !== !1 });};var H_ = Bu.prototype;H_.getOrdinal = function (t) {return Ru(this).get(t);}, H_.parseAndCollect = function (t) {var e,n = this._needCollect;if ("string" != typeof t && !n) return t;if (n && !this._deduplication) return e = this.categories.length, this.categories[e] = t, e;var i = Ru(this);return e = i.get(t), null == e && (n ? (e = this.categories.length, this.categories[e] = t, i.set(t, e)) : e = 0 / 0), e;};var Z_ = Eu.prototype,X_ = Eu.extend({ type: "ordinal", init: function init(t, e) {(!t || _(t)) && (t = new Bu({ categories: t })), this._ordinalMeta = t, this._extent = e || [0, t.categories.length - 1];}, parse: function parse(t) {return "string" == typeof t ? this._ordinalMeta.getOrdinal(t) : Math.round(t);}, contain: function contain(t) {return t = this.parse(t), Z_.contain.call(this, t) && null != this._ordinalMeta.categories[t];}, normalize: function normalize(t) {return Z_.normalize.call(this, this.parse(t));}, scale: function scale(t) {return Math.round(Z_.scale.call(this, t));}, getTicks: function getTicks() {for (var t = [], e = this._extent, n = e[0]; n <= e[1];) {t.push(n), n++;}return t;}, getLabel: function getLabel(t) {return this.isBlank() ? void 0 : this._ordinalMeta.categories[t];}, count: function count() {return this._extent[1] - this._extent[0] + 1;}, unionExtentFromData: function unionExtentFromData(t, e) {this.unionExtent(t.getApproximateExtent(e));}, getOrdinalMeta: function getOrdinalMeta() {return this._ordinalMeta;}, niceTicks: V, niceExtent: V });X_.create = function () {return new X_();};var Y_ = Ua,q_ = Ua,j_ = Eu.extend({ type: "interval", _interval: 0, _intervalPrecision: 2, setExtent: function setExtent(t, e) {var n = this._extent;isNaN(t) || (n[0] = parseFloat(t)), isNaN(e) || (n[1] = parseFloat(e));}, unionExtent: function unionExtent(t) {var e = this._extent;t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]), j_.prototype.setExtent.call(this, e[0], e[1]);}, getInterval: function getInterval() {return this._interval;}, setInterval: function setInterval(t) {this._interval = t, this._niceExtent = this._extent.slice(), this._intervalPrecision = Vu(t);}, getTicks: function getTicks() {return Hu(this._interval, this._extent, this._niceExtent, this._intervalPrecision);}, getLabel: function getLabel(t, e) {if (null == t) return "";var n = e && e.precision;return null == n ? n = Qa(t) || 0 : "auto" === n && (n = this._intervalPrecision), t = q_(t, n, !0), ho(t);}, niceTicks: function niceTicks(t, e, n) {t = t || 5;var i = this._extent,r = i[1] - i[0];if (isFinite(r)) {0 > r && (r = -r, i.reverse());var a = Fu(i, t, e, n);this._intervalPrecision = a.intervalPrecision, this._interval = a.interval, this._niceExtent = a.niceTickExtent;}}, niceExtent: function niceExtent(t) {var e = this._extent;if (e[0] === e[1]) if (0 !== e[0]) {var n = e[0];t.fixMax ? e[0] -= n / 2 : (e[1] += n / 2, e[0] -= n / 2);} else e[1] = 1;var i = e[1] - e[0];isFinite(i) || (e[0] = 0, e[1] = 1), this.niceTicks(t.splitNumber, t.minInterval, t.maxInterval);var r = this._interval;t.fixMin || (e[0] = q_(Math.floor(e[0] / r) * r)), t.fixMax || (e[1] = q_(Math.ceil(e[1] / r) * r));} });j_.create = function () {return new j_();};var U_ = "__ec_stack_",$_ = .5,K_ = "undefined" != typeof Float32Array ? Float32Array : Array,Q_ = { seriesType: "bar", plan: hx(), reset: function reset(t) {function e(t, e) {for (var n, c = new K_(2 * t.count), d = [], f = [], p = 0; null != (n = t.next());) {f[u] = e.get(o, n), f[1 - u] = e.get(s, n), d = i.dataToPoint(f, null, d), c[p++] = d[0], c[p++] = d[1];}e.setLayout({ largePoints: c, barWidth: h, valueAxisStart: Ju(r, a, !1), valueAxisHorizontal: l });}if (Ku(t) && Qu(t)) {var n = t.getData(),i = t.coordinateSystem,r = i.getBaseAxis(),a = i.getOtherAxis(r),o = n.mapDimension(a.dim),s = n.mapDimension(r.dim),l = a.isHorizontal(),u = l ? 0 : 1,h = Uu(qu([t]), r, t).width;return h > $_ || (h = $_), { progress: e };}} },J_ = j_.prototype,tw = Math.ceil,ew = Math.floor,nw = 1e3,iw = 60 * nw,rw = 60 * iw,aw = 24 * rw,ow = function ow(t, e, n, i) {for (; i > n;) {var r = n + i >>> 1;t[r][1] < e ? n = r + 1 : i = r;}return n;},sw = j_.extend({ type: "time", getLabel: function getLabel(t) {var e = this._stepLvl,n = new Date(t);return yo(e[0], n, this.getSetting("useUTC"));}, niceExtent: function niceExtent(t) {var e = this._extent;if (e[0] === e[1] && (e[0] -= aw, e[1] += aw), e[1] === -1 / 0 && 1 / 0 === e[0]) {var n = new Date();e[1] = +new Date(n.getFullYear(), n.getMonth(), n.getDate()), e[0] = e[1] - aw;}this.niceTicks(t.splitNumber, t.minInterval, t.maxInterval);var i = this._interval;t.fixMin || (e[0] = Ua(ew(e[0] / i) * i)), t.fixMax || (e[1] = Ua(tw(e[1] / i) * i));}, niceTicks: function niceTicks(t, e, n) {t = t || 10;var i = this._extent,r = i[1] - i[0],a = r / t;null != e && e > a && (a = e), null != n && a > n && (a = n);var o = lw.length,s = ow(lw, a, 0, o),l = lw[Math.min(s, o - 1)],u = l[1];if ("year" === l[0]) {var h = r / u,c = oo(h / t, !0);u *= c;}var d = this.getSetting("useUTC") ? 0 : 60 * new Date(+i[0] || +i[1]).getTimezoneOffset() * 1e3,f = [Math.round(tw((i[0] - d) / u) * u + d), Math.round(ew((i[1] - d) / u) * u + d)];Gu(f, i), this._stepLvl = l, this._interval = u, this._niceExtent = f;}, parse: function parse(t) {return +io(t);} });f(["contain", "normalize"], function (t) {sw.prototype[t] = function (e) {return J_[t].call(this, this.parse(e));};});var lw = [["hh:mm:ss", nw], ["hh:mm:ss", 5 * nw], ["hh:mm:ss", 10 * nw], ["hh:mm:ss", 15 * nw], ["hh:mm:ss", 30 * nw], ["hh:mm\nMM-dd", iw], ["hh:mm\nMM-dd", 5 * iw], ["hh:mm\nMM-dd", 10 * iw], ["hh:mm\nMM-dd", 15 * iw], ["hh:mm\nMM-dd", 30 * iw], ["hh:mm\nMM-dd", rw], ["hh:mm\nMM-dd", 2 * rw], ["hh:mm\nMM-dd", 6 * rw], ["hh:mm\nMM-dd", 12 * rw], ["MM-dd\nyyyy", aw], ["MM-dd\nyyyy", 2 * aw], ["MM-dd\nyyyy", 3 * aw], ["MM-dd\nyyyy", 4 * aw], ["MM-dd\nyyyy", 5 * aw], ["MM-dd\nyyyy", 6 * aw], ["week", 7 * aw], ["MM-dd\nyyyy", 10 * aw], ["week", 14 * aw], ["week", 21 * aw], ["month", 31 * aw], ["week", 42 * aw], ["month", 62 * aw], ["week", 70 * aw], ["quarter", 95 * aw], ["month", 31 * aw * 4], ["month", 31 * aw * 5], ["half-year", 380 * aw / 2], ["month", 31 * aw * 8], ["month", 31 * aw * 10], ["year", 380 * aw]];sw.create = function (t) {return new sw({ useUTC: t.ecModel.get("useUTC") });};var uw = Eu.prototype,hw = j_.prototype,cw = Qa,dw = Ua,fw = Math.floor,pw = Math.ceil,gw = Math.pow,vw = Math.log,mw = Eu.extend({ type: "log", base: 10, $constructor: function $constructor() {Eu.apply(this, arguments), this._originalScale = new j_();}, getTicks: function getTicks() {var t = this._originalScale,e = this._extent,n = t.getExtent();return p(hw.getTicks.call(this), function (i) {var r = Ua(gw(this.base, i));return r = i === e[0] && t.__fixMin ? th(r, n[0]) : r, r = i === e[1] && t.__fixMax ? th(r, n[1]) : r;}, this);}, getLabel: hw.getLabel, scale: function scale(t) {return t = uw.scale.call(this, t), gw(this.base, t);}, setExtent: function setExtent(t, e) {var n = this.base;t = vw(t) / vw(n), e = vw(e) / vw(n), hw.setExtent.call(this, t, e);}, getExtent: function getExtent() {var t = this.base,e = uw.getExtent.call(this);e[0] = gw(t, e[0]), e[1] = gw(t, e[1]);var n = this._originalScale,i = n.getExtent();return n.__fixMin && (e[0] = th(e[0], i[0])), n.__fixMax && (e[1] = th(e[1], i[1])), e;}, unionExtent: function unionExtent(t) {this._originalScale.unionExtent(t);var e = this.base;t[0] = vw(t[0]) / vw(e), t[1] = vw(t[1]) / vw(e), uw.unionExtent.call(this, t);}, unionExtentFromData: function unionExtentFromData(t, e) {this.unionExtent(t.getApproximateExtent(e));}, niceTicks: function niceTicks(t) {t = t || 10;var e = this._extent,n = e[1] - e[0];if (!(1 / 0 === n || 0 >= n)) {var i = ro(n),r = t / n * i;for (.5 >= r && (i *= 10); !isNaN(i) && Math.abs(i) < 1 && Math.abs(i) > 0;) {i *= 10;}var a = [Ua(pw(e[0] / i) * i), Ua(fw(e[1] / i) * i)];this._interval = i, this._niceExtent = a;}}, niceExtent: function niceExtent(t) {hw.niceExtent.call(this, t);var e = this._originalScale;e.__fixMin = t.fixMin, e.__fixMax = t.fixMax;} });f(["contain", "normalize"], function (t) {mw.prototype[t] = function (e) {return e = vw(e) / vw(this.base), uw[t].call(this, e);};}), mw.create = function () {return new mw();};var yw = { getMin: function getMin(t) {var e = this.option,n = t || null == e.rangeStart ? e.min : e.rangeStart;return this.axis && null != n && "dataMin" !== n && "function" != typeof n && !A(n) && (n = this.axis.scale.parse(n)), n;}, getMax: function getMax(t) {var e = this.option,n = t || null == e.rangeEnd ? e.max : e.rangeEnd;return this.axis && null != n && "dataMax" !== n && "function" != typeof n && !A(n) && (n = this.axis.scale.parse(n)), n;}, getNeedCrossZero: function getNeedCrossZero() {var t = this.option;return null != t.rangeStart || null != t.rangeEnd ? !1 : !t.scale;}, getCoordSysModel: V, setRange: function setRange(t, e) {this.option.rangeStart = t, this.option.rangeEnd = e;}, resetRange: function resetRange() {this.option.rangeStart = this.option.rangeEnd = null;} },xw = Ur({ type: "triangle", shape: { cx: 0, cy: 0, width: 0, height: 0 }, buildPath: function buildPath(t, e) {var n = e.cx,i = e.cy,r = e.width / 2,a = e.height / 2;t.moveTo(n, i - a), t.lineTo(n + r, i + a), t.lineTo(n - r, i + a), t.closePath();} }),_w = Ur({ type: "diamond", shape: { cx: 0, cy: 0, width: 0, height: 0 }, buildPath: function buildPath(t, e) {var n = e.cx,i = e.cy,r = e.width / 2,a = e.height / 2;t.moveTo(n, i - a), t.lineTo(n + r, i), t.lineTo(n, i + a), t.lineTo(n - r, i), t.closePath();} }),ww = Ur({ type: "pin", shape: { x: 0, y: 0, width: 0, height: 0 }, buildPath: function buildPath(t, e) {var n = e.x,i = e.y,r = e.width / 5 * 3,a = Math.max(r, e.height),o = r / 2,s = o * o / (a - o),l = i - a + o + s,u = Math.asin(s / o),h = Math.cos(u) * o,c = Math.sin(u),d = Math.cos(u),f = .6 * o,p = .7 * o;t.moveTo(n - h, l + s), t.arc(n, l, o, Math.PI - u, 2 * Math.PI + u), t.bezierCurveTo(n + h - c * f, l + s + d * f, n, i - p, n, i), t.bezierCurveTo(n, i - p, n - h + c * f, l + s + d * f, n - h, l + s), t.closePath();
    } }),bw = Ur({ type: "arrow", shape: { x: 0, y: 0, width: 0, height: 0 }, buildPath: function buildPath(t, e) {var n = e.height,i = e.width,r = e.x,a = e.y,o = i / 3 * 2;t.moveTo(r, a), t.lineTo(r + o, a + n), t.lineTo(r, a + n / 4 * 3), t.lineTo(r - o, a + n), t.lineTo(r, a), t.closePath();} }),Mw = { line: Lm, rect: Pm, roundRect: Pm, square: Pm, circle: bm, diamond: _w, pin: ww, arrow: bw, triangle: xw },Sw = { line: function line(t, e, n, i, r) {r.x1 = t, r.y1 = e + i / 2, r.x2 = t + n, r.y2 = e + i / 2;}, rect: function rect(t, e, n, i, r) {r.x = t, r.y = e, r.width = n, r.height = i;}, roundRect: function roundRect(t, e, n, i, r) {r.x = t, r.y = e, r.width = n, r.height = i, r.r = Math.min(n, i) / 4;}, square: function square(t, e, n, i, r) {var a = Math.min(n, i);r.x = t, r.y = e, r.width = a, r.height = a;}, circle: function circle(t, e, n, i, r) {r.cx = t + n / 2, r.cy = e + i / 2, r.r = Math.min(n, i) / 2;}, diamond: function diamond(t, e, n, i, r) {r.cx = t + n / 2, r.cy = e + i / 2, r.width = n, r.height = i;}, pin: function pin(t, e, n, i, r) {r.x = t + n / 2, r.y = e + i / 2, r.width = n, r.height = i;}, arrow: function arrow(t, e, n, i, r) {r.x = t + n / 2, r.y = e + i / 2, r.width = n, r.height = i;}, triangle: function triangle(t, e, n, i, r) {r.cx = t + n / 2, r.cy = e + i / 2, r.width = n, r.height = i;} },Iw = {};f(Mw, function (t, e) {Iw[e] = new t();});var Tw = Ur({ type: "symbol", shape: { symbolType: "", x: 0, y: 0, width: 0, height: 0 }, beforeBrush: function beforeBrush() {var t = this.style,e = this.shape;"pin" === e.symbolType && "inside" === t.textPosition && (t.textPosition = ["50%", "40%"], t.textAlign = "center", t.textVerticalAlign = "middle");}, buildPath: function buildPath(t, e, n) {var i = e.symbolType,r = Iw[i];"none" !== e.symbolType && (r || (i = "rect", r = Iw[i]), Sw[i](e.x, e.y, e.width, e.height, r.shape), r.buildPath(t, r.shape, n));} }),Aw = { isDimensionStacked: ku, enableDataStack: Du, getStackedDimension: Pu },Cw = (Object.freeze || Object)({ createList: dh, getLayoutRect: wo, dataStack: Aw, createScale: fh, mixinAxisModelCommonMethods: ph, completeDimensions: Tu, createDimensions: G_, createSymbol: ch }),Dw = 1e-8;mh.prototype = { constructor: mh, properties: null, getBoundingRect: function getBoundingRect() {var t = this._rect;if (t) return t;for (var e = Number.MAX_VALUE, n = [e, e], i = [-e, -e], r = [], a = [], o = this.geometries, s = 0; s < o.length; s++) {if ("polygon" === o[s].type) {var l = o[s].exterior;xr(l, r, a), oe(n, n, r), se(i, i, a);}}return 0 === s && (n[0] = n[1] = i[0] = i[1] = 0), this._rect = new vn(n[0], n[1], i[0] - n[0], i[1] - n[1]);}, contain: function contain(t) {var e = this.getBoundingRect(),n = this.geometries;if (!e.contain(t[0], t[1])) return !1;t: for (var i = 0, r = n.length; r > i; i++) {if ("polygon" === n[i].type) {var a = n[i].exterior,o = n[i].interiors;if (vh(a, t[0], t[1])) {for (var s = 0; s < (o ? o.length : 0); s++) {if (vh(o[s])) continue t;}return !0;}}}return !1;}, transformTo: function transformTo(t, e, n, i) {var r = this.getBoundingRect(),a = r.width / r.height;n ? i || (i = n / a) : n = a * i;for (var o = new vn(t, e, n, i), s = r.calculateTransform(o), l = this.geometries, u = 0; u < l.length; u++) {if ("polygon" === l[u].type) {for (var h = l[u].exterior, c = l[u].interiors, d = 0; d < h.length; d++) {ae(h[d], h[d], s);}for (var f = 0; f < (c ? c.length : 0); f++) {for (var d = 0; d < c[f].length; d++) {ae(c[f][d], c[f][d], s);}}}}r = this._rect, r.copy(o), this.center = [r.x + r.width / 2, r.y + r.height / 2];}, cloneShallow: function cloneShallow(t) {null == t && (t = this.name);var e = new mh(t, this.geometries, this.center);return e._rect = this._rect, e.transformTo = null, e;} };var kw = function kw(t) {return yh(t), p(v(t.features, function (t) {return t.geometry && t.properties && t.geometry.coordinates.length > 0;}), function (t) {var e = t.properties,n = t.geometry,i = n.coordinates,r = [];"Polygon" === n.type && r.push({ type: "polygon", exterior: i[0], interiors: i.slice(1) }), "MultiPolygon" === n.type && f(i, function (t) {t[0] && r.push({ type: "polygon", exterior: t[0], interiors: t.slice(1) });});var a = new mh(e.name, r, e.cp);return a.properties = e, a;});},Pw = Yi(),Lw = [0, 1],Ow = function Ow(t, e, n) {this.dim = t, this.scale = e, this._extent = n || [0, 0], this.inverse = !1, this.onBand = !1;};Ow.prototype = { constructor: Ow, contain: function contain(t) {var e = this._extent,n = Math.min(e[0], e[1]),i = Math.max(e[0], e[1]);return t >= n && i >= t;}, containData: function containData(t) {return this.contain(this.dataToCoord(t));}, getExtent: function getExtent() {return this._extent.slice();}, getPixelPrecision: function getPixelPrecision(t) {return Ja(t || this.scale.getExtent(), this._extent);}, setExtent: function setExtent(t, e) {var n = this._extent;n[0] = t, n[1] = e;}, dataToCoord: function dataToCoord(t, e) {var n = this._extent,i = this.scale;return t = i.normalize(t), this.onBand && "ordinal" === i.type && (n = n.slice(), Eh(n, i.count())), qa(t, Lw, n, e);}, coordToData: function coordToData(t, e) {var n = this._extent,i = this.scale;this.onBand && "ordinal" === i.type && (n = n.slice(), Eh(n, i.count()));var r = qa(t, n, Lw, e);return this.scale.scale(r);}, pointToData: function pointToData() {}, getTicksCoords: function getTicksCoords(t) {t = t || {};var e = t.tickModel || this.getTickModel(),n = wh(this, e),i = n.ticks,r = p(i, function (t) {return { coord: this.dataToCoord(t), tickValue: t };}, this),a = e.get("alignWithLabel");return Bh(this, r, n.tickCategoryInterval, a, t.clamp), r;}, getViewLabels: function getViewLabels() {return _h(this).labels;}, getLabelModel: function getLabelModel() {return this.model.getModel("axisLabel");}, getTickModel: function getTickModel() {return this.model.getModel("axisTick");}, getBandWidth: function getBandWidth() {var t = this._extent,e = this.scale.getExtent(),n = e[1] - e[0] + (this.onBand ? 1 : 0);0 === n && (n = 1);var i = Math.abs(t[1] - t[0]);return Math.abs(i) / n;}, isHorizontal: null, getRotate: null, calculateCategoryInterval: function calculateCategoryInterval() {return kh(this);} };var zw = kw,Ew = {};f(["map", "each", "filter", "indexOf", "inherits", "reduce", "filter", "bind", "curry", "isArray", "isString", "isObject", "isFunction", "extend", "defaults", "clone", "merge"], function (t) {Ew[t] = vp[t];});var Bw = {};f(["extendShape", "extendPath", "makePath", "makeImage", "mergePath", "resizePath", "createIcon", "setHoverStyle", "setLabelStyle", "setTextStyle", "setText", "getFont", "updateProps", "initProps", "getTransform", "clipPointsByRect", "clipRectByRect", "Group", "Image", "Text", "Circle", "Sector", "Ring", "Polygon", "Polyline", "Rect", "Line", "BezierCurve", "Arc", "IncrementalDisplayable", "CompoundPath", "LinearGradient", "RadialGradient", "BoundingRect"], function (t) {Bw[t] = jm[t];});var Rw = function Rw(t) {this._axes = {}, this._dimList = [], this.name = t || "";};Rw.prototype = { constructor: Rw, type: "cartesian", getAxis: function getAxis(t) {return this._axes[t];}, getAxes: function getAxes() {return p(this._dimList, Rh, this);}, getAxesByScale: function getAxesByScale(t) {return t = t.toLowerCase(), v(this.getAxes(), function (e) {return e.scale.type === t;});}, addAxis: function addAxis(t) {var e = t.dim;this._axes[e] = t, this._dimList.push(e);}, dataToCoord: function dataToCoord(t) {return this._dataCoordConvert(t, "dataToCoord");}, coordToData: function coordToData(t) {return this._dataCoordConvert(t, "coordToData");}, _dataCoordConvert: function _dataCoordConvert(t, e) {for (var n = this._dimList, i = t instanceof Array ? [] : {}, r = 0; r < n.length; r++) {var a = n[r],o = this._axes[a];i[a] = o[e](t[a]);}return i;} }, Nh.prototype = { constructor: Nh, type: "cartesian2d", dimensions: ["x", "y"], getBaseAxis: function getBaseAxis() {return this.getAxesByScale("ordinal")[0] || this.getAxesByScale("time")[0] || this.getAxis("x");}, containPoint: function containPoint(t) {var e = this.getAxis("x"),n = this.getAxis("y");return e.contain(e.toLocalCoord(t[0])) && n.contain(n.toLocalCoord(t[1]));}, containData: function containData(t) {return this.getAxis("x").containData(t[0]) && this.getAxis("y").containData(t[1]);}, dataToPoint: function dataToPoint(t, e, n) {var i = this.getAxis("x"),r = this.getAxis("y");return n = n || [], n[0] = i.toGlobalCoord(i.dataToCoord(t[0])), n[1] = r.toGlobalCoord(r.dataToCoord(t[1])), n;}, clampData: function clampData(t, e) {var n = this.getAxis("x").scale,i = this.getAxis("y").scale,r = n.getExtent(),a = i.getExtent(),o = n.parse(t[0]),s = i.parse(t[1]);return e = e || [], e[0] = Math.min(Math.max(Math.min(r[0], r[1]), o), Math.max(r[0], r[1])), e[1] = Math.min(Math.max(Math.min(a[0], a[1]), s), Math.max(a[0], a[1])), e;}, pointToData: function pointToData(t, e) {var n = this.getAxis("x"),i = this.getAxis("y");return e = e || [], e[0] = n.coordToData(n.toLocalCoord(t[0])), e[1] = i.coordToData(i.toLocalCoord(t[1])), e;}, getOtherAxis: function getOtherAxis(t) {return this.getAxis("x" === t.dim ? "y" : "x");} }, h(Nh, Rw);var Nw = function Nw(t, e, n, i, r) {Ow.call(this, t, e, n), this.type = i || "value", this.position = r || "bottom";};Nw.prototype = { constructor: Nw, index: 0, getAxesOnZeroOf: null, model: null, isHorizontal: function isHorizontal() {var t = this.position;return "top" === t || "bottom" === t;}, getGlobalExtent: function getGlobalExtent(t) {var e = this.getExtent();return e[0] = this.toGlobalCoord(e[0]), e[1] = this.toGlobalCoord(e[1]), t && e[0] > e[1] && e.reverse(), e;}, getOtherAxis: function getOtherAxis() {this.grid.getOtherAxis();}, pointToData: function pointToData(t, e) {return this.coordToData(this.toLocalCoord(t["x" === this.dim ? 0 : 1]), e);}, toLocalCoord: null, toGlobalCoord: null }, h(Nw, Ow);var Fw = { show: !0, zlevel: 0, z: 0, inverse: !1, name: "", nameLocation: "end", nameRotate: null, nameTruncate: { maxWidth: null, ellipsis: "...", placeholder: "." }, nameTextStyle: {}, nameGap: 15, silent: !1, triggerEvent: !1, tooltip: { show: !1 }, axisPointer: {}, axisLine: { show: !0, onZero: !0, onZeroAxisIndex: null, lineStyle: { color: "#333", width: 1, type: "solid" }, symbol: ["none", "none"], symbolSize: [10, 15] }, axisTick: { show: !0, inside: !1, length: 5, lineStyle: { width: 1 } }, axisLabel: { show: !0, inside: !1, rotate: 0, showMinLabel: null, showMaxLabel: null, margin: 8, fontSize: 12 }, splitLine: { show: !0, lineStyle: { color: ["#ccc"], width: 1, type: "solid" } }, splitArea: { show: !1, areaStyle: { color: ["rgba(250,250,250,0.3)", "rgba(200,200,200,0.3)"] } } },Vw = {};Vw.categoryAxis = r({ boundaryGap: !0, deduplication: null, splitLine: { show: !1 }, axisTick: { alignWithLabel: !1, interval: "auto" }, axisLabel: { interval: "auto" } }, Fw), Vw.valueAxis = r({ boundaryGap: [0, 0], splitNumber: 5 }, Fw), Vw.timeAxis = s({ scale: !0, min: "dataMin", max: "dataMax" }, Vw.valueAxis), Vw.logAxis = s({ scale: !0, logBase: 10 }, Vw.valueAxis);var Ww = ["value", "category", "time", "log"],Gw = function Gw(t, e, n, i) {f(Ww, function (o) {e.extend({ type: t + "Axis." + o, mergeDefaultAndTheme: function mergeDefaultAndTheme(e, i) {var a = this.layoutMode,s = a ? Mo(e) : {},l = i.getTheme();r(e, l.get(o + "Axis")), r(e, this.getDefaultOption()), e.type = n(t, e), a && bo(e, s, a);}, optionUpdated: function optionUpdated() {var t = this.option;"category" === t.type && (this.__ordinalMeta = Bu.createByAxisModel(this));}, getCategories: function getCategories(t) {var e = this.option;return "category" === e.type ? t ? e.data : this.__ordinalMeta.categories : void 0;}, getOrdinalMeta: function getOrdinalMeta() {return this.__ordinalMeta;}, defaultOption: a([{}, Vw[o + "Axis"], i], !0) });}), _y.registerSubTypeDefaulter(t + "Axis", x(n, t));},Hw = _y.extend({ type: "cartesian2dAxis", axis: null, init: function init() {Hw.superApply(this, "init", arguments), this.resetRange();}, mergeOption: function mergeOption() {Hw.superApply(this, "mergeOption", arguments), this.resetRange();}, restoreData: function restoreData() {Hw.superApply(this, "restoreData", arguments), this.resetRange();}, getCoordSysModel: function getCoordSysModel() {return this.ecModel.queryComponents({ mainType: "grid", index: this.option.gridIndex, id: this.option.gridId })[0];} });r(Hw.prototype, yw);var Zw = { offset: 0 };Gw("x", Hw, Fh, Zw), Gw("y", Hw, Fh, Zw), _y.extend({ type: "grid", dependencies: ["xAxis", "yAxis"], layoutMode: "box", coordinateSystem: null, defaultOption: { show: !1, zlevel: 0, z: 0, left: "10%", top: 60, right: "10%", bottom: 60, containLabel: !1, backgroundColor: "rgba(0,0,0,0)", borderWidth: 1, borderColor: "#ccc" } });var Xw = Wh.prototype;Xw.type = "grid", Xw.axisPointerEnabled = !0, Xw.getRect = function () {return this._rect;}, Xw.update = function (t, e) {var n = this._axesMap;this._updateScale(t, this.model), f(n.x, function (t) {ih(t.scale, t.model);}), f(n.y, function (t) {ih(t.scale, t.model);});var i = {};f(n.x, function (t) {Gh(n, "y", t, i);}), f(n.y, function (t) {Gh(n, "x", t, i);}), this.resize(this.model, e);}, Xw.resize = function (t, e, n) {function i() {f(a, function (t) {var e = t.isHorizontal(),n = e ? [0, r.width] : [0, r.height],i = t.inverse ? 1 : 0;t.setExtent(n[i], n[1 - i]), Zh(t, e ? r.x : r.y);});}var r = wo(t.getBoxLayoutParams(), { width: e.getWidth(), height: e.getHeight() });this._rect = r;var a = this._axesList;i(), !n && t.get("containLabel") && (f(a, function (t) {if (!t.model.get("axisLabel.inside")) {var e = lh(t);if (e) {var n = t.isHorizontal() ? "height" : "width",i = t.model.get("axisLabel.margin");r[n] -= e[n] + i, "top" === t.position ? r.y += e.height + i : "left" === t.position && (r.x += e.width + i);}}}), i());}, Xw.getAxis = function (t, e) {var n = this._axesMap[t];if (null != n) {if (null == e) for (var i in n) {if (n.hasOwnProperty(i)) return n[i];}return n[e];}}, Xw.getAxes = function () {return this._axesList.slice();}, Xw.getCartesian = function (t, e) {if (null != t && null != e) {var n = "x" + t + "y" + e;return this._coordsMap[n];}M(t) && (e = t.yAxisIndex, t = t.xAxisIndex);for (var i = 0, r = this._coordsList; i < r.length; i++) {if (r[i].getAxis("x").index === t || r[i].getAxis("y").index === e) return r[i];}}, Xw.getCartesians = function () {return this._coordsList.slice();}, Xw.convertToPixel = function (t, e, n) {var i = this._findConvertTarget(t, e);return i.cartesian ? i.cartesian.dataToPoint(n) : i.axis ? i.axis.toGlobalCoord(i.axis.dataToCoord(n)) : null;}, Xw.convertFromPixel = function (t, e, n) {var i = this._findConvertTarget(t, e);return i.cartesian ? i.cartesian.pointToData(n) : i.axis ? i.axis.coordToData(i.axis.toLocalCoord(n)) : null;}, Xw._findConvertTarget = function (t, e) {var n,i,r = e.seriesModel,a = e.xAxisModel || r && r.getReferringComponents("xAxis")[0],o = e.yAxisModel || r && r.getReferringComponents("yAxis")[0],s = e.gridModel,l = this._coordsList;if (r) n = r.coordinateSystem, u(l, n) < 0 && (n = null);else if (a && o) n = this.getCartesian(a.componentIndex, o.componentIndex);else if (a) i = this.getAxis("x", a.componentIndex);else if (o) i = this.getAxis("y", o.componentIndex);else if (s) {var h = s.coordinateSystem;h === this && (n = this._coordsList[0]);}return { cartesian: n, axis: i };}, Xw.containPoint = function (t) {var e = this._coordsList[0];return e ? e.containPoint(t) : void 0;}, Xw._initCartesian = function (t, e) {function n(n) {return function (o, s) {if (Vh(o, t, e)) {var l = o.get("position");"x" === n ? "top" !== l && "bottom" !== l && (l = "bottom", i[l] && (l = "top" === l ? "bottom" : "top")) : "left" !== l && "right" !== l && (l = "left", i[l] && (l = "left" === l ? "right" : "left")), i[l] = !0;var u = new Nw(n, rh(o), [0, 0], o.get("type"), l),h = "category" === u.type;u.onBand = h && o.get("boundaryGap"), u.inverse = o.get("inverse"), o.axis = u, u.model = o, u.grid = this, u.index = s, this._axesList.push(u), r[n][s] = u, a[n]++;}};}var i = { left: !1, right: !1, top: !1, bottom: !1 },r = { x: {}, y: {} },a = { x: 0, y: 0 };return e.eachComponent("xAxis", n("x"), this), e.eachComponent("yAxis", n("y"), this), a.x && a.y ? (this._axesMap = r, void f(r.x, function (e, n) {f(r.y, function (i, r) {var a = "x" + n + "y" + r,o = new Nh(a);o.grid = this, o.model = t, this._coordsMap[a] = o, this._coordsList.push(o), o.addAxis(e), o.addAxis(i);}, this);}, this)) : (this._axesMap = {}, void (this._axesList = []));}, Xw._updateScale = function (t, e) {function n(t, e) {f(t.mapDimension(e.dim, !0), function (n) {e.scale.unionExtentFromData(t, Pu(t, n));});}f(this._axesList, function (t) {t.scale.setExtent(1 / 0, -1 / 0);}), t.eachSeries(function (i) {if (Yh(i)) {var r = Xh(i, t),a = r[0],o = r[1];if (!Vh(a, e, t) || !Vh(o, e, t)) return;var s = this.getCartesian(a.componentIndex, o.componentIndex),l = i.getData(),u = s.getAxis("x"),h = s.getAxis("y");"list" === l.type && (n(l, u, i), n(l, h, i));}}, this);}, Xw.getTooltipAxes = function (t) {var e = [],n = [];return f(this.getCartesians(), function (i) {var r = null != t && "auto" !== t ? i.getAxis(t) : i.getBaseAxis(),a = i.getOtherAxis(r);u(e, r) < 0 && e.push(r), u(n, a) < 0 && n.push(a);}), { baseAxes: e, otherAxes: n };};var Yw = ["xAxis", "yAxis"];Wh.create = function (t, e) {var n = [];return t.eachComponent("grid", function (i, r) {var a = new Wh(i, t, e);a.name = "grid_" + r, a.resize(i, e, !0), i.coordinateSystem = a, n.push(a);}), t.eachSeries(function (e) {if (Yh(e)) {var n = Xh(e, t),i = n[0],r = n[1],a = i.getCoordSysModel(),o = a.coordinateSystem;e.coordinateSystem = o.getCartesian(i.componentIndex, r.componentIndex);}}), n;}, Wh.dimensions = Wh.prototype.dimensions = Nh.prototype.dimensions, $o.register("cartesian2d", Wh);var qw = sx.extend({ type: "series.__base_bar__", getInitialData: function getInitialData() {return Lu(this.getSource(), this);}, getMarkerPosition: function getMarkerPosition(t) {var e = this.coordinateSystem;if (e) {var n = e.dataToPoint(e.clampData(t)),i = this.getData(),r = i.getLayout("offset"),a = i.getLayout("size"),o = e.getBaseAxis().isHorizontal() ? 0 : 1;return n[o] += r + a / 2, n;}return [0 / 0, 0 / 0];}, defaultOption: { zlevel: 0, z: 2, coordinateSystem: "cartesian2d", legendHoverLink: !0, barMinHeight: 0, barMinAngle: 0, large: !1, largeThreshold: 400, progressive: 3e3, progressiveChunkMode: "mod", itemStyle: {}, emphasis: {} } });qw.extend({ type: "series.bar", dependencies: ["grid", "polar"], brushSelector: "rect", getProgressive: function getProgressive() {return this.get("large") ? this.get("progressive") : !1;}, getProgressiveThreshold: function getProgressiveThreshold() {var t = this.get("progressiveThreshold"),e = this.get("largeThreshold");return e > t && (t = e), t;} });var jw = pv([["fill", "color"], ["stroke", "borderColor"], ["lineWidth", "borderWidth"], ["stroke", "barBorderColor"], ["lineWidth", "barBorderWidth"], ["opacity"], ["shadowBlur"], ["shadowOffsetX"], ["shadowOffsetY"], ["shadowColor"]]),Uw = { getBarItemStyle: function getBarItemStyle(t) {var e = jw(this, t);if (this.getBorderLineDash) {var n = this.getBorderLineDash();n && (e.lineDash = n);}return e;} },$w = ["itemStyle", "barBorderWidth"];o(Va.prototype, Uw), ru({ type: "bar", render: function render(t, e, n) {this._updateDrawMode(t);var i = t.get("coordinateSystem");return ("cartesian2d" === i || "polar" === i) && (this._isLargeDraw ? this._renderLarge(t, e, n) : this._renderNormal(t, e, n)), this.group;}, incrementalPrepareRender: function incrementalPrepareRender(t) {this._clear(), this._updateDrawMode(t);}, incrementalRender: function incrementalRender(t, e) {this._incrementalRenderLarge(t, e);}, _updateDrawMode: function _updateDrawMode(t) {var e = t.pipelineContext.large;(null == this._isLargeDraw || e ^ this._isLargeDraw) && (this._isLargeDraw = e, this._clear());}, _renderNormal: function _renderNormal(t) {var e,n = this.group,i = t.getData(),r = this._data,a = t.coordinateSystem,o = a.getBaseAxis();"cartesian2d" === a.type ? e = o.isHorizontal() : "polar" === a.type && (e = "angle" === o.dim);var s = t.isAnimationEnabled() ? t : null;i.diff(r).add(function (r) {if (i.hasValue(r)) {var o = i.getItemModel(r),l = Qw[a.type](i, r, o),u = Kw[a.type](i, r, o, l, e, s);i.setItemGraphicEl(r, u), n.add(u), Qh(u, i, r, o, l, t, e, "polar" === a.type);}}).update(function (o, l) {var u = r.getItemGraphicEl(l);if (!i.hasValue(o)) return void n.remove(u);var h = i.getItemModel(o),c = Qw[a.type](i, o, h);u ? Pa(u, { shape: c }, s, o) : u = Kw[a.type](i, o, h, c, e, s, !0), i.setItemGraphicEl(o, u), n.add(u), Qh(u, i, o, h, c, t, e, "polar" === a.type);}).remove(function (t) {var e = r.getItemGraphicEl(t);"cartesian2d" === a.type ? e && $h(t, s, e) : e && Kh(t, s, e);}).execute(), this._data = i;}, _renderLarge: function _renderLarge(t) {this._clear(), tc(t, this.group);}, _incrementalRenderLarge: function _incrementalRenderLarge(t, e) {tc(e, this.group, !0);}, dispose: V, remove: function remove(t) {this._clear(t);}, _clear: function _clear(t) {var e = this.group,n = this._data;t && t.get("animation") && n && !this._isLargeDraw ? n.eachItemGraphicEl(function (e) {"sector" === e.type ? Kh(e.dataIndex, t, e) : $h(e.dataIndex, t, e);}) : e.removeAll(), this._data = null;} });var Kw = { cartesian2d: function cartesian2d(t, e, n, i, r, a, s) {var l = new Pm({ shape: o({}, i) });if (a) {var u = l.shape,h = r ? "height" : "width",c = {};u[h] = 0, c[h] = i[h], jm[s ? "updateProps" : "initProps"](l, { shape: c }, a, e);}return l;}, polar: function polar(t, e, n, i, r, a, o) {var l = i.startAngle < i.endAngle,u = new Im({ shape: s({ clockwise: l }, i) });if (a) {var h = u.shape,c = r ? "r" : "endAngle",d = {};h[c] = r ? 0 : i.startAngle, d[c] = i[c], jm[o ? "updateProps" : "initProps"](u, { shape: d }, a, e);}return u;} },Qw = { cartesian2d: function cartesian2d(t, e, n) {var i = t.getItemLayout(e),r = Jh(n, i),a = i.width > 0 ? 1 : -1,o = i.height > 0 ? 1 : -1;return { x: i.x + a * r / 2, y: i.y + o * r / 2, width: i.width - a * r, height: i.height - o * r };}, polar: function polar(t, e) {var n = t.getItemLayout(e);return { cx: n.cx, cy: n.cy, r0: n.r0, r: n.r, startAngle: n.startAngle, endAngle: n.endAngle };} },Jw = Nr.extend({ type: "largeBar", shape: { points: [] }, buildPath: function buildPath(t, e) {for (var n = e.points, i = this.__startPoint, r = this.__valueIdx, a = 0; a < n.length; a += 2) {i[this.__valueIdx] = n[a + r], t.moveTo(i[0], i[1]), t.lineTo(n[a], n[a + 1]);}} }),tb = Math.PI,eb = function eb(t, e) {this.opt = e, this.axisModel = t, s(e, { labelOffset: 0, nameDirection: 1, tickDirection: 1, labelDirection: 1, silent: !0 }), this.group = new hg();var n = new hg({ position: e.position.slice(), rotation: e.rotation });n.updateTransform(), this._transform = n.transform, this._dumbGroup = n;};eb.prototype = { constructor: eb, hasBuilder: function hasBuilder(t) {return !!nb[t];}, add: function add(t) {nb[t].call(this);}, getGroup: function getGroup() {return this.group;} };var nb = { axisLine: function axisLine() {var t = this.opt,e = this.axisModel;if (e.get("axisLine.show")) {var n = this.axisModel.axis.getExtent(),i = this._transform,r = [n[0], 0],a = [n[1], 0];i && (ae(r, r, i), ae(a, a, i));var s = o({ lineCap: "round" }, e.getModel("axisLine.lineStyle").getLineStyle());this.group.add(new Lm(ea({ anid: "line", shape: { x1: r[0], y1: r[1], x2: a[0], y2: a[1] }, style: s, strokeContainThreshold: t.strokeContainThreshold || 5, silent: !0, z2: 1 })));var l = e.get("axisLine.symbol"),u = e.get("axisLine.symbolSize"),h = e.get("axisLine.symbolOffset") || 0;if ("number" == typeof h && (h = [h, h]), null != l) {"string" == typeof l && (l = [l, l]), ("string" == typeof u || "number" == typeof u) && (u = [u, u]);var c = u[0],d = u[1];f([{ rotate: t.rotation + Math.PI / 2, offset: h[0], r: 0 }, { rotate: t.rotation - Math.PI / 2, offset: h[1], r: Math.sqrt((r[0] - a[0]) * (r[0] - a[0]) + (r[1] - a[1]) * (r[1] - a[1])) }], function (e, n) {if ("none" !== l[n] && null != l[n]) {var i = ch(l[n], -c / 2, -d / 2, c, d, s.stroke, !0),a = e.r + e.offset,o = [r[0] + a * Math.cos(t.rotation), r[1] - a * Math.sin(t.rotation)];i.attr({ rotation: e.rotate, position: o, silent: !0 }), this.group.add(i);}}, this);}}}, axisTickLabel: function axisTickLabel() {var t = this.axisModel,e = this.opt,n = uc(this, t, e),i = hc(this, t, e);ac(t, i, n);}, axisName: function axisName() {var t = this.opt,e = this.axisModel,n = C(t.axisName, e.get("name"));if (n) {var i,r = e.get("nameLocation"),a = t.nameDirection,s = e.getModel("nameTextStyle"),l = e.get("nameGap") || 0,u = this.axisModel.axis.getExtent(),h = u[0] > u[1] ? -1 : 1,c = ["start" === r ? u[0] - h * l : "end" === r ? u[1] + h * l : (u[0] + u[1]) / 2, lc(r) ? t.labelOffset + a * l : 0],d = e.get("nameRotate");null != d && (d = d * tb / 180);var f;lc(r) ? i = ib(t.rotation, null != d ? d : t.rotation, a) : (i = ic(t, r, d || 0, u), f = t.axisNameAvailableWidth, null != f && (f = Math.abs(f / Math.sin(i.rotation)), !isFinite(f) && (f = null)));var p = s.getFont(),g = e.get("nameTruncate", !0) || {},v = g.ellipsis,m = C(t.nameTruncateMaxWidth, g.maxWidth, f),y = null != v && null != m ? cy(n, m, p, v, { minChar: 2, placeholder: g.placeholder }) : n,x = e.get("tooltip", !0),_ = e.mainType,w = { componentType: _, name: n, $vars: ["name"] };w[_ + "Index"] = e.componentIndex;var b = new wm({ anid: "name", __fullText: n, __truncatedText: y, position: c, rotation: i.rotation, silent: rc(e), z2: 1, tooltip: x && x.show ? o({ content: n, formatter: function formatter() {return n;}, formatterParams: w }, x) : null });wa(b.style, s, { text: y, textFont: p, textFill: s.getTextColor() || e.get("axisLine.lineStyle.color"), textAlign: i.textAlign, textVerticalAlign: i.textVerticalAlign }), e.get("triggerEvent") && (b.eventData = nc(e), b.eventData.targetType = "axisName", b.eventData.name = n), this._dumbGroup.add(b), b.updateTransform(), this.group.add(b), b.decomposeTransform();}} },ib = eb.innerTextLayout = function (t, e, n) {var i,r,a = eo(e - t);return no(a) ? (r = n > 0 ? "top" : "bottom", i = "center") : no(a - tb) ? (r = n > 0 ? "bottom" : "top", i = "center") : (r = "middle", i = a > 0 && tb > a ? n > 0 ? "right" : "left" : n > 0 ? "left" : "right"), { rotation: a, textAlign: i, textVerticalAlign: r };},rb = f,ab = x,ob = nu({ type: "axis", _axisPointer: null, axisPointerClass: null, render: function render(t, e, n, i) {this.axisPointerClass && mc(t), ob.superApply(this, "render", arguments), bc(this, t, e, n, i, !0);}, updateAxisPointer: function updateAxisPointer(t, e, n, i) {bc(this, t, e, n, i, !1);}, remove: function remove(t, e) {var n = this._axisPointer;n && n.remove(e), ob.superApply(this, "remove", arguments);}, dispose: function dispose(t, e) {Mc(this, e), ob.superApply(this, "dispose", arguments);} }),sb = [];ob.registerAxisPointerClass = function (t, e) {sb[t] = e;}, ob.getAxisPointerClass = function (t) {return t && sb[t];};var lb = ["axisLine", "axisTickLabel", "axisName"],ub = ["splitArea", "splitLine"],hb = ob.extend({ type: "cartesianAxis", axisPointerClass: "CartesianAxisPointer", render: function render(t, e, n, i) {this.group.removeAll();var r = this._axisGroup;if (this._axisGroup = new hg(), this.group.add(this._axisGroup), t.get("show")) {var a = t.getCoordSysModel(),o = Sc(a, t),s = new eb(t, o);f(lb, s.add, s), this._axisGroup.add(s.getGroup()), f(ub, function (e) {t.get(e + ".show") && this["_" + e](t, a);}, this), Ba(r, this._axisGroup, t), hb.superCall(this, "render", t, e, n, i);}}, remove: function remove() {this._splitAreaColors = null;}, _splitLine: function _splitLine(t, e) {var n = t.axis;if (!n.scale.isBlank()) {var i = t.getModel("splitLine"),r = i.getModel("lineStyle"),a = r.get("color");a = _(a) ? a : [a];for (var o = e.coordinateSystem.getRect(), l = n.isHorizontal(), u = 0, h = n.getTicksCoords({ tickModel: i }), c = [], d = [], f = r.getLineStyle(), p = 0; p < h.length; p++) {var g = n.toGlobalCoord(h[p].coord);l ? (c[0] = g, c[1] = o.y, d[0] = g, d[1] = o.y + o.height) : (c[0] = o.x, c[1] = g, d[0] = o.x + o.width, d[1] = g);var v = u++ % a.length,m = h[p].tickValue;this._axisGroup.add(new Lm(ea({ anid: null != m ? "line_" + h[p].tickValue : null, shape: { x1: c[0], y1: c[1], x2: d[0], y2: d[1] }, style: s({ stroke: a[v] }, f), silent: !0 })));}}}, _splitArea: function _splitArea(t, e) {var n = t.axis;if (!n.scale.isBlank()) {var i = t.getModel("splitArea"),r = i.getModel("areaStyle"),a = r.get("color"),o = e.coordinateSystem.getRect(),l = n.getTicksCoords({ tickModel: i, clamp: !0 });if (l.length) {var u = a.length,h = this._splitAreaColors,c = N(),d = 0;if (h) for (var f = 0; f < l.length; f++) {var p = h.get(l[f].tickValue);if (null != p) {d = (p + (u - 1) * f) % u;break;}}var g = n.toGlobalCoord(l[0].coord),v = r.getAreaStyle();a = _(a) ? a : [a];for (var f = 1; f < l.length; f++) {var m,y,x,w,b = n.toGlobalCoord(l[f].coord);n.isHorizontal() ? (m = g, y = o.y, x = b - m, w = o.height, g = m + x) : (m = o.x, y = g, x = o.width, w = b - y, g = y + w);var M = l[f - 1].tickValue;null != M && c.set(M, d), this._axisGroup.add(new Pm({ anid: null != M ? "area_" + M : null, shape: { x: m, y: y, width: x, height: w }, style: s({ fill: a[d] }, v), silent: !0 })), d = (d + 1) % u;}this._splitAreaColors = c;}}} });hb.extend({ type: "xAxis" }), hb.extend({ type: "yAxis" }), nu({ type: "grid", render: function render(t) {this.group.removeAll(), t.get("show") && this.group.add(new Pm({ shape: t.coordinateSystem.getRect(), style: s({ fill: t.get("backgroundColor") }, t.getItemStyle()), silent: !0, z2: -1 }));} }), Xl(function (t) {t.xAxis && t.yAxis && !t.grid && (t.grid = {});}), Kl(x($u, "bar")), Kl(Q_), Ql({ seriesType: "bar", reset: function reset(t) {t.getData().setVisual("legendSymbol", "roundRect");} }), sx.extend({ type: "series.line", dependencies: ["grid", "polar"], getInitialData: function getInitialData() {return Lu(this.getSource(), this);}, defaultOption: { zlevel: 0, z: 2, coordinateSystem: "cartesian2d", legendHoverLink: !0, hoverAnimation: !0, clipOverflow: !0, label: { position: "top" }, lineStyle: { width: 2, type: "solid" }, step: !1, smooth: !1, smoothMonotone: null, symbol: "emptyCircle", symbolSize: 4, symbolRotate: null, showSymbol: !0, showAllSymbol: "auto", connectNulls: !1, sampling: "none", animationEasing: "linear", progressive: 0, hoverLayerThreshold: 1 / 0 } });var cb = Ic.prototype,db = Ic.getSymbolSize = function (t, e) {var n = t.getItemVisual(e, "symbolSize");return n instanceof Array ? n.slice() : [+n, +n];};cb._createSymbol = function (t, e, n, i, r) {this.removeAll();var a = e.getItemVisual(n, "color"),o = ch(t, -1, -1, 2, 2, a, r);o.attr({ z2: 100, culling: !0, scale: Tc(i) }), o.drift = Ac, this._symbolType = t, this.add(o);}, cb.stopSymbolAnimation = function (t) {this.childAt(0).stopAnimation(t);}, cb.getSymbolPath = function () {return this.childAt(0);}, cb.getScale = function () {return this.childAt(0).scale;}, cb.highlight = function () {this.childAt(0).trigger("emphasis");}, cb.downplay = function () {this.childAt(0).trigger("normal");}, cb.setZ = function (t, e) {var n = this.childAt(0);n.zlevel = t, n.z = e;}, cb.setDraggable = function (t) {var e = this.childAt(0);e.draggable = t, e.cursor = t ? "move" : "pointer";}, cb.updateData = function (t, e, n) {this.silent = !1;var i = t.getItemVisual(e, "symbol") || "circle",r = t.hostModel,a = db(t, e),o = i !== this._symbolType;if (o) {var s = t.getItemVisual(e, "symbolKeepAspect");this._createSymbol(i, t, e, a, s);} else {var l = this.childAt(0);l.silent = !1, Pa(l, { scale: Tc(a) }, r, e);}if (this._updateCommon(t, e, a, n), o) {var l = this.childAt(0),u = n && n.fadeIn,h = { scale: l.scale.slice() };u && (h.style = { opacity: l.style.opacity }), l.scale = [0, 0], u && (l.style.opacity = 0), La(l, h, r, e);}this._seriesModel = r;};var fb = ["itemStyle"],pb = ["emphasis", "itemStyle"],gb = ["label"],vb = ["emphasis", "label"];cb._updateCommon = function (t, e, n, i) {function r(e) {return b ? t.getName(e) : qh(t, e);}var a = this.childAt(0),s = t.hostModel,l = t.getItemVisual(e, "color");"image" !== a.type && a.useStyle({ strokeNoScale: !0 });var u = i && i.itemStyle,h = i && i.hoverItemStyle,c = i && i.symbolRotate,d = i && i.symbolOffset,f = i && i.labelModel,p = i && i.hoverLabelModel,g = i && i.hoverAnimation,v = i && i.cursorStyle;if (!i || t.hasItemOption) {var m = i && i.itemModel ? i.itemModel : t.getItemModel(e);u = m.getModel(fb).getItemStyle(["color"]), h = m.getModel(pb).getItemStyle(), c = m.getShallow("symbolRotate"), d = m.getShallow("symbolOffset"), f = m.getModel(gb), p = m.getModel(vb), g = m.getShallow("hoverAnimation"), v = m.getShallow("cursor");} else h = o({}, h);var y = a.style;a.attr("rotation", (c || 0) * Math.PI / 180 || 0), d && a.attr("position", [ja(d[0], n[0]), ja(d[1], n[1])]), v && a.attr("cursor", v), a.setColor(l, i && i.symbolInnerColor), a.setStyle(u);var x = t.getItemVisual(e, "opacity");null != x && (y.opacity = x);var _ = t.getItemVisual(e, "liftZ"),w = a.__z2Origin;null != _ ? null == w && (a.__z2Origin = a.z2, a.z2 += _) : null != w && (a.z2 = w, a.__z2Origin = null);var b = i && i.useNameLabel;_a(y, h, f, p, { labelFetcher: s, labelDataIndex: e, defaultText: r, isRectText: !0, autoColor: l }), a.off("mouseover").off("mouseout").off("emphasis").off("normal"), a.hoverStyle = h, ya(a), a.__symbolOriginalScale = Tc(n), g && s.isAnimationEnabled() && a.on("mouseover", Cc).on("mouseout", Dc).on("emphasis", kc).on("normal", Pc);}, cb.fadeOut = function (t, e) {var n = this.childAt(0);this.silent = n.silent = !0, !(e && e.keepLabel) && (n.style.text = null), Pa(n, { style: { opacity: 0 }, scale: [0, 0] }, this._seriesModel, this.dataIndex, t);}, h(Ic, hg);var mb = Lc.prototype;mb.updateData = function (t, e) {e = zc(e);var n = this.group,i = t.hostModel,r = this._data,a = this._symbolCtor,o = Ec(t);r || n.removeAll(), t.diff(r).add(function (i) {var r = t.getItemLayout(i);if (Oc(t, r, i, e)) {var s = new a(t, i, o);s.attr("position", r), t.setItemGraphicEl(i, s), n.add(s);}}).update(function (s, l) {var u = r.getItemGraphicEl(l),h = t.getItemLayout(s);return Oc(t, h, s, e) ? (u ? (u.updateData(t, s, o), Pa(u, { position: h }, i)) : (u = new a(t, s), u.attr("position", h)), n.add(u), void t.setItemGraphicEl(s, u)) : void n.remove(u);}).remove(function (t) {var e = r.getItemGraphicEl(t);e && e.fadeOut(function () {n.remove(e);});}).execute(), this._data = t;}, mb.isPersistent = function () {return !0;}, mb.updateLayout = function () {var t = this._data;t && t.eachItemGraphicEl(function (e, n) {var i = t.getItemLayout(n);e.attr("position", i);});}, mb.incrementalPrepareUpdate = function (t) {this._seriesScope = Ec(t), this._data = null, this.group.removeAll();}, mb.incrementalUpdate = function (t, e, n) {function i(t) {t.isGroup || (t.incremental = t.useHoverLayer = !0);}n = zc(n);for (var r = t.start; r < t.end; r++) {var a = e.getItemLayout(r);if (Oc(e, a, r, n)) {var o = new this._symbolCtor(e, r, this._seriesScope);o.traverse(i), o.attr("position", a), this.group.add(o), e.setItemGraphicEl(r, o);}}}, mb.remove = function (t) {var e = this.group,n = this._data;n && t ? n.eachItemGraphicEl(function (t) {t.fadeOut(function () {e.remove(t);});}) : e.removeAll();};var yb = function yb(t, e, n, i, r, a, o, s) {for (var l = Fc(t, e), u = [], h = [], c = [], d = [], f = [], p = [], g = [], v = Bc(r, e, o), m = Bc(a, t, s), y = 0; y < l.length; y++) {var x = l[y],_ = !0;switch (x.cmd) {case "=":var w = t.getItemLayout(x.idx),b = e.getItemLayout(x.idx1);(isNaN(w[0]) || isNaN(w[1])) && (w = b.slice()), u.push(w), h.push(b), c.push(n[x.idx]), d.push(i[x.idx1]), g.push(e.getRawIndex(x.idx1));break;case "+":var M = x.idx;u.push(r.dataToPoint([e.get(v.dataDimsForPoint[0], M), e.get(v.dataDimsForPoint[1], M)])), h.push(e.getItemLayout(M).slice()), c.push(Nc(v, r, e, M)), d.push(i[M]), g.push(e.getRawIndex(M));break;case "-":var M = x.idx,S = t.getRawIndex(M);S !== M ? (u.push(t.getItemLayout(M)), h.push(a.dataToPoint([t.get(m.dataDimsForPoint[0], M), t.get(m.dataDimsForPoint[1], M)])), c.push(n[M]), d.push(Nc(m, a, t, M)), g.push(S)) : _ = !1;}_ && (f.push(x), p.push(p.length));}p.sort(function (t, e) {return g[t] - g[e];});for (var I = [], T = [], A = [], C = [], D = [], y = 0; y < p.length; y++) {var M = p[y];I[y] = u[M], T[y] = h[M], A[y] = c[M], C[y] = d[M], D[y] = f[M];}return { current: I, next: T, stackedOnCurrent: A, stackedOnNext: C, status: D };},xb = oe,_b = se,wb = Y,bb = G,Mb = [],Sb = [],Ib = [],Tb = Nr.extend({ type: "ec-polyline", shape: { points: [], smooth: 0, smoothConstraint: !0, smoothMonotone: null, connectNulls: !1 }, style: { fill: null, stroke: "#000" }, brush: Sm(Nr.prototype.brush), buildPath: function buildPath(t, e) {var n = e.points,i = 0,r = n.length,a = Zc(n, e.smoothConstraint);if (e.connectNulls) {for (; r > 0 && Vc(n[r - 1]); r--) {;}for (; r > i && Vc(n[i]); i++) {;}}for (; r > i;) {i += Wc(t, n, i, r, r, 1, a.min, a.max, e.smooth, e.smoothMonotone, e.connectNulls) + 1;}} }),Ab = Nr.extend({ type: "ec-polygon", shape: { points: [], stackedOnPoints: [], smooth: 0, stackedOnSmooth: 0, smoothConstraint: !0, smoothMonotone: null, connectNulls: !1 }, brush: Sm(Nr.prototype.brush), buildPath: function buildPath(t, e) {var n = e.points,i = e.stackedOnPoints,r = 0,a = n.length,o = e.smoothMonotone,s = Zc(n, e.smoothConstraint),l = Zc(i, e.smoothConstraint);if (e.connectNulls) {for (; a > 0 && Vc(n[a - 1]); a--) {;}for (; a > r && Vc(n[r]); r++) {;}}for (; a > r;) {var u = Wc(t, n, r, a, a, 1, s.min, s.max, e.smooth, o, e.connectNulls);Wc(t, i, r + u - 1, u, a, -1, l.min, l.max, e.stackedOnSmooth, o, e.connectNulls), r += u + 1, t.closePath();}} });Bs.extend({ type: "line", init: function init() {var t = new hg(),e = new Lc();this.group.add(e.group), this._symbolDraw = e, this._lineGroup = t;}, render: function render(t, e, n) {var i = t.coordinateSystem,r = this.group,a = t.getData(),o = t.getModel("lineStyle"),l = t.getModel("areaStyle"),u = a.mapArray(a.getItemLayout),h = "polar" === i.type,c = this._coordSys,d = this._symbolDraw,f = this._polyline,p = this._polygon,g = this._lineGroup,v = t.get("animation"),m = !l.isEmpty(),y = l.get("origin"),x = Bc(i, a, y),_ = jc(i, a, x),w = t.get("showSymbol"),b = w && !h && td(t, a, i),M = this._data;
      M && M.eachItemGraphicEl(function (t, e) {t.__temp && (r.remove(t), M.setItemGraphicEl(e, null));}), w || d.remove(), r.add(g);var S = !h && t.get("step");f && c.type === i.type && S === this._step ? (m && !p ? p = this._newPolygon(u, _, i, v) : p && !m && (g.remove(p), p = this._polygon = null), g.setClipPath(Kc(i, !1, !1, t)), w && d.updateData(a, { isIgnore: b, clipShape: Kc(i, !1, !0, t) }), a.eachItemGraphicEl(function (t) {t.stopAnimation(!0);}), Xc(this._stackedOnPoints, _) && Xc(this._points, u) || (v ? this._updateAnimation(a, _, i, n, S, y) : (S && (u = Qc(u, i, S), _ = Qc(_, i, S)), f.setShape({ points: u }), p && p.setShape({ points: u, stackedOnPoints: _ })))) : (w && d.updateData(a, { isIgnore: b, clipShape: Kc(i, !1, !0, t) }), S && (u = Qc(u, i, S), _ = Qc(_, i, S)), f = this._newPolyline(u, i, v), m && (p = this._newPolygon(u, _, i, v)), g.setClipPath(Kc(i, !0, !1, t)));var I = Jc(a, i) || a.getVisual("color");f.useStyle(s(o.getLineStyle(), { fill: "none", stroke: I, lineJoin: "bevel" }));var T = t.get("smooth");if (T = Yc(t.get("smooth")), f.setShape({ smooth: T, smoothMonotone: t.get("smoothMonotone"), connectNulls: t.get("connectNulls") }), p) {var A = a.getCalculationInfo("stackedOnSeries"),C = 0;p.useStyle(s(l.getAreaStyle(), { fill: I, opacity: .7, lineJoin: "bevel" })), A && (C = Yc(A.get("smooth"))), p.setShape({ smooth: T, stackedOnSmooth: C, smoothMonotone: t.get("smoothMonotone"), connectNulls: t.get("connectNulls") });}this._data = a, this._coordSys = i, this._stackedOnPoints = _, this._points = u, this._step = S, this._valueOrigin = y;}, dispose: function dispose() {}, highlight: function highlight(t, e, n, i) {var r = t.getData(),a = Xi(r, i);if (!(a instanceof Array) && null != a && a >= 0) {var o = r.getItemGraphicEl(a);if (!o) {var s = r.getItemLayout(a);if (!s) return;o = new Ic(r, a), o.position = s, o.setZ(t.get("zlevel"), t.get("z")), o.ignore = isNaN(s[0]) || isNaN(s[1]), o.__temp = !0, r.setItemGraphicEl(a, o), o.stopSymbolAnimation(!0), this.group.add(o);}o.highlight();} else Bs.prototype.highlight.call(this, t, e, n, i);}, downplay: function downplay(t, e, n, i) {var r = t.getData(),a = Xi(r, i);if (null != a && a >= 0) {var o = r.getItemGraphicEl(a);o && (o.__temp ? (r.setItemGraphicEl(a, null), this.group.remove(o)) : o.downplay());} else Bs.prototype.downplay.call(this, t, e, n, i);}, _newPolyline: function _newPolyline(t) {var e = this._polyline;return e && this._lineGroup.remove(e), e = new Tb({ shape: { points: t }, silent: !0, z2: 10 }), this._lineGroup.add(e), this._polyline = e, e;}, _newPolygon: function _newPolygon(t, e) {var n = this._polygon;return n && this._lineGroup.remove(n), n = new Ab({ shape: { points: t, stackedOnPoints: e }, silent: !0 }), this._lineGroup.add(n), this._polygon = n, n;}, _updateAnimation: function _updateAnimation(t, e, n, i, r, a) {var o = this._polyline,s = this._polygon,l = t.hostModel,u = yb(this._data, t, this._stackedOnPoints, e, this._coordSys, n, this._valueOrigin, a),h = u.current,c = u.stackedOnCurrent,d = u.next,f = u.stackedOnNext;r && (h = Qc(u.current, n, r), c = Qc(u.stackedOnCurrent, n, r), d = Qc(u.next, n, r), f = Qc(u.stackedOnNext, n, r)), o.shape.__points = u.current, o.shape.points = h, Pa(o, { shape: { points: d } }, l), s && (s.setShape({ points: h, stackedOnPoints: c }), Pa(s, { shape: { points: d, stackedOnPoints: f } }, l));for (var p = [], g = u.status, v = 0; v < g.length; v++) {var m = g[v].cmd;if ("=" === m) {var y = t.getItemGraphicEl(g[v].idx1);y && p.push({ el: y, ptIdx: v });}}o.animators && o.animators.length && o.animators[0].during(function () {for (var t = 0; t < p.length; t++) {var e = p[t].el;e.attr("position", o.shape.__points[p[t].ptIdx]);}});}, remove: function remove() {var t = this.group,e = this._data;this._lineGroup.removeAll(), this._symbolDraw.remove(!0), e && e.eachItemGraphicEl(function (n, i) {n.__temp && (t.remove(n), e.setItemGraphicEl(i, null));}), this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._data = null;} });var Cb = function Cb(t, e, n) {return { seriesType: t, performRawSeries: !0, reset: function reset(t, i) {function r(e, n) {if ("function" == typeof s) {var i = t.getRawValue(n),r = t.getDataParams(n);e.setItemVisual(n, "symbolSize", s(i, r));}if (e.hasItemOption) {var a = e.getItemModel(n),o = a.getShallow("symbol", !0),l = a.getShallow("symbolSize", !0),u = a.getShallow("symbolKeepAspect", !0);null != o && e.setItemVisual(n, "symbol", o), null != l && e.setItemVisual(n, "symbolSize", l), null != u && e.setItemVisual(n, "symbolKeepAspect", u);}}var a = t.getData(),o = t.get("symbol") || e,s = t.get("symbolSize"),l = t.get("symbolKeepAspect");if (a.setVisual({ legendSymbol: n || o, symbol: o, symbolSize: s, symbolKeepAspect: l }), !i.isSeriesFiltered(t)) {var u = "function" == typeof s;return { dataEach: a.hasItemOption || u ? r : null };}} };},Db = function Db(t) {return { seriesType: t, plan: hx(), reset: function reset(t) {function e(t, e) {for (var n = t.end - t.start, r = a && new Float32Array(n * s), l = t.start, u = 0, h = [], c = []; l < t.end; l++) {var d;if (1 === s) {var f = e.get(o[0], l);d = !isNaN(f) && i.dataToPoint(f, null, c);} else {var f = h[0] = e.get(o[0], l),p = h[1] = e.get(o[1], l);d = !isNaN(f) && !isNaN(p) && i.dataToPoint(h, null, c);}a ? (r[u++] = d ? d[0] : 0 / 0, r[u++] = d ? d[1] : 0 / 0) : e.setItemLayout(l, d && d.slice() || [0 / 0, 0 / 0]);}a && e.setLayout("symbolPoints", r);}var n = t.getData(),i = t.coordinateSystem,r = t.pipelineContext,a = r.large;if (i) {var o = p(i.dimensions, function (t) {return n.mapDimension(t);}).slice(0, 2),s = o.length,l = n.getCalculationInfo("stackResultDimension");return ku(n, o[0]) && (o[0] = l), ku(n, o[1]) && (o[1] = l), s && { progress: e };}} };},kb = { average: function average(t) {for (var e = 0, n = 0, i = 0; i < t.length; i++) {isNaN(t[i]) || (e += t[i], n++);}return 0 === n ? 0 / 0 : e / n;}, sum: function sum(t) {for (var e = 0, n = 0; n < t.length; n++) {e += t[n] || 0;}return e;}, max: function max(t) {for (var e = -1 / 0, n = 0; n < t.length; n++) {t[n] > e && (e = t[n]);}return isFinite(e) ? e : 0 / 0;}, min: function min(t) {for (var e = 1 / 0, n = 0; n < t.length; n++) {t[n] < e && (e = t[n]);}return isFinite(e) ? e : 0 / 0;}, nearest: function nearest(t) {return t[0];} },Pb = function Pb(t) {return Math.round(t.length / 2);},Lb = function Lb(t) {return { seriesType: t, modifyOutputEnd: !0, reset: function reset(t) {var e = t.getData(),n = t.get("sampling"),i = t.coordinateSystem;if ("cartesian2d" === i.type && n) {var r = i.getBaseAxis(),a = i.getOtherAxis(r),o = r.getExtent(),s = o[1] - o[0],l = Math.round(e.count() / s);if (l > 1) {var u;"string" == typeof n ? u = kb[n] : "function" == typeof n && (u = n), u && t.setData(e.downSample(e.mapDimension(a.dim), 1 / l, u, Pb));}}} };};Ql(Cb("line", "circle", "line")), Kl(Db("line")), Yl(l_.PROCESSOR.STATISTIC, Lb("line"));var Ob = function Ob(t, e, n) {e = _(e) && { coordDimensions: e } || o({}, e);var i = t.getSource(),r = G_(i, e),a = new F_(r, t);return a.initData(i, n), a;},zb = { updateSelectedMap: function updateSelectedMap(t) {this._targetList = _(t) ? t.slice() : [], this._selectTargetMap = g(t || [], function (t, e) {return t.set(e.name, e), t;}, N());}, select: function select(t, e) {var n = null != e ? this._targetList[e] : this._selectTargetMap.get(t),i = this.get("selectedMode");"single" === i && this._selectTargetMap.each(function (t) {t.selected = !1;}), n && (n.selected = !0);}, unSelect: function unSelect(t, e) {var n = null != e ? this._targetList[e] : this._selectTargetMap.get(t);n && (n.selected = !1);}, toggleSelected: function toggleSelected(t, e) {var n = null != e ? this._targetList[e] : this._selectTargetMap.get(t);return null != n ? (this[n.selected ? "unSelect" : "select"](t, e), n.selected) : void 0;}, isSelected: function isSelected(t, e) {var n = null != e ? this._targetList[e] : this._selectTargetMap.get(t);return n && n.selected;} },Eb = iu({ type: "series.pie", init: function init(t) {Eb.superApply(this, "init", arguments), this.legendDataProvider = function () {return this.getRawData();}, this.updateSelectedMap(this._createSelectableList()), this._defaultLabelLine(t);}, mergeOption: function mergeOption(t) {Eb.superCall(this, "mergeOption", t), this.updateSelectedMap(this._createSelectableList());}, getInitialData: function getInitialData() {return Ob(this, ["value"]);}, _createSelectableList: function _createSelectableList() {for (var t = this.getRawData(), e = t.mapDimension("value"), n = [], i = 0, r = t.count(); r > i; i++) {n.push({ name: t.getName(i), value: t.get(e, i), selected: Ms(t, i, "selected") });}return n;}, getDataParams: function getDataParams(t) {var e = this.getData(),n = Eb.superCall(this, "getDataParams", t),i = [];return e.each(e.mapDimension("value"), function (t) {i.push(t);}), n.percent = to(i, t, e.hostModel.get("percentPrecision")), n.$vars.push("percent"), n;}, _defaultLabelLine: function _defaultLabelLine(t) {Ni(t, "labelLine", ["show"]);var e = t.labelLine,n = t.emphasis.labelLine;e.show = e.show && t.label.show, n.show = n.show && t.emphasis.label.show;}, defaultOption: { zlevel: 0, z: 2, legendHoverLink: !0, hoverAnimation: !0, center: ["50%", "50%"], radius: [0, "75%"], clockwise: !0, startAngle: 90, minAngle: 0, selectedOffset: 10, hoverOffset: 10, avoidLabelOverlap: !0, percentPrecision: 2, stillShowZeroSum: !0, label: { rotate: !1, show: !0, position: "outer" }, labelLine: { show: !0, length: 15, length2: 15, smooth: !1, lineStyle: { width: 1, type: "solid" } }, itemStyle: { borderWidth: 1 }, animationType: "expansion", animationEasing: "cubicOut" } });c(Eb, zb);var Bb = rd.prototype;Bb.updateData = function (t, e, n) {function i() {a.stopAnimation(!0), a.animateTo({ shape: { r: h.r + l.get("hoverOffset") } }, 300, "elasticOut");}function r() {a.stopAnimation(!0), a.animateTo({ shape: { r: h.r } }, 300, "elasticOut");}var a = this.childAt(0),l = t.hostModel,u = t.getItemModel(e),h = t.getItemLayout(e),c = o({}, h);if (c.label = null, n) {a.setShape(c);var d = l.getShallow("animationType");"scale" === d ? (a.shape.r = h.r0, La(a, { shape: { r: h.r } }, l, e)) : (a.shape.endAngle = h.startAngle, Pa(a, { shape: { endAngle: h.endAngle } }, l, e));} else Pa(a, { shape: c }, l, e);var f = t.getItemVisual(e, "color");a.useStyle(s({ lineJoin: "bevel", fill: f }, u.getModel("itemStyle").getItemStyle())), a.hoverStyle = u.getModel("emphasis.itemStyle").getItemStyle();var p = u.getShallow("cursor");p && a.attr("cursor", p), id(this, t.getItemLayout(e), l.isSelected(null, e), l.get("selectedOffset"), l.get("animation")), a.off("mouseover").off("mouseout").off("emphasis").off("normal"), u.get("hoverAnimation") && l.isAnimationEnabled() && a.on("mouseover", i).on("mouseout", r).on("emphasis", i).on("normal", r), this._updateLabel(t, e), ya(this);}, Bb._updateLabel = function (t, e) {var n = this.childAt(1),i = this.childAt(2),r = t.hostModel,a = t.getItemModel(e),o = t.getItemLayout(e),s = o.label,l = t.getItemVisual(e, "color");Pa(n, { shape: { points: s.linePoints || [[s.x, s.y], [s.x, s.y], [s.x, s.y]] } }, r, e), Pa(i, { style: { x: s.x, y: s.y } }, r, e), i.attr({ rotation: s.rotation, origin: [s.x, s.y], z2: 10 });var u = a.getModel("label"),h = a.getModel("emphasis.label"),c = a.getModel("labelLine"),d = a.getModel("emphasis.labelLine"),l = t.getItemVisual(e, "color");_a(i.style, i.hoverStyle = {}, u, h, { labelFetcher: t.hostModel, labelDataIndex: e, defaultText: t.getName(e), autoColor: l, useInsideStyle: !!s.inside }, { textAlign: s.textAlign, textVerticalAlign: s.verticalAlign, opacity: t.getItemVisual(e, "opacity") }), i.ignore = i.normalIgnore = !u.get("show"), i.hoverIgnore = !h.get("show"), n.ignore = n.normalIgnore = !c.get("show"), n.hoverIgnore = !d.get("show"), n.setStyle({ stroke: l, opacity: t.getItemVisual(e, "opacity") }), n.setStyle(c.getModel("lineStyle").getLineStyle()), n.hoverStyle = d.getModel("lineStyle").getLineStyle();var f = c.get("smooth");f && f === !0 && (f = .4), n.setShape({ smooth: f });}, h(rd, hg);var Rb = (Bs.extend({ type: "pie", init: function init() {var t = new hg();this._sectorGroup = t;}, render: function render(t, e, n, i) {if (!i || i.from !== this.uid) {var r = t.getData(),a = this._data,o = this.group,s = e.get("animation"),l = !a,u = t.get("animationType"),h = x(nd, this.uid, t, s, n),c = t.get("selectedMode");if (r.diff(a).add(function (t) {var e = new rd(r, t);l && "scale" !== u && e.eachChild(function (t) {t.stopAnimation(!0);}), c && e.on("click", h), r.setItemGraphicEl(t, e), o.add(e);}).update(function (t, e) {var n = a.getItemGraphicEl(e);n.updateData(r, t), n.off("click"), c && n.on("click", h), o.add(n), r.setItemGraphicEl(t, n);}).remove(function (t) {var e = a.getItemGraphicEl(t);o.remove(e);}).execute(), s && l && r.count() > 0 && "scale" !== u) {var d = r.getItemLayout(0),f = Math.max(n.getWidth(), n.getHeight()) / 2,p = y(o.removeClipPath, o);o.setClipPath(this._createClipPath(d.cx, d.cy, f, d.startAngle, d.clockwise, p, t));} else o.removeClipPath();this._data = r;}}, dispose: function dispose() {}, _createClipPath: function _createClipPath(t, e, n, i, r, a, o) {var s = new Im({ shape: { cx: t, cy: e, r0: 0, r: n, startAngle: i, endAngle: i, clockwise: r } });return La(s, { shape: { endAngle: i + (r ? 1 : -1) * Math.PI * 2 } }, o, a), s;}, containPoint: function containPoint(t, e) {var n = e.getData(),i = n.getItemLayout(0);if (i) {var r = t[0] - i.cx,a = t[1] - i.cy,o = Math.sqrt(r * r + a * a);return o <= i.r && o >= i.r0;}} }), function (t, e) {f(e, function (e) {e.update = "updateView", jl(e, function (n, i) {var r = {};return i.eachComponent({ mainType: "series", subType: t, query: n }, function (t) {t[e.method] && t[e.method](n.name, n.dataIndex);var i = t.getData();i.each(function (e) {var n = i.getName(e);r[n] = t.isSelected(n) || !1;});}), { name: n.name, selected: r };});});}),Nb = function Nb(t) {return { getTargetSeries: function getTargetSeries(e) {var n = {},i = N();return e.eachSeriesByType(t, function (t) {t.__paletteScope = n, i.set(t.uid, t);}), i;}, reset: function reset(t) {var e = t.getRawData(),n = {},i = t.getData();i.each(function (t) {var e = i.getRawIndex(t);n[e] = t;}), e.each(function (r) {var a = n[r],o = null != a && i.getItemVisual(a, "color", !0);if (o) e.setItemVisual(r, "color", o);else {var s = e.getItemModel(r),l = s.get("itemStyle.color") || t.getColorFromPalette(e.getName(r) || r + "", t.__paletteScope, e.count());e.setItemVisual(r, "color", l), null != a && i.setItemVisual(a, "color", l);}});} };},Fb = function Fb(t, e, n, i) {var r,a,o = t.getData(),s = [],l = !1;o.each(function (n) {var i,u,h,c,d = o.getItemLayout(n),f = o.getItemModel(n),p = f.getModel("label"),g = p.get("position") || f.get("emphasis.label.position"),v = f.getModel("labelLine"),m = v.get("length"),y = v.get("length2"),x = (d.startAngle + d.endAngle) / 2,_ = Math.cos(x),w = Math.sin(x);r = d.cx, a = d.cy;var b = "inside" === g || "inner" === g;if ("center" === g) i = d.cx, u = d.cy, c = "center";else {var M = (b ? (d.r + d.r0) / 2 * _ : d.r * _) + r,S = (b ? (d.r + d.r0) / 2 * w : d.r * w) + a;if (i = M + 3 * _, u = S + 3 * w, !b) {var I = M + _ * (m + e - d.r),T = S + w * (m + e - d.r),A = I + (0 > _ ? -1 : 1) * y,C = T;i = A + (0 > _ ? -5 : 5), u = C, h = [[M, S], [I, T], [A, C]];}c = b ? "center" : _ > 0 ? "left" : "right";}var D = p.getFont(),k = p.get("rotate") ? 0 > _ ? -x + Math.PI : -x : 0,P = t.getFormattedLabel(n, "normal") || o.getName(n),L = En(P, D, c, "top");l = !!k, d.label = { x: i, y: u, position: g, height: L.height, len: m, len2: y, linePoints: h, textAlign: c, verticalAlign: "middle", rotation: k, inside: b }, b || s.push(d.label);}), !l && t.get("avoidLabelOverlap") && od(s, r, a, e, n, i);},Vb = 2 * Math.PI,Wb = Math.PI / 180,Gb = function Gb(t, e, n) {e.eachSeriesByType(t, function (t) {var e = t.getData(),i = e.mapDimension("value"),r = t.get("center"),a = t.get("radius");_(a) || (a = [0, a]), _(r) || (r = [r, r]);var o = n.getWidth(),s = n.getHeight(),l = Math.min(o, s),u = ja(r[0], o),h = ja(r[1], s),c = ja(a[0], l / 2),d = ja(a[1], l / 2),f = -t.get("startAngle") * Wb,p = t.get("minAngle") * Wb,g = 0;e.each(i, function (t) {!isNaN(t) && g++;});var v = e.getSum(i),m = Math.PI / (v || g) * 2,y = t.get("clockwise"),x = t.get("roseType"),w = t.get("stillShowZeroSum"),b = e.getDataExtent(i);b[0] = 0;var M = Vb,S = 0,I = f,T = y ? 1 : -1;if (e.each(i, function (t, n) {var i;if (isNaN(t)) return void e.setItemLayout(n, { angle: 0 / 0, startAngle: 0 / 0, endAngle: 0 / 0, clockwise: y, cx: u, cy: h, r0: c, r: x ? 0 / 0 : d });i = "area" !== x ? 0 === v && w ? m : t * m : Vb / g, p > i ? (i = p, M -= p) : S += t;var r = I + T * i;e.setItemLayout(n, { angle: i, startAngle: I, endAngle: r, clockwise: y, cx: u, cy: h, r0: c, r: x ? qa(t, b, [c, d]) : d }), I = r;}), Vb > M && g) if (.001 >= M) {var A = Vb / g;e.each(i, function (t, n) {if (!isNaN(t)) {var i = e.getItemLayout(n);i.angle = A, i.startAngle = f + T * n * A, i.endAngle = f + T * (n + 1) * A;}});} else m = M / S, I = f, e.each(i, function (t, n) {if (!isNaN(t)) {var i = e.getItemLayout(n),r = i.angle === p ? p : t * m;i.startAngle = I, i.endAngle = I + T * r, I += T * r;}});Fb(t, d, o, s);});},Hb = function Hb(t) {return { seriesType: t, reset: function reset(t, e) {var n = e.findComponents({ mainType: "legend" });if (n && n.length) {var i = t.getData();i.filterSelf(function (t) {for (var e = i.getName(t), r = 0; r < n.length; r++) {if (!n[r].isSelected(e)) return !1;}return !0;});}} };};Rb("pie", [{ type: "pieToggleSelect", event: "pieselectchanged", method: "toggleSelected" }, { type: "pieSelect", event: "pieselected", method: "select" }, { type: "pieUnSelect", event: "pieunselected", method: "unSelect" }]), Ql(Nb("pie")), Kl(x(Gb, "pie")), Yl(Hb("pie"));{var Zb = (sx.extend({ type: "series.gauge", getInitialData: function getInitialData(t) {var e = t.data || [];return _(e) || (e = [e]), t.data = e, Ob(this, ["value"]);}, defaultOption: { zlevel: 0, z: 2, center: ["50%", "50%"], legendHoverLink: !0, radius: "75%", startAngle: 225, endAngle: -45, clockwise: !0, min: 0, max: 100, splitNumber: 10, axisLine: { show: !0, lineStyle: { color: [[.2, "#91c7ae"], [.8, "#63869e"], [1, "#c23531"]], width: 30 } }, splitLine: { show: !0, length: 30, lineStyle: { color: "#eee", width: 2, type: "solid" } }, axisTick: { show: !0, splitNumber: 5, length: 8, lineStyle: { color: "#eee", width: 1, type: "solid" } }, axisLabel: { show: !0, distance: 5, color: "auto" }, pointer: { show: !0, length: "80%", width: 8 }, itemStyle: { color: "auto" }, title: { show: !0, offsetCenter: [0, "-40%"], color: "#333", fontSize: 15 }, detail: { show: !0, backgroundColor: "rgba(0,0,0,0)", borderWidth: 0, borderColor: "#ccc", width: 100, height: null, padding: [5, 10], offsetCenter: [0, "40%"], color: "auto", fontSize: 30 } } }), Nr.extend({ type: "echartsGaugePointer", shape: { angle: 0, width: 10, r: 10, x: 0, y: 0 }, buildPath: function buildPath(t, e) {var n = Math.cos,i = Math.sin,r = e.r,a = e.width,o = e.angle,s = e.x - n(o) * a * (a >= r / 3 ? 1 : 2),l = e.y - i(o) * a * (a >= r / 3 ? 1 : 2);o = e.angle - Math.PI / 2, t.moveTo(s, l), t.lineTo(e.x + n(o) * a, e.y + i(o) * a), t.lineTo(e.x + n(e.angle) * r, e.y + i(e.angle) * r), t.lineTo(e.x - n(o) * a, e.y - i(o) * a), t.lineTo(s, l);} })),Xb = 2 * Math.PI;Bs.extend({ type: "gauge", render: function render(t, e, n) {this.group.removeAll();var i = t.get("axisLine.lineStyle.color"),r = sd(t, n);this._renderMain(t, e, n, i, r);}, dispose: function dispose() {}, _renderMain: function _renderMain(t, e, n, i, r) {for (var a = this.group, o = t.getModel("axisLine"), s = o.getModel("lineStyle"), l = t.get("clockwise"), u = -t.get("startAngle") / 180 * Math.PI, h = -t.get("endAngle") / 180 * Math.PI, c = (h - u) % Xb, d = u, f = s.get("width"), p = 0; p < i.length; p++) {var g = Math.min(Math.max(i[p][0], 0), 1),h = u + c * g,v = new Im({ shape: { startAngle: d, endAngle: h, cx: r.cx, cy: r.cy, clockwise: l, r0: r.r - f, r: r.r }, silent: !0 });v.setStyle({ fill: i[p][1] }), v.setStyle(s.getLineStyle(["color", "borderWidth", "borderColor"])), a.add(v), d = h;}var m = function m(t) {if (0 >= t) return i[0][1];for (var e = 0; e < i.length; e++) {if (i[e][0] >= t && (0 === e ? 0 : i[e - 1][0]) < t) return i[e][1];}return i[e - 1][1];};if (!l) {var y = u;u = h, h = y;}this._renderTicks(t, e, n, m, r, u, h, l), this._renderPointer(t, e, n, m, r, u, h, l), this._renderTitle(t, e, n, m, r), this._renderDetail(t, e, n, m, r);}, _renderTicks: function _renderTicks(t, e, n, i, r, a, o) {for (var s = this.group, l = r.cx, u = r.cy, h = r.r, c = +t.get("min"), d = +t.get("max"), f = t.getModel("splitLine"), p = t.getModel("axisTick"), g = t.getModel("axisLabel"), v = t.get("splitNumber"), m = p.get("splitNumber"), y = ja(f.get("length"), h), x = ja(p.get("length"), h), _ = a, w = (o - a) / v, b = w / m, M = f.getModel("lineStyle").getLineStyle(), S = p.getModel("lineStyle").getLineStyle(), I = 0; v >= I; I++) {var T = Math.cos(_),A = Math.sin(_);if (f.get("show")) {var C = new Lm({ shape: { x1: T * h + l, y1: A * h + u, x2: T * (h - y) + l, y2: A * (h - y) + u }, style: M, silent: !0 });"auto" === M.stroke && C.setStyle({ stroke: i(I / v) }), s.add(C);}if (g.get("show")) {var D = ld(Ua(I / v * (d - c) + c), g.get("formatter")),k = g.get("distance"),P = i(I / v);s.add(new wm({ style: wa({}, g, { text: D, x: T * (h - y - k) + l, y: A * (h - y - k) + u, textVerticalAlign: -.4 > A ? "top" : A > .4 ? "bottom" : "middle", textAlign: -.4 > T ? "left" : T > .4 ? "right" : "center" }, { autoColor: P }), silent: !0 }));}if (p.get("show") && I !== v) {for (var L = 0; m >= L; L++) {var T = Math.cos(_),A = Math.sin(_),O = new Lm({ shape: { x1: T * h + l, y1: A * h + u, x2: T * (h - x) + l, y2: A * (h - x) + u }, silent: !0, style: S });"auto" === S.stroke && O.setStyle({ stroke: i((I + L / m) / v) }), s.add(O), _ += b;}_ -= b;} else _ += w;}}, _renderPointer: function _renderPointer(t, e, n, i, r, a, o) {var s = this.group,l = this._data;if (!t.get("pointer.show")) return void (l && l.eachItemGraphicEl(function (t) {s.remove(t);}));var u = [+t.get("min"), +t.get("max")],h = [a, o],c = t.getData(),d = c.mapDimension("value");c.diff(l).add(function (e) {var n = new Zb({ shape: { angle: a } });La(n, { shape: { angle: qa(c.get(d, e), u, h, !0) } }, t), s.add(n), c.setItemGraphicEl(e, n);}).update(function (e, n) {var i = l.getItemGraphicEl(n);Pa(i, { shape: { angle: qa(c.get(d, e), u, h, !0) } }, t), s.add(i), c.setItemGraphicEl(e, i);}).remove(function (t) {var e = l.getItemGraphicEl(t);s.remove(e);}).execute(), c.eachItemGraphicEl(function (t, e) {var n = c.getItemModel(e),a = n.getModel("pointer");t.setShape({ x: r.cx, y: r.cy, width: ja(a.get("width"), r.r), r: ja(a.get("length"), r.r) }), t.useStyle(n.getModel("itemStyle").getItemStyle()), "auto" === t.style.fill && t.setStyle("fill", i(qa(c.get(d, e), u, [0, 1], !0))), ya(t, n.getModel("emphasis.itemStyle").getItemStyle());}), this._data = c;}, _renderTitle: function _renderTitle(t, e, n, i, r) {var a = t.getData(),o = a.mapDimension("value"),s = t.getModel("title");if (s.get("show")) {var l = s.get("offsetCenter"),u = r.cx + ja(l[0], r.r),h = r.cy + ja(l[1], r.r),c = +t.get("min"),d = +t.get("max"),f = t.getData().get(o, 0),p = i(qa(f, [c, d], [0, 1], !0));this.group.add(new wm({ silent: !0, style: wa({}, s, { x: u, y: h, text: a.getName(0), textAlign: "center", textVerticalAlign: "middle" }, { autoColor: p, forceRich: !0 }) }));}}, _renderDetail: function _renderDetail(t, e, n, i, r) {var a = t.getModel("detail"),o = +t.get("min"),s = +t.get("max");if (a.get("show")) {var l = a.get("offsetCenter"),u = r.cx + ja(l[0], r.r),h = r.cy + ja(l[1], r.r),c = ja(a.get("width"), r.r),d = ja(a.get("height"), r.r),f = t.getData(),p = f.get(f.mapDimension("value"), 0),g = i(qa(p, [o, s], [0, 1], !0));this.group.add(new wm({ silent: !0, style: wa({}, a, { x: u, y: h, text: ld(p, a.get("formatter")), textWidth: isNaN(c) ? null : c, textHeight: isNaN(d) ? null : d, textAlign: "center", textVerticalAlign: "middle" }, { autoColor: g, forceRich: !0 }) }));}} });}eu({ type: "title", layoutMode: { type: "box", ignoreSize: !0 }, defaultOption: { zlevel: 0, z: 6, show: !0, text: "", target: "blank", subtext: "", subtarget: "blank", left: 0, top: 0, backgroundColor: "rgba(0,0,0,0)", borderColor: "#ccc", borderWidth: 0, padding: 5, itemGap: 10, textStyle: { fontSize: 18, fontWeight: "bolder", color: "#333" }, subtextStyle: { color: "#aaa" } } }), nu({ type: "title", render: function render(t, e, n) {if (this.group.removeAll(), t.get("show")) {var i = this.group,r = t.getModel("textStyle"),a = t.getModel("subtextStyle"),o = t.get("textAlign"),s = t.get("textBaseline"),l = new wm({ style: wa({}, r, { text: t.get("text"), textFill: r.getTextColor() }, { disableBox: !0 }), z2: 10 }),u = l.getBoundingRect(),h = t.get("subtext"),c = new wm({ style: wa({}, a, { text: h, textFill: a.getTextColor(), y: u.height + t.get("itemGap"), textVerticalAlign: "top" }, { disableBox: !0 }), z2: 10 }),d = t.get("link"),f = t.get("sublink"),p = t.get("triggerEvent", !0);l.silent = !d && !p, c.silent = !f && !p, d && l.on("click", function () {window.open(d, "_" + t.get("target"));}), f && c.on("click", function () {window.open(f, "_" + t.get("subtarget"));}), l.eventData = c.eventData = p ? { componentType: "title", componentIndex: t.componentIndex } : null, i.add(l), h && i.add(c);var g = i.getBoundingRect(),v = t.getBoxLayoutParams();v.width = g.width, v.height = g.height;var m = wo(v, { width: n.getWidth(), height: n.getHeight() }, t.get("padding"));o || (o = t.get("left") || t.get("right"), "middle" === o && (o = "center"), "right" === o ? m.x += m.width : "center" === o && (m.x += m.width / 2)), s || (s = t.get("top") || t.get("bottom"), "center" === s && (s = "middle"), "bottom" === s ? m.y += m.height : "middle" === s && (m.y += m.height / 2), s = s || "top"), i.attr("position", [m.x, m.y]);var y = { textAlign: o, textVerticalAlign: s };l.setStyle(y), c.setStyle(y), g = i.getBoundingRect();var x = m.margin,_ = t.getItemStyle(["color", "opacity"]);_.fill = t.get("backgroundColor");var w = new Pm({ shape: { x: g.x - x[3], y: g.y - x[0], width: g.width + x[1] + x[3], height: g.height + x[0] + x[2], r: t.get("borderRadius") }, style: _, silent: !0 });na(w), i.add(w);}} });var Yb = eu({ type: "legend.plain", dependencies: ["series"], layoutMode: { type: "box", ignoreSize: !0 }, init: function init(t, e, n) {this.mergeDefaultAndTheme(t, n), t.selected = t.selected || {};}, mergeOption: function mergeOption(t) {Yb.superCall(this, "mergeOption", t);}, optionUpdated: function optionUpdated() {this._updateData(this.ecModel);var t = this._data;if (t[0] && "single" === this.get("selectedMode")) {for (var e = !1, n = 0; n < t.length; n++) {var i = t[n].get("name");if (this.isSelected(i)) {this.select(i), e = !0;break;}}!e && this.select(t[0].get("name"));}}, _updateData: function _updateData(t) {var e = [],n = [];t.eachRawSeries(function (i) {var r = i.name;n.push(r);var a;if (i.legendDataProvider) {var o = i.legendDataProvider(),s = o.mapArray(o.getName);t.isSeriesFiltered(i) || (n = n.concat(s)), s.length ? e = e.concat(s) : a = !0;} else a = !0;a && Hi(i) && e.push(i.name);}), this._availableNames = n;var i = this.get("data") || e,r = p(i, function (t) {return ("string" == typeof t || "number" == typeof t) && (t = { name: t }), new Va(t, this, this.ecModel);}, this);this._data = r;}, getData: function getData() {return this._data;}, select: function select(t) {var e = this.option.selected,n = this.get("selectedMode");if ("single" === n) {var i = this._data;f(i, function (t) {e[t.get("name")] = !1;});}e[t] = !0;}, unSelect: function unSelect(t) {"single" !== this.get("selectedMode") && (this.option.selected[t] = !1);}, toggleSelected: function toggleSelected(t) {var e = this.option.selected;e.hasOwnProperty(t) || (e[t] = !0), this[e[t] ? "unSelect" : "select"](t);}, isSelected: function isSelected(t) {var e = this.option.selected;return !(e.hasOwnProperty(t) && !e[t]) && u(this._availableNames, t) >= 0;}, defaultOption: { zlevel: 0, z: 4, show: !0, orient: "horizontal", left: "center", top: 0, align: "auto", backgroundColor: "rgba(0,0,0,0)", borderColor: "#ccc", borderRadius: 0, borderWidth: 0, padding: 5, itemGap: 10, itemWidth: 25, itemHeight: 14, inactiveColor: "#ccc", textStyle: { color: "#333" }, selectedMode: !0, tooltip: { show: !1 } } });jl("legendToggleSelect", "legendselectchanged", x(ud, "toggleSelected")), jl("legendSelect", "legendselected", x(ud, "select")), jl("legendUnSelect", "legendunselected", x(ud, "unSelect"));var qb = x,jb = f,Ub = hg,$b = nu({ type: "legend.plain", newlineDisabled: !1, init: function init() {this.group.add(this._contentGroup = new Ub()), this._backgroundEl;}, getContentGroup: function getContentGroup() {return this._contentGroup;}, render: function render(t, e, n) {if (this.resetInner(), t.get("show", !0)) {var i = t.get("align");i && "auto" !== i || (i = "right" === t.get("left") && "vertical" === t.get("orient") ? "right" : "left"), this.renderInner(i, t, e, n);var r = t.getBoxLayoutParams(),a = { width: n.getWidth(), height: n.getHeight() },o = t.get("padding"),l = wo(r, a, o),u = this.layoutInner(t, i, l),h = wo(s({ width: u.width, height: u.height }, r), a, o);this.group.attr("position", [h.x - u.x, h.y - u.y]), this.group.add(this._backgroundEl = hd(u, t));}}, resetInner: function resetInner() {this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl);}, renderInner: function renderInner(t, e, n, i) {var r = this.getContentGroup(),a = N(),o = e.get("selectedMode"),s = [];n.eachRawSeries(function (t) {!t.get("legendHoverLink") && s.push(t.id);}), jb(e.getData(), function (l, u) {var h = l.get("name");if (!this.newlineDisabled && ("" === h || "\n" === h)) return void r.add(new Ub({ newline: !0 }));var c = n.getSeriesByName(h)[0];if (!a.get(h)) if (c) {var d = c.getData(),f = d.getVisual("color");"function" == typeof f && (f = f(c.getDataParams(0)));var p = d.getVisual("legendSymbol") || "roundRect",g = d.getVisual("symbol"),v = this._createItem(h, u, l, e, p, g, t, f, o);v.on("click", qb(cd, h, i)).on("mouseover", qb(dd, c.name, null, i, s)).on("mouseout", qb(fd, c.name, null, i, s)), a.set(h, !0);} else n.eachRawSeries(function (n) {if (!a.get(h) && n.legendDataProvider) {var r = n.legendDataProvider(),c = r.indexOfName(h);if (0 > c) return;var d = r.getItemVisual(c, "color"),f = "roundRect",p = this._createItem(h, u, l, e, f, null, t, d, o);p.on("click", qb(cd, h, i)).on("mouseover", qb(dd, null, h, i, s)).on("mouseout", qb(fd, null, h, i, s)), a.set(h, !0);}}, this);}, this);}, _createItem: function _createItem(t, e, n, i, r, a, s, l, u) {var h = i.get("itemWidth"),c = i.get("itemHeight"),d = i.get("inactiveColor"),f = i.get("symbolKeepAspect"),p = i.isSelected(t),g = new Ub(),v = n.getModel("textStyle"),m = n.get("icon"),y = n.getModel("tooltip"),x = y.parentModel;if (r = m || r, g.add(ch(r, 0, 0, h, c, p ? l : d, null == f ? !0 : f)), !m && a && (a !== r || "none" === a)) {var _ = .8 * c;"none" === a && (a = "circle"), g.add(ch(a, (h - _) / 2, (c - _) / 2, _, _, p ? l : d, null == f ? !0 : f));}var w = "left" === s ? h + 5 : -5,b = s,M = i.get("formatter"),S = t;"string" == typeof M && M ? S = M.replace("{name}", null != t ? t : "") : "function" == typeof M && (S = M(t)), g.add(new wm({ style: wa({}, v, { text: S, x: w, y: c / 2, textFill: p ? v.getTextColor() : d, textAlign: b, textVerticalAlign: "middle" }) }));var I = new Pm({ shape: g.getBoundingRect(), invisible: !0, tooltip: y.get("show") ? o({ content: t, formatter: x.get("formatter", !0) || function () {return t;}, formatterParams: { componentType: "legend", legendIndex: i.componentIndex, name: t, $vars: ["name"] } }, y.option) : null });return g.add(I), g.eachChild(function (t) {t.silent = !0;}), I.silent = !u, this.getContentGroup().add(g), ya(g), g.__legendDataIndex = e, g;}, layoutInner: function layoutInner(t, e, n) {var i = this.getContentGroup();my(t.get("orient"), i, t.get("itemGap"), n.width, n.height);var r = i.getBoundingRect();return i.attr("position", [-r.x, -r.y]), this.group.getBoundingRect();} }),Kb = function Kb(t) {var e = t.findComponents({ mainType: "legend" });e && e.length && t.filterSeries(function (t) {for (var n = 0; n < e.length; n++) {if (!e[n].isSelected(t.name)) return !1;}return !0;});};Yl(Kb), _y.registerSubTypeDefaulter("legend", function () {return "plain";});var Qb = Yb.extend({ type: "legend.scroll", setScrollDataIndex: function setScrollDataIndex(t) {this.option.scrollDataIndex = t;}, defaultOption: { scrollDataIndex: 0, pageButtonItemGap: 5, pageButtonGap: null, pageButtonPosition: "end", pageFormatter: "{current}/{total}", pageIcons: { horizontal: ["M0,0L12,-10L12,10z", "M0,0L-12,-10L-12,10z"], vertical: ["M0,0L20,0L10,-20z", "M0,0L20,0L10,20z"] }, pageIconColor: "#2f4554", pageIconInactiveColor: "#aaa", pageIconSize: 15, pageTextStyle: { color: "#333" }, animationDurationUpdate: 800 }, init: function init(t, e, n, i) {var r = Mo(t);Qb.superCall(this, "init", t, e, n, i), pd(this, t, r);}, mergeOption: function mergeOption(t, e) {Qb.superCall(this, "mergeOption", t, e), pd(this, this.option, t);}, getOrient: function getOrient() {return "vertical" === this.get("orient") ? { index: 1, name: "vertical" } : { index: 0, name: "horizontal" };} }),Jb = hg,tM = ["width", "height"],eM = ["x", "y"],nM = $b.extend({ type: "legend.scroll", newlineDisabled: !0, init: function init() {nM.superCall(this, "init"), this._currentIndex = 0, this.group.add(this._containerGroup = new Jb()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new Jb()), this._showController;}, resetInner: function resetInner() {nM.superCall(this, "resetInner"), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;}, renderInner: function renderInner(t, e, n, i) {function r(t, n) {var r = t + "DataIndex",l = Fa(e.get("pageIcons", !0)[e.getOrient().name][n], { onclick: y(a._pageGo, a, r, e, i) }, { x: -s[0] / 2, y: -s[1] / 2, width: s[0], height: s[1] });l.name = t, o.add(l);}var a = this;nM.superCall(this, "renderInner", t, e, n, i);var o = this._controllerGroup,s = e.get("pageIconSize", !0);_(s) || (s = [s, s]), r("pagePrev", 0);var l = e.getModel("pageTextStyle");o.add(new wm({ name: "pageText", style: { textFill: l.getTextColor(), font: l.getFont(), textVerticalAlign: "middle", textAlign: "center" }, silent: !0 })), r("pageNext", 1);}, layoutInner: function layoutInner(t, e, n) {var i = this.getContentGroup(),r = this._containerGroup,a = this._controllerGroup,o = t.getOrient().index,s = tM[o],l = tM[1 - o],u = eM[1 - o];my(t.get("orient"), i, t.get("itemGap"), o ? n.width : null, o ? null : n.height), my("horizontal", a, t.get("pageButtonItemGap", !0));var h = i.getBoundingRect(),c = a.getBoundingRect(),d = this._showController = h[s] > n[s],f = [-h.x, -h.y];f[o] = i.position[o];var p = [0, 0],g = [-c.x, -c.y],v = D(t.get("pageButtonGap", !0), t.get("itemGap", !0));if (d) {var m = t.get("pageButtonPosition", !0);"end" === m ? g[o] += n[s] - c[s] : p[o] += c[s] + v;}g[1 - o] += h[l] / 2 - c[l] / 2, i.attr("position", f), r.attr("position", p), a.attr("position", g);var y = this.group.getBoundingRect(),y = { x: 0, y: 0 };if (y[s] = d ? n[s] : h[s], y[l] = Math.max(h[l], c[l]), y[u] = Math.min(0, c[u] + g[1 - o]), r.__rectSize = n[s], d) {var x = { x: 0, y: 0 };x[s] = Math.max(n[s] - c[s] - v, 0), x[l] = y[l], r.setClipPath(new Pm({ shape: x })), r.__rectSize = x[s];} else a.eachChild(function (t) {t.attr({ invisible: !0, silent: !0 });});var _ = this._getPageInfo(t);return null != _.pageIndex && Pa(i, { position: _.contentPosition }, d ? t : !1), this._updatePageInfoView(t, _), y;}, _pageGo: function _pageGo(t, e, n) {var i = this._getPageInfo(e)[t];null != i && n.dispatchAction({ type: "legendScroll", scrollDataIndex: i, legendId: e.id });}, _updatePageInfoView: function _updatePageInfoView(t, e) {var n = this._controllerGroup;f(["pagePrev", "pageNext"], function (i) {var r = null != e[i + "DataIndex"],a = n.childOfName(i);a && (a.setStyle("fill", r ? t.get("pageIconColor", !0) : t.get("pageIconInactiveColor", !0)), a.cursor = r ? "pointer" : "default");});var i = n.childOfName("pageText"),r = t.get("pageFormatter"),a = e.pageIndex,o = null != a ? a + 1 : 0,s = e.pageCount;i && r && i.setStyle("text", b(r) ? r.replace("{current}", o).replace("{total}", s) : r({ current: o, total: s }));}, _getPageInfo: function _getPageInfo(t) {function e(t) {var e = t.getBoundingRect().clone();return e[f] += t.position[h], e;}var n,i,r,a,o = t.get("scrollDataIndex", !0),s = this.getContentGroup(),l = s.getBoundingRect(),u = this._containerGroup.__rectSize,h = t.getOrient().index,c = tM[h],d = tM[1 - h],f = eM[h],p = s.position.slice();this._showController ? s.eachChild(function (t) {t.__legendDataIndex === o && (a = t);}) : a = s.childAt(0);var g = u ? Math.ceil(l[c] / u) : 0;if (a) {var v = a.getBoundingRect(),m = a.position[h] + v[f];p[h] = -m - l[f], n = Math.floor(g * (m + v[f] + u / 2) / l[c]), n = l[c] && g ? Math.max(0, Math.min(g - 1, n)) : -1;var y = { x: 0, y: 0 };y[c] = u, y[d] = l[d], y[f] = -p[h] - l[f];var x,_ = s.children();if (s.eachChild(function (t, n) {var i = e(t);i.intersect(y) && (null == x && (x = n), r = t.__legendDataIndex), n === _.length - 1 && i[f] + i[c] <= y[f] + y[c] && (r = null);}), null != x) {var w = _[x],b = e(w);if (y[f] = b[f] + b[c] - y[c], 0 >= x && b[f] >= y[f]) i = null;else {for (; x > 0 && e(_[x - 1]).intersect(y);) {x--;}i = _[x].__legendDataIndex;}}}return { contentPosition: p, pageIndex: n, pageCount: g, pagePrevDataIndex: i, pageNextDataIndex: r };} });jl("legendScroll", "legendscroll", function (t, e) {var n = t.scrollDataIndex;null != n && e.eachComponent({ mainType: "legend", subType: "scroll", query: t }, function (t) {t.setScrollDataIndex(n);
    });});var iM = function iM(t, e) {var n,i = [],r = t.seriesIndex;if (null == r || !(n = e.getSeriesByIndex(r))) return { point: [] };var a = n.getData(),o = Xi(a, t);if (null == o || 0 > o || _(o)) return { point: [] };var s = a.getItemGraphicEl(o),l = n.coordinateSystem;if (n.getTooltipPosition) i = n.getTooltipPosition(o) || [];else if (l && l.dataToPoint) i = l.dataToPoint(a.getValues(p(l.dimensions, function (t) {return a.mapDimension(t);}), o, !0)) || [];else if (s) {var u = s.getBoundingRect().clone();u.applyTransform(s.transform), i = [u.x + u.width / 2, u.y + u.height / 2];}return { point: i, el: s };},rM = f,aM = x,oM = Yi(),sM = function sM(t, e, n) {var i = t.currTrigger,r = [t.x, t.y],a = t,o = t.dispatchAction || y(n.dispatchAction, n),s = e.getComponent("axisPointer").coordSysAxesInfo;if (s) {Sd(r) && (r = iM({ seriesIndex: a.seriesIndex, dataIndex: a.dataIndex }, e).point);var l = Sd(r),u = a.axesInfo,h = s.axesInfo,c = "leave" === i || Sd(r),d = {},f = {},p = { list: [], map: {} },g = { showPointer: aM(md, f), showTooltip: aM(yd, p) };rM(s.coordSysMap, function (t, e) {var n = l || t.containPoint(r);rM(s.coordSysAxesInfo[e], function (t) {var e = t.axis,i = bd(u, t);if (!c && n && (!u || i)) {var a = i && i.value;null != a || l || (a = e.pointToData(r)), null != a && gd(t, a, g, !1, d);}});});var v = {};return rM(h, function (t, e) {var n = t.linkGroup;n && !f[e] && rM(n.axesInfo, function (e, i) {var r = f[i];if (e !== t && r) {var a = r.value;n.mapper && (a = t.axis.scale.parse(n.mapper(a, Md(e), Md(t)))), v[t.key] = a;}});}), rM(v, function (t, e) {gd(h[e], t, g, !0, d);}), xd(f, h, d), _d(p, r, t, o), wd(h, o, n), d;}},lM = (eu({ type: "axisPointer", coordSysAxesInfo: null, defaultOption: { show: "auto", triggerOn: null, zlevel: 0, z: 50, type: "line", snap: !1, triggerTooltip: !0, value: null, status: null, link: [], animation: null, animationDurationUpdate: 200, lineStyle: { color: "#aaa", width: 1, type: "solid" }, shadowStyle: { color: "rgba(150,150,150,0.3)" }, label: { show: !0, formatter: null, precision: "auto", margin: 3, color: "#fff", padding: [5, 7, 5, 7], backgroundColor: "auto", borderColor: null, borderWidth: 0, shadowBlur: 3, shadowColor: "#aaa" }, handle: { show: !1, icon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z", size: 45, margin: 50, color: "#333", shadowBlur: 3, shadowColor: "#aaa", shadowOffsetX: 0, shadowOffsetY: 2, throttle: 40 } } }), Yi()),uM = f,hM = nu({ type: "axisPointer", render: function render(t, e, n) {var i = e.getComponent("tooltip"),r = t.get("triggerOn") || i && i.get("triggerOn") || "mousemove|click";Id("axisPointer", n, function (t, e, n) {"none" !== r && ("leave" === t || r.indexOf(t) >= 0) && n({ type: "updateAxisPointer", currTrigger: t, x: e && e.offsetX, y: e && e.offsetY });});}, remove: function remove(t, e) {Pd(e.getZr(), "axisPointer"), hM.superApply(this._model, "remove", arguments);}, dispose: function dispose(t, e) {Pd("axisPointer", e), hM.superApply(this._model, "dispose", arguments);} }),cM = Yi(),dM = i,fM = y;Ld.prototype = { _group: null, _lastGraphicKey: null, _handle: null, _dragging: !1, _lastValue: null, _lastStatus: null, _payloadInfo: null, animationThreshold: 15, render: function render(t, e, n, i) {var r = e.get("value"),a = e.get("status");if (this._axisModel = t, this._axisPointerModel = e, this._api = n, i || this._lastValue !== r || this._lastStatus !== a) {this._lastValue = r, this._lastStatus = a;var o = this._group,s = this._handle;if (!a || "hide" === a) return o && o.hide(), void (s && s.hide());o && o.show(), s && s.show();var l = {};this.makeElOption(l, r, t, e, n);var u = l.graphicKey;u !== this._lastGraphicKey && this.clear(n), this._lastGraphicKey = u;var h = this._moveAnimation = this.determineAnimation(t, e);if (o) {var c = x(Od, e, h);this.updatePointerEl(o, l, c, e), this.updateLabelEl(o, l, c, e);} else o = this._group = new hg(), this.createPointerEl(o, l, t, e), this.createLabelEl(o, l, t, e), n.getZr().add(o);Rd(o, e, !0), this._renderHandle(r);}}, remove: function remove(t) {this.clear(t);}, dispose: function dispose(t) {this.clear(t);}, determineAnimation: function determineAnimation(t, e) {var n = e.get("animation"),i = t.axis,r = "category" === i.type,a = e.get("snap");if (!a && !r) return !1;if ("auto" === n || null == n) {var o = this.animationThreshold;if (r && i.getBandWidth() > o) return !0;if (a) {var s = yc(t).seriesDataCount,l = i.getExtent();return Math.abs(l[0] - l[1]) / s > o;}return !1;}return n === !0;}, makeElOption: function makeElOption() {}, createPointerEl: function createPointerEl(t, e) {var n = e.pointer;if (n) {var i = cM(t).pointerEl = new jm[n.type](dM(e.pointer));t.add(i);}}, createLabelEl: function createLabelEl(t, e, n, i) {if (e.label) {var r = cM(t).labelEl = new Pm(dM(e.label));t.add(r), Ed(r, i);}}, updatePointerEl: function updatePointerEl(t, e, n) {var i = cM(t).pointerEl;i && (i.setStyle(e.pointer.style), n(i, { shape: e.pointer.shape }));}, updateLabelEl: function updateLabelEl(t, e, n, i) {var r = cM(t).labelEl;r && (r.setStyle(e.label.style), n(r, { shape: e.label.shape, position: e.label.position }), Ed(r, i));}, _renderHandle: function _renderHandle(t) {if (!this._dragging && this.updateHandleTransform) {var e = this._axisPointerModel,n = this._api.getZr(),i = this._handle,r = e.getModel("handle"),a = e.get("status");if (!r.get("show") || !a || "hide" === a) return i && n.remove(i), void (this._handle = null);var o;this._handle || (o = !0, i = this._handle = Fa(r.get("icon"), { cursor: "move", draggable: !0, onmousemove: function onmousemove(t) {Ap(t.event);}, onmousedown: fM(this._onHandleDragMove, this, 0, 0), drift: fM(this._onHandleDragMove, this), ondragend: fM(this._onHandleDragEnd, this) }), n.add(i)), Rd(i, e, !1);var s = ["color", "borderColor", "borderWidth", "opacity", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"];i.setStyle(r.getItemStyle(null, s));var l = r.get("size");_(l) || (l = [l, l]), i.attr("scale", [l[0] / 2, l[1] / 2]), Gs(this, "_doDispatchAxisPointer", r.get("throttle") || 0, "fixRate"), this._moveHandleToValue(t, o);}}, _moveHandleToValue: function _moveHandleToValue(t, e) {Od(this._axisPointerModel, !e && this._moveAnimation, this._handle, Bd(this.getHandleTransform(t, this._axisModel, this._axisPointerModel)));}, _onHandleDragMove: function _onHandleDragMove(t, e) {var n = this._handle;if (n) {this._dragging = !0;var i = this.updateHandleTransform(Bd(n), [t, e], this._axisModel, this._axisPointerModel);this._payloadInfo = i, n.stopAnimation(), n.attr(Bd(i)), cM(n).lastProp = null, this._doDispatchAxisPointer();}}, _doDispatchAxisPointer: function _doDispatchAxisPointer() {var t = this._handle;if (t) {var e = this._payloadInfo,n = this._axisModel;this._api.dispatchAction({ type: "updateAxisPointer", x: e.cursorPoint[0], y: e.cursorPoint[1], tooltipOption: e.tooltipOption, axesInfo: [{ axisDim: n.axis.dim, axisIndex: n.componentIndex }] });}}, _onHandleDragEnd: function _onHandleDragEnd() {this._dragging = !1;var t = this._handle;if (t) {var e = this._axisPointerModel.get("value");this._moveHandleToValue(e), this._api.dispatchAction({ type: "hideTip" });}}, getHandleTransform: null, updateHandleTransform: null, clear: function clear(t) {this._lastValue = null, this._lastStatus = null;var e = t.getZr(),n = this._group,i = this._handle;e && n && (this._lastGraphicKey = null, n && e.remove(n), i && e.remove(i), this._group = null, this._handle = null, this._payloadInfo = null);}, doClear: function doClear() {}, buildLabel: function buildLabel(t, e, n) {return n = n || 0, { x: t[n], y: t[1 - n], width: e[n], height: e[1 - n] };} }, Ld.prototype.constructor = Ld, tr(Ld);var pM = Ld.extend({ makeElOption: function makeElOption(t, e, n, i, r) {var a = n.axis,o = a.grid,s = i.get("type"),l = Yd(o, a).getOtherAxis(a).getGlobalExtent(),u = a.toGlobalCoord(a.dataToCoord(e, !0));if (s && "none" !== s) {var h = Nd(i),c = gM[s](a, u, l, h);c.style = h, t.graphicKey = c.type, t.pointer = c;}var d = Sc(o.model, n);Hd(e, t, d, n, i, r);}, getHandleTransform: function getHandleTransform(t, e, n) {var i = Sc(e.axis.grid.model, e, { labelInside: !1 });return i.labelMargin = n.get("handle.margin"), { position: Gd(e.axis, t, i), rotation: i.rotation + (i.labelDirection < 0 ? Math.PI : 0) };}, updateHandleTransform: function updateHandleTransform(t, e, n) {var i = n.axis,r = i.grid,a = i.getGlobalExtent(!0),o = Yd(r, i).getOtherAxis(i).getGlobalExtent(),s = "x" === i.dim ? 0 : 1,l = t.position;l[s] += e[s], l[s] = Math.min(a[1], l[s]), l[s] = Math.max(a[0], l[s]);var u = (o[1] + o[0]) / 2,h = [u, u];h[s] = l[s];var c = [{ verticalAlign: "middle" }, { align: "center" }];return { position: l, rotation: t.rotation, cursorPoint: h, tooltipOption: c[s] };} }),gM = { line: function line(t, e, n, i) {var r = Zd([e, n[0]], [e, n[1]], qd(t));return ea({ shape: r, style: i }), { type: "Line", shape: r };}, shadow: function shadow(t, e, n) {var i = Math.max(1, t.getBandWidth()),r = n[1] - n[0];return { type: "Rect", shape: Xd([e - i / 2, n[0]], [i, r], qd(t)) };} };ob.registerAxisPointerClass("CartesianAxisPointer", pM), Xl(function (t) {if (t) {(!t.axisPointer || 0 === t.axisPointer.length) && (t.axisPointer = {});var e = t.axisPointer.link;e && !_(e) && (t.axisPointer.link = [e]);}}), Yl(l_.PROCESSOR.STATISTIC, function (t, e) {t.getComponent("axisPointer").coordSysAxesInfo = cc(t, e);}), jl({ type: "updateAxisPointer", event: "updateAxisPointer", update: ":updateAxisPointer" }, sM), eu({ type: "tooltip", dependencies: ["axisPointer"], defaultOption: { zlevel: 0, z: 60, show: !0, showContent: !0, trigger: "item", triggerOn: "mousemove|click", alwaysShowContent: !1, displayMode: "single", renderMode: "auto", confine: !1, showDelay: 0, hideDelay: 100, transitionDuration: .4, enterable: !1, backgroundColor: "rgba(50,50,50,0.7)", borderColor: "#333", borderRadius: 4, borderWidth: 0, padding: 5, extraCssText: "", axisPointer: { type: "line", axis: "auto", animation: "auto", animationDurationUpdate: 200, animationEasingUpdate: "exponentialOut", crossStyle: { color: "#999", width: 1, type: "dashed", textStyle: {} } }, textStyle: { color: "#fff", fontSize: 14 } } });var vM = f,mM = co,yM = ["", "-webkit-", "-moz-", "-o-"],xM = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;";Kd.prototype = { constructor: Kd, _enterable: !0, update: function update() {var t = this._container,e = t.currentStyle || document.defaultView.getComputedStyle(t),n = t.style;"absolute" !== n.position && "absolute" !== e.position && (n.position = "relative");}, show: function show(t) {clearTimeout(this._hideTimeout);var e = this.el;e.style.cssText = xM + $d(t) + ";left:" + this._x + "px;top:" + this._y + "px;" + (t.get("extraCssText") || ""), e.style.display = e.innerHTML ? "block" : "none", e.style.pointerEvents = this._enterable ? "auto" : "none", this._show = !0;}, setContent: function setContent(t) {this.el.innerHTML = null == t ? "" : t;}, setEnterable: function setEnterable(t) {this._enterable = t;}, getSize: function getSize() {var t = this.el;return [t.clientWidth, t.clientHeight];}, moveTo: function moveTo(t, e) {var n,i = this._zr;i && i.painter && (n = i.painter.getViewportRootOffset()) && (t += n.offsetLeft, e += n.offsetTop);var r = this.el.style;r.left = t + "px", r.top = e + "px", this._x = t, this._y = e;}, hide: function hide() {this.el.style.display = "none", this._show = !1;}, hideLater: function hideLater(t) {!this._show || this._inContent && this._enterable || (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(y(this.hide, this), t)) : this.hide());}, isShow: function isShow() {return this._show;}, getOuterSize: function getOuterSize() {var t = this.el.clientWidth,e = this.el.clientHeight;if (document.defaultView && document.defaultView.getComputedStyle) {var n = document.defaultView.getComputedStyle(this.el);n && (t += parseInt(n.paddingLeft, 10) + parseInt(n.paddingRight, 10) + parseInt(n.borderLeftWidth, 10) + parseInt(n.borderRightWidth, 10), e += parseInt(n.paddingTop, 10) + parseInt(n.paddingBottom, 10) + parseInt(n.borderTopWidth, 10) + parseInt(n.borderBottomWidth, 10));}return { width: t, height: e };} }, Qd.prototype = { constructor: Qd, _enterable: !0, update: function update() {}, show: function show() {this._hideTimeout && clearTimeout(this._hideTimeout), this.el.attr("show", !0), this._show = !0;}, setContent: function setContent(t, e, n) {this.el && this._zr.remove(this.el);for (var i = {}, r = t, a = "{marker", o = "|}", s = r.indexOf(a); s >= 0;) {var l = r.indexOf(o),u = r.substr(s + a.length, l - s - a.length);i["marker" + u] = u.indexOf("sub") > -1 ? { textWidth: 4, textHeight: 4, textBorderRadius: 2, textBackgroundColor: e[u], textOffset: [3, 0] } : { textWidth: 10, textHeight: 10, textBorderRadius: 5, textBackgroundColor: e[u] }, r = r.substr(l + 1), s = r.indexOf("{marker");}this.el = new wm({ style: { rich: i, text: t, textLineHeight: 20, textBackgroundColor: n.get("backgroundColor"), textBorderRadius: n.get("borderRadius"), textFill: n.get("textStyle.color"), textPadding: n.get("padding") }, z: n.get("z") }), this._zr.add(this.el);var h = this;this.el.on("mouseover", function () {h._enterable && (clearTimeout(h._hideTimeout), h._show = !0), h._inContent = !0;}), this.el.on("mouseout", function () {h._enterable && h._show && h.hideLater(h._hideDelay), h._inContent = !1;});}, setEnterable: function setEnterable(t) {this._enterable = t;}, getSize: function getSize() {var t = this.el.getBoundingRect();return [t.width, t.height];}, moveTo: function moveTo(t, e) {this.el && this.el.attr("position", [t, e]);}, hide: function hide() {this.el.hide(), this._show = !1;}, hideLater: function hideLater(t) {!this._show || this._inContent && this._enterable || (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(y(this.hide, this), t)) : this.hide());}, isShow: function isShow() {return this._show;}, getOuterSize: function getOuterSize() {return this.getSize();} };var _M = y,wM = f,bM = ja,MM = new Pm({ shape: { x: -1, y: -1, width: 2, height: 2 } });nu({ type: "tooltip", init: function init(t, e) {if (!np.node) {var n = t.getComponent("tooltip"),i = n.get("renderMode");this._renderMode = Ki(i);var r;"html" === this._renderMode ? (r = new Kd(e.getDom(), e), this._newLine = "<br/>") : (r = new Qd(e), this._newLine = "\n"), this._tooltipContent = r;}}, render: function render(t, e, n) {if (!np.node) {this.group.removeAll(), this._tooltipModel = t, this._ecModel = e, this._api = n, this._lastDataByCoordSys = null, this._alwaysShowContent = t.get("alwaysShowContent");var i = this._tooltipContent;i.update(), i.setEnterable(t.get("enterable")), this._initGlobalListener(), this._keepShow();}}, _initGlobalListener: function _initGlobalListener() {var t = this._tooltipModel,e = t.get("triggerOn");Id("itemTooltip", this._api, _M(function (t, n, i) {"none" !== e && (e.indexOf(t) >= 0 ? this._tryShow(n, i) : "leave" === t && this._hide(i));}, this));}, _keepShow: function _keepShow() {var t = this._tooltipModel,e = this._ecModel,n = this._api;if (null != this._lastX && null != this._lastY && "none" !== t.get("triggerOn")) {var i = this;clearTimeout(this._refreshUpdateTimeout), this._refreshUpdateTimeout = setTimeout(function () {i.manuallyShowTip(t, e, n, { x: i._lastX, y: i._lastY });});}}, manuallyShowTip: function manuallyShowTip(t, e, n, i) {if (i.from !== this.uid && !np.node) {var r = tf(i, n);this._ticket = "";var a = i.dataByCoordSys;if (i.tooltip && null != i.x && null != i.y) {var o = MM;o.position = [i.x, i.y], o.update(), o.tooltip = i.tooltip, this._tryShow({ offsetX: i.x, offsetY: i.y, target: o }, r);} else if (a) this._tryShow({ offsetX: i.x, offsetY: i.y, position: i.position, event: {}, dataByCoordSys: i.dataByCoordSys, tooltipOption: i.tooltipOption }, r);else if (null != i.seriesIndex) {if (this._manuallyAxisShowTip(t, e, n, i)) return;var s = iM(i, e),l = s.point[0],u = s.point[1];null != l && null != u && this._tryShow({ offsetX: l, offsetY: u, position: i.position, target: s.el, event: {} }, r);} else null != i.x && null != i.y && (n.dispatchAction({ type: "updateAxisPointer", x: i.x, y: i.y }), this._tryShow({ offsetX: i.x, offsetY: i.y, position: i.position, target: n.getZr().findHover(i.x, i.y).target, event: {} }, r));}}, manuallyHideTip: function manuallyHideTip(t, e, n, i) {var r = this._tooltipContent;!this._alwaysShowContent && this._tooltipModel && r.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = null, i.from !== this.uid && this._hide(tf(i, n));}, _manuallyAxisShowTip: function _manuallyAxisShowTip(t, e, n, i) {var r = i.seriesIndex,a = i.dataIndex,o = e.getComponent("axisPointer").coordSysAxesInfo;if (null != r && null != a && null != o) {var s = e.getSeriesByIndex(r);if (s) {var l = s.getData(),t = Jd([l.getItemModel(a), s, (s.coordinateSystem || {}).model, t]);if ("axis" === t.get("trigger")) return n.dispatchAction({ type: "updateAxisPointer", seriesIndex: r, dataIndex: a, position: i.position }), !0;}}}, _tryShow: function _tryShow(t, e) {var n = t.target,i = this._tooltipModel;if (i) {this._lastX = t.offsetX, this._lastY = t.offsetY;var r = t.dataByCoordSys;r && r.length ? this._showAxisTooltip(r, t) : n && null != n.dataIndex ? (this._lastDataByCoordSys = null, this._showSeriesItemTooltip(t, n, e)) : n && n.tooltip ? (this._lastDataByCoordSys = null, this._showComponentItemTooltip(t, n, e)) : (this._lastDataByCoordSys = null, this._hide(e));}}, _showOrMove: function _showOrMove(t, e) {var n = t.get("showDelay");e = y(e, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(e, n) : e();}, _showAxisTooltip: function _showAxisTooltip(t, e) {var n = this._ecModel,i = this._tooltipModel,a = [e.offsetX, e.offsetY],o = [],s = [],l = Jd([e.tooltipOption, i]),u = this._renderMode,h = this._newLine,c = {};wM(t, function (t) {wM(t.dataByAxis, function (t) {var e = n.getComponent(t.axisDim + "Axis", t.axisIndex),i = t.value,a = [];if (e && null != i) {var l = Wd(i, e.axis, n, t.seriesDataIndices, t.valueLabelOpt);f(t.seriesDataIndices, function (o) {var h = n.getSeriesByIndex(o.seriesIndex),d = o.dataIndexInside,f = h && h.getDataParams(d);if (f.axisDim = t.axisDim, f.axisIndex = t.axisIndex, f.axisType = t.axisType, f.axisId = t.axisId, f.axisValue = sh(e.axis, i), f.axisValueLabel = l, f) {s.push(f);var p,g = h.formatTooltip(d, !0, null, u);if (M(g)) {p = g.html;var v = g.markers;r(c, v);} else p = g;a.push(p);}});var d = l;o.push("html" !== u ? a.join(h) : (d ? fo(d) + h : "") + a.join(h));}});}, this), o.reverse(), o = o.join(this._newLine + this._newLine);var d = e.position;this._showOrMove(l, function () {this._updateContentNotChangedOnAxis(t) ? this._updatePosition(l, d, a[0], a[1], this._tooltipContent, s) : this._showTooltipContent(l, o, s, Math.random(), a[0], a[1], d, void 0, c);});}, _showSeriesItemTooltip: function _showSeriesItemTooltip(t, e, n) {var i = this._ecModel,r = e.seriesIndex,a = i.getSeriesByIndex(r),o = e.dataModel || a,s = e.dataIndex,l = e.dataType,u = o.getData(),h = Jd([u.getItemModel(s), o, a && (a.coordinateSystem || {}).model, this._tooltipModel]),c = h.get("trigger");if (null == c || "item" === c) {var d,f,p = o.getDataParams(s, l),g = o.formatTooltip(s, !1, l, this._renderMode);M(g) ? (d = g.html, f = g.markers) : (d = g, f = null);var v = "item_" + o.name + "_" + s;this._showOrMove(h, function () {this._showTooltipContent(h, d, p, v, t.offsetX, t.offsetY, t.position, t.target, f);}), n({ type: "showTip", dataIndexInside: s, dataIndex: u.getRawIndex(s), seriesIndex: r, from: this.uid });}}, _showComponentItemTooltip: function _showComponentItemTooltip(t, e, n) {var i = e.tooltip;if ("string" == typeof i) {var r = i;i = { content: r, formatter: r };}var a = new Va(i, this._tooltipModel, this._ecModel),o = a.get("content"),s = Math.random();this._showOrMove(a, function () {this._showTooltipContent(a, o, a.get("formatterParams") || {}, s, t.offsetX, t.offsetY, t.position, e);}), n({ type: "showTip", from: this.uid });}, _showTooltipContent: function _showTooltipContent(t, e, n, i, r, a, o, s, l) {if (this._ticket = "", t.get("showContent") && t.get("show")) {var u = this._tooltipContent,h = t.get("formatter");o = o || t.get("position");var c = e;if (h && "string" == typeof h) c = po(h, n, !0);else if ("function" == typeof h) {var d = _M(function (e, i) {e === this._ticket && (u.setContent(i, l, t), this._updatePosition(t, o, r, a, u, n, s));}, this);this._ticket = i, c = h(n, i, d);}u.setContent(c, l, t), u.show(t), this._updatePosition(t, o, r, a, u, n, s);}}, _updatePosition: function _updatePosition(t, e, n, i, r, a, o) {var s = this._api.getWidth(),l = this._api.getHeight();e = e || t.get("position");var u = r.getSize(),h = t.get("align"),c = t.get("verticalAlign"),d = o && o.getBoundingRect().clone();if (o && d.applyTransform(o.transform), "function" == typeof e && (e = e([n, i], a, r.el, d, { viewSize: [s, l], contentSize: u.slice() })), _(e)) n = bM(e[0], s), i = bM(e[1], l);else if (M(e)) {e.width = u[0], e.height = u[1];var f = wo(e, { width: s, height: l });n = f.x, i = f.y, h = null, c = null;} else if ("string" == typeof e && o) {var p = rf(e, d, u);n = p[0], i = p[1];} else {var p = ef(n, i, r, s, l, h ? null : 20, c ? null : 20);n = p[0], i = p[1];}if (h && (n -= af(h) ? u[0] / 2 : "right" === h ? u[0] : 0), c && (i -= af(c) ? u[1] / 2 : "bottom" === c ? u[1] : 0), t.get("confine")) {var p = nf(n, i, r, s, l);n = p[0], i = p[1];}r.moveTo(n, i);}, _updateContentNotChangedOnAxis: function _updateContentNotChangedOnAxis(t) {var e = this._lastDataByCoordSys,n = !!e && e.length === t.length;return n && wM(e, function (e, i) {var r = e.dataByAxis || {},a = t[i] || {},o = a.dataByAxis || [];n &= r.length === o.length, n && wM(r, function (t, e) {var i = o[e] || {},r = t.seriesDataIndices || [],a = i.seriesDataIndices || [];n &= t.value === i.value && t.axisType === i.axisType && t.axisId === i.axisId && r.length === a.length, n && wM(r, function (t, e) {var i = a[e];n &= t.seriesIndex === i.seriesIndex && t.dataIndex === i.dataIndex;});});}), this._lastDataByCoordSys = t, !!n;}, _hide: function _hide(t) {this._lastDataByCoordSys = null, t({ type: "hideTip", from: this.uid });}, dispose: function dispose(t, e) {np.node || (this._tooltipContent.hide(), Pd("itemTooltip", e));} }), jl({ type: "showTip", event: "showTip", update: "tooltip:manuallyShowTip" }, function () {}), jl({ type: "hideTip", event: "hideTip", update: "tooltip:manuallyHideTip" }, function () {});var SM = ho,IM = fo,TM = eu({ type: "marker", dependencies: ["series", "grid", "polar", "geo"], init: function init(t, e, n, i) {this.mergeDefaultAndTheme(t, n), this.mergeOption(t, n, i.createdBySelf, !0);}, isAnimationEnabled: function isAnimationEnabled() {if (np.node) return !1;var t = this.__hostSeries;return this.getShallow("animation") && t && t.isAnimationEnabled();}, mergeOption: function mergeOption(t, e, n, i) {var r = this.constructor,a = this.mainType + "Model";n || e.eachSeries(function (t) {var n = t.get(this.mainType, !0),s = t[a];return n && n.data ? (s ? s.mergeOption(n, e, !0) : (i && of(n), f(n.data, function (t) {t instanceof Array ? (of(t[0]), of(t[1])) : of(t);}), s = new r(n, this, e), o(s, { mainType: this.mainType, seriesIndex: t.seriesIndex, name: t.name, createdBySelf: !0 }), s.__hostSeries = t), void (t[a] = s)) : void (t[a] = null);}, this);}, formatTooltip: function formatTooltip(t) {var e = this.getData(),n = this.getRawValue(t),i = _(n) ? p(n, SM).join(", ") : SM(n),r = e.getName(t),a = IM(this.name);return (null != n || r) && (a += "<br />"), r && (a += IM(r), null != n && (a += " : ")), null != n && (a += IM(i)), a;}, getData: function getData() {return this._data;}, setData: function setData(t) {this._data = t;} });c(TM, ix), TM.extend({ type: "markArea", defaultOption: { zlevel: 0, z: 1, tooltip: { trigger: "item" }, animation: !1, label: { show: !0, position: "top" }, itemStyle: { borderWidth: 0 }, emphasis: { label: { show: !0, position: "top" } } } });var AM = u,CM = x,DM = { min: CM(uf, "min"), max: CM(uf, "max"), average: CM(uf, "average") },kM = nu({ type: "marker", init: function init() {this.markerGroupMap = N();}, render: function render(t, e, n) {var i = this.markerGroupMap;i.each(function (t) {t.__keep = !1;});var r = this.type + "Model";e.eachSeries(function (t) {var i = t[r];i && this.renderSeries(t, i, e, n);}, this), i.each(function (t) {!t.__keep && this.group.remove(t.group);}, this);}, renderSeries: function renderSeries() {} }),PM = function PM(t, e, n, i) {var r = hf(t, i[0]),o = hf(t, i[1]),s = C,l = r.coord,u = o.coord;l[0] = s(l[0], -1 / 0), l[1] = s(l[1], -1 / 0), u[0] = s(u[0], 1 / 0), u[1] = s(u[1], 1 / 0);var h = a([{}, r, o]);return h.coord = [r.coord, o.coord], h.x0 = r.x, h.y0 = r.y, h.x1 = o.x, h.y1 = o.y, h;},LM = [["x0", "y0"], ["x1", "y0"], ["x1", "y1"], ["x0", "y1"]];kM.extend({ type: "markArea", updateTransform: function updateTransform(t, e, n) {e.eachSeries(function (t) {var e = t.markAreaModel;if (e) {var i = e.getData();i.each(function (e) {var r = p(LM, function (r) {return yf(i, e, r, t, n);});i.setItemLayout(e, r);var a = i.getItemGraphicEl(e);a.setShape("points", r);});}}, this);}, renderSeries: function renderSeries(t, e, n, i) {var r = t.coordinateSystem,a = t.id,o = t.getData(),l = this.markerGroupMap,u = l.get(a) || l.set(a, { group: new hg() });this.group.add(u.group), u.__keep = !0;var h = xf(r, t, e);e.setData(h), h.each(function (e) {h.setItemLayout(e, p(LM, function (n) {return yf(h, e, n, t, i);})), h.setItemVisual(e, { color: o.getVisual("color") });}), h.diff(u.__data).add(function (t) {var e = new Dm({ shape: { points: h.getItemLayout(t) } });h.setItemGraphicEl(t, e), u.group.add(e);}).update(function (t, n) {var i = u.__data.getItemGraphicEl(n);Pa(i, { shape: { points: h.getItemLayout(t) } }, e, t), u.group.add(i), h.setItemGraphicEl(t, i);}).remove(function (t) {var e = u.__data.getItemGraphicEl(t);u.group.remove(e);}).execute(), h.eachItemGraphicEl(function (t, n) {var i = h.getItemModel(n),r = i.getModel("label"),a = i.getModel("emphasis.label"),o = h.getItemVisual(n, "color");t.useStyle(s(i.getModel("itemStyle").getItemStyle(), { fill: Ke(o, .4), stroke: o })), t.hoverStyle = i.getModel("emphasis.itemStyle").getItemStyle(), _a(t.style, t.hoverStyle, r, a, { labelFetcher: e, labelDataIndex: n, defaultText: h.getName(n) || "", isRectText: !0, autoColor: o }), ya(t, {}), t.dataModel = e;}), u.__data = h, u.group.silent = e.get("silent") || t.get("silent");} }), Xl(function (t) {t.markArea = t.markArea || {};}), _y.registerSubTypeDefaulter("dataZoom", function () {return "slider";});var OM = ["x", "y", "z", "radius", "angle", "single"],zM = ["cartesian2d", "polar", "singleAxis"],EM = wf(OM, ["axisIndex", "axis", "index", "id"]),BM = f,RM = $a,NM = function NM(t, e, n, i) {this._dimName = t, this._axisIndex = e, this._valueWindow, this._percentWindow, this._dataExtent, this._minMaxSpan, this.ecModel = i, this._dataZoomModel = n;};NM.prototype = { constructor: NM, hostedBy: function hostedBy(t) {return this._dataZoomModel === t;}, getDataValueWindow: function getDataValueWindow() {return this._valueWindow.slice();}, getDataPercentWindow: function getDataPercentWindow() {return this._percentWindow.slice();}, getTargetSeriesModels: function getTargetSeriesModels() {var t = [],e = this.ecModel;return e.eachSeries(function (n) {if (_f(n.get("coordinateSystem"))) {var i = this._dimName,r = e.queryComponents({ mainType: i + "Axis", index: n.get(i + "AxisIndex"), id: n.get(i + "AxisId") })[0];this._axisIndex === (r && r.componentIndex) && t.push(n);}}, this), t;}, getAxisModel: function getAxisModel() {return this.ecModel.getComponent(this._dimName + "Axis", this._axisIndex);}, getOtherAxisModel: function getOtherAxisModel() {var t,e,n = this._dimName,i = this.ecModel,r = this.getAxisModel(),a = "x" === n || "y" === n;a ? (e = "gridIndex", t = "x" === n ? "y" : "x") : (e = "polarIndex", t = "angle" === n ? "radius" : "angle");var o;return i.eachComponent(t + "Axis", function (t) {(t.get(e) || 0) === (r.get(e) || 0) && (o = t);}), o;}, getMinMaxSpan: function getMinMaxSpan() {return i(this._minMaxSpan);}, calculateDataWindow: function calculateDataWindow(t) {var e = this._dataExtent,n = this.getAxisModel(),i = n.axis.scale,r = this._dataZoomModel.getRangePropMode(),a = [0, 100],o = [t.start, t.end],s = [];return BM(["startValue", "endValue"], function (e) {s.push(null != t[e] ? i.parse(t[e]) : null);}), BM([0, 1], function (t) {var n = s[t],l = o[t];"percent" === r[t] ? (null == l && (l = a[t]), n = i.parse(qa(l, a, e, !0))) : l = qa(n, e, a, !0), s[t] = n, o[t] = l;}), { valueWindow: RM(s), percentWindow: RM(o) };}, reset: function reset(t) {if (t === this._dataZoomModel) {var e = this.getTargetSeriesModels();this._dataExtent = Mf(this, this._dimName, e);var n = this.calculateDataWindow(t.option);this._valueWindow = n.valueWindow, this._percentWindow = n.percentWindow, Tf(this), If(this);}}, restore: function restore(t) {t === this._dataZoomModel && (this._valueWindow = this._percentWindow = null, If(this, !0));}, filterData: function filterData(t) {function e(t) {return t >= a[0] && t <= a[1];}if (t === this._dataZoomModel) {var n = this._dimName,i = this.getTargetSeriesModels(),r = t.get("filterMode"),a = this._valueWindow;"none" !== r && BM(i, function (t) {var i = t.getData(),o = i.mapDimension(n, !0);o.length && ("weakFilter" === r ? i.filterSelf(function (t) {for (var e, n, r, s = 0; s < o.length; s++) {var l = i.get(o[s], t),u = !isNaN(l),h = l < a[0],c = l > a[1];if (u && !h && !c) return !0;u && (r = !0), h && (e = !0), c && (n = !0);}return r && e && n;}) : BM(o, function (n) {if ("empty" === r) t.setData(i.map(n, function (t) {return e(t) ? t : 0 / 0;}));else {var o = {};o[n] = a, i.selectRange(o);}}), BM(o, function (t) {i.setApproximateExtent(a, t);}));});}} };var FM = f,VM = EM,WM = eu({ type: "dataZoom", dependencies: ["xAxis", "yAxis", "zAxis", "radiusAxis", "angleAxis", "singleAxis", "series"], defaultOption: { zlevel: 0, z: 4, orient: null, xAxisIndex: null, yAxisIndex: null, filterMode: "filter", throttle: null, start: 0, end: 100, startValue: null, endValue: null, minSpan: null, maxSpan: null, minValueSpan: null, maxValueSpan: null, rangeMode: null }, init: function init(t, e, n) {this._dataIntervalByAxis = {}, this._dataInfo = {}, this._axisProxies = {}, this.textStyleModel, this._autoThrottle = !0, this._rangePropMode = ["percent", "percent"];var i = Af(t);this.mergeDefaultAndTheme(t, n), this.doInit(i);}, mergeOption: function mergeOption(t) {var e = Af(t);r(this.option, t, !0), this.doInit(e);}, doInit: function doInit(t) {var e = this.option;np.canvasSupported || (e.realtime = !1), this._setDefaultThrottle(t), Cf(this, t), FM([["start", "startValue"], ["end", "endValue"]], function (t, n) {"value" === this._rangePropMode[n] && (e[t[0]] = null);}, this), this.textStyleModel = this.getModel("textStyle"), this._resetTarget(), this._giveAxisProxies();}, _giveAxisProxies: function _giveAxisProxies() {var t = this._axisProxies;this.eachTargetAxis(function (e, n, i, r) {var a = this.dependentModels[e.axis][n],o = a.__dzAxisProxy || (a.__dzAxisProxy = new NM(e.name, n, this, r));t[e.name + "_" + n] = o;}, this);}, _resetTarget: function _resetTarget() {var t = this.option,e = this._judgeAutoMode();VM(function (e) {var n = e.axisIndex;t[n] = Ri(t[n]);}, this), "axisIndex" === e ? this._autoSetAxisIndex() : "orient" === e && this._autoSetOrient();}, _judgeAutoMode: function _judgeAutoMode() {var t = this.option,e = !1;VM(function (n) {null != t[n.axisIndex] && (e = !0);}, this);var n = t.orient;return null == n && e ? "orient" : e ? void 0 : (null == n && (t.orient = "horizontal"), "axisIndex");}, _autoSetAxisIndex: function _autoSetAxisIndex() {var t = !0,e = this.get("orient", !0),n = this.option,i = this.dependentModels;if (t) {var r = "vertical" === e ? "y" : "x";i[r + "Axis"].length ? (n[r + "AxisIndex"] = [0], t = !1) : FM(i.singleAxis, function (i) {t && i.get("orient", !0) === e && (n.singleAxisIndex = [i.componentIndex], t = !1);});}t && VM(function (e) {if (t) {var i = [],r = this.dependentModels[e.axis];if (r.length && !i.length) for (var a = 0, o = r.length; o > a; a++) {"category" === r[a].get("type") && i.push(a);}n[e.axisIndex] = i, i.length && (t = !1);}}, this), t && this.ecModel.eachSeries(function (t) {this._isSeriesHasAllAxesTypeOf(t, "value") && VM(function (e) {var i = n[e.axisIndex],r = t.get(e.axisIndex),a = t.get(e.axisId),o = t.ecModel.queryComponents({ mainType: e.axis, index: r, id: a })[0];r = o.componentIndex, u(i, r) < 0 && i.push(r);});}, this);}, _autoSetOrient: function _autoSetOrient() {var t;this.eachTargetAxis(function (e) {!t && (t = e.name);}, this), this.option.orient = "y" === t ? "vertical" : "horizontal";}, _isSeriesHasAllAxesTypeOf: function _isSeriesHasAllAxesTypeOf(t, e) {var n = !0;return VM(function (i) {var r = t.get(i.axisIndex),a = this.dependentModels[i.axis][r];a && a.get("type") === e || (n = !1);}, this), n;}, _setDefaultThrottle: function _setDefaultThrottle(t) {if (t.hasOwnProperty("throttle") && (this._autoThrottle = !1), this._autoThrottle) {var e = this.ecModel.option;this.option.throttle = e.animation && e.animationDurationUpdate > 0 ? 100 : 20;}}, getFirstTargetAxisModel: function getFirstTargetAxisModel() {var t;return VM(function (e) {if (null == t) {var n = this.get(e.axisIndex);n.length && (t = this.dependentModels[e.axis][n[0]]);}}, this), t;}, eachTargetAxis: function eachTargetAxis(t, e) {var n = this.ecModel;VM(function (i) {FM(this.get(i.axisIndex), function (r) {t.call(e, i, r, this, n);}, this);}, this);}, getAxisProxy: function getAxisProxy(t, e) {return this._axisProxies[t + "_" + e];}, getAxisModel: function getAxisModel(t, e) {var n = this.getAxisProxy(t, e);return n && n.getAxisModel();}, setRawRange: function setRawRange(t, e) {var n = this.option;FM([["start", "startValue"], ["end", "endValue"]], function (e) {(null != t[e[0]] || null != t[e[1]]) && (n[e[0]] = t[e[0]], n[e[1]] = t[e[1]]);}, this), !e && Cf(this, t);}, getPercentRange: function getPercentRange() {var t = this.findRepresentativeAxisProxy();return t ? t.getDataPercentWindow() : void 0;}, getValueRange: function getValueRange(t, e) {if (null != t || null != e) return this.getAxisProxy(t, e).getDataValueWindow();var n = this.findRepresentativeAxisProxy();return n ? n.getDataValueWindow() : void 0;}, findRepresentativeAxisProxy: function findRepresentativeAxisProxy(t) {if (t) return t.__dzAxisProxy;var e = this._axisProxies;for (var n in e) {if (e.hasOwnProperty(n) && e[n].hostedBy(this)) return e[n];}for (var n in e) {if (e.hasOwnProperty(n) && !e[n].hostedBy(this)) return e[n];}}, getRangePropMode: function getRangePropMode() {return this._rangePropMode.slice();} }),GM = lx.extend({ type: "dataZoom", render: function render(t, e, n) {this.dataZoomModel = t, this.ecModel = e, this.api = n;}, getTargetCoordInfo: function getTargetCoordInfo() {function t(t, e, n, i) {for (var r, a = 0; a < n.length; a++) {if (n[a].model === t) {r = n[a];break;}}r || n.push(r = { model: t, axisModels: [], coordIndex: i }), r.axisModels.push(e);}var e = this.dataZoomModel,n = this.ecModel,i = {};return e.eachTargetAxis(function (e, r) {var a = n.getComponent(e.axis, r);if (a) {var o = a.getCoordSysModel();o && t(o, a, i[o.mainType] || (i[o.mainType] = []), o.componentIndex);}}, this), i;} }),HM = (WM.extend({ type: "dataZoom.slider", layoutMode: "box", defaultOption: { show: !0, right: "ph", top: "ph", width: "ph", height: "ph", left: null, bottom: null, backgroundColor: "rgba(47,69,84,0)", dataBackground: { lineStyle: { color: "#2f4554", width: .5, opacity: .3 }, areaStyle: { color: "rgba(47,69,84,0.3)", opacity: .3 } }, borderColor: "#ddd", fillerColor: "rgba(167,183,204,0.4)", handleIcon: "M8.2,13.6V3.9H6.3v9.7H3.1v14.9h3.3v9.7h1.8v-9.7h3.3V13.6H8.2z M9.7,24.4H4.8v-1.4h4.9V24.4z M9.7,19.1H4.8v-1.4h4.9V19.1z", handleSize: "100%", handleStyle: { color: "#a7b7cc" }, labelPrecision: null, labelFormatter: null, showDetail: !0, showDataShadow: "auto", realtime: !0, zoomLock: !1, textStyle: { color: "#333" } } }), function (t, e, n, i, r, a) {e[0] = kf(e[0], n), e[1] = kf(e[1], n), t = t || 0;var o = n[1] - n[0];null != r && (r = kf(r, [0, o])), null != a && (a = Math.max(a, null != r ? r : 0)), "all" === i && (r = a = Math.abs(e[1] - e[0]), i = 0);var s = Df(e, i);e[i] += t;var l = r || 0,u = n.slice();s.sign < 0 ? u[0] += l : u[1] -= l, e[i] = kf(e[i], u);var h = Df(e, i);null != r && (h.sign !== s.sign || h.span < r) && (e[1 - i] = e[i] + s.sign * r);var h = Df(e, i);return null != a && h.span > a && (e[1 - i] = e[i] + h.sign * a), e;}),ZM = Pm,XM = qa,YM = $a,qM = y,jM = f,UM = 7,$M = 1,KM = 30,QM = "horizontal",JM = "vertical",tS = 5,eS = ["line", "bar", "candlestick", "scatter"],nS = GM.extend({ type: "dataZoom.slider", init: function init(t, e) {this._displayables = {}, this._orient, this._range, this._handleEnds, this._size, this._handleWidth, this._handleHeight, this._location, this._dragging, this._dataShadowInfo, this.api = e;}, render: function render(t, e, n, i) {return nS.superApply(this, "render", arguments), Gs(this, "_dispatchZoomAction", this.dataZoomModel.get("throttle"), "fixRate"), this._orient = t.get("orient"), this.dataZoomModel.get("show") === !1 ? void this.group.removeAll() : (i && "dataZoom" === i.type && i.from === this.uid || this._buildView(), void this._updateView());}, remove: function remove() {nS.superApply(this, "remove", arguments), Hs(this, "_dispatchZoomAction");}, dispose: function dispose() {nS.superApply(this, "dispose", arguments), Hs(this, "_dispatchZoomAction");}, _buildView: function _buildView() {var t = this.group;t.removeAll(), this._resetLocation(), this._resetInterval();var e = this._displayables.barGroup = new hg();
      this._renderBackground(), this._renderHandle(), this._renderDataShadow(), t.add(e), this._positionGroup();}, _resetLocation: function _resetLocation() {var t = this.dataZoomModel,e = this.api,n = this._findCoordRect(),i = { width: e.getWidth(), height: e.getHeight() },r = this._orient === QM ? { right: i.width - n.x - n.width, top: i.height - KM - UM, width: n.width, height: KM } : { right: UM, top: n.y, width: KM, height: n.height },a = Mo(t.option);f(["right", "top", "width", "height"], function (t) {"ph" === a[t] && (a[t] = r[t]);});var o = wo(a, i, t.padding);this._location = { x: o.x, y: o.y }, this._size = [o.width, o.height], this._orient === JM && this._size.reverse();}, _positionGroup: function _positionGroup() {var t = this.group,e = this._location,n = this._orient,i = this.dataZoomModel.getFirstTargetAxisModel(),r = i && i.get("inverse"),a = this._displayables.barGroup,o = (this._dataShadowInfo || {}).otherAxisInverse;a.attr(n !== QM || r ? n === QM && r ? { scale: o ? [-1, 1] : [-1, -1] } : n !== JM || r ? { scale: o ? [-1, -1] : [-1, 1], rotation: Math.PI / 2 } : { scale: o ? [1, -1] : [1, 1], rotation: Math.PI / 2 } : { scale: o ? [1, 1] : [1, -1] });var s = t.getBoundingRect([a]);t.attr("position", [e.x - s.x, e.y - s.y]);}, _getViewExtent: function _getViewExtent() {return [0, this._size[0]];}, _renderBackground: function _renderBackground() {var t = this.dataZoomModel,e = this._size,n = this._displayables.barGroup;n.add(new ZM({ silent: !0, shape: { x: 0, y: 0, width: e[0], height: e[1] }, style: { fill: t.get("backgroundColor") }, z2: -40 })), n.add(new ZM({ shape: { x: 0, y: 0, width: e[0], height: e[1] }, style: { fill: "transparent" }, z2: 0, onclick: y(this._onClickPanelClick, this) }));}, _renderDataShadow: function _renderDataShadow() {var t = this._dataShadowInfo = this._prepareDataShadowInfo();if (t) {var e = this._size,n = t.series,i = n.getRawData(),r = n.getShadowDim ? n.getShadowDim() : t.otherDim;if (null != r) {var a = i.getDataExtent(r),o = .3 * (a[1] - a[0]);a = [a[0] - o, a[1] + o];var l,u = [0, e[1]],h = [0, e[0]],c = [[e[0], 0], [0, 0]],d = [],f = h[1] / (i.count() - 1),p = 0,g = Math.round(i.count() / e[0]);i.each([r], function (t, e) {if (g > 0 && e % g) return void (p += f);var n = null == t || isNaN(t) || "" === t,i = n ? 0 : XM(t, a, u, !0);n && !l && e ? (c.push([c[c.length - 1][0], 0]), d.push([d[d.length - 1][0], 0])) : !n && l && (c.push([p, 0]), d.push([p, 0])), c.push([p, i]), d.push([p, i]), p += f, l = n;});var v = this.dataZoomModel;this._displayables.barGroup.add(new Dm({ shape: { points: c }, style: s({ fill: v.get("dataBackgroundColor") }, v.getModel("dataBackground.areaStyle").getAreaStyle()), silent: !0, z2: -20 })), this._displayables.barGroup.add(new km({ shape: { points: d }, style: v.getModel("dataBackground.lineStyle").getLineStyle(), silent: !0, z2: -19 }));}}}, _prepareDataShadowInfo: function _prepareDataShadowInfo() {var t = this.dataZoomModel,e = t.get("showDataShadow");if (e !== !1) {var n,i = this.ecModel;return t.eachTargetAxis(function (r, a) {var o = t.getAxisProxy(r.name, a).getTargetSeriesModels();f(o, function (t) {if (!(n || e !== !0 && u(eS, t.get("type")) < 0)) {var o,s = i.getComponent(r.axis, a).axis,l = Pf(r.name),h = t.coordinateSystem;null != l && h.getOtherAxis && (o = h.getOtherAxis(s).inverse), l = t.getData().mapDimension(l), n = { thisAxis: s, series: t, thisDim: r.name, otherDim: l, otherAxisInverse: o };}}, this);}, this), n;}}, _renderHandle: function _renderHandle() {var t = this._displayables,e = t.handles = [],n = t.handleLabels = [],i = this._displayables.barGroup,r = this._size,a = this.dataZoomModel;i.add(t.filler = new ZM({ draggable: !0, cursor: Lf(this._orient), drift: qM(this._onDragMove, this, "all"), onmousemove: function onmousemove(t) {Ap(t.event);}, ondragstart: qM(this._showDataInfo, this, !0), ondragend: qM(this._onDragEnd, this), onmouseover: qM(this._showDataInfo, this, !0), onmouseout: qM(this._showDataInfo, this, !1), style: { fill: a.get("fillerColor"), textPosition: "inside" } })), i.add(new ZM(na({ silent: !0, shape: { x: 0, y: 0, width: r[0], height: r[1] }, style: { stroke: a.get("dataBackgroundColor") || a.get("borderColor"), lineWidth: $M, fill: "rgba(0,0,0,0)" } }))), jM([0, 1], function (t) {var r = Fa(a.get("handleIcon"), { cursor: Lf(this._orient), draggable: !0, drift: qM(this._onDragMove, this, t), onmousemove: function onmousemove(t) {Ap(t.event);}, ondragend: qM(this._onDragEnd, this), onmouseover: qM(this._showDataInfo, this, !0), onmouseout: qM(this._showDataInfo, this, !1) }, { x: -1, y: 0, width: 2, height: 2 }),o = r.getBoundingRect();this._handleHeight = ja(a.get("handleSize"), this._size[1]), this._handleWidth = o.width / o.height * this._handleHeight, r.setStyle(a.getModel("handleStyle").getItemStyle());var s = a.get("handleColor");null != s && (r.style.fill = s), i.add(e[t] = r);var l = a.textStyleModel;this.group.add(n[t] = new wm({ silent: !0, invisible: !0, style: { x: 0, y: 0, text: "", textVerticalAlign: "middle", textAlign: "center", textFill: l.getTextColor(), textFont: l.getFont() }, z2: 10 }));}, this);}, _resetInterval: function _resetInterval() {var t = this._range = this.dataZoomModel.getPercentRange(),e = this._getViewExtent();this._handleEnds = [XM(t[0], [0, 100], e, !0), XM(t[1], [0, 100], e, !0)];}, _updateInterval: function _updateInterval(t, e) {var n = this.dataZoomModel,i = this._handleEnds,r = this._getViewExtent(),a = n.findRepresentativeAxisProxy().getMinMaxSpan(),o = [0, 100];HM(e, i, r, n.get("zoomLock") ? "all" : t, null != a.minSpan ? XM(a.minSpan, o, r, !0) : null, null != a.maxSpan ? XM(a.maxSpan, o, r, !0) : null);var s = this._range,l = this._range = YM([XM(i[0], r, o, !0), XM(i[1], r, o, !0)]);return !s || s[0] !== l[0] || s[1] !== l[1];}, _updateView: function _updateView(t) {var e = this._displayables,n = this._handleEnds,i = YM(n.slice()),r = this._size;jM([0, 1], function (t) {var i = e.handles[t],a = this._handleHeight;i.attr({ scale: [a / 2, a / 2], position: [n[t], r[1] / 2 - a / 2] });}, this), e.filler.setShape({ x: i[0], y: 0, width: i[1] - i[0], height: r[1] }), this._updateDataInfo(t);}, _updateDataInfo: function _updateDataInfo(t) {function e(t) {var e = Oa(i.handles[t].parent, this.group),n = Ea(0 === t ? "right" : "left", e),s = this._handleWidth / 2 + tS,l = za([c[t] + (0 === t ? -s : s), this._size[1] / 2], e);r[t].setStyle({ x: l[0], y: l[1], textVerticalAlign: a === QM ? "middle" : n, textAlign: a === QM ? n : "center", text: o[t] });}var n = this.dataZoomModel,i = this._displayables,r = i.handleLabels,a = this._orient,o = ["", ""];if (n.get("showDetail")) {var s = n.findRepresentativeAxisProxy();if (s) {var l = s.getAxisModel().axis,u = this._range,h = t ? s.calculateDataWindow({ start: u[0], end: u[1] }).valueWindow : s.getDataValueWindow();o = [this._formatLabel(h[0], l), this._formatLabel(h[1], l)];}}var c = YM(this._handleEnds.slice());e.call(this, 0), e.call(this, 1);}, _formatLabel: function _formatLabel(t, e) {var n = this.dataZoomModel,i = n.get("labelFormatter"),r = n.get("labelPrecision");(null == r || "auto" === r) && (r = e.getPixelPrecision());var a = null == t || isNaN(t) ? "" : "category" === e.type || "time" === e.type ? e.scale.getLabel(Math.round(t)) : t.toFixed(Math.min(r, 20));return w(i) ? i(t, a) : b(i) ? i.replace("{value}", a) : a;}, _showDataInfo: function _showDataInfo(t) {t = this._dragging || t;var e = this._displayables.handleLabels;e[0].attr("invisible", !t), e[1].attr("invisible", !t);}, _onDragMove: function _onDragMove(t, e, n) {this._dragging = !0;var i = this._displayables.barGroup.getLocalTransform(),r = za([e, n], i, !0),a = this._updateInterval(t, r[0]),o = this.dataZoomModel.get("realtime");this._updateView(!o), a && o && this._dispatchZoomAction();}, _onDragEnd: function _onDragEnd() {this._dragging = !1, this._showDataInfo(!1);var t = this.dataZoomModel.get("realtime");!t && this._dispatchZoomAction();}, _onClickPanelClick: function _onClickPanelClick(t) {var e = this._size,n = this._displayables.barGroup.transformCoordToLocal(t.offsetX, t.offsetY);if (!(n[0] < 0 || n[0] > e[0] || n[1] < 0 || n[1] > e[1])) {var i = this._handleEnds,r = (i[0] + i[1]) / 2,a = this._updateInterval("all", n[0] - r);this._updateView(), a && this._dispatchZoomAction();}}, _dispatchZoomAction: function _dispatchZoomAction() {var t = this._range;this.api.dispatchAction({ type: "dataZoom", from: this.uid, dataZoomId: this.dataZoomModel.id, start: t[0], end: t[1] });}, _findCoordRect: function _findCoordRect() {var t;if (jM(this.getTargetCoordInfo(), function (e) {if (!t && e.length) {var n = e[0].model.coordinateSystem;t = n.getRect && n.getRect();}}), !t) {var e = this.api.getWidth(),n = this.api.getHeight();t = { x: .2 * e, y: .2 * n, width: .6 * e, height: .6 * n };}return t;} });WM.extend({ type: "dataZoom.inside", defaultOption: { disabled: !1, zoomLock: !1, zoomOnMouseWheel: !0, moveOnMouseMove: !0, moveOnMouseWheel: !1, preventDefaultMouseMove: !0 } });var iS = "\x00_ec_interaction_mutex";jl({ type: "takeGlobalCursor", event: "globalCursorTaken", update: "update" }, function () {}), c(Ef, Sp);var rS = "\x00_ec_dataZoom_roams",aS = y,oS = GM.extend({ type: "dataZoom.inside", init: function init() {this._range;}, render: function render(t, e, n) {oS.superApply(this, "render", arguments), this._range = t.getPercentRange(), f(this.getTargetCoordInfo(), function (e, i) {var r = p(e, function (t) {return Yf(t.model);});f(e, function (e) {var a = e.model,o = {};f(["pan", "zoom", "scrollMove"], function (t) {o[t] = aS(sS[t], this, e, i);}, this), Zf(n, { coordId: Yf(a), allCoordIds: r, containsPoint: function containsPoint(t, e, n) {return a.coordinateSystem.containPoint([e, n]);}, dataZoomId: t.id, dataZoomModel: t, getRange: o });}, this);}, this);}, dispose: function dispose() {Xf(this.api, this.dataZoomModel.id), oS.superApply(this, "dispose", arguments), this._range = null;} }),sS = { zoom: function zoom(t, e, n, i) {var r = this._range,a = r.slice(),o = t.axisModels[0];if (o) {var s = lS[e](null, [i.originX, i.originY], o, n, t),l = (s.signal > 0 ? s.pixelStart + s.pixelLength - s.pixel : s.pixel - s.pixelStart) / s.pixelLength * (a[1] - a[0]) + a[0],u = Math.max(1 / i.scale, 0);a[0] = (a[0] - l) * u + l, a[1] = (a[1] - l) * u + l;var h = this.dataZoomModel.findRepresentativeAxisProxy().getMinMaxSpan();return HM(0, a, [0, 100], 0, h.minSpan, h.maxSpan), this._range = a, r[0] !== a[0] || r[1] !== a[1] ? a : void 0;}}, pan: Qf(function (t, e, n, i, r, a) {var o = lS[i]([a.oldX, a.oldY], [a.newX, a.newY], e, r, n);return o.signal * (t[1] - t[0]) * o.pixel / o.pixelLength;}), scrollMove: Qf(function (t, e, n, i, r, a) {var o = lS[i]([0, 0], [a.scrollDelta, a.scrollDelta], e, r, n);return o.signal * (t[1] - t[0]) * a.scrollDelta;}) },lS = { grid: function grid(t, e, n, i, r) {var a = n.axis,o = {},s = r.model.coordinateSystem.getRect();return t = t || [0, 0], "x" === a.dim ? (o.pixel = e[0] - t[0], o.pixelLength = s.width, o.pixelStart = s.x, o.signal = a.inverse ? 1 : -1) : (o.pixel = e[1] - t[1], o.pixelLength = s.height, o.pixelStart = s.y, o.signal = a.inverse ? -1 : 1), o;}, polar: function polar(t, e, n, i, r) {var a = n.axis,o = {},s = r.model.coordinateSystem,l = s.getRadiusAxis().getExtent(),u = s.getAngleAxis().getExtent();return t = t ? s.pointToCoord(t) : [0, 0], e = s.pointToCoord(e), "radiusAxis" === n.mainType ? (o.pixel = e[0] - t[0], o.pixelLength = l[1] - l[0], o.pixelStart = l[0], o.signal = a.inverse ? 1 : -1) : (o.pixel = e[1] - t[1], o.pixelLength = u[1] - u[0], o.pixelStart = u[0], o.signal = a.inverse ? -1 : 1), o;}, singleAxis: function singleAxis(t, e, n, i, r) {var a = n.axis,o = r.model.coordinateSystem.getRect(),s = {};return t = t || [0, 0], "horizontal" === a.orient ? (s.pixel = e[0] - t[0], s.pixelLength = o.width, s.pixelStart = o.x, s.signal = a.inverse ? 1 : -1) : (s.pixel = e[1] - t[1], s.pixelLength = o.height, s.pixelStart = o.y, s.signal = a.inverse ? -1 : 1), s;} };Yl({ getTargetSeries: function getTargetSeries(t) {var e = N();return t.eachComponent("dataZoom", function (t) {t.eachTargetAxis(function (t, n, i) {var r = i.getAxisProxy(t.name, n);f(r.getTargetSeriesModels(), function (t) {e.set(t.uid, t);});});}), e;}, modifyOutputEnd: !0, overallReset: function overallReset(t, e) {t.eachComponent("dataZoom", function (t) {t.eachTargetAxis(function (t, n, i) {i.getAxisProxy(t.name, n).reset(i, e);}), t.eachTargetAxis(function (t, n, i) {i.getAxisProxy(t.name, n).filterData(i, e);});}), t.eachComponent("dataZoom", function (t) {var e = t.findRepresentativeAxisProxy(),n = e.getDataPercentWindow(),i = e.getDataValueWindow();t.setRawRange({ start: n[0], end: n[1], startValue: i[0], endValue: i[1] }, !0);});} }), jl("dataZoom", function (t, e) {var n = bf(y(e.eachComponent, e, "dataZoom"), EM, function (t, e) {return t.get(e.axisIndex);}),i = [];e.eachComponent({ mainType: "dataZoom", query: t }, function (t) {i.push.apply(i, n(t).nodes);}), f(i, function (e) {e.setRawRange({ start: t.start, end: t.end, startValue: t.startValue, endValue: t.endValue });});}), t.version = Qx, t.dependencies = Jx, t.PRIORITY = l_, t.init = Nl, t.connect = Fl, t.disConnect = Vl, t.disconnect = C_, t.dispose = Wl, t.getInstanceByDom = Gl, t.getInstanceById = Hl, t.registerTheme = Zl, t.registerPreprocessor = Xl, t.registerProcessor = Yl, t.registerPostUpdate = ql, t.registerAction = jl, t.registerCoordinateSystem = Ul, t.getCoordinateSystemDimensions = $l, t.registerLayout = Kl, t.registerVisual = Ql, t.registerLoading = tu, t.extendComponentModel = eu, t.extendComponentView = nu, t.extendSeriesModel = iu, t.extendChartView = ru, t.setCanvasCreator = au, t.registerMap = ou, t.getMap = su, t.dataTool = D_, t.zrender = rv, t.number = ay, t.format = fy, t.throttle = Ws, t.helper = Cw, t.matrix = Lp, t.vector = bp, t.color = Kp, t.parseGeoJSON = kw, t.parseGeoJson = zw, t.util = Ew, t.graphic = Bw, t.List = F_, t.Model = Va, t.Axis = Ow, t.env = np;});

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue":
/*!*******************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./echarts.vue?vue&type=template&id=4f83ca6f&scoped=true& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=template&id=4f83ca6f&scoped=true&");
/* harmony import */ var _echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./echarts.vue?vue&type=script&lang=js& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "4f83ca6f",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=script&lang=js&":
/*!********************************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./echarts.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css&":
/*!****************************************************************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css& ***!
  \****************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!./echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=style&index=0&id=4f83ca6f&scoped=true&lang=css&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_style_index_0_id_4f83ca6f_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=template&id=4f83ca6f&scoped=true&":
/*!**************************************************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/echarts.vue?vue&type=template&id=4f83ca6f&scoped=true& ***!
  \**************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./echarts.vue?vue&type=template&id=4f83ca6f&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\echarts.vue?vue&type=template&id=4f83ca6f&scoped=true&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_echarts_vue_vue_type_template_id_4f83ca6f_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\mpvue-echarts\\src\\wx-canvas.js":
/*!********************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/mpvue-echarts/src/wx-canvas.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var WxCanvas = /*#__PURE__*/function () {
  function WxCanvas(ctx, canvasId) {_classCallCheck(this, WxCanvas);
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;

    WxCanvas.initStyle(ctx);
    this.initEvent();
  }_createClass(WxCanvas, [{ key: "getContext", value: function getContext(

    contextType) {
      return contextType === '2d' ? this.ctx : null;
    } }, { key: "setChart", value: function setChart(

    chart) {
      this.chart = chart;
    } }, { key: "attachEvent", value: function attachEvent()

    {
      // noop
    } }, { key: "detachEvent", value: function detachEvent()

    {
      // noop
    } }, { key: "initEvent", value: function initEvent()





















    {var _this = this;
      this.event = {};
      var eventNames = [{
        wxName: 'touchStart',
        ecName: 'mousedown' },
      {
        wxName: 'touchMove',
        ecName: 'mousemove' },
      {
        wxName: 'touchEnd',
        ecName: 'mouseup' },
      {
        wxName: 'touchEnd',
        ecName: 'click' }];


      eventNames.forEach(function (name) {
        _this.event[name.wxName] = function (e) {
          var touch = e.mp.touches[0];
          _this.chart._zr.handler.dispatch(name.ecName, {
            zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
            zrY: name.wxName === 'tap' ? touch.clientY : touch.y });

        };
      });
    } }], [{ key: "initStyle", value: function initStyle(ctx) {var _arguments = arguments;var styles = ['fillStyle', 'strokeStyle', 'globalAlpha', 'textAlign', 'textBaseAlign', 'shadow', 'lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'miterLimit', 'fontSize'];styles.forEach(function (style) {Object.defineProperty(ctx, style, { set: function set(value) {if (style !== 'fillStyle' && style !== 'strokeStyle' || value !== 'none' && value !== null) {ctx["set".concat(style.charAt(0).toUpperCase()).concat(style.slice(1))](value);}} });});ctx.createRadialGradient = function () {return ctx.createCircularGradient(_arguments);};} }]);return WxCanvas;}();exports.default = WxCanvas;

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue":
/*!****************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./navigation.vue?vue&type=template&id=df3c47b6& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=template&id=df3c47b6&");
/* harmony import */ var _navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./navigation.vue?vue&type=script&lang=js& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./navigation.vue?vue&type=style&index=0&lang=css& */ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__["render"],
  _navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=script&lang=js&":
/*!*****************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./navigation.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=style&index=0&lang=css&":
/*!*************************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=style&index=0&lang=css& ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!./navigation.vue?vue&type=style&index=0&lang=css& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=style&index=0&lang=css&");
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=template&id=df3c47b6&":
/*!***********************************************************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/components/navigation.vue?vue&type=template&id=df3c47b6& ***!
  \***********************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./navigation.vue?vue&type=template&id=df3c47b6& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\components\\navigation.vue?vue&type=template&id=df3c47b6&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_navigation_vue_vue_type_template_id_df3c47b6___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "C:\\Users\\Admin\\Desktop\\sina-cloud\\4\\tianyi\\pages.json":
/*!*************************************************************!*\
  !*** C:/Users/Admin/Desktop/sina-cloud/4/tianyi/pages.json ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ })

}]);
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/vendor.js.map