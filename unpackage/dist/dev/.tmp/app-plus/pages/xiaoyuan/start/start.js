(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/xiaoyuan/start/start"],{

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, \"__esModule\", { value: true });exports.default = void 0;var _regenerator = _interopRequireDefault(__webpack_require__(/*! ./node_modules/@babel/runtime/regenerator */ \"./node_modules/@babel/runtime/regenerator/index.js\"));\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvar _vuex = __webpack_require__(/*! vuex */ \"./node_modules/vuex/dist/vuex.esm.js\");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};var ownKeys = Object.keys(source);if (typeof Object.getOwnPropertySymbols === 'function') {ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {return Object.getOwnPropertyDescriptor(source, sym).enumerable;}));}ownKeys.forEach(function (key) {_defineProperty(target, key, source[key]);});}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {Promise.resolve(value).then(_next, _throw);}}function _asyncToGenerator(fn) {return function () {var self = this,args = arguments;return new Promise(function (resolve, reject) {var gen = fn.apply(self, args);function _next(value) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value);}function _throw(err) {asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err);}_next(undefined);});};}var _default =\n\n\n\n{\n  data: function data() {\n    return {\n      fileSrc: \"\",\n      savedFilePath: \"\",\n      // jsondata: null\n      ifallowgotohot: false,\n      windowHeight: null,\n      finish_task: 0 };\n\n\n\n  },\n  onLoad: function () {var _onLoad = _asyncToGenerator( /*#__PURE__*/_regenerator.default.mark(function _callee(option) {var that;return _regenerator.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:\n              that = this;\n              that.windowHeight = uni.getSystemInfoSync().windowHeight;case 2:case \"end\":return _context.stop();}}}, _callee, this);}));function onLoad(_x) {return _onLoad.apply(this, arguments);}return onLoad;}(),\n\n  computed: _objectSpread({},\n  (0, _vuex.mapState)(['hasLogin', 'userInfo', 'phonenum', 'openid'])),\n\n  methods: _objectSpread({},\n  (0, _vuex.mapMutations)(['login', 'logout', 'setopenid', 'setluyouData', 'setphonenum']), {\n    wxGetUserInfo: function wxGetUserInfo(e) {\n\n      var that = this;\n      console.log(e.detail.userInfo);\n      if (e.detail.userInfo) {\n        // 发送 res.code 到后台换取 openId, sessionKey, unionId\n        uni.login({\n          provider: 'weixin',\n          success: function success(loginRes) {\n            // that.get_access_token(loginRes.code);\n\n            console.log(\"code:\", loginRes.code);\n            that.upload_oauthData(e.detail.userInfo, loginRes.code);\n            that.login(e.detail.userInfo, loginRes.code);\n            uni.reLaunch({\n              url: \"../map/map\" });\n\n          } });\n\n\n      } else {\n        console.log(333, '执行到这里，说明拒绝了授权');\n        uni.showToast({\n          title: \"为了您更好的体验,请先同意授权\",\n          icon: 'none',\n          duration: 2000 });\n\n\n      }\n\n    },\n\n\n\n    upload_oauthData: function upload_oauthData(userInfo, code) {\n      var that = this;\n      uni.request({\n        url: 'https://kaikaiomg.applinzi.com/uni_app_upload.php',\n        method: \"POST\",\n        data: {\n          'form': 'oauthData',\n          'nickName': userInfo.nickName,\n          'avatarUrl': userInfo.avatarUrl,\n          'city': userInfo.city,\n          'country': userInfo.country,\n          'gender': userInfo.gender,\n          'language': userInfo.language,\n          'province': userInfo.province,\n          'code': code },\n\n        header: {\n          'content-type': 'application/x-www-form-urlencoded' },\n\n        success: function success(ret) {\n          if (ret.statusCode !== 200) {\n            console.log(\"请求失败:\", ret);\n          } else {\n            console.log(\"success_uodate_oauthData:\", ret.data);\n            console.log(\"success_uodate_oauthData:\", ret.data.openid);\n            that.setopenid(ret.data.openid);\n          }\n        } });\n\n    } }) };exports.default = _default;\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/vue-cli-plugin-hbuilderx/packages/uni-app-plus/dist/index.js */ \"./node_modules/@dcloudio/vue-cli-plugin-hbuilderx/packages/uni-app-plus/dist/index.js\")[\"default\"]))\n\n//# sourceURL=uni-app:///pages/xiaoyuan/start/start.vue?vue&type=script&lang=js&?6d4f");

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=style&index=0&lang=css&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=style&index=0&lang=css& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=style&index=0&lang=css&");

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=template&id=509d3e88&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=template&id=509d3e88& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return staticRenderFns; });\nvar render = function() {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"view\",\n    {\n      staticStyle: {\n        \"flex-flow\": \"column nowrap\",\n        width: \"750rpx\",\n        position: \"relative\"\n      }\n    },\n    [\n      _c(\"image\", {\n        staticClass: \"bac_image\",\n        style: \"height:\" + _vm.windowHeight + \"px\",\n        attrs: {\n          src:\n            \"http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/dengru.png\"\n        }\n      }),\n      _vm._m(0),\n      _c(\n        \"view\",\n        {\n          staticStyle: {\n            position: \"absolute\",\n            top: \"550rpx\",\n            \"justify-content\": \"center\",\n            \"align-items\": \"center\",\n            width: \"750rpx\"\n          }\n        },\n        [\n          _c(\n            \"navigator\",\n            {\n              staticClass: \"button_style2 icontext\",\n              attrs: { url: \"../xiaoyuan_login/xiaoyuan_login\" }\n            },\n            [_vm._v(\"   手机登陆\")]\n          )\n        ],\n        1\n      ),\n      _c(\n        \"view\",\n        {\n          staticStyle: {\n            position: \"absolute\",\n            top: \"750rpx\",\n            \"justify-content\": \"center\",\n            \"align-items\": \"center\",\n            width: \"750rpx\"\n          }\n        },\n        [\n          _c(\n            \"button\",\n            {\n              staticClass: \"button_style icontext\",\n              attrs: {\n                type: \"primary\",\n                \"open-type\": \"getUserInfo\",\n                eventid: \"0892b21e-0\"\n              },\n              on: { getuserinfo: _vm.wxGetUserInfo }\n            },\n            [_vm._v(\"   微信登陆\")]\n          )\n        ],\n        1\n      )\n    ]\n  )\n}\nvar staticRenderFns = [\n  function() {\n    var _vm = this\n    var _h = _vm.$createElement\n    var _c = _vm._self._c || _h\n    return _c(\n      \"view\",\n      {\n        staticStyle: {\n          position: \"absolute\",\n          top: \"250rpx\",\n          \"justify-content\": \"center\",\n          \"align-items\": \"center\",\n          width: \"750rpx\"\n        }\n      },\n      [\n        _c(\n          \"view\",\n          {\n            staticStyle: {\n              \"font-size\": \"70rpx\",\n              \"font-family\": \"KaiTi\",\n              color: \"yellow\"\n            }\n          },\n          [_vm._v(\"天翼大学\")]\n        )\n      ]\n    )\n  }\n]\nrender._withStripped = true\n\n\n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=template&id=509d3e88&");

