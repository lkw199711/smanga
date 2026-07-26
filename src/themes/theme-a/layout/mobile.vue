<template>
	<div class="style-a style-a-mobile" :class="{ 'sa-dark': isDarkMode }">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sa-mobile-header">
			<button class="sa-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sa-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
			<div class="sa-header-actions">
				<button
					class="sa-header-icon-btn"
					:title="isDarkMode ? '切换到亮色' : '切换到暗色'"
					:aria-label="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
					@click="toggleDarkMode"
				>
					{{ isDarkMode ? '☀️' : '🌙' }}
				</button>
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
			</div>
		</header>

		<!-- 侧边栏（抽屉式） -->
		<div v-if="showSidebar" class="sa-mobile-sidebar-backdrop smanga-backable" @click="showSidebar = false">
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
							<div v-for="item in adminMenu" :key="item.path" class="sa-nav-item" @click="navigateTo(item.path)">
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
							<div v-for="item in menu" :key="item.path" class="sa-nav-item" @click="navigateTo(item.path)">
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
			<div v-for="item in bottomNav" :key="item.path" class="sa-nav-item" @click="navigateTo(item.path)">
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
import { useColorTheme } from '@/themes/composables/use-color-theme'
import {
	navMenu as menu,
	adminNavMenu as adminMenu,
	bottomNavMenu as bottomNav,
	getPageTitle,
} from '@/themes/constants/menu'
import './dark-overrides.css'

// 夜间模式切换（与桌面顶栏共享同一状态）
const { isDarkMode, toggleDarkMode } = useColorTheme()

const showSidebar = ref(false)
const showMobileUserDropdown = ref(false)
const mobileAvatarBlobUrl = ref('')
const sidebarMediaList = ref<any[]>([])
const router = useRouter()
const route = useRoute()
const manageMode = ref(false)

const isAdmin = computed(() => Cookies.getRole() === 'admin')

const pageTitle = computed(() => getPageTitle(route.name as string | undefined))

function navigateTo(path: string) {
	router.push(path)
	showSidebar.value = false
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
	font-size: 1.4rem;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 移动端顶部栏 */
.sa-mobile-header {
	flex-shrink: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 1.2rem;
	padding: 1.2rem 1.6rem;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(1rem);
	border-bottom: 1px solid #eaeaea;
}

.sa-mobile-title {
	flex: 1;
	min-width: 0;
}

.sa-mobile-title h1 {
	margin: 0;
	font-size: 1.8rem;
	font-weight: 600;
}

/* Header 操作区容器 */
.sa-header-actions {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	flex-shrink: 0;
}

/* Header 图标按钮 */
.sa-header-icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 3.6rem;
	height: 3.6rem;
	padding: 0;
	border: none;
	background: transparent;
	color: inherit;
	border-radius: 50%;
	font-size: 1.8rem;
	line-height: 1;
	cursor: pointer;
	transition: background 0.2s ease, transform 0.2s ease;
	-webkit-tap-highlight-color: transparent;
}

.sa-header-icon-btn:hover {
	background: rgba(0, 0, 0, 0.05);
}

.sa-header-icon-btn:active {
	background: rgba(0, 0, 0, 0.08);
	transform: scale(0.94);
}

/* Header 用户区 */
.sa-header-user {
	position: relative;
	flex-shrink: 0;
}

.sa-header-user-trigger {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	cursor: pointer;
	padding: 0.4rem 0.8rem;
	border-radius: 0.8rem;
}

.sa-header-user-trigger:active {
	background: #f3f4f6;
}

.sa-avatar-sm {
	width: 2.8rem;
	height: 2.8rem;
}

.sa-header-user-name {
	font-size: 1.3rem;
	font-weight: 500;
	max-width: 8rem;
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
	min-width: 14rem;
	margin-top: 0.4rem;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 0.8rem;
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.1);
	padding: 0.4rem;
	z-index: 60;
}

