<template>
	<div class="style-c">
		<!-- 侧边栏 -->
		<aside class="sc-sidebar">
			<div class="sc-logo">
				<div class="sc-logo-mark">s</div>
				<div class="sc-logo-text">smanga</div>
				<span class="sc-logo-ver">v4.3</span>
			</div>

			<div class="sc-search-mini">
				<span>🔍</span><input placeholder="Quick find…" />
			</div>

			<nav class="sc-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sc-nav-item', { active: i === 0 }]">
					<span class="sc-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
					<span v-if="i === 1" class="sc-nav-dot"></span>
				</div>
			</nav>

			<div class="sc-sec-title">LIBRARIES</div>
			<nav class="sc-nav">
				<div v-for="m in mediaList" :key="m.id" class="sc-nav-item">
					<span class="sc-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="sc-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="sc-user">
				<div class="sc-avatar">U</div>
				<div class="sc-user-info">
					<div class="sc-user-name">admin</div>
					<div class="sc-user-role">● Online</div>
				</div>
				<button class="sc-icon-btn">⚙</button>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sc-body">
			<!-- 顶栏 -->
			<header class="sc-topbar">
				<div class="sc-breadcrumb">
					<span class="sc-crumb-muted">Home</span>
					<span class="sc-crumb-sep">/</span>
					<span>Dashboard</span>
				</div>

				<div class="sc-top-actions">
					<button class="sc-btn">View</button>
					<button class="sc-btn">Sort</button>
					<button class="sc-btn">Theme</button>
					<button class="sc-btn">中 / EN</button>
					<div class="sc-divider"></div>
					<button class="sc-btn-primary">+ Add Library</button>
				</div>
			</header>

			<main class="sc-main">
				<!-- 顶部欢迎 + 统计条 -->
				<section class="sc-welcome">
					<div class="sc-welcome-text">
						<h1>Welcome back, admin</h1>
						<p>1 new update · 47 chapters read today</p>
					</div>
					<div class="sc-welcome-stats">
						<div class="sc-stat">
							<div class="sc-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
							<div class="sc-stat-label">Manga</div>
						</div>
						<div class="sc-stat">
							<div class="sc-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
							<div class="sc-stat-label">Chapters</div>
						</div>
						<div class="sc-stat">
							<div class="sc-stat-value">{{ stats.readToday }}</div>
							<div class="sc-stat-label">Today</div>
						</div>
						<div class="sc-stat accent">
							<div class="sc-stat-value">{{ stats.readThisWeek }}</div>
							<div class="sc-stat-label">This Week</div>
						</div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sc-section">
					<div class="sc-section-head">
						<h2>Continue Reading</h2>
						<a class="sc-link">View all</a>
					</div>
					<div class="sc-continue">
						<div v-for="m in continueReading" :key="m.id" class="sc-cont-card">
							<div class="sc-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sc-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sc-cont-unread">{{ m.unread }}</span>
								<div class="sc-cont-overlay">
									<button class="sc-cont-play">▶</button>
								</div>
							</div>
							<div class="sc-cont-info">
								<div class="sc-cont-name">{{ m.name }}</div>
								<div class="sc-cont-chapter">{{ m.chapter }}</div>
								<div class="sc-cont-progress">
									<div class="sc-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
									<span class="sc-cont-progress-text">{{ m.progress }}%</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sc-section">
					<div class="sc-section-head">
						<h2>Recently Added</h2>
						<a class="sc-link">View all</a>
					</div>
					<div class="sc-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sc-grid-card">
							<div class="sc-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sc-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="sc-grid-name">{{ m.name }}</div>
							<div class="sc-grid-meta">{{ m.chapter }}</div>
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
.style-c {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #0d0f12;
	color: #e6e8eb;
	font-size: 13px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 侧边栏 */
.sc-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 16px 10px;
	background: #161a20;
	border-right: 1px solid #2a313c;
	display: flex;
	flex-direction: column;
}

