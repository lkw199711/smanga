<template>
	<div class="ui-preview-root">
		<!-- 顶部风格切换 -->
		<header class="pv-header">
			<div class="pv-header-left">
				<span class="pv-badge">UI 预览</span>
				<div>
					<div class="pv-title">{{ currentSpec.title }}</div>
					<div class="pv-crumb">{{ breadcrumb }}</div>
				</div>
			</div>
			<div class="pv-header-center">
				<!-- 快速跳转仅用于预览调试 -->
				<div class="pv-scene-tabs">
					<button v-for="item in scenes" :key="item.key"
						:class="['pv-scene-tab', { active: currentPage === item.key }]"
						@click="quickJump(item.key)">
						{{ item.label }}
					</button>
				</div>
				<!-- 风格切换 -->
				<div class="pv-tabs">
					<button v-for="item in tabs" :key="item.key"
						:class="['pv-tab', { active: activeStyle === item.key }]"
						@click="activeStyle = item.key">
						{{ item.label }}
					</button>
				</div>
			</div>
			<div class="pv-header-right">
				<button class="pv-tab" :disabled="!pageStack.length" @click="goPreviewBack">返回上一页</button>
				<button class="pv-tab" @click="showSpec = !showSpec">
					{{ showSpec ? '隐藏规格' : '查看规格' }}
				</button>
				<button class="pv-tab primary" @click="goAppBack">返回应用</button>
			</div>
		</header>

		<!-- 规格浮层 -->
		<aside v-if="showSpec" class="pv-spec">
			<div class="pv-spec-section">
				<div class="pv-spec-title">色板</div>
				<div v-for="row in currentSpec.palette" :key="row[0]" class="pv-spec-row">
					<span class="pv-spec-swatch" :style="{ background: pickColor(row[1]) }"></span>
					<span class="pv-spec-key">{{ row[0] }}</span>
					<span class="pv-spec-val">{{ row[1] }}</span>
				</div>
			</div>
			<div class="pv-spec-section">
				<div class="pv-spec-title">规格</div>
				<div v-for="line in currentSpec.spec" :key="line" class="pv-spec-line">· {{ line }}</div>
			</div>
		</aside>

		<!-- 风格稿 -->
		<main class="pv-main">
			<component
				:is="currentView"
				:page="currentPage"
				:style-key="activeStyle"
				:params="previewParams"
				@navigate="navigate"
				@back="goPreviewBack"
			/>
		</main>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { styleSpec } from './mock';
// 首页风格
import StyleA from './styles/style-a-minimal.vue';
import StyleB from './styles/style-b-manga.vue';
import StyleC from './styles/style-c-dark.vue';
import StyleD from './styles/style-d-desat.vue';
// 阅读器风格
import ReaderA from './reader/reader-a-minimal.vue';
import ReaderB from './reader/reader-b-manga.vue';
import ReaderC from './reader/reader-c-dark.vue';
import ReaderD from './reader/reader-d-desat.vue';

const router = useRouter();

const scenes = [
	{ key: 'home', label: '首页' },
	{ key: 'media', label: '媒体库' },
	{ key: 'reader', label: '阅读器' },
	{ key: 'manage', label: '管理' },
	{ key: 'setting-user', label: '设置' },
] as const;

const tabs = [
	{ key: 'A', label: 'A 现代简约' },
	{ key: 'B', label: 'B 漫画风' },
	{ key: 'C', label: 'C 暗色优先' },
	{ key: 'D', label: 'D 降饱和多主题' },
] as const;

type PreviewStyle = 'A' | 'B' | 'C' | 'D';
type PreviewPage =
	| 'home' | 'media' | 'manga-list' | 'manga-info' | 'chapter-list' | 'reader' | 'history' | 'bookmark'
	| 'collect' | 'search' | 'tag-list' | 'manage' | 'manage-user' | 'manage-media' | 'manage-manga'
	| 'manage-path' | 'manage-chapter' | 'manage-bookmark' | 'manage-tag' | 'manage-compress' | 'manage-jobs'
	| 'setting-user' | 'setting-serve';
type NavigatePayload = { page: PreviewPage | 'browse-return'; params?: Record<string, any>; replace?: boolean };

const activeStyle = ref<PreviewStyle>('A');
const showSpec = ref(true);
const currentPage = ref<PreviewPage>('home');
const previewParams = reactive({
	mediaId: undefined as number | undefined,
	mangaId: undefined as number | undefined,
	chapterId: undefined as number | undefined,
	keyword: '',
});
const pageStack = ref<Array<{ page: PreviewPage; params: Record<string, any> }>>([]);
const lastBrowseLocation = ref<{ page: PreviewPage; params: Record<string, any> }>({ page: 'home', params: {} });

const shellMap: Record<PreviewStyle, any> = { A: StyleA, B: StyleB, C: StyleC, D: StyleD };
const readerMap: Record<PreviewStyle, any> = {
	A: ReaderA,
	B: ReaderB,
	C: ReaderC,
	D: ReaderD,
};
const currentView = computed(() => currentPage.value === 'reader' ? readerMap[activeStyle.value] : shellMap[activeStyle.value]);
const currentSpec = computed(() => styleSpec[activeStyle.value]);
const pageLabelMap: Record<PreviewPage, string> = {
	home: '首页',
	media: '媒体库',
	'manga-list': '漫画列表',
	'manga-info': '漫画详情',
	'chapter-list': '章节列表',
	reader: '阅读器',
	history: '最近阅读',
	bookmark: '书签',
	collect: '收藏',
	search: '搜索',
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
	'setting-user': '用户设置',
	'setting-serve': '服务器设置',
};
const breadcrumb = computed(() => `UI 预览 / ${activeStyle.value} / ${pageLabelMap[currentPage.value]}`);

