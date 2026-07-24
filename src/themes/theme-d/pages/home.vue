<template>
	<div class="sd-home">
		<section class="sd-stats">
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📚</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ stats.totalManga.toLocaleString() }}</div>
					<div class="sd-stat-label">漫画总数</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📖</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ stats.totalChapter.toLocaleString() }}</div>
					<div class="sd-stat-label">章节总数</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">🔥</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ stats.readToday }}</div>
					<div class="sd-stat-label">今日阅读</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">⭐</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ stats.readThisWeek }}</div>
					<div class="sd-stat-label">本周阅读</div>
				</div>
			</div>
		</section>

		<section class="sd-section">
			<div class="sd-section-head">
				<h2>继续阅读</h2>
				<a class="sd-link" @click="router.push('/t/history')">查看全部 →</a>
			</div>
			<div class="sd-continue">
				<div v-for="m in continueReading" :key="m.id" class="sd-cont-card no-select" v-long-press="() => openThemeActionSheet('chapter', m)" @click="goRead(m)" @contextmenu="openThemeContextMenu($event, 'chapter', m)">
					<div class="sd-cont-cover"
						:style="coverStyle(m, { kind: 'chapter', fallbackSeed: m.id })">
						<span v-if="m.tag" class="sd-cont-tag">{{ m.tag }}</span>
						<span v-if="m.unread" class="sd-cont-unread">{{ m.unread }}</span>
					</div>
					<div class="sd-cont-info">
						<div class="sd-cont-name">{{ m.name }}</div>
						<div class="sd-cont-chapter">{{ m.chapter }}</div>
						<div class="sd-cont-progress">
							<div class="sd-cont-progress-bar" :style="{ width: m.progress + '%' }"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="sd-section">
			<div class="sd-section-head">
				<h2>最近添加</h2>
				<a class="sd-link" @click="router.push('/t/media')">查看全部 →</a>
			</div>
			<div class="sd-grid">
				<div v-for="m in recentAdded" :key="m.id" class="sd-grid-card" @click="goManga(m)" @contextmenu="openThemeContextMenu($event, 'manga', m)">
					<div class="sd-grid-cover"
						:style="coverStyle(m, { kind: 'manga', fallbackSeed: m.id })">
						<span v-if="m.tag" class="sd-grid-tag">{{ m.tag }}</span>
					</div>
					<div class="sd-grid-name">{{ m.name }}</div>
					<div class="sd-grid-meta">{{ m.chapter }}</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'
import imageApi from '@/api/image'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

type MangaCard = {
	id: number
	chapterId?: number
	mangaId?: number
	name: string
	chapter: string
	unread?: number
	progress: number
	gradient: [string, string]
	tag?: string
}

const router = useRouter()

const stats = ref({
	totalManga: 0,
	totalChapter: 0,
	readToday: 0,
	readThisWeek: 0,
})

const continueReading = ref<MangaCard[]>([])
const recentAdded = ref<MangaCard[]>([])
const coverCache = ref<Record<string, string>>({})

const palette: [string, string][] = [
	['#FFB5A7', '#FEC89A'],
	['#A0C4FF', '#BDB2FF'],
	['#B9FBC0', '#A0E8AF'],
	['#FDCB82', '#F7B267'],
	['#C5DEDD', '#F0EFEB'],
	['#FCD5CE', '#F8EDEB'],
	['#CDB4DB', '#FFC8DD'],
	['#BEE1E6', '#FAF3DD'],
	['#F1C0E8', '#CFBAF0'],
	['#90DBF4', '#8EECF5'],
	['#F7AEF8', '#B388EB'],
	['#FF9F1C', '#FFBF69'],
]

function getGradient(id: number) {
	return palette[id % palette.length]
}

function getProgress(item: any) {
	const latest = item?.latest
	if (!latest) return 0
	if (latest.finish) return 100
	const page = Number(latest.page || 0)
	const count = Number(latest.count || 0)
	if (!page || !count) return 0
	return Math.min(100, Math.max(0, Math.round((page / count) * 100)))
}

