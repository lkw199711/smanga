<template>
	<div
		:class="['t-continue-item', `t-continue-item--${variant}`, 'no-select']"
		v-long-press="() => openThemeActionSheet('manga', item)"
		@click="emit('click')"
		@contextmenu="emit('contextmenu', $event)"
	>
		<t-cover
			class="t-continue-item__cover"
			:variant="variant"
			:seed="mangaId"
			:file="coverFile"
			fit="cover"
		>
			<div v-if="unreadCount > 0" class="t-continue-item__unread">{{ unreadCount }}</div>
		</t-cover>

		<div class="t-continue-item__info">
			<div class="t-continue-item__title">{{ title }}</div>
			<div class="t-continue-item__meta">
				<span>{{ chapterText }}</span>
				<span v-if="timeText"> · {{ timeText }}</span>
			</div>
			<div class="t-continue-item__progress">
				<div
					class="t-continue-item__progress-bar"
					:class="{ 'is-finish': progress >= 100 }"
					:style="{ width: `${progress}%` }"
				/>
			</div>
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
const mangaId = computed(() => Number(props.item?.mangaId || 0))
const title = computed(() => String(props.item?.mangaName || '未知漫画'))
const coverFile = computed(() => String(props.item?.mangaCover || ''))

const chapterCount = computed(() => {
	const count = Number(props.item?.chapterCount || 0)
	return Number.isFinite(count) ? Math.max(0, count) : 0
})

const unreadCount = computed(() => {
	const count = Number(props.item?.unWatched || 0)
	return Number.isFinite(count) ? Math.max(0, count) : 0
})

const chapterName = computed(() => String(props.item?.chapterName || ''))
const currentPage = computed(() => Number(props.item?.page || 0))
const pageCount = computed(() => Number(props.item?.count || 0))
const isFinished = computed(() => Boolean(props.item?.finish))

const progress = computed(() => {
	if (isFinished.value) return 100
	if (!currentPage.value || !pageCount.value) return 0
	return Math.min(100, Math.max(0, Math.round((currentPage.value / pageCount.value) * 100)))
})

const chapterText = computed(() => {
	return chapterName.value || (chapterCount.value ? `共 ${chapterCount.value} 章` : '继续阅读')
})

function parseDateSafe(t: any): Date | null {
	if (t === null || t === undefined || t === '') return null
	if (typeof t === 'number' || /^\d+$/.test(String(t))) {
		let n = Number(t)
		if (String(Math.trunc(n)).length <= 10) n = n * 1000
		const d = new Date(n)
		return isNaN(d.getTime()) ? null : d
	}

	let s = String(t).trim()
	let d = new Date(s)
	if (!isNaN(d.getTime())) return d

	const cn = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(上午|下午))?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/)
	if (cn) {
		let [, y, mo, da, ap, h, mi, se] = cn
		let hour = Number(h)
		if (ap === '下午' && hour < 12) hour += 12
		if (ap === '上午' && hour === 12) hour = 0
		d = new Date(Number(y), Number(mo) - 1, Number(da), hour, Number(mi), Number(se || 0))
		if (!isNaN(d.getTime())) return d
	}

	d = new Date(s.replace(/\//g, '-'))
	return isNaN(d.getTime()) ? null : d
}

const timeText = computed(() => {
	const t = props.item?.updateTime
	if (!t) return ''
	if (typeof t === 'string' && /invalid\s*date/i.test(t)) return ''
	const date = parseDateSafe(t)
	if (!date) return ''
	const diff = Date.now() - date.getTime()
	const mins = Math.floor(diff / 60000)
	if (mins < 1) return '刚刚'
	if (mins < 60) return `${mins} 分钟前`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `${hours} 小时前`
	const days = Math.floor(hours / 24)
	if (days < 7) return `${days} 天前`
	return date.toLocaleDateString()
})
</script>

<style scoped>
.t-continue-item {
	position: relative;
	display: flex;
	min-width: 0;
	gap: 1.2rem;
	padding: 1.2rem;
	border-radius: 1.2rem;
	cursor: pointer;
	user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
	transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.t-continue-item * {
	user-select: none;
	-webkit-touch-callout: none;
}

.t-continue-item--A,
.t-continue-item--B {
	border: 1px solid #eaeaea;
	background: #fff;
}

.t-continue-item--A:hover,
.t-continue-item--B:hover {
	border-color: #d1d5db;
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
	transform: translateY(-0.1rem);
}

.t-continue-item--D {
	border: 1px solid var(--border);
	background: var(--bg2);
}

.t-continue-item--D:hover {
	border-color: var(--accent);
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
	transform: translateY(-0.1rem);
}

.t-continue-item__cover {
	position: relative;
	width: 7rem;
	height: 9.6rem;
	flex-shrink: 0;
	overflow: hidden;
	border-radius: 0.8rem;
}

.t-continue-item__unread {
	position: absolute;
	top: 0.6rem;
	right: 0.6rem;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 2rem;
	height: 2rem;
	padding: 0 0.5rem;
	border-radius: 99.9rem;
	background: rgba(255, 255, 255, 0.92);
	font-size: 1.1rem;
	font-weight: 800;
}

.t-continue-item__unread {
	color: #ef4444;
}

.t-continue-item__info {
	display: flex;
	min-width: 0;
	flex: 1;
	flex-direction: column;
	justify-content: center;
	gap: 1rem;
}

.t-continue-item__title {
	display: -webkit-box;
	overflow: hidden;
	font-size: 1.4rem;
	font-weight: 600;
	line-height: 1.3;
	overflow-wrap: anywhere;
	text-overflow: ellipsis;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.t-continue-item__meta {
	overflow: hidden;
	font-size: 1.2rem;
	line-height: 1.3;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.t-continue-item__progress {
	width: 100%;
	height: 0.4rem;
	overflow: hidden;
	border-radius: 99.9rem;
}

.t-continue-item__progress-bar {
	height: 100%;
	border-radius: inherit;
	transition: width 0.2s;
}

.t-continue-item--A .t-continue-item__title,
.t-continue-item--B .t-continue-item__title {
	color: #111827;
}

.t-continue-item--A .t-continue-item__meta,
.t-continue-item--B .t-continue-item__meta {
	color: #6b7280;
}

.t-continue-item--A .t-continue-item__progress,
.t-continue-item--B .t-continue-item__progress {
	background: #f3f4f6;
}

.t-continue-item--A .t-continue-item__progress-bar {
	background: #3b82f6;
}

.t-continue-item--B .t-continue-item__progress-bar {
	background: #ff6fa3;
}

.t-continue-item--D .t-continue-item__title {
	color: var(--fg);
}

.t-continue-item--D .t-continue-item__meta {
	color: var(--fg2);
}

.t-continue-item--D .t-continue-item__progress {
	background: var(--bg3, rgba(128, 128, 128, 0.15));
}

.t-continue-item--D .t-continue-item__progress-bar {
	background: var(--accent);
}

.t-continue-item__progress-bar.is-finish {
	background: #10b981;
}
</style>
