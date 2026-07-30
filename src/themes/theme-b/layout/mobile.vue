<template>
	<div class="style-b style-b-mobile" :class="{ 'tb-dark': isDarkMode }">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sb-mobile-header">
			<button class="sb-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sb-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
			<div class="sb-header-actions">
				<button
					class="sb-header-icon-btn"
					:title="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
					@click="toggleDarkMode"
				>
					{{ isDarkMode ? '☀️' : '🌙' }}
				</button>
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
			</div>
		</header>

		<!-- 侧边栏抽屉 -->
		<div v-if="showSidebar" class="sb-mobile-sidebar-backdrop smanga-backable" @click="showSidebar = false">
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
					<div v-for="item in currentMenu" :key="item.path" class="sb-nav-item" @click="navigateTo(item.path)">
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
			<div v-for="item in bottomNav" :key="item.path" class="sb-nav-item" @click="navigateTo(item.path)">
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
import { useSessionStore } from '@/store/session'
import { useColorTheme } from '@/themes/composables/use-color-theme'
import { navMenu, adminNavMenu, bottomNavMenu, getPageTitle } from '@/themes/constants/menu'
import { themeListKeys, useThemeListStateStore } from '@/themes/stores/list-state'
import './dark-overrides.css'

const { isDarkMode, toggleDarkMode } = useColorTheme()

const showSidebar = ref(false)
const router = useRouter()
const route = useRoute()
const listState = useThemeListStateStore()

const manageMode = ref(false)
const session = useSessionStore()
const isAdmin = computed(() => session.isAdmin)

const currentMenu = computed(() => (manageMode.value ? adminNavMenu : navMenu))

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

const bottomNav = bottomNavMenu

const pageTitle = computed(() => getPageTitle(route.name as string | undefined))

function navigateTo(path: string) {
	router.push(path)
	showSidebar.value = false
}

function navigateToMedia(mediaId: number) {
	listState.remove(themeListKeys.manga(mediaId))
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
	session.logout()
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
	font-size: 1.4rem;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sb-mobile-header {
	flex-shrink: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 1.2rem;
	padding: 1.2rem 1.6rem;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(1.2rem);
	border-bottom: 1px solid rgba(255, 111, 163, 0.2);
}

/* 安卓占位符与顶栏背景一致 */
:deep(.android-seat) {
	background: rgba(255, 255, 255, 0.9);
}

.sb-menu-toggle {
	width: 4rem;
	height: 4rem;
	border: none;
	background: transparent;
	font-size: 2rem;
	cursor: pointer;
	border-radius: 1.2rem;
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
	font-size: 1.8rem;
	font-weight: 600;
}

/* Header 操作区容器 */
.sb-header-actions {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	flex-shrink: 0;
}

/* Header 图标按钮 */
.sb-header-icon-btn {
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

.sb-header-icon-btn:hover {
	background: rgba(236, 72, 153, 0.1);
}

.sb-header-icon-btn:active {
	background: rgba(236, 72, 153, 0.15);
	transform: scale(0.94);
}

/* Header 用户区 */
.sb-header-user {
	position: relative;
	flex-shrink: 0;
}

.sb-header-user-trigger {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	cursor: pointer;
	padding: 0.4rem 0.6rem;
	border-radius: 0.8rem;
}

.sb-header-user-trigger:active {
	background: rgba(255, 111, 163, 0.08);
}

.sb-avatar-sm {
	width: 2.8rem;
	height: 2.8rem;
	font-size: 1.3rem;
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
	font-size: 1rem;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sb-header-user-arrow.open {
	transform: rotate(180deg);
}

.sb-header-user-dropdown {
	position: absolute;
	top: calc(100% + 0.6rem);
	right: 0;
	min-width: 14rem;
	background: #fff;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 1.4rem;
	box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.1);
	z-index: 300;
	padding: 0.6rem;
}

.sb-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 1rem 1.4rem;
	font-size: 1.4rem;
	color: #4b5563;
	border-radius: 1rem;
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
	width: 28rem;
	max-width: 80vw;
	height: 100%;
	background: rgba(255, 255, 255, 0.96);
	padding: 1.2rem;
	overflow-y: auto;
	overscroll-behavior: contain;
	animation: slideIn 0.3s ease;
}

/* 修复 Chromium/WebKit 中 overflow 容器 padding-bottom 失效问题：
   在最后一个子元素后追加占位空间，确保底部内容可完整滚出，不被底部导航栏遮挡 */
.sb-mobile-sidebar::after {
	content: '';
	display: block;
	height: calc(8rem + env(safe-area-inset-bottom));
	flex-shrink: 0;
}

/* 安卓占位符 - 侧边栏内与侧栏同色 */
.sb-mobile-sidebar :deep(.android-seat) {
	flex-shrink: 0;
	background: rgba(255, 255, 255, 0.96);
	margin: -1.2rem -1.2rem 0;
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
	padding: 0.4rem 0.4rem 1.2rem;
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 0.8rem;
}

.sb-logo-emoji {
	font-size: 2.4rem;
}

.sb-logo-text {
	font-size: 1.8rem;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #ffb020);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.sb-close-sidebar {
	width: 3.6rem;
	height: 3.6rem;
	border: none;
	background: transparent;
	font-size: 2.8rem;
	cursor: pointer;
	color: #6b7280;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.sb-nav-item {
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

.sb-nav-item:active {
	background: rgba(255, 111, 163, 0.1);
	color: #ff6fa3;
}

.sb-nav-icon {
	width: 1.8rem;
	font-size: 1.6rem;
	text-align: center;
}

.sb-sec {
	margin-top: 0.8rem;
}

.sb-sec-title {
	font-size: 1.1rem;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 0.8rem 1.2rem 0.4rem;
}

.sb-nav-title {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	text-transform: none;
	letter-spacing: normal;
}

.sb-nav-title span {
	flex: 1;
}

.sb-manage-toggle {
	width: 2.8rem;
	height: 2.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 0.8rem;
	background: rgba(255, 255, 255, 0.6);
	color: #9ca3af;
	cursor: pointer;
	font-size: 1.4rem;
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
	padding: 0.8rem 1.2rem;
	font-size: 1.2rem;
	color: #9ca3af;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 0.8rem 1.2rem;
	font-size: 1.3rem;
	color: #4b5563;
	cursor: pointer;
	border-radius: 0.8rem;
}

.sb-sec-item:active {
	background: rgba(255, 111, 163, 0.1);
}

.sb-sec-count {
	font-size: 1.1rem;
	color: #9ca3af;
}

.sb-mobile-main {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1.6rem;
	/* 底栏 5.6rem + safe-area + 冗余，避免最后内容被底栏遮挡 */
	padding-bottom: calc(5.6rem + env(safe-area-inset-bottom, 0px) + 3.2rem);
}

.sb-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 0.8rem 0;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(1.2rem);
	border-top: 1px solid rgba(255, 111, 163, 0.2);
	z-index: 100;
}

.sb-mobile-nav-bar .sb-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.4rem;
	padding: 0.6rem 1.2rem;
	min-height: auto;
}

.sb-mobile-nav-bar .sb-nav-label {
	font-size: 1.1rem;
	font-weight: 500;
}
</style>
