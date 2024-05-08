<template>
	<el-dialog class="search" title="搜索聊天记录" :visible.sync="visible" width="800px" :before-close="onClose">
		<div class="search-list-header">
			<!-- <el-button @click="onBack()" class="el-icon-back"></el-button> -->
			<el-input placeholder="搜索" v-model="searchText" @keyup.enter.native="onSearchResult">
				<el-button slot="append" icon="el-icon-search" @click="onSearchResult"></el-button>
			</el-input>
		</div>
		<div class="search-list-box">
			<div class="search-list">
				<el-scrollbar class="search-list-items">
					<div v-for="(chat, index) in transferArr.messageArrs" :key="index">
						<chat-item :chat="chat" v-if="chat.messages.length > 0" :index="index" @click.native="onActiveItem(chat)"
							:ifRightMenu="false"></chat-item>
					</div>
				</el-scrollbar>
			</div>
		</div>
		<div class="search-msg-box">
			<div class="search-msg-item">
				<ul>
					<li v-for="(msgInfo, idx) in itemList.messages" :key="idx">
						<p :class="{ 'chat-time': true, 'chat-time-left': true, 'chat-time-right': (msgInfo.sendId == mine.id) }">
							{{ formatChatTime(msgInfo.sendTime) }}
						</p>
						<chat-message-item :mine="msgInfo.sendId == mine.id" :headImage="headImage(msgInfo)" :applyRightMenu="false"
							:showReadStatus="false" :showName="showName(msgInfo)" :msgInfo="msgInfo">
						</chat-message-item>
						<p class="search-msg-btn" :class="{ 'alignment': msgInfo.sendId == mine.id }"
							@click="viewContext(itemList, msgInfo)">查看上下文</p>
					</li>
				</ul>
			</div>
		</div>
		<!-- <el-button type="primary" size="default" @click="onSearchResult">搜索</el-button> -->
	</el-dialog>
</template>

<script>
import ChatItem from "@/components/chat/ChatItem.vue";
import MessageItem from "@/components/search/messageItem.vue";
import ChatBox from "@/components/chat/ChatBox.vue";
import userStore from '@/store/userStore';
import ChatMessageItem from "@/components/chat/ChatMessageItem.vue";

