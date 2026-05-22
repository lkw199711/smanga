<template>
	<div class="reader-c">
		<!-- 顶栏 -->
		<header class="rc-topbar">
			<button class="rc-btn" @click="emit('back')">← Back</button>
			<div class="rc-breadcrumb">
				<span class="rc-crumb-muted">{{ readerMock.mangaName }}</span>
				<span class="rc-crumb-sep">/</span>
				<span>{{ readerMock.chapterName }}</span>
			</div>
			<div class="rc-top-actions">
				<button class="rc-btn" @click="showChapters = !showChapters">☰</button>
				<button class="rc-btn">⚙</button>
			</div>
		</header>

		<div class="rc-body">
			<!-- 章节目录侧边栏 -->
			<aside v-if="showChapters" class="rc-chapters">
				<div class="rc-chapters-title">CHAPTERS</div>
				<div v-for="ch in readerMock.chapters" :key="ch.id"
					:class="['rc-chapter-item', { active: ch.current, read: ch.read }]"
					@click="emit('navigate', { page: 'reader', params: { chapterId: ch.id }, replace: true })">
					<span>{{ ch.name }}</span>
					<span v-if="ch.current" class="rc-current-indicator"></span>
					<span v-else-if="ch.read" class="rc-read-dot"></span>
				</div>
			</aside>

			<!-- 图片区域 -->
			<main class="rc-main">
				<div class="rc-page-container">
					<div class="rc-page"
						:style="{ background: `linear-gradient(135deg, ${currentPageData.gradient[0]}, ${currentPageData.gradient[1]})` }">
						<div class="rc-page-badge">{{ page }} / {{ readerMock.totalPages }}</div>
					</div>
				</div>
			</main>
		</div>

		<!-- 底栏 -->
		<footer class="rc-footer">
			<button class="rc-btn-nav" @click="page = Math.max(1, page - 1)">◀ Prev</button>
			<div class="rc-progress-wrap">
				<div class="rc-progress">
					<div class="rc-progress-bar" :style="{ width: (page / readerMock.totalPages * 100) + '%' }"></div>
				</div>
				<span class="rc-progress-text">{{ page }}/{{ readerMock.totalPages }}</span>
			</div>
			<button class="rc-btn-nav" @click="page = Math.min(readerMock.totalPages, page + 1)">Next ▶</button>
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
.reader-c {
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 65px);
	background: #0d0f12;
	color: #e6e8eb;
	font-size: 13px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.rc-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 10px 20px;
	background: #161a20;
	border-bottom: 1px solid #2a313c;
}

.rc-btn {
	padding: 6px 12px;
	font-size: 12px;
	color: #9aa3ae;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 6px;
	cursor: pointer;
}

.rc-btn:hover {
	background: #1e232b;
	color: #e6e8eb;
}

.rc-breadcrumb {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
}

.rc-crumb-muted {
	color: #5c6470;
}

.rc-crumb-sep {
	color: #2a313c;
}

.rc-top-actions {
	display: flex;
	gap: 6px;
}

.rc-body {
	flex: 1;
	display: flex;
	min-height: 0;
}

.rc-chapters {
	width: 200px;
	background: #161a20;
	border-right: 1px solid #2a313c;
	padding: 14px 10px;
	overflow-y: auto;
}

.rc-chapters-title {
	font-size: 10px;
	font-weight: 700;
	color: #5c6470;
	letter-spacing: 0.1em;
	padding: 0 8px 10px;
}

.rc-chapter-item {
	position: relative;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	font-size: 12px;
	color: #9aa3ae;
	border-radius: 6px;
	cursor: pointer;
}

.rc-chapter-item:hover {
	background: #1e232b;
	color: #e6e8eb;
}

.rc-chapter-item.active {
	background: #1e232b;
	color: #f5a524;
}

.rc-chapter-item.active::before {
	content: '';
	position: absolute;
	left: 0;
	width: 3px;
	height: 16px;
	background: #f5a524;
	border-radius: 2px;
}

.rc-chapter-item.read {
	color: #5c6470;
}

.rc-current-indicator {
	margin-left: auto;
	width: 6px;
	height: 6px;
	background: #f5a524;
	border-radius: 50%;
}

.rc-read-dot {
	margin-left: auto;
	width: 4px;
	height: 4px;
	background: #3a424f;
	border-radius: 50%;
}

.rc-main {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.rc-page-container {
	width: 100%;
	max-width: 540px;
}

.rc-page {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 8px;
	border: 1px solid #2a313c;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	padding: 12px;
}

.rc-page-badge {
	padding: 4px 10px;
	background: rgba(13, 15, 18, 0.8);
	border: 1px solid #2a313c;
	border-radius: 4px;
	font-size: 11px;
	color: #9aa3ae;
	font-family: 'SF Mono', Consolas, monospace;
}

.rc-footer {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px 20px;
	background: #161a20;
	border-top: 1px solid #2a313c;
}

.rc-btn-nav {
	padding: 7px 14px;
	font-size: 12px;
	font-weight: 600;
	color: #0d0f12;
	background: #f5a524;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}

.rc-btn-nav:hover {
	background: #ffb93a;
}

.rc-progress-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 10px;
}

.rc-progress {
	flex: 1;
	height: 4px;
	background: #2a313c;
	border-radius: 2px;
	overflow: hidden;
}

.rc-progress-bar {
	height: 100%;
	background: #f5a524;
	border-radius: 2px;
	transition: width 0.2s;
}

.rc-progress-text {
	font-size: 11px;
	color: #5c6470;
	font-family: 'SF Mono', Consolas, monospace;
	min-width: 40px;
	text-align: right;
}
</style>
