<template>
	<div :class="['preview-page-mobile', `preview-${styleKey.toLowerCase()}`]">
		<!-- 移动端顶部栏 -->
		<header class="ppm-header">
			<button v-if="showBack" class="ppm-back" @click="emit('back')">←</button>
			<SmangaLogoMark :variant="logoVariant" class="ppm-logo-mark" />
			<div class="ppm-title">
				<h1>{{ title }}</h1>
			</div>
		</header>

		<!-- 内容区域 -->
		<main class="ppm-content">
			<!-- 媒体库列表 -->
			<section v-if="page === 'media'" class="ppm-grid">
				<button v-for="m in mediaList" :key="m.id" class="ppm-card" @click="nav('manga-list', { mediaId: m.id })">
					<div class="ppm-card-icon">{{ m.icon }}</div>
					<strong>{{ m.name }}</strong>
					<span>{{ m.count }} 本漫画</span>
				</button>
			</section>

			<!-- 漫画列表/搜索/收藏 -->
			<section v-else-if="page === 'manga-list' || page === 'search' || page === 'collect'" class="ppm-manga-grid">
				<button v-for="m in visibleMangas" :key="m.id" class="ppm-manga" @click="nav('manga-info', { mangaId: m.id, mediaId: m.mediaId })">
					<div class="ppm-cover" :style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
						<span>{{ m.status }}</span>
					</div>
					<strong>{{ m.name }}</strong>
					<small>{{ m.author }} · {{ m.chapterCount }} 章</small>
				</button>
			</section>

			<!-- 漫画详情 -->
			<section v-else-if="page === 'manga-info' && activeManga" class="ppm-detail">
				<div class="ppm-detail-cover" :style="{ background: `linear-gradient(135deg, ${activeManga.gradient[0]}, ${activeManga.gradient[1]})` }"></div>
				<div class="ppm-detail-main">
					<div class="ppm-tags">
						<span v-for="tag in activeManga.tags" :key="tag">{{ tag }}</span>
					</div>
					<h2>{{ activeManga.name }}</h2>
					<p>{{ activeManga.desc }}</p>
					<div class="ppm-meta">
						<span>作者：{{ activeManga.author }}</span>
						<span>状态：{{ activeManga.status }}</span>
						<span>进度：{{ activeManga.progress }}%</span>
					</div>
					<div class="ppm-actions">
						<button class="primary" @click="nav('chapter-list', { mangaId: activeManga.id, mediaId: activeManga.mediaId })">查看章节</button>
						<button @click="nav('reader', { mangaId: activeManga.id, chapterId: firstChapter?.id })">继续阅读</button>
					</div>
				</div>
			</section>

			<!-- 章节列表 -->
			<section v-else-if="page === 'chapter-list'" class="ppm-list">
				<button v-for="ch in visibleChapters" :key="ch.id" class="ppm-row" @click="nav('reader', { mangaId: ch.mangaId, chapterId: ch.id })">
					<span>{{ ch.name }} · {{ ch.title }}</span>
					<small>{{ ch.pages }} 页 {{ ch.read ? '已读' : '未读' }}</small>
				</button>
			</section>

			<!-- 历史记录 -->
			<section v-else-if="page === 'history'" class="ppm-history">
				<div v-for="h in previewHistory" :key="h.chapterId" class="ppm-history-card" @click="nav('reader', h)">
					<div class="ppm-history-cover"
						:style="{ background: `linear-gradient(135deg, ${h.gradient[0]}, ${h.gradient[1]})` }">
						<span v-if="h.tag" class="ppm-history-tag">{{ h.tag }}</span>
						<span v-if="h.unread" class="ppm-history-unread">{{ h.unread }}</span>
						<span v-if="h.finished" class="ppm-history-done">✓</span>
						<div class="ppm-history-progress-bar">
							<div class="ppm-history-progress-fill" :style="{ width: h.progress + '%' }"></div>
						</div>
					</div>
					<div class="ppm-history-info">
						<div class="ppm-history-name">{{ h.mangaName }}</div>
						<div class="ppm-history-chapter">{{ h.chapterName }}</div>
						<div class="ppm-history-meta">
							<span class="ppm-history-time">{{ h.time }}</span>
							<span class="ppm-history-pct">{{ h.progress }}%</span>
						</div>
					</div>
				</div>
			</section>

			<!-- 书签 -->
			<section v-else-if="page === 'bookmark'" class="ppm-list">
				<button v-for="b in previewBookmarks" :key="b.chapterId" class="ppm-row" @click="nav('reader', b)">
					<span>{{ mangaName(b.mangaId) }} · 第 {{ b.page }} 页</span>
					<small>{{ b.note }}</small>
				</button>
			</section>

			<!-- 标签列表 -->
			<section v-else-if="page === 'tag-list'" class="ppm-tags-panel">
				<button v-for="tag in allTags" :key="tag" @click="nav('search', { keyword: tag })">{{ tag }}</button>
			</section>

			<!-- 管理入口 -->
			<section v-else-if="page === 'manage'" class="ppm-grid manage">
				<button v-for="item in manageModules" :key="item.page" class="ppm-card" @click="nav(item.page, {})">
					<strong>{{ item.title }}</strong>
					<span>{{ item.desc }}</span>
					<small>{{ item.metric }}</small>
				</button>
			</section>

			<!-- 管理子页面占位 -->
			<section v-else-if="page.startsWith('manage-')" class="ppm-empty">
				<h2>{{ title }}</h2>
				<p>移动端管理功能简化版，仅保留核心操作。</p>
				<button @click="nav('manage', {}, true)">回到管理入口</button>
			</section>

			<!-- 服务器设置 -->
			<section v-else-if="page === 'setting-serve'" class="ppm-settings">
				<div v-for="group in serveSettingMock" :key="group.title" class="ppm-setting-card">
					<h2>{{ group.title }}</h2>
					<div v-for="item in group.items" :key="item.label" class="ppm-setting-row">
						<span>{{ item.label }}</span>
						<strong>{{ item.value }}</strong>
					</div>
				</div>
			</section>
		</main>

		<!-- 底部导航栏 -->
		<MobileNavBar :items="navItems" :active-key="page" @click="handleNavClick" />
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MobileNavBar from './components/mobile/mobile-nav-bar.vue';
import SmangaLogoMark from './components/smanga-logo-mark.vue';
import type { LogoVariant } from './components/logo-options';
import {
	mediaList,
	previewMangas,
	previewChapters,
	previewHistory,
	previewBookmarks,
	manageModules,
	serveSettingMock,
} from './mock';
import type { PreviewManga } from './mock';

