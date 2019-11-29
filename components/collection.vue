<template>
	<scroll-view scroll-y style="height: 100%; width: 100%; padding-top: 80upx;">
		<view class="" v-for="(item,index) in luyouData_deal" :key="index" style="">
			<view class="hot_card" v-for="(item1,index1) in luyouData_deal[index]" @click="goDetail(item1.card_id)" :key="index1">
				<image class="hot_card_img" :src="pic_before_title_loc+item1.pic_url"></image>
				<view class="hot_card_bottm">
					<view>{{item1.title}}</view>
				</view>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		name: 'collectionview',
		data() {
			return {
				// pic_before_title: "http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/card_pic/",
				pic_before_title_loc:'',
				scrollLeft: 0,
				collect_list: [],
				luyouData: null,
				luyouData_deal: [[],[],[],[],[],[],[],[],[],[],],
			}
		},
	
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum', 'openid'])
		},
		onLoad: async function() {
            this.pic_before_title_loc=this.pic_before_title;
			var post_data = {
				'form': 'get_collect_list',
				'openid': this.openid,
			};
			await this.download_from_server(post_data,'collect_list')
			await this.get_hot_card_list()
			setTimeout(() => this.deal_with_data(), 800);

		},

		methods: {
			goDetail(card_id) {
				var url = "";
				var list_id = null
				for (var i = 0; i < this.luyouData.length; i++)
					if (this.luyouData[i].card_id == card_id) {
						url = this.luyouData[i].url;
						list_id = i;
					}
				uni.reLaunch({
					url: url + "?card_id=" + card_id + "&backpage=shouchang&list_id=" + list_id,

				})
			},

			deal_with_data: function() {
				var that = this;
				var num = 0;
				for (let i = 0; i < that.luyouData.length; i++) {
					for (let j = 0; j < that.collect_list.length; j++) {
						if (that.luyouData[i].card_id == that.collect_list[j].card_id && that.collect_list[j].collection_flag == 'true') {

							that.luyouData_deal[parseInt(num / 4)].push(that.luyouData[i]);
							num++;
						}
					}
				}
				console.log(that.luyouData_deal)
			},

		





		}
	}
</script>

<style>





	






	.hot_card {
		flex-shrink: 0;
		margin: 15upx;
		border-radius: 20px;
		/* overflow: hidden; */
		flex-direction: column;
		background-color: #FFFFFF;
		flex-flow: column;
		height: 130upx;
		width: 21%;
	}

	.hot_card_img {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		width: 100%;
		height: 100upx;
	}

	.hot_card_bottm {
		font-size: 10upx;
		width: 100%;
		padding-left: 20%;
		height: 30upx;
		justify-content: space-between;
		align-items: center;
	}



	/* 	.canvasView {
	flex: 1;
	height: 200upx;
	flex-direction: column;
} */
</style>
