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
			<button class="sb-pill" @click="toggleThemeSwitch">主题 {{ themeState.current }}</button>
			<button class="sb-pill" @click="toggleLanguage">{{ currentLanguage }}</button>
			<div class="sb-avatar">U</div>
		</div>

		<div v-if="showThemeSwitch" class="sb-theme-dropdown">
			<div class="sb-theme-option" :class="{ active: themeState.current === 'A' }" @click="applyTheme('A')">A - 现代简约</div>
			<div class="sb-theme-option" :class="{ active: themeState.current === 'B' }" @click="applyTheme('B')">B - 漫画风</div>
			<div class="sb-theme-option" :class="{ active: themeState.current === 'D' }" @click="applyTheme('D')">D - 多主题</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userConfig } from '@/store'
import { themeState, setTheme } from '@/themes/store'

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

function applyTheme(key: 'A' | 'B' | 'D') {
	setTheme(key)
	showThemeSwitch.value = false
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

.sb-theme-dropdown {
	position: absolute;
	top: 100%;
	right: 20px;
	margin-top: 10px;
	background: rgba(255, 255, 255, 0.86);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 16px;
	padding: 6px;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
	z-index: 100;
}

.sb-theme-option {
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
</style>
