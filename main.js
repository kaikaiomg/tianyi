import Vue from 'vue'
import App from './App'
import store from './store'
Vue.config.productionTip = false
Vue.prototype.$store = store


// import handleview from '/components/handleview.vue' 
// Vue.component('hand-head',handleview)


Vue.prototype.loacal_avatarUrl = "../../static/logo.png";
Vue.prototype.picview_before_title = "http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/";
Vue.prototype.pic_before_title = "http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/card_pic/";
Vue.prototype.big_field_list = ['待选', '未来', '金融', '人口', '行业', '管理', '地理', '娱乐'];
Vue.prototype.radio_list = ['地图类', '结构类', '排行类', '时序类', '版图类', '折线图'];
// Vue.prototype.luyouData = [];


Vue.prototype.get_hot_card_list = function() {
	var that = this;
	return new Promise((res) => {
		uni.getStorage({
			key: 'hot_card_list',
			success: function(res1) {
				that.luyouData = res1.data.data;
				res('ss');
			},
		});
	})
};

Vue.prototype.get_hot_card_list_ziduan = function() {
	var that = this;
	return new Promise((res) => {
		uni.getStorage({
			key: 'app_hot_list_ziduan',
			success: function(res1) {
				that.luyouData_ziduan = res1.data.data;
				res('ss');
			},
		});
	})
};


Vue.prototype.share = function() {
	console.log('fenxiang')
	uni.share({
		provider: 'weixin',
		type: 5,
		imageUrl: 'https://img-cdn-qiniu.dcloud.net.cn/uniapp/app/share-logo@3.png',
		title: '欢迎体验uniapp',
		miniProgram: {
			id: 'gh_abcdefg',
			path: 'pages/index/index',
			type: 0,
			webUrl: 'http://uniapp.dcloud.io'
		},
		success: ret => {
			console.log(JSON.stringify(ret));
		}
	});
};

Vue.prototype.upload_to_server = function(post_data) {
	uni.request({
		url: "https://kaikaiomg.applinzi.com/uni_app_upload.php",
		method: "POST",
		data: post_data,
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		success: (ret) => {
			if (ret.statusCode !== 200) {
				console.log("请求失败:", ret)
			} else {
				console.log("上传成功-上传:", post_data)
				console.log("上传成功-回复:", ret.data)
			}
		}
	});
};
Vue.prototype.download_from_server = function(post_data, data_title) {
	return new Promise((res) => {
		uni.request({
			url: 'https://kaikaiomg.applinzi.com/uni_app_download.php',
			method: "POST",
			data: post_data,
			header: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			success: (ret) => {
				if (ret.statusCode !== 200) {
					console.log("请求失败:", ret)
					res('ff');
				} else {
					console.log("取数成功—上传:", post_data)
					console.log("取数成功-数据:", ret.data)
					this[data_title] = ret.data.data;
					res('ss');
				}
			}
		});
	})
};

Vue.prototype.uploadFile_image = function(image_name, pic_filePath) {
	const uploadTask = uni.uploadFile({
		url: 'https://kaikaiomg.applinzi.com/uni_app_upload_image.php',
		filePath: pic_filePath,
		name: "myfile",
		formData: {
			'form': 'image_upload',
			'image_name': image_name,
		},
		success: (uploadFileRes) => {
			console.log(uploadFileRes.data);
		}
	});

};






























App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
