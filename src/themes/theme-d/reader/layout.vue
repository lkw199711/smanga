<template>
  <div class="td-reader-layout">
    <header class="td-reader-top" v-show="showControls">
      <button class="td-reader-btn" @click="router.back()">← 返回</button>
      <div class="td-reader-title">{{ globalData.mangaName }} - {{ globalData.chapterName }}</div>
      <div class="td-reader-right">
        <button class="td-reader-btn" @click="showChapters = !showChapters">目录</button>
        <div class="td-reader-modes">
          <button class="td-reader-mode" :class="{ active: mode === 'single' }" @click="mode = 'single'">单页</button>
          <button class="td-reader-mode" :class="{ active: mode === 'double' }" @click="mode = 'double'">双页</button>
          <button class="td-reader-mode" :class="{ active: mode === 'flow' }" @click="mode = 'flow'">条漫</button>
        </div>
      </div>
    </header>
    <div class="td-reader-body" @click="showControls = !showControls">
      <component :is="readerComp" />
    </div>
    <footer class="td-reader-bottom" v-show="showControls">
      <button class="td-reader-btn" :disabled="!canPrevPage" @click="prevPage">上一页</button>
      <div class="td-reader-progress">
        <div class="td-reader-progress-bar" :style="{ width: progressPct + '%' }"></div>
      </div>
      <span class="td-reader-page">{{ pageDisplay }} / {{ totalPages }}</span>
      <button class="td-reader-btn" :disabled="!canNextPage" @click="nextPage">下一页</button>
    </footer>

    <aside v-if="showChapters" class="td-chapter-drawer smanga-backable" @click.self="showChapters = false">
      <div class="td-chapter-panel">
        <div class="td-chapter-head">
          <div class="td-chapter-head-title">目录</div>
          <button class="td-reader-btn" @click="showChapters = false">关闭</button>
        </div>
        <div class="td-chapter-list">
          <button
            v-for="(ch, idx) in chapters"
            :key="ch.chapterId || idx"
            class="td-chapter-item"
            :class="{ active: idx === globalData.chapterIndex }"
            @click="goChapter(idx)"
          >
            <span class="td-chapter-name">{{ ch.chapterName || ('第 ' + (idx + 1) + ' 话') }}</span>
            <span class="td-chapter-meta">{{ (ch.pageCount || 0) + ' 页' }}</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { globalData } from '@/store'
import chapterApi from '@/api/chapter'
import { useNavigationStore } from '@/store/navigation'
import TdSingle from './single.vue'
import TdDouble from './double.vue'
import TdFlow from './flow.vue'
import { READER_BODY_CLASS_KEY } from '@/themes/composables'

provide(READER_BODY_CLASS_KEY, 'td-reader-body')

const route = useRoute()
const router = useRouter()
const navigation = useNavigationStore()
const showControls = ref(true)
const showChapters = ref(false)
const mode = ref<'single' | 'double' | 'flow'>('single')

const chapterId = computed(() => Number(route.params.chapterId) || 0)
const chapters = computed<any[]>(() => Array.isArray(globalData.chapterList) ? globalData.chapterList : [])

const readerComp = computed(() => {
  if (mode.value === 'double') return TdDouble
  if (mode.value === 'flow') return TdFlow
  return TdSingle
})

const imageCount = computed(() => (globalData.imgPathList || []).length)
const totalPages = computed(() => {
  if (mode.value === 'double') return Math.max(1, Math.ceil(imageCount.value / 2))
  return Math.max(1, imageCount.value)
})
const pageDisplay = computed(() => Math.min(totalPages.value, Math.max(1, Number(globalData.page || 0) + 1)))
const progressPct = computed(() => {
  if (!totalPages.value) return 0
  return Math.min(100, Math.max(0, Math.round((pageDisplay.value / totalPages.value) * 100)))
})
const canPrevPage = computed(() => pageDisplay.value > 1)
const canNextPage = computed(() => pageDisplay.value < totalPages.value)

watch(
  () => mode.value,
  () => {
    const maxPageIndex = mode.value === 'double' ? Math.max(0, Math.ceil(imageCount.value / 2) - 1) : Math.max(0, imageCount.value - 1)
    const cur = Number(globalData.page || 0)
    if (cur > maxPageIndex) globalData.page = maxPageIndex
    if (cur < 0) globalData.page = 0
  }
)

watch(
  () => chapterId.value,
  () => {
    showChapters.value = false
    loadChapter()
  },
  { immediate: true }
)

async function loadChapter() {
  if (!chapterId.value) return
  globalData.chapterId = chapterId.value
  const pageJump = navigation.consumeReaderPage()
  if (pageJump > 1) {
    globalData.page = pageJump - 1
  } else {
    globalData.page = 0
  }
  try {
    const r = await chapterApi.get_images(chapterId.value, 0)
    globalData.imgPathList = r?.list || []
  } catch {
    globalData.imgPathList = []
  }
  if (!globalData.chapterName) globalData.chapterName = `Chapter ${chapterId.value}`
}

function goChapter(idx: number) {
  const target = chapters.value[idx]
  if (!target?.chapterId) return
  globalData.chapterIndex = idx
  globalData.chapterId = target.chapterId
  globalData.chapterName = target.chapterName || globalData.chapterName
  router.replace(`/t/reader/${target.chapterId}`)
}

function prevPage() {
  if (!canPrevPage.value) return
  globalData.page = Math.max(0, Number(globalData.page || 0) - 1)
}

function nextPage() {
  if (!canNextPage.value) return
  globalData.page = Math.min(totalPages.value - 1, Number(globalData.page || 0) + 1)
}

onMounted(() => {
  if (!globalData.mangaName) globalData.mangaName = 'smanga'
})
</script>

<style scoped>
.td-reader-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  color: #111827;
}

.td-reader-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.6rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(0.8rem);
  border-bottom: 1px solid #eaeaea;
  z-index: 10;
}

.td-reader-title {
  font-size: 1.4rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
  text-align: center;
}

.td-reader-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.td-reader-modes {
  display: flex;
  gap: 0.4rem;
}

.td-reader-mode {
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #eaeaea;
  border-radius: 99.9rem;
  cursor: pointer;
}

.td-reader-mode.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.td-reader-body {
  flex: 1;
  overflow: auto;
  overscroll-behavior: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.td-reader-bottom {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 1.6rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(0.8rem);
  border-top: 1px solid #eaeaea;
  z-index: 10;
}

.td-reader-btn {
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  cursor: pointer;
}

.td-reader-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.td-reader-page {
  font-size: 1.3rem;
  color: #6b7280;
  min-width: 8.4rem;
  text-align: center;
}

.td-reader-progress {
  flex: 1;
  height: 0.4rem;
  background: #e5e7eb;
  border-radius: 99.9rem;
  overflow: hidden;
}

.td-reader-progress-bar {
  height: 100%;
  background: #2563eb;
  border-radius: 99.9rem;
  transition: width 0.2s;
}

.td-chapter-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(0.6rem);
  display: flex;
  justify-content: flex-end;
  z-index: 100;
}

.td-chapter-panel {
  width: min(42rem, 90vw);
  height: 100%;
  background: #fff;
  border-left: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.td-chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem 1.2rem;
  border-bottom: 1px solid #eaeaea;
}

.td-chapter-head-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
}

.td-chapter-list {
  padding: 1rem 1rem 1.4rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.td-chapter-item {
  width: 100%;
  text-align: left;
  padding: 1rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.td-chapter-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.td-chapter-name {
  font-size: 1.3rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-chapter-meta {
  font-size: 1.2rem;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
