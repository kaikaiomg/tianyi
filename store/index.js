import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		loginProvider: "weixin",
		openid: null,

		phonenum: null,
		realname: "",

		userInfo: {
			nickName: "",
			avatarUrl: "",
		},

		luyouData:[],
		
	},
	mutations: {
		login(state, userInfo) {
			state.hasLogin = true;
			state.loginProvider = "weixin";
			state.userInfo = userInfo;
			// 			state.nickName = userInfo.nickName;
			//             state.openid = userInfo.openId;
			// 			state.avatarUrl = userInfo.avatarUrl;

		},
		logout(state) {
			state.hasLogin = false
			state.openid = null;
			state.phonenum = null;
			state.userInfo = {nickName: "",avatarUrl: "",	};

		},

		
		
		setphonenum(state, phonenum) {
			state.phonenum = phonenum
		},
		setopenid(state, openid) {
			state.openid = openid;
		},
		setluyouData(state, luyouData) {
			state.luyouData = luyouData;
		},
		
		
	},
	actions: {

	}

})

export default store
