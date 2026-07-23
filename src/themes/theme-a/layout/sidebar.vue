<template>
	<aside class="sa-sidebar">
		<div class="sa-logo">
			<div class="sa-logo-mark">S</div>
			<div class="sa-logo-text">smanga</div>
			<button
				v-if="isAdmin"
				:class="['sa-manage-toggle', { active: manageMode }]"
				@click="manageMode = !manageMode"
				:title="manageMode ? '退出管理模式' : '管理模式'"
			>
				⚙️
			</button>
		</div>

		<template v-if="manageMode">
			<div class="sa-sec-title">
				<span>管理菜单</span>
				<button class="sa-manage-back" @click="manageMode = false">✕ 退出</button>
			</div>
			<nav class="sa-nav">
				<router-link
					v-for="item in adminNavItems"
					:key="item.path"
					:to="item.path"
					class="sa-nav-item"
					active-class="active"
				>
					<span class="sa-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</router-link>
			</nav>
		</template>

		<template v-else>
			<div class="sa-sec-title">导航</div>
			<nav class="sa-nav">
				<router-link
					v-for="item in navItems"
					:key="item.path"
					:to="item.path"
					class="sa-nav-item"
					:active-class="item.exact ? '' : 'active'"
					exact-active-class="active"
				>
					<span class="sa-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</router-link>
			</nav>

			<div class="sa-sec-title">媒体库</div>
			<nav class="sa-nav sa-media-nav">
				<div
					v-for="m in mediaListData"
					:key="m.mediaId"
					class="sa-nav-item"
					@click="goMedia(m.mediaId)"
				>
					<span class="sa-nav-icon">📁</span>
					<span class="sa-nav-label">{{ m.mediaName || m.mediaId }}</span>
					<span class="sa-nav-count">{{ m.mangaCount || 0 }}</span>
				</div>
				<div v-if="mediaListData.length === 0" class="sa-nav-empty">暂无媒体库</div>
			</nav>
		</template>

		<div class="sa-user" ref="userWrapRef">
			<div class="sa-user-trigger" @click="toggleUserDropdown">
				<div class="sa-avatar">
					<img v-if="avatarBlobUrl" :src="avatarBlobUrl" class="sa-avatar-img" />
					<span v-else class="sa-avatar-text">{{ userInfo.userName?.charAt(0) || 'U' }}</span>
				</div>
				<div class="sa-user-info">
					<div class="sa-user-name">{{ userInfo.userName || 'User' }}</div>
					<div class="sa-user-role">{{ Cookies.getRole() === 'admin' ? '管理员' : '用户' }}</div>
				</div>
				<span class="sa-user-arrow" :class="{ open: showUserDropdown }">▾</span>
			</div>
			<div v-if="showUserDropdown" class="sa-user-dropdown">
				<div class="sa-user-dropdown-item" @click="goSettings">
					<span class="sa-user-dropdown-icon">⚙️</span>
					<span>设置</span>
				</div>
				<div class="sa-user-dropdown-item sa-user-dropdown-logout" @click="userLogout">
					<span class="sa-user-dropdown-icon">🚪</span>
					<span>登出</span>
				</div>
			</div>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userInfo } from '@/store'
import mediaStatsApi from '@/api/media-stats'
import imageApi from '@/api/image'
import { Cookies } from '@/utils'

const router = useRouter()

const showUserDropdown = ref(false)
const userWrapRef = ref<HTMLElement | null>(null)
const avatarBlobUrl = ref('')
const manageMode = ref(false)

const isAdmin = computed(() => Cookies.getRole() === 'admin')

async function loadAvatar() {
  if (!userInfo.avatarPath) {
    avatarBlobUrl.value = ''
    return
  }
  const blobUrl = await imageApi.get({ file: userInfo.avatarPath })
  avatarBlobUrl.value = blobUrl || ''
}

watch(() => userInfo.avatarPath, loadAvatar, { immediate: true })

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

function onGlobalClick(e: MouseEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	if (target.closest('.sa-user-dropdown')) return
	if (target.closest('.sa-user-trigger')) return
	showUserDropdown.value = false
}

