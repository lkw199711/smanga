<template>
	<div class="style-d">
		<!-- 侧边栏 -->
		<aside class="sd-sidebar">
			<div class="sd-logo">
				<span class="sd-logo-text">SMANGA</span>
				<span class="sd-logo-beta">β</span>
			</div>

			<nav class="sd-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sd-nav-item', { active: i === 0 }]">
					<span class="sd-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sd-sec">
				<div class="sd-sec-title">LIBRARIES</div>
				<div v-for="m in mediaList" :key="m.id" class="sd-sec-item">
					<span>{{ m.icon }} {{ m.name }}</span>
					<span class="sd-sec-count">{{ m.count }}</span>
				</div>
			</div>

			<div class="sd-footer">
				<div class="sd-footer-user">
					<div class="sd-footer-avatar">U</div>
					<div class="sd-footer-info">
						<div class="sd-footer-name">USER</div>
						<div class="sd-footer-role">ADMIN</div>
					</div>
				</div>
				<div class="sd-footer-actions">
					<button class="sd-footer-btn">⚙️</button>
					<button class="sd-footer-btn">🚪</button>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sd-body">
			<!-- 顶栏 -->
			<header class="sd-topbar">
				<div class="sd-topbar-left">
					<div class="sd-status">
						<span class="sd-status-dot"></span>
						<span class="sd-status-text">ONLINE</span>
					</div>
					<div class="sd-stats">
						<div class="sd-stat-item">
							<span class="sd-stat-label">TODAY</span>
							<span class="sd-stat-value">{{ statsData.readToday || 47 }} CH</span>
						</div>
						<div class="sd-stat-item">
							<span class="sd-stat-label">WEEKLY</span>
							<span class="sd-stat-value">{{ statsData.readThisWeek || 312 }} CH</span>
						</div>
						<div class="sd-stat-item">
							<span class="sd-stat-label">TOTAL</span>
							<span class="sd-stat-value">{{ statsData.mangaCount.toLocaleString() || 0 }} MG</span>
						</div>
					</div>
				</div>
				<div class="sd-topbar-right">
					<div class="sd-search">
						<span class="sd-search-icon">🔍</span>
						<input placeholder="Enter search query..." />
						<div class="sd-search-kbd">Ctrl+K</div>
					</div>
					<button class="sd-btn-primary">+ NEW LIBRARY</button>
				</div>
			</header>

			<main class="sd-main">
				<!-- 欢迎区域 -->
				<section class="sd-welcome">
					<div class="sd-welcome-text">
						<div class="sd-welcome-greeting">WELCOME BACK, USER</div>
						<div class="sd-welcome-title">READY TO DIVE IN?</div>
						<div class="sd-welcome-sub">Continue your reading journey or discover something new</div>
					</div>
					<div class="sd-welcome-actions">
						<button class="sd-btn-outline">VIEW HISTORY</button>
						<button class="sd-btn-glow">EXPLORE NOW</button>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sd-section">
					<div class="sd-section-header">
						<div class="sd-section-title">CONTINUE READING</div>
						<div class="sd-section-desc">Pick up where you left off</div>
					</div>
					<div class="sd-continue">
						<div v-for="item in historyList" :key="item.chapterId" class="sd-cont-card" @click="goRead(item)">
							<div class="sd-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${getGradient(item.chapterId)[0]}, ${getGradient(item.chapterId)[1]})` }">
								<span v-if="item.tag" class="sd-cont-tag">{{ item.tag }}</span>
								<span v-if="item.unread" class="sd-cont-unread">{{ item.unread }}</span>
								<div class="sd-cont-progress">
									<div class="sd-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
								</div>
							</div>
							<div class="sd-cont-info">
								<div class="sd-cont-title">{{ item.mangaName || 'UNKNOWN MANGA' }}</div>
								<div class="sd-cont-sub">CHAPTER {{ item.chapterName || 'UNKNOWN' }}</div>
								<div class="sd-cont-meta">
									<span>{{ getProgress(item) }}% COMPLETE</span>
									<span class="sd-cont-time">2H AGO</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sd-section">
					<div class="sd-section-header">
						<div class="sd-section-title">RECENTLY ADDED</div>
						<div class="sd-section-desc">Fresh content for your collection</div>
					</div>
					<div class="sd-grid">
						<div v-for="item in latestList" :key="item.mangaId" class="sd-grid-card" @click="goManga(item)">
							<div class="sd-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${getGradient(item.mangaId)[0]}, ${getGradient(item.mangaId)[1]})` }">
								<span v-if="item.tag" class="sd-grid-tag">{{ item.tag }}</span>
								<div class="sd-grid-overlay">
									<button class="sd-grid-btn">READ</button>
									<button class="sd-grid-btn secondary">QUEUE</button>
								</div>
							</div>
							<div class="sd-grid-info">
								<div class="sd-grid-title">{{ item.mangaName }}</div>
								<div class="sd-grid-meta">{{ item.chapterCount || 0 }} CHAPTERS</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'

