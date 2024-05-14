<template>
	<el-container class="chat-page">
		<el-aside width="260px" class="chat-list-box">
			<div class="chat-list-header">
				<el-input width="200px" placeholder="搜索" v-model="searchText" @focus="onSearchFocus" @blur="onSearchBlur">
					<!-- <el-button slot="append" icon="el-icon-search" @click="onSearchMsgBtn" ></el-button> -->
				</el-input>
			</div>
			<div class="chat-list-loadding" v-if="loading" v-loading="true" element-loading-text="消息接收中..."
				element-loading-spinner="el-icon-loading" element-loading-background="#eee">
				<div class="chat-loading-box"></div>
			</div>
			<el-scrollbar class="chat-list-items">
				<div class="searchMsgBtn" @click="onSearchMsgBtn" v-show="showSearchBtn">搜索聊天记录</div>
				<div v-for="(chat, index) in chatStore.chats" :key="index">
					<chat-item v-show="chatItemShowFn(chat)" :chat="chat" :index="index" @click.native="onActiveItem(index)"
						@delete="onDelItem(index)" @top="onTop(index)" :active="chat === chatStore.activeChat"></chat-item>
				</div>
			</el-scrollbar>
		</el-aside>
		<el-container class="chat-box">
			<chat-box v-if="chatStore.activeChat" :chat="chatStore.activeChat"></chat-box>
		</el-container>
	</el-container>
</template>

<script>
import ChatItem from "../components/chat/ChatItem.vue";
import ChatBox from "../components/chat/ChatBox.vue";

export default {
	name: "chat",
	components: {
		ChatItem,
		ChatBox
	},
	data() {
		return {
			searchText: "",
			messageContent: "",
			group: {},

			searchSelect: false,
			showSearchBtn: false,
		}
	},
	methods: {
		onActiveItem(index) {
			this.$store.commit("activeChat", index);
		},
		onDelItem(index) {
			this.$store.commit("removeChat", index);
		},
		onTop(chatIdx) {
			this.$store.commit("moveTop", chatIdx);
		},
		onSearchFocus() {
			this.showSearchBtn = true
		},
		onSearchBlur() {
			setTimeout(() => {
				this.showSearchBtn = false
			}, 300);
		},
		onSearchMsgBtn() {
			this.$store.commit('setSearchDialog', true)
			sessionStorage.setItem('lastSearch', this.searchText)
		},
		chatItemShowFn(chat) {
			let ifShow,
				groups = this.groupStore.groupMembers
			if (chat.type === 'GROUP') {
				groups[chat.targetId]?.members.forEach(item => {
					if (item.aliasName.indexOf(this.searchText) != '-1') {
						ifShow = true
					}
				})
				ifShow = ifShow || chat?.showName.indexOf(this.searchText) != '-1'
			} else {
				ifShow = chat.showName.indexOf(this.searchText) != '-1'
			}
			return ifShow
		}
	},
	computed: {
		chatStore() {
			return this.$store.state.chatStore;
		},
		loading() {
			return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
		},
		groupStore() {
			return this.$store.state.groupStore;
		},
	}
}
</script>

<style lang="scss">
.chat-page {
	.chat-list-box {
		display: flex;
		flex-direction: column;
		border: #dddddd solid 1px;
		background: white;
		width: 3rem;

		.chat-list-header {
			padding: 5px;
			background-color: white;
			line-height: 50px;
		}

		.chat-list-loadding {
			height: 50px;
			background-color: #eee;

			.chat-loading-box {
				height: 100%;
			}
		}

		.chat-list-items {
			flex: 1;
		}
	}

	.searchMsgBtn {
		height: 50px;
		line-height: 50px;
		text-align: center;
		font-size: 16px;

		&:hover {
			cursor: pointer;
			background-color: #f1f1f1;
		}
	}
}
</style>