<template>
	<div :class="['preview-page', `preview-${styleKey.toLowerCase()}`]">
		<header class="pp-header">
			<button v-if="showBack" class="pp-back" @click="emit('back')">返回</button>
			<div>
				<div class="pp-kicker">{{ kicker }}</div>
				<h1>{{ title }}</h1>
			</div>
		</header>

		<section v-if="page === 'media'" class="pp-grid">
			<button v-for="m in mediaList" :key="m.id" class="pp-card" @click="nav('manga-list', { mediaId: m.id })">
				<div class="pp-card-icon">{{ m.icon }}</div>
				<strong>{{ m.name }}</strong>
				<span>{{ m.count }} 本漫画</span>
			</button>
		</section>

		<section v-else-if="page === 'manga-list' || page === 'search' || page === 'collect'" class="pp-manga-grid">
			<button v-for="m in visibleMangas" :key="m.id" class="pp-manga" @click="nav('manga-info', { mangaId: m.id, mediaId: m.mediaId })">
				<div class="pp-cover" :style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
					<span>{{ m.status }}</span>
				</div>
				<strong>{{ m.name }}</strong>
				<small>{{ m.author }} · {{ m.chapterCount }} 章</small>
			</button>
		</section>

		<section v-else-if="page === 'manga-info' && activeManga" class="pp-detail">
			<div class="pp-detail-cover" :style="{ background: `linear-gradient(135deg, ${activeManga.gradient[0]}, ${activeManga.gradient[1]})` }"></div>
			<div class="pp-detail-main">
				<div class="pp-tags">
					<span v-for="tag in activeManga.tags" :key="tag">{{ tag }}</span>
				</div>
				<h2>{{ activeManga.name }}</h2>
				<p>{{ activeManga.desc }}</p>
				<div class="pp-meta">
					<span>作者：{{ activeManga.author }}</span>
					<span>状态：{{ activeManga.status }}</span>
					<span>进度：{{ activeManga.progress }}%</span>
				</div>
				<div class="pp-actions">
					<button class="primary" @click="nav('chapter-list', { mangaId: activeManga.id, mediaId: activeManga.mediaId })">查看章节</button>
					<button @click="nav('reader', { mangaId: activeManga.id, chapterId: firstChapter?.id })">继续阅读</button>
				</div>
			</div>
		</section>

		<section v-else-if="page === 'chapter-list'" class="pp-list">
			<button v-for="ch in visibleChapters" :key="ch.id" class="pp-row" @click="nav('reader', { mangaId: ch.mangaId, chapterId: ch.id })">
				<span>{{ ch.name }} · {{ ch.title }}</span>
				<small>{{ ch.pages }} 页 {{ ch.read ? '已读' : '未读' }}</small>
			</button>
		</section>

		<section v-else-if="page === 'history'" class="pp-history">
			<div v-for="h in previewHistory" :key="h.chapterId" class="pp-history-card" @click="nav('reader', h)">
				<div class="pp-history-cover"
					:style="{ background: `linear-gradient(135deg, ${h.gradient[0]}, ${h.gradient[1]})` }">
					<span v-if="h.tag" class="pp-history-tag">{{ h.tag }}</span>
					<span v-if="h.unread" class="pp-history-unread">{{ h.unread }}</span>
					<span v-if="h.finished" class="pp-history-done">✓</span>
					<div class="pp-history-progress-bar">
						<div class="pp-history-progress-fill" :style="{ width: h.progress + '%' }"></div>
					</div>
				</div>
				<div class="pp-history-info">
					<div class="pp-history-name">{{ h.mangaName }}</div>
					<div class="pp-history-chapter">{{ h.chapterName }}</div>
					<div class="pp-history-meta">
						<span class="pp-history-time">{{ h.time }}</span>
						<span class="pp-history-pct">{{ h.progress }}%</span>
					</div>
				</div>
			</div>
		</section>

		<section v-else-if="page === 'bookmark'" class="pp-list">
			<button v-for="b in previewBookmarks" :key="b.chapterId" class="pp-row" @click="nav('reader', b)">
				<span>{{ mangaName(b.mangaId) }} · 第 {{ b.page }} 页</span>
				<small>{{ b.note }}</small>
			</button>
		</section>

		<section v-else-if="page === 'tag-list'" class="pp-tags-panel">
			<button v-for="tag in allTags" :key="tag" @click="nav('search', { keyword: tag })">{{ tag }}</button>
		</section>

		<section v-else-if="page === 'manage'" class="pp-grid manage">
			<button v-for="item in manageModules" :key="item.page" class="pp-card" @click="nav(item.page, {})">
				<strong>{{ item.title }}</strong>
				<span>{{ item.desc }}</span>
				<small>{{ item.metric }}</small>
			</button>
		</section>

		<section v-else-if="page.startsWith('manage-')" class="pp-empty">
			<h2>{{ title }}</h2>
			<p>第一阶段占位面板，用于验证管理信息架构、返回路径和风格一致性。</p>
			<button @click="nav('manage', {}, true)">回到管理入口</button>
		</section>

		<section v-else-if="page === 'setting-serve'" class="pp-settings">
			<div v-for="group in serveSettingMock" :key="group.title" class="pp-setting-card">
				<h2>{{ group.title }}</h2>
				<div v-for="item in group.items" :key="item.label" class="pp-setting-row">
					<span>{{ item.label }}</span>
					<strong>{{ item.value }}</strong>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
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
	| 'media' | 'manga-list' | 'manga-info' | 'chapter-list' | 'history' | 'bookmark' | 'collect' | 'search'
	| 'tag-list' | 'manage' | 'manage-user' | 'manage-media' | 'manage-manga' | 'manage-path' | 'manage-chapter'
	| 'manage-bookmark' | 'manage-tag' | 'manage-compress' | 'manage-jobs' | 'setting-serve';