type PreviewStyle = 'A' | 'B' | 'C' | 'D';
type PreviewPage =
	| 'home' | 'media' | 'manga-list' | 'manga-info' | 'chapter-list' | 'reader' | 'history' | 'bookmark'
	| 'collect' | 'search' | 'tag-list' | 'manage' | 'manage-user' | 'manage-media' | 'manage-manga'
	| 'manage-path' | 'manage-chapter' | 'manage-bookmark' | 'manage-tag' | 'manage-compress' | 'manage-jobs'
	| 'setting-user' | 'setting-serve';

const props = defineProps<{
	page: PreviewPage;
	styleKey: PreviewStyle;
	logoVariant?: LogoVariant;
	params: { mediaId?: number; mangaId?: number; chapterId?: number; keyword?: string };
}>();

const logoVariant = computed(() => props.logoVariant || 'twin-pages');

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any>; replace?: boolean }];
	back: [];
}>();

// 底部导航项
const navItems = [
	{ key: 'media', label: '媒体库', icon: '📚', page: 'media' },
	{ key: 'history', label: '历史', icon: '🕘', page: 'history' },
	{ key: 'bookmark', label: '书签', icon: '🔖', page: 'bookmark' },
	{ key: 'collect', label: '收藏', icon: '⭐', page: 'collect' },
	{ key: 'search', label: '搜索', icon: '🔍', page: 'search' },
	{ key: 'manage', label: '管理', icon: '⚙️', page: 'manage' },
];

const showBack = computed(() => !['media', 'history', 'bookmark', 'collect', 'search', 'manage'].includes(props.page));
const activeManga = computed(() => previewMangas.find((m) => m.id === props.params.mangaId) || previewMangas[0]);
const firstChapter = computed(() => previewChapters.find((ch) => ch.mangaId === activeManga.value?.id));
const visibleChapters = computed(() => previewChapters.filter((ch) => ch.mangaId === (props.params.mangaId || activeManga.value?.id)));
const allTags = computed(() => [...new Set(previewMangas.flatMap((m) => m.tags))]);

const visibleMangas = computed(() => {
	let list: PreviewManga[] = previewMangas;
	if (props.page === 'manga-list' && props.params.mediaId) {
		list = list.filter((m) => m.mediaId === props.params.mediaId);
	}
	if (props.page === 'search' && props.params.keyword) {
		const keyword = props.params.keyword.toLowerCase();
		list = list.filter((m) => [m.name, m.author, ...m.tags].some((x) => x.toLowerCase().includes(keyword)));
	}
	if (props.page === 'collect') {
		list = list.slice(0, 6);
	}
	return list;
});

