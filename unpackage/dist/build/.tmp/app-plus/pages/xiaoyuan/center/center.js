(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/xiaoyuan/center/center"],{"0426":function(t,a,e){},"62de":function(t,a,e){"use strict";e.r(a);var i=e("ddce"),s=e.n(i);for(var n in i)"default"!==n&&function(t){e.d(a,t,function(){return i[t]})}(n);a["default"]=s.a},"756d":function(t,a,e){"use strict";var i=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("view",{staticClass:"center"},[t.pic_show?e("view",{staticStyle:{width:"750rpx",height:"100%",margin:"auto","background-color":"rgba(0,0,0,0.2)",position:"fixed",top:"0rpx","z-index":"10"}},[e("view",{staticClass:"dianzhan_view"},[e("view",{staticClass:"icontext",staticStyle:{position:"absolute",top:"15rpx",right:"15rpx",color:"black","font-size":"30rpx"},attrs:{eventid:"5b3842cb-0"},on:{click:t.tap_zhanshang}},[t._v("")]),e("image",{staticStyle:{width:"100%",height:"400rpx"},attrs:{src:"../../../static/erweima.png"}}),e("view",{staticStyle:{width:"100%",height:"100rpx","justify-content":"center","align-items":"center","font-size":"30rpx"},attrs:{eventid:"5b3842cb-1"},on:{click:t.save_pic}},[t._v("保存到相册")])])]):t._e(),e("view",{staticClass:"logo"},[e("image",{staticClass:"logo-img",attrs:{src:t.hasLogin?t.userInfo.avatarUrl:t.loacal_avatarUrl_loc}}),e("view",{staticClass:"logo-title"},[e("text",{staticClass:"uer-name"},[t._v("Hi，"+t._s(t.hasLogin?t.userInfo.nickName:"您未登录"))]),t._v("·"),t.hasLogin?t._e():e("text",{staticClass:"go-login navigat-arrow"},[t._v("")])])]),e("view",{staticClass:"center-list"},[t.phonenum?t._e():e("view",{staticClass:"center-list-item border-bottom"},[e("text",{staticClass:"list-icon"},[t._v("")]),e("text",{staticClass:"list-text"},[t._v("绑定手机号")]),e("navigator",{staticClass:"navigat-arrow",attrs:{url:"../xiaoyuan_login/xiaoyuan_login"}},[t._v("")])],1)]),e("view",{staticClass:"center-list"},[e("view",{staticClass:"center-list-item border-bottom"},[e("text",{staticClass:"list-icon"},[t._v("")]),e("text",{staticClass:"list-text"},[t._v("代办箱")]),e("navigator",{staticClass:"navigat-arrow"},[t._v("")])],1),e("view",{staticClass:"center-list-item border-bottom"},[e("text",{staticClass:"list-icon"},[t._v("")]),e("text",{staticClass:"list-text"},[t._v("个人信息")]),e("navigator",{staticClass:"navigat-arrow"},[t._v("")])],1)]),e("view",{staticClass:"center-list"},[e("view",{staticClass:"center-list-item border-bottom"},[e("text",{staticClass:"list-icon"},[t._v("")]),e("text",{staticClass:"list-text"},[t._v("关于")]),e("navigator",{staticClass:"navigat-arrow",attrs:{url:"../jieshao/jieshao"}},[t._v("")])],1),e("view",{staticClass:"center-list-item border-bottom",attrs:{eventid:"5b3842cb-2"},on:{click:t.tap_zhanshang}},[e("text",{staticClass:"list-icon"},[t._v("")]),e("text",{staticClass:"list-text"},[t._v("支持")]),e("text",{staticClass:"navigat-arrow"},[t._v("")])])])])},s=[];e.d(a,"a",function(){return i}),e.d(a,"b",function(){return s})},a37f:function(t,a,e){"use strict";e.r(a);var i=e("756d"),s=e("62de");for(var n in s)"default"!==n&&function(t){e.d(a,t,function(){return s[t]})}(n);e("c1de");var o=e("2877"),c=Object(o["a"])(s["default"],i["a"],i["b"],!1,null,null,null);c.options.__file="center.vue",a["default"]=c.exports},af94:function(t,a,e){"use strict";e("1abb");var i=n(e("b0ce")),s=n(e("a37f"));function n(t){return t&&t.__esModule?t:{default:t}}Page((0,i.default)(s.default))},c1de:function(t,a,e){"use strict";var i=e("0426"),s=e.n(i);s.a},ddce:function(t,a,e){"use strict";(function(t){Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0;var i=e("2f62");function s(t){for(var a=1;a<arguments.length;a++){var e=null!=arguments[a]?arguments[a]:{},i=Object.keys(e);"function"===typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(e).filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.forEach(function(a){n(t,a,e[a])})}return t}function n(t,a,e){return a in t?Object.defineProperty(t,a,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[a]=e,t}var o={data:function(){return{pic_show:!1,loacal_avatarUrl_loc:""}},onLoad:function(){this.loacal_avatarUrl_loc=this.loacal_avatarUrl},computed:s({},(0,i.mapState)(["hasLogin","userInfo","phonenum"])),methods:s({},(0,i.mapMutations)(["login","logout"]),{tap_zhanshang:function(){this.pic_show=!this.pic_show},save_pic:function(){var a=this;t.downloadFile({url:"https://kaikaiomg.applinzi.com/material/image/erweima.jpg",success:function(e){console.log("downloadFile success, res is",e),a.fileSrc=e.tempFilePath,t.saveImageToPhotosAlbum({filePath:e.tempFilePath,success:function(){console.log("save success"),t.showToast({title:"保存成功",duration:1e3}),a.pic_show=!1}})},fail:function(t){console.log("downloadFile fail, err is:",t)}})}})};a.default=o}).call(this,e("649d")["default"])}},[["af94","common/runtime","common/vendor"]]]);