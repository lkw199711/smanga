<template>
  <div class="td-chapter-list">
    <div class="td-header">
      <div class="td-back" @click="goBack">
        <span>←</span>
        <span>返回</span>
      </div>
      <div class="td-title">{{ mangaInfo.mangaName || '章节列表' }}</div>
      <div class="td-actions">
        <select v-model="order" class="td-select" @change="loadChapters">
          <option value="number">序号正序</option>
          <option value="numberDesc">序号倒序</option>
          <option value="name">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
        </select>
        <button class="td-btn-icon" @click="toggleCollect">
          <span v-if="isCollected">★</span>
          <span v-else>☆</span>
        </button>
      </div>
    </div>

    <div class="td-content">
      <div class="td-manga-info">
        <div class="td-cover">
          <img v-if="mangaInfo.mangaCover" :src="getMangaCover(mangaInfo)" alt="" />
          <div v-else class="td-cover-placeholder">📚</div>
        </div>
        <div class="td-info">
          <div class="td-author" v-if="mangaInfo.author">作者：{{ mangaInfo.author }}</div>
          <div class="td-desc" v-if="mangaInfo.describe">{{ mangaInfo.describe }}</div>
          <div class="td-meta">
            <span>{{ total }} 章节</span>
            <span v-if="mangaInfo.publishDate">{{ formatDate(mangaInfo.publishDate) }}</span>
          </div>
        </div>
      </div>

      <div class="td-chapters">
        <div class="td-section-title">章节列表</div>
        <div class="td-chapter-grid">
          <div
            v-for="(ch, idx) in chapterList"
            :key="ch.chapterId"
            class="td-chapter-item"
            @click="goRead(ch, idx)"
			@contextmenu="openThemeContextMenu($event, 'chapter', ch)"
            :class="{ 'td-chapter-read': ch.latest?.finish }"
          >
            <div class="td-chapter-cover">
              <img v-if="getChapterCover(ch)" :src="getChapterCover(ch)" alt="" />
              <div v-else class="td-cover-placeholder">📖</div>
            </div>
            <div class="td-chapter-info">
              <div class="td-chapter-name">{{ ch.chapterName }}</div>
              <div class="td-chapter-meta">{{ ch.pageCount || '?' }} 页</div>
              <div class="td-chapter-status" v-if="ch.latest">
                <span v-if="ch.latest.finish">✓ 已读</span>
                <span v-else>读至第 {{ ch.latest.page }} 页</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="chapterList.length === 0 && !loading" class="td-empty">暂无章节</div>
        
        <div v-if="totalPages > 1" class="td-pagination">
          <button :disabled="page <= 1" @click="page--; loadChapters()">上一页</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages" @click="page++; loadChapters()">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import collectApi from '@/api/collect'
import imageApi from '@/api/image'
import queue from '@/store/quque'
import useBrowseStore from '@/store/browse'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const mangaId = ref<number | null>(null)
const order = ref('number')
const page = ref(1)
const pageSize = 50
const total = ref(0)
const loading = ref(false)

// 章节封面缓存
const chapterCoverCache = ref<{[key: string]: string}>({})

const totalPages = computed(() => Math.ceil(total.value / pageSize))

onMounted(async () => {
  mangaId.value = Number(route.params.mangaId)
  if (mangaId.value) {
    await loadMangaInfo()
    await loadChapters()
    await checkCollectStatus()
  }
})

watch(() => route.params.mangaId, async (newMangaId) => {
  if (newMangaId) {
    mangaId.value = Number(newMangaId)
    await loadMangaInfo()
    await loadChapters()
    await checkCollectStatus()
  }
})

async function loadMangaInfo() {
  if (!mangaId.value) return
  try {
    const res = await mangaApi.get_manga_info(mangaId.value)
    mangaInfo.value = res || {}
  } catch (e) {
    mangaInfo.value = {}
  }
}

async function loadChapters() {
  if (!mangaId.value) return
  loading.value = true
  try {
    const res = await chapterApi.get({
      mangaId: mangaId.value,
      page: page.value,
      pageSize,
      order: order.value
    })
    chapterList.value = res?.list || []
    total.value = res?.count || 0
    
    // 异步加载章节封面
    chapterList.value.forEach(ch => {
      if (ch.chapterCover || ch.pageImage) {
        queue.mangaQueue.add(() => loadChapterCover(ch))
      }
    })
  } catch (e) {
    chapterList.value = []
    total.value = 0
  }
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

function getMangaCover(manga: any) {
  if (!manga.mangaCover) return ''
  return imageApi.getUrl({ file: manga.mangaCover })
}

async function checkCollectStatus() {
  if (!mangaId.value) return
  try {
    isCollected.value = await collectApi.is_collect('manga', mangaId.value)
  } catch (e) {
    isCollected.value = false
  }
}

async function toggleCollect() {
  if (!mangaId.value) return
  try {
    if (isCollected.value) {
      await collectApi.remove_collect('manga', mangaId.value)
    } else {
      await collectApi.add_collect({ collectType: 'manga', mangaId: mangaId.value, mediaId: mangaInfo.value.mediaId })
    }
    isCollected.value = !isCollected.value
  } catch (e) {
    console.error('收藏操作失败:', e)
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

function goBack() {
  router.back()
}

function goRead(ch: any, idx: number) {
  if (!mangaId.value || !ch.chapterId) return
  
  globalData.chapterList = chapterList.value
  globalData.chapterIndex = idx
  globalData.chapterName = ch.chapterName || ''
  globalData.mangaName = mangaInfo.value.mangaName || globalData.mangaName
  
  router.push(`/t/reader/${ch.chapterId}`)
}
</script>

<style scoped>
.td-chapter-list {
  padding: 24px;
  min-height: 100vh;
}

.td-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.td-back {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}

.td-back:hover {
  background: #f3f4f6;
}

.td-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.td-actions {
  margin-left: auto;
}

.td-btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.td-btn-icon:hover {
  background: #f3f4f6;
}

.td-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
}

.td-manga-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.td-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.td-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.td-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.td-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.td-author {
  font-size: 13px;
  color: #6b7280;
}

.td-desc {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

.td-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.td-chapters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.td-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.td-chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.td-chapter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.td-chapter-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.td-chapter-cover {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.td-chapter-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.td-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.td-chapter-info {
  flex: 1;
  min-width: 0;
}

.td-chapter-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-chapter-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.td-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .td-content {
    grid-template-columns: 1fr;
  }
  
  .td-chapter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
