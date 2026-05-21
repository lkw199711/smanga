<template>
	<div class="reader-a">
		<!-- 顶栏 -->
		<header class="ra-topbar">
			<button class="ra-btn-back" @click="emit('back')">← 返回</button>
			<div class="ra-title">
				<div class="ra-manga-name">{{ readerMock.mangaName }}</div>
				<div class="ra-chapter-name">{{ readerMock.chapterName }}</div>
			</div>
			<button class="ra-btn-ghost" @click="showChapters = !showChapters">目录</button>
		</header>

		<div class="ra-body">
			<!-- 章节目录侧边栏 -->
			<aside v-if="showChapters" class="ra-chapters">
				<div class="ra-chapters-title">章节目录</div>
				<div v-for="ch in readerMock.chapters" :key="ch.id"
					:class="['ra-chapter-item', { active: ch.current, read: ch.read }]"
					@click="emit('navigate', { page: 'reader', params: { chapterId: ch.id }, replace: true })">
					<span>{{ ch.name }}</span>
					<span v-if="ch.read" class="ra-check">✓</span>
					<span v-if="ch.current" class="ra-current-dot"></span>
				</div>
			</aside>

			<!-- 图片区域 -->
			<main class="ra-main">
				<div class="ra-page-container">
					<div class="ra-page"
						:style="{ background: `linear-gradient(135deg, ${currentPageData.gradient[0]}, ${currentPageData.gradient[1]})` }">
						<div class="ra-page-number">{{ page }} / {{ readerMock.totalPages }}</div>
					</div>
				</div>
			</main>
		</div>

		<!-- 底栏 -->
		<footer class="ra-footer">
			<button class="ra-btn-nav" @click="page = Math.max(1, page - 1)">上一页</button>
			<div class="ra-progress">
				<div class="ra-progress-bar" :style="{ width: (page / readerMock.totalPages * 100) + '%' }"></div>
			</div>
			<span class="ra-page-info">{{ page }} / {{ readerMock.totalPages }}</span>
			<button class="ra-btn-nav" @click="page = Math.min(readerMock.totalPages, page + 1)">下一页</button>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { readerMock } from '../mock';

const page = ref(readerMock.currentPage);
const showChapters = ref(false);
const currentPageData = computed(() => readerMock.pages[(page.value - 1) % readerMock.pages.length]);

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any>; replace?: boolean }];
	back: [];
}>();
</script>

<style scoped>
.reader-a {
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.ra-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 24px;
	background: #fff;
	border-bottom: 1px solid #eaeaea;
}

.ra-btn-back {
	padding: 6px 12px;
	font-size: 13px;
	color: #4b5563;
	background: transparent;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	cursor: pointer;
}

.ra-btn-back:hover {
	background: #f3f4f6;
}

.ra-title {
	flex: 1;
	text-align: center;
}

.ra-manga-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
}

.ra-chapter-name {
	font-size: 12px;
	color: #6b7280;
	margin-top: 2px;
}

.ra-btn-ghost {
	padding: 6px 12px;
	font-size: 13px;
	color: #4b5563;
	background: transparent;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	cursor: pointer;
}

.ra-btn-ghost:hover {
	background: #f3f4f6;
}

.ra-body {
	flex: 1;
	display: flex;
	min-height: 0;
}

.ra-chapters {
	width: 220px;
	background: #fff;
	border-right: 1px solid #eaeaea;
	padding: 16px 12px;
	overflow-y: auto;
}

.ra-chapters-title {
	font-size: 12px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 0 8px 12px;
}

.ra-chapter-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 8px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 8px;
	cursor: pointer;
}

.ra-chapter-item:hover {
	background: #f3f4f6;
}

.ra-chapter-item.active {
	background: #eff6ff;
	color: #2563eb;
	font-weight: 500;
}

.ra-chapter-item.read {
	color: #9ca3af;
}

.ra-check {
	margin-left: auto;
	color: #10b981;
	font-size: 12px;
}

.ra-current-dot {
	margin-left: auto;
	width: 6px;
	height: 6px;
	background: #2563eb;
	border-radius: 50%;
}

.ra-main {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}

.ra-page-container {
	width: 100%;
	max-width: 600px;
}

.ra-page {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 12px;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	display: flex;
	align-items: center;
	justify-content: center;
}

.ra-page-number {
	padding: 6px 14px;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	color: #374151;
}

.ra-footer {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 24px;
	background: #fff;
	border-top: 1px solid #eaeaea;
}

.ra-btn-nav {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	color: #4b5563;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	cursor: pointer;
}

.ra-btn-nav:hover {
	background: #f3f4f6;
	border-color: #d1d5db;
}

.ra-progress {
	flex: 1;
	height: 4px;
	background: #f3f4f6;
	border-radius: 2px;
	overflow: hidden;
}

.ra-progress-bar {
	height: 100%;
	background: #2563eb;
	border-radius: 2px;
	transition: width 0.2s;
}

.ra-page-info {
	font-size: 12px;
	color: #6b7280;
	min-width: 60px;
	text-align: center;
}
</style>
