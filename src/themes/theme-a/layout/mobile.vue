<template>
	<div class="style-a style-a-mobile">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sa-mobile-header">
			<button class="sa-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sa-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
			<div class="sa-header-user">
				<div class="sa-header-user-trigger" @click="toggleMobileUserDropdown">
					<div class="sa-avatar sa-avatar-sm">
						<img v-if="mobileAvatarBlobUrl" :src="mobileAvatarBlobUrl" class="sa-avatar-img" />
						<span v-else class="sa-avatar-text">{{ userInfo.userName?.charAt(0) || 'U' }}</span>
					</div>
					<span class="sa-header-user-name">{{ userInfo.userName || '未登录' }}</span>
					<span class="sa-user-arrow" :class="{ open: showMobileUserDropdown }">▾</span>
				</div>
				<div v-if="showMobileUserDropdown" class="sa-header-user-dropdown">
					<div class="sa-user-dropdown-item" @click="goMobileSettings">
						<span>⚙️ 设置</span>
					</div>
					<div class="sa-user-dropdown-item sa-user-dropdown-logout" @click="mobileLogout">
						<span>🚪 登出</span>
					</div>
				</div>
			</div>
		</header>

		<!-- 侧边栏（抽屉式） -->
		<div v-if="showSidebar" class="sa-mobile-sidebar-backdrop" @click="showSidebar = false">
			<aside class="sa-mobile-sidebar" @click.stop>
				<android-seat />
				<div class="sa-sidebar-header">
					<div class="sa-logo">
						<div class="sa-logo-mark">S</div>
						<div class="sa-logo-text">smanga</div>
					</div>
					<button class="sa-close-sidebar" @click="showSidebar = false">×</button>
				</div>

				<div class="sa-sidebar-scroll">
					<template v-if="manageMode">
						<div class="sa-sec-title">
							<span>管理菜单</span>
							<button
								v-if="isAdmin"
								:class="['sa-manage-toggle', { active: manageMode }]"
								@click="manageMode = !manageMode"
								:title="manageMode ? '退出管理模式' : '管理模式'"
							>
								⚙️
							</button>
						</div>
						<nav class="sa-nav">
							<div v-for="item in adminMenu" :key="item.key" class="sa-nav-item" @click="navigateTo(item.key)">
								<span class="sa-nav-icon">{{ item.icon }}</span>
								<span>{{ item.label }}</span>
							</div>
						</nav>

						<div class="sa-sec-title">媒体库</div>
						<nav class="sa-nav">
							<div v-for="m in sidebarMediaList" :key="m.mediaId" class="sa-nav-item"
								@click="navigateToMedia(m.mediaId)">
								<span class="sa-nav-icon">📁</span>
								<span>{{ m.mediaName || m.mediaId }}</span>
								<span class="sa-nav-count">{{ m.mangaCount || 0 }}</span>
							</div>
							<div v-if="sidebarMediaList.length === 0" class="sa-nav-empty">暂无媒体库</div>
						</nav>
					</template>

					<template v-else>
						<div class="sa-sec-title">
							<span>导航</span>
							<button
								v-if="isAdmin"
								:class="['sa-manage-toggle', { active: manageMode }]"
								@click="manageMode = !manageMode"
								:title="manageMode ? '退出管理模式' : '管理模式'"
							>
								⚙️
							</button>
						</div>
						<nav class="sa-nav">
							<div v-for="item in menu" :key="item.key" class="sa-nav-item" @click="navigateTo(item.key)">
								<span class="sa-nav-icon">{{ item.icon }}</span>
								<span>{{ item.label }}</span>
							</div>
						</nav>

						<div class="sa-sec-title">媒体库</div>
						<nav class="sa-nav">
							<div v-for="m in sidebarMediaList" :key="m.mediaId" class="sa-nav-item"
								@click="navigateToMedia(m.mediaId)">
								<span class="sa-nav-icon">📁</span>
								<span>{{ m.mediaName || m.mediaId }}</span>
								<span class="sa-nav-count">{{ m.mangaCount || 0 }}</span>
							</div>
							<div v-if="sidebarMediaList.length === 0" class="sa-nav-empty">暂无媒体库</div>
						</nav>
					</template>
				</div>
			</aside>
		</div>

		<!-- 主内容区 -->
		<main class="sa-mobile-main">
			<router-view />
		</main>

		<!-- 底部导航栏 -->
		<nav class="sa-mobile-nav-bar">
			<div v-for="item in bottomNav" :key="item.key" class="sa-nav-item" @click="navigateTo(item.key)">
				<span class="sa-nav-icon">{{ item.icon }}</span>
				<span class="sa-nav-label">{{ item.label }}</span>
			</div>
		</nav>

		<theme-context-menu />
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import androidSeat from '@/layout/components/android-seat.vue'
import { userInfo } from '@/store'
import imageApi from '@/api/image'
import mediaStatsApi from '@/api/media-stats'
import { Cookies } from '@/utils'