const router = useRouter()

const statsData = ref({ mangaCount: 0, chapterCount: 0, readToday: 47, readThisWeek: 312 })
const historyList = ref<any[]>([])
const latestList = ref<any[]>([])

// Mock数据
const menu = [
	{ key: 'home', label: 'HOME', icon: '🏠' },
	{ key: 'history', label: 'HISTORY', icon: '🕘' },
	{ key: 'bookmark', label: 'BOOKMARKS', icon: '🔖' },
	{ key: 'collect', label: 'COLLECTION', icon: '⭐' },
	{ key: 'search', label: 'SEARCH', icon: '🔍' },
	{ key: 'tag', label: 'TAGS', icon: '🏷️' },
	{ key: 'manage', label: 'MANAGE', icon: '⚙️' },
	{ key: 'setting', label: 'SETTINGS', icon: '🔧' },
]

const mediaList = [
	{ id: 1, name: 'SHOUNEN', icon: '📚', count: 128 },
	{ id: 2, name: 'SHOUJO', icon: '🌸', count: 64 },
	{ id: 3, name: 'SEINEN', icon: '📖', count: 96 },
	{ id: 4, name: 'DOUJIN', icon: '🎨', count: 32 },
]

// 渐变色彩板
const palette = [
	['#00F5A0', '#00D9F5'],
	['#FF4D94', '#FF9068'],
	['#A0E8E8', '#7B68EE'],
	['#FFB74D', '#FF5252'],
	['#64B5F6', '#1976D2'],
	['#BA68C8', '#9C27B0'],
	['#4FC3F7', '#0288D1'],
	['#81C784', '#388E3C'],
	['#FFD54F', '#F57C00'],
	['#9575CD', '#673AB7'],
	['#4DB6AC', '#00796B'],
	['#FF8A65', '#D84315'],
]

onMounted(async () => {
	try {
		const [statsRes, historyRes, latestRes] = await Promise.allSettled([
			chartsApi.get_count(),
			historyApi.get(1, 6),
			latestApi.get(1, 12),
		])
		if (statsRes.status === 'fulfilled') {
			statsData.value = {
				...statsData.value,
				...(statsRes.value || {})
			}
		}
		if (historyRes.status === 'fulfilled') historyList.value = historyRes.value?.list || []
		if (latestRes.status === 'fulfilled') latestList.value = latestRes.value?.list || []
	} catch (e) {
		// fallback
	}
})

function getGradient(id: number) {
	return palette[id % palette.length]
}

function getProgress(item: any) {
	if (!item.page || !item.pageCount) return 0
	return Math.round((item.page / item.pageCount) * 100)
}

function goRead(item: any) {
	router.push({ path: '/browse-view/flow', query: { chapterId: item.chapterId } })
}

function goManga(item: any) {
	router.push({ path: '/chapter-list', query: { mangaId: item.mangaId } })
}
</script>

<style scoped>
.style-d {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #0a0e1a;
	color: #e2e8f0;
	font-size: 14px;
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 侧边栏 */
.sd-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 16px;
	background: rgba(15, 23, 42, 0.8);
	backdrop-filter: blur(10px);
	border-right: 1px solid rgba(255, 255, 255, 0.08);
	display: flex;
	flex-direction: column;
}

.sd-logo {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 0 24px;
}

