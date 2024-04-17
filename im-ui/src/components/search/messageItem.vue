<template>
	<div class="message-item">
		<div class="message-left">
			<head-image :url="message.headImage" :name="message.showName" :size="45"
				:id="message.type=='PRIVATE'?message.targetId:0"></head-image>
		</div>
		<div class="message-right">
			<div class="message-name">
				<div class="message-name-text">{{message.showName}}</div>
			</div>
			<div class="message-content">
				<div class="message-send-name" v-show="message.sendNickName">{{message.sendNickName+':&nbsp;'}}</div>
				<div class="message-content-text" v-html="$emo.transform(message.content)"></div>
			</div>
		</div>
	</div>

</template>

<script>
import HeadImage from '../common/HeadImage.vue';

	export default {
		name: "messageItem",
		components: {
			HeadImage,
		},
		data() {
			return {
			}
		},
		props: {
			message: {
				type: Object
			},
			active: {
				type: Boolean
			},
			index: {
				type: Number
			},
			ifRightMenu:{
				type: Boolean,
				default: true,
			}
		},
		methods: {
		},
		computed: {
			showTime() {
				return this.$date.toTimeText(this.message.lastSendTime, true)
			},
		}
	}
</script>

<style lang="scss">
	.message-item {
		height: 50px;
		display: flex;
		margin-bottom: 1px;
		position: relative;
		padding: 5px;
		padding-left: 10px;
		align-items: center;
		background-color: #fafafa;
		white-space: nowrap;
		color: black;
		cursor: pointer;

		&:hover {
			background-color: #eeeeee;
		}

		&.active {
			background-color: #e8e8f0;
		}

		.message-left {
			position: relative;
			display: flex;
			width: 45px;
			height: 45x;

			.unread-text {
				position: absolute;
				background-color: #f56c6c;
				right: -5px;
				top: -5px;
				color: white;
				border-radius: 30px;
				padding: 1px 5px;
				font-size: 10px;
				text-align: center;
				white-space: nowrap;
				border: 1px solid #f1e5e5;
			}
		}


		.message-right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding-left: 10px;
			text-align: left;
			overflow: hidden;

			.message-name {
				display: flex;
				line-height: 25px;
				height: 25px;
				.message-name-text {
					flex: 1;
					font-size: 15px;
					font-weight: 600;
					white-space: nowrap;
					overflow: hidden;
				}
				
				
				.message-time-text{
					font-size: 13px;
					text-align: right;
					color: #888888;
					white-space: nowrap;
					overflow: hidden;
					padding-left: 10px;
				}
			}

			.message-content {
				display: flex;
				line-height: 22px;
				
				.message-at-text {
					color: #c70b0b;
					font-size: 12px;
				}
				
				.message-send-name{
					font-size: 13px;
				}
					

				.message-content-text {
					flex: 1;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					font-size: 13px;	
					img {
						width: 20px !important;
						height: 20px !important;
						vertical-align: bottom;
					}
				}

			}
		}
	}
</style>