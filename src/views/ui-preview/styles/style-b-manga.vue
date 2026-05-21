<template>
	<div class="style-b">
		<!-- 侧边栏 -->
		<aside class="sb-sidebar">
			<div class="sb-logo">
				<span class="sb-logo-emoji">🌸</span>
				<span class="sb-logo-text">smanga</span>
			</div>

			<div class="sb-sec-title">{{ currentMenuTitle }}</div>
			<nav class="sb-nav">
				<div
					v-for="item in currentMenu"
					:key="item.key"
					:class="['sb-nav-item', { active: isMenuActive(item), back: item.key === 'back-browse' }]"
					@click="navigateMenu(item)"
				>
					<span class="sb-nav-icon">{{ item.icon }}</span>
					<span>{{ item.label }}</span>
				</div>
			</nav>

			<div v-if="menuMode === 'browse'" class="sb-sec">
				<div class="sb-sec-title">✨ 我的书架</div>
				<div v-for="m in mediaList" :key="m.id" class="sb-sec-item" @click="emit('navigate', { page: 'manga-list', params: { mediaId: m.id } })">
					<span>{{ m.icon }} {{ m.name }}</span>
					<span class="sb-sec-count">{{ m.count }}</span>
				</div>
			</div>

			<div v-if="menuMode === 'browse'" class="sb-card-hint">
				<div class="sb-card-hint-title">今日推荐 🎁</div>
				<div class="sb-card-hint-desc">打开盲盒，发现新漫画</div>
				<button class="sb-card-hint-btn">去看看</button>
			</div>
		</aside>

		<!-- 右侧 -->
		<div class="sb-body">
			<!-- 顶栏 -->
			<header class="sb-topbar">
				<div class="sb-top-nav">
					<span class="sb-top-item active">发现</span>
					<span class="sb-top-item">书库</span>
					<span class="sb-top-item">最近</span>
					<span class="sb-top-item">书签</span>
					<span class="sb-top-item">排行榜</span>
				</div>
				<form class="sb-search" @submit.prevent="submitSearch">
					<span>🔍</span>
					<input v-model="keyword" placeholder="搜索你喜欢的漫画…" />
				</form>
				<div class="sb-top-actions">
					<button class="sb-pill">🌙</button>
					<button class="sb-pill">中/EN</button>
					<div class="sb-avatar">U</div>
				</div>
			</header>

			<main class="sb-main">
				<template v-if="activePage === 'home'">
				<!-- Hero -->
				<section class="sb-hero">
					<div class="sb-hero-text">
						<div class="sb-hero-sub">WELCOME BACK</div>
						<div class="sb-hero-title">你的漫画世界，<br />等你翻开下一页 ✨</div>
						<div class="sb-hero-meta">
							<span class="sb-hero-chip">📖 今日 {{ stats.readToday }} 章</span>
							<span class="sb-hero-chip">🔥 连续 23 天</span>
							<span class="sb-hero-chip">⭐ 收藏 {{ stats.totalManga.toLocaleString() }}</span>
						</div>
					</div>
					<div class="sb-hero-deco">
						<div class="sb-hero-blob sb-hero-blob-1"></div>
						<div class="sb-hero-blob sb-hero-blob-2"></div>
						<div class="sb-hero-blob sb-hero-blob-3"></div>
					</div>
				</section>

				<!-- 继续阅读 -->
				<section class="sb-section">
					<div class="sb-section-head">
						<h2>🌟 继续阅读</h2>
						<a class="sb-link">全部 →</a>
					</div>
					<div class="sb-continue">
						<div v-for="m in continueReading" :key="m.id" class="sb-cont-card" @click="emit('navigate', { page: 'reader', params: { mangaId: m.id, chapterId: m.id * 100 + 1 } })">
							<div class="sb-cont-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sb-cont-tag">{{ m.tag }}</span>
								<span v-if="m.unread" class="sb-cont-unread">{{ m.unread }}</span>
								<div class="sb-cont-progress">
									<div class="sb-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
								</div>
							</div>
							<div class="sb-cont-name">{{ m.name }}</div>
							<div class="sb-cont-chapter">{{ m.chapter }}</div>
						</div>
					</div>
				</section>

				<!-- 最近添加 -->
				<section class="sb-section">
					<div class="sb-section-head">
						<h2>💫 最近添加</h2>
						<a class="sb-link">全部 →</a>
					</div>
					<div class="sb-grid">
						<div v-for="m in recentAdded" :key="m.id" class="sb-grid-card" @click="emit('navigate', { page: 'manga-info', params: { mangaId: m.id } })">
							<div class="sb-grid-cover"
								:style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
								<span v-if="m.tag" class="sb-grid-tag">{{ m.tag }}</span>
								<div class="sb-grid-hover">
									<button class="sb-grid-play">▶ 立即阅读</button>
								</div>
							</div>
							<div class="sb-grid-name">{{ m.name }}</div>
							<div class="sb-grid-meta">{{ m.chapter }}</div>
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
import ManageB from '../manage/manage-b-manga.vue';
import ManagePanel from '../manage/manage-panel.vue';
import SettingB from '../setting/setting-b-manga.vue';

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
const styleKey = computed(() => props.styleKey || 'B');
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
	if (activePage.value === 'manage-manga') return ManageB;
	if (activePage.value.startsWith('manage-')) return ManagePanel;
	if (activePage.value === 'setting-user') return SettingB;
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
.style-b {
	display: flex;
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	position: relative;
	overflow: hidden;
}

