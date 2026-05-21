<template>
	<div class="setting-b">
		<header class="sb-header">
			<h1 class="sb-title">⚙️ 用户偏好</h1>
			<div class="sb-header-actions">
				<button class="sb-pill" @click="emit('navigate', { page: 'setting-serve' })">🖧 服务</button>
				<button class="sb-pill">🚪 登出</button>
				<button class="sb-pill">🖥 全屏</button>
			</div>
		</header>

		<div class="sb-hint-card">
			<span>💡</span>
			<span>调配完成后记得点击保存哦~</span>
		</div>

		<!-- 设置分组 -->
		<div v-for="group in settingMock" :key="group.title" class="sb-card">
			<div class="sb-card-header">✨ {{ group.title }}</div>
			<div class="sb-card-body">
				<div v-for="item in group.items" :key="item.label" class="sb-form-item">
					<label class="sb-label">{{ item.label }}</label>
					<div class="sb-control">
						<div v-if="item.type === 'switch'" :class="['sb-switch', { on: item.value }]">
							<div class="sb-switch-thumb"></div>
						</div>
						<div v-else-if="item.type === 'select'" class="sb-select">
							<span>{{ item.value }}</span>
							<span class="sb-select-arrow">▾</span>
						</div>
						<input v-else-if="item.type === 'input'" class="sb-input" :value="item.value" />
						<div v-else-if="item.type === 'slider'" class="sb-slider-wrap">
							<div class="sb-slider">
								<div class="sb-slider-fill" :style="{ width: ((item.value - 100) / 900 * 100) + '%' }"></div>
							</div>
							<span class="sb-slider-val">{{ item.value }}ms</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="sb-footer">
			<button class="sb-btn-save">💾 保存设置</button>
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
.setting-b {
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
	max-width: 800px;
	margin: 0 auto;
}

.sb-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.sb-title {
	font-size: 22px;
	font-weight: 800;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	margin: 0;
}

.sb-header-actions { display: flex; gap: 8px; }

.sb-pill {
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.72);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	cursor: pointer;
	color: #4b5563;
}

.sb-pill:hover { background: #fff; }

.sb-hint-card {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.72);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 16px;
	font-size: 13px;
	color: #6b7280;
	margin-bottom: 20px;
}

.sb-card {
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 20px;
	margin-bottom: 14px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(108, 141, 255, 0.06);
}

.sb-card-header {
	padding: 14px 20px;
	font-size: 15px;
	font-weight: 700;
	color: #1f2937;
	border-bottom: 1px dashed rgba(108, 141, 255, 0.15);
}

.sb-card-body { padding: 14px 20px; }

.sb-form-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 0;
}

.sb-label {
	width: 140px;
	font-size: 13px;
	font-weight: 500;
	color: #374151;
	flex-shrink: 0;
}

.sb-control { flex: 1; }

.sb-switch {
	position: relative;
	width: 44px;
	height: 24px;
	background: #e5e7eb;
	border-radius: 12px;
	cursor: pointer;
	transition: background 0.2s;
}

.sb-switch.on {
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
}

.sb-switch-thumb {
	position: absolute;
	top: 2px;
	left: 2px;
	width: 20px;
	height: 20px;
	background: #fff;
	border-radius: 50%;
	transition: left 0.2s;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.sb-switch.on .sb-switch-thumb { left: 22px; }

.sb-select {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	font-size: 13px;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	min-width: 160px;
}

.sb-select-arrow { color: #9ca3af; margin-left: auto; }

.sb-input {
	padding: 8px 14px;
	font-size: 13px;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	width: 120px;
	outline: none;
	color: #374151;
}

.sb-slider-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}

.sb-slider {
	position: relative;
	width: 200px;
	height: 6px;
	background: rgba(108, 141, 255, 0.15);
	border-radius: 3px;
}

.sb-slider-fill {
	height: 100%;
	background: linear-gradient(90deg, #ff6fa3, #6c8dff);
	border-radius: 3px;
}

.sb-slider-val { font-size: 12px; color: #6b7280; }

.sb-footer {
	margin-top: 20px;
	text-align: center;
}

.sb-btn-save {
	padding: 12px 40px;
	font-size: 14px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border: none;
	border-radius: 999px;
	cursor: pointer;
	width: 100%;
	box-shadow: 0 4px 16px rgba(255, 111, 163, 0.3);
}

.sb-btn-save:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 20px rgba(255, 111, 163, 0.4);
}
</style>
