<template>
	<div>
		<section class="sd-stats">
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📚</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ statsData.mangaCount.toLocaleString() || 0 }}</div>
					<div class="sd-stat-label">漫画总数</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">📖</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ statsData.chapterCount.toLocaleString() || 0 }}</div>
					<div class="sd-stat-label">章节总数</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">🔥</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ statsData.readToday || 47 }}</div>
					<div class="sd-stat-label">今日阅读</div>
				</div>
			</div>
			<div class="sd-stat-card">
				<div class="sd-stat-icon" style="background: var(--sd-primary-bg)">⭐</div>
				<div class="sd-stat-info">
					<div class="sd-stat-value">{{ statsData.readThisWeek || 312 }}</div>
					<div class="sd-stat-label">本周阅读</div>
				</div>
			</div>
		</section>

		<section class="sd-section">
			<div class="sd-section-head">
				<h2>继续阅读</h2>
				<a class="sd-link">查看全部 →</a>
			</div>
			<div class="sd-continue">
				<div v-for="item in historyList" :key="item.chapterId" class="sd-cont-card" @click="goRead(item)">
					<div class="sd-cont-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.chapterId)[0]}, ${getGradient(item.chapterId)[1]})` }">
						<span v-if="item.tag" class="sd-cont-tag">{{ item.tag }}</span>
						<span v-if="item.unread" class="sd-cont-unread">{{ item.unread }}</span>
						<div class="sd-cont-progress">
							<div class="sd-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
						</div>
					</div>
					<div class="sd-cont-info">
						<div class="sd-cont-name">{{ item.mangaName || 'UNKNOWN MANGA' }}</div>
						<div class="sd-cont-chapter">{{ item.chapterName || 'UNKNOWN CHAPTER' }}</div>
						<div class="sd-cont-progress">
							<div class="sd-cont-progress-bar" :style="{ width: getProgress(item) + '%' }"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="sd-section">
			<div class="sd-section-head">
				<h2>最近添加</h2>
				<a class="sd-link">查看全部 →</a>
			</div>
			<div class="sd-grid">
				<div v-for="item in latestList" :key="item.mangaId" class="sd-grid-card" @click="goManga(item)">
					<div class="sd-grid-cover"
						:style="{ background: `linear-gradient(135deg, ${getGradient(item.mangaId)[0]}, ${getGradient(item.mangaId)[1]})` }">
						<span v-if="item.tag" class="sd-grid-tag">{{ item.tag }}</span>
					</div>
					<div class="sd-grid-name">{{ item.mangaName }}</div>
					<div class="sd-grid-meta">{{ item.chapterCount || 0 }} 章</div>
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
	['#2563EB', '#3B82F6'],
	['#DB2777', '#EC4899'],
	['#059669', '#10B981'],
	['#7C3AED', '#8B5CF6'],
	['#DC2626', '#EF4444'],
	['#0891B2', '#06B6D4'],
	['#EA580C', '#F97316'],
	['#475569', '#64748B'],
	['#F5A524', '#FBBF24'],
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
	router.push({ path: '/browse-view/flow', query: { chapterId: item.chapterId } })
}

function goManga(item: any) {
	router.push({ path: '/chapter-list', query: { mangaId: item.mangaId } })
}
</script>

<style scoped>
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