.sd-logo-text {
	font-size: 18px;
	font-weight: 900;
	letter-spacing: 1px;
	background: linear-gradient(90deg, #00F5A0, #00D9F5);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.sd-logo-beta {
	font-size: 12px;
	font-weight: 700;
	color: #00F5A0;
	background: rgba(0, 245, 160, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.sd-nav {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-bottom: 24px;
}

.sd-nav-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 14px;
	color: #94a3b8;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-weight: 500;
}

.sd-nav-item:hover {
	background: rgba(255, 255, 255, 0.05);
	color: #e2e8f0;
}

.sd-nav-item.active {
	background: rgba(0, 245, 160, 0.1);
	color: #00F5A0;
	box-shadow: 0 0 20px rgba(0, 245, 160, 0.2);
}

.sd-nav-icon {
	font-size: 16px;
}

.sd-sec {
	margin-bottom: 24px;
}

.sd-sec-title {
	padding: 8px 14px 6px;
	font-size: 11px;
	font-weight: 700;
	color: #64748b;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.sd-sec-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 14px;
	font-size: 13px;
	color: #94a3b8;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sd-sec-item:hover {
	background: rgba(255, 255, 255, 0.05);
	color: #e2e8f0;
}

.sd-sec-count {
	font-size: 11px;
	color: #64748b;
	background: rgba(100, 116, 139, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.sd-footer {
	margin-top: auto;
	padding-top: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sd-footer-user {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
}

.sd-footer-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #00F5A0, #00D9F5);
	color: #0a0e1a;
	font-weight: 700;
	border-radius: 50%;
}

.sd-footer-info {
	flex: 1;
}

.sd-footer-name {
	font-size: 13px;
	font-weight: 600;
	color: #e2e8f0;
}

.sd-footer-role {
	font-size: 11px;
	color: #64748b;
}

.sd-footer-actions {
	display: flex;
	gap: 8px;
}

.sd-footer-btn {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	color: #94a3b8;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sd-footer-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	color: #e2e8f0;
}

/* 顶栏 */
.sd-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sd-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sd-topbar-left {
	display: flex;
	align-items: center;
	gap: 24px;
}

.sd-status {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sd-status-dot {
	width: 8px;
	height: 8px;
	background: #00F5A0;
	border-radius: 50%;
	box-shadow: 0 0 8px #00F5A0;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% { box-shadow: 0 0 0 0 rgba(0, 245, 160, 0.7); }
	70% { box-shadow: 0 0 0 10px rgba(0, 245, 160, 0); }
	100% { box-shadow: 0 0 0 0 rgba(0, 245, 160, 0); }
}

.sd-status-text {
	font-size: 12px;
	font-weight: 600;
	color: #00F5A0;
}

.sd-stats {
	display: flex;
	gap: 24px;
}

.sd-stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.sd-stat-label {
	font-size: 10px;
	font-weight: 700;
	color: #64748b;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.sd-stat-value {
	font-size: 16px;
	font-weight: 700;
	color: #e2e8f0;
}

.sd-topbar-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.sd-search {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 14px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	width: 320px;
}

.sd-search-icon {
	color: #64748b;
	font-size: 14px;
}

.sd-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	color: #e2e8f0;
	font-size: 13px;
}

.sd-search input::placeholder {
	color: #64748b;
}

.sd-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #64748b;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
}

.sd-btn-primary {
	padding: 8px 16px;
	background: linear-gradient(90deg, #00F5A0, #00D9F5);
	color: #0a0e1a;
	font-size: 13px;
	font-weight: 700;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 4px 16px rgba(0, 245, 160, 0.2);
}

.sd-btn-primary:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 20px rgba(0, 245, 160, 0.3);
}

/* 主区 */
.sd-main {
	flex: 1;
	padding: 24px;
	overflow: auto;
}

.sd-welcome {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32px 36px;
	margin-bottom: 32px;
	background: linear-gradient(135deg, rgba(0, 245, 160, 0.1), rgba(0, 217, 245, 0.1));
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 12px;
}

.sd-welcome-text {
	flex: 1;
}

.sd-welcome-greeting {
	font-size: 12px;
	font-weight: 700;
	color: #00F5A0;
	letter-spacing: 0.15em;
	margin-bottom: 8px;
}

.sd-welcome-title {
	font-size: 28px;
	font-weight: 900;
	color: #e2e8f0;
	margin-bottom: 8px;
}

.sd-welcome-sub {
	font-size: 14px;
	color: #94a3b8;
}

.sd-welcome-actions {
	display: flex;
	gap: 12px;
}

.sd-btn-outline {
	padding: 10px 20px;
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	color: #e2e8f0;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sd-btn-outline:hover {
	border-color: rgba(255, 255, 255, 0.3);
}

.sd-btn-glow {
	padding: 10px 20px;
	background: linear-gradient(90deg, #00F5A0, #00D9F5);
	color: #0a0e1a;
	font-size: 13px;
	font-weight: 700;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 20px rgba(0, 245, 160, 0.4);
}

.sd-btn-glow:hover {
	transform: translateY(-1px);
	box-shadow: 0 0 30px rgba(0, 245, 160, 0.6);
}

.sd-section {
	margin-bottom: 32px;
}

.sd-section-header {
	margin-bottom: 20px;
}

.sd-section-title {
	font-size: 18px;
	font-weight: 700;
	color: #e2e8f0;
	margin-bottom: 4px;
}

.sd-section-desc {
	font-size: 14px;
	color: #64748b;
}

.sd-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 16px;
}

.sd-cont-card {
	display: flex;
	gap: 16px;
	padding: 16px;
	background: rgba(15, 23, 42, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sd-cont-card:hover {
	border-color: rgba(0, 245, 160, 0.3);
	box-shadow: 0 0 20px rgba(0, 245, 160, 0.1);
	transform: translateY(-2px);
}

.sd-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 80px;
	height: 112px;
	border-radius: 6px;
	overflow: hidden;
}

.sd-cont-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 700;
	color: #0a0e1a;
	background: #00F5A0;
	border-radius: 3px;
}

.sd-cont-unread {
	position: absolute;
	top: 8px;
	right: 8px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 10px;
	font-weight: 700;
	color: #0a0e1a;
	background: #00D9F5;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sd-cont-progress {
	position: absolute;
	left: 8px;
	right: 8px;
	bottom: 8px;
	height: 3px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
	overflow: hidden;
}

.sd-cont-progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #00F5A0, #00D9F5);
	border-radius: 2px;
}

.sd-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 0;
}

.sd-cont-title {
	font-size: 16px;
	font-weight: 700;
	color: #e2e8f0;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-cont-sub {
	font-size: 13px;
	color: #94a3b8;
	margin-bottom: 8px;
}

.sd-cont-meta {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: #64748b;
}

.sd-cont-time {
	color: #00F5A0;
}

.sd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 16px;
}

