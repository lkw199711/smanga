<template>
	<div class="sa-home">
		<!-- 统计 -->
		<section class="sa-stats">
			<div class="sa-stat-card">
				<div class="sa-stat-label">漫画总数</div>
				<div class="sa-stat-value">{{ statsData.mangaCount.toLocaleString() }}</div>
				<div class="sa-stat-delta up">+24 本周</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">章节总数</div>
				<div class="sa-stat-value">{{ statsData.chapterCount.toLocaleString() }}</div>
				<div class="sa-stat-delta up">+1.2k 本周</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">今日阅读</div>
				<div class="sa-stat-value">{{ statsData.readToday || 47 }}</div>
				<div class="sa-stat-delta">章</div>
			</div>
			<div class="sa-stat-card">
				<div class="sa-stat-label">本周阅读</div>
				<div class="sa-stat-value">{{ statsData.readThisWeek || 312 }}</div>
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
				<div v-for="item in historyList" :key="item.chapterId" class="sa-cont-card" @click="goRead(item)">
					<div class="sa-cont-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.chapterId)[0]}, ${getGradient(item.chapterId)[1]})` }">
						<span v-if="item.tag" class="sa-cont-tag">{{ item.tag }}</span>
						<span v-if="item.unread" class="sa-cont-unread">{{ item.unread }}</span>
					</div>
					<div class="sa-cont-info">
						<div class="sa-cont-name">{{ item.mangaName || '未知漫画' }}</div>
						<div class="sa-cont-chapter">{{ item.chapterName || '未知章节' }}</div>
						<div class="sa-cont-progress">
							<div class="sa-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 最近添加 -->
		<section class="sa-section">
			<div class="sa-section-head">
				<h2>最近添加</h2>
				<a class="sa-link" @click="router.push('/t/media')">查看全部 →</a>
			</div>
			<div class="sa-grid">
				<div v-for="item in latestList" :key="item.mangaId" class="sa-grid-card" @click="goManga(item)">
					<div class="sa-grid-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.mangaId)[0]}, ${getGradient(item.mangaId)[1]})` }">
						<span v-if="item.tag" class="sa-grid-tag">{{ item.tag }}</span>
					</div>
					<div class="sa-grid-name">{{ item.mangaName }}</div>
					<div class="sa-grid-meta">{{ item.chapterCount || 0 }} 章节</div>
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

const router = useRouter()

const statsData = ref({ mangaCount: 0, chapterCount: 0, readToday: 47, readThisWeek: 312 })
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
		if (latestRes.status === 'fulfilled') latestList.value = latestRes.value?.list || []
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

.sa-cont-card {
	display: flex;
	gap: 12px;
	padding: 12px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
	transition: all 0.2s;
	cursor: pointer;
}

.sa-cont-card:hover {
	border-color: #d1d5db;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	transform: translateY(-1px);
}

.sa-cont-cover {
	position: relative;
	flex-shrink: 0;
	width: 70px;
	height: 96px;
	border-radius: 8px;
	overflow: hidden;
}

.sa-cont-tag {
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

.sa-cont-unread {
	position: absolute;
	top: 6px;
	right: 6px;
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: #ef4444;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sa-cont-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}

.sa-cont-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-cont-chapter {
	font-size: 12px;
	color: #6b7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sa-cont-progress {
	height: 4px;
	background: #f3f4f6;
	border-radius: 2px;
	overflow: hidden;
}

.sa-cont-progress-bar {
	height: 100%;
	background: #2563eb;
	border-radius: 2px;
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
</style>