function pickColor(v: string) {
	if (v.includes('→')) {
		const parts = v.split('→').map((s) => s.trim());
		return `linear-gradient(135deg, ${parts[0]} 0%, ${parts[1]} 100%)`;
	}
	if (v.startsWith('#') || v.startsWith('rgb')) return v;
	return '#888';
}

function resetParams() {
	previewParams.mediaId = undefined;
	previewParams.mangaId = undefined;
	previewParams.chapterId = undefined;
	previewParams.keyword = '';
}

function isBrowsePage(page: PreviewPage) {
	return !page.startsWith('manage') && !page.startsWith('setting') && page !== 'reader';
}

function navigate(payload: NavigatePayload) {
	if (payload.page === 'browse-return') {
		currentPage.value = lastBrowseLocation.value.page;
		resetParams();
		Object.assign(previewParams, lastBrowseLocation.value.params);
		pageStack.value = [];
		return;
	}
	if (isBrowsePage(currentPage.value)) {
		lastBrowseLocation.value = {
			page: currentPage.value,
			params: { ...previewParams },
		};
	}
	if (!payload.replace) {
		pageStack.value.push({
			page: currentPage.value,
			params: { ...previewParams },
		});
	}
	currentPage.value = payload.page;
	if (payload.params) Object.assign(previewParams, payload.params);
	if (isBrowsePage(currentPage.value)) {
		lastBrowseLocation.value = {
			page: currentPage.value,
			params: { ...previewParams },
		};
	}
}

function goPreviewBack() {
	const last = pageStack.value.pop();
	if (!last) {
		currentPage.value = 'home';
		resetParams();
		return;
	}
	currentPage.value = last.page;
	resetParams();
	Object.assign(previewParams, last.params);
}

function quickJump(page: PreviewPage) {
	currentPage.value = page;
	resetParams();
	pageStack.value = [];
	if (isBrowsePage(page)) {
		lastBrowseLocation.value = { page, params: {} };
	}
}

function goAppBack() {
	router.push('/');
}
</script>

<style scoped>
.ui-preview-root {
	position: fixed;
	inset: 0;
	background: #f3f4f6;
	overflow: auto;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	color: #111827;
	z-index: 10;
}

.pv-header {
	position: sticky;
	top: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 10px 20px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #e5e7eb;
}

.pv-header-left {
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 280px;
}

.pv-header-center {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}

.pv-scene-tabs {
	display: flex;
	gap: 4px;
	padding: 3px;
	background: #e0e7ff;
	border-radius: 8px;
}

.pv-scene-tab {
	padding: 5px 14px;
	font-size: 12px;
	font-weight: 500;
	color: #4338ca;
	background: transparent;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.pv-scene-tab:hover {
	background: rgba(255, 255, 255, 0.6);
}

.pv-scene-tab.active {
	background: #fff;
	color: #312e81;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pv-badge {
	padding: 4px 10px;
	font-size: 12px;
	font-weight: 600;
	color: #fff;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	border-radius: 999px;
}

.pv-title {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
}

.pv-crumb {
	margin-top: 2px;
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
}

.pv-tabs {
	display: flex;
	gap: 6px;
	padding: 4px;
	background: #f3f4f6;
	border-radius: 10px;
}

.pv-tab {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	color: #4b5563;
	background: transparent;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.pv-tab:disabled {
	opacity: 0.45;
	cursor: not-allowed;
}

.pv-tab:hover {
	background: #fff;
	color: #111827;
}

.pv-tab.active {
	background: #fff;
	color: #111827;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pv-tab.primary {
	background: #111827;
	color: #fff;
}

.pv-tab.primary:hover {
	background: #1f2937;
}

.pv-header-right {
	display: flex;
	gap: 8px;
	min-width: 220px;
	justify-content: flex-end;
}

.pv-spec {
	position: fixed;
	top: 80px;
	right: 20px;
	width: 260px;
	padding: 16px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	z-index: 15;
	font-size: 12px;
}

.pv-spec-section + .pv-spec-section {
	margin-top: 14px;
	padding-top: 14px;
	border-top: 1px dashed #e5e7eb;
}

.pv-spec-title {
	margin-bottom: 10px;
	font-weight: 600;
	color: #111827;
}

.pv-spec-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 0;
}

.pv-spec-swatch {
	flex-shrink: 0;
	width: 16px;
	height: 16px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 4px;
}

.pv-spec-key {
	width: 72px;
	color: #6b7280;
}

.pv-spec-val {
	flex: 1;
	font-family: 'SF Mono', Consolas, monospace;
	color: #111827;
	word-break: break-all;
}

.pv-spec-line {
	padding: 3px 0;
	color: #4b5563;
}

.pv-main {
	padding: 0;
}
</style>
