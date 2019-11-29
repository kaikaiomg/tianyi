<template>
	<view class="">
		<view class="footer" :style="'bottom:'+win_bottom+'px'">
			<view class="footer-left">
				<!-- 	<view class="uni-icon uni-icon-mic" @tap="startRecognize"> </view> -->
				<view class="icontext" @tap="getmodify">&#xe62f;</view>

			</view>
			<view class="footer-center">
				<input class="input-text" @focus="focus_fuc" @blur="tap_table" type="text" v-model="inputValue"></input>
				<!-- <view class="icontext xiaolianview" @click="tap_biaoqing">&#xe614;</view> -->
				<view class="xiaolianview" @click="tap_biaoqing">
					<image :src="image_biaoqing_url" style="width: 30upx;height: 30upx;"></image>
				</view>
			</view>
			<view class="footer-right" @tap="sendMessge">
				<view id='msg-type'>发送</view>
			</view>
		</view>
		<view class="select_view border-style" v-if="select_view_flag" :style="'bottom:'+win_bottom_2+'px'">
			<view v-if="ziduanmodifyflag" class="select_view_item">
				<navigator :url="'../card_page/item_detail/item_detail?new_item_flag=true&data={}&card_id='+card_id">新建子项</navigator>
			</view>
			<view v-if="!ziduanmodifyflag" class="select_view_item grey">新建子项</view>
			<view class="" style="width: 60%;margin-left: 20%;	border-bottom: #000000 solid 1px;"></view>
			<view v-if="ziduanmodifyflag" class="select_view_item">
				<navigator :url="'../card_page/item_new_ziduan/item_new_ziduan?card_id='+card_id">新增显示字段</navigator>
			</view>
			<view v-if="!ziduanmodifyflag" class="select_view_item grey"> 新增显示字段</view>
			<view class="" style="width: 60%;margin-left: 20%;	border-bottom: #000000 solid 1px;"></view>
			<view class="select_view_item">
				<navigator :url="'../card_page/item_question/item_question?card_id='+card_id">建议/总结</navigator>
			</view>
		</view>

		<view class="biaoqing_view border-style" v-if="select_biaoqing_flag" :style="'bottom:'+win_bottom_2+'px'">
			<image class="image_view" :src="image_select=='1' ? '../../static/z1.png':'../../static/1.png' " @click="tap_bqImage('1')"></image>
			<image class="image_view" :src="image_select=='2'  ? '../../static/z2.png':'../../static/2.png' " @click="tap_bqImage('2')"></image>
			<image class="image_view" :src="image_select=='3'  ? '../../static/z3.png':'../../static/3.png' " @click="tap_bqImage('3')"></image>
			<image class="image_view" :src="image_select=='14'  ? '../../static/z14.png':'../../static/14.png' " @click="tap_bqImage('14')"></image>
			<image class="image_view" :src="image_select=='15'  ? '../../static/z15.png':'../../static/15.png' " @click="tap_bqImage('15')"></image>
			<image class="image_view" :src="image_select=='16'  ? '../../static/z16.png':'../../static/16.png' " @click="tap_bqImage('16')"></image>

		</view>





	</view>




</template>

