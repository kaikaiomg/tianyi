<template>
	<view class="" style="flex-flow: column nowrap;width: 750upx; ">

		<view class="" style="width: 750upx;height: 160upx;padding-left: 60upx; flex-flow: column;">
			<view class="" style="font-size: 50upx;line-height:100upx ;">告警历史</view>
			<view class="" style="font-size: 22upx;line-height:30upx ;">编号：{{bianhao}}</view>
		</view>
		<view class="rank_title_view">
			<view class="rank_title rank_title_name_view" v-for="(item,index) in  rank['rank_title_show']" :key="index" :style="'width:'+width+'px'">
				{{rank['rank_title_show'][index]}}
			</view>
		</view>
		<scroll-view scroll-y class="jichukuangjia" :style="'height:'+height+'px'  " v-show="current === 0" @scroll="scroll">




			<view class="" v-for="(item1,index1) in  data_list_xiazai" :key="index1" style=" height: 50upx; flex-flow: row nowrap;">
				<view :class="['rank_title',index1%2==0 ? 'dark_bacgound' : 'grey_bacgound']" :style="'width:'+width+'px'">{{index1+1}}</view>
				<view :class="['rank_title',index1%2==0 ? 'dark_bacgound' : 'grey_bacgound']" v-for="(item2,index2) in  rank['rank_title_name_show']"
				 :key="index2" :style="'width:'+width+'px'">
					{{data_list_xiazai[index1][rank['rank_title_name_show'][index2]]}}
				</view>
			</view>

		</scroll-view>


	</view>
</template>

<script>
	export default {
		data() {
			return {
				sensor_id: "",
				bianhao: "",
				list_id: null,
				fix_title: false,
				height: 0,
				width: 0,
				minheight: 0,
				current: 0,
				data_list: [],
				data_list_xiazai: [],

				rank: {
					'rank_title': [],
					'rank_title_show': ['序号', '告警时间', '状态', '处理人', '手机号'],
					'rank_title_name_show': ['time', 'state', 'xiugai_name', 'phone_num'],
				},
			}
		},

		onLoad: async function(option) {
			this.sensor_id = option.sensor_id;
			this.bianhao = option.bianhao;
			this.minheight = 150 * (uni.getSystemInfoSync().windowWidth / 750);
			this.height = uni.getSystemInfoSync().windowHeight - 340 * (uni.getSystemInfoSync().windowWidth / 750);
			this.width = (700 / this.rank['rank_title_show'].length) * (uni.getSystemInfoSync().windowWidth / 750);
			setTimeout(() => this.getData_list(), 500);
		},

		methods: {
			scroll(e) {
				if (Number(e.detail.scrollTop) > this.minheight) {
					this.fix_title = true;
				} else {
					this.fix_title = false;
				}
			},

			// 			tap_item: function(item3) {
			// 				uni.navigateTo({
			// 					url: "../item_detail/item_detail?data=" + JSON.stringify(item3) + "&card_id=" + this.luyouData[this.list_id].card_id,
			// 				})
			// 			},

			getData_list() {
				var that = this;
				uni.request({
					url: 'https://kaikaiomg.applinzi.com/uni_app_download.php',
					method: "POST",
					data: {
						'sensor_id': this.sensor_id,
						'form': "tianyi_builder_gaojing",
					},
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					success: (ret) => {
						if (ret.statusCode !== 200) {
							console.log("请求失败:", ret)

						} else {
							console.log("下载数据:", ret.data)
							this.data_list_xiazai = ret.data.data;
						}
					}
				});
			},

		}
	}
</script>

<style>
	.rank_title_name_view {
		background-color: #222222;
		color: white;
		font-size: 22upx;
		font-weight: bold;
	}

	.rank_title {
		line-height: 50upx;
		align-content: center;
		justify-content: center;
		font-size: 20upx;
		overflow: hidden;
	}

	.rank_title_view {
		/* 	width: 710upx; */
		height: 50upx;
		margin-left: 25upx;
		flex-flow: row nowrap;
		background-color: #EEEEEE;
		border-bottom: 1px solid #EEEEEE;
	}



	.leixing_view {
		flex-flow: column;
		width: 60upx;
		height: 60upx;
		/* border: 3px solid black ; */
		/* border-radius: 60upx; */
		margin: 0upx 12upx;
		background-color: ;
	}

	.dark_bacgound {
		background-color: #ADD8E6;
	}

	.grey_bacgound {
		background-color: CornflowerBlue;
	}

	.jichukuangjia {
		display: flex;
		/* position: fixed;
		bottom: 130upx; */
		/* 		background-image: url('http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/bc.jpg'); */
		background-color: #F5F5F5;
		width: 700upx;
		margin-left: 25upx;
		border: 2upx solid #222222;
		overflow: hidden;
		flex-flow: column nowrap;
		background-color: #EFEFEF;
		/* justify-content: center; */
		/* align-items: center; */
	}

	.rank_title_bac {
		/* border: 1upx solid blue; */
		border-radius: 7upx;
		background-color: #DCDCDC;
		font-size: 25upx;
		color: black;
	}

	.bac_blue_white {
		background-color: #1E90FF;
		color: white;
	}

	.bac_red_white {
		background-color: red;
		color: white;
	}

	@keyframes mymove {
		from {
			top: -420px;
		}

		to {
			top: 120px;
		}
	}
</style>
