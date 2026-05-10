<template>
	<div class="style-d" :style="themeVars">
		<!-- Hero -->
		<section class="sd-hero">
			<div class="sd-hero-text">
				<div class="sd-hero-sub">WELCOME BACK</div>
				<div class="sd-hero-title">你的漫画世界，<br />等你翻开下一页 ✨</div>
				<div class="sd-hero-meta">
					<span class="sd-hero-chip">📖 今日 {{ stats.readToday }} 章</span>
					<span class="sd-hero-chip">🔥 连续 23 天</span>
					<span class="sd-hero-chip">⭐ 收藏 {{ stats.totalManga.toLocaleString() }}</span>
				</div>
			</div>
			<div class="sd-hero-deco">
				<div class="sd-hero-blob sd-hero-blob-1"></div>
				<div class="sd-hero-blob sd-hero-blob-2"></div>
				<div class="sd-hero-blob sd-hero-blob-3"></div>
			</div>
		</section>

		<!-- 继续阅读 -->
		<section class="sd-section">
			<div class="sd-section-head">
				<h2>🌟 继续阅读</h2>
				<a class="sd-link" @click="$router.push('/history')">查看全部 →</a>
			</div>
			<div class="sd-continue">
				<div v-for="item in continueReading" :key="item.id" class="sd-cont-card" @click="goRead(item)">
					<div class="sd-cont-cover"
						:style="{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})` }">
						<span v-if="item.tag" class="sd-cont-tag">{{ item.tag }}</span>
						<span v-if="item.unread" class="sd-cont-unread">{{ item.unread }}</span>
						<div class="sd-cont-progress">
							<div class="sd-cont-progress-bar" :style="{ width: item.progress + '%' }"></div>
						</div>
					</div>
					<div class="sd-cont-info">
						<div class="sd-cont-name">{{ item.name }}</div>
						<div class="sd-cont-chapter">{{ item.chapter }}</div>
						<div class="sd-cont-progress">
							<div class="sd-cont-progress-bar" :style="{ width: item.progress + '%' }"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 最近添加 -->
		<section class="sd-section">
			<div class="sd-section-head">
				<h2>💫 最近添加</h2>
				<a class="sd-link" @click="$router.push('/manga-list')">查看全部 →</a>
			</div>
			<div class="sd-grid">
				<div v-for="item in recentAdded" :key="item.id" class="sd-grid-card" @click="goManga(item)">
					<div class="sd-grid-cover"
						:style="{ background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})` }">
						<span v-if="item.tag" class="sd-grid-tag">{{ item.tag }}</span>
					</div>
					<div class="sd-grid-name">{{ item.name }}</div>
					<div class="sd-grid-meta">{{ item.chapter }}</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import latestApi from '@/api/latest'
import chartsApi from '@/api/charts'

const router = useRouter()

// 统计数据
const stats = ref({
	totalManga: 0,
	totalChapter: 0,
	readToday: 47,
	readThisWeek: 312
})

// 继续阅读列表
const continueReading = ref<any[]>([])

// 最近添加列表
const recentAdded = ref<any[]>([])

