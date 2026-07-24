<template>
	<div
		:class="['t-history-item', `t-history-item--${variant}`]"
		v-long-press="() => openThemeActionSheet('chapter', item)"
		@click="emit('click')"
		@contextmenu="emit('contextmenu', $event)"
	>
		<t-cover
			class="t-history-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
		>
			<div v-if="isRead" class="t-history-item__read">✓</div>
		</t-cover>

		<div class="t-history-item__info">
			<div class="t-history-item__title">{{ title }}</div>
			<div class="t-history-item__sub">{{ subTitle }}</div>
			<div v-if="timeText" class="t-history-item__time">{{ timeText }}</div>
		</div>

		<div v-if="progress > 0 && progress < 100" class="t-history-item__progress">
			<div class="t-history-item__progress-bar" :style="{ width: `${progress}%` }" />
		</div>
		<div v-else-if="progress >= 100" class="t-history-item__finish" />
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import TCover from './media-cover.vue'
import { openThemeActionSheet } from '@/themes/context-menu'

const props = withDefaults(
	defineProps<{
		item: any
		variant?: 'A' | 'B' | 'D'
	}>(),
	{
		variant: 'A',
	}
)

const emit = defineEmits<{
	(e: 'click'): void
	(e: 'contextmenu', event: MouseEvent): void
}>()

const variant = computed(() => props.variant)

const title = computed(() => String(props.item?.mangaName || '未知漫画'))
const subTitle = computed(() => String(props.item?.chapterName || '未知章节'))

const coverFile = computed(() => {
	return props.item?.pageImage || props.item?.chapterCover || props.item?.mangaCover || ''
})

const latest = computed(() => props.item?.latest || null)

const isRead = computed(() => {
	return !!latest.value?.finish
})

const progress = computed(() => {
	if (!latest.value) return 0
	if (latest.value.finish) return 100
	const page = Number(latest.value.page || 0)
	const count = Number(latest.value.count || 0)
	if (!page || !count) return 0
	return Math.min(100, Math.max(0, Math.round((page / count) * 100)))
})

const timeText = computed(() => {
	const t = props.item?.createTime
	if (!t) return ''
	const diff = Date.now() - new Date(t).getTime()
	const mins = Math.floor(diff / 60000)
	if (mins < 1) return '刚刚'
	if (mins < 60) return `${mins} 分钟前`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `${hours} 小时前`
	const days = Math.floor(hours / 24)
	if (days < 7) return `${days} 天前`
	return new Date(t).toLocaleDateString()
})
</script>

<style scoped>
.t-history-item {
	position: relative;
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px;
	border-radius: 12px;
	cursor: pointer;
	user-select: none;
	transition: all 0.15s;
}


.t-history-item--A {
	background: #fff;
	border: 1px solid #eaeaea;
}

.t-history-item--A:hover {
	border-color: #d1d5db;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.t-history-item--B {
	background: #fff;
	border: 1px solid #eaeaea;
}

.t-history-item--B:hover {
	border-color: #d1d5db;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.t-history-item--D {
	background: var(--bg2);
	border: 1px solid var(--border);
}

.t-history-item--D:hover {
	border-color: var(--accent);
}

.t-history-item__cover {
	flex-shrink: 0;
	width: 52px;
	height: 70px;
	border-radius: 10px;
}

.t-history-item__info {
	min-width: 0;
	flex: 1;
}

.t-history-item__title {
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-history-item__sub {
	margin-top: 4px;
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	opacity: 0.7;
}

.t-history-item--A .t-history-item__title {
	color: #111827;
}

.t-history-item--A .t-history-item__sub {
	color: #6b7280;
}

.t-history-item--B .t-history-item__title {
	color: #111827;
}

.t-history-item--B .t-history-item__sub {
	color: #6b7280;
}

.t-history-item--D .t-history-item__title {
	color: var(--fg);
}

.t-history-item--D .t-history-item__sub {
	color: var(--fg2);
}

.t-history-item--A .t-history-item__time {
	color: #9ca3af;
}

.t-history-item--B .t-history-item__time {
	color: #9ca3af;
}

.t-history-item--D .t-history-item__time {
	color: var(--fg3);
}

.t-history-item__read {
	position: absolute;
	top: 6px;
	right: 6px;
	width: 20px;
	height: 20px;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 800;
	background: rgba(255, 255, 255, 0.9);
	color: #10b981;
	z-index: 2;
}

/* --- 底部进度条（横跨整个卡片） --- */
.t-history-item__progress {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: rgba(128, 128, 128, 0.15);
	z-index: 0;
	pointer-events: none;
}

.t-history-item__progress-bar {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	min-width: 2px;
	background: #3b82f6;
	border-radius: 0 2px 2px 0;
	transition: width 0.4s ease;
}

.t-history-item__finish {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: #10b981;
	z-index: 0;
	pointer-events: none;
}

.t-history-item__time {
	margin-top: 4px;
	font-size: 11px;
	opacity: 0.55;
}
</style>
