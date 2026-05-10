<template>
	<header class="sa-topbar">
		<div class="sa-search">
			<span class="sa-search-icon">🔍</span>
			<input v-model="keyword" placeholder="搜索漫画、章节、标签…" @keydown.enter="doSearch" />
			<span class="sa-search-kbd">Ctrl K</span>
		</div>
		<div class="sa-top-actions">
			<button class="sa-btn-ghost" @click="toggleView">
				{{ viewType === 'block' ? '📊 列表' : '📋 网格' }}
			</button>
			<button class="sa-btn-ghost" @click="showThemeSwitch = !showThemeSwitch">🎨 主题</button>
			<button class="sa-btn-primary" @click="addMediaDialog = true">+ 新建媒体库</button>
		</div>

		<!-- Theme switcher dropdown -->
		<div v-if="showThemeSwitch" class="sa-theme-dropdown">
			<div class="sa-theme-option" :class="{ active: themeState.current === 'A' }" @click="setTheme('A')">A - 现代简约</div>
			<div class="sa-theme-option" :class="{ active: themeState.current === 'B' }" @click="setTheme('B')">B - 漫画风</div>
			<div class="sa-theme-option" :class="{ active: themeState.current === 'D' }" @click="setTheme('D')">D - 多主题</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { themeState, setTheme } from '@/themes/store'

const router = useRouter()
const keyword = ref('')
const showThemeSwitch = ref(false)
const addMediaDialog = ref(false)
const viewType = ref('block')

function doSearch() {
	if (keyword.value.trim()) {
		router.push({ path: '/t/search', query: { q: keyword.value } })
	}
}

function toggleView() {
	viewType.value = viewType.value === 'block' ? 'list' : 'block'
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
