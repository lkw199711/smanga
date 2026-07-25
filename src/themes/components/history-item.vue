<template>
	<div
		:class="['t-history-item', `t-history-item--${variant}`, 'no-select']"
		v-long-press="() => openThemeActionSheet('chapter', item)"
		@click="emit('click')"
		@contextmenu="emit('contextmenu', $event)"
	>
		<t-cover
			class="t-history-item__cover"
			:variant="variant"
			:seed="Number(item?.chapterId || item?.mangaId || 0)"
			:file="coverFile"
			fit="cover"
		>
			<div v-if="isRead" class="t-history-item__read">✓</div>
		</t-cover>

		<div class="t-history-item__info">
			<div class="t-history-item__title">{{ title }}</div>
			<div class="t-history-item__sub">
				<span class="t-history-item__chapter">{{ subTitle }}</span>
				<span v-if="timeText" class="t-history-item__time">· {{ timeText }}</span>
			</div>
			<div class="t-history-item__progress">
				<div
					class="t-history-item__progress-bar"
					:class="{ 'is-finish': progress >= 100 }"
					:style="{ width: `${Math.max(progress, 2)}%` }"
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

// 兼容多种时间格式(ISO字符串、时间戳、以及被 toLocaleString 处理过的本地化字符串,如 "2026/7/25 下午3:20:15")
function parseDateSafe(t: any): Date | null {
	if (t === null || t === undefined || t === '') return null
	// 时间戳(数字或纯数字字符串)
	if (typeof t=== 'number' || /^\d+$/.test(String(t))) {
		let n = Number(t)
		// 10位视为秒级时间戳
		if (String(Math.trunc(n)).length <= 10) n = n * 1000
		const d = new Date(n)
		return isNaN(d.getTime()) ? null : d
	}
	let s = String(t).trim()
	// 直接尝试解析
	let d = new Date(s)
	if (!isNaN(d.getTime())) return d
	// 处理形如 "2026/7/25 下午3:20:15" 或 "2026/7/25 上午11:20:15" 的中文本地化字符串
	const cn = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(上午|下午))?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/)
	if (cn) {
		let [, y, mo, da, ap, h, mi, se] = cn
		let hour = Number(h)
		if (ap === '下午' && hour < 12) hour += 12
		if (ap === '上午' && hour === 12) hour = 0
		d = new Date(Number(y), Number(mo) - 1, Number(da), hour, Number(mi), Number(se || 0))
		if (!isNaN(d.getTime())) return d
	}
	// 兜底: 把 / 换成 - 再试
	d = new Date(s.replace(/\//g, '-'))
	return isNaN(d.getTime()) ? null : d
}

const timeText = computed(() => {
	const t = props.item?.createTime
	if (!t) return ''
	// 明确的非法值直接不显示
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
.t-history-item {
	position: relative;
	display: flex;
	gap: 1.2rem;
	padding: 1.2rem;
	border-radius: 1.2rem;
	cursor: pointer;
	min-width: 0;
	transition: all 0.2s;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
}

.t-history-item * {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}

/* ---------- 变体 A ---------- */
.t-history-item--A {
	background: #fff;
	border: 1px solid #eaeaea;
}
.t-history-item--A:hover {
	border-color: #d1d5db;
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
}
.t-history-item--A .t-history-item__title {
	color: #111827;
}
.t-history-item--A .t-history-item__sub {
	color: #6b7280;
}
.t-history-item--A .t-history-item__progress {
	background: #f3f4f6;
}
.t-history-item--A .t-history-item__progress-bar {
	background: #3b82f6;
}
.t-history-item--A .t-history-item__progress-bar.is-finish {
	background: #10b981;
}

/* ---------- 变体 B ---------- */
.t-history-item--B {
	background: #fff;
	border: 1px solid #eaeaea;
}
.t-history-item--B:hover {
	border-color: #d1d5db;
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
}
.t-history-item--B .t-history-item__title {
	color: #111827;
}
.t-history-item--B .t-history-item__sub {
	color: #6b7280;
}
.t-history-item--B .t-history-item__progress {
	background: #f3f4f6;
}
.t-history-item--B .t-history-item__progress-bar {
	background: #3b82f6;
}
.t-history-item--B .t-history-item__progress-bar.is-finish {
	background: #10b981;
}

/* ---------- 变体 D ---------- */
.t-history-item--D {
	background: var(--bg2);
	border: 1px solid var(--border);
}
.t-history-item--D:hover {
	border-color: var(--accent);
	box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
}
.t-history-item--D .t-history-item__title {
	color: var(--fg);
}
.t-history-item--D .t-history-item__sub {
	color: var(--fg2);
}
.t-history-item--D .t-history-item__progress {
	background: var(--bg3, rgba(128, 128, 128, 0.15));
}
.t-history-item--D .t-history-item__progress-bar {
	background: var(--accent);
}
.t-history-item--D .t-history-item__progress-bar.is-finish {
	background: #10b981;
}

/* ---------- 封面 ---------- */
.t-history-item__cover {
	position: relative;
	flex-shrink: 0;
	width: 7rem;
	height: 9.6rem;
	border-radius: 0.8rem;
	overflow: hidden;
}

.t-history-item__read {
	position: absolute;
	top: 0.6rem;
	right: 0.6rem;
	width: 2rem;
	height: 2rem;
	border-radius: 99.9rem;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.2rem;
	font-weight: 800;
	background: rgba(255, 255, 255, 0.9);
	color: #10b981;
	z-index: 2;
}

/* ---------- 右侧信息 ---------- */
.t-history-item__info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 0.6rem;
}

.t-history-item__title {
	font-size: 1.4rem;
	font-weight: 600;
	line-height: 1.3;
	max-height: calc(1.4rem * 1.3 * 2);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	word-break: break-word;
	overflow-wrap: anywhere;
}

.t-history-item__sub {
	font-size: 1.2rem;
	line-height: 1.3;
	max-height: calc(1.2rem * 1.3 * 2);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	word-break: break-word;
	overflow-wrap: anywhere;
}

.t-history-item__chapter {
	overflow: hidden;
	text-overflow: ellipsis;
}

.t-history-item__time {
	margin-left: 0.4rem;
	opacity: 0.75;
}

/* ---------- 底部进度条（信息区内） ---------- */
.t-history-item__progress {
	height: 0.4rem;
	border-radius: 0.2rem;
	overflow: hidden;
	margin-top: 0.2rem;
}

.t-history-item__progress-bar {
	height: 100%;
	border-radius: 0.2rem;
	transition: width 0.4s ease;
}
</style>