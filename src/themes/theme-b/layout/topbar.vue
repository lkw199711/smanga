<template>
	<header class="sb-topbar">
		<div class="sb-top-nav">
			<span class="sb-top-item active">发现</span>
			<span class="sb-top-item">书库</span>
			<span class="sb-top-item">最近</span>
			<span class="sb-top-item">书签</span>
			<span class="sb-top-item">排行榜</span>
		</div>
		<div class="sb-search">
			<span>🔍</span>
			<input ref="searchInputRef" v-model="keyword" placeholder="搜索你喜欢的漫画…" @keydown.enter="doSearch" />
		</div>
		<div class="sb-top-actions">
			<div class="sb-theme-wrap">
				<button class="sb-pill" :title="`当前皮肤:${currentSkinLabel} · 配色:${colorThemeLabel}`" @click.stop="toggleThemeSwitch">🎨 {{ currentSkinLabel }}</button>
				<!-- 主题切换下拉 -->
				<div v-if="showThemeSwitch" class="sb-theme-dropdown">
					<div class="sb-theme-section-title">界面风格</div>
					<div
						v-for="skin in skinList"
						:key="skin.key"
						:class="['sb-theme-option', { active: themeState.current === skin.key }]"
						@click="applySkin(skin.key)"
					>
						{{ skin.name }}
					</div>
					<div class="sb-theme-divider"></div>
					<div class="sb-theme-section-title">配色方案</div>
					<div
						v-for="ct in colorThemeList"
						:key="ct.value"
						:class="['sb-theme-option', { active: activeColorTheme === ct.value }]"
						@click="applyColorTheme(ct.value)"
					>
						<span class="sb-theme-swatch" :style="{ background: ct.color }"></span>
						<span>{{ ct.label }}</span>
					</div>
				</div>
			</div>
			<button class="sb-pill" :title="isDarkMode ? '切换到亮色' : '切换到暗色'" @click="toggleDarkMode">
				{{ isDarkMode ? '☀️ 亮色' : '🌙 暗色' }}
			</button>
			<button class="sb-pill" @click="toggleLanguage">{{ currentLanguage }}</button>
			<div class="sb-user-wrap" ref="userWrapRef">
				<div class="sb-user-trigger" @click="toggleUserDropdown">
					<div class="sb-avatar">
						<img v-if="avatarBlobUrl" :src="avatarBlobUrl" class="sb-avatar-img" />
						<span v-else>{{ userInfo.userName?.charAt(0) || 'U' }}</span>
					</div>
					<div class="sb-user-info">
						<span class="sb-user-name">{{ userInfo.userName || 'User' }}</span>
						<span class="sb-user-role">{{ Cookies.getRole() === 'admin' ? '管理员' : '用户' }}</span>
					</div>
					<span class="sb-user-arrow" :class="{ open: showUserDropdown }">▾</span>
				</div>
				<div v-if="showUserDropdown" class="sb-user-dropdown">
					<div class="sb-user-dropdown-item" @click="goSettings">⚙️ 设置</div>
					<div class="sb-user-dropdown-item sb-user-dropdown-logout" @click="userLogout">🚪 登出</div>
				</div>
			</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userConfig, userInfo } from '@/store'
import imageApi from '@/api/image'
import { Cookies } from '@/utils'
import type { ThemeKey } from '@/themes/store'
import { themeState, setTheme } from '@/themes/store'
import languages from '@/store/language'
import themeList from '@/store/theme'
import { set_theme } from '@/style/theme'
import { useColorTheme } from '@/themes/composables/use-color-theme'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const keyword = ref('')
const showThemeSwitch = ref(false)
const searchInputRef = ref<HTMLInputElement>()

// ---- 用户信息 ----
const showUserDropdown = ref(false)
const avatarBlobUrl = ref('')
const userWrapRef = ref<HTMLElement | null>(null)

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

async function loadAvatar() {
	if (!userInfo.avatarPath) {
		avatarBlobUrl.value = ''
		return
	}
	avatarBlobUrl.value = await imageApi.get({ file: userInfo.avatarPath }) || ''
}

watch(() => userInfo.avatarPath, loadAvatar, { immediate: true })