// 主题列表
const themeList = [
	{ key: 'blue', name: '蓝', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', name: '粉', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', name: '绿', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', name: '紫', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'red', name: '红', primary: '#DC2626', back: '#FEF2F2', hover: '#FEE2E2' },
	{ key: 'cyan', name: '青', primary: '#0891B2', back: '#ECFEFF', hover: '#CFFAFE' },
	{ key: 'orange', name: '橙', primary: '#EA580C', back: '#FFF7ED', hover: '#FFEDD5' },
	{ key: 'grey', name: '灰', primary: '#475569', back: '#F8FAFC', hover: '#F1F5F9' },
	{ key: 'dark', name: '暗', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
]

const currentTheme = ref('blue')
const theme = computed(() => themeList.find((t) => t.key === currentTheme.value)!)
const isDark = computed(() => currentTheme.value === 'dark')

const themeVars = computed(() => {
	const t = theme.value
	return {
		'--sd-primary': t.primary,
		'--sd-primary-bg': `${t.primary}1a`, // 主色 10% alpha
		'--sd-back': t.back,
		'--sd-card': isDark.value ? '#161A20' : '#FFFFFF',
		'--sd-border': isDark.value ? '#2A313C' : '#E5E7EB',
		'--sd-text': isDark.value ? '#E6E8EB' : '#0F172A',
		'--sd-text-muted': isDark.value ? '#9AA3AE' : '#64748B',
		'--sd-text-faint': isDark.value ? '#5C6470' : '#94A3B8',
		'--sd-hover': t.hover,
	} as any
})

// 获取渐变色彩
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

function getGradient(id: number) {
	return palette[id % palette.length]
}

onMounted(async () => {
	try {
		const [statsRes, historyRes, latestRes] = await Promise.allSettled([
			chartsApi.get_count(),
			historyApi.get(1, 6),
			latestApi.get(1, 12),
		])
		
		if (statsRes.status === 'fulfilled') {
			stats.value = {
				...stats.value,
				...(statsRes.value || {})
			}
		}
		
		if (historyRes.status === 'fulfilled') {
			continueReading.value = (historyRes.value?.list || []).map((item: any, index: number) => ({
				...item,
				gradient: getGradient(index)
			}))
		}
		
		if (latestRes.status === 'fulfilled') {
			recentAdded.value = (latestRes.value?.list || []).map((item: any, index: number) => ({
				...item,
				gradient: getGradient(index + 100)
			}))
		}
	} catch (e) {
		// fallback
	}
})

function goRead(item: any) {
	router.push({ path: '/browse-view/flow', query: { chapterId: item.chapterId } })
}

function goManga(item: any) {
	router.push({ path: '/chapter-list', query: { mangaId: item.mangaId } })
}
</script>

<style scoped>
.style-d {
	display: flex;
	flex-direction: column;
	min-height: 100%;
	background: var(--sd-back);
	color: var(--sd-text);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* Hero */
.sd-hero {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32px 36px;
	margin-bottom: 28px;
	background: var(--sd-card);
	border: 1px solid var(--sd-border);
	border-radius: 16px;
	overflow: hidden;
}

.sd-hero-sub {
	font-size: 12px;
	font-weight: 700;
	color: var(--sd-primary);
	letter-spacing: 0.15em;
	margin-bottom: 8px;
}

.sd-hero-title {
	font-size: 28px;
	font-weight: 800;
	line-height: 1.3;
	color: var(--sd-text);
	margin-bottom: 16px;
}

.sd-hero-meta {
	display: flex;
	gap: 10px;
}

.sd-hero-chip {
	padding: 6px 14px;
	background: var(--sd-primary-bg);
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
	color: var(--sd-text);
}

.sd-hero-deco {
	position: relative;
	width: 180px;
	height: 140px;
	flex-shrink: 0;
}

.sd-hero-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(2px);
}

.sd-hero-blob-1 {
	top: 0;
	right: 20px;
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #ffb5a7, #fec89a);
}

.sd-hero-blob-2 {
	bottom: 10px;
	right: 80px;
	width: 60px;
	height: 60px;
	background: linear-gradient(135deg, #a0c4ff, #bdb2ff);
}

.sd-hero-blob-3 {
	top: 30px;
	right: 110px;
	width: 50px;
	height: 50px;
	background: linear-gradient(135deg, #f1c0e8, #cfbaf0);
}

/* Sections */
.sd-section {
	margin-bottom: 28px;
}

.sd-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 14px;
	padding: 0 4px;
}

.sd-section-head h2 {
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	color: var(--sd-text);
}

.sd-link {
	font-size: 13px;
	color: var(--sd-primary);
	font-weight: 500;
	cursor: pointer;
}

/* Continue Reading */
.sd-continue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 14px;
}

.sd-cont-card {
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sd-cont-card:hover {
	transform: translateY(-4px);
}

.sd-cont-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 10px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sd-cont-card:hover .sd-cont-cover {
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.sd-cont-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 4px 8px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 999px;
}

.sd-cont-unread {
	position: absolute;
	top: 8px;
	right: 8px;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	background: #ffb020;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sd-cont-progress {
	position: absolute;
	left: 8px;
	right: 8px;
	bottom: 8px;
	height: 4px;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 2px;
	overflow: hidden;
}

.sd-cont-progress-bar {
	height: 100%;
	background: var(--sd-primary);
	border-radius: 2px;
}

.sd-cont-info {
	padding: 0 4px;
}

.sd-cont-name {
	font-size: 14px;
	font-weight: 700;
	color: var(--sd-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-cont-chapter {
	font-size: 12px;
	color: var(--sd-text-muted);
	margin-top: 2px;
}

/* Recent Added Grid */
.sd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 20px;
}

.sd-grid-card {
	cursor: pointer;
}

.sd-grid-cover {
	position: relative;
	aspect-ratio: 3 / 4;
	border-radius: 12px;
	margin-bottom: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	overflow: hidden;
	transition: all 0.25s;
}

.sd-grid-card:hover .sd-grid-cover {
	transform: translateY(-4px) scale(1.02);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.sd-grid-tag {
	position: absolute;
	top: 8px;
	left: 8px;
	padding: 3px 8px;
	font-size: 10px;
	font-weight: 700;
	color: #fff;
	background: var(--sd-primary);
	border-radius: 999px;
}

.sd-grid-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--sd-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sd-grid-meta {
	margin-top: 2px;
	font-size: 11px;
	color: var(--sd-text-muted);
}
</style>