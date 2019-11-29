<template>
	<form class='loginView' @submit="login">
		<view class="input-view">
			<view class="label-view ">
				<text class="label icontext">&#xe642;</text>
			</view>
			<input class="input" type="text" v-model="phonenum_local"  placeholder="请输入手机号" name="phoneValue" />
		</view>
		<view class="input-view ">
			<view class="label-view icontext">
				<text class="label">&#xe664;</text>
			</view>
			<input class="input" type="password" v-model="yanzhengma" hover-class="hover"   placeholder="请输验证码" name="passwordValue" />
			<button class="button_right" type="primary"   @click="givemessage">{{yanzhengma_title}}</button>
		</view>
		<view class="button-view">
			<button type="" class="denglu" hover-class="hover" formType="submit">登入</button>

		</view>
		<view class="oauth-row" v-if="hasLogin" v-bind:style="{top: positionTop + 'px'}">
			<!-- 	<view class="oauth-image" v-for="provider in providerList" :key="provider.value">
				<image :src="provider.image" @tap="oauth(provider.value)"></image>
			</view> -->
			<!-- <button open-type="getUserInfo" lang="zh_CN" bindgetuserinfo="upload_oauthData_post">获取用户信息</button> -->
			<!-- <button type="primary" @click="upload_oauthData_post">获取用户信息</button> -->
		</view>

	</form>
</template>

<script>
	// import service from '../../service.js';
	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		data() {
			return {
                phonenum_local:"",
                yanzhengma:"",
                yanzhengma_title: '获取验证码',
                randnum:"",
                return_message:"",
                wait: 60,

				providerList: [],
				hasProvider: false,
				positionTop: 0,
                enable_get:true,
			}
		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum','openid'])
		},
		methods: {
			...mapMutations(['login', 'logout','setphonenum',]),


			givemessage() {
				var that = this;
				if (!(/^1[34578]\d{9}$/.test(that.phonenum_local)) && that.enable_get) {
					uni.showToast({
						icon: "none",
						title: "请正确输入手机号"
					})
				} else if (that.enable_get) {
					console.log(that.yanzhengma)
					that.enable_get = false;
					that.time();
					that.randnum = Math.floor(Math.random() * 90000) + 100000;
					console.log("随机码：",that.randnum)
					uni.request({
						url: 'https://imlaixin.cn/Api/send/data/json?accesskey=5914&secretkey=4bef93ce3f102e2f51fc7d11f46411472c98927b&mobile=' +
							that.phonenum_local + '&content=' +
							'【天翼大学】您注册的手机验证码为' + that.randnum + ',30分种有效，只能输入1次，若30分种内未输入，需要重新获取。验证码转发无效。',
						method: "GET",
						success: (ret) => {
							if (ret.statusCode !== 200) {
								console.log("请求失败:", ret)
							} else {
								uni.showToast({
									icon: "none",
									title: "发送成功"
								})
								console.log("发送短信成功", ret.data)
								that.return_message = ret.data.data;
							}
						}
					});
				}
			},
			login(e) {
				var that = this;
			   	console.log("得到账号:" + e.detail.value.phoneValue + ';得到密码:' + e.detail.value.passwordValue)
				if (!(/^1[34578]\d{9}$/.test(that.phonenum_local))) {
					console.log(that.phonenum_local)
					uni.showToast({
						icon: "none",
						title: "请正确输入手机号"
					})
				} 
				else if (that.randnum != that.yanzhengma) {
					uni.showToast({
						icon: "none",
						title: "请正确输入验证码"
					})
				} 
				else {
					console.log("手机号验证成功");
					// that.upload_oauthData(that.userInfo,that.phonenum_local)
					that.setphonenum(that.phonenum_local);
					uni.reLaunch({
						url: "../map/map",
					});
					
					
// 					uni.setStorage({
// 						key: 'phonenumber',
// 						data: that.phonenum_local,
// 						success: function() {
// 							console.log('setdata_success:' + 'phonenumber');
// 						}
// 					});
				}
				
			},

	        time() {
				var that = this;
				if (that.wait == 0) {
					that.enable_get = true;
					that.yanzhengma_title = '获取验证码';
					that.wait = 60;
				} else {
					that.enable_get = false;
					that.yanzhengma_title = that.wait + "s";
					// that.yanzhengma = '';
					that.wait--
					setTimeout(function() {
						that.time()
					}, 1000)
				}
			},





             upload_oauthData(userInfo,phonenum) {
				 var that = this;
				 console.log(that.openid)
				uni.request({
					url: 'https://kaikaiomg.applinzi.com/uni_app_upload.php',
					method: "POST",
					data: {
						'form': 'oauthData_phone',
						'nickName': userInfo.nickName,
						'avatarUrl': userInfo.avatarUrl,
						'city': userInfo.city,
						'country': userInfo.country,
						'gender': userInfo.gender,
						'language': userInfo.language,
						'province': userInfo.province,
						'phonenum': phonenum,
						'openid':that.openid,
					},
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					success: (ret) => {
						if (ret.statusCode !== 200) {
							console.log("请求失败:", ret)
						} else {
							console.log("success_uodate_oauthData_phone:", ret.data)

						}
					},
				})
			},




		},



		onLoad() {
	
		}
	}
</script>

<style>
	.loginView {
		display: flex;
		flex: 1;
		flex-direction: column;
		width: 750px;
		padding-top: 30px;
	}

	.input-view {
		border-bottom-style: solid;
		border-bottom-width: 3px;
		border-bottom-color: #ddd;
		background-color: #fff;
		flex-direction: row;
		width: 750px;
		padding: 20px 20px;
		box-sizing: border-box;
	}

	.label-view {
		width: 100px;
		height: 60px;
		align-items: center;
		margin-right: 30px;
	}

	.label {
		flex: 1;
		line-height: 60px;
		font-size: 38px;
		color: #555;
		text-align: left;
	}

	.input {
		flex: 1;
		height: 60px;
		font-size: 38px;
		align-items: center;
	}

	.button-view {
		width: 750px;
		margin-top: 50px;
		padding: 0 20px;
		box-sizing: border-box;
		flex-direction: column;
	}

	.button_right {
		width: 220px;
		font-size: 30px;
		border: 1px, solid;
	}

	.oauth-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	.oauth-image {
		width: 100px;
		height: 100px;
		border: 1px solid #dddddd;
		border-radius: 100px;
		margin: 0 40px;
		background-color: #ffffff;
	}

	.oauth-image image {
		width: 60px;
		height: 60px;
		margin: 20px;
	}
	
	
	
	.denglu{
		width: 700upx;
		background-color: #007AFF;
	}
	

	
	.hover {
		opacity: 0.6;
	}
	
	
</style>