const navItems = [
	{ path: '/t', icon: '🏠', label: '首页', exact: true },
	{ path: '/t/history', icon: '🕘', label: '最近阅读' },
	{ path: '/t/bookmark', icon: '🔖', label: '书签' },
	{ path: '/t/collect', icon: '⭐', label: '收藏' },
	{ path: '/t/search', icon: '🔍', label: '搜索' },
	{ path: '/t/tags', icon: '🏷️', label: '标签' },
	{ path: '/t/media', icon: '📁', label: '媒体库' },
	{ path: '/t/setting/user', icon: '🔧', label: '设置' },
]

const adminNavItems = [
	{ path: '/t/manage/users', icon: '👤', label: '用户管理' },
	{ path: '/t/manage/media', icon: '📁', label: '媒体库管理' },
	{ path: '/t/manage/manga', icon: '📚', label: '漫画管理' },
	{ path: '/t/manage/chapters', icon: '📑', label: '章节管理' },
	{ path: '/t/manage/paths', icon: '📂', label: '路径管理' },
	{ path: '/t/manage/bookmarks', icon: '🔖', label: '书签管理' },
	{ path: '/t/manage/tags', icon: '🏷️', label: '标签管理' },
	{ path: '/t/manage/compress', icon: '🗜️', label: '解压管理' },
	{ path: '/t/manage/jobs', icon: '📋', label: '任务管理' },
	{ path: '/t/manage/sync', icon: '🔄', label: '漫画同步' },
	{ path: '/t/manage/share', icon: '📤', label: '漫画分享' },
	{ path: '/t/manage/p2p', icon: '🌐', label: 'P2P管理' },
	{ path: '/t/manage/server', icon: '🖥️', label: '服务器设置' },
	{ path: '/t/manage/wiki', icon: '📖', label: '帮助文档' },
]

const mediaListData = ref<any[]>([])

onMounted(async () => {
	try {
		mediaListData.value = await mediaStatsApi.getMediaWithCounts()
	} catch (e) {
		mediaListData.value = []
	}
	window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
	window.removeEventListener('click', onGlobalClick)
})

function goMedia(mediaId: number) {
	router.push(`/t/media/${mediaId}`)
}
</script>

<style scoped>
.sa-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: #ffffff;
	border-right: 1px solid #eaeaea;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}

.sa-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
}

.sa-manage-toggle {
	margin-left: auto;
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
}

.sa-manage-toggle:hover {
	background: #f3f4f6;
}

.sa-manage-toggle.active {
	background: #2563eb;
	border-color: #2563eb;
	color: #fff;
}

.sa-manage-back {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 11px;
	color: #ef4444;
	background: none;
	border: 1px solid #fecaca;
	border-radius: 4px;
	cursor: pointer;
}

.sa-manage-back:hover {
	background: #fef2f2;
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

.sa-media-nav {
	flex: 1;
	overflow-y: auto;
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
	text-decoration: none;
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

.sa-nav-label {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
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

.sa-nav-empty {
	padding: 8px 10px;
	font-size: 12px;
	color: #9ca3af;
}

.sa-user {
	margin-top: auto;
	border-top: 1px solid #eaeaea;
	position: relative;
}

.sa-user-trigger {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	cursor: pointer;
	border-radius: 8px;
	transition: background 0.15s;
}

.sa-user-trigger:hover {
	background: #f3f4f6;
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
	font-size: 14px;
	overflow: hidden;
	flex-shrink: 0;
}

.sa-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.sa-avatar-text {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.sa-user-arrow {
	margin-left: auto;
	font-size: 12px;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sa-user-arrow.open {
	transform: rotate(180deg);
}

.sa-user-dropdown {
	position: absolute;
	bottom: calc(100% + 8px);
	left: 8px;
	right: 8px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 10px;
	box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
	z-index: 300;
	padding: 6px;
}

.sa-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 9px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s;
}

.sa-user-dropdown-item:hover {
	background: #f3f4f6;
}

.sa-user-dropdown-logout {
	color: #dc2626;
}

.sa-user-dropdown-logout:hover {
	background: #fef2f2;
}

.sa-user-dropdown-icon {
	font-size: 14px;
	width: 18px;
	text-align: center;
}

.sa-user-name {
	font-weight: 500;
	font-size: 13px;
}

.sa-user-role {
	font-size: 11px;
	color: #9ca3af;
}
</style>
