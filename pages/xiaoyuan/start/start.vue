<template>
	<view style="flex-flow: column nowrap;width: 750upx; position: relative;">

		<image class="bac_image" src="http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/dengru.png" :style="'height:'+windowHeight+'px'"></image>

                                     

	   <view class="" style="position: absolute;top: 250upx; justify-content: center;align-items: center; width: 750upx;">
		
			<view class="" style="font-size: 70upx;font-family:KaiTi;color: yellow;">
				天翼大学
			</view>
	
		</view>




		<view class="" style="position: absolute;top: 550upx; justify-content: center;align-items: center; width: 750upx;">
		
			<navigator url="../xiaoyuan_login/xiaoyuan_login" class="button_style2 icontext">&#xe642;&nbsp; &nbsp;手机登陆</navigator>
	
		</view>


		<view class="" style="position: absolute;top: 750upx; justify-content: center;align-items: center; width: 750upx;">
		
			<button type="primary" open-type="getUserInfo" @getuserinfo="wxGetUserInfo" class="button_style icontext">&#xe7e5;&nbsp;&nbsp; 微信登陆</button>
	
		</view>
	




	</view>

</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				fileSrc: "",
				savedFilePath: "",
				// jsondata: null
				ifallowgotohot: false,
				windowHeight: null,
				finish_task: 0,


			}
		},
		onLoad: async function(option) {
			var that = this;
			that.windowHeight = uni.getSystemInfoSync().windowHeight
		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum', 'openid'])
		},
		methods: {
			...mapMutations(['login', 'logout', 'setopenid', 'setluyouData','setphonenum']),
			wxGetUserInfo: function(e) {

				var that = this;
				console.log(e.detail.userInfo)
				if (e.detail.userInfo) {
					// 发送 res.code 到后台换取 openId, sessionKey, unionId
					uni.login({
						provider: 'weixin',
						success: function(loginRes) {
							// that.get_access_token(loginRes.code);

							console.log("code:", loginRes.code);
							that.upload_oauthData(e.detail.userInfo, loginRes.code)
							that.login(e.detail.userInfo, loginRes.code)
							uni.reLaunch({
								url: "../map/map"
							})
						}

					})
				} else {
					console.log(333, '执行到这里，说明拒绝了授权')
					uni.showToast({
						title: "为了您更好的体验,请先同意授权",
						icon: 'none',
						duration: 2000,

					});
				}

			},


		
			upload_oauthData(userInfo, code) {
				var that = this;
				uni.request({
					url: 'https://kaikaiomg.applinzi.com/uni_app_upload.php',
					method: "POST",
					data: {
						'form': 'oauthData',
						'nickName': userInfo.nickName,
						'avatarUrl': userInfo.avatarUrl,
						'city': userInfo.city,
						'country': userInfo.country,
						'gender': userInfo.gender,
						'language': userInfo.language,
						'province': userInfo.province,
						'code': code,
					},
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					success: (ret) => {
						if (ret.statusCode !== 200) {
							console.log("请求失败:", ret)
						} else {
							console.log("success_uodate_oauthData:", ret.data)
							console.log("success_uodate_oauthData:", ret.data.openid)
							that.setopenid(ret.data.openid)
						}
					},
				})
			},

			
	



		}
	}
</script>

<style>
	.bac_image {
		width: 750upx;

	}

	.progress_style {
		z-index: 20;
		height: 50upx;
		width: 400upx;
		padding-left: 33upx;
	}

	.button_style {

		border-radius: 12upx;
		background-color: #71C671;
		width: 400upx;
		height: 80upx;
		line-height: 80upx;
		font-size: 34upx;
		text-align: center;
		justify-content: center;

	}
	.button_style2 {
	
		border-radius: 12upx;
		background-color: LightSeaGreen;
		color: white;
		width: 400upx;
		height: 80upx;
		line-height: 80upx;
		font-size: 34upx;
		text-align: center;
		justify-content: center;
	
	}
</style>
