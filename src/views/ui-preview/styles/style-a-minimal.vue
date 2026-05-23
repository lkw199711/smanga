<template>
	<div class="style-a">
		<!-- 侧边栏 -->
		<aside class="sa-sidebar">
			<div class="sa-logo">
				<div class="sa-logo-mark">S</div>
				<div class="sa-logo-text">smanga</div>
			</div>

			<div class="sa-sec-title">{{ currentMenuTitle }}</div>
			<nav class="sa-nav">
				<div
					v-for="item in currentMenu"
					:key="item.key"
					:class="['sa-nav-item', { active: isMenuActive(item), back: item.key === 'back-browse' }]"
					@click="navigateMenu(item)"
				>
					<span class="sa-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<template v-if="menuMode === 'browse'">
				<div class="sa-sec-title">媒体库</div>
				<nav class="sa-nav">
					<div v-for="m in mediaList" :key="m.id" class="sa-nav-item" @click="emit('navigate', { page: 'manga-list', params: { mediaId: m.id } })">
						<span class="sa-nav-icon">{{ m.icon }}</span>
						<span>{{ m.name }}</span>
						<span class="sa-nav-count">{{ m.count }}</span>
					</div>
				</nav>
			</template>

			<div class="sa-user">
				<div class="sa-avatar">U</div>
				<div class="sa-user-info">
					<div class="sa-user-name">User</div>
					<div class="sa-user-role">管理员</div>
				</div>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sa-body">
			<!-- 顶栏 -->
			<header class="sa-topbar">
				<form class="sa-search" @submit.prevent="submitSearch">
					<span class="sa-search-icon">🔍</span>
					<input v-model="keyword" placeholder="搜索漫画、章节、标签…" />
					<span class="sa-search-kbd">Ctrl K</span>
				</form>
				<div class="sa-top-actions">
					<button class="sa-btn-ghost">视图</button>
					<button class="sa-btn-ghost">排序 ↓</button>
					<button class="sa-btn-ghost">🌙</button>
					<button class="sa-btn-ghost">中文</button>
					<button class="sa-btn-primary">+ 新建媒体库</button>
				</div>
			</header>

			<main class="sa-main">
				<template v-if="activePage === 'home'">
				<!-- 统计 -->
				<section class="sa-stats">
					<div class="sa-stat-card">
						<div class="sa-stat-label">漫画总数</div>
						<div class="sa-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
						<div class="sa-stat-delta up">+24 本周</div>
					</div>
					<div class="sa-stat-card">
						<div class="sa-stat-label">章节总数</div>
						<div class="sa-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
						<div class="sa-stat-delta up">+1.2k 本周</div>
					</div>
					<div class="sa-stat-card">
						<div class="sa-stat-label">今日阅读</div>
						<div class="sa-stat-value">{{ stats.readToday }}</div>
						<div class="sa-stat-delta">章</div>
					</div>
					<div class="sa-stat-card">
						<div class="sa-stat-label">本周阅读</div>
						<div class="sa-stat-value">{{ stats.readThisWeek }}</div>
						<div class="sa-stat-delta">章</div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sa-section">
					<div class="sa-section-head">
						<h2>继续阅读</h2>
						<a class="sa-link">查看全部 →</a>
					</div>
					<div class="sa-continue">
						<div v-for="m in continueReading" :key="m.id" class="sa-cont-card" @click="emit('navigate', { page: 'reader', params: { mangaId: m.id, chapterId: m.id * 100 + 1 } })">
							<div class="sa-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sa-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sa-cont-unread">{{ m.unread }}</span>
							</div>
							<div class="sa-cont-info">
								<div class="sa-cont-name">{{ m.name }}</div>
								<div class="sa-cont-chapter">{{ m.chapter }}</div>
								<div class="sa-cont-progress">
									<div class="sa-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sa-section">
					<div class="sa-section-head">
						<h2>最近添加</h2>
						<a class="sa-link">查看全部 →</a>
					</div>
					<div class="sa-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sa-grid-card" @click="emit('navigate', { page: 'manga-info', params: { mangaId: m.id } })">
							<div class="sa-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sa-grid-tag">{{ m.tag }}</span>
							</div>
							<div class="sa-grid-name">{{ m.name }}</div>
							<div class="sa-grid-meta">{{ m.chapter }}</div>
						</div>
					</div>
				</section>
				</template>
				<component
					v-else
					:is="contentView"
					:page="activePage"
					:style-key="styleKey"
					:params="params"
					@navigate="forwardNavigate"
					@back="emit('back')"
				/>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { browseMenu, manageMenu, settingMenu, mediaList, continueReading, recentAdded, stats } from '../mock';