/***/ }),

/***/ "C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\main.js?{\"page\":\"pages%2Fxiaoyuan%2Fstart%2Fstart\"}":
/*!*******************************************************************************************************!*\
  !*** C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/main.js?{"page":"pages%2Fxiaoyuan%2Fstart%2Fstart"} ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("__webpack_require__(/*! uni-pages */ \"C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages.json\");\nvar _mpvuePageFactory = _interopRequireDefault(__webpack_require__(/*! mpvue-page-factory */ \"./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js\"));\nvar _start = _interopRequireDefault(__webpack_require__(/*! ./pages/xiaoyuan/start/start.vue */ \"C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue\"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}\nPage((0, _mpvuePageFactory.default)(_start.default));\n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/main.js?%7B%22page%22:%22pages%252Fxiaoyuan%252Fstart%252Fstart%22%7D");

/***/ }),

/***/ "C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue":
/*!**********************************************************************************!*\
  !*** C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./start.vue?vue&type=template&id=509d3e88& */ \"C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=template&id=509d3e88&\");\n/* harmony import */ var _start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./start.vue?vue&type=script&lang=js& */ \"C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=script&lang=js&\");\n/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));\n/* harmony import */ var _start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./start.vue?vue&type=style&index=0&lang=css& */ \"C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=style&index=0&lang=css&\");\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ \"./node_modules/vue-loader/lib/runtime/componentNormalizer.js\");\n\n\n\n\n\n\n/* normalize component */\n\nvar component = Object(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(\n  _start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n  _start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__[\"render\"],\n  _start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"],\n  false,\n  null,\n  null,\n  null\n  \n)\n\n/* hot reload */\nif (false) { var api; }\ncomponent.options.__file = \"C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue\"\n/* harmony default export */ __webpack_exports__[\"default\"] = (component.exports);\n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue");

/***/ }),

/***/ "C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=script&lang=js&":
/*!***********************************************************************************************************!*\
  !*** C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./start.vue?vue&type=script&lang=js& */ \"./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=script&lang=js&\");\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);\n/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));\n /* harmony default export */ __webpack_exports__[\"default\"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); \n\n//# sourceURL=uni-app:///pages/xiaoyuan/start/start.vue?vue&type=script&lang=js&?36e8");

/***/ }),

/***/ "C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=style&index=0&lang=css&":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=style&index=0&lang=css& ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-1!./node_modules/css-loader??ref--6-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/vue-loader/lib??vue-loader-options!./start.vue?vue&type=style&index=0&lang=css& */ \"./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-loader/lib/index.js?!C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=style&index=0&lang=css&\");\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);\n/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));\n /* harmony default export */ __webpack_exports__[\"default\"] = (_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_1_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_6_oneOf_1_2_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); \n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=style&index=0&lang=css&");

/***/ }),

/***/ "C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\pages\\xiaoyuan\\start\\start.vue?vue&type=template&id=509d3e88&":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=template&id=509d3e88& ***!
  \*****************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./start.vue?vue&type=template&id=509d3e88& */ \"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!C:\\\\Users\\\\kaikai\\\\Desktop\\\\sina_cloud\\\\4\\\\tianyi\\\\pages\\\\xiaoyuan\\\\start\\\\start.vue?vue&type=template&id=509d3e88&\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__[\"render\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return _D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_hbuilderx_HBuilderX_0_1_50_20180918_alpha_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_start_vue_vue_type_template_id_509d3e88___WEBPACK_IMPORTED_MODULE_0__[\"staticRenderFns\"]; });\n\n\n\n//# sourceURL=C:/Users/kaikai/Desktop/sina_cloud/4/tianyi/pages/xiaoyuan/start/start.vue?vue&type=template&id=509d3e88&");

/***/ })

},[["C:\\Users\\kaikai\\Desktop\\sina_cloud\\4\\tianyi\\main.js?{\"page\":\"pages%2Fxiaoyuan%2Fstart%2Fstart\"}","common/runtime","common/vendor"]]]);