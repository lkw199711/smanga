<template>
	<aside class="sd-sidebar">
		<div class="sd-logo">
			<div class="sd-logo-mark">s</div>
			<div class="sd-logo-text">smanga</div>
		</div>

		<!-- 主题切换 -->
		<div class="sd-theme-switcher">
			<div class="sd-theme-label">主题色</div>
			<div class="sd-theme-options">
				<button v-for="t in themeList" :key="t.key"
					:class="['sd-theme-swatch', { active: currentTheme === t.key }]"
					:style="{ background: t.primary }" :title="t.name" @click="setTheme(t.key)"></button>
			</div>
		</div>

		<nav class="sd-nav">
			<div v-for="(item, i) in menu" :key="item.key" :class="['sd-nav-item', { active: i === 0 }]">
				<span class="sd-nav-icon">{{ item.icon }}</span>
				<span>{{ item.label }}</span>
			</div>
		</nav>

		<div class="sd-sec-title">媒体库</div>
		<nav class="sd-nav">
			<div v-for="m in mediaList" :key="m.id" class="sd-nav-item">
				<span class="sd-nav-icon">{{ m.icon }}</span>
				<span>{{ m.name }}</span>
				<span class="sd-nav-count">{{ m.count }}</span>
			</div>
		</nav>

		<div class="sd-user">
			<div class="sd-avatar">U</div>
			<div>
				<div class="sd-user-name">User</div>
				<div class="sd-user-role">管理员</div>
			</div>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import mediaApi from '@/api/media'

// 主题列表
const themeList = [
	{ key: 'blue', name: '蓝', primary: '#2563EB' },
	{ key: 'pink', name: '粉', primary: '#DB2777' },
	{ key: 'green', name: '绿', primary: '#059669' },
	{ key: 'purple', name: '紫', primary: '#7C3AED' },
	{ key: 'red', name: '红', primary: '#DC2626' },
	{ key: 'cyan', name: '青', primary: '#0891B2' },
	{ key: 'orange', name: '橙', primary: '#EA580C' },
	{ key: 'grey', name: '灰', primary: '#475569' },
	{ key: 'dark', name: '暗', primary: '#F5A524' },
]

const menu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'manage', label: '管理', icon: '⚙️' },
	{ key: 'setting', label: '设置', icon: '🔧' },
]

const mediaList = ref([
	{ id: 1, name: '少年漫画', icon: '📚', count: 128 },
	{ id: 2, name: '少女漫画', icon: '🌸', count: 64 },
	{ id: 3, name: '青年漫画', icon: '📖', count: 96 },
	{ id: 4, name: '同人本', icon: '🎨', count: 32 },
])

const currentTheme = ref('blue')

// 获取主题设置函数
const setColor = inject('td-set-color') as (color: string) => void

function setTheme(key: string) {
	currentTheme.value = key
	setColor(key)
}

// 加载媒体库数据
import { onMounted } from 'vue'
onMounted(async () => {
	try {
		const res = await mediaApi.get()
		if (res?.list) {
			mediaList.value = res.list.map((item: any) => ({
				id: item.mediaId,
				name: item.mediaName || item.mediaId,
				icon: '📚',
				count: item.mangaCount || 0
			}))
		}
	} catch (e) {
		// 使用默认数据
	}
})
</script>

<style scoped>
.sd-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: var(--bg2);
	border-right: 1px solid var(--border);
	display: flex;
	flex-direction: column;
}

.sd-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 18px;
}

.sd-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--accent);
	color: #fff;
	font-weight: 700;
	border-radius: 8px;
}

.sd-logo-text {
	font-size: 16px;
	font-weight: 700;
	color: var(--fg);
}

.sd-theme-switcher {
	padding: 0 8px 16px;
}

.sd-theme-label {
	font-size: 12px;
	font-weight: 600;
	color: var(--fg2);
	margin-bottom: 8px;
}

.sd-theme-options {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.sd-theme-swatch {
	width: 24px;
	height: 24px;
	border-radius: 6px;
	border: 2px solid transparent;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-theme-swatch:hover {
	transform: scale(1.1);
}

.sd-theme-swatch.active {
	border-color: var(--accent);
	box-shadow: 0 0 0 2px var(--accent-soft);
}

.sd-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sd-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	color: var(--fg2);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 14px;
}

.sd-nav-item:hover {
	background: var(--accent-soft);
	color: var(--fg);
}

.sd-nav-item.active {
	background: var(--accent-soft);
	color: var(--accent);
	font-weight: 500;
}

.sd-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.sd-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: var(--fg2);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.sd-nav-count {
	margin-left: auto;
	padding: 1px 7px;
	font-size: 11px;
	color: var(--fg2);
	background: var(--accent-soft);
	border-radius: 10px;
}

.sd-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid var(--border);
}

.sd-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--accent);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
}

.sd-user-name {
	font-weight: 500;
	font-size: 13px;
	color: var(--fg);
}

.sd-user-role {
	font-size: 11px;
	color: var(--fg2);
}
</style>