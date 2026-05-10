<template>
	<header class="sd-topbar">
		<div class="sd-search">
			<span>🔍</span>
			<input v-model="keyword" placeholder="搜索漫画、章节、标签…" @keydown.enter="doSearch" />
		</div>
		<div class="sd-top-actions">
			<button class="sd-btn">{{ viewType === 'block' ? '📊 列表' : '📋 网格' }}</button>
			<button class="sd-btn">排序</button>
			<button class="sd-btn" @click="toggleTheme">{{ isDark ? '☀️' : '🌙' }}</button>
			<button class="sd-btn" @click="toggleLanguage">{{ currentLanguage }}</button>
			<button class="sd-btn-primary" @click="addMediaDialog = true">+ 新建</button>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const viewType = ref('block')
const isDark = ref(false)
const currentLanguage = ref('中文')
const languages = ['中文', 'English', '日本語']
const addMediaDialog = ref(false)

// 获取主题切换函数
const setColor = inject('td-set-color') as (color: string) => void

function doSearch() {
	if (keyword.value.trim()) {
		router.push({ path: '/search', query: { q: keyword.value } })
	}
}

function toggleView() {
	viewType.value = viewType.value === 'block' ? 'list' : 'block'
}

function toggleTheme() {
	isDark.value = !isDark.value
	// 切换深色/浅色主题
	setColor(isDark.value ? 'dark' : 'blue')
}

function toggleLanguage() {
	const currentIndex = languages.indexOf(currentLanguage.value)
	const nextIndex = (currentIndex + 1) % languages.length
	currentLanguage.value = languages[nextIndex]
	// 可以在这里添加语言切换逻辑
}
</script>

<style scoped>
.sd-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 20px;
	background: var(--bg2);
	border-bottom: 1px solid var(--border);
}

.sd-search {
	flex: 1;
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: var(--bg);
	border: 1px solid var(--border);
	border-radius: 8px;
}

.sd-search span {
	color: var(--fg2);
}

.sd-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: var(--fg);
}

.sd-search input::placeholder {
	color: var(--fg2);
}

.sd-top-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sd-btn {
	padding: 7px 12px;
	font-size: 13px;
	color: var(--fg2);
	background: transparent;
	border: 1px solid var(--border);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-btn:hover {
	background: var(--accent-soft);
	color: var(--accent);
}

.sd-btn-primary {
	padding: 7px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: var(--accent);
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-btn-primary:hover {
	opacity: 0.9;
}
</style>