<template>
	<view class="" style="display: flex;flex-flow: column nowrap;align-items: center;width: 750upx; ">

		<view class="jichukuangjia" :style="'height:'+height+'px'  ">
			<mpvue-echarts :echarts="echarts" :onInit="chatInit_1" canvasId="chat_1" />

		</view>
		<view class="jichukuangjia" :style="'height:'+height+'px'  ">
			<mpvue-echarts :echarts="echarts" :onInit="chatInit_2" canvasId="chat_2" />

		</view>
		<view class="jichukuangjia" :style="'height:'+height+'px'  ">
			<view class="" style="width: 55%;height: 100%; flex-flow: column;justify-content: center;align-items: center;" >
				<view style="width: 280upx;height: 170upx; background-color: white;flex-flow: column;padding: 10upx;" @click="gotopaihang">
					<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
						<view class="blue_view" style="width: 30%;">
							排名
						</view>
						<view class="blue_view" style="width: 68%;">
							内网ip
						</view>
					</view>
                    <view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
						<view class="grey_view" style="width: 30%;">
							Top1
						</view>
						<view class="grey_view" style="width: 68%;">
							192.168.1.1
						</view>
					</view>
					   <view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
						<view class="white_view" style="width: 30%;">
							Top2
						</view>
						<view class="white_view" style="width: 68%;">
							192.168.1.2
						</view>
					</view>
				</view>


			</view>
			<view class="" style="width: 45%;height: 100%;">
				<mpvue-echarts :echarts="echarts" :onInit="chatInit_3" canvasId="chat_3" />
			</view>

		</view>


	</view>
</template>

