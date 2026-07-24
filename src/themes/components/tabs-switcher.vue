<template>
	<div :class="['t-tabs', `t-tabs--${variant}`]">
		<button
			v-for="tab in tabs"
			:key="tab.value"
			:class="['t-tab', { 't-tab--active': tab.value === modelValue }]"
			@click="emit('update:modelValue', tab.value)"
		>
			{{ tab.label }}
			<span v-if="tab.count !== undefined && tab.value === modelValue" class="t-tab__badge">
				{{ tab.count }}
			</span>
		</button>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	tabs: { label: string; value: string; count?: number }[]
	modelValue: string
	variant?: 'A' | 'B' | 'D'
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped>
/* ===== 容器 ===== */
.t-tabs {
	display: flex;
	gap: 4px;
	margin-bottom: 18px;
}

/* ===== Theme A: 下划线风格 ===== */
.t-tabs--A {
	border-bottom: 2px solid #f3f4f6;
}

.t-tabs--A .t-tab {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 12px 22px;
	font-size: 14px;
	font-weight: 500;
	color: #9ca3af;
	background: none;
	border: none;
	border-bottom: 2px solid transparent;
	margin-bottom: -2px;
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
	outline: none;
	white-space: nowrap;
}

.t-tabs--A .t-tab:hover {
	color: #6b7280;
}

.t-tabs--A .t-tab--active {
	color: #2563eb;
	font-weight: 600;
	border-bottom-color: #2563eb;
}

.t-tabs--A .t-tab__badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 600;
	line-height: 1;
	border-radius: 10px;
	background: #dbeafe;
	color: #2563eb;
}

/* ===== Theme B: 下划线风格（同 A） ===== */
.t-tabs--B {
	border-bottom: 2px solid rgba(0, 0, 0, 0.08);
}

.t-tabs--B .t-tab {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 12px 22px;
	font-size: 14px;
	font-weight: 500;
	color: #9ca3af;
	background: none;
	border: none;
	border-bottom: 2px solid transparent;
	margin-bottom: -2px;
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
	outline: none;
	white-space: nowrap;
}

.t-tabs--B .t-tab:hover {
	color: #6b7280;
}

.t-tabs--B .t-tab--active {
	color: #a855f7;
	font-weight: 600;
	border-bottom-color: #a855f7;
}

.t-tabs--B .t-tab__badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 600;
	line-height: 1;
	border-radius: 10px;
	background: rgba(168, 85, 247, 0.15);
	color: #a855f7;
}

/* ===== Theme D: 下划线风格 + CSS变量 ===== */
.t-tabs--D {
	border-bottom: 2px solid var(--border);
}

.t-tabs--D .t-tab {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 12px 22px;
	font-size: 14px;
	font-weight: 500;
	color: var(--fg2);
	background: none;
	border: none;
	border-bottom: 2px solid transparent;
	margin-bottom: -2px;
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
	outline: none;
	white-space: nowrap;
}

.t-tabs--D .t-tab:hover {
	color: var(--fg);
}

.t-tabs--D .t-tab--active {
	color: var(--accent);
	font-weight: 600;
	border-bottom-color: var(--accent);
}

.t-tabs--D .t-tab__badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 600;
	line-height: 1;
	border-radius: 10px;
	background: var(--bg2);
	color: var(--accent);
}
</style>
