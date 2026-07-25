<template>
	<div class="style-b style-b-mobile">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sb-mobile-header">
			<button class="sb-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sb-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
			<div class="sb-header-user">
				<div class="sb-header-user-trigger" @click="toggleMobileUserDropdown">
					<div class="sb-avatar sb-avatar-sm">
						<img v-if="mobileAvatarBlobUrl" :src="mobileAvatarBlobUrl" class="sb-avatar-img" />
						<span v-else>{{ userInfo.userName?.charAt(0) || 'U' }}</span>
					</div>
					<span class="sb-header-user-arrow" :class="{ open: showMobileUserDropdown }">▾</span>
				</div>
				<div v-if="showMobileUserDropdown" class="sb-header-user-dropdown">
					<div class="sb-user-dropdown-item" @click="goMobileSettings">⚙️ 设置</div>
					<div class="sb-user-dropdown-item sb-user-dropdown-logout" @click="mobileLogout">🚪 登出</div>
				</div>
			</div>
		</header>

		<!-- 侧边栏抽屉 -->
		<div v-if="showSidebar" class="sb-mobile-sidebar-backdrop" @click="showSidebar = false">
			<aside class="sb-mobile-sidebar" @click.stop>
				<android-seat />
				<div class="sb-sidebar-header">
					<div class="sb-logo">
						<span class="sb-logo-emoji">🌸</span>
						<span class="sb-logo-text">smanga</span>
					</div>
					<button class="sb-close-sidebar" @click="showSidebar = false">×</button>
				</div>

				<div class="sb-sec-title sb-nav-title">
					<span>{{ manageMode ? '管理菜单' : '导航' }}</span>
					<button
						v-if="isAdmin"
						:class="['sb-manage-toggle', { active: manageMode }]"
						@click="manageMode = !manageMode"
						:title="manageMode ? '退出管理模式' : '管理模式'"
					>
						⚙️
					</button>
				</div>

				<nav class="sb-nav">
					<div v-for="item in currentMenu" :key="item.key" class="sb-nav-item" @click="navigateTo(item.key)">
						<span class="sb-nav-icon">{{ item.icon }}</span>
						<span>{{ item.label }}</span>
					</div>
				</nav>

				<div class="sb-sec">
					<div class="sb-sec-title">媒体库</div>
					<div v-for="m in mediaListData" :key="m.mediaId" class="sb-sec-item" @click="navigateToMedia(m.mediaId)">
						<span>📁 {{ m.mediaName || m.mediaId }}</span>
						<span class="sb-sec-count">{{ m.mangaCount || 0 }}</span>
					</div>
					<div v-if="mediaListData.length === 0" class="sb-nav-empty">暂无媒体库</div>
				</div>
			</aside>
		</div>

		<!-- 主内容区 -->
		<main class="sb-mobile-main">
			<router-view />
		</main>

		<!-- 底部导航栏 -->
		<nav class="sb-mobile-nav-bar">
			<div v-for="item in bottomNav" :key="item.key" class="sb-nav-item" @click="navigateTo(item.key)">
				<span class="sb-nav-icon">{{ item.icon }}</span>
				<span class="sb-nav-label">{{ item.label }}</span>
			</div>
		</nav>
	</div>

	<theme-context-menu />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import androidSeat from '@/layout/components/android-seat.vue'
import mediaStatsApi from '@/api/media-stats'
import { userInfo } from '@/store'
import imageApi from '@/api/image'
import { Cookies } from '@/utils'

const showSidebar = ref(false)
const router = useRouter()
const route = useRoute()

const manageMode = ref(false)
const isAdmin = computed(() => Cookies.getRole() === 'admin')

const menu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'media', label: '媒体库', icon: '📁' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'setting', label: '设置', icon: '🔧' },
]

const adminMenu = [
	{ key: 'manage-users', label: '用户管理', icon: '👤' },
	{ key: 'manage-media', label: '媒体库管理', icon: '📁' },
	{ key: 'manage-manga', label: '漫画管理', icon: '📚' },
	{ key: 'manage-chapters', label: '章节管理', icon: '📑' },
	{ key: 'manage-paths', label: '路径管理', icon: '📂' },
	{ key: 'manage-bookmarks', label: '书签管理', icon: '🔖' },
	{ key: 'manage-tags', label: '标签管理', icon: '🏷️' },
	{ key: 'manage-compress', label: '解压管理', icon: '🗜️' },
	{ key: 'manage-jobs', label: '任务管理', icon: '📋' },
	{ key: 'manage-sync', label: '漫画同步', icon: '🔄' },
	{ key: 'manage-share', label: '漫画分享', icon: '📤' },
	{ key: 'manage-p2p', label: 'P2P管理', icon: '🌐' },
	{ key: 'manage-server', label: '服务器设置', icon: '🖥️' },
	{ key: 'manage-wiki', label: '帮助文档', icon: '📖' },
]

