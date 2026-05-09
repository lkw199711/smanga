<template>
	<div class="ui-preview-root">
		<!-- 顶部风格切换 -->
		<header class="pv-header">
			<div class="pv-header-left">
				<span class="pv-badge">UI 预览</span>
				<span class="pv-title">{{ currentSpec.title }}</span>
			</div>
			<div class="pv-tabs">
				<button v-for="item in tabs" :key="item.key" :class="['pv-tab', { active: active === item.key }]"
					@click="active = item.key">
					{{ item.label }}
				</button>
			</div>
			<div class="pv-header-right">
				<button class="pv-tab" @click="showSpec = !showSpec">
					{{ showSpec ? '隐藏规格' : '查看规格' }}
				</button>
				<button class="pv-tab primary" @click="goBack">返回应用</button>
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
			<component :is="currentView" />
		</main>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { styleSpec } from './mock';
import StyleA from './styles/style-a-minimal.vue';
import StyleB from './styles/style-b-manga.vue';
import StyleC from './styles/style-c-dark.vue';
import StyleD from './styles/style-d-desat.vue';

const router = useRouter();

const tabs = [
	{ key: 'A', label: 'A 现代简约' },
	{ key: 'B', label: 'B 漫画风' },
	{ key: 'C', label: 'C 暗色优先' },
	{ key: 'D', label: 'D 降饱和多主题' },
] as const;

type TabKey = 'A' | 'B' | 'C' | 'D';
const active = ref<TabKey>('A');
const showSpec = ref(true);

const views: Record<TabKey, any> = { A: StyleA, B: StyleB, C: StyleC, D: StyleD };
const currentView = computed(() => views[active.value]);
const currentSpec = computed(() => styleSpec[active.value]);

function pickColor(v: string) {
	// 处理类似 '#EFF6FF' 或 '#FFF5FA → #EEF4FF' 或 'rgba(...)'
	if (v.includes('→')) {
		const parts = v.split('→').map((s) => s.trim());
		return `linear-gradient(135deg, ${parts[0]} 0%, ${parts[1]} 100%)`;
	}
	if (v.startsWith('#') || v.startsWith('rgb')) return v;
	return '#888';
}

function goBack() {
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
	gap: 16px;
	padding: 12px 20px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid #e5e7eb;
}

.pv-header-left {
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 260px;
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
	min-width: 260px;
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
