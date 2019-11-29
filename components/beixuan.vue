<template>
	<!-- 	<view style="height: 100%; "> -->
	<scroll-view scroll-y style="height: 100%; ">




		<view class="" style="width: 750upx;height: 42upx;font-size: 30upx; flex-flow: row; padding:5upx 5upx 5upx 30upx; ">
			<view class="" style="justify-content: flex-start;width: 80%; font-weight: bold;  color: #555555;">制作中</view>
		</view>
		<view v-if="item.statue=='inhand'" v-for="(item,index) in hot_card_list_beixuan" :key="index" class="paihang_table">
			<view class="" style="   flex-flow:row nowrap;">
				<view class="" style="width: 75%;height: 50upx;justify-content: flex-start;">
					<view class="paihang_index">{{index+1}}</view>
					<text style="font-size: 23px;  "> &nbsp;&nbsp;{{item.title}}&nbsp;&nbsp;</text>
					<view class="paihang_categorie">{{item.categorie}}</view>
					<view class="icontext icon_view " v-if="item.big_field=='未来'">&#xe624;</view>
					<view class="icontext icon_view " v-if="item.big_field=='金融'">&#xe67b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='人口'">&#xe73c;</view>
					<view class="icontext icon_view " v-if="item.big_field=='行业'">&#xe61b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='管理'">&#xe633;</view>
					<view class="icontext icon_view " v-if="item.big_field=='地理'">&#xe645;</view>
					<view class="icontext icon_view " v-if="item.big_field=='娱乐'">&#xe606;</view>
				</view>
				<view class="icontext" style="width: 20%;height: 50upx;justify-content: flex-end;" v-if="item.statue=='inhand'">
					制作中...
				</view>
			</view>
			<view class="" style="  flex-flow:row nowrap;">
				<view v-if="item.statue=='inhand'" class="inhand_line"></view>
			</view>

		</view>

		<view class="" style="width: 750upx;height: 42upx;font-size: 30upx; flex-flow: row; padding:5upx 5upx 5upx 30upx; ">
			<view class="" style="justify-content: flex-start;width: 80%; font-weight: bold;  color: #555555;">备选</view>
			<view class="icontext" style="justify-content: flex-end; width: 20%;">&#xe602;</view>
		</view>
		<view v-if="item.statue=='beixuan'" v-for="(item,index) in hot_card_list_beixuan" :key="index" class="paihang_table">
			<view class="" style="   flex-flow:row nowrap;">
				<view class="" style="width: 75%;height: 50upx;justify-content: flex-start;">
					<view class="paihang_index">{{index+1}}</view>
					<text style="font-size: 23px;  "> &nbsp;&nbsp;{{item.title}}&nbsp;&nbsp;</text>
					<view class="paihang_categorie">{{item.categorie}}</view>
					<view class="icontext icon_view " v-if="item.big_field=='未来'">&#xe624;</view>
					<view class="icontext icon_view " v-if="item.big_field=='金融'">&#xe67b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='人口'">&#xe73c;</view>
					<view class="icontext icon_view " v-if="item.big_field=='行业'">&#xe61b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='管理'">&#xe633;</view>
					<view class="icontext icon_view " v-if="item.big_field=='地理'">&#xe645;</view>
					<view class="icontext icon_view " v-if="item.big_field=='娱乐'">&#xe606;</view>
				</view>
				<view class="icontext" style="width: 20%;height: 50upx;justify-content: flex-end;" v-if="item.statue=='beixuan'">
					<text style="color:black; font-size: 30px;" @click="click_vote(index)">
						{{Remaining_votes>0 ? '&#xe60c;'+item.vote_num: '&#xe610;'+item.vote_num}}
					</text>
				</view>
			</view>
			<view class="" style="  flex-flow:row nowrap;">
				<view v-if="item.statue=='beixuan'" class="  linebar_left" :style="'width: '+item.vote_num/6+'%;'"></view>
				<view v-if="item.statue=='beixuan'" class="linebar_right" :style="'width: '+(100-item.vote_num/6)+'%;'"></view>
			</view>
		</view>


		<view class="" style="width: 750upx;height: 42upx;font-size: 30upx; flex-flow: row; padding:5upx 5upx 5upx 30upx; ">
			<view class="" style="justify-content: flex-start;width: 80%; font-weight: bold;  color: #555555;">已完成</view>
			<view class="icontext" style="justify-content: flex-end; width: 20%;">&#xe602;</view>
		</view>
		<view v-if="item.statue=='finish'" v-for="(item,index) in hot_card_list_beixuan" :key="index" class="paihang_table">
			<view class="" style="   flex-flow:row nowrap;">
				<view class="" style="width: 75%;height: 50upx;justify-content: flex-start;">
					<view class="paihang_index">{{index+1}}</view>
					<text style="font-size: 23px;  "> &nbsp;&nbsp;{{item.title}}&nbsp;&nbsp;</text>
					<view class="paihang_categorie">{{item.categorie}}</view>
					<view class="icontext icon_view " v-if="item.big_field=='未来'">&#xe624;</view>
					<view class="icontext icon_view " v-if="item.big_field=='金融'">&#xe67b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='人口'">&#xe73c;</view>
					<view class="icontext icon_view " v-if="item.big_field=='行业'">&#xe61b;</view>
					<view class="icontext icon_view " v-if="item.big_field=='管理'">&#xe633;</view>
					<view class="icontext icon_view " v-if="item.big_field=='地理'">&#xe645;</view>
					<view class="icontext icon_view " v-if="item.big_field=='娱乐'">&#xe606;</view>
				</view>
				<view class="icontext" style="width: 20%;height: 50upx;justify-content: flex-end;">
					已完成
				</view>
			</view>
			<view class="" style="  flex-flow:row nowrap;">
				<view v-if="item.statue=='finish'" class="finish_line"></view>
			</view>
		</view>








		<view class="" style="flex-flow: column;justify-content: center;align-content: center;align-items: center;">
			<navigator url="../new_item/new_item" style="font-size: 24upx;">
				<view class="icontext" style="font-size: 74upx;color: #007AFF;">
					&#xe641;
				</view>
				<view class="icontext" style="font-size: 34upx;">
					创建
				</view>
			</navigator>
		</view>

		<view class="" style="height: 200upx;"></view>
	</scroll-view>
	<!-- 	</view> -->
