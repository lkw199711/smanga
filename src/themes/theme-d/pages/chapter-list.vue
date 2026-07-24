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
          <t-cover variant="D" :seed="Number(mangaId)" :file="mangaInfo.mangaCover || ''" />
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
          <t-chapter-item
            v-for="(ch, idx) in chapterList"
            :key="ch.chapterId"
            :item="ch"
            variant="D"
            @click="goRead(ch, idx)"
            @contextmenu="openThemeContextMenu($event, 'chapter', ch)"
          />
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
import TCover from '@/themes/components/media-cover.vue'
import TChapterItem from '@/themes/components/chapter-item.vue'
import useBrowseStore from '@/store/browse'
import { userConfig, globalData } from '@/store'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const mangaId = ref<number | null>(null)
const order = computed({ get: () => userConfig.chapterOrder, set: (v) => { userConfig.chapterOrder = v } })
const page = ref(1)
const pageSize = 50
const total = ref(0)
const loading = ref(false)

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

// 监听全局排序变化
watch(() => userConfig.chapterOrder, () => {
  if (mangaId.value) loadChapters()
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
  } catch (e) {
    chapterList.value = []
    total.value = 0
  }
  loading.value = false
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
