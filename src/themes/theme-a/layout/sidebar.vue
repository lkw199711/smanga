<template>
	<aside class="sa-sidebar">
		<div class="sa-logo">
			<div class="sa-logo-mark">S</div>
			<div class="sa-logo-text">smanga</div>
		</div>

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
import { navMenu as navItems, adminNavMenu as adminNavItems } from '@/themes/constants/menu'

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
	width: 24rem;
	padding: 2rem 1.2rem;
	background: #ffffff;
	border-right: 1px solid #eaeaea;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}

.sa-logo {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.4rem 0.8rem 2rem;
}

.sa-manage-toggle {
	margin-left: auto;
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
}

.sa-manage-toggle:hover {
	background: #f3f4f6;
}

.sa-manage-toggle.active {
	background: #2563eb;
	border-color: #2563eb;
	color: #fff;
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

.sa-sec-title {
	padding: 1.2rem 0.8rem 0.6rem;
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
	gap: 0.2rem;
}

.sa-media-nav {
	flex: 1;
	overflow-y: auto;
}

.sa-nav-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.8rem 1rem;
	color: #4b5563;
	border-radius: 0.8rem;
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
	width: 1.8rem;
	font-size: 1.4rem;
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
	padding: 1px 0.7rem;
	font-size: 1.1rem;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 1rem;
}

.sa-nav-item.active .sa-nav-count,
.sa-nav-item:hover .sa-nav-count {
	background: #fff;
}

.sa-nav-empty {
	padding: 0.8rem 1rem;
	font-size: 1.2rem;
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
	gap: 1rem;
	padding: 1rem 0.8rem;
	cursor: pointer;
	border-radius: 0.8rem;
	transition: background 0.15s;
}

.sa-user-trigger:hover {
	background: #f3f4f6;
}

.sa-avatar {
	width: 3.2rem;
	height: 3.2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	font-size: 1.4rem;
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
	font-size: 1.2rem;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sa-user-arrow.open {
	transform: rotate(180deg);
}

.sa-user-dropdown {
	position: absolute;
	bottom: calc(100% + 0.8rem);
	left: 0.8rem;
	right: 0.8rem;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 1rem;
	box-shadow: 0 -0.4rem 1.6rem rgba(0, 0, 0, 0.08);
	z-index: 300;
	padding: 0.6rem;
}

.sa-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.9rem 1.2rem;
	font-size: 1.3rem;
	color: #4b5563;
	border-radius: 0.6rem;
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
	font-size: 1.4rem;
	width: 1.8rem;
	text-align: center;
}

.sa-user-name {
	font-weight: 500;
	font-size: 1.3rem;
}

.sa-user-role {
	font-size: 1.1rem;
	color: #9ca3af;
}
</style>
