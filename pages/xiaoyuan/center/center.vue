<template>
	<view class="center">
		<view v-if="pic_show" style="width: 750upx;height: 100%;margin: auto;  background-color: rgba(0,0,0,0.2);position: fixed;top: 0upx;z-index: 10; ; ">
			<view class="dianzhan_view">
				<view class="icontext" @click="tap_zhanshang" style="position: absolute;top: 15upx;right: 15upx;color: black;font-size: 30upx;">
					&#xe711;
				</view>
				<image class="" src='../../../static/erweima.png' style="width: 100%;height: 400upx;">
				</image>
				<view class="" style="width: 100%;height: 100upx;justify-content: center;align-items: center;font-size: 30upx;"
				 @click="save_pic">
					保存到相册
				</view>
			</view>
		</view>

		<view class="logo">
			<image class="logo-img" :src="hasLogin ? userInfo.avatarUrl :loacal_avatarUrl_loc"></image>
			<view class="logo-title">
				<text class="uer-name">Hi，{{hasLogin ? userInfo.nickName : '您未登录'}}</text>·
				<text class="go-login navigat-arrow" v-if="!hasLogin">&#xe60e;</text>
			</view>
		</view>
		




		<view class="center-list">
			<view class="center-list-item border-bottom" v-if="!phonenum" >
				<text class="list-icon">&#xe642;</text>
				<text class="list-text">绑定手机号</text>
		        <navigator class="navigat-arrow" url="../xiaoyuan_login/xiaoyuan_login">&#xe60e;</navigator>
				
			</view>
			<!-- 	<view class="center-list-item border-bottom">
			<text class="list-icon">&#xe601;</text>
			<text class="list-text">设置</text>
			<text class="navigat-arrow">&#xe60e;</text>
		</view> -->
		</view>
		<view class="center-list">
			<view class="center-list-item border-bottom">
				<text class="list-icon">&#xe608;</text>
				<text class="list-text">代办箱</text>
				
				<navigator class="navigat-arrow" >&#xe60e;</navigator>
			</view>
			<view class="center-list-item border-bottom">
				<text class="list-icon">&#xe6e4;</text>
				<text class="list-text">个人信息</text>
				
			    <navigator class="navigat-arrow" >&#xe60e;</navigator>
			</view>


		</view>

		<view class="center-list">
			<view class="center-list-item border-bottom" >
				<text class="list-icon">&#xe612;</text>
				<text class="list-text">关于</text>
				<navigator class="navigat-arrow" url="../jieshao/jieshao">&#xe60e;</navigator>
			</view>
			<view class="center-list-item border-bottom" @click="tap_zhanshang">
				<text class="list-icon">&#xe60c;</text>
				<text class="list-text">支持</text>
				<text class="navigat-arrow">&#xe60e;</text>
			</view>

		</view>

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
				pic_show: false,
				// loacal_avatarUrl_loc: "../../static/logo.png",
				loacal_avatarUrl_loc: "",
				// uerInfo:{}
			}
		},
		onLoad() {
			this.loacal_avatarUrl_loc = this.loacal_avatarUrl
		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum'])
		},
		methods: {
			...mapMutations(['login', 'logout']),

			tap_zhanshang() {
				this.pic_show = !this.pic_show;
			},
			save_pic() {
				var that = this;
				uni.downloadFile({
					url: "https://kaikaiomg.applinzi.com/material/image/erweima.jpg",
					success: (res) => {
						console.log('downloadFile success, res is', res)
						that.fileSrc = res.tempFilePath;
						uni.saveImageToPhotosAlbum({
							// filePath: "../../static/erweima.jpg",
							filePath: res.tempFilePath,
							success: function() {
								console.log('save success');
								uni.showToast({
									title: "保存成功",
									duration: 1000
								})

								that.pic_show = false;


							}
						});
					},
					fail: (err) => {
						console.log('downloadFile fail, err is:', err)
					}
				});




			},


		


		}
	}
</script>

<style>
	/* 个人中心 */

	.center {
		flex-direction: column;
	}

	.logo {
		width: 750px;
		height: 220px;
		padding: 20px 30upx;
		box-sizing: border-box;
		background-color: #4169E1;
		flex-direction: row;
		align-items: center;
	}

	.logo-hover {
		opacity: 0.8;
	}

	.logo-img {
		width: 140px;
		height: 140px;
		border-radius: 140px;
	}

	.logo-title {
		height: 150px;
		flex: 1;
		align-items: center;
		justify-content: space-between;
		flex-direction: row;
		margin-left: 20px;
	}

	.uer-name {
		height: 60px;
		line-height: 60px;
		font-size: 38px;
		color: #FFFFFF;
	}

	.go-login.navigat-arrow {
		font-size: 38px;
		color: #FFFFFF;
	}

	.login-title {
		height: 150px;
		align-items: self-start;
		justify-content: center;
		flex-direction: column;
		margin-left: 20px;
	}

	.center-list {
		background-color: #FFFFFF;
		margin-top: 20px;
		width: 750px;
		flex-direction: column;
	}

	.center-list-item {
		height: 90px;
		width: 750px;
		box-sizing: border-box;
		flex-direction: row;
		padding: 0px 20px;
	}

	.border-bottom {
		border-bottom-width: 1px;
		border-color: #c8c7cc;
		border-bottom-style: solid;
	}

	.list-icon {
		width: 40px;
		height: 90px;
		line-height: 90px;
		font-size: 34px;
		color: #4169E1;
		text-align: center;
		font-family: texticons;
		margin-right: 20px;
	}

	.list-text {
		height: 90px;
		line-height: 90px;
		font-size: 34px;
		color: #555;
		flex: 1;
		text-align: left;
	}

	.navigat-arrow {
		height: 90px;
		width: 40px;
		line-height: 90px;
		font-size: 34px;
		color: #555;
		text-align: right;
		font-family: texticons;
	}

	.dianzhan_view {
		animation: dianzhan_ani 0.3s ease-out;
		border-radius: 10upx;
		width: 550upx;
		height: 500upx;
		margin: 300upx auto;
		position: relative;
		background-color: white;
		flex-flow: column;
	}

	@keyframes dianzhan_ani {
		from {
			margin: 200upx auto;
			width: 750upx;
			height: 500upx
		}

		to {
			margin: 300upx auto;
			width: 550upx;
			height: 500upx;
		}
	}
</style>
