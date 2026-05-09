<template>
	<div class="style-g">
		<!-- 侧边栏 -->
		<aside class="sg-sidebar">
			<div class="sg-logo">
				<div class="sg-logo-mark">S</div>
				<div class="sg-logo-text">SMANGA</div>
			</div>

			<nav class="sg-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sg-nav-item', { active: i === 0 }]">
					<span class="sg-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sg-sec-title">媒体库</div>
			<nav class="sg-nav">
				<div v-for="m in mediaList" :key="m.id" class="sg-nav-item">
					<span class="sg-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="sg-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="sg-user">
				<div class="sg-avatar">U</div>
				<div class="sg-user-info">
					<div class="sg-user-name">USER</div>
					<div class="sg-user-role">ADMIN</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sg-body">
			<!-- 顶栏 -->
			<header class="sg-topbar">
				<div class="sg-search">
					<span class="sg-search-icon">🔍</span>
					<input placeholder="搜索漫画、章节、标签…" />
					<span class="sg-search-kbd">CTRL+K</span>
				</div>
				<div class="sg-top-actions">
					<button class="sg-btn-ghost">视图</button>
					<button class="sg-btn-ghost">排序 ↓</button>
					<button class="sg-btn-ghost">🌙</button>
					<button class="sg-btn-ghost">中文</button>
					<button class="sg-btn-primary">+ 新建媒体库</button>
				</div>
			</header>

			<main class="sg-main">
				<!-- 统计 -->
				<section class="sg-stats">
					<div class="sg-stat-card">
						<div class="sg-stat-icon">📚</div>
						<div class="sg-stat-info">
							<div class="sg-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
							<div class="sg-stat-label">漫画总数</div>
						</div>
						<div class="sg-stat-trend up">+24</div>
					</div>
					<div class="sg-stat-card">
						<div class="sg-stat-icon">📖</div>
						<div class="sg-stat-info">
							<div class="sg-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
							<div class="sg-stat-label">章节总数</div>
						</div>
						<div class="sg-stat-trend up">+1.2k</div>
					</div>
					<div class="sg-stat-card">
						<div class="sg-stat-icon">🔥</div>
						<div class="sg-stat-info">
							<div class="sg-stat-value">{{ stats.readToday }}</div>
							<div class="sg-stat-label">今日阅读</div>
						</div>
						<div class="sg-stat-trend">章</div>
					</div>
					<div class="sg-stat-card">
						<div class="sg-stat-icon">⭐</div>
						<div class="sg-stat-info">
							<div class="sg-stat-value">{{ stats.readThisWeek }}</div>
							<div class="sg-stat-label">本周阅读</div>
						</div>
						<div class="sg-stat-trend">章</div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sg-section">
					<div class="sg-section-head">
						<h2>继续阅读</h2>
						<a class="sg-link">查看全部 →</a>
					</div>
					<div class="sg-continue">
						<div v-for="m in continueReading" :key="m.id" class="sg-cont-card">
							<div class="sg-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sg-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sg-cont-unread">{{ m.unread }}</span>
							</div>
							<div class="sg-cont-info">
								<div class="sg-cont-name">{{ m.name }}</div>
								<div class="sg-cont-chapter">{{ m.chapter }}</div>
								<div class="sg-cont-progress">
									<div class="sg-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sg-section">
					<div class="sg-section-head">
						<h2>最近添加</h2>
						<a class="sg-link">查看全部 →</a>
					</div>
					<div class="sg-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sg-grid-card">
							<div class="sg-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sg-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="sg-grid-name">{{ m.name }}</div>
							<div class="sg-grid-meta">{{ m.chapter }}</div>
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
.style-g {
	display: flex;
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
	color: #e94560;
	font-size: 14px;
	font-family: 'Courier New', monospace;
	position: relative;
	overflow: hidden;
}

.style-g::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: 
		repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(233, 69, 96, 0.03) 2px,
			rgba(233, 69, 96, 0.03) 4px
		);
	pointer-events: none;
}

/* 侧边栏 */
.sg-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: rgba(15, 15, 35, 0.8);
	backdrop-filter: blur(10px);
	border-right: 1px solid #e94560;
	display: flex;
	flex-direction: column;
	position: relative;
}

.sg-sidebar::before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	width: 1px;
	height: 100%;
	background: linear-gradient(to bottom, transparent, #e94560, transparent);
}

.sg-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
}

.sg-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e94560;
	color: #0f0f23;
	font-weight: 800;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
	font-size: 16px;
	box-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.sg-logo-text {
	font-size: 16px;
	font-weight: 800;
	letter-spacing: 2px;
	color: #e94560;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: #0f3460;
	text-transform: uppercase;
	letter-spacing: 0.2em;
}

.sg-nav {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.sg-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: #0f3460;
	border-left: 2px solid transparent;
	cursor: pointer;
	transition: all 0.2s;
	font-family: 'Courier New', monospace;
	font-weight: 600;
}

.sg-nav-item:hover {
	color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	border-left: 2px solid #e94560;
}

.sg-nav-item.active {
	color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	border-left: 2px solid #e94560;
}

.sg-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.sg-nav-count {
	margin-left: auto;
	padding: 2px 8px;
	font-size: 11px;
	color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	border: 1px solid #e94560;
	border-radius: 2px;
}

.sg-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #0f3460;
}

.sg-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e94560;
	color: #0f0f23;
	font-weight: 800;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
	box-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.sg-user-name {
	font-weight: 600;
	font-size: 13px;
	color: #e94560;
}

