<template>
	<div class="setting-a">
		<header class="sa-header">
			<h1 class="sa-title">用户偏好</h1>
			<div class="sa-header-actions">
				<button class="sa-btn">登出用户</button>
				<button class="sa-btn">网页全屏</button>
			</div>
		</header>

		<div class="sa-note">请注意，设置调配完成后，需要点击保存按钮才能够提交保存。</div>

		<!-- 设置分组 -->
		<div v-for="group in settingMock" :key="group.title" class="sa-card">
			<div class="sa-card-header">{{ group.title }}</div>
			<div class="sa-card-body">
				<div v-for="item in group.items" :key="item.label" class="sa-form-item">
					<label class="sa-label">{{ item.label }}</label>
					<div class="sa-control">
						<!-- Switch -->
						<div v-if="item.type === 'switch'" :class="['sa-switch', { on: item.value }]">
							<div class="sa-switch-thumb"></div>
						</div>
						<!-- Select -->
						<div v-else-if="item.type === 'select'" class="sa-select">
							<span>{{ item.value }}</span>
							<span class="sa-select-arrow">▾</span>
						</div>
						<!-- Input -->
						<input v-else-if="item.type === 'input'" class="sa-input" :value="item.value" />
						<!-- Slider -->
						<div v-else-if="item.type === 'slider'" class="sa-slider-wrap">
							<div class="sa-slider">
								<div class="sa-slider-fill" :style="{ width: ((item.value - 100) / 900 * 100) + '%' }"></div>
								<div class="sa-slider-thumb" :style="{ left: ((item.value - 100) / 900 * 100) + '%' }"></div>
							</div>
							<span class="sa-slider-val">{{ item.value }}ms</span>
						</div>
					</div>
					<div v-if="item.desc" class="sa-desc">{{ item.desc }}</div>
				</div>
			</div>
		</div>

		<div class="sa-footer">
			<button class="sa-btn-primary">保存设置</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { settingMock } from '../mock';
</script>

<style scoped>
.setting-a {
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
	max-width: 800px;
	margin: 0 auto;
}

.sa-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.sa-title {
	font-size: 18px;
	font-weight: 600;
	margin: 0;
	color: #111827;
}

.sa-header-actions {
	display: flex;
	gap: 8px;
}

.sa-btn {
	padding: 7px 14px;
	font-size: 13px;
	color: #4b5563;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	cursor: pointer;
}

.sa-btn:hover { background: #f3f4f6; }

.sa-note {
	padding: 10px 14px;
	font-size: 12px;
	color: #6b7280;
	background: #f3f4f6;
	border-radius: 8px;
	margin-bottom: 20px;
}

.sa-card {
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	margin-bottom: 16px;
	overflow: hidden;
}

.sa-card-header {
	padding: 14px 20px;
	font-size: 15px;
	font-weight: 600;
	color: #111827;
	border-bottom: 1px solid #f3f4f6;
}

.sa-card-body {
	padding: 16px 20px;
}

.sa-form-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px 0;
	border-bottom: 1px solid #f9fafb;
}

.sa-form-item:last-child { border-bottom: none; }

.sa-label {
	width: 140px;
	font-size: 13px;
	font-weight: 500;
	color: #374151;
	flex-shrink: 0;
}

.sa-control {
	flex: 1;
}

.sa-switch {
	position: relative;
	width: 40px;
	height: 22px;
	background: #d1d5db;
	border-radius: 11px;
	cursor: pointer;
	transition: background 0.2s;
}

.sa-switch.on { background: #2563eb; }

.sa-switch-thumb {
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

.sa-switch.on .sa-switch-thumb { left: 20px; }

.sa-select {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 7px 12px;
	font-size: 13px;
	color: #374151;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	min-width: 160px;
}

.sa-select-arrow { color: #9ca3af; font-size: 12px; margin-left: auto; }

.sa-input {
	padding: 7px 12px;
	font-size: 13px;
	color: #374151;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	width: 120px;
	outline: none;
}

.sa-input:focus { border-color: #2563eb; }

.sa-slider-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}

.sa-slider {
	position: relative;
	width: 200px;
	height: 4px;
	background: #e5e7eb;
	border-radius: 2px;
}

.sa-slider-fill {
	position: absolute;
	height: 100%;
	background: #2563eb;
	border-radius: 2px;
}

.sa-slider-thumb {
	position: absolute;
	top: 50%;
	width: 14px;
	height: 14px;
	background: #2563eb;
	border: 2px solid #fff;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.sa-slider-val {
	font-size: 12px;
	color: #6b7280;
	min-width: 50px;
}

.sa-desc {
	font-size: 11px;
	color: #9ca3af;
	margin-left: auto;
}

.sa-footer {
	margin-top: 20px;
	text-align: center;
}

.sa-btn-primary {
	padding: 10px 40px;
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	background: #2563eb;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	width: 100%;
}

.sa-btn-primary:hover { background: #1d4ed8; }
</style>
