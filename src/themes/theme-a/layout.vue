<template>
	<div class="style-a">
		<!-- 侧边栏 -->
		<aside class="sa-sidebar">
			<div class="sa-logo">
				<div class="sa-logo-mark">S</div>
				<div class="sa-logo-text">smanga</div>
			</div>

			<div class="sa-sec-title">导航</div>
			<nav class="sa-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sa-nav-item', { active: i === 0 }]">
					<span class="sa-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sa-sec-title">媒体库</div>
			<nav class="sa-nav">
				<div v-for="m in mediaList" :key="m.id" class="sa-nav-item">
					<span class="sa-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="sa-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="sa-user">
				<div class="sa-avatar">U</div>
				<div class="sa-user-info">
					<div class="sa-user-name">User</div>
					<div class="sa-user-role">管理员</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sa-body">
			<!-- 顶栏 -->
			<header class="sa-topbar">
				<div class="sa-search">
					<span class="sa-search-icon">🔍</span>
					<input placeholder="搜索漫画、章节、标签…" />
					<span class="sa-search-kbd">Ctrl K</span>
				</div>
				<div class="sa-top-actions">
					<button class="sa-btn-ghost">视图</button>
					<button class="sa-btn-ghost">排序 ↓</button>
					<button class="sa-btn-ghost" @click="toggleTheme">{{ isDark ? '☀️' : '🌙' }}</button>
					<button class="sa-btn-ghost" @click="toggleLanguage">{{ currentLanguage }}</button>
					<button class="sa-btn-primary">+ 新建媒体库</button>
				</div>
			</header>

			<main class="sa-main">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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

const isDark = ref(false)
const currentLanguage = ref('中文')
const languages = ['中文', 'English', '日本語']

const router = useRouter()

function toggleTheme() {
	isDark.value = !isDark.value
	// 可以在这里添加主题切换逻辑
}

function toggleLanguage() {
	const currentIndex = languages.indexOf(currentLanguage.value)
	const nextIndex = (currentIndex + 1) % languages.length
	currentLanguage.value = languages[nextIndex]
	// 可以在这里添加语言切换逻辑
}

// 跳转到搜索页面
function goToSearch() {
	router.push('/t/search')
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
	// 检查是否按下了 Ctrl+K (或 Cmd+K on Mac)
	if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
		event.preventDefault()
		goToSearch()
	}
}

// 组件挂载时添加事件监听器
onMounted(() => {
	document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
	document.removeEventListener('keydown', handleKeydown)
})

</script>

<style scoped>
.style-a {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 侧边栏 */
.sa-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: #ffffff;
	border-right: 1px solid #eaeaea;
	display: flex;
	flex-direction: column;
}

.sa-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
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

.sa-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.sa-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sa-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	color: #4b5563;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s;
}

.sa-nav-item:hover {
	background: #f3f4f6;
	color: #111827;
}

.sa-nav-item.active {
	background: #f3f4f6;
	color: #111827;
	font-weight: 500;
}

.sa-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.sa-nav-count {
	margin-left: auto;
	padding: 1px 7px;
	font-size: 11px;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 10px;
}

.sa-nav-item.active .sa-nav-count,
.sa-nav-item:hover .sa-nav-count {
	background: #fff;
}

.sa-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #eaeaea;
}

.sa-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
}

.sa-user-name {
	font-weight: 500;
	font-size: 13px;
}

.sa-user-role {
	font-size: 11px;
	color: #9ca3af;
}

/* 顶栏 */
.sa-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sa-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: #fafafa;
	border-bottom: 1px solid #eaeaea;
}

.sa-search {
	flex: 1;
	max-width: 560px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 10px;
}

.sa-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #171717;
}

.sa-search input::placeholder {
	color: #9ca3af;
}

.sa-search-icon {
	color: #9ca3af;
	font-size: 13px;
}

.sa-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #6b7280;
	background: #f3f4f6;
	border: 1px solid #eaeaea;
	border-radius: 4px;
}

.sa-top-actions {
	display: flex;
	gap: 6px;
}

.sa-btn-ghost {
	padding: 7px 12px;
	font-size: 13px;
	color: #4b5563;
	background: transparent;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
}

.sa-btn-ghost:hover {
	background: #fff;
	border-color: #eaeaea;
}

.sa-btn-primary {
	padding: 7px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: #2563eb;
	border: none;
	border-radius: 8px;
	cursor: pointer;
}

.sa-btn-primary:hover {
	background: #1d4ed8;
}

/* 主区 */
.sa-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}
</style>