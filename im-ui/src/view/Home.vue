<template>
	<el-container class="home-page">
		<el-aside width="80px" class="navi-bar">
			<div class="user-head-image">
				<head-image :name="$store.state.userStore.userInfo.nickName" :url="$store.state.userStore.userInfo.headImageThumb"
					:size="60" @click.native="showSettingDialog = true">
				</head-image>
			</div>
			<el-menu background-color="#333333" text-color="#ddd" style="margin-top: 30px;">
				<el-menu-item title="聊天">
					<router-link v-bind:to="'/home/chat'">
						<span class="el-icon-chat-dot-round"></span>
						<div v-show="unreadCount > 0" class="unread-text">{{ unreadCount }}</div>
					</router-link>
				</el-menu-item>
				<el-menu-item title="好友管理">
					<router-link v-bind:to="'/home/friend'">
						<span class="el-icon-user"></span>
					</router-link>
				</el-menu-item>
				<el-menu-item title="群管理">
					<router-link v-bind:to="'/home/group'">
						<span class="icon iconfont icon-group_fill"></span>
					</router-link>
				</el-menu-item>
				<el-menu-item title="搜索" @click="showSearch()">
					<span class="el-icon-search"></span>
					<!-- <el-menu-item title="搜索">
					<router-link v-bind:to="'/home/search'">
						<span class="el-icon-search"></span>
					</router-link> -->
				</el-menu-item>
				<el-menu-item title="设置" @click="showSetting()">
					<span class="el-icon-setting"></span>
				</el-menu-item>
			</el-menu>
			<div class="exit-box" @click="onExit()" title="退出">
				<span class="el-icon-circle-close"></span>
			</div>
		</el-aside>
		<el-main class="content-box">
			<router-view></router-view>
		</el-main>
		<Search :visible="showSearchDialog" @close="closeSearch()"></Search>
		<setting :visible="showSettingDialog" @close="closeSetting()"></setting>
		<user-info v-show="uiStore.userInfo.show" :pos="uiStore.userInfo.pos" :user="uiStore.userInfo.user"
			@close="$store.commit('closeUserInfoBox')"></user-info>
		<full-image :visible="uiStore.fullImage.show" :url="uiStore.fullImage.url"
			@close="$store.commit('closeFullImageBox')"></full-image>
		<chat-private-video ref="privateVideo" :visible="uiStore.chatPrivateVideo.show"
			:friend="uiStore.chatPrivateVideo.friend" :master="uiStore.chatPrivateVideo.master"
			:offer="uiStore.chatPrivateVideo.offer" @close="$store.commit('closeChatPrivateVideoBox')">
		</chat-private-video>
		<chat-video-acceptor ref="videoAcceptor" v-show="uiStore.videoAcceptor.show" :friend="uiStore.videoAcceptor.friend"
			@close="$store.commit('closeVideoAcceptorBox')">
		</chat-video-acceptor>
	</el-container>
</template>