import type { PreviewNavItem } from '../mock';
import PreviewPageView from '../preview-page.vue';
import ManageA from '../manage/manage-a-minimal.vue';
import ManagePanel from '../manage/manage-panel.vue';
import SettingA from '../setting/setting-a-minimal.vue';

const props = defineProps<{
	page?: string;
	styleKey?: 'A' | 'B' | 'C' | 'D';
	params?: Record<string, any>;
}>();

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any>; replace?: boolean }];
	back: [];
}>();

const keyword = ref('');
const activePage = computed(() => props.page || 'home');
const styleKey = computed(() => props.styleKey || 'A');
const params = computed(() => props.params || {});
const menuMode = computed(() => {
	if (activePage.value === 'setting-user' || activePage.value === 'setting-serve') return 'setting';
	if (activePage.value === 'manage' || activePage.value.startsWith('manage-')) return 'manage';
	return 'browse';
});
const currentMenuTitle = computed(() => {
	if (menuMode.value === 'manage') return '管理';
	if (menuMode.value === 'setting') return '设置';
	return '导航';
});
const currentMenu = computed(() => {
	if (menuMode.value === 'manage') return manageMenu;
	if (menuMode.value === 'setting') return settingMenu;
	return browseMenu;
});
const contentView = computed(() => {
	if (activePage.value === 'manage-manga') return ManageA;
	if (activePage.value.startsWith('manage-')) return ManagePanel;
	if (activePage.value === 'setting-user') return SettingA;
	return PreviewPageView;
});

function navigateMenu(item: PreviewNavItem) {
	if (item.mode === 'browse') {
		emit('navigate', { page: 'browse-return', replace: true });
		return;
	}
	if (item.page) emit('navigate', { page: item.page });
}

function isMenuActive(item: PreviewNavItem) {
	if (item.key === 'back-browse') return false;
	if (item.page === 'media') {
		return ['media', 'manga-list', 'manga-info', 'chapter-list'].includes(activePage.value);
	}
	return item.page === activePage.value;
}

function submitSearch() {
	emit('navigate', { page: 'search', params: { keyword: keyword.value.trim() || '芙莉莲' } });
}

function forwardNavigate(payload: { page: string; params?: Record<string, any>; replace?: boolean }) {
	emit('navigate', payload);
}
</script>

<style scoped>
.style-a {
	display: flex;
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 侧边栏 */
.sa-sidebar {
	flex-shrink: 0;
	width: 240px;
	padding: 20px 12px;
	background: #ffffff;
	border-right: 1px solid #eaeaea;
	display: flex;
	flex-direction: column;
}

.sa-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
}

.sa-logo-mark {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #171717;
	color: #fff;
	font-weight: 700;
	border-radius: 8px;
}

.sa-logo-text {
	font-size: 16px;
	font-weight: 700;
}

.sa-sec-title {
	padding: 12px 8px 6px;
	font-size: 11px;
	font-weight: 600;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.sa-nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sa-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	color: #4b5563;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s;
}

.sa-nav-item:hover {
	background: #f3f4f6;
	color: #111827;
}

.sa-nav-item.active {
	background: #f3f4f6;
	color: #111827;
	font-weight: 500;
}

.sa-nav-item.back {
	color: #2563eb;
	font-weight: 600;
}

.sa-nav-item.active::before {
	content: '';
	position: absolute;
	left: 0;
}

.sa-nav-icon {
	width: 18px;
	font-size: 14px;
	text-align: center;
}

.sa-nav-count {
	margin-left: auto;
	padding: 1px 7px;
	font-size: 11px;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 10px;
}

.sa-nav-item.active .sa-nav-count,
.sa-nav-item:hover .sa-nav-count {
	background: #fff;
}

