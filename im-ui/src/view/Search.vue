<template>
	<div class="search">
		<div class="search-list-box">
			<div class="search-list-header">
				<el-button @click="onBack()" class="el-icon-back"></el-button>
				<el-input placeholder="搜索" v-model="searchText" @keyup.enter.native="onSearchResult">
					<el-button slot="append" icon="el-icon-search" @click="onSearchResult"></el-button>
				</el-input>
			</div>
			<el-scrollbar class="search-list-items">
				<div v-for="(chat, index) in searchUserResult" :key="index">
					<chat-item :chat="chat" :index="index" @click.native="onActiveItem(chat)" :ifRightMenu="false"
						></chat-item>
				</div>
			</el-scrollbar>
			<el-scrollbar class="search-list-items">
				<div v-for="(message, index) in searchMessageResult" :key="index">
					<message-item :message="message" :index="index" @click.native="onActiveItem(message)" ></message-item>
				</div>
			</el-scrollbar>
		</div>
		<!-- <el-button type="primary" size="default" @click="onSearchResult">搜索</el-button> -->

	</div>
</template>

<script>
import ChatItem from "@/components/chat/ChatItem.vue";
import MessageItem from "@/components/search/messageItem.vue";
import ChatBox from "@/components/chat/ChatBox.vue";
import userStore from '@/store/userStore';

export default {
	name: "Search",
	components: {
		ChatItem,
		ChatBox,
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
		}
	},
	mounted() {

	},
	methods: {
		onBack() {
			this.$router.go(-1);
		},

		onActiveItem(index) {
			this.$router.push('/home/chat')
			this.$store.commit("checkChat", index);
		},
		onSearchResult() {
			let arr = [];
			let key = "chats-" + userStore.state.userInfo.id;

			this.usreInfo = JSON.parse(localStorage.getItem(key))

			this.chatStore.chats.forEach(i => {
				if(i.showName.startsWith(this.searchText) ){
					i.source = 'chat'
					arr.push(i)
				}
			})

			this.searchUserResult = arr
			this.searchMessageResult = this.fuzzyQuery(this.usreInfo, this.searchText)
		},
		fuzzyQuery(val, key) {
			let messageArrs = val.chats, resultArr = []
			key = key.trim()
			let regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
			messageArrs.forEach(i => {
				let arr = []
				arr = i.messages.filter(item => item.content && (regex.test(item.content) || regex.test(item.sendNickName)) && item.type !== 21)
				arr.forEach(item=>{
					item.showName = i.showName
					item.type = i.type
					item.targetId = i.targetId
					item.headImage = i?.headImage
					item.belonging = i
					item.source = 'message'
				})
				resultArr.push(...arr)
			})

			return resultArr
		},
	},
	computed: {
		chatStore() {
			return this.$store.state.chatStore;
		},
		loading() {
			return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
		}
	},
	watch: {
	}
}
</script>

<style lang="scss" scoped>
.search {
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

	.search-list-box {
		width: 100% !important;

		.search-list-header {
			display: flex;
		}
	}
}
</style>
