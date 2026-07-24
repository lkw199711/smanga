<template>
	<div class="style-b">
		<!-- 侧边栏 -->
		<aside class="sb-sidebar">
			<div class="sb-logo">
				<span class="sb-logo-emoji">🌸</span>
				<span class="sb-logo-text">smanga</span>
			</div>

			<nav class="sb-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sb-nav-item', { active: i === 0 }]">
					<span class="sb-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sb-sec">
				<div class="sb-sec-title">媒体库</div>
				<div v-for="m in mediaListData" :key="m.mediaId" class="sb-sec-item" @click="goMedia(m.mediaId)">
					<span>📁 {{ m.mediaName || m.mediaId }}</span>
					<span class="sb-sec-count">{{ m.mangaCount || 0 }}</span>
				</div>
				<div v-if="mediaListData.length === 0" class="sb-sec-empty">暂无媒体库</div>
			</div>

			<div class="sb-card-hint">
				<div class="sb-card-hint-title">今日推荐 🎁</div>
				<div class="sb-card-hint-desc">打开盲盒，发现新漫画</div>
				<button class="sb-card-hint-btn">去看看</button>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sb-body">
			<!-- 顶栏 -->
			<header class="sb-topbar">
				<div class="sb-top-nav">
					<span class="sb-top-item active">发现</span>
					<span class="sb-top-item">书库</span>
					<span class="sb-top-item">最近</span>
					<span class="sb-top-item">书签</span>
					<span class="sb-top-item">排行榜</span>
				</div>
				<div class="sb-search">
					<span>🔍</span>
					<input placeholder="搜索你喜欢的漫画…" />
				</div>
				<div class="sb-top-actions">
					<button class="sb-pill">🌙</button>
					<button class="sb-pill">中/EN</button>
					<div class="sb-user-wrap" ref="userWrapRef">
						<div class="sb-user-trigger" @click="toggleUserDropdown">
							<div class="sb-avatar">
								<img v-if="avatarBlobUrl" :src="avatarBlobUrl" class="sb-avatar-img" />
								<span v-else>{{ userInfo.userName?.charAt(0) || 'U' }}</span>
							</div>
							<span class="sb-user-name">{{ userInfo.userName || 'User' }}</span>
							<span class="sb-user-arrow" :class="{ open: showUserDropdown }">▾</span>
						</div>
						<div v-if="showUserDropdown" class="sb-user-dropdown">
							<div class="sb-user-dropdown-item" @click="goSettings">⚙️ 设置</div>
							<div class="sb-user-dropdown-item sb-user-dropdown-logout" @click="userLogout">🚪 登出</div>
						</div>
					</div>
				</div>
			</header>

			<main class="sb-main">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import mediaStatsApi from '@/api/media-stats'
import { userInfo } from '@/store'
import { Cookies } from '@/utils'
import imageApi from '@/api/image'

const router = useRouter()

const menu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'media', label: '媒体库', icon: '📁' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'manage', label: '管理', icon: '⚙️' },
	{ key: 'setting', label: '设置', icon: '🔧' },
]

const mediaListData = ref<any[]>([])

onMounted(async () => {
	try {
		mediaListData.value = await mediaStatsApi.getMediaWithCounts()
	} catch {
		mediaListData.value = []
	}
})

function goMedia(mediaId: number) {
	router.push(`/t/media/${mediaId}`)
}

// ---- 用户信息 ----
const showUserDropdown = ref(false)
const avatarBlobUrl = ref('')
const userWrapRef = ref<HTMLElement | null>(null)

function toggleUserDropdown() {
	showUserDropdown.value = !showUserDropdown.value
}

function goSettings() {
	showUserDropdown.value = false
	router.push('/t/setting/user')
}

function userLogout() {
	document.cookie = 'smanga-userName=; path=/; max-age=0'
	document.cookie = 'smanga-userId=; path=/; max-age=0'
	showUserDropdown.value = false
	router.push('/login')
}

async function loadAvatar() {
	if (!userInfo.avatarPath) {
		avatarBlobUrl.value = ''
		return
	}
	avatarBlobUrl.value = await imageApi.get({ file: userInfo.avatarPath }) || ''
}

watch(() => userInfo.avatarPath, loadAvatar, { immediate: true })

