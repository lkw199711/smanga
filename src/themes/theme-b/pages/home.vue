<template>
	<div>
		<!-- Hero -->
		<section class="sb-hero">
			<div class="sb-hero-text">
				<div class="sb-hero-sub">WELCOME BACK</div>
				<div class="sb-hero-title">你的漫画世界，<br />等你翻开下一页 ✨</div>
				<div class="sb-hero-meta">
					<span class="sb-hero-chip">📖 今日 {{ statsData.readToday.toLocaleString() }} 章</span>
					<span class="sb-hero-chip">🔥 连续 23 天</span>
					<span class="sb-hero-chip">⭐ 收藏 {{ statsData.mangaCount.toLocaleString() || 0 }}</span>
				</div>
			</div>
			<div class="sb-hero-deco">
				<div class="sb-hero-blob sb-hero-blob-1"></div>
				<div class="sb-hero-blob sb-hero-blob-2"></div>
				<div class="sb-hero-blob sb-hero-blob-3"></div>
			</div>
		</section>

		<!-- 继续阅读 -->
		<section class="sb-section">
			<div class="sb-section-head">
				<h2>🌟 继续阅读</h2>
				<a class="sb-link" @click="router.push('/t/history')">查看全部 →</a>
			</div>
			<div class="sb-continue">
				<t-history-item
					v-for="item in historyList"
					:key="item.chapterId"
					:item="item"
					variant="B"
					@click="goRead(item)"
					@contextmenu="openThemeContextMenu($event, 'chapter', item)"
				/>
			</div>
		</section>

		<!-- 最近添加 -->
		<section class="sb-section">
			<div class="sb-section-head">
				<h2>💫 最近添加</h2>
				<a class="sb-link" @click="router.push('/t/media')">全部 →</a>
			</div>
			<div class="sb-grid">
				<t-manga-card
					v-for="item in latestList"
					:key="item.mangaId"
					:item="item"
					variant="B"
					:tag="tagText(item)"
					:unread="unreadCount(item)"
					:meta="`${item.chapterCount || 0} 章节`"
					@click="goManga(item)"
					@contextmenu="openThemeContextMenu($event, 'manga', item)"
				/>
			</div>
		</section>

		<!-- 底部占位：防止移动端底栏遮挡最后内容 -->
		<div class="sb-bottom-spacer" aria-hidden="true"></div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'
import TMangaCard from '@/themes/components/manga-card.vue'
import THistoryItem from '@/themes/components/history-item.vue'
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

function goManga(item: any) {
	router.push({ path: '/t/manga/' + item.mangaId })
}
</script>

<style scoped>
/* Hero */
.sb-hero {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 3.2rem 3.6rem;
	margin-bottom: 2.8rem;
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.14), rgba(108, 141, 255, 0.14));
	border: 1px solid rgba(255, 255, 255, 0.7);
	border-radius: 2.4rem;
	overflow: hidden;
}

.sb-hero-sub {
	font-size: 1.2rem;
	font-weight: 700;
	color: #ff6fa3;
	letter-spacing: 0.15em;
	margin-bottom: 0.8rem;
}

.sb-hero-title {
	font-size: 2.8rem;
	font-weight: 800;
	line-height: 1.3;
	color: #1f2937;
	margin-bottom: 1.6rem;
}

.sb-hero-meta {
	display: flex;
	gap: 1rem;
}

.sb-hero-chip {
	padding: 0.6rem 1.4rem;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 99.9rem;
	font-size: 1.2rem;
	font-weight: 500;
	color: #4b5563;
}

.sb-hero-deco {
	position: relative;
	width: 18rem;
	height: 14rem;
	flex-shrink: 0;
}

.sb-hero-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(0.2rem);
}

.sb-hero-blob-1 {
	top: 0;
	right: 2rem;
	width: 8rem;
	height: 8rem;
	background: linear-gradient(135deg, #ffb5a7, #fec89a);
}

.sb-hero-blob-2 {
	bottom: 1rem;
	right: 8rem;
	width: 6rem;
	height: 6rem;
	background: linear-gradient(135deg, #a0c4ff, #bdb2ff);
}

.sb-hero-blob-3 {
	top: 3rem;
	right: 11rem;
	width: 5rem;
	height: 5rem;
	background: linear-gradient(135deg, #f1c0e8, #cfbaf0);
}

.sb-section {
	margin-bottom: 2.8rem;
}

.sb-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 1.4rem;
	padding: 0 0.4rem;
}

.sb-section-head h2 {
	margin: 0;
	font-size: 1.8rem;
	font-weight: 700;
	color: #1f2937;
}

.sb-link {
	font-size: 1.3rem;
	color: #6c8dff;
	font-weight: 500;
	cursor: pointer;
}

.sb-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
	gap: 1.4rem;
}

.sb-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
	gap: 1.8rem;
	row-gap: 1.2rem;
}

/* 移动端窄屏：固定两列，避免 minmax 15rem 叠加 gap/padding 撑破视口 */
@media (max-width: 48rem) {
	.sb-continue {
		grid-template-columns: 1fr;
		gap: 1.2rem;
	}
	.sb-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.2rem;
		row-gap: 1rem;
	}
}

/* 底部占位（默认无高度，仅在移动端下生效） */
.sb-bottom-spacer {
	height: 0;
}

@media (max-width: 48rem) {
	.sb-bottom-spacer {
		height: calc(6.4rem + env(safe-area-inset-bottom, 0px));
	}
}

</style>