const title = computed(() => {
	const pageTitleMap: Record<string, string> = {
		media: '媒体库',
		'manga-list': mediaList.find((m) => m.id === props.params.mediaId)?.name || '漫画列表',
		'manga-info': activeManga.value?.name || '漫画详情',
		'chapter-list': `${activeManga.value?.name || '漫画'} · 章节`,
		history: '最近阅读',
		bookmark: '书签',
		collect: '收藏',
		search: props.params.keyword ? `搜索：${props.params.keyword}` : '搜索',
		'tag-list': '标签',
		manage: '管理入口',
		'manage-user': '用户管理',
		'manage-media': '媒体库管理',
		'manage-manga': '漫画管理',
		'manage-path': '路径管理',
		'manage-chapter': '章节管理',
		'manage-bookmark': '书签管理',
		'manage-tag': '标签管理',
		'manage-compress': '解压管理',
		'manage-jobs': '任务管理',
		'setting-serve': '服务器设置',
	};
	return pageTitleMap[props.page] || '预览页面';
});

function nav(page: string, params: Record<string, any> = {}, replace = false) {
	emit('navigate', { page, params, replace });
}

function mangaName(id: number) {
	return previewMangas.find((m) => m.id === id)?.name || '未知漫画';
}

function handleNavClick(item: any) {
	if (item.page) {
		nav(item.page, {});
	}
}
</script>

