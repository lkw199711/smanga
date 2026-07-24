<template>
	<div
		:class="['t-chapter-item', `t-chapter-item--${variant}`]"
		v-long-press="() => openThemeActionSheet('chapter', item)"
		@click="emit('click')"
		@contextmenu="emit('contextmenu', $event)"
	>
		<t-cover
			v-if="showCover"
			class="t-chapter-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
		/>
		<div class="t-chapter-item__info">
			<div class="t-chapter-item__title">{{ displayTitle }}</div>
			<div v-if="displaySub" class="t-chapter-item__sub">{{ displaySub }}</div>
		</div>
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
		showCover?: boolean
		title?: string
		sub?: string
	}>(),
	{
		variant: 'A',
		showCover: true,
		title: '',
		sub: '',
	}
)

const emit = defineEmits<{
	(e: 'click'): void
	(e: 'contextmenu', event: MouseEvent): void
}>()

const variant = computed(() => props.variant)

/** 封面文件：优先 pageImage → chapterCover → chapterImage → mangaCover */
const coverFile = computed(() => {
	const i: any = props.item || {}
	return i.pageImage || i.chapterCover || i.chapterImage || i.mangaCover || ''
})

/** 标题：优先 props.title → item.chapterName */
const displayTitle = computed(() => {
	if (props.title) return props.title
	return String(props.item?.chapterName || '未知章节')
})

/** 副标题：优先 props.sub → 根据 item 字段自动推断 */
const displaySub = computed(() => {
	if (props.sub) return props.sub
	const i: any = props.item || {}
	// 有页数 → 显示页数
	if (i.pageCount && i.pageCount > 0) return `${i.pageCount} 页`
	// 有路径 → 显示路径
	if (i.chapterPath) return String(i.chapterPath)
	// 有漫画名 → 显示漫画名（收藏场景）
	if (i.mangaName) return String(i.mangaName)
	return ''
})
</script>

<style scoped>
.t-chapter-item {
	position: relative;
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px;
	border-radius: 12px;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	/* 阻止 iOS 长按弹出预览菜单 / Android 抹蓝高亮 */
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
	transition: all 0.15s;
}

.t-chapter-item * {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}

/* ===== Theme A ===== */
.t-chapter-item--A {
	background: #fff;
	border: 1px solid #eaeaea;
}

.t-chapter-item--A:hover {
	border-color: #d1d5db;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.t-chapter-item--A .t-chapter-item__title {
	color: #111827;
}

.t-chapter-item--A .t-chapter-item__sub {
	color: #6b7280;
}

/* ===== Theme B ===== */
.t-chapter-item--B {
	background: #fff;
	border: 1px solid #eaeaea;
}

.t-chapter-item--B:hover {
	border-color: #d1d5db;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.t-chapter-item--B .t-chapter-item__title {
	color: #111827;
}

.t-chapter-item--B .t-chapter-item__sub {
	color: #6b7280;
}

/* ===== Theme D ===== */
.t-chapter-item--D {
	background: var(--bg2);
	border: 1px solid var(--border);
}

.t-chapter-item--D:hover {
	border-color: var(--accent);
}

.t-chapter-item--D .t-chapter-item__title {
	color: var(--fg);
}

.t-chapter-item--D .t-chapter-item__sub {
	color: var(--fg2);
}

/* ===== 内部元素 ===== */
.t-chapter-item__cover {
	flex-shrink: 0;
	width: 52px;
	height: 70px;
	border-radius: 10px;
}

.t-chapter-item__info {
	min-width: 0;
	flex: 1;
}

.t-chapter-item__title {
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-chapter-item__sub {
	margin-top: 4px;
	font-size: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	opacity: 0.7;
}
</style>
