<template>
	<div :class="['t-manga-card', `t-manga-card--${variant}`]" v-long-press="() => openThemeActionSheet('manga', item)" @click="emit('click')" @contextmenu="emit('contextmenu', $event)">
		<t-cover
			class="t-manga-card__cover"
			:variant="variant"
			:seed="Number(item?.mangaId || 0)"
			:file="coverFile"
			fit="cover"
		>
			<div v-if="tagText" class="t-manga-card__tag" :class="{ 'has-color': tagColor }" :style="tagColor ? { background: tagColor } : {}">{{ tagText }}</div>
			<div v-if="unreadCount > 0" class="t-manga-card__unread">{{ unreadCount }}</div>
		</t-cover>
		<div class="t-manga-card__name">{{ name }}</div>
		<div class="t-manga-card__meta" v-if="metaText">{{ metaText }}</div>
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
	(e: 'contextmenu', event: MouseEvent): void
}>()

const variant = computed(() => props.variant)

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
	const tag = props.tag
	if (!tag) return ''
	if (typeof tag === 'string') return tag.trim()
	return (tag as any).name || (tag as any).tagName || ''
})

const tagColor = computed(() => {
	const tag = props.tag
	if (!tag || typeof tag === 'string') return ''
	return (tag as any).color || (tag as any).tagColor || ''
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
	position: relative;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	/* 阻止 iOS 长按弹出预览菜单 / Android 抹蓝高亮 */
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
	transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
}

.t-manga-card * {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}


.t-manga-card__cover {
	position: relative;
	/* 关键:height 必须为 auto,否则会继承 t-cover 组件根元素的 height:100%,
	   在 grid item 里被 stretch 拉伸,把 name/meta 挤到卡片外部,造成
	   "卡片高度不含 name/meta,必须靠 row-gap:5rem 撑开"的假象 */
	height: auto;
	aspect-ratio: 3 / 4;
	border-radius: 1.4rem;
	overflow: hidden;
}

.t-manga-card__name {
	margin-top: 0.8rem;
	font-size: 1.3rem;
	font-weight: 600;
	line-height: 1.35;
	max-height: calc(1.3rem * 1.35 * 2);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	word-break: break-word;
	overflow-wrap: anywhere;
}

.t-manga-card__meta {
	margin-top: 0.4rem;
	font-size: 1.2rem;
	line-height: 1.35;
	max-height: calc(1.2rem * 1.35 * 2);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	word-break: break-word;
	overflow-wrap: anywhere;
	opacity: 0.75;
}

.t-manga-card__tag {
	position: absolute;
	top: 0.8rem;
	left: 0.8rem;
	padding: 0.3rem 0.8rem;
	font-size: 1.1rem;
	font-weight: 800;
	border-radius: 99.9rem;
	background: rgba(0, 0, 0, 0.55);
	color: #fff;
	backdrop-filter: blur(0.6rem);
}

.t-manga-card__unread {
	position: absolute;
	top: 0.8rem;
	right: 0.8rem;
	min-width: 2.2rem;
	height: 2.2rem;
	padding: 0 0.6rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 99.9rem;
	font-size: 1.2rem;
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
	transform: translateY(-0.2rem);
}

.t-manga-card--B .t-manga-card__name {
	color: #111827;
	padding: 0 0.8rem;
}
.t-manga-card--B .t-manga-card__meta {
	color: #6b7280;
	padding: 0 0.8rem;
}
.t-manga-card--B:hover {
	transform: translateY(-0.3rem);
	box-shadow: 0 0.6rem 2rem rgba(0, 0, 0, 0.1);
}

.t-manga-card--D .t-manga-card__name {
	color: var(--fg);
}
.t-manga-card--D .t-manga-card__meta {
	color: var(--fg2);
}
.t-manga-card--D:hover {
	transform: translateY(-0.2rem);
}
</style>