<style scoped>
.preview-page-mobile {
	min-height: 100vh;
	padding-bottom: 70px;
	background: transparent;
	color: #171717;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.preview-b { color: #1f2937; }
.preview-c { color: #e6e8eb; }
.preview-d { color: #0f172a; }

/* 顶部栏 */
.ppm-header {
	position: sticky;
	top: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #e5e7eb;
}

.preview-c .ppm-header {
	background: rgba(22, 26, 32, 0.95);
	border-color: #2a313c;
}

.ppm-logo-mark {
	width: 26px;
	height: 26px;
	color: #171717;
}

.preview-b .ppm-logo-mark {
	color: #ff6fa3;
}

.preview-c .ppm-logo-mark {
	color: #f5a524;
}

.preview-d .ppm-logo-mark {
	color: #2563eb;
}

.ppm-back {
	width: 36px;
	height: 36px;
	border: 1px solid rgba(128, 128, 128, 0.25);
	border-radius: 8px;
	background: #fff;
	font-size: 18px;
	cursor: pointer;
}

.preview-c .ppm-back {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

.ppm-title h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
}

/* 内容区 */
.ppm-content {
	padding: 16px;
}

/* 网格布局 */
.ppm-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
}

.ppm-card {
	text-align: left;
	padding: 16px;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	background: #fff;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-height: 120px;
}

.preview-c .ppm-card {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

.ppm-card-icon {
	font-size: 24px;
}

.ppm-card span,
.ppm-card small {
	color: #6b7280;
	font-size: 12px;
}

.preview-c .ppm-card span,
.preview-c .ppm-card small {
	color: #9aa3ae;
}

/* 漫画网格 */
.ppm-manga-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
}

.ppm-manga {
	text-align: left;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.ppm-cover {
	aspect-ratio: 3 / 4;
	border-radius: 10px;
	position: relative;
}

.ppm-cover span {
	position: absolute;
	left: 8px;
	top: 8px;
	padding: 3px 8px;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.85);
	font-size: 11px;
}

.preview-c .ppm-cover span {
	background: rgba(13, 15, 18, 0.9);
	color: #e6e8eb;
}

.ppm-manga strong {
	font-size: 13px;
}

.ppm-manga small {
	font-size: 11px;
	color: #6b7280;
}

.preview-c .ppm-manga small {
	color: #9aa3ae;
}

/* 详情页 */
.ppm-detail {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.ppm-detail-cover {
	aspect-ratio: 3 / 4;
	border-radius: 16px;
	max-height: 300px;
}

.ppm-detail-main {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.ppm-detail-main h2 {
	margin: 0;
	font-size: 22px;
}

.ppm-detail-main p {
	line-height: 1.6;
	color: #6b7280;
	font-size: 14px;
}

.preview-c .ppm-detail-main p {
	color: #9aa3ae;
}

.ppm-tags,
.ppm-actions,
.ppm-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.ppm-tags span {
	padding: 6px 10px;
	border-radius: 999px;
	background: rgba(37, 99, 235, 0.1);
	color: #2563eb;
	font-size: 12px;
}

.preview-c .ppm-tags span {
	background: rgba(245, 165, 36, 0.14);
	color: #f5a524;
}

.ppm-meta {
	font-size: 13px;
	color: #6b7280;
}

.ppm-actions button {
	padding: 10px 16px;
	border: 1px solid rgba(128, 128, 128, 0.25);
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	font-size: 14px;
	flex: 1;
}

.ppm-actions .primary {
	background: #111827;
	color: #fff;
	border-color: #111827;
}

.preview-c .ppm-actions button {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

.preview-c .ppm-actions .primary {
	background: #f5a524;
	color: #0d0f12;
	border-color: #f5a524;
}

/* 列表 */
.ppm-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ppm-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 14px;
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	background: #fff;
	cursor: pointer;
}

.preview-c .ppm-row {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

.ppm-row span {
	font-size: 14px;
}

.ppm-row small {
	font-size: 12px;
	color: #6b7280;
}

.preview-c .ppm-row small {
	color: #9aa3ae;
}

/* 标签面板 */
.ppm-tags-panel {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.ppm-tags-panel button {
	padding: 8px 12px;
	border-radius: 999px;
	background: rgba(37, 99, 235, 0.1);
	color: #2563eb;
	border: none;
	cursor: pointer;
	font-size: 13px;
}

.preview-c .ppm-tags-panel button {
	background: rgba(245, 165, 36, 0.14);
	color: #f5a524;
}

/* 设置页 */
.ppm-settings {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.ppm-setting-card {
	padding: 16px;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	background: #fff;
}

.preview-c .ppm-setting-card {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

.ppm-setting-card h2 {
	margin: 0 0 12px;
	font-size: 16px;
}

.ppm-setting-row {
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	border-top: 1px solid rgba(128, 128, 128, 0.16);
	font-size: 14px;
}

/* 空状态 */
.ppm-empty {
	max-width: 100%;
	padding: 24px;
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.75);
	border: 1px solid rgba(128, 128, 128, 0.22);
	text-align: center;
}

.ppm-empty h2 {
	margin: 0 0 12px;
	font-size: 18px;
}

.ppm-empty p {
	margin: 0 0 16px;
	color: #6b7280;
	font-size: 14px;
}

.ppm-empty button {
	padding: 10px 20px;
	border: 1px solid rgba(128, 128, 128, 0.25);
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	font-size: 14px;
}

.preview-c .ppm-empty {
	background: rgba(22, 26, 32, 0.9);
	border-color: #2a313c;
}

.preview-c .ppm-empty button {
	background: #161a20;
	color: #e6e8eb;
	border-color: #2a313c;
}

/* 历史记录卡片 */
.ppm-history {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.ppm-history-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
}
.ppm-history-card:active {
	transform: scale(0.98);
	background: #f9fafb;
}
.preview-c .ppm-history-card {
	background: #161a20;
	border-color: #2a313c;
}
.preview-c .ppm-history-card:active {
	background: #1a1f28;
}
.ppm-history-cover {
	position: relative;
	flex-shrink: 0;
	width: 56px;
	height: 78px;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.ppm-history-tag {
	position: absolute;
	top: 4px;
	left: 4px;
	padding: 1px 6px;
	font-size: 9px;
	font-weight: 600;
	color: #fff;
	background: rgba(0,0,0,.55);
	border-radius: 3px;
	line-height: 1.4;
}
.ppm-history-unread {
	position: absolute;
	top: 4px;
	right: 4px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	background: #ef4444;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.ppm-history-done {
	position: absolute;
	top: 4px;
	right: 4px;
	width: 20px;
	height: 20px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #10b981;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.ppm-history-progress-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: rgba(255,255,255,.45);
}
.ppm-history-progress-fill {
	height: 100%;
	background: #2563eb;
	border-radius: 0 2px 2px 0;
	transition: width 0.3s ease;
}
.ppm-history-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
	gap: 1px;
}
.ppm-history-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.preview-c .ppm-history-name {
	color: #e6e8eb;
}
.ppm-history-chapter {
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.preview-c .ppm-history-chapter {
	color: #9aa3ae;
}
.ppm-history-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.ppm-history-time {
	font-size: 11px;
	color: #9ca3af;
}
.preview-c .ppm-history-time {
	color: #6a7280;
}
.ppm-history-pct {
	font-size: 11px;
	font-weight: 600;
	color: #2563eb;
}
.preview-c .ppm-history-pct {
	color: #f5a524;
}
</style>
