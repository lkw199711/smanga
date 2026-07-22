<template>
	<div :class="['t-bookmark-item', `t-bookmark-item--${variant}`]" v-long-press="() => openThemeActionSheet('chapter', item)" @click="emit('click')" @contextmenu="emit('contextmenu', $event)">
		<t-cover
			class="t-bookmark-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
		>
			<i class="iconfont icon-bookmark t-bookmark-item__bookmark" />
			<div class="t-bookmark-item__page">P{{ pageText }}</div>
		</t-cover>

		<div class="t-bookmark-item__info">
			<div class="t-bookmark-item__title">{{ title }}</div>
			<div class="t-bookmark-item__sub">{{ subTitle }}</div>
		</div>

		<div v-if="progress > 0 && progress < 100" class="t-bookmark-item__progress">
			<div class="t-bookmark-item__progress-bar" :style="{ width: `${progress}%` }" />
		</div>
		<div v-else-if="progress >= 100" class="t-bookmark-item__finish" />
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
const subTitle = computed(() => {
	const chapter = String(props.item?.chapterName || '未知章节')
	const p = Number(props.item?.page || 1)
	return `${chapter} · 第 ${p} 页`
})

const pageText = computed(() => {
	const p = Number(props.item?.page || 1)
	return Number.isFinite(p) ? String(p) : '1'
})

const coverFile = computed(() => {
	const i: any = props.item || {}
	return (
		i.pageImage ||
		i.page_image ||
		i.chapterCover ||
		i.chapter_cover ||
		i.mangaCover ||
		i.manga_cover ||
		''
	)
})

const latest = computed(() => props.item?.latest || null)

const progress = computed(() => {
	if (!latest.value) return 0
	if (latest.value.finish) return 100
	const page = Number(latest.value.page || 0)
	const count = Number(latest.value.count || 0)
	if (!page || !count) return 0
	return Math.min(100, Math.max(0, Math.round((page / count) * 100)))
})
</script>

<style scoped>
.t-bookmark-item {
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


.t-bookmark-item--A {
	background: #fff;
	border: 1px solid #eaeaea;
}

.t-bookmark-item--A:hover {
	border-color: #d1d5db;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.t-bookmark-item--B {
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.06);
}

.t-bookmark-item--B:hover {
	background: rgba(255, 255, 255, 0.1);
}

.t-bookmark-item--D {
	background: var(--bg2);
	border: 1px solid var(--border);
}

.t-bookmark-item--D:hover {
	border-color: var(--accent);
}

.t-bookmark-item__cover {
	flex-shrink: 0;
	width: 52px;
	height: 70px;
	border-radius: 10px;
}

.t-bookmark-item__bookmark {
	position: absolute;
	top: 6px;
	left: 6px;
	font-size: 18px;
	color: var(--el-color-warning, #f59e0b);
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.t-bookmark-item__page {
	position: absolute;
	left: 6px;
	bottom: 6px;
	padding: 2px 6px;
	font-size: 11px;
	font-weight: 800;
	border-radius: 999px;
	background: rgba(0, 0, 0, 0.65);
	color: #fff;
}

.t-bookmark-item__info {
	min-width: 0;
	flex: 1;
}

.t-bookmark-item__title {
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-bookmark-item__sub {
	margin-top: 4px;
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	opacity: 0.7;
}

.t-bookmark-item--A .t-bookmark-item__title {
	color: #111827;
}

.t-bookmark-item--A .t-bookmark-item__sub {
	color: #6b7280;
}

.t-bookmark-item--B .t-bookmark-item__title {
	color: #fff;
}

.t-bookmark-item--B .t-bookmark-item__sub {
	color: rgba(255, 255, 255, 0.7);
}

.t-bookmark-item--D .t-bookmark-item__title {
	color: var(--fg);
}

.t-bookmark-item--D .t-bookmark-item__sub {
	color: var(--fg2);
}
/* 底部进度条（横跨整个卡片） */
.t-bookmark-item__progress {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: rgba(128, 128, 128, 0.15);
	z-index: 0;
	pointer-events: none;
}

.t-bookmark-item__progress-bar {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	min-width: 2px;
	background: #3b82f6;
	border-radius: 0 2px 2px 0;
	transition: width 0.4s ease;
}

.t-bookmark-item__finish {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	background: #10b981;
	z-index: 0;
	pointer-events: none;
}
</style>