const props = defineProps<{
	page: PreviewPage;
	styleKey: PreviewStyle;
	params: { mediaId?: number; mangaId?: number; chapterId?: number; keyword?: string };
}>();

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any>; replace?: boolean }];
	back: [];
}>();

const showBack = computed(() => props.page !== 'media');
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
const kicker = computed(() => props.styleKey === 'C' ? 'Interactive Prototype' : '交互式 UI 样机');

function nav(page: string, params: Record<string, any> = {}, replace = false) {
	emit('navigate', { page, params, replace });
}

function mangaName(id: number) {
	return previewMangas.find((m) => m.id === id)?.name || '未知漫画';
}
</script>

<style scoped>
.preview-page {
	min-height: 0;
	padding: 0;
	background: transparent;
	color: #171717;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.preview-b { color: #1f2937; }
.preview-c { color: #e6e8eb; }
.preview-d { color: #0f172a; }
.pp-header { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
.pp-header h1 { margin: 2px 0 0; font-size: 24px; }
.pp-kicker { font-size: 12px; color: #6b7280; }
.preview-c .pp-kicker { color: #9aa3ae; }
.pp-back, .pp-actions button, .pp-empty button {
	padding: 8px 14px; border: 1px solid rgba(128,128,128,.25); border-radius: 8px; background: #fff; cursor: pointer;
}
.preview-c .pp-back, .preview-c .pp-card, .preview-c .pp-manga, .preview-c .pp-row, .preview-c .pp-setting-card {
	background: #161a20; color: #e6e8eb; border-color: #2a313c;
}
.preview-c .pp-card span, .preview-c .pp-card small, .preview-c .pp-manga small, .preview-c .pp-row small, .preview-c .pp-meta {
	color: #9aa3ae;
}
.preview-c .pp-tags span, .preview-c .pp-tags-panel button {
	background: rgba(245,165,36,.14); color: #f5a524;
}
.preview-c .pp-actions .primary {
	background: #f5a524; color: #0d0f12;
}
.preview-c .pp-detail-main p {
	color: #9aa3ae;
}
.preview-c .pp-empty {
	background: rgba(22,26,32,.9); border-color: #2a313c;
}
.preview-c .pp-cover span {
	background: rgba(13,15,18,.9); color: #e6e8eb;
}
.pp-grid, .pp-manga-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.pp-card, .pp-manga {
	text-align: left; padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; cursor: pointer;
	display: flex; flex-direction: column; gap: 8px; min-height: 132px;
}
.preview-b .pp-card, .preview-b .pp-manga { border-radius: 18px; background: rgba(255,255,255,.72); }
.pp-card:hover, .pp-manga:hover, .pp-row:hover { transform: translateY(-2px); }
.pp-card-icon { font-size: 28px; }
.pp-card span, .pp-card small, .pp-manga small, .pp-row small, .pp-meta { color: #6b7280; }
.pp-cover { aspect-ratio: 3 / 4; border-radius: 10px; margin-bottom: 4px; position: relative; }
.pp-cover span { position: absolute; left: 10px; top: 10px; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,.85); font-size: 12px; }
.pp-detail { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 28px; max-width: 980px; }
.pp-detail-cover { aspect-ratio: 3 / 4; border-radius: 16px; }
.pp-detail-main { display: flex; flex-direction: column; gap: 16px; }
.pp-detail-main h2 { margin: 0; font-size: 30px; }
.pp-detail-main p { line-height: 1.8; color: #6b7280; }
.pp-tags, .pp-actions, .pp-meta { display: flex; flex-wrap: wrap; gap: 10px; }
.pp-tags span, .pp-tags-panel button { padding: 6px 10px; border-radius: 999px; background: rgba(37,99,235,.1); color: #2563eb; border: none; }
.pp-actions .primary { background: #111827; color: #fff; }
.pp-list { display: flex; flex-direction: column; gap: 10px; max-width: 860px; }
.pp-row { display: flex; justify-content: space-between; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; cursor: pointer; }
.pp-tags-panel { display: flex; flex-wrap: wrap; gap: 10px; }
.pp-settings { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; max-width: 900px; }
.pp-setting-card { padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; }
.pp-setting-card h2 { margin: 0 0 12px; font-size: 18px; }
.pp-setting-row { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid rgba(128,128,128,.16); }
.pp-empty { max-width: 620px; padding: 28px; border-radius: 12px; background: rgba(255,255,255,.75); border: 1px solid rgba(128,128,128,.22); }

/* 历史记录卡片 */
.pp-history {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 16px;
	max-width: 1100px;
}
.pp-history-card {
	display: flex;
	gap: 14px;
	padding: 14px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
}
.pp-history-card:hover {
	border-color: #d1d5db;
	box-shadow: 0 4px 16px rgba(0,0,0,.06);
	transform: translateY(-2px);
}
.preview-c .pp-history-card {
	background: #161a20;
	border-color: #2a313c;
}
.preview-c .pp-history-card:hover {
	border-color: #3a4658;
	box-shadow: 0 4px 16px rgba(0,0,0,.25);
}
.pp-history-cover {
	position: relative;
	flex-shrink: 0;
	width: 64px;
	height: 88px;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.pp-history-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: rgba(0,0,0,.55);
	border-radius: 4px;
	line-height: 1.4;
}
.pp-history-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #ef4444;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 6px rgba(239,68,68,.35);
}
.pp-history-done {
	position: absolute;
	top: 6px;
	right: 6px;
	width: 22px;
	height: 22px;
	font-size: 12px;
	font-weight: 700;
	color: #fff;
	background: #10b981;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 6px rgba(16,185,129,.35);
}
.pp-history-progress-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: rgba(255,255,255,.45);
}
.pp-history-progress-fill {
	height: 100%;
	background: #2563eb;
	border-radius: 0 2px 2px 0;
	transition: width 0.3s ease;
}
.pp-history-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
	gap: 2px;
}
.pp-history-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.preview-c .pp-history-name {
	color: #e6e8eb;
}
.pp-history-chapter {
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.preview-c .pp-history-chapter {
	color: #9aa3ae;
}
.pp-history-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 2px;
}
.pp-history-time {
	font-size: 11px;
	color: #9ca3af;
}
.preview-c .pp-history-time {
	color: #6a7280;
}
.pp-history-pct {
	font-size: 11px;
	font-weight: 600;
	color: #2563eb;
}
.preview-c .pp-history-pct {
	color: #f5a524;
}

@media (max-width: 760px) {
	.pp-header { align-items: stretch; flex-direction: column; }
	.pp-detail { grid-template-columns: 1fr; }
	.pp-history { grid-template-columns: 1fr; }
}
</style>