<script>
import HeadImage from '../components/common/HeadImage.vue';
import Setting from '../components/setting/Setting.vue';
import UserInfo from '../components/common/UserInfo.vue';
import FullImage from '../components/common/FullImage.vue';
import ChatPrivateVideo from '../components/chat/ChatPrivateVideo.vue';
import ChatVideoAcceptor from '../components/chat/ChatVideoAcceptor.vue';
import Search from './Search.vue'
export default {
	components: {
		HeadImage,
		Setting,
		UserInfo,
		FullImage,
		ChatPrivateVideo,
		ChatVideoAcceptor,
		Search,
	},
	data() {
		return {
			showSettingDialog: false,
			lastPlayAudioTime: new Date() - 1000,
			changeVal: 0,
			notice: null,
		}
	},
	methods: {
		init() {
			this.$store.dispatch("load").then(() => {
				this.getGroupMembers()
				// ws初始化
				this.$wsApi.connect(window.urlConfig.VUE_APP_WS_URL, sessionStorage.getItem("accessToken"));
				this.$wsApi.onConnect(() => {
					// 加载离线消息
					this.pullPrivateOfflineMessage(this.$store.state.chatStore.privateMsgMaxId);
					this.pullGroupOfflineMessage(this.$store.state.chatStore.groupMsgMaxId);
				});

				this.$wsApi.onMessage((cmd, msgInfo) => {
					if (cmd == 2) {
						// 关闭ws
						this.$wsApi.close(3000)
						// 异地登录，强制下线
						this.$alert("您已在其他地方登录，将被强制下线", "强制下线通知", {
							confirmButtonText: '确定',
							callback: action => {
								location.href = "/";
							}
						});

					} else if (cmd == 3) {
						// 插入私聊消息
						this.handlePrivateMessage(msgInfo);
						// this.Notmessage()
					} else if (cmd == 4) {
						// 插入群聊消息
						this.handleGroupMessage(msgInfo);
					}
				});
				this.$wsApi.onClose((e) => {
					console.log(e);
					if (e.code != 3000) {
						// 断线重连
						this.$message.error("连接断开，正在尝试重新连接...");
						this.$wsApi.reconnect(window.urlConfig.VUE_APP_WS_URL, sessionStorage.getItem("accessToken"));
					}
				});
			}).catch((e) => {
				console.log("初始化失败", e);
			})
		},
		async getGroupMembers() {
			let groups = JSON.parse(JSON.stringify(this.$store.state.groupStore.groups))
			if (!groups || !groups.length) { return false }
			let getGroupMember = async (id) => {
				return await this.$http({
					url: `/group/members/${id}`,
					method: "get"
				}).then((members) => {
					return members
				})
			}
			for (let i = 0; i < groups.length; i++) {
				let val = await getGroupMember(groups[i].id)
				this.$set(groups[i], 'members', val)
			}
			let groupsObj = {}
			groups.forEach(item => {
				this.$set(groupsObj, item.id, item)
			})
			this.$store.commit('setGroupMembers', groupsObj)
		},
		pullPrivateOfflineMessage(minId) {
			this.$http({
				url: "/message/private/pullOfflineMessage?minId=" + minId,
				method: 'get'
			});
		},
		pullGroupOfflineMessage(minId) {
			this.$http({
				url: "/message/group/pullOfflineMessage?minId=" + minId,
				method: 'get'
			});
		},
		handlePrivateMessage(msg) {
			// 消息加载标志
			if (msg.type == this.$enums.MESSAGE_TYPE.LOADDING) {
				this.$store.commit("loadingPrivateMsg", JSON.parse(msg.content))
				return;
			}
			// 消息已读处理，清空已读数量
			if (msg.type == this.$enums.MESSAGE_TYPE.READED) {
				this.$store.commit("resetUnreadCount", {
					type: 'PRIVATE',
					targetId: msg.recvId
				})
				return;
			}
			// 消息回执处理,改消息状态为已读
			if (msg.type == this.$enums.MESSAGE_TYPE.RECEIPT) {
				this.$store.commit("readedMessage", { friendId: msg.sendId })
				return;
			}
			// 标记这条消息是不是自己发的
			msg.selfSend = msg.sendId == this.$store.state.userStore.userInfo.id;
			// 好友id
			let friendId = msg.selfSend ? msg.recvId : msg.sendId;
			this.loadFriendInfo(friendId).then((friend) => {
				this.insertPrivateMessage(friend, msg);
			})
		},
		insertPrivateMessage(friend, msg) {
			// webrtc 信令
			if (msg.type >= this.$enums.MESSAGE_TYPE.RTC_CALL &&
				msg.type <= this.$enums.MESSAGE_TYPE.RTC_CANDIDATE) {
				// 呼叫
				if (msg.type == this.$enums.MESSAGE_TYPE.RTC_CALL ||
					msg.type == this.$enums.MESSAGE_TYPE.RTC_CANCEL) {
					this.$store.commit("showVideoAcceptorBox", friend);
					this.$refs.videoAcceptor.handleMessage(msg)
				} else {
					this.$refs.videoAcceptor.close()
					this.$refs.privateVideo.handleMessage(msg)
				}
				return;
			}

			let chatInfo = {
				type: 'PRIVATE',
				targetId: friend.id,
				showName: friend.nickName,
				headImage: friend.headImage
			};
			// 打开会话
			this.$store.commit("openChat", chatInfo);
			// 插入消息
			this.$store.commit("insertMessage", msg);
			// 播放提示音
			if (!msg.selfSend && msg.status != this.$enums.MESSAGE_STATUS.READED) {
				this.playAudioTip();
			}
		},
		handleGroupMessage(msg) {
			// 消息加载标志
			if (msg.type == this.$enums.MESSAGE_TYPE.LOADDING) {
				this.$store.commit("loadingGroupMsg", JSON.parse(msg.content))
				return;
			}
			// 消息已读处理
			if (msg.type == this.$enums.MESSAGE_TYPE.READED) {
				// 我已读对方的消息，清空已读数量
				let chatInfo = {
					type: 'GROUP',
					targetId: msg.groupId
				}
				this.$store.commit("resetUnreadCount", chatInfo)
				return;
			}
			// 消息回执处理
			if (msg.type == this.$enums.MESSAGE_TYPE.RECEIPT) {
				// 更新消息已读人数
				let msgInfo = {
					id: msg.id,
					groupId: msg.groupId,
					readedCount: msg.readedCount,
					receiptOk: msg.receiptOk
				};
				this.$store.commit("updateMessage", msgInfo)
				return;
			}
			// 标记这条消息是不是自己发的
			msg.selfSend = msg.sendId == this.$store.state.userStore.userInfo.id;
			this.loadGroupInfo(msg.groupId).then((group) => {
				// 插入群聊消息
				this.insertGroupMessage(group, msg);
			})
		},
		insertGroupMessage(group, msg) {
			let chatInfo = {
				type: 'GROUP',
				targetId: group.id,
				showName: group.remark,
				headImage: group.headImageThumb
			};
			// 打开会话
			this.$store.commit("openChat", chatInfo);
			// 插入消息
			this.$store.commit("insertMessage", msg);
			// 播放提示音
			if (!msg.selfSend && msg.status != this.$enums.MESSAGE_STATUS.READED) {
				this.playAudioTip();
			}
		},
		onExit() {
			this.$wsApi.close(3000);
			sessionStorage.removeItem("accessToken");
			this.delCookie('accessToken');
			location.href = "/";
		},
		// 删除cookie
		delCookie(name) {
			var exp = new Date();
			exp.setTime(exp.getTime() - 1);
			var cval = this.getCookie(name);
			if (cval != null) {
				document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
			}
		},
		// 获取cookie、
		getCookie(name) {
			let reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
			let arr = document.cookie.match(reg)
			if (arr) {
				return unescape(arr[2]);
			}
			return '';
		},
		playAudioTip() {
			if (new Date() - this.lastPlayAudioTime > 1000) {
				this.lastPlayAudioTime = new Date();
				let audio = new Audio();
				let url = require(`@/assets/audio/tip.wav`);
				audio.src = url;
				audio.play();
			}

		},
		showSetting() {
			this.showSettingDialog = true;
		},
		closeSetting() {
			this.showSettingDialog = false;
		},
		showSearch() {
			// this.showSearchDialog = true;
			this.$store.commit('setSearchDialog', true)
		},
		closeSearch() {
			this.$store.commit('setSearchDialog', false)
			// this.showSearchDialog = false;
		},
		loadFriendInfo(id) {
			return new Promise((resolve, reject) => {
				let friend = this.$store.state.friendStore.friends.find((f) => f.id == id);
				if (friend) {
					resolve(friend);
				} else {
					this.$http({
						url: `/friend/find/${id}`,
						method: 'get'
					}).then((friend) => {
						this.$store.commit("addFriend", friend);
						resolve(friend)
					})
				}
			});
		},
		loadGroupInfo(id) {
			return new Promise((resolve, reject) => {
				let group = this.$store.state.groupStore.groups.find((g) => g.id == id);
				if (group) {
					resolve(group);
				} else {
					this.$http({
						url: `/group/find/${id}`,
						method: 'get'
					}).then((group) => {
						resolve(group)
						this.$store.commit("addGroup", group);
					})
				}
			});
		},
		Notmessage() {
			function sendNotification() {
				new Notification("通知标题：", {
					body: '收到消息，请注意查收。',
					icon: "<%= BASE_URL %>s.ico"
				})
			}
			if (window.Notification.permission == "granted") { // 判断是否有权限
				sendNotification();
			} else if (window.Notification.permission != "denied") {
				window.Notification.requestPermission(function (permission) { // 没有权限发起请求
					sendNotification();
				});
			}

		},
		sendNotificationFn() {
			this.changeVal = 1;
			this.notice = setInterval(() => {
				if (this.changeVal) {
					document.title = '有新消息，注意查看';
					this.changeVal = 0
				} else {
					document.title = process.env.VUE_APP_NAME;
					this.changeVal = 1
				}
			}, 1000);
		},
		clearSendNotification() {
			if (!this.changeVal) {
				document.title = process.env.VUE_APP_NAME;
			}
			clearInterval(this.notice)
		}
	},
	computed: {
		uiStore() {
			return this.$store.state.uiStore;
		},
		unreadCount() {
			let unreadCount = 0;
			let chats = this.$store.state.chatStore.chats;
			chats.forEach((chat) => {
				unreadCount += chat.unreadCount
			});
			return unreadCount;
		},
		showSearchDialog() {
			return this.$store.state.chatStore.showSearchDialog;
		},
		groups() {
			return this.$store.state.groupStore.groups;
		}
	},
	watch: {
		unreadCount: {
			handler(newCount, oldCount) {
				let tip = newCount > 0 ? `${newCount}条未读` : "";
				this.$elm.setTitleTip(tip);
				if (!newCount) {
					this.clearSendNotification()
				}
			},
			immediate: true
		},
		groups: {
			handler() {
				console.log('watch groups')
				this.getGroupMembers()
			},
			immediate: true
		}
	},
	mounted() {
		this.init();
	},
	beforeDestroy () {
		this.$wsApi.close();
	}
}
</script>

<style lang="scss" scoped>
.navi-bar {
	background: #333333;
	padding: 10px;
	padding-top: 50px;

	.el-menu {
		border: none;
		flex: 1;

		.el-menu-item {
			margin: 25px 0;

			.router-link-exact-active span {
				color: white !important;
			}



			span {
				font-size: 24px !important;
				color: #aaaaaa;

				&:hover {
					color: white !important;
				}
			}

			.unread-text {
				position: absolute;
				line-height: 20px;
				background-color: #f56c6c;
				left: 36px;
				top: 7px;
				color: white;
				border-radius: 30px;
				padding: 0 5px;
				font-size: 10px;
				text-align: center;
				white-space: nowrap;
				border: 1px solid #f1e5e5;
			}
		}
	}



	.exit-box {
		position: absolute;
		width: 60px;
		bottom: 40px;
		color: #aaaaaa;
		font-size: 24px;
		text-align: center;
		cursor: pointer;

		&:hover {
			color: white !important;
		}
	}
}

.content-box {
	padding: 0;
	background-color: #E9EEF3;
	color: #333;
	text-align: center;

}

::v-deep .el-menu-item {
	padding: 0;

	>a {
		display: block;
	}
}
</style>