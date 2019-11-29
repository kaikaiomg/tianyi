<template>
	<scroll-view scroll-y style="height: 100%;  ">



		<view class="" v-for="(item,index) in discussion_huizong" :key="index">

			<view class="erxuanyi_table" v-if="item.handle_type=='either'" v-show="!item.handle_isdislike">
				<view class="" style="width: 100%; padding-bottom:10upx;flex-flow: row;">
					<view class="" style="justify-content: flex-start;width: 90%;  ">
						{{item.handle_title}}
						<view class=" iconview">{{item.type}}</view>
					</view>
					<view class="icontext" hover-class="iconhover" @click="tap_dislike(index)" style="justify-content: flex-end;width: 10%;  ">
						&#xe65c;
					</view>
				</view>
				<view class="" style="width: 100%;flex-flow: row;justify-content: space-between;padding-top:9upx ;padding-bottom: 9upx;">
					<view class="" style="width: 28%;justify-content: space-between;">
						<view :class="['zhanchen',item.xiugai==1 ? '' : 'dark_bacgound_red']" @click="click_vote(item,index,'zhancheng')">{{item.choicename_1}}</view>
						<view class="zhanchen_shuzi">{{item.choicenum_1}}&nbsp;票</view>
					</view>
					<view class="" style="width: 28%;justify-content: space-between;">
						<view class="fandui_shuzi">{{item.choicenum_2}}&nbsp;票</view>
						<view :class="['fandui',item.xiugai==1 ? '' : 'dark_bacgound_blue']" @click="click_vote(item,index,'fandui')">{{item.choicename_2}}</view>
					</view>
				</view>

				<view class="" style="width: 100%; padding-top: 8upx;;">
					<view class="progress_red" :style="'width: '+(item.choicenum_1*100)/(item.choicenum_1/1+item.choicenum_2/1)+'%;'"></view>
					<view class="progress_blue" :style="'width: '+(item.choicenum_2*100)/(item.choicenum_1/1+item.choicenum_2/1)+'%;'"></view>
				</view>
			</view>



			<view class="erxuanyi_table" v-if="item.handle_type=='duoxuan'" v-show="!item.handle_isdislike">
				<view class="" style="width: 100%; padding-bottom:10upx;flex-flow: row;">
					<view class="" style="justify-content: flex-start;width: 90%;  ">
						{{item.handle_title}}
						<view class=" iconview">{{item.type}}</view>
					</view>
					<view class="icontext" hover-class="iconhover" @click="tap_dislike(index)" style="justify-content: flex-end;width: 10%;  ">
						&#xe65c;
					</view>
				</view>

				<checkbox-group @change="checkboxChange($event,item,index)" style="width: 100%;  flex-flow: column;padding-top:9upx ;padding-bottom: 9upx;">


					<label v-if="item.choicename_1" class="uni-list-cell ">
						<checkbox value="choicenum_1" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_1}}
						<view class="biliview">{{item.choicenum_1}}票</view>
					</label>
					<label v-if="item.choicename_2" class="uni-list-cell ">
						<checkbox value="choicenum_2" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_2}}
						<view class="biliview">{{item.choicenum_2}}票</view>
					</label>
					<label v-if="item.choicename_3" class="uni-list-cell ">
						<checkbox value="choicenum_3" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_3}}
						<view class="biliview">{{item.choicenum_3}}票</view>
					</label>
					<label v-if="item.choicename_4" class="uni-list-cell ">
						<checkbox value="choicenum_4" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_4}}
						<view class="biliview">{{item.choicenum_4}}票</view>
					</label>
					<label v-if="item.choicename_5" class="uni-list-cell ">
						<checkbox value="choicenum_5" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_5}}
						<view class="biliview">{{item.choicenum_5}}票</view>
					</label>
					<label v-if="item.choicename_6" class="uni-list-cell ">
						<checkbox value="choicenum_6" :disabled="item.handle_state=='disable'" />&nbsp;&nbsp;{{item.choicename_6}}
						<view class="biliview">{{item.choicenum_6}}票</view>
					</label>

				</checkbox-group>



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
		name: 'discussionview',
		data() {
			return {
				discussion_huizong: [],
				persondata: {
					comment_candianzhan: [],
					comment_isdislike: [],
					handle_isdislike: [],
				},
			}
		},
		props: {
			card_id: null,
		},
		onLoad: async function() {

			var post_data = {
				'form': 'get_handle_view',
				'card_id': this.card_id,
			};
			await this.download_from_server(post_data, 'discussion_huizong')

			this.deal_person_handel_data();




		},
		computed: {
			...mapState(['hasLogin', 'userInfo', 'phonenum', 'openid'])

		},
		methods: {

			deal_person_handel_data() {

				var that = this;
				return new Promise((res) => {
					uni.getStorage({
						key: 'persondata',
						success: function(ress) {
							console.log("find_persondata", ress.data);
							that.persondata = ress.data;
							if (that.discussion_huizong != null) {
								for (let i = 0; i < that.discussion_huizong.length; i++) {

									if ((that.persondata.handle_isdislike).indexOf(that.discussion_huizong[i].handle_id) != -1) {
										that.discussion_huizong[i].handle_isdislike = true;
									}
								}
							}
							res('ww')
						},
						fail: function() {
							console.log("havent_find_persondata");
							res('ww')
						}
					});
				})

			},

			tap_dislike: async function(index) {

				this.discussion_huizong[JSON.stringify(index)].handle_fandui = Number(this.discussion_huizong[JSON.stringify(index)]
					.handle_fandui) + 1
				this.discussion_huizong[JSON.stringify(index)].handle_isdislike = true;
				await this.deal_person_handel_data();
				this.persondata['handle_isdislike'].push(this.discussion_huizong[JSON.stringify(index)].comment_id);
				uni.setStorage({
					key: 'persondata',
					data: this.persondata,
					success: function() {
						console.log('setdata_persondata_success');
					}
				});
				this.upload_to_server({
					'form': 'handle_fandui',
					'nickName': this.userInfo.nickName,
					'phonenum': this.phonenum,
					'openid': this.openid,
					'handle_id': this.discussion_huizong[JSON.stringify(index)].handle_id,
					'choicenum_1': 0,
					'choicenum_2': 0,
					'choicenum_3': 0,
					'choicenum_4': 0,
					'choicenum_5': 0,
					'choicenum_6': 0,
					'handle_fandui': 1,
				});
				// this.discussion_huizong[JSON.stringify(index)].handle_type = "null"

			},
			checkboxChange: function(e, item, index) {
				console.log(e)
				// console.log(e)
				// 				console.log(item)
				var that = this
				if (e.detail.value.length == item.can_choice_num) {
					that.discussion_huizong[JSON.stringify(index)].handle_state = 'disable'
					console.log("不能选了")
					for (let i = 0; i < e.detail.value.length; i++) {
						// console.log(e.detail.value[i])
						that.discussion_huizong[JSON.stringify(index)][e.detail.value[i]] = Number(that.discussion_huizong[JSON.stringify(
							index)][e.detail.value[i]]) + 1;
						that.upload_to_server({
							'form': 'handle_dianzhan',
							'nickName': that.userInfo.nickName,
							'phonenum': that.phonenum,
							'openid': that.openid,
							'handle_id': that.discussion_huizong[JSON.stringify(index)].handle_id,
							'choicenum_1': (e.detail.value[i] == 'choicenum_1' ? 1 : 0),
							'choicenum_2': (e.detail.value[i] == 'choicenum_2' ? 1 : 0),
							'choicenum_3': (e.detail.value[i] == 'choicenum_3' ? 1 : 0),
							'choicenum_4': (e.detail.value[i] == 'choicenum_4' ? 1 : 0),
							'choicenum_5': (e.detail.value[i] == 'choicenum_5' ? 1 : 0),
							'choicenum_6': (e.detail.value[i] == 'choicenum_6' ? 1 : 0),
							'handle_fandui': 0,
						});

					}
					// that.pushData_discussion_huizong(that.discussion_huizong[JSON.stringify(index)])


				}

			},
			click_vote(item, index, flag) {
				if (this.discussion_huizong[JSON.stringify(index)].xiugai) {
					uni.showToast({
						title: "您已经投过票啦~",
						duration: 1200,
						icon: "none",

					})
					return 0;
				}
				if (item.handle_type == 'either') {
					if (flag == "zhancheng") {
						console.log(JSON.stringify(index));
						this.discussion_huizong[JSON.stringify(index)].choicename_1 = this.discussion_huizong[JSON.stringify(index)].choicename_3;
						this.discussion_huizong[JSON.stringify(index)].choicenum_1 = Number(this.discussion_huizong[JSON.stringify(index)]
							.choicenum_1) + 1;
						// this.pushData_discussion_huizong(this.discussion_huizong[JSON.stringify(index)])
						this.discussion_huizong[JSON.stringify(index)].xiugai = 1
						this.upload_to_server({
							'form': 'handle_dianzhan',
							'nickName': this.userInfo.nickName,
							'phonenum': this.phonenum,
							'openid': this.openid,
							'handle_id': this.discussion_huizong[JSON.stringify(index)].handle_id,
							'choicenum_1': 1,
							'choicenum_2': 0,
							'choicenum_3': 0,
							'choicenum_4': 0,
							'choicenum_5': 0,
							'choicenum_6': 0,
							'handle_fandui': 0,
						});


					}
					if (flag == "fandui") {
						console.log(JSON.stringify(index));
						this.discussion_huizong[JSON.stringify(index)].choicename_2 = this.discussion_huizong[JSON.stringify(index)].choicename_4;
						this.discussion_huizong[JSON.stringify(index)].choicenum_2 = Number(this.discussion_huizong[JSON.stringify(index)]
							.choicenum_2) + 1;
						// this.pushData_discussion_huizong(this.discussion_huizong[JSON.stringify(index)])
						this.discussion_huizong[JSON.stringify(index)].xiugai = 1
						this.upload_to_server({
							'form': 'handle_dianzhan',
							'nickName': this.userInfo.nickName,
							'phonenum': this.phonenum,
							'openid': this.openid,
							'handle_id': this.discussion_huizong[JSON.stringify(index)].handle_id,
							'choicenum_1': 0,
							'choicenum_2': 1,
							'choicenum_3': 0,
							'choicenum_4': 0,
							'choicenum_5': 0,
							'choicenum_6': 0,
							'handle_fandui': 0,
						});

					}
				}

			},
		}
	}
