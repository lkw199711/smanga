<template>
	<aside class="sb-sidebar">
		<div class="sb-logo">
			<span class="sb-logo-emoji">🌸</span>
			<span class="sb-logo-text">smanga</span>
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
			<div v-for="item in menu" :key="item.key" :class="['sb-nav-item', { active: isActive(item.path) }]" @click="go(item.path)">
				<span class="sb-nav-icon">{{ item.icon }}</span>
				<span>{{ item.label }}</span>
			</div>
		</nav>

		<div class="sb-sec">
			<div class="sb-sec-title">✨ 我的书架</div>
			<div v-for="m in mediaList" :key="m.id" class="sb-sec-item" @click="goMedia(m.id)">
				<span>{{ m.icon }} {{ m.name }}</span>
				<span class="sb-sec-count">{{ m.count }}</span>
			</div>
		</div>

		<div class="sb-card-hint">
			<div class="sb-card-hint-title">今日推荐 🎁</div>
			<div class="sb-card-hint-desc">打开盲盒，发现新漫画</div>
			<button class="sb-card-hint-btn" @click="go('/t/media')">去看看</button>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mediaStatsApi from '@/api/media-stats'
import { Cookies } from '@/utils'
import useBrowseStore from '@/store/browse'

const manageMode = ref(false)
const isAdmin = computed(() => Cookies.getRole() === 'admin')

const navItems = [
	{ key: 'home', label: '首页', icon: '🏠', path: '/t' },
	{ key: 'history', label: '最近阅读', icon: '🕘', path: '/t/history' },
	{ key: 'bookmark', label: '书签', icon: '🔖', path: '/t/bookmark' },
	{ key: 'collect', label: '收藏', icon: '⭐', path: '/t/collect' },
	{ key: 'search', label: '搜索', icon: '🔍', path: '/t/search' },
	{ key: 'tag', label: '标签', icon: '🏷️', path: '/t/tags' },
	{ key: 'setting', label: '设置', icon: '🔧', path: '/t/setting/user' },
	{ key: 'wiki', label: '帮助文档', icon: '📖', path: '/t/wiki' },
]

const adminNavItems = [
	{ key: 'manage-users', label: '用户管理', icon: '👤', path: '/t/manage/users' },
	{ key: 'manage-media', label: '媒体库管理', icon: '📁', path: '/t/manage/media' },
	{ key: 'manage-manga', label: '漫画管理', icon: '📚', path: '/t/manage/manga' },
	{ key: 'manage-chapters', label: '章节管理', icon: '📑', path: '/t/manage/chapters' },
	{ key: 'manage-paths', label: '路径管理', icon: '📂', path: '/t/manage/paths' },
	{ key: 'manage-bookmarks', label: '书签管理', icon: '🔖', path: '/t/manage/bookmarks' },
	{ key: 'manage-tags', label: '标签管理', icon: '🏷️', path: '/t/manage/tags' },
	{ key: 'manage-compress', label: '解压管理', icon: '🗜️', path: '/t/manage/compress' },
	{ key: 'manage-jobs', label: '任务管理', icon: '📋', path: '/t/manage/jobs' },
	{ key: 'manage-sync', label: '漫画同步', icon: '🔄', path: '/t/manage/sync' },
	{ key: 'manage-share', label: '漫画分享', icon: '📤', path: '/t/manage/share' },
	{ key: 'manage-p2p', label: 'P2P管理', icon: '🌐', path: '/t/manage/p2p' },
	{ key: 'manage-server', label: '服务器设置', icon: '🖥️', path: '/t/manage/server' },
]

const menu = computed(() => manageMode.value ? adminNavItems : navItems)

const mediaList = ref([
	{ id: 1, name: '少年漫画', icon: '📚', count: 128 },
	{ id: 2, name: '少女漫画', icon: '🌸', count: 64 },
	{ id: 3, name: '青年漫画', icon: '📖', count: 96 },
	{ id: 4, name: '同人本', icon: '🎨', count: 32 },
])

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