const currentMenu = computed(() => (manageMode.value ? adminMenu : menu))

const mediaListData = ref<any[]>([])

onMounted(async () => {
	try {
		mediaListData.value = await mediaStatsApi.getMediaWithCounts()
	} catch {
		mediaListData.value = []
	}
	window.addEventListener('click', onSidebarClick)
})

onBeforeUnmount(() => {
	window.removeEventListener('click', onSidebarClick)
})

const bottomNav = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '历史', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'media', label: '媒体', icon: '📁' },
	{ key: 'search', label: '搜索', icon: '🔍' },
]

const pageTitle = computed(() => {
	const titleMap: Record<string, string> = {
		't-home': '首页',
		't-media-list': '媒体库',
		't-manga-list': '漫画列表',
		't-manga-info': '漫画详情',
		't-chapter-list': '章节列表',
		't-history': '最近阅读',
		't-bookmark': '书签',
		't-collect': '收藏',
		't-search': '搜索',
		't-tag-list': '标签',
		't-manage': '管理',
		't-user-setting': '用户设置',
		't-serve-setting': '服务器设置',
	}
	return titleMap[route.name as string] || 'smanga'
})

function navigateTo(key: string) {
	const routeMap: Record<string, string> = {
		home: '/t',
		history: '/t/history',
		bookmark: '/t/bookmark',
		collect: '/t/collect',
		media: '/t/media',
		search: '/t/search',
		tag: '/t/tags',
		manage: '/t/manage',
		setting: '/t/setting/user',
		'manage-users': '/t/manage/users',
		'manage-media': '/t/manage/media',
		'manage-manga': '/t/manage/manga',
		'manage-chapters': '/t/manage/chapters',
		'manage-paths': '/t/manage/paths',
		'manage-bookmarks': '/t/manage/bookmarks',
		'manage-tags': '/t/manage/tags',
		'manage-compress': '/t/manage/compress',
		'manage-jobs': '/t/manage/jobs',
		'manage-sync': '/t/manage/sync',
		'manage-share': '/t/manage/share',
		'manage-p2p': '/t/manage/p2p',
		'manage-server': '/t/manage/server',
		'manage-wiki': '/t/manage/wiki',
	}
	if (routeMap[key]) {
		router.push(routeMap[key])
		showSidebar.value = false
	}
}

function navigateToMedia(mediaId: number) {
	router.push(`/t/media/${mediaId}`)
	showSidebar.value = false
}

// ---- 用户信息 ----
const showMobileUserDropdown = ref(false)
const mobileAvatarBlobUrl = ref('')

function toggleMobileUserDropdown() {
	showMobileUserDropdown.value = !showMobileUserDropdown.value
}

function goMobileSettings() {
	showMobileUserDropdown.value = false
	showSidebar.value = false
	router.push('/t/setting/user')
}

function mobileLogout() {
	document.cookie = 'smanga-userName=; path=/; max-age=0'
	document.cookie = 'smanga-userId=; path=/; max-age=0'
	showMobileUserDropdown.value = false
	showSidebar.value = false
	router.push('/login')
}

async function loadMobileAvatar() {
	if (!userInfo.avatarPath) {
		mobileAvatarBlobUrl.value = ''
		return
	}
	const blobUrl = await imageApi.get({ file: userInfo.avatarPath })
	mobileAvatarBlobUrl.value = blobUrl || ''
}

watch(() => userInfo.avatarPath, loadMobileAvatar, { immediate: true })

function onSidebarClick(e: MouseEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	if (target.closest('.sb-header-user-dropdown')) return
	if (target.closest('.sb-header-user-trigger')) return
	showMobileUserDropdown.value = false
}
</script>

<style scoped>
.style-b-mobile {
	height: 100dvh;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sb-mobile-header {
	flex-shrink: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(12px);
	border-bottom: 1px solid rgba(255, 111, 163, 0.2);
}

/* 安卓占位符与顶栏背景一致 */
:deep(.android-seat) {
	background: rgba(255, 255, 255, 0.9);
}

.sb-menu-toggle {
	width: 40px;
	height: 40px;
	border: none;
	background: transparent;
	font-size: 20px;
	cursor: pointer;
	border-radius: 12px;
}

.sb-menu-toggle:active {
	background: rgba(255, 111, 163, 0.1);
}

.sb-mobile-title {
	flex: 1;
	min-width: 0;
}

.sb-mobile-title h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
}

