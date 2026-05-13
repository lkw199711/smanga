<template>
	<div :class="['t-manga-card', `t-manga-card--${variant}`]" @click="emit('click')">
		<t-cover
			class="t-manga-card__cover"
			:variant="variant"
			:seed="Number(item?.mangaId || 0)"
			:file="coverFile"
		>
			<div v-if="tagText" class="t-manga-card__tag">{{ tagText }}</div>
			<div v-if="unreadCount > 0" class="t-manga-card__unread">{{ unreadCount }}</div>
		</t-cover>
		<div class="t-manga-card__name">{{ name }}</div>
		<div class="t-manga-card__meta" v-if="metaText">{{ metaText }}</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import TCover from './media-cover.vue'

const props = withDefaults(
	defineProps<{
		item: any
		variant?: 'A' | 'B' | 'D'
		tag?: string
		unread?: number
		meta?: string
	}>(),
	{
		variant: 'A',
		tag: '',
		unread: 0,
		meta: '',
	}
)

const emit = defineEmits<{
	(e: 'click'): void
}>()

const variant = computed(() => props.variant)

console.log('MangaCard', props.item)

const name = computed(() => String(props.item?.mangaName || props.item?.title || '未知漫画'))

const coverFile = computed(() => {
	const i: any = props.item || {}
	return i.mangaCover || i.manga_cover || ''
})

const unreadCount = computed(() => {
	if (Number.isFinite(Number(props.unread)) && Number(props.unread) > 0) return Number(props.unread)
	const n = Number((props.item as any)?.unWatched || (props.item as any)?.unread || 0)
	return Number.isFinite(n) ? n : 0
})

const tagText = computed(() => {
	const t = String(props.tag || '')
	return t.trim() ? t : ''
})

const metaText = computed(() => {
	const m = String(props.meta || '')
	if (m.trim()) return m
	const c = Number((props.item as any)?.chapterCount || 0)
	return Number.isFinite(c) ? `${c} 章节` : ''
})
</script>

<style scoped>
.t-manga-card {
	cursor: pointer;
	user-select: none;
	transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
}

.t-manga-card__cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 14px;
	overflow: hidden;
}

.t-manga-card__name {
	margin-top: 8px;
	font-size: 13px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-manga-card__meta {
	margin-top: 4px;
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	opacity: 0.75;
}

.t-manga-card__tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 8px;
	font-size: 11px;
	font-weight: 800;
	border-radius: 999px;
	background: rgba(0, 0, 0, 0.55);
	color: #fff;
	backdrop-filter: blur(6px);
}

.t-manga-card__unread {
	position: absolute;
	top: 8px;
	right: 8px;
	min-width: 22px;
	height: 22px;
	padding: 0 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 800;
	background: rgba(255, 255, 255, 0.92);
	color: #ef4444;
}

.t-manga-card--A .t-manga-card__name {
	color: #111827;
}
.t-manga-card--A .t-manga-card__meta {
	color: #6b7280;
}
.t-manga-card--A:hover {
	transform: translateY(-2px);
}

.t-manga-card--B .t-manga-card__name {
	color: #111827;
}
.t-manga-card--B .t-manga-card__meta {
	color: #6b7280;
}
.t-manga-card--B:hover {
	transform: translateY(-3px);
}

.t-manga-card--D .t-manga-card__name {
	color: var(--fg);
}
.t-manga-card--D .t-manga-card__meta {
	color: var(--fg2);
}
.t-manga-card--D:hover {
	transform: translateY(-2px);
}
</style>