.sa-user {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 8px;
	border-top: 1px solid #eaeaea;
}

.sa-avatar {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
}

.sa-user-name {
	font-weight: 500;
	font-size: 13px;
}

.sa-user-role {
	font-size: 11px;
	color: #9ca3af;
}

/* 顶栏 */
.sa-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sa-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 14px 28px;
	background: #fafafa;
	border-bottom: 1px solid #eaeaea;
}

.sa-search {
	flex: 1;
	max-width: 560px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 10px;
}

.sa-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #171717;
}

.sa-search input::placeholder {
	color: #9ca3af;
}

.sa-search-icon {
	color: #9ca3af;
	font-size: 13px;
}

.sa-search-kbd {
	padding: 2px 6px;
	font-size: 11px;
	color: #6b7280;
	background: #f3f4f6;
	border: 1px solid #eaeaea;
	border-radius: 4px;
}

.sa-top-actions {
	display: flex;
	gap: 6px;
}

.sa-btn-ghost {
	padding: 7px 12px;
	font-size: 13px;
	color: #4b5563;
	background: transparent;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
}

.sa-btn-ghost:hover {
	background: #fff;
	border-color: #eaeaea;
}

.sa-btn-primary {
	padding: 7px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #fff;
	background: #2563eb;
	border: none;
	border-radius: 8px;
	cursor: pointer;
}

.sa-btn-primary:hover {
	background: #1d4ed8;
}

/* 主区 */
.sa-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}

.sa-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.sa-stat-card {
	padding: 18px 20px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.sa-stat-label {
	font-size: 12px;
	color: #6b7280;
	margin-bottom: 8px;
}

.sa-stat-value {
	font-size: 26px;
	font-weight: 700;
	color: #111827;
	letter-spacing: -0.02em;
}

.sa-stat-delta {
	margin-top: 6px;
	font-size: 12px;
	color: #9ca3af;
}

.sa-stat-delta.up {
	color: #10b981;
}

.sa-section {
	margin-bottom: 32px;
}

.sa-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sa-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #111827;
}

.sa-link {
	font-size: 13px;
	color: #2563eb;
	cursor: pointer;
}

.sa-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sa-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
	transition: all 0.2s;
	cursor: pointer;
}

.sa-cont-card:hover {
	border-color: #d1d5db;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	transform: translateY(-1px);
}

.sa-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 8px;
	overflow: hidden;
}

.sa-cont-tag {
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

.sa-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: #ef4444;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sa-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sa-cont-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-cont-chapter {
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-cont-progress {
	height: 4px;
	background: #f3f4f6;
	border-radius: 2px;
	overflow: hidden;
}

.sa-cont-progress-bar {
	height: 100%;
	background: #2563eb;
	border-radius: 2px;
}

.sa-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sa-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sa-grid-card:hover {
	transform: translateY(-2px);
}

.sa-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 10px;
	margin-bottom: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.sa-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: #2563eb;
	border-radius: 4px;
}

.sa-grid-name {
	font-size: 13px;
	font-weight: 500;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #9ca3af;
}

/* 响应式适配 */
@media (max-width: 768px) {
	.sa-sidebar {
		display: none;
	}

	.sa-body {
		margin-left: 0;
	}

	.sa-topbar {
		flex-direction: column;
		gap: 10px;
		padding: 10px 12px;
	}

	.sa-search {
		width: 100%;
	}

	.sa-top-actions {
		width: 100%;
		justify-content: space-between;
	}

	.sa-main {
		padding: 12px;
	}

	.sa-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.sa-continue {
		grid-template-columns: 1fr;
	}

	.sa-section {
		margin-bottom: 20px;
	}

	.sa-section h2 {
		font-size: 16px;
	}

	.sa-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
}

@media (max-width: 480px) {
	.sa-stats {
		grid-template-columns: 1fr;
	}

	.sa-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.sa-stat-card {
		padding: 12px;
	}

	.sa-stat-value {
		font-size: 20px;
	}

	.sa-btn-primary {
		padding: 8px 12px;
		font-size: 12px;
	}

	.sa-btn-ghost {
		padding: 6px 10px;
		font-size: 12px;
	}
}
</style>