/* Header 用户区 */
.sb-header-user {
	position: relative;
	flex-shrink: 0;
}

.sb-header-user-trigger {
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
	padding: 4px 6px;
	border-radius: 8px;
}

.sb-header-user-trigger:active {
	background: rgba(255, 111, 163, 0.08);
}

.sb-avatar-sm {
	width: 28px;
	height: 28px;
	font-size: 13px;
	flex-shrink: 0;
	overflow: hidden;
}

.sb-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.sb-header-user-arrow {
	font-size: 10px;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sb-header-user-arrow.open {
	transform: rotate(180deg);
}

.sb-header-user-dropdown {
	position: absolute;
	top: calc(100% + 6px);
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
	padding: 10px 14px;
	font-size: 14px;
	color: #4b5563;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s;
}

.sb-user-dropdown-item:active {
	background: #f3f4f6;
}

.sb-user-dropdown-logout {
	color: #ef4444;
}

.sb-user-dropdown-logout:active {
	background: #fef2f2;
}

.sb-mobile-sidebar-backdrop {
	position: fixed;
	inset: 0;
	z-index: 100;
	background: rgba(0, 0, 0, 0.5);
}

.sb-mobile-sidebar {
	position: absolute;
	top: 0;
	left: 0;
	width: 280px;
	max-width: 80vw;
	height: 100%;
	background: rgba(255, 255, 255, 0.96);
	padding: 12px;
	overflow-y: auto;
	overscroll-behavior: contain;
	animation: slideIn 0.3s ease;
}

/* 修复 Chromium/WebKit 中 overflow 容器 padding-bottom 失效问题：
   在最后一个子元素后追加占位空间，确保底部内容可完整滚出，不被底部导航栏遮挡 */
.sb-mobile-sidebar::after {
	content: '';
	display: block;
	height: calc(80px + env(safe-area-inset-bottom));
	flex-shrink: 0;
}

/* 安卓占位符 - 侧边栏内与侧栏同色 */
.sb-mobile-sidebar :deep(.android-seat) {
	flex-shrink: 0;
	background: rgba(255, 255, 255, 0.96);
	margin: -12px -12px 0;
}

@keyframes slideIn {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(0);
	}
}

.sb-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 4px 12px;
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sb-logo-emoji {
	font-size: 24px;
}

.sb-logo-text {
	font-size: 18px;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #ffb020);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.sb-close-sidebar {
	width: 36px;
	height: 36px;
	border: none;
	background: transparent;
	font-size: 28px;
	cursor: pointer;
	color: #6b7280;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sb-nav-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	color: #4b5563;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s;
	font-size: 14px;
	user-select: none;
	-webkit-user-select: none;
	-webkit-tap-highlight-color: transparent;
}

.sb-nav-item:active {
	background: rgba(255, 111, 163, 0.1);
	color: #ff6fa3;
}

.sb-nav-icon {
	width: 18px;
	font-size: 16px;
	text-align: center;
}

.sb-sec {
	margin-top: 8px;
}

.sb-sec-title {
	font-size: 11px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 8px 12px 4px;
}

.sb-nav-title {
	display: flex;
	align-items: center;
	gap: 8px;
	text-transform: none;
	letter-spacing: normal;
}

.sb-nav-title span {
	flex: 1;
}

.sb-manage-toggle {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.6);
	color: #9ca3af;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.15s;
	flex-shrink: 0;
}

.sb-manage-toggle:active {
	background: rgba(255, 255, 255, 0.9);
	color: #4b5563;
}

.sb-manage-toggle.active {
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-color: transparent;
	color: #fff;
}

.sb-nav-empty {
	padding: 8px 12px;
	font-size: 12px;
	color: #9ca3af;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 8px 12px;
	font-size: 13px;
	color: #4b5563;
	cursor: pointer;
	border-radius: 8px;
}

.sb-sec-item:active {
	background: rgba(255, 111, 163, 0.1);
}

.sb-sec-count {
	font-size: 11px;
	color: #9ca3af;
}

.sb-mobile-main {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	/* 底栏 56px + safe-area */
	padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 16px);
}

.sb-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 8px 0;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(12px);
	border-top: 1px solid rgba(255, 111, 163, 0.2);
	z-index: 100;
}

.sb-mobile-nav-bar .sb-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	min-height: auto;
}

.sb-mobile-nav-bar .sb-nav-label {
	font-size: 11px;
	font-weight: 500;
}
</style>