.sa-header-user-dropdown .sa-user-dropdown-item {
	padding: 0.8rem 1.2rem;
	border-radius: 0.6rem;
}

.sa-header-user-dropdown .sa-user-dropdown-item:active {
	background: #f3f4f6;
}

/* 安卓占位符与顶栏背景一致 */
:deep(.android-seat) {
	background: rgba(255, 255, 255, 0.95);
}

.sa-menu-toggle {
	width: 4rem;
	height: 4rem;
	border: none;
	background: transparent;
	font-size: 2rem;
	cursor: pointer;
	border-radius: 0.8rem;
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
	width: 28rem;
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
	padding: 0 0.4rem;
	/* 底部预留空间，避免被底部导航栏遮挡，可向上滚动显示全部媒体库 */
	padding-bottom: calc(9rem + env(safe-area-inset-bottom));
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
	padding: 0.8rem 1.2rem 1.2rem;
	gap: 0.8rem;
}

.sa-manage-toggle {
	width: 3.2rem;
	height: 3.2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #eaeaea;
	border-radius: 0.8rem;
	background: #fff;
	cursor: pointer;
	font-size: 1.6rem;
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
	width: 3.6rem;
	height: 3.6rem;
	border: none;
	background: transparent;
	font-size: 2.8rem;
	cursor: pointer;
	color: #6b7280;
}

/* Logo */
.sa-logo {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.sa-logo-mark {
	width: 2.8rem;
	height: 2.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #171717;
	color: #fff;
	font-weight: 700;
	border-radius: 0.8rem;
}

.sa-logo-text {
	font-size: 1.6rem;
	font-weight: 700;
}

/* 导航 */
.sa-sec-title {
	padding: 1rem 0.8rem 0.4rem;
	display: flex;
	align-items: center;
	font-size: 1.1rem;
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
	gap: 0.8rem;
	padding: 0.8rem 1.2rem;
	color: #4b5563;
	border-radius: 0.8rem;
	cursor: pointer;
	transition: all 0.15s;
	font-size: 1.4rem;
	user-select: none;
	-webkit-user-select: none;
	-webkit-tap-highlight-color: transparent;
}

.sa-nav-item:active {
	background: #f3f4f6;
	color: #111827;
}

.sa-nav-icon {
	width: 1.8rem;
	font-size: 1.6rem;
	text-align: center;
}

.sa-nav-count {
	margin-left: auto;
	padding: 0.2rem 0.8rem;
	font-size: 1.1rem;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 1rem;
}

/* 通用：头像 */
.sa-avatar {
	position: relative;
	width: 3.6rem;
	height: 3.6rem;
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
	font-size: 1.5rem;
}

/* 通用：箭头与下拉 */
.sa-user-arrow {
	color: #9ca3af;
	font-size: 1.2rem;
	transition: transform 0.2s;
}

.sa-user-arrow.open {
	transform: rotate(180deg);
}

/* 通用：下拉菜单项 */
.sa-user-dropdown-item {
	display: flex;
	align-items: center;
	padding: 0.8rem 0;
	font-size: 1.3rem;
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
	padding: 0.8rem 1.2rem;
	font-size: 1.2rem;
	color: #9ca3af;
}

/* 主内容区 */
.sa-mobile-main {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1.6rem;
	/* 底栏 5.6rem + safe-area + 冗余，避免最后内容被底栏遮挡 */
	padding-bottom: calc(5.6rem + env(safe-area-inset-bottom, 0px) + 3.2rem);
}

/* 底部导航栏 */
.sa-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 0.8rem 0;
	background: #fff;
	border-top: 1px solid #eaeaea;
	z-index: 100;
}

.sa-mobile-nav-bar .sa-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.4rem;
	padding: 0.6rem 1.2rem;
	min-height: auto;
}

.sa-mobile-nav-bar .sa-nav-label {
	font-size: 1.1rem;
	font-weight: 500;
}
</style>
