<template>
	<div class="reader-f">
		<!-- 顶部工具栏 -->
		<header class="rf-topbar">
			<div class="rf-topbar-left">
				<button class="rf-btn-back">←</button>
				<div class="rf-manga-info">
					<div class="rf-manga-title">葬送的芙莉莲</div>
					<div class="rf-chapter-title">第 128 话 · 魔法的才能</div>
				</div>
			</div>
			<div class="rf-topbar-center">
				<button class="rf-btn-icon">🔍</button>
				<button class="rf-btn-icon">🔖</button>
				<button class="rf-btn-icon">⭐</button>
				<button class="rf-btn-icon">⚙️</button>
			</div>
			<div class="rf-topbar-right">
				<button class="rf-btn-icon">📊</button>
				<button class="rf-btn-icon">📁</button>
				<button class="rf-btn-primary">退出阅读</button>
			</div>
		</header>

		<!-- 主阅读区域 -->
		<div class="rf-main">
			<!-- 左侧章节列表 -->
			<aside class="rf-chapter-list">
				<div class="rf-chapter-header">
					<div class="rf-chapter-title">章节列表</div>
					<button class="rf-btn-icon">🔍</button>
				</div>
				<div class="rf-chapter-items">
					<div v-for="chapter in chapters" :key="chapter.id" 
						:class="['rf-chapter-item', { active: chapter.current, read: chapter.read }]">
						<div class="rf-chapter-name">{{ chapter.name }}</div>
						<div v-if="chapter.current" class="rf-chapter-current">当前</div>
					</div>
				</div>
			</aside>

			<!-- 中间阅读内容 -->
			<div class="rf-content">
				<div class="rf-page-container">
					<div class="rf-page-toolbar">
						<div class="rf-page-info">第 {{ currentPage }} / {{ totalPages }} 页</div>
						<div class="rf-page-nav">
							<button class="rf-btn-nav">◀</button>
							<button class="rf-btn-nav">▶</button>
						</div>
					</div>
					<div class="rf-page-content">
						<div v-for="page in pages" :key="page.id" class="rf-page-item">
							<div class="rf-page-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
								<div class="rf-page-number">{{ page.id }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧缩略图 -->
			<aside class="rf-thumbnails">
				<div class="rf-thumbnail-header">
					<div class="rf-thumbnail-title">缩略图</div>
					<button class="rf-btn-icon">📋</button>
				</div>
				<div class="rf-thumbnail-items">
					<div v-for="page in pages" :key="page.id" 
						:class="['rf-thumbnail-item', { active: page.id === currentPage }]">
						<div class="rf-thumbnail-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
							<div class="rf-thumbnail-number">{{ page.id }}</div>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- 底部工具栏 -->
		<footer class="rf-bottombar">
			<div class="rf-progress-container">
				<div class="rf-progress-bar">
					<div class="rf-progress-fill" :style="{ width: (currentPage / totalPages) * 100 + '%' }"></div>
				</div>
				<div class="rf-progress-info">{{ currentPage }} / {{ totalPages }}</div>
			</div>
			<div class="rf-bottom-actions">
				<button class="rf-btn-icon">◀◀</button>
				<button class="rf-btn-icon">◀</button>
				<button class="rf-btn-icon">▶</button>
				<button class="rf-btn-icon">▶▶</button>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { readerMock } from '../mock';

const { chapters, pages, currentPage, totalPages } = readerMock;
</script>

<style scoped>
.reader-f {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f8f9fa;
	font-family: 'Noto Sans JP', sans-serif;
	color: #2c3e50;
}

/* 顶部工具栏 */
.rf-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #f8f9fa;
	border-bottom: 1px solid #e9ecef;
}

