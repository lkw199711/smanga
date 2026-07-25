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
				<t-history-item
					v-for="item in continueReading"
					:key="item.chapterId"
					:item="item"
					variant="D"
					@click="goRead(item)"
					@contextmenu="openThemeContextMenu($event, 'chapter', item)"
				/>
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
import THistoryItem from '@/themes/components/history-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'

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

const continueReading = ref<any[]>([])
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
		continueReading.value = r?.list || []
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
	await warmCovers(recentAdded.value, { kind: 'manga' })
})

function goRead(item: any) {
	router.push(`/t/reader/${item.chapterId}`)
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
	gap: 1.4rem;
	margin-bottom: 2.8rem;
}

/* 窄屏改 2×2 布局，避免 4 列在 <=64rem 撑爆容器 */
@media (max-width: 64rem) {
	.sd-stats {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
}

.sd-stat-card {
	display: flex;
	align-items: center;
	gap: 1.4rem;
	padding: 1.6rem 1.8rem;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 1.2rem;
	box-shadow: 0 1px 0.2rem rgba(0, 0, 0, 0.03);
	min-width: 0;
	overflow: hidden;
}

.sd-stat-info {
	min-width: 0;
	flex: 1;
}

@media (max-width: 64rem) {
	.sd-stat-card {
		padding: 1.2rem 1.2rem;
		gap: 1rem;
	}
}

.sd-stat-icon {
	width: 4.2rem;
	height: 4.2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	border-radius: 1rem;
	flex-shrink: 0;
}

@media (max-width: 64rem) {
	.sd-stat-icon {
		width: 3.6rem;
		height: 3.6rem;
		font-size: 1.8rem;
		border-radius: 0.8rem;
	}
}

.sd-stat-value {
	font-size: 2rem;
	font-weight: 700;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

@media (max-width: 64rem) {
	.sd-stat-value {
		font-size: 1.6rem;
	}
}

.sd-stat-label {
	font-size: 1.2rem;
	color: var(--sd-text-muted);
	margin-top: 0.2rem;
}

.sd-section {
	margin-bottom: 2.8rem;
}

.sd-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 1.4rem;
}

.sd-section-head h2 {
	margin: 0;
	font-size: 1.6rem;
	font-weight: 600;
}

.sd-link {
	font-size: 1.3rem;
	color: var(--sd-primary);
	cursor: pointer;
	font-weight: 500;
}

.sd-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
	gap: 1.4rem;
}

.sd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
	gap: 1.8rem;
}

.sd-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sd-grid-card:hover {
	transform: translateY(-0.2rem);
}

.sd-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 1rem;
	margin-bottom: 0.8rem;
	box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.06);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: var(--sd-hover);
}

.sd-grid-tag {
	position: absolute;
	top: 0.8rem;
	left: 0.8rem;
	padding: 0.3rem 0.7rem;
	font-size: 1rem;
	font-weight: 600;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 0.4rem;
}

.sd-grid-name {
	font-size: 1.3rem;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-grid-meta {
	margin-top: 0.2rem;
	font-size: 1.1rem;
	color: var(--sd-text-faint);
}

</style>
