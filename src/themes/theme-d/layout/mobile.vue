<template>
	<div class="style-d style-d-mobile" :style="themeVars">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sd-mobile-header">
			<button class="sd-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sd-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
		</header>

		<!-- 侧边栏抽屉 -->
		<div v-if="showSidebar" class="sd-mobile-sidebar-backdrop" @click="showSidebar = false">
			<aside class="sd-mobile-sidebar" @click.stop>
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

				<nav class="sd-nav">
					<div
						v-for="item in menu"
						:key="item.key"
						:class="['sd-nav-item', { active: isActive(item) }]"
						@click="go(item.path)"
					>
						<span class="sd-nav-icon">{{ item.icon }}</span>
						<span>{{ item.label }}</span>
					</div>
				</nav>

				<div class="sd-sec-title">媒体库</div>
				<nav class="sd-nav">
					<div v-for="m in mediaListData" :key="m.id" class="sd-nav-item" @click="goMedia(m.id)">
						<span class="sd-nav-icon">📁</span>
						<span class="sd-nav-label">{{ m.name }}</span>
						<span class="sd-nav-count">{{ m.count }}</span>
					</div>
				</nav>

				<div class="sd-user">
					<div class="sd-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
					<div>
						<div class="sd-user-name">{{ userInfo.userName || 'User' }}</div>
						<div class="sd-user-role">{{ Cookies.getRole() === 'admin' ? '管理员' : '用户' }}</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- 主内容区 -->
		<main class="sd-mobile-main">
			<router-view />
		</main>

		<!-- 底部导航栏 -->
		<nav class="sd-mobile-nav-bar">
			<div v-for="item in bottomNav" :key="item.key" class="sd-nav-item" @click="go(item.path)">
				<span class="sd-nav-icon">{{ item.icon }}</span>
				<span class="sd-nav-label">{{ item.label }}</span>
			</div>
		</nav>
	</div>

	<theme-context-menu />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userInfo } from '@/store'
import { Cookies } from '@/utils'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import androidSeat from '@/layout/components/android-seat.vue'

const showSidebar = ref(false)
const router = useRouter()
const route = useRoute()

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
const STORAGE_KEY = 'smanga-theme-d-color'

function loadThemeColor(): ThemeColorKey {
	const saved = localStorage.getItem(STORAGE_KEY)
	return (saved as ThemeColorKey) || 'blue'
}

const currentTheme = ref<ThemeColorKey>(loadThemeColor())

function setThemeColor(key: ThemeColorKey) {
	currentTheme.value = key
	localStorage.setItem(STORAGE_KEY, key)
}

const themeVars = computed(() => {
	const t = themeList.find((x) => x.key === currentTheme.value) || themeList[0]
	return {
		'--sd-primary': t.primary,
		'--sd-back': t.back,
		'--sd-hover': t.hover,
		'--sd-text': t.key === 'dark' ? '#E6E8EB' : '#0F172A',
		'--sd-text-muted': t.key === 'dark' ? '#9AA3AE' : '#64748B',
		'--sd-card': t.key === 'dark' ? '#161A20' : '#FFFFFF',
		'--sd-border': t.key === 'dark' ? '#2A313C' : '#DBEAFE',
	}
})

const menu = [
	{ key: 'home', label: '首页', icon: '🏠', path: '/t' },
	{ key: 'history', label: '最近阅读', icon: '🕘', path: '/t/history' },
	{ key: 'bookmark', label: '书签', icon: '🔖', path: '/t/bookmark' },
	{ key: 'collect', label: '收藏', icon: '⭐', path: '/t/collect' },
	{ key: 'search', label: '搜索', icon: '🔍', path: '/t/search' },
	{ key: 'tag', label: '标签', icon: '🏷️', path: '/t/tags' },
	{ key: 'manage', label: '管理', icon: '⚙️', path: '/t/manage' },
	{ key: 'setting', label: '设置', icon: '🔧', path: '/t/setting/user' },
]

