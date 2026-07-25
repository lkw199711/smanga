<template>
  <div class="td-media">
    <!-- 媒体库列表 -->
    <div class="td-section" v-if="!selectedMediaId">
      <div class="td-page-head">
        <h1>媒体库</h1>
        <button v-if="isAdmin" class="td-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
      </div>
      <div class="td-media-grid">
        <div v-for="m in mediaList" :key="m.mediaId" class="td-media-card" v-long-press="() => openThemeActionSheet('media', m)" @click="selectMedia(m)" @contextmenu="openThemeContextMenu($event, 'media', m)">
          <div class="td-media-cover">
            <img v-if="getMediaCover(m)" :src="getMediaCover(m)" alt="" />
            <div v-else class="td-media-placeholder">
              <span class="td-placeholder-icon">📁</span>
            </div>
          </div>
          <div class="td-media-body">
            <div class="td-media-name">{{ m.mediaName }}</div>
            <div class="td-media-meta">{{ m.mangaCount || 0 }} 部漫画</div>
            <div class="td-media-path">{{ m.mediaPath }}</div>
          </div>
        </div>
        <div v-if="mediaList.length === 0" class="td-empty">{{ isAdmin ? '暂无媒体库，点击右上角添加' : '暂无媒体库' }}</div>
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

    <media-library-create-dialog v-if="isAdmin" v-model:visible="showAdd" @created="loadMediaData" />
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
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'
import MediaLibraryCreateDialog from '@/themes/components/media-library-create-dialog.vue'
import { Cookies } from '@/utils'

const router = useRouter()
const route = useRoute()

// 媒体库相关
const mediaList = ref<mediaType[]>([])
const showAdd = ref(false)
const isAdmin = computed(() => Cookies.getRole() === 'admin')

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

// 媒体库封面图片缓存
const mediaCoverCache = ref<{[key: string]: string}>({})

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
    if (value === '1' && isAdmin.value) showAdd.value = true
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
    // 加载媒体库封面
    mediaList.value.forEach(item => {
      if (item.mediaCover) {
        loadMediaCover(item)
      }
    })
  } catch {
    mediaList.value = []
  }
}

async function loadMediaCover(item: any) {
  if (!item.mediaCover) return
  try {
    const blobUrl = await imageApi.get({ file: item.mediaCover })
    if (blobUrl) {
      mediaCoverCache.value[item.mediaId] = blobUrl
    }
  } catch (e) {
    console.warn('Failed to load media cover:', item.mediaName, e)
  }
}

function getMediaCover(media: any) {
  return mediaCoverCache.value[media.mediaId] || ''
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
  padding: 2.4rem;
  min-height: 100vh;
}

.td-section {
  margin-bottom: 3.2rem;
}

.td-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.4rem;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.td-head-left {
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.td-head-left h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.td-head-actions {
  display: flex;
  gap: 0.8rem;
}

.td-input {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  outline: none;
  background: #fff;
}

.td-select {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  background: #fff;
  outline: none;
}

.td-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 2rem;
}

.td-media-card {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 1.2rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.td-media-card:hover {
  border-color: var(--sd-primary);
  box-shadow: 0 0.6rem 2rem rgba(0, 0, 0, 0.08);
  transform: translateY(-0.3rem);
}

.td-media-cover {
  width: 100%;
  aspect-ratio: 246 / 90;
  overflow: hidden;
  background: var(--sd-hover);
}

.td-media-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.td-media-card:hover .td-media-cover img {
  transform: scale(1.05);
}

.td-media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sd-hover), var(--sd-primary-bg));
}

.td-placeholder-icon {
  font-size: 4.2rem;
  opacity: 0.7;
}

.td-media-body {
  padding: 1.4rem 1.6rem;
}

.td-media-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sd-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-media-meta {
  font-size: 1.2rem;
  color: var(--sd-text-muted);
  margin-top: 0.5rem;
}

.td-media-path {
  font-size: 1.1rem;
  color: var(--sd-text-faint);
  margin-top: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.8rem;
}

.td-manga-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.td-manga-card:hover {
  transform: translateY(-0.2rem);
}

.td-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.8rem;
  background: #f3f4f6;
  box-shadow: 0 0.2rem 0.8rem rgba(0,0,0,0.06);
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
  font-size: 3.2rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.td-manga-name {
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-manga-meta {
  font-size: 1.1rem;
  color: #9ca3af;
  margin-top: 0.2rem;
}

.td-empty {
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
}

.td-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-top: 3.2rem;
  padding: 1.6rem;
}

.td-pagination button {
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.6rem;
  background: #fff;
  cursor: pointer;
}

.td-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.td-pagination span {
  font-size: 1.3rem;
  color: #6b7280;
}

.td-btn-primary {
  padding: 0.8rem 1.6rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
}

.td-btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.td-btn-ghost {
  padding: 0.8rem 1.6rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
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
  width: min(52rem, calc(100vw - 3.2rem));
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 1.4rem;
  box-shadow: 0 1.2rem 4rem rgba(0, 0, 0, 0.12);
  padding: 2rem;
}

.td-modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.4rem;
}

.td-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.td-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
  margin-top: 0.6rem;
}

.td-input {
  height: 4rem;
  padding: 0 1.2rem;
  border: 1px solid #eaeaea;
  border-radius: 1rem;
  outline: none;
  font-size: 1.3rem;
  background: #fff;
}

.td-input:focus {
  border-color: #2563eb;
}

.td-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.6rem;
}

.td-error {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #ef4444;
}
</style>
