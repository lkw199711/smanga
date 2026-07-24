<template>
	<div class="sa-home">
		<!-- 统计 -->
		<section class="sa-stats">
			<div class="sa-stat-card">
				<div class="sa-stat-label">漫画总数</div>
				<div class="sa-stat-value">{{ statsData.mangaCount.toLocaleString() }}</div>
				<div class="sa-stat-delta up">+{{ statsData.mangaWeekAdd.toLocaleString() }} 本周</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">章节总数</div>
				<div class="sa-stat-value">{{ statsData.chapterCount.toLocaleString() }}</div>
				<div class="sa-stat-delta up">+{{ statsData.chapterWeekAdd.toLocaleString() }} 本周</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">今日阅读</div>
				<div class="sa-stat-value">{{ statsData.readToday.toLocaleString() }}</div>
				<div class="sa-stat-delta">章</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">本周阅读</div>
				<div class="sa-stat-value">{{ statsData.readThisWeek.toLocaleString() }}</div>
				<div class="sa-stat-delta">章</div>
			</div>
		</section>

		<!-- 继续阅读 -->
		<section class="sa-section">
			<div class="sa-section-head">
				<h2>继续阅读</h2>
				<a class="sa-link" @click="router.push('/t/history')">查看全部 →</a>
			</div>
			<div class="sa-continue">
				<t-history-item
					v-for="item in historyList"
					:key="item.chapterId"
					:item="item"
					variant="A"
					@click="goRead(item)"
					@contextmenu="openThemeContextMenu($event, 'chapter', item)"
				/>
			</div>
		</section>

		<!-- 最近添加 -->
		<section class="sa-section">
			<div class="sa-section-head">
				<h2>最近添加</h2>
				<a class="sa-link" @click="router.push('/t/media')">查看全部 →</a>
			</div>
			<div class="sa-grid">
				<t-manga-card
					v-for="item in latestList"
					:key="item.mangaId"
					:item="item"
					variant="A"
					:tag="tagText(item)"
					:unread="unreadCount(item)"
					:meta="`${item.chapterCount || 0} 章节`"
					@click="goManga(item)"
					@contextmenu="openThemeContextMenu($event, 'manga', item)"
				/>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'
import { globalData } from '@/store'
import TMangaCard from '@/themes/components/manga-card.vue'
import THistoryItem from '@/themes/components/history-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()

const statsData = ref({
	mangaCount: 0,
	chapterCount: 0,
	mangaWeekAdd: 0,
	chapterWeekAdd: 0,
	readToday: 0,
	readThisWeek: 0
})
const historyList = ref<any[]>([])
const latestList = ref<any[]>([])
const hotMangaIdSet = ref<Set<number>>(new Set())

onMounted(async () => {
	try {
		const [statsRes, historyRes, latestRes, rankingRes] = await Promise.allSettled([
			chartsApi.get_count(),
			historyApi.get(1, 6),
			latestApi.get(1, 12),
			chartsApi.ranking(30),
		])
		if (statsRes.status === 'fulfilled') {
			statsData.value = {
				...statsData.value,
				...(statsRes.value || {})
			}
		}
		if (historyRes.status === 'fulfilled') historyList.value = historyRes.value?.list || []
		if (latestRes.status === 'fulfilled') {
			latestList.value = Array.isArray(latestRes.value) ? latestRes.value : (latestRes.value?.list || [])
		}
		if (rankingRes.status === 'fulfilled') {
			const ids = Array.isArray(rankingRes.value)
				? rankingRes.value.map((x: any) => Number(x?.mangaId)).filter((n: any) => Number.isFinite(n))
				: []
			hotMangaIdSet.value = new Set(ids)
		}
	} catch (e) {
		// fallback
	}
})

function unreadCount(item: any): number {
	const n = Number(item?.unWatched || item?.unread || 0)
	return Number.isFinite(n) ? n : 0
}

function tagText(item: any): string {
	const mangaId = Number(item?.mangaId)
	if (Number.isFinite(mangaId) && hotMangaIdSet.value.has(mangaId)) return '热门'
	const unread = unreadCount(item)
	if (unread === 0 && Number.isFinite(mangaId)) return '完结'
	return ''
}

function goRead(item: any) {
	globalData.mangaName = item.mangaName || globalData.mangaName
	globalData.chapterName = item.chapterName || globalData.chapterName
	router.push({ path: '/t/reader/' + item.chapterId })
}

function goManga(item: any) {
	router.push({ path: '/t/manga/' + item.mangaId })
}
</script>

<style scoped>
.sa-home {
	/* content-only, no layout chrome */
}

.sa-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.sa-stat-card {
	padding: 18px 20px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.sa-stat-label {
	font-size: 12px;
	color: #6b7280;
	margin-bottom: 8px;
}

.sa-stat-value {
	font-size: 26px;
	font-weight: 700;
	color: #111827;
	letter-spacing: -0.02em;
}

.sa-stat-delta {
	margin-top: 6px;
	font-size: 12px;
	color: #9ca3af;
}

.sa-stat-delta.up {
	color: #10b981;
}

.sa-section {
	margin-bottom: 32px;
}

.sa-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
}

.sa-section-head h2 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #111827;
}

.sa-link {
	font-size: 13px;
	color: #2563eb;
	cursor: pointer;
}

.sa-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sa-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

.sa-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sa-grid-card:hover {
	transform: translateY(-2px);
}

.sa-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 10px;
	margin-bottom: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	overflow: hidden;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: #f3f4f6;
}

.sa-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 7px;
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	background: #2563eb;
	border-radius: 4px;
}

.sa-grid-unread {
	position: absolute;
	top: 8px;
	right: 8px;
	min-width: 18px;
	height: 18px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #ef4444;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sa-grid-name {
	font-size: 13px;
	font-weight: 500;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #9ca3af;
}

/* 响应式适配 */
@media (max-width: 768px) {
	.sa-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-bottom: 16px;
	}

	.sa-stat-card {
		padding: 10px 12px;
		border-radius: 8px;
	}

	.sa-stat-label {
		font-size: 11px;
		margin-bottom: 2px;
	}

	.sa-stat-value {
		font-size: 18px;
	}

	.sa-stat-delta {
		margin-top: 2px;
		font-size: 10px;
	}

	.sa-continue {
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.sa-section {
		margin-bottom: 20px;
	}

	.sa-section h2 {
		font-size: 16px;
	}

	.sa-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}
}

@media (max-width: 480px) {
	.sa-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
	}

	.sa-stat-card {
		padding: 8px 10px;
	}

	.sa-stat-value {
		font-size: 16px;
	}

	.sa-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.sa-stat-card {
		padding: 12px;
	}

	.sa-stat-value {
		font-size: 20px;
	}
}
</style>
