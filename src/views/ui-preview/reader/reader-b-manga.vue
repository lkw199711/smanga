<template>
	<div class="reader-b">
		<!-- 顶栏 -->
		<header class="rb-topbar">
			<button class="rb-btn-back" @click="emit('back')">← 返回</button>
			<div class="rb-title">
				<div class="rb-manga-name">{{ readerMock.mangaName }}</div>
				<div class="rb-chapter-name">{{ readerMock.chapterName }}</div>
			</div>
			<button class="rb-pill" @click="showChapters = !showChapters">📑 目录</button>
		</header>

		<div class="rb-body">
			<!-- 章节目录侧边栏 -->
			<aside v-if="showChapters" class="rb-chapters">
				<div class="rb-chapters-title">✨ 章节目录</div>
				<div v-for="ch in readerMock.chapters" :key="ch.id"
					:class="['rb-chapter-item', { active: ch.current, read: ch.read }]"
					@click="emit('navigate', { page: 'reader', params: { chapterId: ch.id }, replace: true })">
					<span>{{ ch.name }}</span>
					<span v-if="ch.current" class="rb-current-badge">阅读中</span>
					<span v-else-if="ch.read" class="rb-read-badge">已读</span>
				</div>
			</aside>

			<!-- 图片区域 -->
			<main class="rb-main">
				<div class="rb-page-container">
					<div class="rb-page"
						:style="{ background: `linear-gradient(135deg, ${currentPageData.gradient[0]}, ${currentPageData.gradient[1]})` }">
						<div class="rb-page-overlay">
							<div class="rb-page-number">{{ page }} / {{ readerMock.totalPages }}</div>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- 底栏 -->
		<footer class="rb-footer">
			<button class="rb-btn-chapter" @click="page = Math.max(1, page - 1)">⏮ 上一页</button>
			<div class="rb-progress-wrap">
				<div class="rb-progress">
					<div class="rb-progress-bar" :style="{ width: (page / readerMock.totalPages * 100) + '%' }"></div>
				</div>
				<span class="rb-progress-text">{{ Math.round(page / readerMock.totalPages * 100) }}%</span>
			</div>
			<button class="rb-btn-chapter" @click="page = Math.min(readerMock.totalPages, page + 1)">下一页 ⏭</button>
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
.reader-b {
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.rb-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 20px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 0 0 20px 20px;
}

.rb-btn-back {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	color: #ff6fa3;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	cursor: pointer;
}

.rb-title {
	flex: 1;
	text-align: center;
}

.rb-manga-name {
	font-size: 15px;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.rb-chapter-name {
	font-size: 12px;
	color: #6b7280;
	margin-top: 2px;
}

.rb-pill {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	cursor: pointer;
	color: #4b5563;
}

.rb-body {
	flex: 1;
	display: flex;
	min-height: 0;
}

.rb-chapters {
	width: 240px;
	margin: 16px;
	padding: 16px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	overflow-y: auto;
	box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
}

.rb-chapters-title {
	font-size: 14px;
	font-weight: 700;
	color: #1f2937;
	padding-bottom: 12px;
	border-bottom: 1px dashed rgba(108, 141, 255, 0.2);
	margin-bottom: 8px;
}

.rb-chapter-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.rb-chapter-item:hover {
	background: rgba(255, 111, 163, 0.1);
	transform: translateX(2px);
}

.rb-chapter-item.active {
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18));
	color: #1f2937;
	font-weight: 600;
}

.rb-chapter-item.read {
	color: #9ca3af;
}

.rb-current-badge {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-radius: 999px;
}

.rb-read-badge {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 10px;
	color: #9ca3af;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 999px;
}

.rb-main {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}

.rb-page-container {
	width: 100%;
	max-width: 560px;
}

.rb-page {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 20px;
	box-shadow: 0 12px 40px rgba(108, 141, 255, 0.2);
	overflow: hidden;
}

.rb-page-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(180deg, transparent 70%, rgba(0, 0, 0, 0.3));
}

.rb-page-number {
	padding: 8px 18px;
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(8px);
	border-radius: 999px;
	font-size: 13px;
	font-weight: 600;
	color: #1f2937;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rb-footer {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 24px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px 20px 0 0;
}

.rb-btn-chapter {
	padding: 8px 18px;
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border: none;
	border-radius: 999px;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(255, 111, 163, 0.3);
}

.rb-btn-chapter:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 16px rgba(255, 111, 163, 0.4);
}

.rb-progress-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 10px;
}

.rb-progress {
	flex: 1;
	height: 6px;
	background: rgba(108, 141, 255, 0.15);
	border-radius: 3px;
	overflow: hidden;
}

.rb-progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #ff6fa3, #6c8dff);
	border-radius: 3px;
	transition: width 0.2s;
}

.rb-progress-text {
	font-size: 12px;
	font-weight: 600;
	color: #6c8dff;
	min-width: 36px;
}
</style>
