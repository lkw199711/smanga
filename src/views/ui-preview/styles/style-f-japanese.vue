<template>
	<div class="style-f">
		<!-- 侧边栏 -->
		<aside class="sf-sidebar">
			<div class="sf-logo">
				<div class="sf-logo-mark">s</div>
				<div class="sf-logo-text">manga</div>
			</div>

			<nav class="sf-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sf-nav-item', { active: i === 0 }]">
					<span class="sf-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sf-sec-title">媒体库</div>
			<nav class="sf-nav">
				<div v-for="m in mediaList" :key="m.id" class="sf-nav-item">
					<span class="sf-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="sf-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="sf-user">
				<div class="sf-avatar">U</div>
				<div class="sf-user-info">
					<div class="sf-user-name">User</div>
					<div class="sf-user-role">管理员</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sf-body">
			<!-- 顶栏 -->
			<header class="sf-topbar">
				<div class="sf-search">
					<span class="sf-search-icon">🔍</span>
					<input placeholder="漫画を検索..." />
					<span class="sf-search-kbd">⌘K</span>
				</div>
				<div class="sf-top-actions">
					<button class="sf-btn-ghost">表示</button>
					<button class="sf-btn-ghost">並び替え</button>
					<button class="sf-btn-ghost">🌙</button>
					<button class="sf-btn-ghost">日本語</button>
					<button class="sf-btn-primary">+ 新規</button>
				</div>
			</header>

			<main class="sf-main">
				<!-- 统计 -->
				<section class="sf-stats">
					<div class="sf-stat-card">
						<div class="sf-stat-icon">📚</div>
						<div class="sf-stat-info">
							<div class="sf-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
							<div class="sf-stat-label">総マンガ数</div>
						</div>
					</div>
					<div class="sf-stat-card">
						<div class="sf-stat-icon">📖</div>
						<div class="sf-stat-info">
							<div class="sf-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
							<div class="sf-stat-label">総チャプター数</div>
						</div>
					</div>
					<div class="sf-stat-card">
						<div class="sf-stat-icon">🔥</div>
						<div class="sf-stat-info">
							<div class="sf-stat-value">{{ stats.readToday }}</div>
							<div class="sf-stat-label">本日読了</div>
						</div>
					</div>
					<div class="sf-stat-card">
						<div class="sf-stat-icon">⭐</div>
						<div class="sf-stat-info">
							<div class="sf-stat-value">{{ stats.readThisWeek }}</div>
							<div class="sf-stat-label">今週読了</div>
						</div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sf-section">
					<div class="sf-section-head">
						<h2>続きから</h2>
						<a class="sf-link">すべて見る →</a>
					</div>
					<div class="sf-continue">
						<div v-for="m in continueReading" :key="m.id" class="sf-cont-card">
							<div class="sf-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sf-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sf-cont-unread">{{ m.unread }}</span>
							</div>
							<div class="sf-cont-info">
								<div class="sf-cont-name">{{ m.name }}</div>
								<div class="sf-cont-chapter">{{ m.chapter }}</div>
								<div class="sf-cont-progress">
									<div class="sf-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sf-section">
					<div class="sf-section-head">
						<h2>最近追加</h2>
						<a class="sf-link">すべて見る →</a>
					</div>
					<div class="sf-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sf-grid-card">
							<div class="sf-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sf-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="sf-grid-name">{{ m.name }}</div>
							<div class="sf-grid-meta">{{ m.chapter }}</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { sidebarMenu as menu, mediaList, continueReading, recentAdded, stats } from '../mock';
</script>

<style scoped>
.style-f {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #2c3e50;
	font-size: 14px;
	font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 侧边栏 */
.sf-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: #ffffff;
	border-right: 1px solid #e8e8e8;
	display: flex;
	flex-direction: column;
}

.sf-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
}

.sf-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #2c3e50;
	color: #fff;
	font-weight: 300;
	border-radius: 4px;
	font-size: 16px;
}

.sf-logo-text {
	font-size: 16px;
	font-weight: 300;
	letter-spacing: 0.1em;
}

.sf-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 300;
	color: #95a5a6;
	text-transform: uppercase;
	letter-spacing: 0.2em;
}