.style-b::before {
	content: '';
	position: absolute;
	top: -100px;
	right: -100px;
	width: 400px;
	height: 400px;
	background: radial-gradient(circle, rgba(255, 111, 163, 0.25), transparent 70%);
	filter: blur(60px);
	pointer-events: none;
}

.style-b::after {
	content: '';
	position: absolute;
	bottom: -150px;
	left: 200px;
	width: 500px;
	height: 500px;
	background: radial-gradient(circle, rgba(108, 141, 255, 0.22), transparent 70%);
	filter: blur(80px);
	pointer-events: none;
}

/* 侧边栏 */
.sb-sidebar {
	flex-shrink: 0;
	width: 240px;
	margin: 16px 0 16px 16px;
	padding: 20px 14px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
}

.sb-logo {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 16px;
}

.sb-logo-emoji {
	font-size: 24px;
}

.sb-logo-text {
	font-size: 18px;
	font-weight: 700;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.sb-nav {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.sb-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	color: #4b5563;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.sb-nav-item:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateX(2px);
}

.sb-nav-item.active {
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18));
	color: #1f2937;
}

.sb-nav-item.back {
	color: #ff6fa3;
	font-weight: 700;
}

.sb-nav-icon {
	font-size: 15px;
}

.sb-sec {
	margin-top: 16px;
}

.sb-sec-title {
	padding: 8px 12px 6px;
	font-size: 12px;
	font-weight: 600;
	color: #9ca3af;
}

.sb-sec-item {
	display: flex;
	justify-content: space-between;
	padding: 8px 12px;
	font-size: 13px;
	color: #4b5563;
	border-radius: 10px;
	cursor: pointer;
}

.sb-sec-item:hover {
	background: rgba(255, 255, 255, 0.8);
}

.sb-sec-count {
	font-size: 11px;
	color: #9ca3af;
}

.sb-card-hint {
	margin-top: auto;
	padding: 14px;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border-radius: 16px;
	color: #fff;
	text-align: center;
}

.sb-card-hint-title {
	font-size: 14px;
	font-weight: 700;
	margin-bottom: 4px;
}

.sb-card-hint-desc {
	font-size: 11px;
	opacity: 0.9;
	margin-bottom: 10px;
}

.sb-card-hint-btn {
	padding: 6px 16px;
	background: #fff;
	color: #ff6fa3;
	font-size: 12px;
	font-weight: 600;
	border: none;
	border-radius: 999px;
	cursor: pointer;
}

/* 顶栏 */
.sb-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	padding: 16px;
	position: relative;
	z-index: 1;
}

.sb-topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 20px;
	margin-bottom: 16px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	box-shadow: 0 4px 16px rgba(108, 141, 255, 0.08);
}

.sb-top-nav {
	display: flex;
	gap: 6px;
}

.sb-top-item {
	padding: 8px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #4b5563;
	border-radius: 999px;
	cursor: pointer;
	transition: all 0.2s;
}

.sb-top-item:hover {
	background: rgba(255, 111, 163, 0.12);
	color: #ff6fa3;
}

.sb-top-item.active {
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	box-shadow: 0 4px 12px rgba(255, 111, 163, 0.3);
}

.sb-search {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
}

.sb-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
}

.sb-top-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sb-pill {
	padding: 7px 14px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	font-size: 13px;
	cursor: pointer;
}

