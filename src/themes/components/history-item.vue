<template>
	<div :class="['t-history-item', `t-history-item--${variant}`]" @click="emit('click')" @contextmenu="emit('contextmenu', $event)">
		<t-cover
			class="t-history-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
		>
			<div v-if="isRead" class="t-history-item__read">✓</div>
			<div v-if="progress > 0 && progress < 100" class="t-history-item__progress">
				<div class="t-history-item__progress-bar" :style="{ width: `${progress}%` }" />
			</div>
		</t-cover>

		<div class="t-history-item__info">
			<div class="t-history-item__title">{{ title }}</div>
			<div class="t-history-item__sub">{{ subTitle }}</div>
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
</script>

<style scoped>
.t-history-item {
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
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.06);
}

.t-history-item--B:hover {
	background: rgba(255, 255, 255, 0.1);
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
	color: #fff;
}

.t-history-item--B .t-history-item__sub {
	color: rgba(255, 255, 255, 0.7);
}

.t-history-item--D .t-history-item__title {
	color: var(--fg);
}

.t-history-item--D .t-history-item__sub {
	color: var(--fg2);
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
}

.t-history-item__progress {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 4px;
	background: rgba(0, 0, 0, 0.35);
}

.t-history-item__progress-bar {
	height: 100%;
	background: #2563eb;
}
</style>
