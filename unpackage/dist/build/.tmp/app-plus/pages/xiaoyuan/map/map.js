(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/xiaoyuan/map/map"],{"1a07":function(t,e,i){"use strict";var o=i("6e19"),a=i.n(o);a.a},"42df":function(t,e,i){"use strict";i.r(e);var o=i("ad17"),a=i("5376");for(var n in a)"default"!==n&&function(t){i.d(e,t,function(){return a[t]})}(n);i("1a07");var s=i("2877"),l=Object(s["a"])(a["default"],o["a"],o["b"],!1,null,null,null);l.options.__file="map.vue",e["default"]=l.exports},5376:function(t,e,i){"use strict";i.r(e);var o=i("e88a"),a=i.n(o);for(var n in o)"default"!==n&&function(t){i.d(e,t,function(){return o[t]})}(n);e["default"]=a.a},"6e19":function(t,e,i){},ad17:function(t,e,i){"use strict";var o=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("view",[i("view",{staticStyle:{width:"750rpx","flex-flow":"column"}},[i("view",{staticClass:"width750",style:"height:"+t.height+"px"},[i("map",{attrs:{scale:"17",latitude:t.latitude,longitude:t.longitude,markers:t.covers,controls:t.controls,eventid:"0bcce2a5-0"},on:{controltap:t.tapcontrol,markertap:t.tapmaker,callouttap:t.tapcallout,tap:function(e){t.tap_table()}}})],1),t.show_flag_school?i("view",{staticClass:"show_view"},[t._m(0),t._m(1)]):t._e(),t.show_flag_shuju?i("view",{staticClass:"show_view"},[i("view",{staticStyle:{"padding-left":"80rpx",height:"100%",width:"375rpx","background-color":"white","flex-flow":"column","padding-top":"50rpx"}},[i("view",{staticClass:"icontext",staticStyle:{"font-size":"30rpx","line-height":"70rpx"},attrs:{eventid:"0bcce2a5-1"},on:{click:function(e){t.gotogaojing()}}},[t._v(t._s(t.show_markermessage.title)+"   ")]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"35rpx"}},[t._v("设备编号:   "+t._s(t.show_markermessage.bianhao))]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"35rpx"}},[t._v("提交时间:   "+t._s(t.show_markermessage.time))]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"35rpx"}},[t._v("提交人:   "+t._s(t.show_markermessage.zhuangtai))])]),i("view",{staticStyle:{height:"100%",width:"375rpx","background-color":"white","flex-flow":"column","align-items":"center"}},[i("view",{class:["button_style",t.gaojing_flag?"btn_green":"btn_black"],attrs:{eventid:"0bcce2a5-2"},on:{click:function(e){t.tap_gaojing()}}},[t.gaojing_flag?i("view",{},[t._v("告警")]):t._e(),t.gaojing_flag?i("view",{},[t._v("确认")]):t._e(),t.gaojing_flag?t._e():i("view",{},[t._v("发现")]),t.gaojing_flag?t._e():i("view",{},[t._v("问题")])])])]):t._e(),t.show_menu_flag?i("view",{staticClass:"menu_view"},[i("cover-view",{staticClass:"icontext  dacha_view",attrs:{eventid:"0bcce2a5-3",mpcomid:"0bcce2a5-0"},on:{click:t.show_menu}},[t._v("x")]),i("cover-view",{staticClass:"menu_item_view",attrs:{eventid:"0bcce2a5-4",mpcomid:"0bcce2a5-1"},on:{click:function(e){t.gotourl("../nenghao/nenghao")}}},[t._v("能耗分析")]),i("cover-view",{staticClass:"menu_item_view",attrs:{eventid:"0bcce2a5-5",mpcomid:"0bcce2a5-2"},on:{click:function(e){t.gotourl("../wangluo/wangluo")}}},[t._v("网络分析")]),i("cover-view",{staticClass:"menu_item_view",attrs:{eventid:"0bcce2a5-6",mpcomid:"0bcce2a5-3"},on:{click:function(e){t.gotourl("../gaojing/gaojing?sensor_id=1000&bianhao=全部设备")}}},[t._v("历史告警")])],1):t._e()])])},a=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("view",{staticStyle:{"padding-left":"80rpx",height:"100%",width:"375rpx","background-color":"white","flex-flow":"column"}},[i("view",{staticStyle:{"font-size":"40rpx","line-height":"120rpx"}},[t._v("天翼大学")]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"32rpx"}},[t._v("占地面积（亩）:   3000")]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"32rpx"}},[t._v("建筑面积（㎡）:  132万")]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"32rpx"}},[t._v("学生数量(人)：  35639")]),i("view",{staticStyle:{"font-size":"22rpx","line-height":"32rpx"}},[t._v("教师数量(人)：  2965")])])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("view",{staticStyle:{height:"100%",width:"375rpx","background-color":"white","flex-flow":"column","align-items":"center","justify-content":"center"}},[i("view",{staticClass:"icontext",staticStyle:{"font-size":"80rpx"}},[t._v("")]),i("view",{staticStyle:{"font-size":"23rpx",position:"relative",top:"-14rpx"}},[t._v("0-5℃")]),i("view",{staticStyle:{"font-size":"23rpx",position:"relative",top:"-14rpx"}},[t._v("2019/1/20 周三")])])}];i.d(e,"a",function(){return o}),i.d(e,"b",function(){return a})},aff5:function(t,e,i){"use strict";i("1abb");var o=n(i("b0ce")),a=n(i("42df"));function n(t){return t&&t.__esModule?t:{default:t}}Page((0,o.default)(a.default))},e88a:function(t,e,i){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=n(i("a34a")),a=i("2f62");function n(t){return t&&t.__esModule?t:{default:t}}function s(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},o=Object.keys(i);"function"===typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(i).filter(function(t){return Object.getOwnPropertyDescriptor(i,t).enumerable}))),o.forEach(function(e){l(t,e,i[e])})}return t}function l(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function r(t,e,i,o,a,n,s){try{var l=t[n](s),r=l.value}catch(c){return void i(c)}l.done?e(r):Promise.resolve(r).then(o,a)}function c(t){return function(){var e=this,i=arguments;return new Promise(function(o,a){var n=t.apply(e,i);function s(t){r(n,o,a,s,l,"next",t)}function l(t){r(n,o,a,s,l,"throw",t)}s(void 0)})}}var _={data:function(){return{height:0,show_flag_school:!0,show_flag_shuju:!1,show_menu_flag:!1,show_tubiao_flag:[!1,!1,!1,!1,!1],show_tubiao_flag_warning:[0,0,0,0,0],latitude:31.31601,longitude:121.393402,map_list:[],gaojing_flag:!0,controlflag:[!1,!1,!1,!1,!1,!1],covers:[],show_markermessage:{id:0,title:"",bianhao:"",zhuangtai:"",time:"",state:"",index:0},controls:[],controls_old:[{id:1,position:{left:368,top:10,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/1.png"},{id:2,position:{left:368,top:70,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/2.png"},{id:3,position:{left:368,top:130,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/3.png"},{id:4,position:{left:368,top:190,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/4.png"},{id:5,position:{left:368,top:250,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/5.png"},{id:6,position:{left:368,top:310,width:40,height:40},clickable:!0,iconPath:"../../../static/tianyi/6.png"}]}},onLoad:function(){var e=c(o.default.mark(function e(){var i;return o.default.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return this.height=t.getSystemInfoSync().windowHeight-t.getSystemInfoSync().windowWidth/750*320,i={form:"get_map_list"},e.next=4,this.download_from_server(i,"map_list");case 4:this.deal_width_covers();case 5:case"end":return e.stop()}},e,this)}));function i(){return e.apply(this,arguments)}return i}(),computed:s({},(0,a.mapState)(["hasLogin","userInfo","phonenum","openid"])),methods:{gotourl:function(e){t.navigateTo({url:e})},deal_width_covers:function(){var t=this;t.covers=[],t.show_tubiao_flag_warning=[0,0,0,0,0];for(var e=0;e<t.map_list.length;e++)(t.show_tubiao_flag[0]&&100001==t.map_list[e].SENSORTYPE_ID||t.show_tubiao_flag[1]&&100002==t.map_list[e].SENSORTYPE_ID||t.show_tubiao_flag[2]&&100003==t.map_list[e].SENSORTYPE_ID||t.show_tubiao_flag[3]&&100004==t.map_list[e].SENSORTYPE_ID||t.show_tubiao_flag[4]&&100005==t.map_list[e].SENSORTYPE_ID)&&t.covers.push({id:t.map_list[e].ID,latitude:t.map_list[e].LATITUDE,longitude:t.map_list[e].LONGITUDE,iconPath:"../../../static/tianyi/"+("告警"==t.map_list[e].state?"1":"")+t.map_list[e].SENSORTYPE_ID+".png",label:{borderRadius:3,bgColor:"rgba(255,255,255,0.2)",content:t.map_list[e].NAME,padding:3}}),"告警"==t.map_list[e].state&&100001==t.map_list[e].SENSORTYPE_ID&&(t.show_tubiao_flag_warning[0]+=1),"告警"==t.map_list[e].state&&100002==t.map_list[e].SENSORTYPE_ID&&(t.show_tubiao_flag_warning[1]+=1),"告警"==t.map_list[e].state&&100003==t.map_list[e].SENSORTYPE_ID&&(t.show_tubiao_flag_warning[2]+=1),"告警"==t.map_list[e].state&&100004==t.map_list[e].SENSORTYPE_ID&&(t.show_tubiao_flag_warning[3]+=1),"告警"==t.map_list[e].state&&100005==t.map_list[e].SENSORTYPE_ID&&(t.show_tubiao_flag_warning[4]+=1);var i=t.controls_old.concat();for(e=0;e<5;e++)i.push({id:7+Number(e),position:{left:388,top:8+60*e,width:18,height:18},clickable:!1,iconPath:"../../../static/tianyi/5"+t.show_tubiao_flag_warning[e]+".png"});t.controls=i,console.log(t.controls)},show_message:function(t){console.log(t)},tapmaker:function(e){var i=this;console.log(e.mp.markerId);for(var o=0;o<i.map_list.length;o++)i.map_list[o].ID==e.mp.markerId&&(i.show_markermessage.title=i.map_list[o].ASSEMBLENAME,i.show_markermessage.bianhao=i.map_list[o].ASSEMBLECODE,i.show_markermessage.zhuangtai=i.map_list[o].EDITER,i.show_markermessage.time=i.map_list[o].EDITDATE,i.show_markermessage.id=i.map_list[o].ID,i.show_markermessage.state=i.map_list[o].state,i.show_markermessage.index=o);this.height=t.getSystemInfoSync().windowHeight-t.getSystemInfoSync().windowWidth/750*320,this.show_flag_school=!1,this.show_flag_shuju=!0,this.gaojing_flag="告警"==i.show_markermessage.state},show_menu:function(){this.show_menu_flag=!this.show_menu_flag,this.height=t.getSystemInfoSync().windowHeight,this.show_flag_school=!1,this.show_flag_shuju=!1,this.$forceUpdate()},tapcontrol:function(t){console.log(t),console.log(this.controlflag[Number(t.mp.controlId)-1]),Number(t.mp.controlId)<6&&(this.controlflag[Number(t.mp.controlId)-1]?(this.controlflag[Number(t.mp.controlId)-1]=!1,this.show_tubiao_flag[Number(t.mp.controlId)-1]=!1,this.deal_width_covers(),this.controls[t.mp.controlId-1].iconPath="../../../static/tianyi/"+t.mp.controlId+".png"):(this.controlflag[Number(t.mp.controlId)-1]=!0,this.show_tubiao_flag[Number(t.mp.controlId)-1]=!0,this.deal_width_covers(),this.controls[t.mp.controlId-1].iconPath="../../../static/tianyi/1"+t.mp.controlId+".png")),6==Number(t.mp.controlId)&&(console.log("yes"),this.show_menu())},gotogaojing:function(){t.navigateTo({url:"../gaojing/gaojing?sensor_id="+this.show_markermessage.id+"&bianhao="+this.show_markermessage.bianhao})},tap_gaojing:function(){var e=this;e.gaojing_flag?(e.map_list[e.show_markermessage.index].state="正常",e.deal_width_covers(),e.upload_to_server({form:"check_warning",nickName:e.userInfo.nickName,phonenum:e.phonenum,openid:e.openid,sensor_id:e.show_markermessage.id}),t.showLoading({title:"上传中。。。"}),setTimeout(function(){t.hideLoading(),e.gaojing_flag=!e.gaojing_flag},1200)):t.showModal({content:"确定要提交问题吗？",complete:function(){e.map_list[e.show_markermessage.index].state="告警",e.deal_width_covers(),e.upload_to_server({form:"find_warning",nickName:e.userInfo.nickName,phonenum:e.phonenum,openid:e.openid,sensor_id:e.show_markermessage.id}),e.gaojing_flag=!e.gaojing_flag}})},tap_table:function(){this.height=t.getSystemInfoSync().windowHeight,this.show_flag_school=!1,this.show_flag_shuju=!1}}};e.default=_}).call(this,i("649d")["default"])}},[["aff5","common/runtime","common/vendor"]]]);