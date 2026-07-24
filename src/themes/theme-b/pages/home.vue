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
				<div v-for="item in historyList" :key="item.chapterId" class="sb-cont-card" v-long-press="() => openThemeActionSheet('chapter', item)" @click="goRead(item)" @contextmenu="openThemeContextMenu($event, 'chapter', item)">
					<div
						class="sb-cont-cover"
						:style="coverStyle(item, { kind: 'chapter', fallbackSeed: item.chapterId })"
					>
						<span v-if="item.tag" class="sb-cont-tag">{{ item.tag }}</span>
						<span v-if="item.unread" class="sb-cont-unread">{{ item.unread }}</span>
					</div>
					<div class="sb-cont-info">
						<div class="sb-cont-name">{{ item.mangaName || '未知漫画' }}</div>
						<div class="sb-cont-chapter">{{ item.chapterName || '未知章节' }}</div>
						<div class="sb-cont-progress">
							<div class="sb-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
						</div>
					</div>
				</div>
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
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'
import imageApi from '@/api/image'
import { globalData } from '@/store'
import TMangaCard from '@/themes/components/manga-card.vue'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

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
const coverCache = ref<Record<string, string>>({})
const hotMangaIdSet = ref<Set<number>>(new Set())

// 渐变色彩板
const palette = [
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

		await warmCovers(historyList.value, { kind: 'chapter' })
		await warmCovers(latestList.value, { kind: 'manga' })
	} catch (e) {
		// fallback
	}
})

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

async function warmCovers(list: any[], opt: { kind: 'manga' | 'chapter' }) {
	const files = Array.from(
		new Set(
			list
				.map((it) => (opt.kind === 'manga' ? it?.mangaCover : it?.pageImage || it?.chapterCover))
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
	const file = opt.kind === 'manga' ? item?.mangaCover : item?.pageImage || item?.chapterCover
	const src = file ? coverCache.value[file] : ''
	if (src) {
		return { backgroundImage: `url("${src}")` }
	}
	const g = getGradient(Number(opt.fallbackSeed) || 0)
	return { backgroundImage: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }
}
</script>

<style scoped>
/* Hero */
.sb-hero {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32px 36px;
	margin-bottom: 28px;
	background: linear-gradient(135deg, rgba(255, 111, 163, 0.14), rgba(108, 141, 255, 0.14));
	border: 1px solid rgba(255, 255, 255, 0.7);
	border-radius: 24px;
	overflow: hidden;
}

.sb-hero-sub {
	font-size: 12px;
	font-weight: 700;
	color: #ff6fa3;
	letter-spacing: 0.15em;
	margin-bottom: 8px;
}

.sb-hero-title {
	font-size: 28px;
	font-weight: 800;
	line-height: 1.3;
	color: #1f2937;
	margin-bottom: 16px;
}

.sb-hero-meta {
	display: flex;
	gap: 10px;
}

.sb-hero-chip {
	padding: 6px 14px;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
	color: #4b5563;
}

.sb-hero-deco {
	position: relative;
	width: 180px;
	height: 140px;
	flex-shrink: 0;
}

.sb-hero-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(2px);
}

.sb-hero-blob-1 {
	top: 0;
	right: 20px;
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #ffb5a7, #fec89a);
}

.sb-hero-blob-2 {
	bottom: 10px;
	right: 80px;
	width: 60px;
	height: 60px;
	background: linear-gradient(135deg, #a0c4ff, #bdb2ff);
}

.sb-hero-blob-3 {
	top: 30px;
	right: 110px;
	width: 50px;
	height: 50px;
	background: linear-gradient(135deg, #f1c0e8, #cfbaf0);
}

.sb-section {
	margin-bottom: 28px;
}

.sb-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
	padding: 0 4px;
}

.sb-section-head h2 {
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	color: #1f2937;
}

.sb-link {
	font-size: 13px;
	color: #6c8dff;
	font-weight: 500;
	cursor: pointer;
}

.sb-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 14px;
}

.sb-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 16px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
}

.sb-cont-card:hover {
	border-color: #d1d5db;
	box-shadow: 0 8px 24px rgba(255, 111, 163, 0.12);
	transform: translateY(-1px);
}

.sb-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 10px;
	overflow: hidden;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-color: #f3f4f6;
}

.sb-cont-tag {
	position: absolute;
	top: 10px;
	left: 10px;
	padding: 4px 10px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #ff9a76);
	border-radius: 999px;
	box-shadow: 0 2px 8px rgba(255, 111, 163, 0.4);
}

.sb-cont-unread {
	position: absolute;
	top: 10px;
	right: 10px;
	min-width: 22px;
	height: 22px;
	padding: 0 7px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #ffb020;
	border-radius: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(255, 176, 32, 0.5);
}

.sb-cont-progress {
	height: 4px;
	background: rgba(0, 0, 0, 0.06);
	border-radius: 2px;
	overflow: hidden;
}

.sb-cont-progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #ff6fa3, #ffb020);
	border-radius: 2px;
}

.sb-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sb-cont-name {
	font-size: 14px;
	font-weight: 700;
	color: #1f2937;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-cont-chapter {
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 18px;
}

</style>
