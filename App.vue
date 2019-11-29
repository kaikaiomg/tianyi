<script>
	export default {
		onLaunch: function () {
			console.log('App Launch')
		},
		onShow: function () {
			console.log('App Show')
		},
		onHide: function () {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import './common/common.css';
	/* @import './common/colorui.css'; */
	page{
		display: flex;
     	min-height: 100%;
		background-color: #EFEFEF;
	}

	view{
		display: flex;
	}
</style>
