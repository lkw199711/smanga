<template>
	<div :class="['style-d', 'style-d-mobile', { 'sd-dark': isDark }]" :style="themeVars">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sd-mobile-header">
			<button class="sd-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sd-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
			<div class="sd-header-user">
				<div class="sd-header-user-trigger" @click="toggleMobileUserDropdown">
					<div class="sd-avatar sd-avatar-sm">
						<img v-if="mobileAvatarBlobUrl" :src="mobileAvatarBlobUrl" class="sd-avatar-img" />
						<span v-else>{{ userInfo.userName?.charAt(0) || 'U' }}</span>
					</div>
					<span class="sd-header-user-arrow" :class="{ open: showMobileUserDropdown }">▾</span>
				</div>
				<div v-if="showMobileUserDropdown" class="sd-header-user-dropdown">
					<div class="sd-user-dropdown-item" @click="goMobileSettings">⚙️ 设置</div>
					<div class="sd-user-dropdown-item sd-user-dropdown-logout" @click="mobileLogout">🚪 登出</div>
				</div>
			</div>
		</header>

		<!-- 侧边栏抽屉 -->
		<div v-if="showSidebar" class="sd-mobile-sidebar-backdrop smanga-backable" @click="showSidebar = false">
			<aside class="sd-mobile-sidebar" @click.stop>
				<android-seat />
				<div class="sd-sidebar-header">
					<div class="sd-logo" @click="go('/t')">
						<div class="sd-logo-mark">s</div>
						<div class="sd-logo-text">smanga</div>
					</div>
					<button class="sd-close-sidebar" @click="showSidebar = false">×</button>
				</div>

				<!-- 主题色切换 -->
				<div class="sd-theme-switcher">
					<div class="sd-theme-label">主题色</div>
					<div class="sd-theme-options">
						<button
							v-for="t in themeList"
							:key="t.key"
							:class="['sd-theme-swatch', { active: currentTheme === t.key }]"
							:style="{ background: t.primary }"
							:title="t.name"
							@click="setThemeColor(t.key)"
						></button>
					</div>
				</div>

				<div class="sd-sec-title sd-nav-title">
					<span>{{ manageMode ? '管理菜单' : '导航' }}</span>
					<button
						v-if="isAdmin"
						:class="['sd-manage-toggle', { active: manageMode }]"
						@click="manageMode = !manageMode"
						:title="manageMode ? '退出管理模式' : '管理模式'"
					>
						⚙️
					</button>
				</div>

				<nav class="sd-nav">
					<div
						v-for="item in currentMenu"
						:key="item.path"
						:class="['sd-nav-item', { active: isActive(item) }]"
						@click="go(item.path)"
					>
						<span class="sd-nav-icon">{{ item.icon }}</span>
						<span>{{ item.label }}</span>
					</div>
				</nav>

				<div class="sd-sec-title">媒体库</div>
				<nav class="sd-nav">
					<div v-for="m in mediaListData" :key="m.mediaId" class="sd-nav-item" @click="goMedia(m.mediaId)">
						<span class="sd-nav-icon">📁</span>
						<span class="sd-nav-label">{{ m.mediaName || m.mediaId }}</span>
						<span class="sd-nav-count">{{ m.mangaCount || 0 }}</span>
					</div>
					<div v-if="mediaListData.length === 0" class="sd-nav-empty">暂无媒体库</div>
				</nav>

			</aside>
		</div>

		<!-- 主内容区 -->
		<main class="sd-mobile-main">
			<router-view />
		</main>

		<!-- 底部导航栏 -->
		<nav class="sd-mobile-nav-bar">
			<div v-for="item in bottomNav" :key="item.path" class="sd-nav-item" @click="go(item.path)">
				<span class="sd-nav-icon">{{ item.icon }}</span>
				<span class="sd-nav-label">{{ item.label }}</span>
			</div>
		</nav>
	</div>

	<theme-context-menu />
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userInfo } from '@/store'
import { useSessionStore } from '@/store/session'
import { preferencesStore } from '@/store/preferences'
import mediaStatsApi from '@/api/media-stats'
import imageApi from '@/api/image'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import androidSeat from '@/layout/components/android-seat.vue'
import { navMenu, adminNavMenu, bottomNavMenu, getPageTitle } from '@/themes/constants/menu'
import { themeListKeys, useThemeListStateStore } from '@/themes/stores/list-state'
import './dark-overrides.css'