.sf-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sf-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	color: #7f8c8d;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 300;
}

.sf-nav-item:hover {
	background: #f8f9fa;
	color: #2c3e50;
}

.sf-nav-item.active {
	background: #f8f9fa;
	color: #2c3e50;
	font-weight: 400;
	border-left: 3px solid #2c3e50;
}

.sf-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.sf-nav-count {
	margin-left: auto;
	padding: 1px 6px;
	font-size: 11px;
	color: #95a5a6;
	background: #f8f9fa;
	border-radius: 3px;
}

.sf-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #e8e8e8;
}

.sf-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #2c3e50;
	color: #fff;
	font-weight: 300;
	border-radius: 4px;
}

.sf-user-name {
	font-weight: 300;
	font-size: 13px;
}

.sf-user-role {
	font-size: 11px;
	color: #95a5a6;
}

/* 顶栏 */
.sf-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sf-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: #ffffff;
	border-bottom: 1px solid #e8e8e8;
}

.sf-search {
	flex: 1;
	max-width: 560px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #f8f9fa;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
}

.sf-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #2c3e50;
}

.sf-search input::placeholder {
	color: #95a5a6;
}

.sf-search-icon {
	color: #95a5a6;
	font-size: 13px;
}

.sf-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #95a5a6;
	background: #f8f9fa;
	border: 1px solid #e8e8e8;
	border-radius: 3px;
}

.sf-top-actions {
	display: flex;
	gap: 6px;
}

.sf-btn-ghost {
	padding: 6px 12px;
	font-size: 13px;
	color: #7f8c8d;
	background: transparent;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 300;
}

.sf-btn-ghost:hover {
	background: #f8f9fa;
	color: #2c3e50;
}

.sf-btn-primary {
	padding: 6px 14px;
	font-size: 13px;
	font-weight: 300;
	color: #fff;
	background: #2c3e50;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.sf-btn-primary:hover {
	background: #34495e;
}

/* 主区 */
.sf-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}

.sf-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.sf-stat-card {
	padding: 18px 20px;
	background: #ffffff;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	text-align: center;
	transition: all 0.2s;
}

.sf-stat-card:hover {
	border-color: #2c3e50;
}

.sf-stat-icon {
	font-size: 20px;
	margin-bottom: 8px;
}

.sf-stat-value {
	font-size: 20px;
	font-weight: 300;
	color: #2c3e50;
}

.sf-stat-label {
	font-size: 12px;
	color: #95a5a6;
	margin-top: 2px;
}

.sf-section {
	margin-bottom: 32px;
}

.sf-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sf-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 300;
	color: #2c3e50;
}

.sf-link {
	font-size: 13px;
	color: #2c3e50;
	cursor: pointer;
	text-decoration: underline;
	text-underline-offset: 2px;
}

.sf-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sf-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #ffffff;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
	transition: all 0.2s;
	cursor: pointer;
}

.sf-cont-card:hover {
	border-color: #2c3e50;
}

.sf-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 4px;
	overflow: hidden;
}

.sf-cont-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 300;
	color: #fff;
	background: #2c3e50;
	border-radius: 2px;
}

.sf-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 300;
	color: #fff;
	background: #e74c3c;
	border-radius: 3px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sf-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sf-cont-name {
	font-size: 14px;
	font-weight: 300;
	color: #2c3e50;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sf-cont-chapter {
	font-size: 12px;
	color: #95a5a6;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sf-cont-progress {
	height: 2px;
	background: #e8e8e8;
	overflow: hidden;
}

.sf-cont-progress-bar {
	height: 100%;
	background: #2c3e50;
}

.sf-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sf-grid-card {
	cursor: pointer;
	transition: all 0.2s;
}

.sf-grid-card:hover {
	transform: translateY(-2px);
}

.sf-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 4px;
	margin-bottom: 8px;
	overflow: hidden;
}

.sf-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 300;
	color: #fff;
	background: #2c3e50;
	border-radius: 2px;
}

.sf-grid-name {
	font-size: 13px;
	font-weight: 300;
	color: #2c3e50;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sf-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #95a5a6;
}
</style>