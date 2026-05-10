<template>
  <div class="tb-reader-layout">
    <header class="tb-reader-top" v-show="showControls">
      <button @click="router.back()">← 返回</button>
      <span>{{ globalData.mangaName }} - {{ globalData.chapterName }}</span>
      <div class="tb-reader-right">
        <button @click="showChapters = !showChapters">目录</button>
        <div class="tb-modes">
          <button class="tb-mode" :class="{ active: mode === 'single' }" @click="mode = 'single'">单页</button>
          <button class="tb-mode" :class="{ active: mode === 'double' }" @click="mode = 'double'">双页</button>
          <button class="tb-mode" :class="{ active: mode === 'flow' }" @click="mode = 'flow'">条漫</button>
        </div>
      </div>
    </header>
    <div class="tb-reader-body" @click="showControls=!showControls"><component :is="readerComp" /></div>
    <footer class="tb-reader-bottom" v-show="showControls">
      <button :disabled="!canPrevChapter" @click="prevChapter">上一章</button>
      <div class="tb-progress"><div class="tb-progress-bar" :style="{width: pct+'%'}"></div></div>
      <span class="tb-page-num">{{ globalData.page+1 }}</span>
      <button :disabled="!canNextChapter" @click="nextChapter">下一章</button>
    </footer>

    <aside v-if="showChapters" class="tb-drawer" @click.self="showChapters = false">
      <div class="tb-panel">
        <div class="tb-panel-head">
          <div class="tb-panel-title">目录</div>
          <button @click="showChapters = false">关闭</button>
        </div>
        <div class="tb-chapter-list">
          <button
            v-for="(ch, idx) in chapters"
            :key="ch.chapterId || idx"
            class="tb-chapter-item"
            :class="{ active: idx === globalData.chapterIndex }"
            @click="goChapter(idx)"
          >
            <span class="tb-chapter-name">{{ ch.chapterName || ('第 ' + (idx + 1) + ' 话') }}</span>
            <span class="tb-chapter-meta">{{ (ch.pageCount || 0) + ' 页' }}</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { globalData } from '@/store'
import chapterApi from '@/api/chapter'
import TbSingle from './single.vue'
import TbDouble from './double.vue'
import TbFlow from './flow.vue'
const route = useRoute()
const router = useRouter()
const showControls = ref(true)
const showChapters = ref(false)
const mode = ref<'single' | 'double' | 'flow'>('single')
const chapterId = computed(() => Number(route.params.chapterId) || 0)
const chapters = computed<any[]>(() => Array.isArray(globalData.chapterList) ? globalData.chapterList : [])

const readerComp = computed(() => {
  if (mode.value === 'double') return TbDouble
  if (mode.value === 'flow') return TbFlow
  return TbSingle
})

const pct = computed(() => { const l = globalData.imgPathList?.length || 1; return Math.round(((globalData.page+1)/l)*100) })

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
</script>
<style scoped>
.tb-reader-layout{display:flex;flex-direction:column;height:100vh;background:#0a0515;color:#fff}
.tb-reader-top{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:rgba(30,15,60,0.9);backdrop-filter:blur(12px)}
.tb-reader-top button{padding:6px 14px;background:rgba(255,255,255,0.1);border:none;border-radius:16px;color:#fff;cursor:pointer;font-size:12px}
.tb-reader-top span{font-size:13px;color:rgba(255,255,255,0.7);max-width:50%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-reader-body{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center}
.tb-reader-bottom{display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(30,15,60,0.9);backdrop-filter:blur(12px)}
.tb-reader-bottom button{padding:6px 14px;background:rgba(255,255,255,0.1);border:none;border-radius:16px;color:#fff;cursor:pointer;font-size:12px}
.tb-reader-bottom button:disabled{opacity:0.35;cursor:default}
.tb-progress{flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden}
.tb-progress-bar{height:100%;background:linear-gradient(90deg,#a855f7,#ec4899);border-radius:2px;transition:width .2s}
.tb-page-num{font-size:12px;color:rgba(255,255,255,0.5)}

.tb-reader-right{display:flex;align-items:center;gap:8px}
.tb-modes{display:flex;gap:4px}
.tb-mode{padding:6px 10px;background:rgba(255,255,255,0.1);border:none;border-radius:16px;color:rgba(255,255,255,0.75);cursor:pointer;font-size:12px}
.tb-mode.active{background:rgba(255,255,255,0.18);color:#fff}

.tb-drawer{position:fixed;inset:0;background:rgba(0,0,0,0.35);backdrop-filter:blur(10px);display:flex;justify-content:flex-end;z-index:100}
.tb-panel{width:min(420px,90vw);height:100%;background:rgba(30,15,60,0.92);border-left:1px solid rgba(255,255,255,0.12);display:flex;flex-direction:column}
.tb-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 12px;border-bottom:1px solid rgba(255,255,255,0.12)}
.tb-panel-title{font-size:13px;font-weight:600;color:rgba(255,255,255,0.9)}
.tb-chapter-list{padding:10px 10px 14px;overflow:auto;display:flex;flex-direction:column;gap:6px}
.tb-chapter-item{width:100%;text-align:left;padding:10px 10px;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}
.tb-chapter-item.active{border-color:rgba(236,72,153,0.5);background:linear-gradient(135deg,rgba(168,85,247,0.25),rgba(236,72,153,0.18))}
.tb-chapter-name{font-size:13px;color:rgba(255,255,255,0.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-chapter-meta{font-size:12px;color:rgba(255,255,255,0.55);flex-shrink:0}
</style>
