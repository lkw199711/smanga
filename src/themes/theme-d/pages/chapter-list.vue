<template>
  <div class="td-chapter-list">
    <div class="td-header">
      <div class="td-back" @click="goBack">
        <span>←</span>
        <span>返回漫画列表</span>
      </div>
      <div class="td-title">{{ mangaInfo.mangaName }}</div>
      <div class="td-actions">
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
          <div class="td-author" v-if="mangaInfo.mangaAuthor">作者：{{ mangaInfo.mangaAuthor }}</div>
          <div class="td-desc" v-if="mangaInfo.mangaDesc">{{ mangaInfo.mangaDesc }}</div>
          <div class="td-meta">
            <span>{{ chapterList.length }} 章节</span>
            <span>{{ mangaInfo.updateTime | formatDate }}</span>
          </div>
        </div>
      </div>

      <div class="td-chapters">
        <div class="td-section-title">章节列表</div>
        <div class="td-chapter-grid">
          <div
            v-for="ch in chapterList"
            :key="ch.chapterId"
            class="td-chapter-item"
            @click="goRead(ch)"
            ref="chapterBox"
          >
            <div class="td-chapter-cover">
              <img v-if="ch.chapterImage" :src="getChapterCover(ch)" alt="" />
              <div v-else class="td-cover-placeholder">📖</div>
            </div>
            <div class="td-chapter-info">
              <div class="td-chapter-name">{{ ch.chapterName }}</div>
              <div class="td-chapter-meta">{{ ch.chapterPath }}</div>
            </div>
          </div>
        </div>
        <div v-if="chapterList.length === 0" class="td-empty">暂无章节</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import collectApi from '@/api/collect'
import imageApi from '@/api/image'
import queue from '@/store/quque'

const router = useRouter()
const route = useRoute()

const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const mangaId = ref<number | null>(null)

// 章节封面缓存
const chapterCoverCache = ref<{[key: string]: string}>({})

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
    const res = await mangaApi.get_info(mangaId.value)
    mangaInfo.value = res?.data || res || {}
  } catch (e) {
    mangaInfo.value = {}
  }
}

async function loadChapters() {
  if (!mangaId.value) return
  try {
    const res = await chapterApi.get(mangaId.value, 1, 999)
    chapterList.value = res?.list || res?.data?.list || []
    
    // 异步加载章节封面
    chapterList.value.forEach(ch => {
      if (ch.chapterImage) {
        queue.chapterQueue.add(() => loadChapterCover(ch))
      }
    })
  } catch (e) {
    chapterList.value = []
  }
}

async function loadChapterCover(chapter: any) {
  if (!chapter.chapterImage) return
  
  try {
    const blobUrl = await imageApi.get({ file: chapter.chapterImage })
    if (blobUrl) {
      chapterCoverCache.value[chapter.chapterId] = blobUrl
    }
  } catch (e) {
    console.warn('Failed to load chapter cover:', chapter.chapterName, e)
  }
}

function getChapterCover(chapter: any) {
  return chapterCoverCache.value[chapter.chapterId] || chapter.chapterImage
}

function getMangaCover(manga: any) {
  if (!manga.mangaCover) return ''
  return imageApi.getUrl({ file: manga.mangaCover })
}

async function checkCollectStatus() {
  if (!mangaId.value) return
  try {
    const res = await collectApi.is_collect(mangaId.value)
    isCollected.value = res?.data || false
  } catch (e) {
    isCollected.value = false
  }
}

async function toggleCollect() {
  if (!mangaId.value) return
  const action = isCollected.value ? 'remove' : 'add'
  try {
    if (action === 'add') {
      await collectApi.add(mangaId.value)
    } else {
      await collectApi.remove(mangaId.value)
    }
    isCollected.value = !isCollected.value
  } catch (e) {
    // 处理收藏失败
  }
}

function goBack() {
  router.back()
}

function goRead(chapter: any) {
  if (!mangaId.value || !chapter.chapterId) return
  router.push(`/t/read/${mangaId.value}/${chapter.chapterId}`)
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