<template>
	<div class="reader-d" :style="themeVars">
		<!-- 顶栏 -->
		<header class="rd-topbar">
			<button class="rd-btn" @click="emit('back')">← 返回</button>
			<div class="rd-title">
				<div class="rd-manga-name">{{ readerMock.mangaName }}</div>
				<div class="rd-chapter-name">{{ readerMock.chapterName }}</div>
			</div>
			<div class="rd-top-actions">
				<button class="rd-btn" @click="showChapters = !showChapters">目录</button>
				<!-- 主题切换 -->
				<div class="rd-theme-dots">
					<button v-for="t in themeList" :key="t.key"
						:class="['rd-dot', { active: currentTheme === t.key }]"
						:style="{ background: t.primary }" @click="currentTheme = t.key"></button>
				</div>
			</div>
		</header>

		<div class="rd-body">
			<!-- 章节目录侧边栏 -->
			<aside v-if="showChapters" class="rd-chapters">
				<div class="rd-chapters-title">章节目录</div>
				<div v-for="ch in readerMock.chapters" :key="ch.id"
					:class="['rd-chapter-item', { active: ch.current, read: ch.read }]"
					@click="emit('navigate', { page: 'reader', params: { chapterId: ch.id }, replace: true })">
					<span>{{ ch.name }}</span>
					<span v-if="ch.current" class="rd-current-dot"></span>
					<span v-if="ch.read" class="rd-check">✓</span>
				</div>
			</aside>

			<!-- 图片区域 -->
			<main class="rd-main">
				<div class="rd-page-container">
					<div class="rd-page"
						:style="{ background: `linear-gradient(135deg, ${currentPageData.gradient[0]}, ${currentPageData.gradient[1]})` }">
						<div class="rd-page-number">{{ page }} / {{ readerMock.totalPages }}</div>
					</div>
				</div>
			</main>
		</div>

		<!-- 底栏 -->
		<footer class="rd-footer">
			<button class="rd-btn-nav" @click="page = Math.max(1, page - 1)">上一页</button>
			<div class="rd-progress">
				<div class="rd-progress-bar" :style="{ width: (page / readerMock.totalPages * 100) + '%' }"></div>
			</div>
			<span class="rd-page-info">{{ page }} / {{ readerMock.totalPages }}</span>
			<button class="rd-btn-nav" @click="page = Math.min(readerMock.totalPages, page + 1)">下一页</button>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { readerMock } from '../mock';

const themeList = [
	{ key: 'blue', name: '蓝', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', name: '粉', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', name: '绿', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', name: '紫', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'dark', name: '暗', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
];

const currentTheme = ref('blue');
const theme = computed(() => themeList.find((t) => t.key === currentTheme.value)!);
const isDark = computed(() => currentTheme.value === 'dark');

const themeVars = computed(() => {
	const t = theme.value;
	return {
		'--rd-primary': t.primary,
		'--rd-back': t.back,
		'--rd-card': isDark.value ? '#161A20' : '#FFFFFF',
		'--rd-border': isDark.value ? '#2A313C' : '#E5E7EB',
		'--rd-text': isDark.value ? '#E6E8EB' : '#0F172A',
		'--rd-text-muted': isDark.value ? '#9AA3AE' : '#64748B',
		'--rd-hover': t.hover,
	} as any;
});

const page = ref(readerMock.currentPage);
const showChapters = ref(false);
const currentPageData = computed(() => readerMock.pages[(page.value - 1) % readerMock.pages.length]);

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any>; replace?: boolean }];
	back: [];
}>();
</script>

<style scoped>
.reader-d {
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 65px);
	background: var(--rd-back);
	color: var(--rd-text);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.rd-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 24px;
	background: var(--rd-card);
	border-bottom: 1px solid var(--rd-border);
}

.rd-btn {
	padding: 6px 12px;
	font-size: 13px;
	color: var(--rd-text-muted);
	background: transparent;
	border: 1px solid var(--rd-border);
	border-radius: 8px;
	cursor: pointer;
}

.rd-btn:hover {
	background: var(--rd-hover);
	color: var(--rd-text);
}

.rd-title {
	flex: 1;
	text-align: center;
}

.rd-manga-name {
	font-size: 14px;
	font-weight: 600;
}

.rd-chapter-name {
	font-size: 12px;
	color: var(--rd-text-muted);
	margin-top: 2px;
}

.rd-top-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.rd-theme-dots {
	display: flex;
	gap: 4px;
}

.rd-dot {
	width: 16px;
	height: 16px;
	border: 2px solid var(--rd-card);
	outline: 1px solid var(--rd-border);
	border-radius: 50%;
	cursor: pointer;
}

.rd-dot.active {
	outline: 2px solid var(--rd-primary);
	transform: scale(1.1);
}

.rd-body {
	flex: 1;
	display: flex;
	min-height: 0;
}

.rd-chapters {
	width: 220px;
	background: var(--rd-card);
	border-right: 1px solid var(--rd-border);
	padding: 16px 12px;
	overflow-y: auto;
}

.rd-chapters-title {
	font-size: 12px;
	font-weight: 600;
	color: var(--rd-text-muted);
	padding: 0 8px 12px;
}

.rd-chapter-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 9px 10px;
	font-size: 13px;
	color: var(--rd-text-muted);
	border-radius: 10px;
	cursor: pointer;
}

.rd-chapter-item:hover {
	background: var(--rd-hover);
	color: var(--rd-text);
}

.rd-chapter-item.active {
	background: color-mix(in srgb, var(--rd-primary) 12%, transparent);
	color: var(--rd-primary);
	font-weight: 600;
}

.rd-chapter-item.read {
	color: var(--rd-text-muted);
	opacity: 0.7;
}

.rd-current-dot {
	margin-left: auto;
	width: 6px;
	height: 6px;
	background: var(--rd-primary);
	border-radius: 50%;
}

.rd-check {
	margin-left: auto;
	font-size: 11px;
	color: #10b981;
}

.rd-main {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}

.rd-page-container {
	width: 100%;
	max-width: 580px;
}

.rd-page {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 12px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

.rd-page-number {
	padding: 6px 14px;
	background: var(--rd-card);
	border: 1px solid var(--rd-border);
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
}

.rd-footer {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 24px;
	background: var(--rd-card);
	border-top: 1px solid var(--rd-border);
}

.rd-btn-nav {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: var(--rd-primary);
	border: none;
	border-radius: 8px;
	cursor: pointer;
}

.rd-btn-nav:hover {
	filter: brightness(1.1);
}

.rd-progress {
	flex: 1;
	height: 4px;
	background: var(--rd-hover);
	border-radius: 2px;
	overflow: hidden;
}

.rd-progress-bar {
	height: 100%;
	background: var(--rd-primary);
	border-radius: 2px;
	transition: width 0.2s;
}

.rd-page-info {
	font-size: 12px;
	color: var(--rd-text-muted);
	min-width: 60px;
	text-align: center;
}
</style>
