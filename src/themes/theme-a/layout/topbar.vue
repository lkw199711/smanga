<template>
	<header class="sa-topbar">
		<div class="sa-search">
			<span class="sa-search-icon">🔍</span>
			<input ref="searchInputRef" v-model="keyword" placeholder="搜索漫画、章节、标签…" @keydown.enter="doSearch" />
			<span class="sa-search-kbd">Ctrl K</span>
		</div>
		<div class="sa-top-actions">
			<div class="sa-sort-wrap" ref="sortWrapRef">
				<button class="sa-btn-ghost sa-sort-btn" @click="toggleSortDropdown">
					<span>{{ currentSortLabel }} ▾</span>
				</button>
				<div v-if="showSortDropdown" class="sa-sort-dropdown">
					<div
						v-for="item in currentSortOptions"
						:key="item.value"
						:class="['sa-sort-item', { active: item.value === currentSortValue }]"
						@click="selectSort(item.value)"
					>
						{{ item.label }}
					</div>
				</div>
			</div>
			<div class="sa-theme-wrap">
				<button class="sa-btn-ghost" :title="`当前皮肤:${currentSkinLabel} · 配色:${colorThemeLabel}`" @click.stop="toggleThemeSwitch">🎨 {{ currentSkinLabel }}</button>
				<!-- 主题切换下拉 -->
				<div v-if="showThemeSwitch" class="sa-theme-dropdown">
					<div class="sa-theme-section-title">界面风格</div>
					<div
						v-for="skin in skinList"
						:key="skin.key"
						:class="['sa-theme-option', { active: themeState.current === skin.key }]"
						@click="applySkin(skin.key)"
					>
						{{ skin.name }}
					</div>
					<div class="sa-theme-divider"></div>
					<div class="sa-theme-section-title">配色方案</div>
					<div
						v-for="ct in colorThemeList"
						:key="ct.value"
						:class="['sa-theme-option', { active: activeColorTheme === ct.value }]"
						@click="applyColorTheme(ct.value)"
					>
						<span class="sa-theme-swatch" :style="{ background: ct.color }"></span>
						<span>{{ ct.label }}</span>
					</div>
				</div>
			</div>
			<button class="sa-btn-ghost" :title="isDarkMode ? '切换到亮色' : '切换到暗色'" @click="toggleDarkMode">
				{{ isDarkMode ? '☀️ 亮色' : '🌙 暗色' }}
			</button>
			<button class="sa-btn-ghost" @click="toggleLanguage">{{ currentLanguage }}</button>
			<button v-if="isAdmin" class="sa-btn-primary" @click="router.push({ path: '/t/media', query: { add: '1' } })">+ 新建媒体库</button>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ThemeKey } from '@/themes/store'
import { themeState, setTheme } from '@/themes/store'
import { userConfig, mangaSortOrder, chapterSortOrder } from '@/store'
import languages from '@/store/language'
import themeList from '@/store/theme'
import { set_theme } from '@/style/theme'
import { useSessionStore } from '@/store/session'
import { preferencesStore } from '@/store/preferences'
import { useColorTheme } from '@/themes/composables/use-color-theme'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const keyword = ref('')
const showThemeSwitch = ref(false)
const searchInputRef = ref<HTMLInputElement>()

// 仅服务器管理员可见"新建媒体库"按钮
const session = useSessionStore()
const isAdmin = computed(() => session.isAdmin)

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
// 颜色主题状态与切换方法：改由 composable 提供跨组件共享
const { activeColorTheme, isDarkMode, toggleDarkMode, applyColorTheme: applyColorThemeImpl } = useColorTheme()

