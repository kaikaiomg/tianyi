<template>

	<view class="" style="width: 700upx; justify-content: space-between; align-items: center;z-index: 31;background-color: #EFEFEF;padding: 0upx 25upx;">
		<picker class="icontext" style="font-size: 23upx;" :range="filter_fanwei" @change="pickerChange">
			{{filter_picker_name}}&nbsp;&nbsp;&#xe602;
		</picker>
		<view class="" style="margin: 14upx 0upx;  height: 44upx; width: 320upx;">
			<!-- <segmented-control :current="current" :values="items" v-on:clickItem="onClickItem" :styleType="styleType"	:activeColor="activeColor"></segmented-control> -->
			<view class="segmented-control" :class="styleType" :style="wrapStyle">
				<view v-for="(item, index) in values" class="segmented-control-item" :class="styleType" :key="index" :style="index === current ? activeStyle : itemStyle"
				 @click="onClick(index)">
					{{item}}
				</view>
			</view>
		</view>
		<picker class="icontext" style="font-size: 23upx;" mode="date" start="2018-01-01" end="2019-03-01" @change="dateChange_day">
			{{picker_date_day}}&nbsp;&nbsp;&#xe602;
		</picker>
</view>


</template>

<script>
	export default {
		name: 'navigationview',
		
		props: {
			current: {
				type: Number,
				default: 0
			},
			values: {
				type: Array,
				default () {
					return [];
				}
			},

			activeColor: {
				type: String,
				default: '#007aff'
			},
			styleType: {
				type: String,
				default: 'button'
			},

			commenturl: null,
			tishicont: null,
			refreshurl: null,
			
		},
		data() {
			return {
				picker_date_day: '时间',
				filter_picker_name:'教学楼',
				filter_fanwei:['教学A楼', '教学楼', '教学C楼', '教学D楼', '教学E楼','益新食堂', '尔美食堂', '山明食堂', '水秀食堂', '教学G楼', '宿舍p楼', '图书馆'],
				luyouData: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
					{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
				],

			}
		},
		onLoad: async function() {
			// let aa = await this.get_hot_card_list()

		},
		computed: {
			
			wrapStyle() {
				let styleString = '';
				switch (this.styleType) {
					case 'text':
						styleString = `border:0;`;
						break;
					default:
						styleString = `border-color: ${this.activeColor}`;
						break;
				}
				return styleString;
			},
			itemStyle() {
				let styleString = '';
				switch (this.styleType) {
					case 'text':
						styleString = `color:#000;border-left:0;`;
						break;
					default:
						styleString = `color:${this.activeColor};border-color:${this.activeColor};`;
						break;
				}
				return styleString;
			},
			activeStyle() {
				let styleString = '';
				switch (this.styleType) {
					case 'text':
						styleString = `color:${this.activeColor};border-left:0;border-bottom-style:solid;`;
						break;
					default:
						styleString = `color:#fff;border-color:${this.activeColor};background-color:${this.activeColor}`;
						break;
				}
				return styleString;
			}
		},
		methods: {

			pickerChange(evt){
				this.filter_picker_name = this.filter_fanwei[evt.detail.value];
				this.picker_date_day = '时间';
				this.$emit('changehouse', this.filter_picker_name);
				
			},
			dateChange_day(evt) {
				this.picker_date_day = evt.detail.value;
				this.filter_picker_name = '教学楼';
				this.$emit('changedate', this.picker_date_day);
			},
			

			onClick(index) {
				if (this.current !== index) {
					this.current = index;
					this.$emit('clickItem', index);
				}
			},
			
			
		},
	}
</script>

<style>
	.segmented-control {
		display: flex;
		flex-direction: row;
		justify-content: center;
		width: 100%;
		font-size: 20upx;
		border-radius: 12upx;
		box-sizing: border-box;
		margin: 0 auto;
		overflow: hidden;
	}

	.segmented-control.button {
		border: 1upx solid;
	}

	.segmented-control.text {
		border: 0;
		border-radius: 0upx;
	}


	.segmented-control-item {
		flex: 1;
		text-align: center;
		justify-content: center;
		align-items: center;
		line-height: 70upx;
		box-sizing: border-box;
	}

	.segmented-control-item.button {
		border-left: 1upx solid;
	}

	.segmented-control-item.text {
		border-left: 0;
	}

	.segmented-control-item:first-child {
		border-left-width: 0;
	}
</style>
