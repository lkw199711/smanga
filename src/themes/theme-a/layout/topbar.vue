<template>
	<header class="sa-topbar">
		<div class="sa-search">
			<span class="sa-search-icon">🔍</span>
			<input ref="searchInputRef" v-model="keyword" placeholder="搜索漫画、章节、标签…" @keydown.enter="doSearch" />
			<span class="sa-search-kbd">Ctrl K</span>
		</div>
		<div class="sa-top-actions">
			<button class="sa-btn-ghost" @click="toggleView">{{ config.viewType === 'block' ? '📋 网格' : '📊 列表' }}</button>
			<button class="sa-btn-ghost">排序 ↓</button>
			<button class="sa-btn-ghost" @click="toggleThemeSwitch">主题 {{ themeState.current }}</button>
			<button class="sa-btn-ghost" @click="toggleLanguage">{{ currentLanguage }}</button>
			<button class="sa-btn-primary" @click="router.push({ path: '/t/media', query: { add: '1' } })">+ 新建媒体库</button>
		</div>

		<!-- Theme switcher dropdown -->
		<div v-if="showThemeSwitch" class="sa-theme-dropdown">
			<div class="sa-theme-option" :class="{ active: themeState.current === 'A' }" @click="applyTheme('A')">A - 现代简约</div>
			<div class="sa-theme-option" :class="{ active: themeState.current === 'B' }" @click="applyTheme('B')">B - 漫画风</div>
			<div class="sa-theme-option" :class="{ active: themeState.current === 'D' }" @click="applyTheme('D')">D - 多主题</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { themeState, setTheme } from '@/themes/store'
import { config, userConfig } from '@/store'

const router = useRouter()
const { locale } = useI18n()
const keyword = ref('')
const showThemeSwitch = ref(false)
const searchInputRef = ref<HTMLInputElement>()

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

function toggleView() {
	config.viewType = config.viewType === 'block' ? 'list' : 'block'
}

function toggleThemeSwitch() {
	showThemeSwitch.value = !showThemeSwitch.value
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
	if (target.closest('.sa-theme-dropdown')) return
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

function applyTheme(key: 'A' | 'B' | 'D') {
	setTheme(key)
	showThemeSwitch.value = false
}
</script>

<style scoped>
.sa-topbar {
	position: relative;
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

.sa-theme-dropdown {
	position: absolute;
	top: 100%;
	right: 28px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 10px;
	padding: 6px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	z-index: 100;
}

.sa-theme-option {
	padding: 8px 14px;
	font-size: 13px;
	border-radius: 6px;
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
</style>
