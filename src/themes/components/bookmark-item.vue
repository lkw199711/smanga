<template>
	<div :class="['t-bookmark-item', `t-bookmark-item--${variant}`]" @click="emit('click')">
		<t-cover
			class="t-bookmark-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
		>
			<div class="t-bookmark-item__page">P{{ pageText }}</div>
		</t-cover>

		<div class="t-bookmark-item__info">
			<div class="t-bookmark-item__title">{{ title }}</div>
			<div class="t-bookmark-item__sub">{{ subTitle }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import TCover from './media-cover.vue'

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
	return props.item?.pageImage || props.item?.chapterCover || props.item?.mangaCover || ''
})
</script>

<style scoped>
.t-bookmark-item {
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
</style>