onMounted(async () => {
	try {
		const r = await chartsApi.get_count()
		stats.value = {
			...stats.value,
			totalManga: Number(r?.mangaCount || 0),
			totalChapter: Number(r?.chapterCount || 0),
			readToday: Number(r?.readToday || 0),
			readThisWeek: Number(r?.readThisWeek || 0),
		}
	} catch { }

	try {
		const r = await historyApi.get_history(1, 6)
		const list = r?.list || []
		continueReading.value = list.map((item: any) => ({
			...item,
			id: Number(item.chapterId),
			chapterId: Number(item.chapterId),
			mangaId: Number(item.mangaId),
			name: item.mangaName || '未知漫画',
			chapter: item.chapterName || '未知章节',
			chapterCover: item.chapterCover,
			progress: getProgress(item),
			gradient: getGradient(Number(item.chapterId)),
		}))
	} catch { }

	try {
		const list = await latestApi.get(1, 12)
		recentAdded.value = (list || []).map((item: any) => ({
			id: Number(item.mangaId),
			mangaId: Number(item.mangaId),
			name: item.mangaName || '未知漫画',
			mangaCover: item.mangaCover,
			chapter: `${Number(item.chapterCount || 0)} 章节`,
			progress: 0,
			gradient: getGradient(Number(item.mangaId)),
		}))
	} catch { }

	console.log('continueReading', continueReading.value)
	await warmCovers(continueReading.value, { kind: 'chapter' })
	await warmCovers(recentAdded.value, { kind: 'manga' })
})

function goRead(item: MangaCard) {
	router.push(`/t/reader/${item.id}`)
}

function goManga(item: MangaCard) {
	router.push(`/t/manga/${item.id}`)
}

async function warmCovers(list: any[], opt: { kind: 'manga' | 'chapter' }) {
	const files = Array.from(
		new Set(
			list
				.map((it) => (opt.kind === 'manga' ? it?.mangaCover : it?.chapterCover || it?.pageImage))
				.filter(Boolean)
		)
	) as string[]

	await Promise.allSettled(
		files.map(async (file) => {
			if (coverCache.value[file]) return
			const src = await imageApi.get({ file })
			coverCache.value[file] = src
		})
	)
}

function coverStyle(
	item: any,
	opt: { kind: 'manga' | 'chapter'; fallbackSeed: number }
): Record<string, string> {
	const file = opt.kind === 'manga' ? item?.mangaCover : item?.chapterCover || item?.pageImage
	const src = file ? coverCache.value[file] : ''
	if (src) {
		return { backgroundImage: `url("${src}")` }
	}
	const g = getGradient(Number(opt.fallbackSeed) || 0)
	return { backgroundImage: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }
}
</script>

<style scoped>
.sd-home {
	min-width: 0;
}

.sd-stats {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 28px;
}

/* 窄屏改 2×2 布局，避免 4 列在 <=640px 撑爆容器 */
@media (max-width: 640px) {
	.sd-stats {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		margin-bottom: 20px;
	}
}

.sd-stat-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 16px 18px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
	min-width: 0;
	overflow: hidden;
}

.sd-stat-info {
	min-width: 0;
	flex: 1;
}

@media (max-width: 640px) {
	.sd-stat-card {
		padding: 12px 12px;
		gap: 10px;
	}
}

.sd-stat-icon {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	border-radius: 10px;
	flex-shrink: 0;
}

@media (max-width: 640px) {
	.sd-stat-icon {
		width: 36px;
		height: 36px;
		font-size: 18px;
		border-radius: 8px;
	}
}

.sd-stat-value {
	font-size: 20px;
	font-weight: 700;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

@media (max-width: 640px) {
	.sd-stat-value {
		font-size: 16px;
	}
}

.sd-stat-label {
	font-size: 12px;
	color: var(--sd-text-muted);
	margin-top: 2px;
}

.sd-section {
	margin-bottom: 28px;
}

.sd-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sd-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.sd-link {
	font-size: 13px;
	color: var(--sd-primary);
	cursor: pointer;
	font-weight: 500;
}

.sd-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sd-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.sd-cont-card:hover {
	border-color: var(--sd-primary);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sd-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 8px;
	overflow: hidden;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: var(--sd-hover);
}

.sd-cont-tag {
	position: absolute;
	top: 6px;
	left: 6px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 4px;
}

.sd-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sd-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sd-cont-name {
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-cont-chapter {
	font-size: 12px;
	color: var(--sd-text-muted);
}

.sd-cont-progress {
	height: 4px;
	background: var(--sd-hover);
	border-radius: 2px;
	overflow: hidden;
}

.sd-cont-progress-bar {
	height: 100%;
	background: var(--sd-primary);
	border-radius: 2px;
}

.sd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sd-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sd-grid-card:hover {
	transform: translateY(-2px);
}

.sd-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 10px;
	margin-bottom: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: var(--sd-hover);
}

.sd-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 4px;
}

.sd-grid-name {
	font-size: 13px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: var(--sd-text-faint);
}

</style>
