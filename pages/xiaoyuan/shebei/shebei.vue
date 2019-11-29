<template>
	<view class="l_index">




		<scroll-view id="tab-bar" class="swiper-tab" scroll-x :scroll-left="scrollLeft">
			<block v-for="(tab,index) in tabs" :key="tab.id">
				<view :class="['swiper-tab-list',currentTab==index ? 'tap_on' : '']" :id="tab.id" :data-current="index" @tap="swichNav">{{tab.name}}</view>
			</block>
		</scroll-view>
		<swiper :current="currentTab" class="tab-swiper-box border-style" duration="300" @change="bindChange">
			<swiper-item>

				<view class="bac_view">
					<view class="title_view">
						校园公厕管理
					</view>
					<image style=" z-index: 100;width: 700upx;height: 800upx;margin-left: 30upx;" src="../../../static/CESUO.png" mode=""></image>
				</view>
			</swiper-item>


			<swiper-item>


				<view class="bac_view">
					<view class="title_view">
						北门停车场管理管理（20/29）
					</view>

					<image style=" z-index: 100;width: 700upx;height: 800upx;margin-left: 30upx;" src="../../../static/park.png" mode=""></image>
				</view>
			</swiper-item>
			<swiper-item>

				<view class="bac_view">
					<view class="title_view"> 
						自修教室管理
					</view>
					<image style=" z-index: 100;width: 700upx;height: 500upx;margin-left: 30upx;" src="../../../static/jiaoshi.png"
					 mode=""></image>
				</view>
			</swiper-item>


		</swiper>
	</view>
</template>
<script>
	export default {
		data() {
			return {


				scrollLeft: 0,
				isClickChange: false,
				currentTab: 0,
				tabs: [{
					name: '厕所',
					id: 'beixuan'
				}, {
					name: '停车场',
					id: 'pinglun'
				}, {
					name: '监控教室',
					id: 'dashuju'
				}],

				collect_list: [],
				luyouData: null,




			}
		},
		components: {},

		onLoad: async function() {

		},


		onUnload: function() {
			this.scrollLeft = 0,
				this.isClickChange = false,
				this.currentTab = 0;
		},
		methods: {






			bindChange: async function(e) {
				let index = e.target.current;
				if (this.isClickChange) {
					this.currentTab = index;
					this.isClickChange = false;
					return;
				}
				let tabBar = await this.getWidth("tab-bar"),
					tabBarScrollLeft = tabBar.scrollLeft;

				let width = 0;

				for (let i = 0; i < index; i++) {
					let result = await this.getWidth(this.tabs[i].id);
					width += result.width;
				}

				let winWidth = uni.getSystemInfoSync().windowWidth,
					nowElement = await this.getWidth(this.tabs[index].id),
					nowWidth = nowElement.width;

				if (width + nowWidth - tabBarScrollLeft > winWidth) {
					this.scrollLeft = width + nowWidth - winWidth;
				}
				if (width < tabBarScrollLeft) {
					this.scrollLeft = width;
				}
				this.isClickChange = false;
				this.currentTab = index; //一旦访问data就会出问题
			},
			getWidth: function(id) { //得到元素的宽高
				return new Promise((res, rej) => {
					uni.createSelectorQuery().select("#" + id).fields({
						size: true,
						scrollOffset: true
					}, (data) => {
						if (id === 'tab-bar') {
							console.log("id=", id, "数据:", data)
						}
						res(data);
					}).exec();
				})
			},
			swichNav: async function(e) { //点击tab-bar
				if (this.currentTab === e.target.dataset.current) {
					return false;
				} else {
					let tabBar = await this.getWidth("tab-bar"),
						tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft
					this.scrollLeft = tabBarScrollLeft;
					this.isClickChange = true;
					this.currentTab = e.target.dataset.current
				}
			},




		}
	}
</script>

<style>
	.title_view {
		width: 750upx;
		height: 100upx;
		flex-flow: column;
		justify-content: center;
		align-items: center;

	}

	.bac_view {
		flex-flow: column;
		text-align: center;
		/* justify-content: center; */
		/* padding: 100upx 0upx 0upx 30upx; */
		height: 100%;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		background-image: url('http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/guanggao_pic/BC.png');

	}


	.l_index {
		flex: 1;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		height: 1000upx;

	}


	.swiper-tab {
		width: 750upx;
		white-space: nowrap;
		line-height: 54upx;
		height: 64upx;
		position: fixed;
		top: 0upx;
		z-index: 10;
		/* background-color: #EFEFEF; */
	}


	.swiper-tab-list {
		font-size: 30upx;
		width: 150upx;
		display: inline-block;
		text-align: center;
		color: #777777;
	}

	.tap_on {
		color: RoyalBlue;
		border-bottom: 10upx solid RoyalBlue;
	}

	.tab-swiper-box {
		flex: 1;
		width: 750upx;
		height: 100%;
		/* background-image: '../../static/BC.png'; */
		position: fixed;
		top: 64upx;
		z-index: 10;
		/* background-color: #EFEFEF; */
	}






	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
	}
</style>