.sb-avatar {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	color: #fff;
	font-weight: 600;
	border-radius: 50%;
	border: 2px solid #fff;
}

/* 主区 */
.sb-main {
	flex: 1;
	overflow: auto;
}

.sb-hero {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32px 36px;
	margin-bottom: 28px;
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.14), rgba(108, 141, 255, 0.14));
	border: 1px solid rgba(255, 255, 255, 0.7);
	border-radius: 24px;
	overflow: hidden;
}

.sb-hero-sub {
	font-size: 12px;
	font-weight: 700;
	color: #ff6fa3;
	letter-spacing: 0.15em;
	margin-bottom: 8px;
}

.sb-hero-title {
	font-size: 28px;
	font-weight: 800;
	line-height: 1.3;
	color: #1f2937;
	margin-bottom: 16px;
}

.sb-hero-meta {
	display: flex;
	gap: 10px;
}

.sb-hero-chip {
	padding: 6px 14px;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
	color: #4b5563;
}

.sb-hero-deco {
	position: relative;
	width: 180px;
	height: 140px;
	flex-shrink: 0;
}

.sb-hero-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(2px);
}

.sb-hero-blob-1 {
	top: 0;
	right: 20px;
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #ffb5a7, #fec89a);
}

.sb-hero-blob-2 {
	bottom: 10px;
	right: 80px;
	width: 60px;
	height: 60px;
	background: linear-gradient(135deg, #a0c4ff, #bdb2ff);
}

.sb-hero-blob-3 {
	top: 30px;
	right: 110px;
	width: 50px;
	height: 50px;
	background: linear-gradient(135deg, #f1c0e8, #cfbaf0);
}

.sb-section {
	margin-bottom: 28px;
}

.sb-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
	padding: 0 4px;
}

.sb-section-head h2 {
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	color: #1f2937;
}

.sb-link {
	font-size: 13px;
	color: #6c8dff;
	font-weight: 500;
	cursor: pointer;
}

.sb-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 14px;
}

.sb-cont-card {
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sb-cont-card:hover {
	transform: translateY(-4px);
}

.sb-cont-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 16px;
	overflow: hidden;
	margin-bottom: 10px;
	box-shadow: 0 6px 20px rgba(108, 141, 255, 0.18);
}

.sb-cont-card:hover .sb-cont-cover {
	box-shadow: 0 12px 28px rgba(255, 111, 163, 0.28);
}

.sb-cont-tag {
	position: absolute;
	top: 10px;
	left: 10px;
	padding: 4px 10px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #ff9a76);
	border-radius: 999px;
	box-shadow: 0 2px 8px rgba(255, 111, 163, 0.4);
}

.sb-cont-unread {
	position: absolute;
	top: 10px;
	right: 10px;
	min-width: 22px;
	height: 22px;
	padding: 0 7px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #ffb020;
	border-radius: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(255, 176, 32, 0.5);
}

.sb-cont-progress {
	position: absolute;
	left: 8px;
	right: 8px;
	bottom: 8px;
	height: 4px;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 2px;
	overflow: hidden;
}

.sb-cont-progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #ff6fa3, #ffb020);
	border-radius: 2px;
}

.sb-cont-name {
	font-size: 14px;
	font-weight: 700;
	color: #1f2937;
	padding: 0 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-cont-chapter {
	font-size: 12px;
	color: #6b7280;
	padding: 0 4px;
	margin-top: 2px;
}

.sb-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 20px;
}

.sb-grid-card {
	cursor: pointer;
}

.sb-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 16px;
	margin-bottom: 8px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	overflow: hidden;
	transition: all 0.25s;
}

.sb-grid-card:hover .sb-grid-cover {
	transform: translateY(-4px) scale(1.02);
	box-shadow: 0 12px 28px rgba(255, 111, 163, 0.3);
}

.sb-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 8px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	background: #ffb020;
	border-radius: 999px;
}

.sb-grid-hover {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 14px;
	background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.5));
	opacity: 0;
	transition: opacity 0.25s;
}

.sb-grid-card:hover .sb-grid-hover {
	opacity: 1;
}

.sb-grid-play {
	padding: 7px 16px;
	font-size: 12px;
	font-weight: 600;
	color: #ff6fa3;
	background: #fff;
	border: none;
	border-radius: 999px;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sb-grid-name {
	font-size: 13px;
	font-weight: 600;
	color: #1f2937;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #9ca3af;
}
</style>