const showSidebar = ref(false)
const router = useRouter()
const route = useRoute()
const listState = useThemeListStateStore()
const session = useSessionStore()

const themeList = [
	{ key: 'blue', name: '蓝', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', name: '粉', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', name: '绿', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', name: '紫', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'red', name: '红', primary: '#DC2626', back: '#FEF2F2', hover: '#FEE2E2' },
	{ key: 'cyan', name: '青', primary: '#0891B2', back: '#ECFEFF', hover: '#CFFAFE' },
	{ key: 'orange', name: '橙', primary: '#EA580C', back: '#FFF7ED', hover: '#FFEDD5' },
	{ key: 'grey', name: '灰', primary: '#475569', back: '#F8FAFC', hover: '#F1F5F9' },
	{ key: 'dark', name: '暗', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
] as const

type ThemeColorKey = (typeof themeList)[number]['key']
const currentTheme = computed<ThemeColorKey>({
	get: () => preferencesStore.themeDColor,
	set: (value) => preferencesStore.setThemeDColor(value),
})

function setThemeColor(key: ThemeColorKey) {
	currentTheme.value = key
}

const isDark = computed(() => currentTheme.value === 'dark')

/**
 * 与 index.vue 一致:theme-d 的 dark 是自定义皮肤 key,不会触发 src/style/theme.ts changeStyle,
 * 章节卡片等依赖 --s-back-soft-original / --s-back-text 的通用组件保持 light值。
 * 直接以 theme.ts 相同方式(document.body inline style)注入暗色 --s-*,同优先级、后写入生效。
 */
const SD_DARK_S_VARS_M: Record<string, string> = {
	's-back': '#0D0F12',
	's-back-soft': '#161A20',
	's-back-soft-original': '#161A20',
	's-back-text': '#E6E8EB',
	's-back-text-secondary': '#9AA3AE',
	's-back-text-tertiary': '#5C6470',
	's-text': '#E6E8EB',
	's-text-secondary': '#9AA3AE',
	's-text-tertiary': '#5C6470',
	's-border': '#2A313C',
	's-hover-back': '#232A34',
	's-card': '#161A20',
	's-header': '#1B2028',
	's-menu': '#1B2028',
	's-input': '#161A20',
	's-input-border': '#2A313C',
	's-background': '#0D0F12',
}
function applySdDarkSVarsMobile(dark: boolean) {
	if (dark) {
		for (const k in SD_DARK_S_VARS_M) {
			document.body.style.setProperty(`--${k}`, SD_DARK_S_VARS_M[k])
		}
		document.documentElement.style.setProperty('--s-back', SD_DARK_S_VARS_M['s-back'])
		document.documentElement.style.setProperty('--s-background', SD_DARK_S_VARS_M['s-background'])
	} else {
		for (const k in SD_DARK_S_VARS_M) {
			document.body.style.removeProperty(`--${k}`)
		}
		document.documentElement.style.removeProperty('--s-back')
		document.documentElement.style.removeProperty('--s-background')
	}
}
watch(isDark, (v) => applySdDarkSVarsMobile(v), { immediate: true })

const themeVars = computed(() => {
	const t = themeList.find((x) => x.key === currentTheme.value) || themeList[0]
	const dark = t.key === 'dark'
	return {
		'--sd-primary': t.primary,
		'--sd-primary-bg': `${t.primary}1a`,
		'--sd-primary-hover': t.primary,
		'--sd-primary-ring': `${t.primary}26`,
		'--sd-back': t.back,
		'--sd-hover': t.hover,
		'--sd-text': dark ? '#E6E8EB' : '#0F172A',
		'--sd-text-muted': dark ? '#9AA3AE' : '#64748B',
		'--sd-text-secondary': dark ? '#9AA3AE' : '#64748B',
		'--sd-text-faint': dark ? '#5C6470' : '#94A3B8',
		'--sd-card': dark ? '#161A20' : '#FFFFFF',
		'--sd-border': dark ? '#2A313C' : '#DBEAFE',
		'--sd-border-strong': dark ? '#3A424E' : '#D1D5DB',
		'--sd-bg': dark ? '#0D0F12' : '#FFFFFF',
		'--sd-bg2': dark ? '#1B2028' : '#F3F4F6',
		'--sd-bg-hover': dark ? '#232A34' : '#E5E7EB',
		'--sd-danger': dark ? '#F87171' : '#EF4444',
		'--accent': t.primary,
		'--bg': t.back,
		'--bg2': dark ? '#161A20' : '#FFFFFF',
		'--border': dark ? '#2A313C' : '#DBEAFE',
		'--fg': dark ? '#E6E8EB' : '#0F172A',
		'--fg2': dark ? '#9AA3AE' : '#64748B',
	}
})

const manageMode = ref(false)
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

function isActive(item: any) {
	return route.path === item.path
}

function go(path: string) {
	router.push(path)
	showSidebar.value = false
}

function goMedia(mediaId: number) {
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
	router.push('/t/login')
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
	if (target.closest('.sd-header-user-dropdown')) return
	if (target.closest('.sd-header-user-trigger')) return
	showMobileUserDropdown.value = false
}
</script>

<style scoped>
.style-d-mobile {
	height: 100dvh;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: var(--sd-back, #eff6ff);
	color: var(--sd-text, #0f172a);
	font-size: 1.4rem;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sd-mobile-header {
	flex-shrink: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 1.2rem;
	padding: 1.2rem 1.6rem;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(1rem);
	border-bottom: 1px solid var(--sd-border, #dbeafe);
}

/* 安卓占位符与顶栏背景一致 */
:deep(.android-seat) {
	background: rgba(255, 255, 255, 0.9);
}

.sd-menu-toggle {
	width: 4rem;
	height: 4rem;
	border: none;
	background: transparent;
	font-size: 2rem;
	cursor: pointer;
	border-radius: 1rem;
}

.sd-menu-toggle:active {
	background: var(--sd-hover, #dbeafe);
}

.sd-mobile-title {
	flex: 1;
	min-width: 0;
}

.sd-mobile-title h1 {
	margin: 0;
	font-size: 1.8rem;
	font-weight: 600;
}

/* Header 用户区 */
.sd-header-user {
	position: relative;
	flex-shrink: 0;
}

.sd-header-user-trigger {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	cursor: pointer;
	padding: 0.4rem 0.6rem;
	border-radius: 0.8rem;
}

.sd-header-user-trigger:active {
	background: var(--sd-hover, #dbeafe);
}

.sd-avatar-sm {
	width: 2.8rem;
	height: 2.8rem;
	font-size: 1.2rem;
	flex-shrink: 0;
}

.sd-header-user-arrow {
	font-size: 1rem;
	color: var(--sd-text-muted, #64748b);
	transition: transform 0.2s;
}

.sd-header-user-arrow.open {
	transform: rotate(180deg);
}

.sd-header-user-dropdown {
	position: absolute;
	top: calc(100% + 0.6rem);
	right: 0;
	min-width: 14rem;
	background: var(--sd-card, #fff);
	border: 1px solid var(--sd-border, #dbeafe);
	border-radius: 1rem;
	box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.08);
	z-index: 300;
	padding: 0.6rem;
}

.sd-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 1rem 1.4rem;
	font-size: 1.4rem;
	color: var(--sd-text-muted, #64748b);
	border-radius: 0.6rem;
	cursor: pointer;
	transition: all 0.15s;
}

.sd-user-dropdown-item:active {
	background: var(--sd-hover, #f1f5f9);
}

.sd-user-dropdown-logout {
	color: #dc2626;
}

.sd-user-dropdown-logout:active {
	background: #fef2f2;
}

.sd-mobile-sidebar-backdrop {
	position: fixed;
	inset: 0;
	z-index: 100;
	background: rgba(0, 0, 0, 0.5);
}

.sd-mobile-sidebar {
	position: absolute;
	top: 0;
	left: 0;
	width: 28rem;
	max-width: 80vw;
	height: 100%;
	background: var(--sd-card, #fff);
	padding: 1.2rem;
	overflow-y: auto;
	overscroll-behavior: contain;
	animation: slideIn 0.3s ease;
}

/* 修复 Chromium/WebKit 中 overflow 容器 padding-bottom 失效问题：
   在最后一个子元素后追加占位空间，确保底部内容可完整滚出，不被底部导航栏遮挡 */
.sd-mobile-sidebar::after {
	content: '';
	display: block;
	height: calc(8rem + env(safe-area-inset-bottom));
	flex-shrink: 0;
}

/* 安卓占位符 - 侧边栏内与侧栏同色 */
.sd-mobile-sidebar :deep(.android-seat) {
	flex-shrink: 0;
	background: var(--sd-card, #fff);
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

.sd-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.4rem 0.4rem 1.2rem;
}

.sd-logo {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	cursor: pointer;
}

.sd-logo-mark {
	width: 2.8rem;
	height: 2.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary, #2563eb);
	color: #fff;
	font-weight: 700;
	border-radius: 0.8rem;
}

.sd-logo-text {
	font-size: 1.6rem;
	font-weight: 700;
}

.sd-close-sidebar {
	width: 3.6rem;
	height: 3.6rem;
	border: none;
	background: transparent;
	font-size: 2.8rem;
	cursor: pointer;
	color: var(--sd-text-muted, #64748b);
}

.sd-theme-switcher {
	padding: 1.2rem;
	margin-bottom: 1.2rem;
	background: var(--sd-hover, #f1f5f9);
	border-radius: 1.2rem;
}

.sd-theme-label {
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--sd-text-muted, #64748b);
	margin-bottom: 0.8rem;
}

.sd-theme-options {
	display: flex;
	gap: 0.6rem;
	flex-wrap: wrap;
}

.sd-theme-swatch {
	width: 2.8rem;
	height: 2.8rem;
	border: 0.2rem solid transparent;
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-theme-swatch.active {
	border-color: var(--sd-text, #0f172a);
	transform: scale(1.1);
}

.sd-nav {
	display: flex;
	flex-direction: column;
	gap: 1px;
}

.sd-nav-item {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.8rem 1.2rem;
	color: var(--sd-text-muted, #64748b);
	border-radius: 0.8rem;
	cursor: pointer;
	transition: all 0.15s;
	font-size: 1.4rem;
	user-select: none;
	-webkit-user-select: none;
	-webkit-tap-highlight-color: transparent;
}

.sd-nav-item:active,
.sd-nav-item.active {
	background: var(--sd-hover, #dbeafe);
	color: var(--sd-primary, #2563eb);
}

.sd-nav-icon {
	width: 1.8rem;
	font-size: 1.6rem;
	text-align: center;
}

.sd-nav-label {
	flex: 1;
}

.sd-nav-count {
	padding: 0.2rem 0.8rem;
	font-size: 1.1rem;
	color: var(--sd-text-muted, #64748b);
	background: var(--sd-hover, #f1f5f9);
	border-radius: 1rem;
}

.sd-nav-empty {
	padding: 0.8rem 1.2rem;
	font-size: 1.2rem;
	color: var(--sd-text-muted, #64748b);
}

.sd-sec-title {
	padding: 1rem 0.8rem 0.4rem;
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--sd-text-muted, #64748b);
}

.sd-nav-title {
	display: flex;
	align-items: center;
	gap: 0.8rem;
}

.sd-nav-title span {
	flex: 1;
}

.sd-manage-toggle {
	width: 2.8rem;
	height: 2.8rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--sd-border, #dbeafe);
	border-radius: 0.8rem;
	background: var(--sd-card, #fff);
	color: var(--sd-text-muted, #64748b);
	cursor: pointer;
	font-size: 1.4rem;
	transition: all 0.15s;
	flex-shrink: 0;
}

.sd-manage-toggle:active {
	background: var(--sd-hover, #dbeafe);
	color: var(--sd-text, #0f172a);
}

.sd-manage-toggle.active {
	background: var(--sd-primary, #2563eb);
	border-color: var(--sd-primary, #2563eb);
	color: #fff;
}

.sd-avatar {
	width: 3.6rem;
	height: 3.6rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary, #2563eb);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	flex-shrink: 0;
	overflow: hidden;
	font-size: 1.4rem;
}

.sd-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
	display: block;
}

.sd-mobile-main {
	flex: 1;
	overflow-y: auto;
	padding: 1.6rem;
	/* 底栏 5.6rem + safe-area */
	padding-bottom: calc(5.6rem + env(safe-area-inset-bottom, 0px) + 3.2rem);
}

.sd-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 0.8rem 0;
	background: var(--sd-card, #fff);
	border-top: 1px solid var(--sd-border, #dbeafe);
	z-index: 100;
}

.sd-mobile-nav-bar .sd-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.4rem;
	padding: 0.6rem 1.2rem;
	min-height: auto;
}

.sd-mobile-nav-bar .sd-nav-label {
	font-size: 1.1rem;
	font-weight: 500;
}
</style>
