<template>
  <div class="tb-media">
    <!-- 媒体库列<-->
    <div class="tb-section" v-if="!selectedMediaId">
      <div class="tb-page-head">
        <h1>媒体</h1>
        <button class="tb-btn-primary" @click="showAdd = true">+ 新建媒体</button>
      </div>
      <div class="tb-grid">
        <div v-for="m in mediaList" :key="m.mediaId" class="tb-media-card" @click="selectMedia(m)">
          <div class="tb-media-icon">📁</div>
          <div class="tb-media-info">
            <div class="tb-media-name">{{ m.mediaName }}</div>
            <div class="tb-media-meta">{{ m.mangaCount || 0 }} 部漫</div>
            <div class="tb-media-path">{{ m.mediaPath }}</div>
          </div>
        </div>
        <div v-if="mediaList.length === 0" class="tb-empty">暂无媒体库，点击右上角添</div>
      </div>
    </div>

    <!-- 漫画列表 -->
    <div class="tb-section" v-else>
      <div class="tb-page-head">
        <div class="tb-head-left">
          <button class="tb-btn-ghost" @click="backToMediaList">
            <span><返回媒体</span>
          </button>
          <h1>{{ selectedMediaName }}</h1>
        </div>
        <div class="tb-head-actions">
          <input v-model="keyword" class="tb-input" placeholder="搜索..." @keydown.enter="loadMangaData" />
          <select v-model="order" class="tb-select" @change="loadMangaData">
            <option value="updateTimeDesc">最近更</option>
            <option value="nameDesc">名称 Z-A</option>
            <option value="name">名称 A-Z</option>
            <option value="createTimeDesc">最近添</option>
          </select>
        </div>
      </div>
      <div class="tb-grid">
        <div v-for="m in mangaList" :key="m.mangaId" class="tb-manga-card" @click="goChapters(m)" ref="mangaImageBox">
          <div class="tb-manga-cover">
            <img v-if="m.mangaCover" :src="getMangaCover(m)" alt="" />
            <div v-else class="tb-cover-placeholder">📚</div>
          </div>
          <div class="tb-manga-name">{{ m.mangaName }}</div>
          <div class="tb-manga-meta">{{ m.chapterCount || 0 }} 章节</div>
        </div>
      </div>
      <div v-if="mangaList.length === 0 && !loading" class="tb-empty">暂无漫画</div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="tb-pagination">
        <button :disabled="page <= 1" @click="page--; loadMangaData()">上一</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; loadMangaData()">下一</button>
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
import { onMediaOperation } from '@/utils/cache'
import queue from '@/store/quque'
import MediaLibraryCreateDialog from '@/themes/components/media-library-create-dialog.vue'

const router = useRouter()
const route = useRoute()

// 媒体库相<
const mediaList = ref<mediaType[]>([])
const showAdd = ref(false)

// 漫画相关
const mangaList = ref<any[]>([])
const keyword = ref('')
const order = ref('updateTimeDesc')
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
.tb-media {
  padding: 24px;
  min-height: 100vh;
}

.tb-section {
  margin-bottom: 32px;
}

.tb-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.tb-head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tb-head-left h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.tb-head-actions {
  display: flex;
  gap: 8px;
}

.tb-input {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.tb-select {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  outline: none;
}

.tb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.tb-media-card {
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

.tb-media-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.tb-media-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.tb-media-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.tb-media-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.tb-media-path {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.tb-manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
}

.tb-manga-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.tb-manga-card:hover {
  transform: translateY(-2px);
}

.tb-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.tb-manga-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tb-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.tb-manga-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tb-manga-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.tb-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.tb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

.tb-pagination button {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.tb-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tb-pagination span {
  font-size: 13px;
  color: #6b7280;
}

.tb-btn-primary {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.tb-btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.tb-btn-ghost {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
}

.tb-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tb-modal-card {
  width: min(520px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.tb-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.tb-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.tb-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 6px;
}

.tb-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  background: #fff;
}

.tb-input:focus {
  border-color: #2563eb;
}

.tb-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.tb-error {
  margin-top: 10px;
  font-size: 12px;
  color: #ef4444;
}
</style>
