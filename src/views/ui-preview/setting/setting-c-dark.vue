<template>
	<div class="setting-c">
		<header class="sc-header">
			<div class="sc-breadcrumb">
				<span class="sc-crumb-muted">Settings</span>
				<span class="sc-crumb-sep">/</span>
				<span>Preferences</span>
			</div>
			<div class="sc-header-actions">
				<button class="sc-btn" @click="emit('navigate', { page: 'setting-serve' })">Server</button>
				<button class="sc-btn">Logout</button>
				<button class="sc-btn">Fullscreen</button>
			</div>
		</header>

		<!-- 设置分组 -->
		<div v-for="group in settingMock" :key="group.title" class="sc-card">
			<div class="sc-card-header">{{ group.title }}</div>
			<div class="sc-card-body">
				<div v-for="item in group.items" :key="item.label" class="sc-form-item">
					<label class="sc-label">{{ item.label }}</label>
					<div class="sc-control">
						<div v-if="item.type === 'switch'" :class="['sc-switch', { on: item.value }]">
							<div class="sc-switch-thumb"></div>
						</div>
						<div v-else-if="item.type === 'select'" class="sc-select">
							<span>{{ item.value }}</span>
							<span class="sc-select-arrow">▾</span>
						</div>
						<input v-else-if="item.type === 'input'" class="sc-input" :value="item.value" />
						<div v-else-if="item.type === 'slider'" class="sc-slider-wrap">
							<div class="sc-slider">
								<div class="sc-slider-fill" :style="{ width: ((item.value - 100) / 900 * 100) + '%' }"></div>
							</div>
							<span class="sc-slider-val">{{ item.value }}ms</span>
						</div>
					</div>
					<div v-if="item.desc" class="sc-desc">{{ item.desc }}</div>
				</div>
			</div>
		</div>

		<div class="sc-footer">
			<button class="sc-btn-primary">Save Changes</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { settingMock } from '../mock';

const emit = defineEmits<{
	navigate: [payload: { page: string; params?: Record<string, any> }];
}>();
</script>

<style scoped>
.setting-c {
	min-height: calc(100vh - 65px);
	background: #0d0f12;
	color: #e6e8eb;
	font-size: 13px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 24px;
	max-width: 800px;
	margin: 0 auto;
}

.sc-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.sc-breadcrumb {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
}

.sc-crumb-muted { color: #5c6470; }
.sc-crumb-sep { color: #2a313c; }

.sc-header-actions { display: flex; gap: 6px; }

.sc-btn {
	padding: 6px 12px;
	font-size: 12px;
	color: #9aa3ae;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 6px;
	cursor: pointer;
}

.sc-btn:hover { background: #1e232b; color: #e6e8eb; }

.sc-card {
	background: #161a20;
	border: 1px solid #2a313c;
	border-radius: 10px;
	margin-bottom: 14px;
	overflow: hidden;
}

.sc-card-header {
	padding: 12px 18px;
	font-size: 13px;
	font-weight: 600;
	color: #e6e8eb;
	border-bottom: 1px solid #2a313c;
}

.sc-card-body { padding: 14px 18px; }

.sc-form-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 10px 0;
	border-bottom: 1px solid #1e232b;
}

.sc-form-item:last-child { border-bottom: none; }

.sc-label {
	width: 140px;
	font-size: 12px;
	font-weight: 500;
	color: #9aa3ae;
	flex-shrink: 0;
}

.sc-control { flex: 1; }

.sc-switch {
	position: relative;
	width: 36px;
	height: 20px;
	background: #2a313c;
	border-radius: 10px;
	cursor: pointer;
	transition: background 0.2s;
}

.sc-switch.on { background: #f5a524; }

.sc-switch-thumb {
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	background: #0d0f12;
	border-radius: 50%;
	transition: left 0.2s;
}

.sc-switch.on .sc-switch-thumb { left: 18px; background: #0d0f12; }

.sc-select {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	font-size: 12px;
	color: #e6e8eb;
	background: #1e232b;
	border: 1px solid #2a313c;
	border-radius: 6px;
	min-width: 140px;
}

.sc-select-arrow { color: #5c6470; margin-left: auto; }

.sc-input {
	padding: 6px 12px;
	font-size: 12px;
	color: #e6e8eb;
	background: #1e232b;
	border: 1px solid #2a313c;
	border-radius: 6px;
	width: 100px;
	outline: none;
}

.sc-input:focus { border-color: #f5a524; }

.sc-slider-wrap {
	display: flex;
	align-items: center;
	gap: 10px;
}

.sc-slider {
	position: relative;
	width: 180px;
	height: 4px;
	background: #2a313c;
	border-radius: 2px;
}

.sc-slider-fill {
	height: 100%;
	background: #f5a524;
	border-radius: 2px;
}

.sc-slider-val {
	font-size: 11px;
	color: #5c6470;
	font-family: 'SF Mono', Consolas, monospace;
}

.sc-desc {
	font-size: 10px;
	color: #5c6470;
	margin-left: auto;
}

.sc-footer {
	margin-top: 18px;
	text-align: center;
}

.sc-btn-primary {
	padding: 10px 40px;
	font-size: 13px;
	font-weight: 600;
	color: #0d0f12;
	background: #f5a524;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	width: 100%;
}

.sc-btn-primary:hover { background: #ffb93a; }
</style>
