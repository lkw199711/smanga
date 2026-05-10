<template>
	<aside class="sb-sidebar">
		<div class="sb-logo">
			<span class="sb-logo-emoji">🌸</span>
			<span class="sb-logo-text">smanga</span>
		</div>

		<nav class="sb-nav">
			<div v-for="(item, i) in menu" :key="item.key" :class="['sb-nav-item', { active: i === 0 }]">
				<span class="sb-nav-icon">{{ item.icon }}</span>
				<span>{{ item.label }}</span>
			</div>
		</nav>

		<div class="sb-sec">
			<div class="sb-sec-title">✨ 我的书架</div>
			<div v-for="m in mediaList" :key="m.id" class="sb-sec-item">
				<span>{{ m.icon }} {{ m.name }}</span>
				<span class="sb-sec-count">{{ m.count }}</span>
			</div>
		</div>

		<div class="sb-card-hint">
			<div class="sb-card-hint-title">今日推荐 🎁</div>
			<div class="sb-card-hint-desc">打开盲盒，发现新漫画</div>
			<button class="sb-card-hint-btn">去看看</button>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import mediaApi from '@/api/media'

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
.sb-sidebar {
	flex-shrink: 0;
	width: 240px;
	margin: 16px 0 16px 16px;
	padding: 20px 14px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 16px;
}

.sb-logo-emoji {
	font-size: 24px;
}

.sb-logo-text {
	font-size: 18px;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.sb-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: #4b5563;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.sb-nav-item:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateX(2px);
}

.sb-nav-item.active {
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18));
	color: #1f2937;
}

.sb-nav-icon {
	font-size: 15px;
}

.sb-sec {
	margin-top: 16px;
}

.sb-sec-title {
	padding: 8px 12px 6px;
	font-size: 12px;
	font-weight: 600;
	color: #9ca3af;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 8px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 10px;
	cursor: pointer;
}

.sb-sec-item:hover {
	background: rgba(255, 255, 255, 0.8);
}

.sb-sec-count {
	font-size: 11px;
	color: #9ca3af;
}

.sb-card-hint {
	margin-top: auto;
	padding: 14px;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-radius: 16px;
	color: #fff;
	text-align: center;
}

.sb-card-hint-title {
	font-size: 14px;
	font-weight: 700;
	margin-bottom: 4px;
}

.sb-card-hint-desc {
	font-size: 11px;
	opacity: 0.9;
	margin-bottom: 10px;
}

.sb-card-hint-btn {
	padding: 6px 16px;
	background: #fff;
	color: #ff6fa3;
	font-size: 12px;
	font-weight: 600;
	border: none;
	border-radius: 999px;
	cursor: pointer;
}
</style>