const colorThemeColors: Record<string, string> = {
	light: '#f5f5f5',
	dark: '#2d2d2d',
	grey: '#6b7280',
	blue: '#3b82f6',
	cyan: '#06b6d4',
	green: '#22c55e',
	purple: '#8b5cf6',
	red: '#ef4444',
	pink: '#ec4899',
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

// 主题按钮
function toggleThemeSwitch() {
	showThemeSwitch.value = !showThemeSwitch.value
}

function applySkin(key: ThemeKey) {
	if (key === 'Legacy') {
		// 切到旧版：保存 cookie 并跳转到对应旧版路由
		setTheme('Legacy')
		showThemeSwitch.value = false
		router.push(mapToLegacyRoute())
		return
	}
	// 从旧版切回新版：如果当前在旧路由，跳转到 /t
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
	preferencesStore.setLanguage(userConfig.language)
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
	if (target.closest('.sa-theme-dropdown')) return
	if (target.closest('.sa-sort-dropdown')) return
	showThemeSwitch.value = false
}

// ---- 排序 ----
const sortOrderLabels: Record<string, string> = {
	id: 'ID',
	idDesc: 'ID 倒序',
	number: '章节号',
	numberDesc: '章节号 倒序',
	name: '名称 A-Z',
	nameDesc: '名称 Z-A',
	createTime: '入库时间',
	createTimeDesc: '最近添加',
	updateTime: '更新时间',
	updateTimeDesc: '最近更新',
	chapterUpdate: '章节更新时间',
	chapterUpdateDesc: '章节更新时间 倒序',
}

const sortType = computed<'manga' | 'chapter'>(() => {
	switch (route.name) {
		case 't-manga-info':
		case 't-chapter-list':
		case 't-bookmark':
			return 'chapter'
		default:
			return 'manga'
	}
})

const currentSortOptions = computed(() => {
	const list = sortType.value === 'chapter' ? chapterSortOrder : mangaSortOrder
	return list.map((v: string) => ({ value: v, label: sortOrderLabels[v] || v }))
})

const currentSortValue = computed(() =>
	sortType.value === 'chapter' ? userConfig.chapterOrder : userConfig.order
)

const currentSortLabel = computed(() => sortOrderLabels[currentSortValue.value] || currentSortValue.value)

const showSortDropdown = ref(false)
const sortWrapRef = ref<HTMLElement | null>(null)


function toggleSortDropdown() {
	showSortDropdown.value = !showSortDropdown.value
}

function selectSort(value: string) {
	if (sortType.value === 'chapter') {
		userConfig.chapterOrder = value
	} else {
		userConfig.order = value
	}
	showSortDropdown.value = false
}

function onSortClickOutside(e: MouseEvent) {
	if (sortWrapRef.value && !sortWrapRef.value.contains(e.target as Node)) {
		showSortDropdown.value = false
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
	window.addEventListener('click', onGlobalClick)
	document.addEventListener('click', onSortClickOutside)
})

onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown)
	window.removeEventListener('click', onGlobalClick)
	document.removeEventListener('click', onSortClickOutside)
})
</script>

<style scoped>
.sa-topbar {
	position: relative;
	z-index: 100;
	display: flex;
	align-items: center;
	gap: 1.6rem;
	padding: 1.4rem 2.8rem;
	background: #fafafa;
	border-bottom: 1px solid #eaeaea;
}

.sa-search {
	flex: 1;
	max-width: 56rem;
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.8rem 1.2rem;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 1rem;
}

.sa-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 1.3rem;
	color: #171717;
}

.sa-search input::placeholder {
	color: #9ca3af;
}

.sa-search-icon {
	color: #9ca3af;
	font-size: 1.3rem;
}

.sa-search-kbd {
	padding: 0.2rem 0.6rem;
	font-size: 1.1rem;
	color: #6b7280;
	background: #f3f4f6;
	border: 1px solid #eaeaea;
	border-radius: 0.4rem;
}

.sa-top-actions {
	display: flex;
	gap: 0.6rem;
}

.sa-btn-ghost {
	padding: 0.7rem 1.2rem;
	font-size: 1.3rem;
	color: #4b5563;
	background: transparent;
	border: 1px solid transparent;
	border-radius: 0.8rem;
	cursor: pointer;
}

.sa-btn-ghost:hover {
	background: #fff;
	border-color: #eaeaea;
}

.sa-btn-primary {
	padding: 0.7rem 1.4rem;
	font-size: 1.3rem;
	font-weight: 500;
	color: #fff;
	background: #2563eb;
	border: none;
	border-radius: 0.8rem;
	cursor: pointer;
}

.sa-btn-primary:hover {
	background: #1d4ed8;
}

.sa-theme-wrap {
	position: relative;
}

.sa-theme-dropdown {
	position: absolute;
	top: calc(100% + 0.6rem);
	right: 0;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 1rem;
	padding: 0.8rem;
	box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.08);
	z-index: 300;
	min-width: 18rem;
	max-height: 48rem;
	overflow-y: auto;
}

.sa-theme-section-title {
	padding: 0.6rem 1rem 0.4rem;
	font-size: 1.1rem;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.sa-theme-divider {
	margin: 0.6rem 1rem;
	border-top: 1px solid #eaeaea;
}

.sa-theme-option {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	padding: 0.8rem 1.4rem;
	font-size: 1.3rem;
	border-radius: 0.6rem;
	cursor: pointer;
	color: #4b5563;
}

.sa-theme-option:hover {
	background: #f3f4f6;
}

.sa-theme-option.active {
	background: #eff6ff;
	color: #2563eb;
	font-weight: 500;
}

.sa-theme-swatch {
	flex-shrink: 0;
	width: 1.4rem;
	height: 1.4rem;
	border-radius: 50%;
	border: 0.15rem solid rgba(0, 0, 0, 0.1);
}

/* 排序下拉 */
.sa-sort-wrap {
	position: relative;
}

.sa-sort-dropdown {
	position: absolute;
	top: calc(100% + 0.6rem);
	right: 0;
	min-width: 18rem;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 1rem;
	box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.08);
	z-index: 200;
	padding: 0.6rem;
	max-height: 36rem;
	overflow-y: auto;
}

.sa-sort-item {
	padding: 0.8rem 1.4rem;
	font-size: 1.3rem;
	color: #4b5563;
	border-radius: 0.6rem;
	cursor: pointer;
	white-space: nowrap;
	transition: all 0.15s;
}

.sa-sort-item:hover {
	background: #f3f4f6;
}

.sa-sort-item.active {
	background: #eff6ff;
	color: #2563eb;
	font-weight: 600;
}


</style>