.rf-topbar-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.rf-btn-back {
	width: 40px;
	height: 40px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 18px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-btn-back:hover {
	background: #e9ecef;
}

.rf-manga-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.rf-manga-title {
	font-size: 16px;
	font-weight: 500;
	color: #2c3e50;
}

.rf-chapter-title {
	font-size: 14px;
	color: #6c757d;
}

.rf-topbar-center,
.rf-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.rf-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-btn-icon:hover {
	background: #e9ecef;
}

.rf-btn-primary {
	padding: 10px 20px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-btn-primary:hover {
	background: #e9ecef;
}

/* 主阅读区域 */
.rf-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 左侧章节列表 */
.rf-chapter-list {
	width: 280px;
	background: #ffffff;
	border-right: 1px solid #e9ecef;
	padding: 16px;
	overflow-y: auto;
}

.rf-chapter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.rf-chapter-title {
	font-size: 16px;
	font-weight: 500;
	color: #2c3e50;
}

.rf-chapter-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.rf-chapter-item {
	padding: 12px 16px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-chapter-item:hover {
	background: #f8f9fa;
}

.rf-chapter-item.active {
	background: #f8f9fa;
	border-color: #2c3e50;
}

.rf-chapter-item.read {
	opacity: 0.7;
}

.rf-chapter-name {
	font-size: 14px;
	color: #2c3e50;
}

.rf-chapter-current {
	font-size: 12px;
	color: #6c757d;
	margin-top: 4px;
}

/* 中间阅读内容 */
.rf-content {
	flex: 1;
	overflow: auto;
	padding: 16px;
	background: #f8f9fa;
}

.rf-page-container {
	max-width: 800px;
	margin: 0 auto;
}

.rf-page-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
	padding: 12px 16px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
}

.rf-page-info {
	font-size: 14px;
	color: #2c3e50;
	font-weight: 500;
}

.rf-page-nav {
	display: flex;
	gap: 8px;
}

.rf-btn-nav {
	width: 36px;
	height: 36px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-btn-nav:hover {
	background: #e9ecef;
}

.rf-page-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.rf-page-item {
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	overflow: hidden;
}

.rf-page-placeholder {
	height: 600px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.rf-page-number {
	position: absolute;
	bottom: 16px;
	right: 16px;
	padding: 8px 12px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	color: #2c3e50;
	font-size: 14px;
	font-weight: 500;
}

/* 右侧缩略图 */
.rf-thumbnails {
	width: 200px;
	background: #ffffff;
	border-left: 1px solid #e9ecef;
	padding: 16px;
	overflow-y: auto;
}

.rf-thumbnail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.rf-thumbnail-title {
	font-size: 16px;
	font-weight: 500;
	color: #2c3e50;
}

.rf-thumbnail-items {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.rf-thumbnail-item {
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-thumbnail-item:hover {
	background: #f8f9fa;
}

.rf-thumbnail-item.active {
	background: #f8f9fa;
	border-color: #2c3e50;
}

.rf-thumbnail-placeholder {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.rf-thumbnail-number {
	position: absolute;
	bottom: 8px;
	right: 8px;
	padding: 4px 8px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	color: #2c3e50;
	font-size: 12px;
	font-weight: 500;
}

/* 底部工具栏 */
.rf-bottombar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #f8f9fa;
	border-top: 1px solid #e9ecef;
}

.rf-progress-container {
	display: flex;
	align-items: center;
	gap: 16px;
	flex: 1;
	max-width: 400px;
}

.rf-progress-bar {
	flex: 1;
	height: 8px;
	border-radius: 4px;
	background: #e9ecef;
	overflow: hidden;
}

.rf-progress-fill {
	height: 100%;
	border-radius: 4px;
	background: #2c3e50;
	width: 30%;
}

.rf-progress-info {
	font-size: 14px;
	color: #2c3e50;
	font-weight: 500;
}

.rf-bottom-actions {
	display: flex;
	gap: 12px;
}

.rf-bottom-actions .rf-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.rf-bottom-actions .rf-btn-icon:hover {
	background: #e9ecef;
}
</style>