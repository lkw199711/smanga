<template>
  <div class="td-media">
    <!-- 媒体库列表 -->
    <div class="td-section" v-if="!selectedMediaId">
      <div class="td-page-head">
        <h1>媒体库</h1>
        <button class="td-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
      </div>
      <div class="td-grid">
        <div v-for="m in mediaList" :key="m.mediaId" class="td-media-card" @click="selectMedia(m)">
          <div class="td-media-icon">📁</div>
          <div class="td-media-info">
            <div class="td-media-name">{{ m.mediaName }}</div>
            <div class="td-media-meta">{{ m.mangaCount || 0 }} 部漫画</div>
            <div class="td-media-path">{{ m.mediaPath }}</div>
          </div>
        </div>
        <div v-if="mediaList.length === 0" class="td-empty">暂无媒体库，点击右上角添加</div>
      </div>
    </div>

    <!-- 漫画列表 -->
    <div class="td-section" v-else>
      <div class="td-page-head">
        <div class="td-head-left">
          <button class="td-btn-ghost" @click="backToMediaList">
            <span>← 返回媒体库</span>
          </button>
          <h1>{{ selectedMediaName }}</h1>
        </div>
        <div class="td-head-actions">
          <input v-model="keyword" class="td-input" placeholder="搜索..." @keydown.enter="loadMangaData" />
          <select v-model="order" class="td-select">
            <option value="updateTimeDesc">最近更新</option>
            <option value="nameDesc">名称 Z-A</option>
            <option value="name">名称 A-Z</option>
            <option value="createTimeDesc">最近添加</option>
          </select>
        </div>
      </div>
      <div class="td-grid">
        <div v-for="m in mangaList" :key="m.mangaId" class="td-manga-card" @click="goChapters(m)" ref="mangaImageBox">
          <div class="td-manga-cover">
            <img v-if="m.mangaCover" :src="getMangaCover(m)" alt="" />
            <div v-else class="td-cover-placeholder">📚</div>
          </div>
          <div class="td-manga-name">{{ m.mangaName }}</div>
          <div class="td-manga-meta">{{ m.chapterCount || 0 }} 章节</div>
        </div>
      </div>
      <div v-if="mangaList.length === 0 && !loading" class="td-empty">暂无漫画</div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="td-pagination">
        <button :disabled="page <= 1" @click="page--; loadMangaData()">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; loadMangaData()">下一页</button>
      </div>
    </div>

    <media-library-create-dialog v-model:visible="showAdd" @created="loadMediaData" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mediaApi from '@/api/media'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import { mediaType } from '@/type/media'
import { userConfig } from '@/store'
import { onMediaOperation } from '@/utils/cache'
import queue from '@/store/quque'
import MediaLibraryCreateDialog from '@/themes/components/media-library-create-dialog.vue'

const router = useRouter()
const route = useRoute()

// 媒体库相关
const mediaList = ref<mediaType[]>([])
const showAdd = ref(false)

// 漫画相关
const mangaList = ref<any[]>([])
const keyword = ref('')
const order = computed({ get: () => userConfig.order, set: (v) => { userConfig.order = v } })
const page = ref(1)
const pageSize = 32
const total = ref(0)
const loading = ref(false)
const selectedMediaId = ref<number | null>(null)
const selectedMediaName = ref('')

// 漫画封面图片引用
const mangaImageBox = ref(null)
const mangaCoverCache = ref<{[key: string]: string}>({})

const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 监听路由变化
watch(() => route.params.mediaId, (newMediaId) => {
  if (newMediaId) {
    selectedMediaId.value = Number(newMediaId)
    loadMangaData()
  } else {
    selectedMediaId.value = null
  }
}, { immediate: true })

watch(
  () => route.query.add,
  (value) => {
    if (value === '1') showAdd.value = true
  },
  { immediate: true }
)

watch(showAdd, (open) => {
  if (!open && route.query.add === '1') {
    const query = { ...route.query }
    delete (query as any).add
    router.replace({ path: route.path, query })
  }
})

// 监听全局排序变化
watch(() => userConfig.order, () => {
  if (selectedMediaId.value) loadMangaData()
})

onMounted(async () => {
  await loadMediaData()
  
  // 如果URL中有mediaId，则直接显示漫画列表
  if (route.params.mediaId) {
    selectedMediaId.value = Number(route.params.mediaId)
    const media = mediaList.value.find(m => m.mediaId === selectedMediaId.value)
    if (media) {
      selectedMediaName.value = media.mediaName
    }
    await loadMangaData()
  }
})

async function loadMediaData() {
  try {
    const res = await mediaApi.get(1, 999)
    mediaList.value = pickMediaList(res)
  } catch {
    mediaList.value = []
  }
}

async function loadMangaData() {
  if (!selectedMediaId.value) return
  
  loading.value = true
  try {
    const res = await mangaApi.get(selectedMediaId.value, page.value, pageSize, order.value, keyword.value)
    mangaList.value = res?.list || res?.data?.list || []
    total.value = res?.count || res?.data?.count || 0
    
    // 加载漫画封面
    mangaList.value.forEach(item => {
      if (item.mangaCover) {
        queue.mangaQueue.add(() => loadMangaCover(item))
      }
    })
  } catch (e) { /* empty */ }
  loading.value = false
}

async function loadMangaCover(item: any) {
  if (!item.mangaCover) return
  
  try {
    const blobUrl = await imageApi.get({ file: item.mangaCover })
    if (blobUrl) {
      mangaCoverCache.value[item.mangaId] = blobUrl
    }
  } catch (e) {
    console.warn('Failed to load manga cover:', item.mangaName, e)
  }
}

function getMangaCover(manga: any) {
  return mangaCoverCache.value[manga.mangaId] || manga.mangaCover
}

function pickMediaList(payload: any): mediaType[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.list)) return payload.list
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.list)) return payload.data.list
  return []
}

function selectMedia(media: mediaType) {
  selectedMediaId.value = media.mediaId
  selectedMediaName.value = media.mediaName
  router.push(`/t/media/${media.mediaId}`)
}

function backToMediaList() {
  selectedMediaId.value = null
  selectedMediaName.value = ''
  router.push('/t/media')
}

function goChapters(m: any) {
  router.push(`/t/manga/${m.mangaId}/chapters`)
}

// 监听媒体库操作，刷新数据
const stopMediaOperationListener = onMediaOperation(async () => {
  await loadMediaData()
})
onUnmounted(stopMediaOperationListener)
</script>

<style scoped>
.td-media {
  padding: 24px;
  min-height: 100vh;
}

.td-section {
  margin-bottom: 32px;
}

.td-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.td-head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.td-head-left h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.td-head-actions {
  display: flex;
  gap: 8px;
}

.td-input {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.td-select {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  outline: none;
}

.td-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.td-media-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.td-media-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.td-media-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.td-media-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.td-media-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.td-media-path {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.td-manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
}

.td-manga-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.td-manga-card:hover {
  transform: translateY(-2px);
}

.td-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.td-manga-cover img {
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
  font-size: 32px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.td-manga-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-manga-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.td-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.td-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

.td-pagination button {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.td-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.td-pagination span {
  font-size: 13px;
  color: #6b7280;
}

.td-btn-primary {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.td-btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.td-btn-ghost {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
}

.td-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.td-modal-card {
  width: min(520px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.td-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.td-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.td-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 6px;
}

.td-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  background: #fff;
}

.td-input:focus {
  border-color: #2563eb;
}

.td-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.td-error {
  margin-top: 10px;
  font-size: 12px;
  color: #ef4444;
}
</style>