const mediaListData = ref([
	{ id: 1, name: '少年漫画', icon: '📚', count: 128 },
	{ id: 2, name: '少女漫画', icon: '🌸', count: 64 },
	{ id: 3, name: '青年漫画', icon: '📖', count: 96 },
	{ id: 4, name: '同人本', icon: '🎨', count: 32 },
])

const bottomNav = [
	{ key: 'home', label: '首页', icon: '🏠', path: '/t' },
	{ key: 'history', label: '历史', icon: '🕘', path: '/t/history' },
	{ key: 'bookmark', label: '书签', icon: '🔖', path: '/t/bookmark' },
	{ key: 'collect', label: '收藏', icon: '⭐', path: '/t/collect' },
	{ key: 'media', label: '媒体', icon: '📁', path: '/t/media' },
	{ key: 'search', label: '搜索', icon: '🔍', path: '/t/search' },
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

function isActive(item: any) {
	return route.path === item.path
}

function go(path: string) {
	router.push(path)
	showSidebar.value = false
}

function goMedia(mediaId: number) {
	router.push(`/t/media/${mediaId}`)
	showSidebar.value = false
}
</script>

<style scoped>
.style-d-mobile {
	min-height: 100vh;
	background: var(--sd-back, #eff6ff);
	color: var(--sd-text, #0f172a);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding-bottom: 70px;
}

.sd-mobile-header {
	position: sticky;
	top: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	padding-top: calc(12px + env(safe-area-inset-top));
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid var(--sd-border, #dbeafe);
}

.sd-menu-toggle {
	width: 40px;
	height: 40px;
	border: none;
	background: transparent;
	font-size: 20px;
	cursor: pointer;
	border-radius: 10px;
}

.sd-menu-toggle:active {
	background: var(--sd-hover, #dbeafe);
}

.sd-mobile-title h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
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
	width: 280px;
	max-width: 80vw;
	height: 100%;
	background: var(--sd-card, #fff);
	padding: 16px 12px;
	overflow-y: auto;
	animation: slideIn 0.3s ease;
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
	padding: 4px 8px 16px;
}

.sd-logo {
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
}

.sd-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary, #2563eb);
	color: #fff;
	font-weight: 700;
	border-radius: 8px;
}

.sd-logo-text {
	font-size: 16px;
	font-weight: 700;
}

.sd-close-sidebar {
	width: 36px;
	height: 36px;
	border: none;
	background: transparent;
	font-size: 28px;
	cursor: pointer;
	color: var(--sd-text-muted, #64748b);
}

.sd-theme-switcher {
	padding: 12px;
	margin-bottom: 12px;
	background: var(--sd-hover, #f1f5f9);
	border-radius: 12px;
}

.sd-theme-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--sd-text-muted, #64748b);
	margin-bottom: 8px;
}

.sd-theme-options {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.sd-theme-swatch {
	width: 28px;
	height: 28px;
	border: 2px solid transparent;
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
	gap: 2px;
}

.sd-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: var(--sd-text-muted, #64748b);
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s;
	min-height: 44px;
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
	width: 18px;
	font-size: 16px;
	text-align: center;
}

.sd-nav-label {
	flex: 1;
}

.sd-nav-count {
	padding: 2px 8px;
	font-size: 11px;
	color: var(--sd-text-muted, #64748b);
	background: var(--sd-hover, #f1f5f9);
	border-radius: 10px;
}

.sd-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: var(--sd-text-muted, #64748b);
}

.sd-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 8px;
	border-top: 1px solid var(--sd-border, #e5e7eb);
}

.sd-avatar {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary, #2563eb);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
}

.sd-user-name {
	font-weight: 500;
	font-size: 14px;
}

.sd-user-role {
	font-size: 12px;
	color: var(--sd-text-muted, #64748b);
}

.sd-mobile-main {
	padding: 16px;
	min-height: calc(100vh - 140px);
}

.sd-mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 8px 0;
	background: var(--sd-card, #fff);
	border-top: 1px solid var(--sd-border, #dbeafe);
	z-index: 100;
}

.sd-mobile-nav-bar .sd-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	min-height: auto;
}

.sd-mobile-nav-bar .sd-nav-label {
	font-size: 11px;
	font-weight: 500;
}
</style>
