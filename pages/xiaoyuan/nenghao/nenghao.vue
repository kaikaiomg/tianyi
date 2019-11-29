<template>
	<view class="" style="display: flex;flex-flow: column nowrap;align-items: center;width: 750upx; ">
		<navigationview :current="current" :values="items" v-on:clickItem="onClickItem" 
		 v-on:changehouse="changehouse" 
		 v-on:changedate="changedate" 
		></navigationview>

		<view class="jichukuangjia" :style="'height:'+height+'px'  ">
			<!-- <view style="color: #8f8f94; width: 200upx;">饼图示例</view> -->
			<mpvue-echarts :echarts="echarts" :onInit="pieInit" canvasId="louyu" />

		</view>



	</view>
</template>

<script>
	import navigationview from '../../../components/navigation.vue';
	import * as echarts from '../../../components/echarts/echarts.tree.min.js';
	import mpvueEcharts from '../../../components/mpvue-echarts/src/echarts.vue';
	var pieChart = null;
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
					'按楼统计',
					'按时间统计',
				],
				department_id: "",
				height: 500,
				current: 1,
				echarts,
			}
		},
		components: {
			navigationview,
			mpvueEcharts
		},

		onLoad: async function(option) {
			var that = this;
			this.height = uni.getSystemInfoSync().windowHeight - 70 * (uni.getSystemInfoSync().windowWidth / 750);
			setTimeout(() => this.deal_with_data(), 500);
		},

		methods: {
			
			changehouse(name){
				pieChart.setOption(this.shijian_chart(name));
			},
			changedate(name){
				pieChart.setOption(this.louyu_chart(name));
			},
		
			
			onClickItem(index) {
				if (this.current !== index) {
					this.current = index;
					if (index == 0) {
						// pieChart.clear();
						
						pieChart.setOption(this.shijian_chart('2019-01-01'));
					} else {
						// pieChart.clear();
						pieChart.setOption(this.louyu_chart('教学A楼'));
					}

				}


			},
			pieInit: function(canvas, width, height, data) {
				var that = this;
				pieChart = echarts.init(canvas, null, {
					width: width,
					height: height
				})
				canvas.setChart(pieChart)
				return pieChart
			},

			deal_with_data: async function() {
				const that = this;
				// 				await that.get_hot_card_list();
				// 				await that.get_hot_card_list_ziduan();
				// 				await that.getData_list();

				pieChart.setOption(this.louyu_chart('2019-01-01'));
			},

			louyu_chart(name) {
				return {
					backgroundColor: '#ffffff',
					// 					tooltip: {
					// 						trigger: 'axis',
					// 						axisPointer: { // 坐标轴指示器，坐标轴触发有效
					// 							type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
					// 							color: '#fafafa'
					// 						}
					// 
					// 					},
					title: {
						text: name+" ",
						// subtext: 'bykaikai',
						textStyle: {
							color: '#000000',
							fontSize: '22'
						},
					},
					
                    "legend": {
						x: '4%',
						top: '11%',
						textStyle: {
							color: '#90979c',
						},
						"data":['八点以前', '八点以后']
					},
					calculable: true,
					yAxis: [{
						type: 'category',
						data: ['教学A楼', '教学B楼', '教学C楼', '教学D楼', '教学E楼','益新食堂', '尔美食堂', '山明食堂', '水秀食堂', '教学G楼', '宿舍p楼', '图书馆']
					}],
					xAxis: [{
						name: '检查企业数',
						type: 'value'
					}],

					series: [{
							name: '八点以前',
							type: 'bar',
							stack: '总量',
							itemStyle: {
								normal: {
									label: {
										show: true,
										position: 'inside'
									},
									color: '#05BFF1'
								}
							},
							data: [133, 333, 222, 874, 678, 133, 333, 222, 312, 321, 133, 333]
						},
						{
							name: '八点以后',
							type: 'bar',
							stack: '总量',
							itemStyle: {
								normal: {
									label: {
										show: true,
										position: 'inside'
									},
									color: '#FF6347'
								}
							},
							data: [120, 132, 101, 134, 90, 120, 132, 101, 134, 90, 90, 120]
						}


					]

				}
			},


			shijian_chart(name) {
				return {
					backgroundColor: "#ffffff",
					"title": {
						"text": name+" ",
						// "subtext": "BY kaikai",
						// x: "4%",

						textStyle: {
							color: '#000000',
							fontSize: '22'
						},
						
					},
					"tooltip": {
						"trigger": "axis",
						"axisPointer": {
							"type": "shadow",
							textStyle: {
								color: "#fff"
							}

						},
					},
					"grid": {
						"borderWidth": 0,
						"top": 110,
						"bottom": 95,
						textStyle: {
							color: "#fff"
						}
					},
					"legend": {
						x: '4%',
						top: '11%',
						textStyle: {
							color: '#90979c',
						},
						"data":['九点以前', '九点以后']
					},


					"calculable": true,
					"xAxis": [{
						"type": "category",
						"axisLine": {
							lineStyle: {
								color: '#90979c'
							}
						},
						"splitLine": {
							"show": false
						},
						"axisTick": {
							"show": false
						},
						"splitArea": {
							"show": false
						},
						"axisLabel": {
							"interval": 0,

						},
						"data": ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
					}],
					"yAxis": [{
						"type": "value",
						"splitLine": {
							"show": false
						},
						"axisLine": {
							lineStyle: {
								color: '#90979c'
							}
						},

						"axisLabel": {
							"interval": 0,

						},


					}],
					"dataZoom": [{
						"show": true,
						"height": 30,
						"xAxisIndex": [
							0
						],
						bottom: 30,
						"start": 10,
						"end": 80,
						handleSize: '110%',
						handleStyle: {
							color: "#d3dee5",

						},
						textStyle: {
							color: "#fff"
						},
						borderColor: "#90979c"


					}, {
						"type": "inside",
						"show": true,
						"height": 15,
						"start": 1,
						"end": 35
					}],
					"series": [{
							"name": "九点以前",
							"type": "bar",
							"stack": "总量",
							"barMaxWidth": 35,
							"barGap": "10%",
							"itemStyle": {
								"normal": {
									"color": "rgba(255,144,128,1)",
									"label": {
										"show": true,
										"textStyle": {
											"color": "#fff"
										},
										"position": "insideTop",
									}
								}
							},
							"data": [
								709,
								1917,
								2455,
								2610,
								1719,
								1433,
								1544,
								3285,
								5208,
								3372,
								2484,
								4078
							],
						},

						{
							"name": "九点以后",
							"type": "bar",
							"stack": "总量",
							"itemStyle": {
								"normal": {
									"color": "rgba(0,191,183,1)",
									"barBorderRadius": 0,
									"label": {
										"show": true,
										"position": "top",
									}
								}
							},
							"data": [
								327,
								1776,
								507,
								1200,
								800,
								482,
								204,
								1390,
								1001,
								951,
								381,
								220
							]
						},
// 						{
// 							"name": "总数",
// 							"type": "line",
// 							"stack": "总量",
// 							symbolSize: 10,
// 							symbol: 'circle',
// 							"itemStyle": {
// 								"normal": {
// 									"color": "rgba(252,230,48,1)",
// 									"barBorderRadius": 0,
// 									"label": {
// 										"show": true,
// 										"position": "top",
// 										formatter: function(p) {
// 											return p.value > 0 ? (p.value) : '';
// 										}
// 									}
// 								}
// 							},
// 							"data": [
// 								1036,
// 								3693,
// 								2962,
// 								3810,
// 								2519,
// 								1915,
// 								1748,
// 								4675,
// 								6209,
// 								4323,
// 								2865,
// 								4298
// 							]
// 						},
					]
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
		background-color: white;
		width: 750upx;
		overflow: hidden;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
	}
</style>
