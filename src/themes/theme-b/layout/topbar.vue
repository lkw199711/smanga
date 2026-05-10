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
			<input v-model="keyword" placeholder="搜索你喜欢的漫画…" @keydown.enter="doSearch" />
		</div>
		<div class="sb-top-actions">
			<button class="sb-pill" @click="toggleTheme">{{ isDark ? '☀️' : '🌙' }}</button>
			<button class="sb-pill" @click="toggleLanguage">{{ currentLanguage }}</button>
			<div class="sb-avatar">U</div>
		</div>
	</header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const isDark = ref(false)
const currentLanguage = ref('中文')
const languages = ['中文', 'English', '日本語']

function doSearch() {
	if (keyword.value.trim()) {
		router.push({ path: '/search', query: { keyword: keyword.value } })
	}
}

function toggleTheme() {
	isDark.value = !isDark.value
	// 可以在这里添加主题切换逻辑
}

function toggleLanguage() {
	const currentIndex = languages.indexOf(currentLanguage.value)
	const nextIndex = (currentIndex + 1) % languages.length
	currentLanguage.value = languages[nextIndex]
	// 可以在这里添加语言切换逻辑
}
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
</style>