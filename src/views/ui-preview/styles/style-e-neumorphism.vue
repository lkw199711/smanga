<template>
	<div class="style-e">
		<!-- 侧边栏 -->
		<aside class="se-sidebar">
			<div class="se-logo">
				<div class="se-logo-mark">S</div>
				<div class="se-logo-text">smanga</div>
			</div>

			<nav class="se-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['se-nav-item', { active: i === 0 }]">
					<span class="se-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="se-sec-title">媒体库</div>
			<nav class="se-nav">
				<div v-for="m in mediaList" :key="m.id" class="se-nav-item">
					<span class="se-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="se-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="se-user">
				<div class="se-avatar">U</div>
				<div class="se-user-info">
					<div class="se-user-name">User</div>
					<div class="se-user-role">管理员</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="se-body">
			<!-- 顶栏 -->
			<header class="se-topbar">
				<div class="se-search">
					<span class="se-search-icon">🔍</span>
					<input placeholder="搜索漫画、章节、标签…" />
					<span class="se-search-kbd">Ctrl K</span>
				</div>
				<div class="se-top-actions">
					<button class="se-btn-ghost">视图</button>
					<button class="se-btn-ghost">排序 ↓</button>
					<button class="se-btn-ghost">🌙</button>
					<button class="se-btn-ghost">中文</button>
					<button class="se-btn-primary">+ 新建媒体库</button>
				</div>
			</header>

			<main class="se-main">
				<!-- 统计 -->
				<section class="se-stats">
					<div class="se-stat-card">
						<div class="se-stat-icon">📚</div>
						<div class="se-stat-info">
							<div class="se-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
							<div class="se-stat-label">漫画总数</div>
						</div>
						<div class="se-stat-trend up">+24</div>
					</div>
					<div class="se-stat-card">
						<div class="se-stat-icon">📖</div>
						<div class="se-stat-info">
							<div class="se-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
							<div class="se-stat-label">章节总数</div>
						</div>
						<div class="se-stat-trend up">+1.2k</div>
					</div>
					<div class="se-stat-card">
						<div class="se-stat-icon">🔥</div>
						<div class="se-stat-info">
							<div class="se-stat-value">{{ stats.readToday }}</div>
							<div class="se-stat-label">今日阅读</div>
						</div>
						<div class="se-stat-trend">章</div>
					</div>
					<div class="se-stat-card">
						<div class="se-stat-icon">⭐</div>
						<div class="se-stat-info">
							<div class="se-stat-value">{{ stats.readThisWeek }}</div>
							<div class="se-stat-label">本周阅读</div>
						</div>
						<div class="se-stat-trend">章</div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="se-section">
					<div class="se-section-head">
						<h2>继续阅读</h2>
						<a class="se-link">查看全部 →</a>
					</div>
					<div class="se-continue">
						<div v-for="m in continueReading" :key="m.id" class="se-cont-card">
							<div class="se-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="se-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="se-cont-unread">{{ m.unread }}</span>
							</div>
							<div class="se-cont-info">
								<div class="se-cont-name">{{ m.name }}</div>
								<div class="se-cont-chapter">{{ m.chapter }}</div>
								<div class="se-cont-progress">
									<div class="se-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="se-section">
					<div class="se-section-head">
						<h2>最近添加</h2>
						<a class="se-link">查看全部 →</a>
					</div>
					<div class="se-grid">
						<div v-for="m in recentAdded" :key="m.id" class="se-grid-card">
							<div class="se-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="se-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="se-grid-name">{{ m.name }}</div>
							<div class="se-grid-meta">{{ m.chapter }}</div>
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
.style-e {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #e0e5ec;
	color: #2d3748;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 侧边栏 */
.se-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: #e0e5ec;
	display: flex;
	flex-direction: column;
}

.se-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
}

.se-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e0e5ec;
	color: #2d3748;
	font-weight: 700;
	border-radius: 8px;
	box-shadow: 6px 6px 12px #bec3cc, -6px -6px 12px #ffffff;
}

.se-logo-text {
	font-size: 16px;
	font-weight: 700;
}

.se-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: #718096;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.se-nav {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.se-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: #4a5568;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.15s;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
}

.se-nav-item:hover {
	box-shadow: inset 4px 4px 8px #bec3cc, inset -4px -4px 8px #ffffff;
	color: #2d3748;
}

.se-nav-item.active {
	box-shadow: inset 4px 4px 8px #bec3cc, inset -4px -4px 8px #ffffff;
	color: #4a90e2;
	font-weight: 600;
}

