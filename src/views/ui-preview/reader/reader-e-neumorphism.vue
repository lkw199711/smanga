<template>
	<div class="reader-e">
		<!-- 顶部工具栏 -->
		<header class="re-topbar">
			<div class="re-topbar-left">
				<button class="re-btn-back">←</button>
				<div class="re-manga-info">
					<div class="re-manga-title">葬送的芙莉莲</div>
					<div class="re-chapter-title">第 128 话 · 魔法的才能</div>
				</div>
			</div>
			<div class="re-topbar-center">
				<button class="re-btn-icon">🔍</button>
				<button class="re-btn-icon">🔖</button>
				<button class="re-btn-icon">⭐</button>
				<button class="re-btn-icon">⚙️</button>
			</div>
			<div class="re-topbar-right">
				<button class="re-btn-icon">📊</button>
				<button class="re-btn-icon">📁</button>
				<button class="re-btn-primary">退出阅读</button>
			</div>
		</header>

		<!-- 主阅读区域 -->
		<div class="re-main">
			<!-- 左侧章节列表 -->
			<aside class="re-chapter-list">
				<div class="re-chapter-header">
					<div class="re-chapter-title">章节列表</div>
					<button class="re-btn-icon">🔍</button>
				</div>
				<div class="re-chapter-items">
					<div v-for="chapter in chapters" :key="chapter.id" 
						:class="['re-chapter-item', { active: chapter.current, read: chapter.read }]">
						<div class="re-chapter-name">{{ chapter.name }}</div>
						<div v-if="chapter.current" class="re-chapter-current">当前</div>
					</div>
				</div>
			</aside>

			<!-- 中间阅读内容 -->
			<div class="re-content">
				<div class="re-page-container">
					<div class="re-page-toolbar">
						<div class="re-page-info">第 {{ currentPage }} / {{ totalPages }} 页</div>
						<div class="re-page-nav">
							<button class="re-btn-nav">◀</button>
							<button class="re-btn-nav">▶</button>
						</div>
					</div>
					<div class="re-page-content">
						<div v-for="page in pages" :key="page.id" class="re-page-item">
							<div class="re-page-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
								<div class="re-page-number">{{ page.id }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧缩略图 -->
			<aside class="re-thumbnails">
				<div class="re-thumbnail-header">
					<div class="re-thumbnail-title">缩略图</div>
					<button class="re-btn-icon">📋</button>
				</div>
				<div class="re-thumbnail-items">
					<div v-for="page in pages" :key="page.id" 
						:class="['re-thumbnail-item', { active: page.id === currentPage }]">
						<div class="re-thumbnail-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
							<div class="re-thumbnail-number">{{ page.id }}</div>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- 底部工具栏 -->
		<footer class="re-bottombar">
			<div class="re-progress-container">
				<div class="re-progress-bar">
					<div class="re-progress-fill" :style="{ width: (currentPage / totalPages) * 100 + '%' }"></div>
				</div>
				<div class="re-progress-info">{{ currentPage }} / {{ totalPages }}</div>
			</div>
			<div class="re-bottom-actions">
				<button class="re-btn-icon">◀◀</button>
				<button class="re-btn-icon">◀</button>
				<button class="re-btn-icon">▶</button>
				<button class="re-btn-icon">▶▶</button>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { readerMock } from '../mock';

const { chapters, pages, currentPage, totalPages } = readerMock;
</script>

<style scoped>
.reader-e {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #e0e5ec;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	color: #2d3748;
}

/* 顶部工具栏 */
.re-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #e0e5ec;
	border-bottom: 1px solid #babecf;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.re-topbar-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.re-btn-back {
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 18px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-btn-back:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-manga-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.re-manga-title {
	font-size: 16px;
	font-weight: 600;
	color: #2d3748;
}

.re-chapter-title {
	font-size: 14px;
	color: #4a5568;
}

.re-topbar-center,
.re-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.re-btn-icon {
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-btn-icon:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-btn-primary {
	padding: 10px 20px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-btn-primary:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

/* 主阅读区域 */
.re-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 左侧章节列表 */
.re-chapter-list {
	width: 280px;
	background: #e0e5ec;
	border-right: 1px solid #babecf;
	padding: 16px;
	box-shadow: 
		5px 0 10px #babecf;
	overflow-y: auto;
}

.re-chapter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.re-chapter-title {
	font-size: 16px;
	font-weight: 600;
	color: #2d3748;
}

.re-chapter-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.re-chapter-item {
	padding: 12px 16px;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-chapter-item:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-chapter-item.active {
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-chapter-item.read {
	opacity: 0.7;
}

.re-chapter-name {
	font-size: 14px;
	color: #2d3748;
}

.re-chapter-current {
	font-size: 12px;
	color: #4a5568;
	margin-top: 4px;
}

/* 中间阅读内容 */
.re-content {
	flex: 1;
	overflow: auto;
	padding: 16px;
}

.re-page-container {
	max-width: 800px;
	margin: 0 auto;
}

.re-page-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
	padding: 12px 16px;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.re-page-info {
	font-size: 14px;
	color: #2d3748;
	font-weight: 600;
}

.re-page-nav {
	display: flex;
	gap: 8px;
}

.re-btn-nav {
	width: 36px;
	height: 36px;
	border: none;
	border-radius: 10px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-btn-nav:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-page-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.re-page-item {
	border-radius: 16px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	overflow: hidden;
}

.re-page-placeholder {
	height: 600px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.re-page-number {
	position: absolute;
	bottom: 16px;
	right: 16px;
	padding: 8px 12px;
	border-radius: 10px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 14px;
	font-weight: 600;
}

/* 右侧缩略图 */
.re-thumbnails {
	width: 200px;
	background: #e0e5ec;
	border-left: 1px solid #babecf;
	padding: 16px;
	box-shadow: 
		-5px 0 10px #babecf;
	overflow-y: auto;
}

.re-thumbnail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.re-thumbnail-title {
	font-size: 16px;
	font-weight: 600;
	color: #2d3748;
}

.re-thumbnail-items {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.re-thumbnail-item {
	border-radius: 8px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-thumbnail-item:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-thumbnail-item.active {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.re-thumbnail-placeholder {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.re-thumbnail-number {
	position: absolute;
	bottom: 8px;
	right: 8px;
	padding: 4px 8px;
	border-radius: 6px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 12px;
	font-weight: 600;
}

/* 底部工具栏 */
.re-bottombar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #e0e5ec;
	border-top: 1px solid #babecf;
	box-shadow: 
		0 -5px 10px #babecf;
}

.re-progress-container {
	display: flex;
	align-items: center;
	gap: 16px;
	flex: 1;
	max-width: 400px;
}

.re-progress-bar {
	flex: 1;
	height: 8px;
	border-radius: 4px;
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
	overflow: hidden;
}

.re-progress-fill {
	height: 100%;
	border-radius: 4px;
	background: #4a5568;
	width: 30%;
}

.re-progress-info {
	font-size: 14px;
	color: #2d3748;
	font-weight: 600;
}

.re-bottom-actions {
	display: flex;
	gap: 12px;
}

.re-bottom-actions .re-btn-icon {
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.re-bottom-actions .re-btn-icon:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}
</style>