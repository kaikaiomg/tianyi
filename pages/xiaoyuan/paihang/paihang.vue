<template>

	<view class="" style="width: 100%;height: 100%; flex-flow: column;justify-content: center;align-items: center;padding-top: 120upx;">
		<view style="width: 480upx;background-color: white;flex-flow: column;padding: 10upx;">
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
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="grey_view" style="width: 30%;">
					Top3
				</view>
				<view class="grey_view" style="width: 68%;">
					192.168.1.3
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="white_view" style="width: 30%;">
					Top4
				</view>
				<view class="white_view" style="width: 68%;">
					192.168.1.4
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="grey_view" style="width: 30%;">
					Top5
				</view>
				<view class="grey_view" style="width: 68%;">
					192.168.1.5
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="white_view" style="width: 30%;">
					Top6
				</view>
				<view class="white_view" style="width: 68%;">
					192.168.1.61
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="white_view" style="width: 30%;">
					Top7
				</view>
				<view class="white_view" style="width: 68%;">
					192.168.10.4
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="grey_view" style="width: 30%;">
					Top8
				</view>
				<view class="grey_view" style="width: 68%;">
					192.168.11.5
				</view>
			</view>
			<view style="flex-flow: row;justify-content: space-between;margin: 5upx 0upx;">
				<view class="white_view" style="width: 30%;">
					Top9
				</view>
				<view class="white_view" style="width: 68%;">
					192.168.12.6
				</view>
			</view>
		</view>



	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		}
	}
</script>

<style>
	.grey_view {
		background-color: #C0C0C0;
		color: black;
		font-size: 20upx;
		height: 50upx;
		line-height: 50upx;
		justify-content: center;
	}

	.white_view {
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