</template>
<script>
	export default {
		name: 'beixuanview',
		data() {
			return {
				hot_card_list_beixuan: [],
				Remaining_votes: 5,
				collect_list: [],
				luyouData: null,
			}
		},
		onLoad: function() {
			this.getData_hot_card_list_beixuan();
		},

		methods: {

			getData_hot_card_list_beixuan: function() {
				uni.request({
					url: 'https://kaikaiomg.applinzi.com/uni_app_download.php',
					method: "POST",
					data: {
						'form': 'hot_card_list_beixuan',

					},
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					success: (ret) => {
						if (ret.statusCode !== 200) {
							console.log("请求失败:", ret)
						} else {
							console.log("hot_card_list_beixuan:", ret.data)
							// let lists = [];
							this.hot_card_list_beixuan = ret.data.data;
						}
					}
				});
			},

			pushData_hot_card_list_beixuan: function(hot_card_info) {
				uni.request({
					url: "https://kaikaiomg.applinzi.com/uni_app_upload.php",
					method: "POST",
					data: {
						'form': 'hot_card_list_beifeng_dianzhan',
						'vote_num': hot_card_info.vote_num,
						'beixuan_id': hot_card_info.beixuan_id,
					},
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},

					success: (res) => {
						uni.showModal({
							// content: "code：" + res.data,
							content: "谢谢投票！，今日还可以投票" + this.Remaining_votes + "次。"
						})
					},
					fail: () => {
						uni.showModal({
							content: "请求失败，请重试!",
							showCancel: false
						})
					}
				})
			},

			click_vote(e) {
				if (this.Remaining_votes > 0) {
					console.log(JSON.stringify(e));
					// console.log(this.hot_card_list_beixuan[JSON.stringify(e)].title)
					this.hot_card_list_beixuan[JSON.stringify(e)].vote_num = Number(this.hot_card_list_beixuan[JSON.stringify(e)].vote_num) +
						1;


					this.Remaining_votes -= 1;
					this.pushData_hot_card_list_beixuan(this.hot_card_list_beixuan[JSON.stringify(e)])
				}

			},
		}
	}
</script>

<style>
	.on {
		color: #FF0000;
		border-bottom: 5upx solid #000000;
	}

	.paihang_table {

		position: relative;
		flex-flow: column wrap;
		margin: 23upx 30upx 16upx 30upx;
		font-size: 20px;
		background-color: #F8F8F8;
	}


	.paihang_index {
		border-radius: 100upx;
		background-color: RoyalBlue;
		color: white;
		height: 30upx;
		padding: 0px 11upx;
		line-height: calc(30upx - 2px);
		font-size: 17upx;
	}

	.paihang_categorie {
		border-radius: 1upx;
		border: 1upx solid SlateBlue;
		color: SlateBlue;
		height: 30upx;
		padding: 0px 11upx;
		line-height: calc(30upx - 2px);
		font-size: 17upx;
	}

	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
	}

	.linebar_left {
		height: 20px;
		background-color: MediumBlue;
	}

	.linebar_right {
		height: 20px;
		background-color: #C0C0C0;
	}

	.inhand_line {
		height: 20px;
		width: 100%;
		background-color: #AFEEEE;
	}

	.finish_line {
		height: 20px;
		width: 100%;
		background-color: #F0E68C;

	}


	.hot_card_box {
		height: 150upx;
		width: 750upx;
		flex-flow: row warp;
		justify-content: center;
		align-content: center;
	}

	.hot_card {
		flex-shrink: 0;
		margin: 15upx;
		border-radius: 20px;
		/* overflow: hidden; */
		flex-direction: column;
		/* background-color: #EFEFEF; */
		flex-flow: column;
		height: 130upx;
		width: 21%;
	}




	.icon_view {

		font-size: 30upx;
		position: relative;
		left: 12upx;
		top: 0upx;

	}

	/* 	.canvasView {
	flex: 1;
	height: 200upx;
	flex-direction: column;
} */
</style>