export default {
	name: "Search",
	components: {
		ChatItem,
		ChatBox,
		ChatMessageItem,
		MessageItem
	},
	data() {
		return {
			userInfo: {},

			searchText: "",
			messageContent: "",
			group: {},
			groupMembers: [],

			searchUserResult: [],
			searchMessageResult: [],

			searchSelect: false,
			itemList: {},
			transferArr: {},
		}
	},
	mounted() {
		// this.searchText = sessionStorage.getItem('lastSearch')
		// this.searchText && this.onSearchResult()
	},
	methods: {
		onBack() {
			this.$router.go(-1);
		},
		onClose() {
			this.$emit("close");
		},

		onActiveItem(index) {
			this.itemList = index
		},
		viewContext(i, item) {
			item.showName = i.showName
			item.chatType = i.type
			item.targetId = i.targetId
			item.headImage = i?.headImage
			item.belonging = i
			item.source = 'message'
			this.$store.commit("checkChat", item);
			this.onClose()
		},
		onSearchResult() {
			let arr = [];
			let key = "chats-" + userStore.state.userInfo.id;

			this.usreInfo = JSON.parse(localStorage.getItem(key))
			this.chatStore.chats.forEach(i => {
				if (i.showName.startsWith(this.searchText)) {
					i.source = 'chat'
					arr.push(i)
				}
			})
			this.searchUserResult = arr
			this.transferArr = this.fuzzyQuery(this.usreInfo, this.searchText)
			this.searchMessageResult = this.transferArr?.resultArr || ''
			sessionStorage.setItem('lastSearch', this.searchText)
		},
		fuzzyQuery(val, key) {
			let messageArrs = val.chats, resultArr = []
			key = key.trim()
			let regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
			messageArrs.forEach(i => {
				let arr = []
				arr = i.messages = i.messages.filter(item => item.content && (regex.test(item.content) || regex.test(item.sendNickName)) && item.type !== 21)
				resultArr.push(...arr)
			})

			return { resultArr, messageArrs }
		},
		showName(msgInfo) {
			if (this.itemList.type == 'GROUP') {
				let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
				return member ? member.aliasName : "";
			} else {
				return msgInfo.sendId == this.mine.id ? this.mine.nickName : this.itemList.showName
			}

		},
		headImage(msgInfo) {
			if (this.itemList.type == 'GROUP') {
				let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
				return member ? member.headImage : "";
			} else {
				return msgInfo.sendId == this.mine.id ? this.mine.headImageThumb : this.itemList.headImage
			}
		},

		formatChatTime(time) {
			time = this.dateFormat("YY-mm-dd HH:MM:SS", new Date(time));
			let date = time.toString();
			let year = date.split("-")[0];
			let month = date.split("-")[1];
			let day = date.split("-")[2];
			let d1 = new Date(year + '/' + month + '/' + day.split(" ")[0]);
			let d3 = new Date(date.replace(/-/g, "/"));
			let dd = new Date();
			let y = dd.getFullYear();
			let m = dd.getMonth() + 1;
			let d = dd.getDate();
			let d2 = new Date(y + '/' + m + '/' + d);
			let iday = parseInt(d2 - d1) / 1000 / 60 / 60 / 24;
			let hours = d3.getHours();
			let minutes = d3.getMinutes();
			if (minutes < 10) {
				minutes = '0' + minutes;
			}
			if (hours < 10) {
				hours = '0' + hours;
			}
			if (iday == 0) {
				if (hours >= 12) {
					return "下午 " + hours + ":" + minutes;
				} else {
					return "上午 " + hours + ":" + minutes;
				}
			} else if (iday == 1) {
				let dt = "";
				if (hours >= 12) {
					dt = "下午 " + hours + ":" + minutes;
				} else {
					dt = "上午 " + hours + ":" + minutes;
				}
				return "昨天 " + dt;
			} else if (iday == 2) {
				let dt = "";
				if (hours >= 12) {
					dt = "下午 " + hours + ":" + minutes;
				} else {
					dt = "上午 " + hours + ":" + minutes;
				}
				return "前天 " + dt;
			} else {
				return year + '/' + month + "/" + d1.getDate()
			}
		},
		dateFormat(fmt, date) {
			let ret;
			const opt = {
				"Y+": date.getFullYear().toString(), // 年
				"m+": (date.getMonth() + 1).toString(), // 月
				"d+": date.getDate().toString(), // 日
				"H+": date.getHours().toString(), // 时
				"M+": date.getMinutes().toString(), // 分
				"S+": date.getSeconds().toString() // 秒
			}
			for (let k in opt) {
				ret = new RegExp("(" + k + ")").exec(fmt);
				if (ret) {
					fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
				}
			}
			return fmt
		}
	},
	computed: {
		chatStore() {
			return this.$store.state.chatStore;
		},
		loading() {
			return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
		},
		mine() {
			return this.$store.state.userStore.userInfo;
		},
	},
	props: {
		visible: {
			type: Boolean
		}
	},
	watch: {
		visible() {
			this.searchText = sessionStorage.getItem('lastSearch')
			this.searchText && this.onSearchResult()
		}
	}
}
</script>

<style lang="scss" scoped>
.search {
	::v-deep .el-dialog {
		height: 80vh;
		margin-top: 10vh !important;

		.el-dialog__title {
			font-size: 14px;
		}

		.el-dialog__body {
			display: flex;
			overflow: hidden;
			box-sizing: border-box;
			height: calc(100% - 55px);
			flex-wrap: wrap;
		}

		.search-list-header {
			display: flex;
			height: 30px;
			flex: 100% 0 0;
			padding: 0 30px;
			margin-bottom: 5px;
			font-size: 16px;

			&,
			& * {
				box-sizing: border-box;
			}

			.el-input__inner {
				width: 100%;
				height: 30px;
			}
		}

		.search-list-box {
			// width: 100%;
			width: 200px;

			.search-list {
				height: calc(100% - 40px);
				overflow-y: auto;
			}
		}

		.search-msg-box {
			flex: 50% 1 1;
			height: calc(100% - 40px);
			overflow-y: auto;

			.search-msg-item {
				>ul {
					padding: 0 20px;

					li {
						list-style-type: none;

						.chat-time {}

						.chat-time-left {
							text-align: left;
						}
						.chat-time-right {
							text-align: right;
						}

						.search-msg-btn {
							opacity: 0;
						}

						&:hover {
							.search-msg-btn {
								color: #409EFF;
								text-align: left;
								opacity: 1;
								cursor: pointer;
							}

							.alignment {
								text-align: right;
							}
						}

					}
				}
			}
		}

	}
}

.avatar-uploader {
	.el-upload {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.el-upload:hover {
		border-color: #409EFF;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}
}
</style>