<script>
	export default {
		name: "chat-input",
		data() {
			return {
				inputValue: '',
				win_bottom: 0,
				win_bottom_2: 60,
				select_view_flag: false,
				select_biaoqing_flag: false,
				image_select: 0,
				image_biaoqing_url: '../../static/1.png',
			}
		},
		props: {
			ziduanmodifyflag: true,
			taptablefuc: true,
		},
		watch: {
			taptablefuc: function(newName) {
				this.select_biaoqing_flag = false;
				this.select_view_flag = false;
				this.win_bottom = 0;
				this.win_bottom_2 = 60
				console.log('tap_table')
			}
		},

		methods: {

			tap_bqImage(imagenum) {
				var that = this;
				this.image_select = imagenum;
				this.image_biaoqing_url = '../../static/z' + imagenum + '.png'
				setTimeout(function() {
					that.select_biaoqing_flag = false;
				}, 500)
				this.$emit('biaoQingSelect', imagenum);
			},
			tap_table() {
				
			},

			getmodify() {
				this.select_biaoqing_flag = false;
				if (this.win_bottom == 0) {
					this.win_bottom_2 = 60;
				} else {
					this.win_bottom_2 = this.win_bottom + 60
				}
				this.select_view_flag = !this.select_view_flag;
				console.log('getmodify')
			},
			tap_biaoqing() {
				this.select_view_flag = false;
				if (this.win_bottom == 0) {
					this.win_bottom_2 = 60;
				} else {
					this.win_bottom_2 = this.win_bottom + 60
				}
				this.select_biaoqing_flag = !this.select_biaoqing_flag;
			},

			focus_fuc() {
				this.select_biaoqing_flag = false;
				this.select_view_flag = false;
				var that = this;
				console.log("抬高高")
				setTimeout(() => this.win_bottom = uni.getSystemInfoSync().windowHeight / 11, 400)

			},





			sendMessge: function() {
				var that = this;
				if (that.inputValue.trim() == '') {

					that.inputValue = '';
				} else {
					//点击发送按钮时，通知父组件用户输入的内容
					this.$emit('send-message', {
						type: 'text',
						content: that.inputValue
					});
					that.inputValue = '';
				}
			},
			modify: function() {
				this.$emit('tap-modify', {});

			},




		}
	}
</script>

<style>
	.footer {
		position: fixed;
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 80upx;
		min-height: 80upx;
		border-top: solid 1px #bbb;
		overflow: hidden;
		padding: 5upx;
		background-color: #fafafa;
	}

	.footer-left {

		width: 80upx;
		height: 80upx;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.footer-right {
		width: 120upx;
		height: 80upx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #1482D1;
	}

	.footer-center {
		flex: 1;
		width: 550upx;
		height: 80upx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.footer-center .input-text {

		width: 90%;
		background: #EFEFEF;
		padding: 0upx 10upx;
		font-family: verdana !important;
		overflow: hidden;
		height: 60upx;
		line-height: 60upx;
		font-size: 23upx;
		border-left: solid 1upx #ddd;
		border-right: solid 0upx #ddd;
		border-top: solid 1upx #ddd;
		border-bottom: solid 1upx #ddd;
		border-top-left-radius: 15upx;
		border-bottom-left-radius: 15upx;
		border-top-right-radius: 0upx;
		border-bottom-right-radius: 0upx;
	}

	.xiaolianview {

		width: 10%;
		height: 60upx;
		line-height: 60upx;
		background: #EFEFEF;
		justify-content: center;
		align-items: center;
		border-left: solid 0upx #ddd;
		border-right: solid 1upx #ddd;
		border-top: solid 1upx #ddd;
		border-bottom: solid 1upx #ddd;
		border-top-left-radius: 0upx;
		border-bottom-left-radius: 0upx;
		border-top-right-radius: 15upx;
		border-bottom-right-radius: 15upx;

		color: #666666;
	}

	.select_view {
		position: fixed;
		flex-flow: column;
		width: 300upx;
		height: 180upx;
		min-height: 180upx;
		left: 20upx;
		/* bottom: 100upx; */
		overflow: hidden;
		border-radius: 20upx;
		background-color: #F5F5F5;
		z-index: 10;

	}

	.select_view_item {
		width: 100%upx;
		height: 60upx;
		padding: 10upx;
		font-size: 30upx;
		justify-content: center;
		align-content: center;
	}

	.biaoqing_view {
		position: fixed;
		flex-flow: row;
		width: 600upx;
		height: 100upx;
		left: 70upx;
		/* bottom: 100upx; */
		overflow: hidden;
		border-radius: 20upx;
		background-color: white;
		justify-content: space-between;
		padding: 10upx;
		align-items: center;
		z-index: 10;
	}

	.image_view {

		height: 74upx;
		width: 74upx;
	}


	.foot {

		width: 100%;
		height: 90upx;
		min-height: 90upx;
		left: 0upx;
		overflow: hidden;
	}
</style>