.sg-user-role {
	font-size: 11px;
	color: #0f3460;
	font-family: 'Courier New', monospace;
}

/* 顶栏 */
.sg-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sg-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: rgba(15, 15, 35, 0.8);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #e94560;
	position: relative;
}

.sg-topbar::before {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(to right, transparent, #e94560, transparent);
}

.sg-search {
	flex: 1;
	max-width: 560px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	background: rgba(15, 15, 35, 0.5);
	border: 1px solid #e94560;
	border-radius: 2px;
}

.sg-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #e94560;
	font-family: 'Courier New', monospace;
}

.sg-search input::placeholder {
	color: #0f3460;
}

.sg-search-icon {
	color: #e94560;
	font-size: 13px;
}

.sg-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	border: 1px solid #e94560;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
}

.sg-top-actions {
	display: flex;
	gap: 8px;
}

.sg-btn-ghost {
	padding: 8px 14px;
	font-size: 13px;
	color: #0f3460;
	background: rgba(15, 15, 35, 0.5);
	border: 1px solid #0f3460;
	border-radius: 2px;
	cursor: pointer;
	transition: all 0.2s;
	font-family: 'Courier New', monospace;
	font-weight: 600;
}

.sg-btn-ghost:hover {
	color: #e94560;
	border-color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	box-shadow: 0 0 10px rgba(233, 69, 96, 0.3);
}

.sg-btn-primary {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 600;
	color: #0f0f23;
	background: #e94560;
	border: none;
	border-radius: 2px;
	cursor: pointer;
	transition: all 0.2s;
	font-family: 'Courier New', monospace;
	box-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.sg-btn-primary:hover {
	background: #ff6b81;
	box-shadow: 0 0 15px rgba(233, 69, 96, 0.7);
}

/* 主区 */
.sg-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}

.sg-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.sg-stat-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 18px 20px;
	background: rgba(15, 15, 35, 0.5);
	border: 1px solid #e94560;
	border-radius: 2px;
	position: relative;
	transition: all 0.2s;
}

.sg-stat-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(45deg, transparent, rgba(233, 69, 96, 0.1), transparent);
	opacity: 0;
	transition: opacity 0.2s;
}

.sg-stat-card:hover::before {
	opacity: 1;
}

.sg-stat-icon {
	font-size: 20px;
	color: #e94560;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-stat-info {
	flex: 1;
}

.sg-stat-value {
	font-size: 20px;
	font-weight: 800;
	color: #e94560;
	font-family: 'Courier New', monospace;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-stat-label {
	font-size: 12px;
	color: #0f3460;
	font-family: 'Courier New', monospace;
	font-weight: 600;
	margin-top: 2px;
}

.sg-stat-trend {
	padding: 2px 8px;
	font-size: 11px;
	color: #e94560;
	background: rgba(233, 69, 96, 0.1);
	border: 1px solid #e94560;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
}

.sg-stat-trend.up {
	color: #38ef7d;
	border-color: #38ef7d;
	background: rgba(56, 239, 125, 0.1);
}

.sg-section {
	margin-bottom: 32px;
}

.sg-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sg-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 800;
	color: #e94560;
	font-family: 'Courier New', monospace;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

.sg-link {
	font-size: 13px;
	color: #e94560;
	cursor: pointer;
	font-family: 'Courier New', monospace;
	font-weight: 600;
	text-decoration: underline;
	text-decoration-style: dotted;
}

.sg-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sg-cont-card {
	display: flex;
	gap: 12px;
	padding: 14px;
	background: rgba(15, 15, 35, 0.5);
	border: 1px solid #e94560;
	border-radius: 2px;
	cursor: pointer;
	transition: all 0.2s;
	position: relative;
}

.sg-cont-card:hover {
	border-color: #ff6b81;
	box-shadow: 0 0 15px rgba(233, 69, 96, 0.3);
}

.sg-cont-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(45deg, transparent, rgba(233, 69, 96, 0.1), transparent);
	opacity: 0;
	transition: opacity 0.2s;
}

.sg-cont-card:hover::before {
	opacity: 1;
}

.sg-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 2px;
	overflow: hidden;
	border: 1px solid #e94560;
}

.sg-cont-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 600;
	color: #0f0f23;
	background: #e94560;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
	box-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #0f0f23;
	background: #e94560;
	border-radius: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: 'Courier New', monospace;
	box-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sg-cont-name {
	font-size: 14px;
	font-weight: 800;
	color: #e94560;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-family: 'Courier New', monospace;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-cont-chapter {
	font-size: 12px;
	color: #0f3460;
	font-family: 'Courier New', monospace;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sg-cont-progress {
	height: 4px;
	background: rgba(15, 15, 35, 0.8);
	border: 1px solid #0f3460;
	border-radius: 2px;
	overflow: hidden;
}

.sg-cont-progress-bar {
	height: 100%;
	background: #e94560;
	box-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sg-grid-card {
	cursor: pointer;
	transition: all 0.2s;
}

.sg-grid-card:hover {
	transform: translateY(-2px);
}

.sg-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 2px;
	margin-bottom: 8px;
	border: 1px solid #e94560;
	overflow: hidden;
}

.sg-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #0f0f23;
	background: #e94560;
	border-radius: 2px;
	font-family: 'Courier New', monospace;
	box-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-grid-name {
	font-size: 13px;
	font-weight: 800;
	color: #e94560;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-family: 'Courier New', monospace;
	text-shadow: 0 0 5px rgba(233, 69, 96, 0.5);
}

.sg-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #0f3460;
	font-family: 'Courier New', monospace;
}
</style>