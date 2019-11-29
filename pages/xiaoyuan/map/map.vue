<template>
	<view>
		<view class="" style="width: 750upx;flex-flow: column;">
			<view class="width750" :style="'height:'+height+'px' ">
				<map scale=17 :latitude="latitude" :longitude="longitude" :markers="covers" :controls="controls" @controltap="tapcontrol"
				 @markertap="tapmaker" @callouttap="tapcallout" @tap="tap_table()">
				</map>
			</view>



			<view class="show_view" v-if="show_flag_school">
				<view class="" style="padding-left: 80upx; height: 100%;width: 375upx;background-color: white;flex-flow: column;">
					<view class="" style="font-size: 40upx;line-height: 120upx;">天翼大学</view>
					<view class="" style="font-size: 22upx;line-height: 32upx;">占地面积（亩）:&nbsp;&nbsp; 3000</view>
					<view class="" style="font-size: 22upx;line-height: 32upx;">建筑面积（㎡）:&nbsp;&nbsp;132万</view>
					<view class="" style="font-size: 22upx;line-height: 32upx;">学生数量(人)：&nbsp;&nbsp;35639</view>
					<view class="" style="font-size: 22upx;line-height: 32upx;">教师数量(人)：&nbsp;&nbsp;2965</view>
				</view>
				<view class="" style="height: 100%;width: 375upx;background-color:white;flex-flow: column;align-items: center;justify-content: center;">
					<view class="icontext" style="font-size: 80upx;">&#xe6d7;</view>
					<view class="" style="font-size: 23upx;position: relative;top: -14upx;">0-5℃</view>
					<view class="" style="font-size: 23px;position: relative;top: -14upx;">2019/1/20 周三</view>
				</view>
			</view>

			<view class="show_view" v-if="show_flag_shuju">
				<view class="" style="padding-left: 80upx; height: 100%;width: 375upx;background-color: white;flex-flow: column;padding-top: 50upx;">
					<view class="icontext" style="font-size: 30upx;line-height: 70upx;" @click="gotogaojing()">{{show_markermessage.title}}&nbsp;&nbsp;&nbsp;&#xe60e;</view>
					<view class="" style="font-size: 22upx;line-height: 35upx;">设备编号:&nbsp;&nbsp; {{show_markermessage.bianhao}}</view>
					<view class="" style="font-size: 22upx;line-height: 35upx;">提交时间:&nbsp;&nbsp; {{show_markermessage.time}}</view>
					<view class="" style="font-size: 22upx;line-height: 35upx;">提交人:&nbsp;&nbsp; {{show_markermessage.zhuangtai}}</view>
			        <!-- <view class="" style="font-size: 22upx;line-height: 35upx;">状态:&nbsp;&nbsp; {{show_markermessage.state}}</view> -->
				</view>
				<view class="" style="height: 100%;width: 375upx;background-color:white;flex-flow: column;align-items: center;">
					<view :class="['button_style',gaojing_flag? 'btn_green' : 'btn_black']" @click="tap_gaojing()">

						<view v-if="gaojing_flag" class="">告警</view>
						<view v-if="gaojing_flag" class="">确认</view>
						<view v-if="!gaojing_flag" class="">发现</view>
						<view v-if="!gaojing_flag" class="">问题</view>
					</view>
				</view>
			</view>

			<view  class="menu_view" v-if="show_menu_flag">
				<cover-view class="icontext  dacha_view" @click="show_menu"> x </cover-view>
				<cover-view class="menu_item_view"  @click="gotourl('../nenghao/nenghao')">能耗分析</cover-view>
				<cover-view class="menu_item_view"  @click="gotourl('../wangluo/wangluo') ">网络分析</cover-view>
				<cover-view class="menu_item_view"  @click="gotourl('../gaojing/gaojing?sensor_id=1000&bianhao=全部设备') ">历史告警</cover-view>
			</view >

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
				height: 0,
				show_flag_school: true,
				show_flag_shuju: false,
				show_menu_flag: false,
				show_tubiao_flag: [false, false, false, false,false],
                show_tubiao_flag_warning: [0,0,0,0,0],
				latitude: 31.3160100000,
				longitude: 121.3934020000,
				map_list: [],
				gaojing_flag: true,
				controlflag: [false, false, false, false, false, false],

				covers: [],
				show_markermessage: {
					id: 0,
					title: "",
					bianhao: "",
					zhuangtai: "",
					time: "",
					state:"",
					index:0,
				},

                controls:[],
				controls_old: [
					{
						id: 1,
						position: {
							left: 368,
							top: 10,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/1.png',
					},
					{
						id: 2,
						position: {
							left: 368,
							top: 70,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/2.png',
					},
					{
						id: 3,
						position: {
							left: 368,
							top: 130,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/3.png',
					},
					{
						id: 4,
						position: {
							left: 368,
							top: 190,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/4.png',
					},
					{
						id: 5,
						position: {
							left: 368,
							top: 250,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/5.png',
					},
                    {
						id: 6,
						position: {
							left: 368,
							top: 310,
							width: 40,
							height: 40,
						},
						clickable: true,
						iconPath: '../../../static/tianyi/6.png',
					},
	              

				],
			}
		},
		onLoad: async function() {
			this.height = uni.getSystemInfoSync().windowHeight - 320 * (uni.getSystemInfoSync().windowWidth / 750);

			var post_data = {
				'form': 'get_map_list',
				// 'openid': this.openid,
			};
			await this.download_from_server(post_data, 'map_list')

			this.deal_width_covers()


		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum', 'openid'])
		},
		methods: {
			gotourl(url){
				uni.navigateTo({
					url:url
				})
			},
			deal_width_covers() {
				var that = this;
				that.covers = [];
				that.show_tubiao_flag_warning=[0,0,0,0,0];
				for (var j = 0; j < that.map_list.length; j++) {
					
					if ((that.show_tubiao_flag[0] && that.map_list[j].SENSORTYPE_ID == 100001) ||
						(that.show_tubiao_flag[1] && that.map_list[j].SENSORTYPE_ID == 100002) ||
						(that.show_tubiao_flag[2] && that.map_list[j].SENSORTYPE_ID == 100003) ||
						(that.show_tubiao_flag[3] && that.map_list[j].SENSORTYPE_ID == 100004) ||
						(that.show_tubiao_flag[4] && that.map_list[j].SENSORTYPE_ID == 100005)
					) {
						that.covers.push({
							id: that.map_list[j].ID,
							latitude: that.map_list[j].LATITUDE,
							longitude: that.map_list[j].LONGITUDE,
							iconPath: '../../../static/tianyi/' + (that.map_list[j].state=="告警"?'1':'') +that.map_list[j].SENSORTYPE_ID + '.png',
							label: {
								borderRadius: 3,
								bgColor: "rgba(255,255,255,0.2)",
								content: that.map_list[j].NAME,
								padding: 3,
							},

						})

					}
					if ( that.map_list[j].state=="告警" && that.map_list[j].SENSORTYPE_ID == 100001) {
						that.show_tubiao_flag_warning[0]+=1;
					}
					if ( that.map_list[j].state=="告警" && that.map_list[j].SENSORTYPE_ID == 100002) {
						that.show_tubiao_flag_warning[1]+=1;
					}
					if ( that.map_list[j].state=="告警" && that.map_list[j].SENSORTYPE_ID == 100003) {
						that.show_tubiao_flag_warning[2]+=1;
					}
					if ( that.map_list[j].state=="告警" && that.map_list[j].SENSORTYPE_ID == 100004) {
						that.show_tubiao_flag_warning[3]+=1;
					}
					if ( that.map_list[j].state=="告警" && that.map_list[j].SENSORTYPE_ID == 100005) {
						that.show_tubiao_flag_warning[4]+=1;
					}
				}
				var controls1=that.controls_old.concat();
				for (var j = 0; j < 5; j++) {
                     controls1.push({
					
								id: 7+Number(j),
								position: {
									left: 388,
									top: 8+60*j,
									width: 18,
									height: 18,
								},
								clickable: false,
								iconPath: '../../../static/tianyi/5'+that.show_tubiao_flag_warning[j] +'.png',

					})
                }
				that.controls=controls1
				console.log(that.controls)

			},


			show_message(message) {
				console.log(message)
			},


			tapmaker(e) {
				var that = this
				console.log(e.mp.markerId)
				for (var j = 0; j < that.map_list.length; j++) {
					if (that.map_list[j].ID == e.mp.markerId) {
						that.show_markermessage.title = that.map_list[j].ASSEMBLENAME;
						that.show_markermessage.bianhao = that.map_list[j].ASSEMBLECODE;
						that.show_markermessage.zhuangtai = that.map_list[j].EDITER;
						that.show_markermessage.time = that.map_list[j].EDITDATE;
						that.show_markermessage.id = that.map_list[j].ID;
						that.show_markermessage.state = that.map_list[j].state;
						that.show_markermessage.index = j;
					}
				}
				this.height = uni.getSystemInfoSync().windowHeight - 320 * (uni.getSystemInfoSync().windowWidth / 750);
				this.show_flag_school = false;
				this.show_flag_shuju = true;
                this.gaojing_flag=(that.show_markermessage.state=='告警'?true:false)
			},

			show_menu() {
				this.show_menu_flag = !this.show_menu_flag;
				this.height = uni.getSystemInfoSync().windowHeight;
				this.show_flag_school = false;
				this.show_flag_shuju = false;
				this.$forceUpdate();
			},

			tapcontrol(e) {
				 console.log(e)
				console.log(this.controlflag[Number(e.mp.controlId) - 1])
				if (Number(e.mp.controlId) < 6) {
					if (this.controlflag[Number(e.mp.controlId) - 1]) {
						this.controlflag[Number(e.mp.controlId) - 1] = false;
						this.show_tubiao_flag[Number(e.mp.controlId) - 1] = false;
						this.deal_width_covers()
						this.controls[e.mp.controlId - 1].iconPath = '../../../static/tianyi/' + (e.mp.controlId) + '.png';
					} else {
						this.controlflag[Number(e.mp.controlId) - 1] = true;
						this.show_tubiao_flag[Number(e.mp.controlId) - 1] = true;
						this.deal_width_covers()
						this.controls[e.mp.controlId - 1].iconPath = '../../../static/tianyi/1' + (e.mp.controlId) + '.png';
					}
				}
				if (Number(e.mp.controlId) == 6) {
					 console.log('yes')
					this.show_menu()
						
				}
			},
			gotogaojing() {
				uni.navigateTo({
					url: "../gaojing/gaojing?sensor_id=" + this.show_markermessage.id+"&bianhao="+this.show_markermessage.bianhao
				})
			},
			tap_gaojing() {
				var that = this
				if (that.gaojing_flag) {
					that.map_list[that.show_markermessage.index].state='正常';
					that.deal_width_covers();
					that.upload_to_server({
						'form': 'check_warning',
						'nickName': that.userInfo.nickName,
						'phonenum': that.phonenum,
						'openid': that.openid,
						'sensor_id': that.show_markermessage.id,
					});
					
					uni.showLoading({
						title: "上传中。。。"
					})
					setTimeout(function() {
						uni.hideLoading();
						that.gaojing_flag = !that.gaojing_flag;
					}, 1200)
				}
				else{
					uni.showModal({
						content:"确定要提交问题吗？",
						complete() {
							that.map_list[that.show_markermessage.index].state='告警';
							that.deal_width_covers();
							that.upload_to_server({
								'form': 'find_warning',
								'nickName': that.userInfo.nickName,
								'phonenum': that.phonenum,
								'openid': that.openid,
								'sensor_id': that.show_markermessage.id,
							});
							that.gaojing_flag = !that.gaojing_flag;
						}
					})
					
				}
				
				
				
			},
			tap_table() {
				this.height = uni.getSystemInfoSync().windowHeight;
				this.show_flag_school = false;
				this.show_flag_shuju = false;
			}

		}
	}
</script>
<style>
	map {
		width: 100%;
		height: 100%;
	}

	.page-section {
		width: 100%;
		margin-bottom: 60upx;
	}

	.width750 {
		width: 750upx;
	}

	.show_view {
		border-top: 6upx solid grey;
		width: 750upx;
		height: 320upx;
		position: fixed;
		bottom: 0upx;
		background-color: white;
		flex-flow: row;
		z-index: 99;
	}

	.button_style {
		margin-top: 70upx;
		justify-content: center;
		align-items: center;
		font-size: 26upx;
		flex-flow: column;
		border-radius: 100upx;
		height: 100upx;
		width: 100upx;
		border: 1upx solid black;
	}

	.btn_green {
		background-color: red;
		color: white;
	}

	.btn_black {
		background-color: white;
		color: black;

	}

	.menu_view {
		position: fixed;
		top: 0upx;
		width: 750upx;
		height: 100%;
		background: rgba(200, 200, 200, .5);
		flex-flow: column;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.menu_item_view {
		background: rgba(30, 144, 255, .8);
		margin: 60upx 0upx;
		border-radius: 30upx;
		padding: 30upx 90upx;
		border: 1upx solid black;
		font-size: 35upx;
		color: white;
	}

	.dacha_view {
		position: absolute;
		top: 0upx;
		left: 0upx;
		color: red;
		font-weight: bold;
		padding: 50upx;
		font-size: 40upx;
	}
</style>