const showSidebar = ref(false)
const showMobileUserDropdown = ref(false)
const mobileAvatarBlobUrl = ref('')
const sidebarMediaList = ref<any[]>([])
const router = useRouter()
const route = useRoute()
const manageMode = ref(false)

const isAdmin = computed(() => Cookies.getRole() === 'admin')

const menu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'media', label: '媒体库', icon: '📁' },
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

const bottomNav = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'media', label: '媒体', icon: '📁' },
	{ key: 'history', label: '历史', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
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
		't-user-setting': '用户设置',
		't-serve-setting': '服务器设置',
		't-manage-users': '用户管理',
		't-manage-media': '媒体库管理',
		't-manage-manga': '漫画管理',
		't-manage-chapters': '章节管理',
		't-manage-paths': '路径管理',
		't-manage-bookmarks': '书签管理',
		't-manage-tags': '标签管理',
		't-manage-compress': '解压管理',
		't-manage-jobs': '任务管理',
		't-manage-sync': '漫画同步',
		't-manage-share': '漫画分享',
		't-manage-p2p': 'P2P管理',
		't-manage-server': '服务器设置',
		't-manage-wiki': '帮助文档',
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

// ---- 用户下拉 ----
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

function onSidebarClick(e: MouseEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	if (target.closest('.sa-header-user-dropdown')) return
	if (target.closest('.sa-header-user-trigger')) return
	showMobileUserDropdown.value = false
}

// ---- 头像 ----
async function loadMobileAvatar() {
	if (!userInfo.avatarPath) {
		mobileAvatarBlobUrl.value = ''
		return
	}
	const blobUrl = await imageApi.get({ file: userInfo.avatarPath })
	mobileAvatarBlobUrl.value = blobUrl || ''
}

watch(() => userInfo.avatarPath, loadMobileAvatar, { immediate: true })

// ---- 生命周期 ----
onMounted(async () => {
	try {
		sidebarMediaList.value = await mediaStatsApi.getMediaWithCounts()
	} catch (e) {
		sidebarMediaList.value = []
	}
	window.addEventListener('click', onSidebarClick)
})

onBeforeUnmount(() => {
	window.removeEventListener('click', onSidebarClick)
})
</script>

<style scoped>
.style-a-mobile {
	height: 100dvh;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 移动端顶部栏 */
.sa-mobile-header {
	flex-shrink: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #eaeaea;
}

.sa-mobile-title {
	flex: 1;
	min-width: 0;
}

.sa-mobile-title h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
}

/* Header 用户区 */
.sa-header-user {
	position: relative;
	flex-shrink: 0;
}

.sa-header-user-trigger {
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 8px;
}

.sa-header-user-trigger:active {
	background: #f3f4f6;
}

.sa-avatar-sm {
	width: 28px;
	height: 28px;
}

.sa-header-user-name {
	font-size: 13px;
	font-weight: 500;
	max-width: 80px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #171717;
}

/* Header 用户下拉 */
.sa-header-user-dropdown {
	position: absolute;
	top: 100%;
	right: 0;
	min-width: 140px;
	margin-top: 4px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	padding: 4px;
	z-index: 60;
}

.sa-header-user-dropdown .sa-user-dropdown-item {
	padding: 8px 12px;
	border-radius: 6px;
}

.sa-header-user-dropdown .sa-user-dropdown-item:active {
	background: #f3f4f6;
}

/* 安卓占位符与顶栏背景一致 */
:deep(.android-seat) {
	background: rgba(255, 255, 255, 0.95);
}

.sa-menu-toggle {
	width: 40px;
	height: 40px;
	border: none;
	background: transparent;
	font-size: 20px;
	cursor: pointer;
	border-radius: 8px;
	flex-shrink: 0;
}

.sa-menu-toggle:active {
	background: #f3f4f6;
}

/* 侧边栏抽屉 */
.sa-mobile-sidebar-backdrop {
	position: fixed;
	inset: 0;
	z-index: 100;
	background: rgba(0, 0, 0, 0.5);
}

.sa-mobile-sidebar {
	position: absolute;
	top: 0;
	left: 0;
	width: 280px;
	max-width: 80vw;
	height: 100%;
	background: #fff;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: slideIn 0.3s ease;
}

/* 安卓占位符 - 侧边栏内与顶栏同色 */
.sa-mobile-sidebar :deep(.android-seat) {
	flex-shrink: 0;
	background: #fff;
}

/* 导航滚动区 */
.sa-sidebar-scroll {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 0 4px;
	/* 底部预留空间，避免被底部导航栏遮挡，可向上滚动显示全部媒体库 */
	padding-bottom: calc(90px + env(safe-area-inset-bottom));
}

@keyframes slideIn {
	from {
		transform: translateX(-100%);
	}

	to {
		transform: translateX(0);
	}
}

.sa-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 8px 12px 12px;
	gap: 8px;
}

