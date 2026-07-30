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
				<t-continue-item
					v-for="item in continueList"
					:key="item.mangaId"
					:item="item"
					variant="A"
					@click="goRead(item)"
					@contextmenu="openThemeContextMenu($event, 'manga', item)"
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
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'
import TMangaCard from '@/themes/components/manga-card.vue'
import TContinueItem from '@/themes/components/continue-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useGoRead } from '@/themes/composables'

const router = useRouter()
const { goRead } = useGoRead({ withPageJump: true, syncGlobalNames: true })

const statsData = ref({
	mangaCount: 0,
	chapterCount: 0,
	mangaWeekAdd: 0,
	chapterWeekAdd: 0,
	readToday: 0,
	readThisWeek: 0
})
const continueList = ref<any[]>([])
const latestList = ref<any[]>([])
const hotMangaIdSet = ref<Set<number>>(new Set())

onMounted(async () => {
	try {
		const [statsRes, continueRes, latestRes, rankingRes] = await Promise.allSettled([
			chartsApi.get_count(),
			latestApi.get_progress(1, 6),
			latestApi.get(1, 12),
			chartsApi.ranking(30),
		])
		if (statsRes.status === 'fulfilled') {
			statsData.value = {
				...statsData.value,
				...(statsRes.value || {})
			}
		}
		if (continueRes.status === 'fulfilled') continueList.value = continueRes.value
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
	gap: 1.6rem;
	margin-bottom: 3.2rem;
}

.sa-stat-card {
	padding: 1.8rem 2rem;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 1.2rem;
	box-shadow: 0 1px 0.2rem rgba(0, 0, 0, 0.02);
}

.sa-stat-label {
	font-size: 1.2rem;
	color: #6b7280;
	margin-bottom: 0.8rem;
}

.sa-stat-value {
	font-size: 2.6rem;
	font-weight: 700;
	color: #111827;
	letter-spacing: -0.02em;
}

.sa-stat-delta {
	margin-top: 0.6rem;
	font-size: 1.2rem;
	color: #9ca3af;
}

.sa-stat-delta.up {
	color: #10b981;
}

.sa-section {
	margin-bottom: 3.2rem;
}

.sa-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 1.4rem;
}

.sa-section-head h2 {
	margin: 0;
	font-size: 1.6rem;
	font-weight: 600;
	color: #111827;
}

.sa-link {
	font-size: 1.3rem;
	color: #2563eb;
	cursor: pointer;
}

.sa-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
	gap: 1.4rem;
}

.sa-grid {
	display: grid;
	/* 关键：minmax(0, 1fr) 允许列被压缩至 0，防止子项 nowrap 文本撑破网格 */
	grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));
	gap: 1.8rem;
	row-gap: 1.2rem;
}

/* 让所有网格子项都可以被压缩，避免 min-width: auto 反噬父容器 */
.sa-grid > *,
.sa-continue > * {
	min-width: 0;
}

.sa-grid-card {
	cursor: pointer;
	transition: transform 0.15s;
}

.sa-grid-card:hover {
	transform: translateY(-0.2rem);
}

.sa-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 1rem;
	margin-bottom: 0.8rem;
	box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.06);
	overflow: hidden;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: #f3f4f6;
}

.sa-grid-tag {
	position: absolute;
	top: 0.8rem;
	left: 0.8rem;
	padding: 0.3rem 0.7rem;
	font-size: 1rem;
	font-weight: 600;
	color: #fff;
	background: #2563eb;
	border-radius: 0.4rem;
}

.sa-grid-unread {
	position: absolute;
	top: 0.8rem;
	right: 0.8rem;
	min-width: 1.8rem;
	height: 1.8rem;
	padding: 0 0.6rem;
	font-size: 1.1rem;
	font-weight: 700;
	color: #fff;
	background: #ef4444;
	border-radius: 0.9rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sa-grid-name {
	font-size: 1.3rem;
	font-weight: 500;
	color: #111827;
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

.sa-grid-meta {
	margin-top: 0.2rem;
	font-size: 1.1rem;
	color: #9ca3af;
}

/* 响应式适配 */
@media (max-width: 76.8rem) {
	.sa-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 0.8rem;
		margin-bottom: 1.6rem;
	}

	.sa-stat-card {
		padding: 1rem 1.2rem;
		border-radius: 0.8rem;
	}

	.sa-stat-label {
		font-size: 1.1rem;
		margin-bottom: 0.2rem;
	}

	.sa-stat-value {
		font-size: 1.8rem;
	}

	.sa-stat-delta {
		margin-top: 0.2rem;
		font-size: 1rem;
	}

	.sa-continue {
		grid-template-columns: 1fr;
		gap: 1.2rem;
	}

	.sa-section {
		margin-bottom: 2rem;
	}

	.sa-section h2 {
		font-size: 1.6rem;
	}

	.sa-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.2rem;
		row-gap: 1rem;
	}
}

@media (max-width: 48rem) {
	.sa-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 0.6rem;
	}

	.sa-stat-card {
		padding: 0.8rem 1rem;
	}

	.sa-stat-value {
		font-size: 1.6rem;
	}

	.sa-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		row-gap: 1rem;
	}

	.sa-stat-card {
		padding: 1.2rem;
	}

	.sa-stat-value {
		font-size: 2rem;
	}
}
</style>
