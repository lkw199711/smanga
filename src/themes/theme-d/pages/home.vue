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
				<div v-for="m in continueReading" :key="m.id" class="sd-cont-card" @click="goRead(m)">
					<div class="sd-cont-cover" :style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
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
				<div v-for="m in recentAdded" :key="m.id" class="sd-grid-card" @click="goManga(m)">
					<div class="sd-grid-cover" :style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
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
import mediaApi from '@/api/media'

type MangaCard = {
	id: number
	name: string
	chapter: string
	unread?: number
	progress: number
	gradient: [string, string]
	tag?: string
}

const router = useRouter()

const stats = ref({
	totalManga: 1284,
	totalChapter: 38562,
	readToday: 47,
	readThisWeek: 312,
})

const continueReading = ref<MangaCard[]>([])
const recentAdded = ref<MangaCard[]>([])

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
	if (!item.page || !item.pageCount) return 0
	return Math.round((item.page / item.pageCount) * 100)
}

function pickMediaList(payload: any): any[] {
	if (!payload) return []
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload.list)) return payload.list
	if (Array.isArray(payload.data)) return payload.data
	if (Array.isArray(payload.data?.list)) return payload.data.list
	return []
}

onMounted(async () => {
	try {
		const r = await mediaApi.get()
		const list = pickMediaList(r)
		const totalManga = list.reduce((sum: number, m: any) => sum + Number(m.mangaCount || 0), 0)
		stats.value = {
			...stats.value,
			totalManga: totalManga || stats.value.totalManga,
		}
	} catch {}

	try {
		const r = await historyApi.get_history(1, 6)
		const list = r?.list || []
		continueReading.value = list.map((item: any) => ({
			id: Number(item.chapterId),
			name: item.mangaName || '未知漫画',
			chapter: item.chapterName || '未知章节',
			progress: getProgress(item),
			gradient: getGradient(Number(item.chapterId)),
		}))
	} catch {}

	try {
		const list = await latestApi.get(1, 12)
		recentAdded.value = (list || []).map((item: any) => ({
			id: Number(item.mangaId),
			name: item.mangaName || '未知漫画',
			chapter: `${Number(item.chapterCount || 0)} 章节`,
			progress: 0,
			gradient: getGradient(Number(item.mangaId)),
		}))
	} catch {}
})

function goRead(item: MangaCard) {
	router.push(`/t/reader/${item.id}`)
}

function goManga(item: MangaCard) {
	router.push(`/t/manga/${item.id}`)
}
</script>

<style scoped>
.sd-home {
}

.sd-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14px;
	margin-bottom: 28px;
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
}

.sd-stat-icon {
	width: 42px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	border-radius: 10px;
}

.sd-stat-value {
	font-size: 20px;
	font-weight: 700;
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
