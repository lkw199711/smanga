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
				<button class="sb-pill" @click.stop="toggleThemeSwitch">🎨 {{ colorThemeLabel }}</button>
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
			<button class="sb-pill" @click="toggleLanguage">{{ currentLanguage }}</button>
			<div class="sb-avatar">U</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userConfig } from '@/store'
import type { ThemeKey } from '@/themes/store'
import { themeState, setTheme } from '@/themes/store'
import themeList from '@/store/theme'
import { set_theme } from '@/style/theme'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const keyword = ref('')
const showThemeSwitch = ref(false)
const searchInputRef = ref<HTMLInputElement>()

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

const activeColorTheme = ref(getCookie('theme') || 'light')

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

const currentLanguage = computed(() => {
	if (userConfig.language === 'en') return 'English'
	if (userConfig.language === 'ja') return '日本語'
	return '中文'
})

const languages = ['中文', 'English', '日本語']

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
	activeColorTheme.value = value
	set_theme(value)
	userConfig.theme = value
	showThemeSwitch.value = false
}

function toggleLanguage() {
	const currentIndex = languages.indexOf(currentLanguage.value)
	const nextIndex = (currentIndex + 1) % languages.length
	const next = languages[nextIndex]
	userConfig.language = next === 'English' ? 'en' : next === '日本語' ? 'ja' : 'zhCn'
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
	z-index: 1;
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 20px;
	margin-bottom: 16px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	box-shadow: 0 4px 16px rgba(108, 141, 255, 0.08);
}

.sb-top-nav {
	display: flex;
	gap: 6px;
}

.sb-top-item {
	padding: 7px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #6b7280;
	border-radius: 12px;
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
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
}

.sb-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #1f2937;
}

.sb-search input::placeholder {
	color: #9ca3af;
}

.sb-top-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.sb-pill {
	padding: 7px 12px;
	font-size: 13px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 10px;
	color: #4b5563;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-pill:hover {
	background: #fff;
	color: #ff6fa3;
}

.sb-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	cursor: pointer;
}

.sb-theme-wrap {
	position: relative;
}

.sb-theme-dropdown {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 16px;
	padding: 8px;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
	z-index: 300;
	min-width: 180px;
	max-height: 480px;
	overflow-y: auto;
}

.sb-theme-section-title {
	padding: 6px 10px 4px;
	font-size: 11px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.sb-theme-divider {
	margin: 6px 10px;
	border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-theme-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	font-size: 13px;
	border-radius: 12px;
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
	width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 1.5px solid rgba(0, 0, 0, 0.1);
}
</style>
