<template>
	<div class="style-d" :style="themeVars">
		<!-- 侧边栏 -->
		<aside class="sd-sidebar">
			<div class="sd-logo">
				<div class="sd-logo-mark">s</div>
				<div class="sd-logo-text">smanga</div>
			</div>

			<!-- 主题切换 -->
			<div class="sd-theme-switcher">
				<div class="sd-theme-label">主题色</div>
				<div class="sd-theme-options">
					<button v-for="t in themeList" :key="t.key"
						:class="['sd-theme-swatch', { active: currentTheme === t.key }]"
						:style="{ background: t.primary }" :title="t.name" @click="currentTheme = t.key"></button>
				</div>
			</div>

			<nav class="sd-nav">
				<div v-for="(item, i) in menu" :key="item.key" :class="['sd-nav-item', { active: i === 0 }]">
					<span class="sd-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div class="sd-sec-title">媒体库</div>
			<nav class="sd-nav">
				<div v-for="m in mediaList" :key="m.id" class="sd-nav-item">
					<span class="sd-nav-icon">{{ m.icon }}</span>
					<span>{{ m.name }}</span>
					<span class="sd-nav-count">{{ m.count }}</span>
				</div>
			</nav>

			<div class="sd-user">
				<div class="sd-avatar">U</div>
				<div>
					<div class="sd-user-name">User</div>
					<div class="sd-user-role">管理员</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sd-body">
			<header class="sd-topbar">
				<div class="sd-search">
					<span>🔍</span>
					<input placeholder="搜索漫画、章节、标签…" />
				</div>
				<div class="sd-top-actions">
					<button class="sd-btn">视图</button>
					<button class="sd-btn">排序</button>
					<button class="sd-btn">🌙</button>
					<button class="sd-btn">中文</button>
					<button class="sd-btn-primary">+ 新建</button>
				</div>
			</header>

			<main class="sd-main">
				<section class="sd-stats">
					<div class="sd-stat-card">
						<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📚</div>
						<div class="sd-stat-info">
							<div class="sd-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
							<div class="sd-stat-label">漫画总数</div>
						</div>
					</div>
					<div class="sd-stat-card">
						<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📖</div>
						<div class="sd-stat-info">
							<div class="sd-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
							<div class="sd-stat-label">章节总数</div>
						</div>
					</div>
					<div class="sd-stat-card">
						<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">🔥</div>
						<div class="sd-stat-info">
							<div class="sd-stat-value">{{ stats.readToday }}</div>
							<div class="sd-stat-label">今日阅读</div>
						</div>
					</div>
					<div class="sd-stat-card">
						<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">⭐</div>
						<div class="sd-stat-info">
							<div class="sd-stat-value">{{ stats.readThisWeek }}</div>
							<div class="sd-stat-label">本周阅读</div>
						</div>
					</div>
				</section>

				<section class="sd-section">
					<div class="sd-section-head">
						<h2>继续阅读</h2>
						<a class="sd-link">查看全部 →</a>
					</div>
					<div class="sd-continue">
						<div v-for="m in continueReading" :key="m.id" class="sd-cont-card">
							<div class="sd-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sd-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sd-cont-unread">{{ m.unread }}</span>
							</div>
							<div class="sd-cont-info">
								<div class="sd-cont-name">{{ m.name }}</div>
								<div class="sd-cont-chapter">{{ m.chapter }}</div>
								<div class="sd-cont-progress">
									<div class="sd-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section class="sd-section">
					<div class="sd-section-head">
						<h2>最近添加</h2>
						<a class="sd-link">查看全部 →</a>
					</div>
					<div class="sd-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sd-grid-card">
							<div class="sd-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sd-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="sd-grid-name">{{ m.name }}</div>
							<div class="sd-grid-meta">{{ m.chapter }}</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { sidebarMenu as menu, mediaList, continueReading, recentAdded, stats } from '../mock';

// 改造思路：9 套主题的 s-back 不再是大色块，而是 50 号浅色
const themeList = [
	{ key: 'blue', name: '蓝', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', name: '粉', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', name: '绿', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', name: '紫', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'red', name: '红', primary: '#DC2626', back: '#FEF2F2', hover: '#FEE2E2' },
	{ key: 'cyan', name: '青', primary: '#0891B2', back: '#ECFEFF', hover: '#CFFAFE' },
	{ key: 'orange', name: '橙', primary: '#EA580C', back: '#FFF7ED', hover: '#FFEDD5' },
	{ key: 'grey', name: '灰', primary: '#475569', back: '#F8FAFC', hover: '#F1F5F9' },
	{ key: 'dark', name: '暗', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
];

const currentTheme = ref('blue');
const theme = computed(() => themeList.find((t) => t.key === currentTheme.value)!);
const isDark = computed(() => currentTheme.value === 'dark');

const themeVars = computed(() => {
	const t = theme.value;
	return {
		'--sd-primary': t.primary,
		'--sd-primary-bg': `${t.primary}1a`, // 主色 10% alpha
		'--sd-back': t.back,
		'--sd-card': isDark.value ? '#161A20' : '#FFFFFF',
		'--sd-border': isDark.value ? '#2A313C' : '#E5E7EB',
		'--sd-text': isDark.value ? '#E6E8EB' : '#0F172A',
		'--sd-text-muted': isDark.value ? '#9AA3AE' : '#64748B',
		'--sd-text-faint': isDark.value ? '#5C6470' : '#94A3B8',
		'--sd-hover': t.hover,
	} as any;
});
</script>

<style scoped>
.style-d {
	display: flex;
	min-height: calc(100vh - 65px);
	background: var(--sd-back);
	color: var(--sd-text);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sd-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: var(--sd-card);
	border-right: 1px solid var(--sd-border);
	display: flex;
	flex-direction: column;
}

.sd-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 18px;
}

.sd-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary);
	color: #fff;
	font-weight: 800;
	border-radius: 8px;
}

