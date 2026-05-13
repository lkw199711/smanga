<template>
	<div class="setting-d" :style="themeVars">
		<header class="sd-header">
			<h1 class="sd-title">用户偏好</h1>
			<div class="sd-header-right">
				<div class="sd-theme-dots">
					<button v-for="t in themeList" :key="t.key"
						:class="['sd-dot', { active: currentTheme === t.key }]"
						:style="{ background: t.primary }" @click="currentTheme = t.key"></button>
				</div>
				<button class="sd-btn">登出</button>
			</div>
		</header>

		<div class="sd-note">设置调配完成后，需要点击保存按钮才能够提交保存。</div>

		<!-- 设置分组 -->
		<div v-for="group in settingMock" :key="group.title" class="sd-card">
			<div class="sd-card-header">{{ group.title }}</div>
			<div class="sd-card-body">
				<div v-for="item in group.items" :key="item.label" class="sd-form-item">
					<label class="sd-label">{{ item.label }}</label>
					<div class="sd-control">
						<div v-if="item.type === 'switch'" :class="['sd-switch', { on: item.value }]">
							<div class="sd-switch-thumb"></div>
						</div>
						<div v-else-if="item.type === 'select'" class="sd-select">
							<span>{{ item.value }}</span>
							<span class="sd-select-arrow">▾</span>
						</div>
						<input v-else-if="item.type === 'input'" class="sd-input" :value="item.value" />
						<div v-else-if="item.type === 'slider'" class="sd-slider-wrap">
							<div class="sd-slider">
								<div class="sd-slider-fill" :style="{ width: ((item.value - 100) / 900 * 100) + '%' }"></div>
							</div>
							<span class="sd-slider-val">{{ item.value }}ms</span>
						</div>
					</div>
					<div v-if="item.desc" class="sd-desc">{{ item.desc }}</div>
				</div>
			</div>
		</div>

		<div class="sd-footer">
			<button class="sd-btn-primary">保存设置</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { settingMock } from '../mock';

const themeList = [
	{ key: 'blue', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'orange', primary: '#EA580C', back: '#FFF7ED', hover: '#FFEDD5' },
	{ key: 'dark', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
];

const currentTheme = ref('blue');
const theme = computed(() => themeList.find(t => t.key === currentTheme.value)!);
const isDark = computed(() => currentTheme.value === 'dark');

const themeVars = computed(() => {
	const t = theme.value;
	return {
		'--sd-primary': t.primary,
		'--sd-back': t.back,
		'--sd-card': isDark.value ? '#161A20' : '#FFFFFF',
		'--sd-border': isDark.value ? '#2A313C' : '#E5E7EB',
		'--sd-text': isDark.value ? '#E6E8EB' : '#0F172A',
		'--sd-text-muted': isDark.value ? '#9AA3AE' : '#64748B',
		'--sd-hover': t.hover,
	} as any;
});
</script>

<style scoped>
.setting-d {
	min-height: calc(100vh - 65px);
	background: var(--sd-back);
	color: var(--sd-text);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
	max-width: 800px;
	margin: 0 auto;
}

.sd-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.sd-title {
	font-size: 18px;
	font-weight: 600;
	margin: 0;
}

.sd-header-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.sd-theme-dots { display: flex; gap: 4px; }

.sd-dot {
	width: 18px;
	height: 18px;
	border: 2px solid var(--sd-card);
	outline: 1px solid var(--sd-border);
	border-radius: 50%;
	cursor: pointer;
}

.sd-dot.active {
	outline: 2px solid var(--sd-primary);
	transform: scale(1.15);
}

.sd-btn {
	padding: 7px 14px;
	font-size: 13px;
	color: var(--sd-text-muted);
	background: transparent;
	border: 1px solid var(--sd-border);
	border-radius: 8px;
	cursor: pointer;
}

.sd-btn:hover { background: var(--sd-hover); }

.sd-note {
	padding: 10px 14px;
	font-size: 12px;
	color: var(--sd-text-muted);
	background: var(--sd-hover);
	border-radius: 10px;
	margin-bottom: 20px;
}

.sd-card {
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 12px;
	margin-bottom: 14px;
	overflow: hidden;
}

.sd-card-header {
	padding: 14px 20px;
	font-size: 15px;
	font-weight: 600;
	border-bottom: 1px solid var(--sd-border);
}

.sd-card-body { padding: 14px 20px; }

.sd-form-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 0;
	border-bottom: 1px solid var(--sd-border);
}

.sd-form-item:last-child { border-bottom: none; }

.sd-label {
	width: 140px;
	font-size: 13px;
	font-weight: 500;
	color: var(--sd-text-muted);
	flex-shrink: 0;
}

.sd-control { flex: 1; }

.sd-switch {
	position: relative;
	width: 40px;
	height: 22px;
	background: var(--sd-border);
	border-radius: 11px;
	cursor: pointer;
	transition: background 0.2s;
}

.sd-switch.on { background: var(--sd-primary); }

.sd-switch-thumb {
	position: absolute;
	top: 2px;
	left: 2px;
	width: 18px;
	height: 18px;
	background: #fff;
	border-radius: 50%;
	transition: left 0.2s;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sd-switch.on .sd-switch-thumb { left: 20px; }

.sd-select {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 7px 12px;
	font-size: 13px;
	color: var(--sd-text);
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 8px;
	min-width: 160px;
}

.sd-select-arrow { color: var(--sd-text-muted); margin-left: auto; }

.sd-input {
	padding: 7px 12px;
	font-size: 13px;
	color: var(--sd-text);
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 8px;
	width: 120px;
	outline: none;
}

.sd-input:focus { border-color: var(--sd-primary); }

.sd-slider-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}

.sd-slider {
	position: relative;
	width: 200px;
	height: 4px;
	background: var(--sd-hover);
	border-radius: 2px;
}

.sd-slider-fill {
	height: 100%;
	background: var(--sd-primary);
	border-radius: 2px;
}

.sd-slider-val { font-size: 12px; color: var(--sd-text-muted); }

.sd-desc {
	font-size: 11px;
	color: var(--sd-text-muted);
	margin-left: auto;
}

.sd-footer {
	margin-top: 20px;
	text-align: center;
}

.sd-btn-primary {
	padding: 10px 40px;
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	background: var(--sd-primary);
	border: none;
	border-radius: 8px;
	cursor: pointer;
	width: 100%;
}

.sd-btn-primary:hover { filter: brightness(1.1); }
</style>
