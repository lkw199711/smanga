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
				<a class="sb-link" @click="router.push('/t/history')">全部 →</a>
			</div>
			<div class="sb-continue">
				<div v-for="item in historyList" :key="item.chapterId" class="sb-cont-card" v-long-press="() => openThemeActionSheet('chapter', item)" @click="goRead(item)" @contextmenu="openThemeContextMenu($event, 'chapter', item)">
					<div class="sb-cont-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.chapterId)[0]}, ${getGradient(item.chapterId)[1]})` }">
						<img v-if="item.blob" :src="item.blob" alt="" class="continue-cover" />
						<span v-if="item.tag" class="sb-cont-tag">{{ item.tag }}</span>
						<span v-if="item.unread" class="sb-cont-unread">{{ item.unread }}</span>
						<div class="sb-cont-progress">
							<div class="sb-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
						</div>
					</div>
					<div class="sb-cont-name">{{ item.mangaName || '未知漫画' }}</div>
					<div class="sb-cont-chapter">{{ item.chapterName || '未知章节' }}</div>
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
				<div v-for="item in latestList" :key="item.mangaId" class="sb-grid-card" @click="goManga(item)">
					<div class="sb-grid-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.mangaId)[0]}, ${getGradient(item.mangaId)[1]})` }">
						<img v-if="item.blob" :src="item.blob" alt="" class="continue-cover" />
						<span v-if="item.tag" class="sb-grid-tag">{{ item.tag }}</span>
						<div class="sb-grid-hover">
							<button class="sb-grid-play">▶ 立即阅读</button>
						</div>
					</div>
					<div class="sb-grid-name">{{ item.mangaName }}</div>
					<div class="sb-grid-meta">{{ item.chapterCount || 0 }} 章节</div>
				</div>
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
import queue from '@/store/quque'
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
		const [statsRes, historyRes, latestRes] = await Promise.allSettled([
			chartsApi.get_count(),
			historyApi.get(1, 6),
			latestApi.get(1, 12),
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
		historyList.value.forEach((item) => {
			queue.mangaQueue.add(() => get_poster(item))
		})
		latestList.value.forEach((item) => {
			queue.mangaQueue.add(() => get_poster(item))
		})
	} catch (e) {
		// fallback
	}
})

function getGradient(id: number) {
	return palette[id % palette.length]
}

function getProgress(item: any) {
	if (!item.page || !item.pageCount) return 0
	return Math.round((item.page / item.pageCount) * 100)
}

function goRead(item: any) {
	globalData.mangaName = item.mangaName || globalData.mangaName
	globalData.chapterName = item.chapterName || globalData.chapterName
	router.push({ path: '/t/reader/' + item.chapterId })
}

function goManga(item: any) {
	router.push({ path: '/t/manga/' + item.mangaId })
}

async function get_poster(item: any) {
	item.blob = await imageApi.get({file: item.mangaCover || item.chapterCover});
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
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 14px;
}

.sb-cont-card {
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sb-cont-card:hover {
	transform: translateY(-4px);
}

.sb-cont-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 16px;
	overflow: hidden;
	margin-bottom: 10px;
	box-shadow: 0 6px 20px rgba(108, 141, 255, 0.18);
}

.sb-cont-card:hover .sb-cont-cover {
	box-shadow: 0 12px 28px rgba(255, 111, 163, 0.28);
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
	position: absolute;
	left: 8px;
	right: 8px;
	bottom: 8px;
	height: 4px;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 2px;
	overflow: hidden;
}

.sb-cont-progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #ff6fa3, #ffb020);
	border-radius: 2px;
}

.sb-cont-name {
	font-size: 14px;
	font-weight: 700;
	color: #1f2937;
	padding: 0 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-cont-chapter {
	font-size: 12px;
	color: #6b7280;
	padding: 0 4px;
	margin-top: 2px;
}

.sb-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 20px;
}

.sb-grid-card {
	cursor: pointer;
}

.sb-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 16px;
	margin-bottom: 8px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	overflow: hidden;
	transition: all 0.25s;
}

.sb-grid-card:hover .sb-grid-cover {
	transform: translateY(-4px) scale(1.02);
	box-shadow: 0 12px 28px rgba(255, 111, 163, 0.3);
}

.sb-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 8px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	background: #ffb020;
	border-radius: 999px;
}

.sb-grid-hover {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 14px;
	background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.5));
	opacity: 0;
	transition: opacity 0.25s;
}

.sb-grid-card:hover .sb-grid-hover {
	opacity: 1;
}

.sb-grid-play {
	padding: 7px 16px;
	font-size: 12px;
	font-weight: 600;
	color: #ff6fa3;
	background: #fff;
	border: none;
	border-radius: 999px;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sb-grid-name {
	font-size: 13px;
	font-weight: 600;
	color: #1f2937;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sb-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: #9ca3af;
}

.continue-cover {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 16px;
}
</style>