.sc-logo {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px 14px;
}

.sc-logo-mark {
	width: 26px;
	height: 26px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5a524;
	color: #0d0f12;
	font-weight: 800;
	border-radius: 6px;
}

.sc-logo-text {
	font-size: 15px;
	font-weight: 700;
	color: #e6e8eb;
}

.sc-logo-ver {
	margin-left: auto;
	font-size: 10px;
	color: #5c6470;
	padding: 2px 6px;
	background: #1e232b;
	border-radius: 4px;
}

.sc-search-mini {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	margin-bottom: 12px;
	background: #1e232b;
	border: 1px solid #2a313c;
	border-radius: 8px;
	color: #5c6470;
	font-size: 12px;
}

.sc-search-mini input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	color: #e6e8eb;
	font-size: 12px;
}

.sc-search-mini input::placeholder {
	color: #5c6470;
}

.sc-nav {
	display: flex;
	flex-direction: column;
	gap: 1px;
}

.sc-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	color: #9aa3ae;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.12s;
	font-weight: 500;
}

.sc-nav-item:hover {
	background: #1e232b;
	color: #e6e8eb;
}

.sc-nav-item.active {
	background: #1e232b;
	color: #f5a524;
	position: relative;
}

.sc-nav-item.active::before {
	content: '';
	position: absolute;
	left: -10px;
	top: 8px;
	bottom: 8px;
	width: 3px;
	background: #f5a524;
	border-radius: 2px;
}

.sc-nav-icon {
	width: 18px;
	font-size: 13px;
	text-align: center;
}

.sc-nav-dot {
	margin-left: auto;
	width: 6px;
	height: 6px;
	background: #f5a524;
	border-radius: 50%;
}

.sc-nav-count {
	margin-left: auto;
	font-size: 11px;
	color: #5c6470;
}

.sc-sec-title {
	padding: 16px 10px 6px;
	font-size: 10px;
	font-weight: 700;
	color: #5c6470;
	letter-spacing: 0.1em;
}

.sc-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #2a313c;
}

.sc-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5a524;
	color: #0d0f12;
	font-weight: 700;
	border-radius: 6px;
}

.sc-user-info {
	flex: 1;
	min-width: 0;
}

.sc-user-name {
	font-size: 13px;
	font-weight: 600;
	color: #e6e8eb;
}

.sc-user-role {
	font-size: 10px;
	color: #3fb950;
}

.sc-icon-btn {
	padding: 6px 8px;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 6px;
	color: #9aa3ae;
	cursor: pointer;
}

.sc-icon-btn:hover {
	background: #1e232b;
	color: #e6e8eb;
}

/* 顶栏 */
.sc-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sc-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: #0d0f12;
	border-bottom: 1px solid #2a313c;
}

.sc-breadcrumb {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: #e6e8eb;
}

.sc-crumb-muted {
	color: #5c6470;
	cursor: pointer;
}

.sc-crumb-muted:hover {
	color: #9aa3ae;
}

.sc-crumb-sep {
	color: #2a313c;
}

.sc-top-actions {
	display: flex;
	align-items: center;
	gap: 6px;
}

.sc-btn {
	padding: 6px 12px;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 6px;
	color: #9aa3ae;
	font-size: 12px;
	cursor: pointer;
}

.sc-btn:hover {
	background: #1e232b;
	color: #e6e8eb;
	border-color: #3a424f;
}

.sc-btn-primary {
	padding: 6px 14px;
	background: #f5a524;
	border: 1px solid #f5a524;
	border-radius: 6px;
	color: #0d0f12;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
}

.sc-btn-primary:hover {
	background: #ffb93a;
}

.sc-divider {
	width: 1px;
	height: 20px;
	background: #2a313c;
	margin: 0 4px;
}

/* 主区 */
.sc-main {
	flex: 1;
	padding: 24px;
	overflow: auto;
}

