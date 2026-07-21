<template>
  <div class="ta-media">
    <!-- 媒体库列表 -->
    <div class="ta-section" v-if="!selectedMediaId">
      <div class="ta-page-head">
        <h1>媒体库</h1>
        <button class="ta-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
      </div>
      <div class="ta-grid">
        <div v-for="m in mediaList" :key="m.mediaId" class="ta-media-card" @click="selectMedia(m)">
          <div class="ta-media-icon">📁</div>
          <div class="ta-media-info">
            <div class="ta-media-name">{{ m.mediaName }}</div>
            <div class="ta-media-meta">{{ m.mangaCount || 0 }} 部漫画</div>
            <div class="ta-media-path">{{ m.mediaPath }}</div>
          </div>
        </div>
        <div v-if="mediaList.length === 0" class="ta-empty">暂无媒体库，点击右上角添加</div>
      </div>
    </div>

    <!-- 漫画列表 -->
    <div class="ta-section" v-else>
      <div class="ta-page-head">
        <div class="ta-head-left">
          <button class="ta-btn-ghost" @click="backToMediaList">
            <span>← 返回媒体库</span>
          </button>
          <h1>{{ selectedMediaName }}</h1>
        </div>
        <div class="ta-head-actions">
          <input v-model="keyword" class="ta-input" placeholder="搜索..." @keydown.enter="loadMangaData" />
          <select v-model="order" class="ta-select">
            <option value="updateTimeDesc">最近更新</option>
            <option value="nameDesc">名称 Z-A</option>
            <option value="name">名称 A-Z</option>
            <option value="createTimeDesc">最近添加</option>
          </select>
        </div>
      </div>
      <div class="ta-grid">
        <div v-for="m in mangaList" :key="m.mangaId" class="ta-manga-card" @click="goChapters(m)" ref="mangaImageBox">
          <div class="ta-manga-cover">
            <img v-if="m.mangaCover" :src="getMangaCover(m)" alt="" />
            <div v-else class="ta-cover-placeholder">📚</div>
          </div>
          <div class="ta-manga-name">{{ m.mangaName }}</div>
          <div class="ta-manga-meta">{{ m.chapterCount || 0 }} 章节</div>
        </div>
      </div>
      <div v-if="mangaList.length === 0 && !loading" class="ta-empty">暂无漫画</div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="ta-pagination">
        <button :disabled="page <= 1" @click="page--; loadMangaData()">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; loadMangaData()">下一页</button>
      </div>
    </div>

    <!-- 新建媒体库弹窗 -->
    <div v-if="showAdd" class="ta-modal" @click.self="closeAdd">
      <div class="ta-modal-card">
        <div class="ta-modal-title">新建媒体库</div>
        <div class="ta-form">
          <label class="ta-label">名称</label>
          <input v-model="form.mediaName" class="ta-input" placeholder="例如：少年漫画" />
          <label class="ta-label">路径</label>
          <input v-model="form.mediaPath" class="ta-input" placeholder="例如：D:\\Manga" />
        </div>
        <div class="ta-modal-actions">
          <button class="ta-btn-ghost" @click="closeAdd">取消</button>
          <button class="ta-btn-primary" :disabled="submitting" @click="submitAdd">创建</button>
        </div>
        <div v-if="error" class="ta-error">{{ error }}</div>
      </div>
    </div>
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

const router = useRouter()
const route = useRoute()

// 媒体库相关
const mediaList = ref<mediaType[]>([])
const showAdd = ref(false)
const submitting = ref(false)
const error = ref('')
const form = ref({ mediaName: '', mediaPath: '' })

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

const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 漫画封面图片引用
const mangaImageBox = ref(null)
const mangaCoverCache = ref<{[key: string]: string}>({})

// 监听路由变化
watch(() => route.params.mediaId, (newMediaId) => {
  if (newMediaId) {
    selectedMediaId.value = Number(newMediaId)
    loadMangaData()
  } else {
    selectedMediaId.value = null
  }
}, { immediate: true })

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

function closeAdd() {
  showAdd.value = false
  error.value = ''
  form.value = { mediaName: '', mediaPath: '' }
}

async function submitAdd() {
  if (!form.value.mediaName.trim() || !form.value.mediaPath.trim()) {
    error.value = '请填写名称和路径'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const res = await mediaApi.add_media({
      mediaName: form.value.mediaName.trim(),
      mediaPath: form.value.mediaPath.trim(),
    })
    if (res) {
      closeAdd()
      await loadMediaData()
      return
    }
    error.value = '创建失败'
  } catch {
    error.value = '创建失败'
  } finally {
    submitting.value = false
  }
}

// 监听媒体库操作，刷新数据
const stopMediaOperationListener = onMediaOperation(async () => {
  await loadMediaData()
})
onUnmounted(stopMediaOperationListener)
</script>

<style scoped>
.ta-media {
  padding: 24px;
  min-height: 100vh;
}

.ta-section {
  margin-bottom: 32px;
}

.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.ta-head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ta-head-left h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.ta-head-actions {
  display: flex;
  gap: 8px;
}

.ta-input {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.ta-select {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  outline: none;
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.ta-media-card {
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

.ta-media-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.ta-media-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.ta-media-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.ta-media-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.ta-media-path {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.ta-manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
}

.ta-manga-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.ta-manga-card:hover {
  transform: translateY(-2px);
}

.ta-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ta-manga-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-manga-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-manga-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
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
  padding: 16px;
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

.ta-pagination span {
  font-size: 13px;
  color: #6b7280;
}

.ta-btn-primary {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.ta-btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.ta-btn-ghost {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
}

.ta-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ta-modal-card {
  width: min(520px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.ta-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.ta-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.ta-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 6px;
}

.ta-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  background: #fff;
}

.ta-input:focus {
  border-color: #2563eb;
}

.ta-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.ta-error {
  margin-top: 10px;
  font-size: 12px;
  color: #ef4444;
}
</style>
