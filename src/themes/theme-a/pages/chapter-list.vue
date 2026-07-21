<template>
  <div class="ta-chapter-list">
    <div class="ta-page-head">
      <div class="ta-head-left">
        <button class="ta-btn-back" @click="router.back()">← 返回</button>
        <h1>{{ mangaName || '章节列表' }}</h1>
      </div>
      <div class="ta-head-actions">
        <select v-model="order" class="ta-select" @change="loadData">
          <option value="number">序号正序</option>
          <option value="numberDesc">序号倒序</option>
          <option value="name">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
        </select>
      </div>
    </div>
    <div class="ta-chapters">
      <div v-for="(ch, idx) in list" :key="ch.chapterId" class="ta-ch-item" @click="goRead(ch, idx)" @contextmenu="openThemeContextMenu($event, 'chapter', ch)">
        <div class="ta-ch-cover">
          <img v-if="getChapterCover(ch)" :src="getChapterCover(ch)" alt="" />
          <div v-else class="ta-ch-cover-ph">📄</div>
        </div>
        <div class="ta-ch-info">
          <div class="ta-ch-name">{{ ch.chapterName }}</div>
          <div class="ta-ch-meta">{{ ch.pageCount || '?' }} 页</div>
        </div>
      </div>
    </div>
    <div v-if="list.length === 0 && !loading" class="ta-empty">暂无章节</div>
    <div v-if="totalPages > 1" class="ta-pagination">
      <button :disabled="page <= 1" @click="page--; loadData()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadData()">下一页</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import chapterApi from '@/api/chapter'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import queue from '@/store/quque'
import { globalData } from '@/store'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()

const list = ref<any[]>([])
const order = ref('number')
const page = ref(1)
const pageSize = 50
const total = ref(0)
const loading = ref(false)
const mangaName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 章节封面缓存
const chapterCoverCache = ref<{[key: string]: string}>({})

onMounted(() => { loadData() })

async function loadData() {
  const mangaId = Number(route.params.mangaId) || 0
  if (!mangaId) return
  loading.value = true
  try {
    const res = await chapterApi.get({ mangaId, page: page.value, pageSize, order: order.value })
    list.value = res?.list || []
    total.value = res?.count || 0
    
    // 加载章节封面
    list.value.forEach(chapter => {
      if (chapter.chapterCover || chapter.pageImage) {
        queue.mangaQueue.add(() => loadChapterCover(chapter))
      }
    })
    
    if (!mangaName.value) {
      const info = await mangaApi.get_manga_info(mangaId)
      mangaName.value = info?.mangaName || ''
    }
  } catch (e) { /* empty */ }
  loading.value = false
}

async function loadChapterCover(chapter: any) {
  const coverFile = chapter.pageImage || chapter.chapterCover
  if (!coverFile) return
  
  try {
    const blobUrl = await imageApi.get({ file: coverFile })
    if (blobUrl) {
      chapterCoverCache.value[chapter.chapterId] = blobUrl
    }
  } catch (e) {
    console.warn('Failed to load chapter cover:', chapter.chapterName, e)
  }
}

function getChapterCover(chapter: any) {
  return chapterCoverCache.value[chapter.chapterId] || chapter.chapterCover || chapter.pageImage
}

function goRead(ch: any, idx: number) {
  globalData.chapterList = list.value
  globalData.chapterIndex = idx
  globalData.chapterName = ch.chapterName || ''
  globalData.mangaName = mangaName.value || globalData.mangaName
  router.push(`/t/reader/${ch.chapterId}`)
}
</script>

<style scoped>
.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.ta-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ta-head-left h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.ta-btn-back {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.ta-select {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
}

.ta-chapters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.ta-ch-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.ta-ch-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.ta-ch-cover {
  flex-shrink: 0;
  width: 48px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
}

.ta-ch-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-ch-cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}

.ta-ch-info {
  min-width: 0;
}

.ta-ch-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-ch-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.ta-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.ta-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.ta-pagination button {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.ta-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