function normalizePath(p: string) {
	if (p === '/t') return '/t'
	return p.replace(/\/+$/, '')
}

function isActive(path: string) {
	const cur = normalizePath(route.path)
	const base = normalizePath(path)
	if (base === '/t') return cur === '/t'
	return cur === base || cur.startsWith(base + '/')
}

function go(path: string) {
	router.push(path)
}

function goMedia(mediaId: number) {
	browse.mangaListPage = 1
	router.push(`/t/media/${mediaId}`)
}

onMounted(async () => {
	try {
		const mediaWithCounts = await mediaStatsApi.getMediaWithCounts()
		if (mediaWithCounts.length > 0) {
			mediaList.value = mediaWithCounts.map((item: any) => ({
				id: Number(item.mediaId),
				name: item.mediaName || String(item.mediaId),
				icon: '📚',
				count: item.mangaCount || 0,
			}))
		}
	} catch (e) {
	}
})
</script>

<style scoped>
.sb-sidebar {
	flex-shrink: 0;
	width: 24rem;
	margin: 1.6rem 0 1.6rem 1.6rem;
	padding: 2rem 1.4rem;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(1.6rem);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 2rem;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	box-shadow: 0 0.8rem 2.4rem rgba(108, 141, 255, 0.1);
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.4rem 0.8rem 1.6rem;
}

.sb-logo-emoji {
	font-size: 2.4rem;
}

.sb-logo-text {
	font-size: 1.8rem;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
}

.sb-nav-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem 1.2rem;
	color: #4b5563;
	border-radius: 1.2rem;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.sb-nav-item:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateX(0.2rem);
}

.sb-nav-item.active {
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18));
	color: #1f2937;
}

.sb-nav-item.active:hover {
	transform: translateX(0.2rem);
}

.sb-nav-icon {
	font-size: 1.5rem;
}

.sb-sec {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	margin-top: 1.6rem;
}

.sb-sec-title {
	padding: 1.2rem 0.8rem 0.6rem;
	display: flex;
	align-items: center;
	font-size: 1.1rem;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.sb-sec-title span {
	flex: 1;
}

.sb-nav-title {
	padding: 1rem 1.2rem 0.6rem;
	color: #9ca3af;
	text-transform: none;
	letter-spacing: normal;
}

.sb-manage-toggle {
	margin-left: auto;
	width: 3.2rem;
	height: 3.2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 0.8rem;
	background: rgba(255, 255, 255, 0.6);
	color: #9ca3af;
	cursor: pointer;
	font-size: 1.6rem;
	transition: all 0.15s;
	flex-shrink: 0;
}

.sb-manage-toggle:hover {
	background: rgba(255, 255, 255, 0.9);
	color: #4b5563;
}

.sb-manage-toggle.active {
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-color: transparent;
	color: #fff;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 0.8rem 1.2rem;
	font-size: 1.3rem;
	color: #4b5563;
	border-radius: 1rem;
	cursor: pointer;
}

.sb-sec-item:hover {
	background: rgba(255, 255, 255, 0.8);
}

.sb-sec-count {
	font-size: 1.1rem;
	color: #9ca3af;
}

.sb-card-hint {
	flex-shrink: 0;
	margin-top: auto;
	padding: 1.4rem;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-radius: 1.6rem;
	color: #fff;
	text-align: center;
}

.sb-card-hint-title {
	font-size: 1.4rem;
	font-weight: 700;
	margin-bottom: 0.4rem;
}

.sb-card-hint-desc {
	font-size: 1.1rem;
	opacity: 0.9;
	margin-bottom: 1rem;
}

.sb-card-hint-btn {
	padding: 0.6rem 1.6rem;
	background: #fff;
	color: #ff6fa3;
	font-size: 1.2rem;
	font-weight: 600;
	border: none;
	border-radius: 99.9rem;
	cursor: pointer;
}
</style>
