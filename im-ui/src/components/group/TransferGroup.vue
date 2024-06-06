<template>
	<el-dialog title="转移群主" :visible.sync="visible" width="400px" :before-close="onClose">
		<div class="agm-container">
			<div class="agm-l-box">
				<el-input width="200px" placeholder="搜索群成员" class="input-with-select" v-model="searchText">

				</el-input>
				<el-scrollbar style="height:400px;">
					<div v-for="(friend, index) in friends" :key="friend.userId">
						<friend-item-alias-name v-show="friend.userId!=ownerId&&friend.aliasName&&friend.aliasName.startsWith(searchText)" @click.native="onSwitchCheck(friend)" :friend="friend"	:menu="false" :index="index" :active="false">
							<el-checkbox @click.native.stop="" class="agm-friend-checkbox" v-model="friend.isCheck" v-show="friend.isCheck"
								size="medium"></el-checkbox>
						</friend-item-alias-name>
					</div>
				</el-scrollbar>
			</div>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button @click="onClose()">取 消</el-button>
			<el-button type="primary" @click="onOk()">确 定</el-button>
		</span>
	</el-dialog>
</template>

<script>
import FriendItemAliasName from '../friend/FriendItemAliasName.vue';

export default {
	name: "transferGroup",
	components: {
		FriendItemAliasName
	},
	data() {
		return {
			searchText: "",
			friends: []
		}
	},
	methods: {
		onClose() {
			this.$emit("close");
		},
		onOk() {
			let newOwner = null
			this.friends.forEach((i) => {
				if (i.isCheck) {
					newOwner = i
				}
			})
			this.$emit("onOk", newOwner)
		},
		onRemoveFriend(friend, index) {
			friend.isCheck = false;
		},
		onSwitchCheck(friend) {
			let check = friend.isCheck
			if (!friend.disabled) {
				this.friends.forEach((i) => {
					this.$set(i, 'isCheck', false)
				})
				friend.isCheck = !check
				// this.onClose()
			}
		}
	},
	props: {
		visible: {
			type: Boolean
		},
		groupId: {
			type: Number
		},
		ownerId: {
			type: Number
		},
		members: {
			type: Array
		}
	},
	mounted() {
			this.friends = JSON.parse(JSON.stringify(this.members))
	},
	computed: {
		checkCount() {
			return this.friends.filter((f) => f.isCheck && !f.disabled).length;
		}
	},
	watch: {
		visible() {
			console.log(this.friends,this.members)
			this.friends = JSON.parse(JSON.stringify(this.members))
		}
	}
}
</script>

<style lang="scss">
.agm-container {
	display: flex;

	.agm-l-box {
		flex: 1;
		border: #53a0e79c solid 1px;
		border-radius: 5px;
		overflow: hidden;

		.el-checkbox {
			display: flex;
			align-items: center;

			//修改选中框的大小
			.el-checkbox__inner {
				width: 20px;
				height: 20px;

				//修改选中框中的对勾的大小和位置
				&::after {
					height: 12px;
					left: 7px;
				}
			}

			//修改点击文字颜色不变
			.el-checkbox__input.is-checked+.el-checkbox__label {
				color: #333333;
			}

			.el-checkbox__label {
				line-height: 20px;
				padding-left: 8px;
			}
		}

		.agm-friend-checkbox {
			width: 15px;
			height: 15px;
			position: absolute;
			left:4px;
			top:4px;
			border: none;
			border-radius: 999999px;
			overflow: hidden;
			box-sizing: border-box;
			background-color: transparent;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.agm-arrow {
		display: flex;
		align-items: center;
		font-size: 20px;
		padding: 5px;
		font-weight: 600;
		color: #53a0e7cc;
	}

	.agm-r-box {
		flex: 1;
		border: #53a0e79c solid 1px;
		border-radius: 5px;

		.agm-select-tip {
			text-align: left;
			height: 40px;
			line-height: 40px;
			text-indent: 5px;
		}
	}
}
</style>