.se-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.se-nav-count {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 11px;
	color: #718096;
	background: #e0e5ec;
	border-radius: 10px;
	box-shadow: inset 2px 2px 4px #bec3cc, inset -2px -2px 4px #ffffff;
}

.se-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #d1d9e6;
}

.se-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e0e5ec;
	color: #2d3748;
	font-weight: 600;
	border-radius: 50%;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
}

.se-user-name {
	font-weight: 500;
	font-size: 13px;
}

.se-user-role {
	font-size: 11px;
	color: #718096;
}

/* 顶栏 */
.se-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.se-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: #e0e5ec;
	border-bottom: 1px solid #d1d9e6;
}

.se-search {
	flex: 1;
	max-width: 560px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	background: #e0e5ec;
	border-radius: 12px;
	box-shadow: inset 4px 4px 8px #bec3cc, inset -4px -4px 8px #ffffff;
}

.se-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #2d3748;
}

.se-search input::placeholder {
	color: #718096;
}

.se-search-icon {
	color: #718096;
	font-size: 13px;
}

.se-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #718096;
	background: #e0e5ec;
	border-radius: 4px;
	box-shadow: 2px 2px 4px #bec3cc, -2px -2px 4px #ffffff;
}

.se-top-actions {
	display: flex;
	gap: 8px;
}

.se-btn-ghost {
	padding: 8px 14px;
	font-size: 13px;
	color: #4a5568;
	background: #e0e5ec;
	border: none;
	border-radius: 12px;
	cursor: pointer;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
	transition: all 0.15s;
}

.se-btn-ghost:hover {
	box-shadow: inset 4px 4px 8px #bec3cc, inset -4px -4px 8px #ffffff;
}

.se-btn-primary {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: #4a90e2;
	border: none;
	border-radius: 12px;
	cursor: pointer;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
	transition: all 0.15s;
}

.se-btn-primary:hover {
	box-shadow: inset 4px 4px 8px #3a7bc8, inset -4px -4px 8px #5aa4fc;
}

/* 主区 */
.se-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}

.se-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.se-stat-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 18px 20px;
	background: #e0e5ec;
	border-radius: 16px;
	box-shadow: 6px 6px 12px #bec3cc, -6px -6px 12px #ffffff;
}

.se-stat-icon {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e0e5ec;
	border-radius: 12px;
	font-size: 20px;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
}

.se-stat-info {
	flex: 1;
}

.se-stat-value {
	font-size: 20px;
	font-weight: 700;
	color: #2d3748;
}

.se-stat-label {
	font-size: 12px;
	color: #718096;
	margin-top: 2px;
}

.se-stat-trend {
	padding: 2px 8px;
	font-size: 11px;
	color: #38a169;
	background: #e0e5ec;
	border-radius: 8px;
	box-shadow: inset 2px 2px 4px #bec3cc, inset -2px -2px 4px #ffffff;
}

.se-stat-trend.up {
	color: #38a169;
}

.se-section {
	margin-bottom: 32px;
}

.se-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.se-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #2d3748;
}

.se-link {
	font-size: 13px;
	color: #4a90e2;
	cursor: pointer;
}

.se-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.se-cont-card {
	display: flex;
	gap: 12px;
	padding: 14px;
	background: #e0e5ec;
	border-radius: 16px;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
	transition: all 0.2s;
	cursor: pointer;
}

.se-cont-card:hover {
	box-shadow: inset 4px 4px 8px #bec3cc, inset -4px -4px 8px #ffffff;
}

.se-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
}

.se-cont-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: #4a90e2;
	border-radius: 4px;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.se-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: #e53e3e;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.se-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.se-cont-name {
	font-size: 14px;
	font-weight: 600;
	color: #2d3748;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.se-cont-chapter {
	font-size: 12px;
	color: #718096;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.se-cont-progress {
	height: 4px;
	background: #e0e5ec;
	border-radius: 2px;
	overflow: hidden;
	box-shadow: inset 2px 2px 4px #bec3cc, inset -2px -2px 4px #ffffff;
}

.se-cont-progress-bar {
	height: 100%;
	background: #4a90e2;
	border-radius: 2px;
}

.se-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.se-grid-card {
	cursor: pointer;
	transition: all 0.15s;
}

.se-grid-card:hover {
	transform: translateY(-2px);
}

.se-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 12px;
	margin-bottom: 8px;
	box-shadow: 4px 4px 8px #bec3cc, -4px -4px 8px #ffffff;
	overflow: hidden;
}

.se-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: #4a90e2;
	border-radius: 4px;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.se-grid-name {
	font-size: 13px;
	font-weight: 500;
	color: #2d3748;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.se-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #718096;
}
</style>