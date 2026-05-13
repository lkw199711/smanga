<template>
	<div class="reader-g">
		<!-- 顶部工具栏 -->
		<header class="rg-topbar">
			<div class="rg-topbar-left">
				<button class="rg-btn-back">←</button>
				<div class="rg-manga-info">
					<div class="rg-manga-title">葬送的芙莉莲</div>
					<div class="rg-chapter-title">第 128 话 · 魔法的才能</div>
				</div>
			</div>
			<div class="rg-topbar-center">
				<button class="rg-btn-icon">🔍</button>
				<button class="rg-btn-icon">🔖</button>
				<button class="rg-btn-icon">⭐</button>
				<button class="rg-btn-icon">⚙️</button>
			</div>
			<div class="rg-topbar-right">
				<button class="rg-btn-icon">📊</button>
				<button class="rg-btn-icon">📁</button>
				<button class="rg-btn-primary">退出阅读</button>
			</div>
		</header>

		<!-- 主阅读区域 -->
		<div class="rg-main">
			<!-- 左侧章节列表 -->
			<aside class="rg-chapter-list">
				<div class="rg-chapter-header">
					<div class="rg-chapter-title">章节列表</div>
					<button class="rg-btn-icon">🔍</button>
				</div>
				<div class="rg-chapter-items">
					<div v-for="chapter in chapters" :key="chapter.id" 
						:class="['rg-chapter-item', { active: chapter.current, read: chapter.read }]">
						<div class="rg-chapter-name">{{ chapter.name }}</div>
						<div v-if="chapter.current" class="rg-chapter-current">当前</div>
					</div>
				</div>
			</aside>

			<!-- 中间阅读内容 -->
			<div class="rg-content">
				<div class="rg-page-container">
					<div class="rg-page-toolbar">
						<div class="rg-page-info">第 {{ currentPage }} / {{ totalPages }} 页</div>
						<div class="rg-page-nav">
							<button class="rg-btn-nav">◀</button>
							<button class="rg-btn-nav">▶</button>
						</div>
					</div>
					<div class="rg-page-content">
						<div v-for="page in pages" :key="page.id" class="rg-page-item">
							<div class="rg-page-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
								<div class="rg-page-number">{{ page.id }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧缩略图 -->
			<aside class="rg-thumbnails">
				<div class="rg-thumbnail-header">
					<div class="rg-thumbnail-title">缩略图</div>
					<button class="rg-btn-icon">📋</button>
				</div>
				<div class="rg-thumbnail-items">
					<div v-for="page in pages" :key="page.id" 
						:class="['rg-thumbnail-item', { active: page.id === currentPage }]">
						<div class="rg-thumbnail-placeholder" :style="{ background: `linear-gradient(135deg, ${page.gradient[0]}, ${page.gradient[1]})` }">
							<div class="rg-thumbnail-number">{{ page.id }}</div>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- 底部工具栏 -->
		<footer class="rg-bottombar">
			<div class="rg-progress-container">
				<div class="rg-progress-bar">
					<div class="rg-progress-fill" :style="{ width: (currentPage / totalPages) * 100 + '%' }"></div>
				</div>
				<div class="rg-progress-info">{{ currentPage }} / {{ totalPages }}</div>
			</div>
			<div class="rg-bottom-actions">
				<button class="rg-btn-icon">◀◀</button>
				<button class="rg-btn-icon">◀</button>
				<button class="rg-btn-icon">▶</button>
				<button class="rg-btn-icon">▶▶</button>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { readerMock } from '../mock';

const { chapters, pages, currentPage, totalPages } = readerMock;
</script>

<style scoped>
.reader-g {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #0a0a0a;
	font-family: 'Courier New', monospace;
	color: #00ff41;
}

/* 顶部工具栏 */
.rg-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #0a0a0a;
	border-bottom: 1px solid #00ff41;
	box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.rg-topbar-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.rg-btn-back {
	width: 40px;
	height: 40px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 18px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-btn-back:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-manga-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.rg-manga-title {
	font-size: 16px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-chapter-title {
	font-size: 14px;
	color: #ff00ff;
}

.rg-topbar-center,
.rg-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.rg-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-btn-icon:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-btn-primary {
	padding: 10px 20px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-btn-primary:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

/* 主阅读区域 */
.rg-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 左侧章节列表 */
.rg-chapter-list {
	width: 280px;
	background: #0a0a0a;
	border-right: 1px solid #00ff41;
	padding: 16px;
	box-shadow: 5px 0 20px rgba(0, 255, 65, 0.3);
	overflow-y: auto;
}

.rg-chapter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.rg-chapter-title {
	font-size: 16px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-chapter-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.rg-chapter-item {
	padding: 12px 16px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.rg-chapter-item:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-chapter-item.active {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-chapter-item.read {
	opacity: 0.7;
}

.rg-chapter-name {
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
}

.rg-chapter-current {
	font-size: 12px;
	color: #ff00ff;
	margin-top: 4px;
}

/* 中间阅读内容 */
.rg-content {
	flex: 1;
	overflow: auto;
	padding: 16px;
	background: #0a0a0a;
}

.rg-page-container {
	max-width: 800px;
	margin: 0 auto;
}

.rg-page-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
	padding: 12px 16px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-page-info {
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-page-nav {
	display: flex;
	gap: 8px;
}

.rg-btn-nav {
	width: 36px;
	height: 36px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-btn-nav:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-page-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.rg-page-item {
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
	overflow: hidden;
}

.rg-page-placeholder {
	height: 600px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.rg-page-number {
	position: absolute;
	bottom: 16px;
	right: 16px;
	padding: 8px 12px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

/* 右侧缩略图 */
.rg-thumbnails {
	width: 200px;
	background: #0a0a0a;
	border-left: 1px solid #00ff41;
	padding: 16px;
	box-shadow: -5px 0 20px rgba(0, 255, 65, 0.3);
	overflow-y: auto;
}

.rg-thumbnail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.rg-thumbnail-title {
	font-size: 16px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-thumbnail-items {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.rg-thumbnail-item {
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.rg-thumbnail-item:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-thumbnail-item.active {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.rg-thumbnail-placeholder {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.rg-thumbnail-number {
	position: absolute;
	bottom: 8px;
	right: 8px;
	padding: 4px 8px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	color: #00ff41;
	font-size: 12px;
	font-weight: bold;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

/* 底部工具栏 */
.rg-bottombar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #0a0a0a;
	border-top: 1px solid #00ff41;
	box-shadow: 0 -20px 20px rgba(0, 255, 65, 0.3);
}

.rg-progress-container {
	display: flex;
	align-items: center;
	gap: 16px;
	flex: 1;
	max-width: 400px;
}

.rg-progress-bar {
	flex: 1;
	height: 8px;
	border-radius: 2px;
	background: #1a1a1a;
	overflow: hidden;
	box-shadow: inset 0 0 5px rgba(0, 255, 65, 0.3);
}

.rg-progress-fill {
	height: 100%;
	border-radius: 2px;
	background: #00ff41;
	width: 30%;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-progress-info {
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.rg-bottom-actions {
	display: flex;
	gap: 12px;
}

.rg-bottom-actions .rg-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.rg-bottom-actions .rg-btn-icon:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}
</style>