// ---- 皮肤列表 ----
const skinList: { key: ThemeKey; name: string }[] = [
	{ key: 'A', name: 'A - 现代简约' },
	{ key: 'B', name: 'B - 漫画风' },
	{ key: 'D', name: 'D - 多主题' },
	{ key: 'Legacy', name: '经典 (旧版)' },
]

// ---- 旧版路由映射 ----
function mapToLegacyRoute(): string {
	const rn = route.name as string
	if (rn === 't-manga-list') return `/manga-list?media=${route.params.mediaId || ''}`
	if (rn === 't-manga-info') return `/manga-info?mangaId=${route.params.mangaId || ''}`
	if (rn === 't-chapter-list') return `/chapter-list?mangaId=${route.params.mangaId || ''}`
	const routeMap: Record<string, string> = {
		't-home': '/', 't-media-list': '/media-list', 't-history': '/history',
		't-bookmark': '/bookmark', 't-collect': '/collect', 't-search': '/search',
		't-tag-list': '/tag-list', 't-user-setting': '/user-setting',
		't-serve-setting': '/serve-setting', 't-manage': '/manage',
	}
	return routeMap[rn] || '/'
}

// ---- 颜色主题 ----
function getCookie(name: string): string | undefined {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop()?.split(';').shift()
	return undefined
}

// 颜色主题状态与切换方法：改由 composable 提供跨组件共享
const { activeColorTheme, isDarkMode, toggleDarkMode, applyColorTheme: applyColorThemeImpl } = useColorTheme()

const colorThemeColors: Record<string, string> = {
	light: '#f5f5f5', dark: '#2d2d2d', grey: '#6b7280',
	blue: '#3b82f6', cyan: '#06b6d4', green: '#22c55e',
	purple: '#8b5cf6', red: '#ef4444', pink: '#ec4899',
}

const colorThemeList = computed(() =>
	themeList.map((t) => ({
		value: t.value,
		label: t.label,
		color: colorThemeColors[t.value] || '#888',
	}))
)

const colorThemeLabel = computed(() => {
	const found = themeList.find((t) => t.value === activeColorTheme.value)
	return found?.label || activeColorTheme.value
})

const currentSkinLabel = computed(() => {
	const found = skinList.find((s) => s.key === themeState.current)
	return found?.name || String(themeState.current)
})

const currentLanguage = computed(() => {
	return languages.find((language) => language.value === userConfig.language)?.label || languages[0].label
})

function doSearch() {
	if (keyword.value.trim()) {
		router.push({ path: '/t/search', query: { q: keyword.value.trim() } })
	}
}

function toggleThemeSwitch() {
	showThemeSwitch.value = !showThemeSwitch.value
}

function applySkin(key: ThemeKey) {
	if (key === 'Legacy') {
		setTheme('Legacy')
		showThemeSwitch.value = false
		router.push(mapToLegacyRoute())
		return
	}
	if (themeState.current === 'Legacy') {
		setTheme(key)
		showThemeSwitch.value = false
		window.location.href = '/t'
		return
	}
	setTheme(key)
	showThemeSwitch.value = false
}

function applyColorTheme(value: string) {
	applyColorThemeImpl(value)
	showThemeSwitch.value = false
}

// ---- 夜间模式切换 ----
// toggleDarkMode / isDarkMode 由 useColorTheme() 提供，无需在此重复实现

function toggleLanguage() {
	const currentIndex = languages.findIndex((language) => language.value === userConfig.language)
	const next = languages[(currentIndex + 1) % languages.length]
	userConfig.language = next.value
	locale.value = userConfig.language
	localStorage.setItem('language', userConfig.language)
}

function onKeydown(e: KeyboardEvent) {
	if (e.key.toLowerCase() !== 'k') return
	if (!(e.ctrlKey || e.metaKey)) return
	e.preventDefault()
	searchInputRef.value?.focus()
}

function onGlobalClick(e: MouseEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	if (target.closest('.sb-theme-dropdown')) return
	showThemeSwitch.value = false
	if (target.closest('.sb-user-wrap')) return
	showUserDropdown.value = false
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
	window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown)
	window.removeEventListener('click', onGlobalClick)
})
</script>