.sc-welcome {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px;
	margin-bottom: 28px;
	background: #161a20;
	border: 1px solid #2a313c;
	border-radius: 10px;
}

.sc-welcome-text h1 {
	margin: 0 0 4px;
	font-size: 20px;
	font-weight: 600;
	color: #e6e8eb;
}

.sc-welcome-text p {
	margin: 0;
	font-size: 12px;
	color: #9aa3ae;
}

.sc-welcome-stats {
	display: flex;
	gap: 28px;
}

.sc-stat {
	text-align: right;
}

.sc-stat-value {
	font-size: 22px;
	font-weight: 700;
	color: #e6e8eb;
	letter-spacing: -0.01em;
}

.sc-stat.accent .sc-stat-value {
	color: #f5a524;
}

.sc-stat-label {
	font-size: 11px;
	color: #5c6470;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	margin-top: 2px;
}

.sc-section {
	margin-bottom: 28px;
}

.sc-section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.sc-section-head h2 {
	margin: 0;
	font-size: 15px;
	font-weight: 600;
	color: #e6e8eb;
}

.sc-link {
	font-size: 12px;
	color: #f5a524;
	cursor: pointer;
}

.sc-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 12px;
}

.sc-cont-card {
	display: flex;
	gap: 12px;
	padding: 10px;
	background: #161a20;
	border: 1px solid #2a313c;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s;
}

.sc-cont-card:hover {
	border-color: #3a424f;
	background: #1a1f27;
}

.sc-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 6px;
	overflow: hidden;
}

.sc-cont-tag {
	position: absolute;
	top: 4px;
	left: 4px;
	padding: 2px 6px;
	font-size: 9px;
	font-weight: 700;
	color: #0d0f12;
	background: #f5a524;
	border-radius: 3px;
}

.sc-cont-unread {
	position: absolute;
	top: 4px;
	right: 4px;
	min-width: 16px;
	height: 16px;
	padding: 0 4px;
	font-size: 10px;
	font-weight: 700;
	color: #0d0f12;
	background: #f5a524;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sc-cont-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(13, 15, 18, 0.5);
	opacity: 0;
	transition: opacity 0.15s;
}

.sc-cont-card:hover .sc-cont-overlay {
	opacity: 1;
}

.sc-cont-play {
	width: 32px;
	height: 32px;
	background: #f5a524;
	border: none;
	border-radius: 50%;
	color: #0d0f12;
	font-size: 12px;
	cursor: pointer;
}

.sc-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sc-cont-name {
	font-size: 13px;
	font-weight: 600;
	color: #e6e8eb;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sc-cont-chapter {
	font-size: 11px;
	color: #9aa3ae;
	margin-top: 2px;
}

.sc-cont-progress {
	position: relative;
	height: 14px;
	display: flex;
	align-items: center;
}

.sc-cont-progress-bar {
	position: absolute;
	left: 0;
	height: 4px;
	background: #f5a524;
	border-radius: 2px;
	max-width: calc(100% - 36px);
}

.sc-cont-progress::before {
	content: '';
	position: absolute;
	left: 0;
	right: 36px;
	height: 4px;
	background: #2a313c;
	border-radius: 2px;
}

.sc-cont-progress-text {
	margin-left: auto;
	font-size: 10px;
	color: #5c6470;
	font-family: 'SF Mono', Consolas, monospace;
}

.sc-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	gap: 16px;
}

.sc-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sc-grid-card:hover {
	transform: translateY(-2px);
}

.sc-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 8px;
	margin-bottom: 6px;
	border: 1px solid #2a313c;
}

.sc-grid-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 9px;
	font-weight: 700;
	color: #0d0f12;
	background: #f5a524;
	border-radius: 3px;
}

.sc-grid-name {
	font-size: 12px;
	font-weight: 500;
	color: #e6e8eb;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sc-grid-meta {
	margin-top: 2px;
	font-size: 10px;
	color: #5c6470;
}
</style>