.sd-logo-text {
	font-size: 16px;
	font-weight: 700;
}

.sd-theme-switcher {
	padding: 10px 8px 14px;
	margin-bottom: 10px;
	border-bottom: 1px dashed var(--sd-border);
}

.sd-theme-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--sd-text-muted);
	margin-bottom: 8px;
}

.sd-theme-options {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.sd-theme-swatch {
	width: 22px;
	height: 22px;
	border: 2px solid var(--sd-card);
	outline: 1px solid var(--sd-border);
	border-radius: 50%;
	cursor: pointer;
	transition: transform 0.15s;
}

.sd-theme-swatch:hover {
	transform: scale(1.15);
}

.sd-theme-swatch.active {
	outline: 2px solid var(--sd-primary);
	transform: scale(1.1);
}

.sd-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sd-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 10px;
	color: var(--sd-text-muted);
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.15s;
}

.sd-nav-item:hover {
	background: var(--sd-hover);
	color: var(--sd-text);
}

.sd-nav-item.active {
	background: var(--sd-primary-bg);
	color: var(--sd-primary);
	font-weight: 600;
}

.sd-nav-icon {
	width: 18px;
	text-align: center;
}

.sd-nav-count {
	margin-left: auto;
	font-size: 11px;
	color: var(--sd-text-faint);
}

.sd-sec-title {
	padding: 14px 10px 6px;
	font-size: 11px;
	font-weight: 600;
	color: var(--sd-text-faint);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.sd-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid var(--sd-border);
}

.sd-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--sd-primary);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
}

.sd-user-name {
	font-weight: 500;
	font-size: 13px;
}

.sd-user-role {
	font-size: 11px;
	color: var(--sd-text-faint);
}

.sd-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sd-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: var(--sd-back);
	border-bottom: 1px solid var(--sd-border);
}

.sd-search {
	flex: 1;
	max-width: 520px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 10px;
}

.sd-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: var(--sd-text);
}

.sd-search input::placeholder {
	color: var(--sd-text-faint);
}

.sd-top-actions {
	display: flex;
	gap: 6px;
}

.sd-btn {
	padding: 7px 12px;
	font-size: 13px;
	color: var(--sd-text-muted);
	background: transparent;
	border: 1px solid var(--sd-border);
	border-radius: 8px;
	cursor: pointer;
}

.sd-btn:hover {
	background: var(--sd-hover);
	color: var(--sd-text);
}

.sd-btn-primary {
	padding: 7px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: var(--sd-primary);
	border: none;
	border-radius: 8px;
	cursor: pointer;
}

.sd-btn-primary:hover {
	filter: brightness(1.1);
}

.sd-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}

.sd-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14px;
	margin-bottom: 28px;
}

.sd-stat-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 16px 18px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.sd-stat-icon {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	border-radius: 10px;
}

.sd-stat-value {
	font-size: 20px;
	font-weight: 700;
}

.sd-stat-label {
	font-size: 12px;
	color: var(--sd-text-muted);
	margin-top: 2px;
}

.sd-section {
	margin-bottom: 28px;
}

.sd-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sd-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.sd-link {
	font-size: 13px;
	color: var(--sd-primary);
	cursor: pointer;
	font-weight: 500;
}

.sd-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sd-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-cont-card:hover {
	border-color: var(--sd-primary);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sd-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 8px;
	overflow: hidden;
}

.sd-cont-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 4px;
}

.sd-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sd-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sd-cont-name {
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-cont-chapter {
	font-size: 12px;
	color: var(--sd-text-muted);
}

.sd-cont-progress {
	height: 4px;
	background: var(--sd-hover);
	border-radius: 2px;
	overflow: hidden;
}

.sd-cont-progress-bar {
	height: 100%;
	background: var(--sd-primary);
	border-radius: 2px;
}

.sd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sd-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sd-grid-card:hover {
	transform: translateY(-2px);
}

.sd-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 10px;
	margin-bottom: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.sd-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 4px;
}

.sd-grid-name {
	font-size: 13px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: var(--sd-text-faint);
}
</style>
