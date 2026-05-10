<template>
  <div class="ta-reader-layout">
    <header class="ta-reader-top" v-show="showControls">
      <button class="ta-reader-btn" @click="router.back()">← 返回</button>
      <div class="ta-reader-title">{{ globalData.mangaName }} - {{ globalData.chapterName }}</div>
      <div class="ta-reader-right">
        <button class="ta-reader-btn" @click="showChapters = !showChapters">目录</button>
        <div class="ta-reader-modes">
          <button class="ta-reader-mode" :class="{ active: mode === 'single' }" @click="mode = 'single'">单页</button>
          <button class="ta-reader-mode" :class="{ active: mode === 'double' }" @click="mode = 'double'">双页</button>
          <button class="ta-reader-mode" :class="{ active: mode === 'flow' }" @click="mode = 'flow'">条漫</button>
        </div>
      </div>
    </header>
    <div class="ta-reader-body" @click="showControls = !showControls">
      <component :is="readerComp" />
    </div>
    <footer class="ta-reader-bottom" v-show="showControls">
      <button class="ta-reader-btn" :disabled="!canPrevChapter" @click="prevChapter">上一章</button>
      <span class="ta-reader-page">{{ globalData.page + 1 }}</span>
      <button class="ta-reader-btn" :disabled="!canNextChapter" @click="nextChapter">下一章</button>
    </footer>

    <aside v-if="showChapters" class="ta-chapter-drawer" @click.self="showChapters = false">
      <div class="ta-chapter-panel">
        <div class="ta-chapter-head">
          <div class="ta-chapter-head-title">目录</div>
          <button class="ta-reader-btn" @click="showChapters = false">关闭</button>
        </div>
        <div class="ta-chapter-list">
          <button
            v-for="(ch, idx) in chapters"
            :key="ch.chapterId || idx"
            class="ta-chapter-item"
            :class="{ active: idx === globalData.chapterIndex }"
            @click="goChapter(idx)"
          >
            <span class="ta-chapter-name">{{ ch.chapterName || ('第 ' + (idx + 1) + ' 话') }}</span>
            <span class="ta-chapter-meta">{{ (ch.pageCount || 0) + ' 页' }}</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { globalData } from '@/store'
import chapterApi from '@/api/chapter'
import TaSingle from './single.vue'
import TaDouble from './double.vue'
import TaFlow from './flow.vue'

const route = useRoute()
const router = useRouter()
const showControls = ref(true)
const showChapters = ref(false)
const mode = ref<'single' | 'double' | 'flow'>('single')

const chapterId = computed(() => Number(route.params.chapterId) || 0)
const chapters = computed<any[]>(() => Array.isArray(globalData.chapterList) ? globalData.chapterList : [])

const readerComp = computed(() => {
  if (mode.value === 'double') return TaDouble
  if (mode.value === 'flow') return TaFlow
  return TaSingle
})

const canPrevChapter = computed(() => globalData.chapterIndex > 0 && chapters.value.length > 0)
const canNextChapter = computed(() => chapters.value.length > 0 && globalData.chapterIndex < chapters.value.length - 1)

async function loadChapter() {
  if (!chapterId.value) return
  globalData.chapterId = chapterId.value
  const pageJump = Number(localStorage.getItem('pageJump') || 0)
  if (pageJump && pageJump > 1) {
    localStorage.removeItem('pageJump')
    globalData.page = Math.max(pageJump - 1, 0)
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

watch(
  () => chapterId.value,
  () => {
    showChapters.value = false
    loadChapter()
  },
  { immediate: true }
)

function goChapter(idx: number) {
  const target = chapters.value[idx]
  if (!target?.chapterId) return
  globalData.chapterIndex = idx
  globalData.chapterId = target.chapterId
  globalData.chapterName = target.chapterName || globalData.chapterName
  router.push(`/t/reader/${target.chapterId}`)
}

function prevChapter() {
  if (!canPrevChapter.value) return
  goChapter(globalData.chapterIndex - 1)
}

function nextChapter() {
  if (!canNextChapter.value) return
  goChapter(globalData.chapterIndex + 1)
}

onMounted(() => {
  if (!globalData.mangaName) globalData.mangaName = 'smanga'
})
</script>

<style scoped>
.ta-reader-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #111;
  color: #fff;
}

.ta-reader-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.ta-reader-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
  text-align: center;
}

.ta-reader-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ta-reader-modes {
  display: flex;
  gap: 4px;
}

.ta-reader-mode {
  padding: 6px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  cursor: pointer;
}

.ta-reader-mode.active {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.ta-reader-body {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ta-reader-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.ta-reader-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #fff;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  cursor: pointer;
}

.ta-reader-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.ta-reader-page {
  font-size: 13px;
  color: #9ca3af;
}

.ta-chapter-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
  z-index: 100;
}

.ta-chapter-panel {
  width: min(420px, 90vw);
  height: 100%;
  background: rgba(0, 0, 0, 0.78);
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  flex-direction: column;
}

.ta-chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.ta-chapter-head-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.ta-chapter-list {
  padding: 10px 10px 14px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ta-chapter-item {
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ta-chapter-item.active {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.1);
}

.ta-chapter-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-chapter-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}
</style>