function onClickOutside(e: MouseEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	if (target.closest('.sb-user-dropdown')) return
	if (target.closest('.sb-user-trigger')) return
	showUserDropdown.value = false
}

onMounted(() => {
	document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.style-b {
	display: flex;
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	position: relative;
	overflow: hidden;
}

.style-b::before {
	content: '';
	position: absolute;
	top: -100px;
	right: -100px;
	width: 400px;
	height: 400px;
	background: radial-gradient(circle, rgba(255, 111, 163, 0.25), transparent 70%);
	filter: blur(60px);
	pointer-events: none;
}

.style-b::after {
	content: '';
	position: absolute;
	bottom: -150px;
	left: 200px;
	width: 500px;
	height: 500px;
	background: radial-gradient(circle, rgba(108, 141, 255, 0.22), transparent 70%);
	filter: blur(80px);
	pointer-events: none;
}

/* 侧边栏 */
.sb-sidebar {
	flex-shrink: 0;
	width: 240px;
	margin: 16px 0 16px 16px;
	padding: 20px 14px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 16px;
}

.sb-logo-emoji {
	font-size: 24px;
}

.sb-logo-text {
	font-size: 18px;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.sb-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: #4b5563;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.sb-nav-item:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateX(2px);
}

.sb-nav-item.active {
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18));
	color: #1f2937;
}

.sb-nav-icon {
	font-size: 15px;
}

.sb-sec {
	margin-top: 16px;
}

.sb-sec-title {
	padding: 8px 12px 6px;
	font-size: 12px;
	font-weight: 600;
	color: #9ca3af;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 8px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 10px;
	cursor: pointer;
}

.sb-sec-item:hover {
	background: rgba(255, 255, 255, 0.8);
}

.sb-sec-count {
	font-size: 11px;
	color: #9ca3af;
}

.sb-card-hint {
	margin-top: auto;
	padding: 14px;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-radius: 16px;
	color: #fff;
	text-align: center;
}

.sb-card-hint-title {
	font-size: 14px;
	font-weight: 700;
	margin-bottom: 4px;
}

.sb-card-hint-desc {
	font-size: 11px;
	opacity: 0.9;
	margin-bottom: 10px;
}

.sb-card-hint-btn {
	padding: 6px 16px;
	background: #fff;
	color: #ff6fa3;
	font-size: 12px;
	font-weight: 600;
	border: none;
	border-radius: 999px;
	cursor: pointer;
}

/* 顶栏 */
.sb-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	padding: 16px;
	position: relative;
	z-index: 1;
}

.sb-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 20px;
	margin-bottom: 16px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	box-shadow: 0 4px 16px rgba(108, 141, 255, 0.08);
}

.sb-top-nav {
	display: flex;
	gap: 6px;
}

.sb-top-item {
	padding: 8px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #4b5563;
	border-radius: 999px;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-top-item:hover {
	background: rgba(255, 111, 163, 0.12);
	color: #ff6fa3;
}

.sb-top-item.active {
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	box-shadow: 0 4px 12px rgba(255, 111, 163, 0.3);
}

.sb-search {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
}

.sb-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
}

.sb-top-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sb-pill {
	padding: 7px 14px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	font-size: 13px;
	cursor: pointer;
}

.sb-avatar {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	border: 2px solid #fff;
	flex-shrink: 0;
	overflow: hidden;
}

.sb-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

/* 顶栏用户区 */
.sb-user-wrap {
	position: relative;
}

.sb-user-trigger {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 2px 6px;
	cursor: pointer;
	border-radius: 999px;
	transition: background 0.15s;
}

.sb-user-trigger:hover {
	background: rgba(255, 255, 255, 0.5);
}

.sb-user-name {
	font-size: 13px;
	font-weight: 500;
	color: #1f2937;
}

.sb-user-arrow {
	font-size: 12px;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sb-user-arrow.open {
	transform: rotate(180deg);
}

.sb-user-dropdown {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	min-width: 140px;
	background: #fff;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 14px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	z-index: 300;
	padding: 6px;
}

.sb-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s;
}

.sb-user-dropdown-item:hover {
	background: #f3f4f6;
}

.sb-user-dropdown-logout {
	color: #ef4444;
}

.sb-user-dropdown-logout:hover {
	background: #fef2f2;
}

/* 主区 */
.sb-main {
	flex: 1;
	overflow: auto;
}
</style>