.sa-manage-toggle {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.15s;
	flex-shrink: 0;
	order: 1;
}

.sa-manage-toggle:hover {
	background: #f3f4f6;
}

.sa-manage-toggle.active {
	background: #2563eb;
	border-color: #2563eb;
	color: #fff;
}

.sa-close-sidebar {
	width: 36px;
	height: 36px;
	border: none;
	background: transparent;
	font-size: 28px;
	cursor: pointer;
	color: #6b7280;
}

/* Logo */
.sa-logo {
	display: flex;
	align-items: center;
	gap: 10px;
}

.sa-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #171717;
	color: #fff;
	font-weight: 700;
	border-radius: 8px;
}

.sa-logo-text {
	font-size: 16px;
	font-weight: 700;
}

/* 导航 */
.sa-sec-title {
	padding: 10px 8px 4px;
	display: flex;
	align-items: center;
	font-size: 11px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.sa-sec-title span {
	flex: 1;
}

.sa-nav {
	display: flex;
	flex-direction: column;
	gap: 1px;
}

.sa-nav-item {
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

.sa-nav-item:active {
	background: #f3f4f6;
	color: #111827;
}

.sa-nav-icon {
	width: 18px;
	font-size: 16px;
	text-align: center;
}

.sa-nav-count {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 11px;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 10px;
}

/* 通用：头像 */
.sa-avatar {
	position: relative;
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	overflow: hidden;
}

.sa-avatar-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.sa-avatar-text {
	font-size: 15px;
}

/* 通用：箭头与下拉 */
.sa-user-arrow {
	color: #9ca3af;
	font-size: 12px;
	transition: transform 0.2s;
}

.sa-user-arrow.open {
	transform: rotate(180deg);
}

/* 通用：下拉菜单项 */
.sa-user-dropdown-item {
	display: flex;
	align-items: center;
	padding: 8px 0;
	font-size: 13px;
	color: #4b5563;
	cursor: pointer;
}

.sa-user-dropdown-item:active {
	color: #111827;
}

.sa-user-dropdown-logout {
	color: #ef4444;
}

/* 导航空态 */
.sa-nav-empty {
	padding: 8px 12px;
	font-size: 12px;
	color: #9ca3af;
}

/* 主内容区 */
.sa-mobile-main {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	/* 底栏 56px + safe-area */
	padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 16px);
}

/* 底部导航栏 */
.sa-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 8px 0;
	background: #fff;
	border-top: 1px solid #eaeaea;
	z-index: 100;
}

.sa-mobile-nav-bar .sa-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	min-height: auto;
}

.sa-mobile-nav-bar .sa-nav-label {
	font-size: 11px;
	font-weight: 500;
}
</style>