<style scoped>
.sb-topbar {
	position: relative;
	z-index: 100;
	display: flex;
	align-items: center;
	gap: 1.6rem;
	padding: 1.2rem 2rem;
	margin-bottom: 1.6rem;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(1.6rem);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 2rem;
	box-shadow: 0 0.4rem 1.6rem rgba(108, 141, 255, 0.08);
}

.sb-top-nav {
	display: flex;
	gap: 0.6rem;
}

.sb-top-item {
	padding: 0.7rem 1.4rem;
	font-size: 1.3rem;
	font-weight: 500;
	color: #6b7280;
	border-radius: 1.2rem;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-top-item:hover {
	color: #1f2937;
	background: rgba(255, 255, 255, 0.6);
}

.sb-top-item.active {
	color: #ff6fa3;
	background: rgba(255, 111, 163, 0.12);
	font-weight: 600;
}

.sb-search {
	flex: 1;
	max-width: 40rem;
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.8rem 1.6rem;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 99.9rem;
}

.sb-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 1.3rem;
	color: #1f2937;
}

.sb-search input::placeholder {
	color: #9ca3af;
}

.sb-top-actions {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.sb-pill {
	padding: 0.7rem 1.2rem;
	font-size: 1.3rem;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 1rem;
	color: #4b5563;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-pill:hover {
	background: #fff;
	color: #ff6fa3;
}

.sb-avatar {
	width: 3.2rem;
	height: 3.2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	flex-shrink: 0;
	overflow: hidden;
	font-size: 1.4rem;
}

.sb-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.sb-user-wrap {
	position: relative;
}

.sb-user-trigger {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.4rem 0.6rem;
	border-radius: 1rem;
	cursor: pointer;
	transition: background 0.2s;
}

.sb-user-trigger:hover {
	background: rgba(255, 255, 255, 0.6);
}

.sb-user-info {
	display: flex;
	flex-direction: column;
	gap: 1px;
	min-width: 0;
}

.sb-user-name {
	font-size: 1.2rem;
	font-weight: 600;
	color: #1f2937;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 8rem;
}

.sb-user-role {
	font-size: 1rem;
	color: #9ca3af;
	line-height: 1.2;
}

.sb-user-arrow {
	font-size: 1.1rem;
	color: #9ca3af;
	transition: transform 0.2s;
}

.sb-user-arrow.open {
	transform: rotate(180deg);
}

.sb-user-dropdown {
	position: absolute;
	top: calc(100% + 0.8rem);
	right: 0;
	min-width: 14rem;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(1.6rem);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 1.2rem;
	padding: 0.6rem;
	box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.1);
	z-index: 300;
}

.sb-user-dropdown-item {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.9rem 1.2rem;
	font-size: 1.3rem;
	color: #4b5563;
	border-radius: 0.8rem;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-user-dropdown-item:hover {
	background: rgba(255, 111, 163, 0.1);
	color: #ff6fa3;
}

.sb-user-dropdown-logout {
	color: #ef4444;
}

.sb-user-dropdown-logout:hover {
	background: #fef2f2;
	color: #dc2626;
}

.sb-theme-wrap {
	position: relative;
}

.sb-theme-dropdown {
	position: absolute;
	top: calc(100% + 0.8rem);
	right: 0;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(1.6rem);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 1.6rem;
	padding: 0.8rem;
	box-shadow: 0 1.2rem 3.6rem rgba(0, 0, 0, 0.12);
	z-index: 300;
	min-width: 18rem;
	max-height: 48rem;
	overflow-y: auto;
}

.sb-theme-section-title {
	padding: 0.6rem 1rem 0.4rem;
	font-size: 1.1rem;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.sb-theme-divider {
	margin: 0.6rem 1rem;
	border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-theme-option {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 1rem 1.4rem;
	font-size: 1.3rem;
	border-radius: 1.2rem;
	cursor: pointer;
	color: #4b5563;
	transition: all 0.2s;
}

.sb-theme-option:hover {
	background: rgba(255, 255, 255, 0.7);
	color: #ff6fa3;
}

.sb-theme-option.active {
	background: rgba(255, 111, 163, 0.12);
	color: #ff6fa3;
	font-weight: 600;
}

.sb-theme-swatch {
	flex-shrink: 0;
	width: 1.4rem;
	height: 1.4rem;
	border-radius: 50%;
	border: 0.15rem solid rgba(0, 0, 0, 0.1);
}
</style>