.sd-grid-card {
	cursor: pointer;
}

.sd-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 6px;
	margin-bottom: 12px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
	transition: all 0.2s ease;
}

.sd-grid-card:hover .sd-grid-cover {
	border-color: rgba(0, 245, 160, 0.3);
	box-shadow: 0 0 20px rgba(0, 245, 160, 0.2);
}

.sd-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 8px;
	font-size: 10px;
	font-weight: 700;
	color: #0a0e1a;
	background: #00F5A0;
	border-radius: 3px;
}

.sd-grid-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 8px;
	background: rgba(10, 14, 26, 0.8);
	opacity: 0;
	transition: opacity 0.2s ease;
}

.sd-grid-card:hover .sd-grid-overlay {
	opacity: 1;
}

.sd-grid-btn {
	padding: 6px 12px;
	background: rgba(0, 245, 160, 0.2);
	border: 1px solid #00F5A0;
	border-radius: 4px;
	color: #00F5A0;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.sd-grid-btn:hover {
	background: rgba(0, 245, 160, 0.3);
}

.sd-grid-btn.secondary {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.2);
	color: #e2e8f0;
}

.sd-grid-btn.secondary:hover {
	background: rgba(255, 255, 255, 0.2);
}

.sd-grid-info {
	text-align: center;
}

.sd-grid-title {
	font-size: 14px;
	font-weight: 600;
	color: #e2e8f0;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-grid-meta {
	font-size: 12px;
	color: #64748b;
}
</style>