<script>
	import navigationview from '../../../components/navigation.vue';
	import * as echarts from '../../../components/echarts/echarts.tree.min.js';
	import mpvueEcharts from '../../../components/mpvue-echarts/src/echarts.vue';
	var pieChart_1 = null;
	var pieChart_2 = null;
	var pieChart_3 = null;
	export default {
		data() {
			return {
				luyouData_ziduan: null,
				luyouData: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
					{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
				],
				data_list: null,
				list_id: null,
				items: [
					'按时间统计',
					'按楼统计',
				],

				department_id: "",
				height: 500,
				current: 0,
				number:30,
				echarts,
			}
		},
		components: {
			navigationview,
			mpvueEcharts
		},

		onLoad: async function(option) {
			var that = this;
			this.height = (uni.getSystemInfoSync().windowHeight - 140) / 3;
			setTimeout(() => this.deal_with_data(), 500);
		},

		methods: {
            gotopaihang(){
				uni.navigateTo({
					url:"../paihang/paihang"
				})
			},

			chatInit_1: function(canvas, width, height, data) {
				var that = this;
				pieChart_1 = echarts.init(canvas, null, {
					width: width,
					height: height
				})
				canvas.setChart(pieChart_1)
				return pieChart_1
			},

			chatInit_2: function(canvas, width, height, data) {
				var that = this;
				pieChart_2 = echarts.init(canvas, null, {
					width: width,
					height: height
				})
				canvas.setChart(pieChart_2)
				return pieChart_2
			},
			chatInit_3: function(canvas, width, height, data) {
				var that = this;
				pieChart_3 = echarts.init(canvas, null, {
					width: width,
					height: height
				})
				canvas.setChart(pieChart_3)
				return pieChart_3
			},


			deal_with_data: async function() {
				const that = this;
				var option1 = this.sudu_chart()
				pieChart_1.setOption(option1);
				setInterval(function() {
					this.number=Number((Math.random() * 30).toFixed(2))+50; 
					// console.log(this.number)
					option1.series[0].data[0].value = this.number;
					option1.series[0].data[0].name = this.number+"%";
					pieChart_1.setOption(option1, true);
				}, 2000);
				var data1=this.suijishuzu(5)
				var data2=this.suijishuzu(3)
				
				pieChart_2.setOption(this.liuliang(data1,data2));
				pieChart_3.setOption(this.bingtu_chart());

			},
           suijishuzu(beishu){
			   var data=[];
			   for (let i = 0; i < 72; i++) {
				   data[i]=(Math.random() * 100 *beishu ).toFixed(2); 	
			   }
			   console.log(data)
			   return data;
		   },


			sudu_chart() {
				return {
					title: {
							text: "出口带宽占用率",
							top:"4%",
							x:"1%",
							textStyle: {
								color: '#000000',
								fontSize: '12'
							},
					},
					series: [{
						name: '彩虹仪表盘',
						type: "gauge",
						
						startAngle: 180,
						endAngle: 0,
						radius: "160%",
						center: ["50%", "90%"],
						axisLine: {
							show: true,
						},
						axisTick: {
							show: true //小刻度
						},
						axisLabel: {
							show: false,
							textStyle: {
								color: '#fff'
							}
						},
						splitLine: {
							show: true
						},
						pointer: {
							show: true,
							width: "2%",
							length: '90%',
							color: "red"
						},
						detail: {
							show: false,
							formatter: '{value}%',
							offsetCenter: ['0', '-30%'],
							textStyle: {
								fontSize: 24
							}
						},
						data: [{
							value: 88,
							name: '0%'
						}]
					}]

				}
			},
			liuliang(data1,data2) {
				return {
// 					title: {
// 						text: '上下行流量通国际',
// 						// subtext: '数据来自西安兰特水电测控技术有限公司',
// 						x: 'center',
// 						align: 'right'
// 					},
					grid: {
						top:40,
						bottom: '40%'
					},


// 					legend: {
// 						data: ['流量', '降雨量'],
// 						x: 'left'
// 					},
					dataZoom: [{
							show: true,
							realtime: true,
							start: 65,
							end: 100
						},
						{
							type: 'inside',
							realtime: true,
							start: 65,
							end: 8100
						}
					],
					xAxis: [{
						type: 'category',
						boundaryGap: false,
						axisLine: {
							onZero: false
						},
						data: [
						'1/12 1:00','1/12 2:00', '1/12 3:00', '1/12 4:00','1/12 5:00', '1/12 6:00', '1/12 7:00','1/12 8:00', '1/12 9:00', '1/12 10:00','1/12 11:00', '1/12 12:00', 
						'1/12 13:00','1/12 14:00', '1/12 15:00', '1/12 16:00','1/12 17:00', '1/12 18:00', '1/12 19:00','1/12 20:00', '1/12 21:00', '1/12 22:00','1/12 23:00', '1/12 24:00',
						'1/13 1:00','1/13 2:00', '1/13 3:00', '1/13 4:00','1/13 5:00', '1/13 6:00', '1/13 7:00','1/13 8:00', '1/13 9:00', '1/13 10:00','1/13 11:00', '1/13 12:00', 
						'1/13 13:00','1/13 14:00', '1/13 15:00', '1/13 16:00','1/13 17:00', '1/13 18:00', '1/13 19:00','1/13 20:00', '1/13 21:00', '1/13 22:00','1/13 23:00', '1/13 24:00',
						'1/14 1:00','1/14 2:00', '1/14 3:00', '1/14 4:00','1/14 5:00', '1/14 6:00', '1/14 7:00','1/14 8:00', '1/14 9:00', '1/14 10:00','1/14 11:00', '1/14 12:00', 
						'1/14 13:00','1/14 14:00', '1/14 15:00', '1/14 16:00','1/14 17:00', '1/14 18:00', '1/14 19:00','1/14 20:00', '1/14 21:00', '1/14 22:00','1/14 23:00', '1/14 24:00'
						],

					}],
					yAxis: [{
							name: '流入(bps)',
							type: 'value',
							max: 1000
						},
						{
							name: '流出(bps)',
							nameLocation: 'start',
							max: 1000,
							type: 'value',
							inverse: true
						}
					],
					series: [{
							name: '流入(bps)',
							type: 'line',
							animation: false,
							areaStyle: {},
							lineStyle: {
								width: 1
							},

							data:data1
						},
						{
							name: '流出(bps)',
							type: 'line',
							yAxisIndex: 1,
							animation: false,
							areaStyle: {},
							lineStyle: {
								width: 1
							},

							data: data2
						}
					]
				}
			},
			bingtu_chart() {
				return {

					// 					tooltip: {
					// 						trigger: 'item',
					// 						formatter: "{a} <br/>{b}: {c} ({d}%)"
					// 					},
					// 			
					series: [{
						name: '访问来源',
						type: 'pie',
						radius: ['50%', '70%'],
						avoidLabelOverlap: false,
						selectedMode:'single',
						label: {
							normal: {
								show: false,
								position: 'center'
							},
							emphasis: {
								show: true,
								textStyle: {
									fontSize: '20',
									fontWeight: 'bold'
								}
							}
						},
						labelLine: {
							normal: {
								show: false
							}
						},
						data: [{
								value: 335,
								name: '上网',
								// selected:true,
								
							},
							{
								value: 310,
								name: '视频',
							},
							{
								value: 234,
								name: '即时通讯',
							},
							{
								value: 135,
								name: '游戏',
							},
							{
								value: 1548,
								name: '其他',
							}
						]
					}]
				}

			}


		}
	}
</script>

<style>
	.jichukuangjia {
		display: flex;
		/*   position: fixed;
        bottom: 0upx; */
		/* 		background-image: url('http://kaikaiomg-kaikaiomg.stor.sinaapp.com/uni_app_image/bc.jpg'); */
		background-color: #F0FFFF;
		width: 700upx;
		margin: 28upx 25upx;
		border-radius: 20upx;
		border: 1upx solid #222222;
		overflow: hidden;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
		flex-flow: row;
	}

	.grey_view {
        background-color: #C0C0C0;
		color: black;
		font-size: 20upx;
		height: 50upx;
		line-height: 50upx;
		justify-content: center;
	}
	
	.white_view{
		 background-color: #DCDCDC;
		color: black;
		font-size: 20upx;
		height: 50upx;
		line-height: 50upx;
		justify-content: center;
	}
	.blue_view {
	    background-color: SteelBlue;
		color: white;
		font-size: 30upx;
		font-weight: bold;
		height: 50upx;
		line-height: 50upx;
		justify-content: center;
	}
	
	
</style>
