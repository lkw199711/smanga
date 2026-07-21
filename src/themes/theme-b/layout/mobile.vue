<template>
	<div class="style-b style-b-mobile">
		<android-seat />
		<!-- 移动端顶部栏 -->
		<header class="sb-mobile-header">
			<button class="sb-menu-toggle" @click="showSidebar = !showSidebar">☰</button>
			<div class="sb-mobile-title">
				<h1>{{ pageTitle }}</h1>
			</div>
		</header>

		<!-- 侧边栏抽屉 -->
		<div v-if="showSidebar" class="sb-mobile-sidebar-backdrop" @click="showSidebar = false">
			<aside class="sb-mobile-sidebar" @click.stop>
				<div class="sb-sidebar-header">
					<div class="sb-logo">
						<span class="sb-logo-emoji">🌸</span>
						<span class="sb-logo-text">smanga</span>
					</div>
					<button class="sb-close-sidebar" @click="showSidebar = false">×</button>
				</div>

				<nav class="sb-nav">
					<div v-for="item in menu" :key="item.key" class="sb-nav-item" @click="navigateTo(item.key)">
						<span class="sb-nav-icon">{{ item.icon }}</span>
						<span>{{ item.label }}</span>
					</div>
				</nav>

				<div class="sb-sec">
					<div class="sb-sec-title">✨ 我的书架</div>
					<div v-for="m in mediaList" :key="m.id" class="sb-sec-item" @click="navigateToMedia(m.id)">
						<span>{{ m.icon }} {{ m.name }}</span>
						<span class="sb-sec-count">{{ m.count }}</span>
					</div>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import androidSeat from '@/layout/components/android-seat.vue'

const showSidebar = ref(false)
const router = useRouter()
const route = useRoute()

const menu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'manage', label: '管理', icon: '⚙️' },
	{ key: 'setting', label: '设置', icon: '🔧' },
]

const mediaList = [
	{ id: 1, name: '少年漫画', icon: '📚', count: 128 },
	{ id: 2, name: '少女漫画', icon: '🌸', count: 64 },
	{ id: 3, name: '青年漫画', icon: '📖', count: 96 },
	{ id: 4, name: '同人本', icon: '🎨', count: 32 },
]

const bottomNav = [
	{ key: 'home', label: '首页', icon: '🏠' },
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
		search: '/t/search',
		tag: '/t/tags',
		manage: '/t/manage',
		setting: '/t/setting/user',
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
</script>

<style scoped>
.style-b-mobile {
	min-height: 100vh;
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding-bottom: 70px;
}

.sb-mobile-header {
	position: sticky;
	top: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	padding-top: calc(12px + env(safe-area-inset-top));
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(12px);
	border-bottom: 1px solid rgba(255, 111, 163, 0.2);
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

.sb-mobile-title h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
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
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
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

.sb-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 8px 16px;
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
	transition: all 0.15s;
	min-height: 44px;
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
	margin-top: 16px;
	padding: 12px;
	background: rgba(255, 255, 255, 0.7);
	border-radius: 16px;
}

.sb-sec-title {
	font-size: 12px;
	font-weight: 600;
	color: #ff6fa3;
	margin-bottom: 8px;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 8px;
	font-size: 13px;
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
	padding: 16px;
	min-height: calc(100vh - 140px);
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