</script>

<style>
	.blue {
		color: #0000FF;
	}

	.erxuanyi_table {
		width: 680upx;
		font-size: 25upx;
		margin: 12upx 0upx;
		background-color: #F8F8F8;
		flex-flow: column;
		padding: 12upx 35upx 22upx 35upx;

	}

	.uni-list-cell {
		width: 80%;
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		padding: 12upx 20upx;

	}

	.biliview {
		position: absolute;
		right: -74upx;
		top: 14upx;
		color: #007AFF;
	}

	.uni-list-cell-hover {
		background-color: #eee;
	}




	.iconhover {
		font-weight: bold;
		color: red;

	}

	.iconview {
		position: relative;
		left: 10upx;
		top: 3upx;
		border-radius: 100upx;
		background-color: MediumVioletRed;
		color: white;
		height: 26upx;
		padding: 0px 11upx;
		line-height: 26upx;
		font-size: 15upx;
	}

	.zhanchen {

		border-radius: 1upx;
		border: 1upx solid red;
		color: red;
		height: 38upx;
		padding: 0px 13upx;
		line-height: calc(38upx - 2px);
		font-size: 27upx;


	}

	.zhanchen_shuzi {
		height: 38upx;
		line-height: 38upx;
		color: red;
	}

	.fandui {

		border-radius: 1upx;
		border: 1upx solid blue;
		color: blue;
		height: 38upx;
		padding: 0px 23upx;
		line-height: calc(38upx - 2px);
		font-size: 27upx;

	}

	.fandui_shuzi {
		height: 38upx;
		line-height: 38upx;
		color: blue;
	}

	.dark_bacgound {
		background-color: #D3D3D3;
	}

	.dark_bacgound_red {
		background-color: red;
		color: white;
	}

	.dark_bacgound_blue {
		background-color: blue;
		color: white;
	}



	.progress_red {
		height: 20upx;
		background-color: Crimson;
		background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
		background-size: 36px 36px;
		animation: progress-bar-stripes 2s linear infinite;
	}

	.progress_blue {
		height: 20upx;
		background-color: DodgerBlue;
		background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
		background-size: 36px 36px;
		animation: progress-bar-stripes 2s linear infinite;
	}



	@keyframes progress-bar-stripes {
		from {
			background-position: 36px 0
		}

		to {
			background-position: 0 0
		}
	}
</style>
