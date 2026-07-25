<template>
  <div class="ta-media-list">
    <div class="ta-page-head">
      <h1>媒体库</h1>
      <button v-if="isAdmin" class="ta-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
    </div>
    <div class="ta-grid">
      <div v-for="m in list" :key="m.mediaId" class="ta-media-card" v-long-press="() => openThemeActionSheet('media', m)" @click="goMedia(m)" @contextmenu="openThemeContextMenu($event, 'media', m)">
        <div class="ta-media-cover">
          <img v-if="getMediaCover(m)" :src="getMediaCover(m)" alt="" />
          <div v-else class="ta-media-placeholder">
            <span class="ta-placeholder-icon">📁</span>
          </div>
        </div>
        <div class="ta-media-body">
          <div class="ta-media-name">{{ m.mediaName }}</div>
          <div class="ta-media-meta">{{ m.mangaCount || 0 }} 部漫画</div>
          <div class="ta-media-path">{{ m.mediaPath }}</div>
        </div>
      </div>
      <div v-if="list.length === 0" class="ta-empty">{{ isAdmin ? '暂无媒体库，点击右上角添加' : '暂无媒体库，请联系管理员添加' }}</div>
    </div>

    <div v-if="showAdd && isAdmin" class="ta-modal" @click.self="closeAdd">
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mediaApi from '@/api/media'
import imageApi from '@/api/image'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'
import { Cookies } from '@/utils'

const router = useRouter()
const route = useRoute()
const list = ref<any[]>([])
const showAdd = ref(false)
const submitting = ref(false)
const error = ref('')
const form = ref({ mediaName: '', mediaPath: '' })

// 仅服务器管理员可创建媒体库
const isAdmin = computed(() => Cookies.getRole() === 'admin')

// 媒体库封面缓存
const mediaCoverCache = ref<{[key: string]: string}>({})

async function loadData() {
  try {
    const res = await mediaApi.get()
    list.value = pickMediaList(res)
    // 加载封面
    list.value.forEach(item => {
      if (item.mediaCover) {
        loadMediaCover(item)
      }
    })
  } catch {
    list.value = []
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

onMounted(loadData)

watch(
  () => route.query.add,
  (v) => {
    if (v === '1' && isAdmin.value) showAdd.value = true
  },
  { immediate: true }
)

function pickMediaList(payload: any): any[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.list)) return payload.list
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.list)) return payload.data.list
  return []
}

function goMedia(m: any) {
  router.push(`/t/media/${m.mediaId}`)
}

function closeAdd() {
  showAdd.value = false
  error.value = ''
  form.value = { mediaName: '', mediaPath: '' }
  if (route.query.add === '1') {
    const q = { ...route.query }
    delete (q as any).add
    router.replace({ path: route.path, query: q })
  }
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
      await loadData()
      return
    }
    error.value = '创建失败'
  } catch {
    error.value = '创建失败'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.4rem;
}

.ta-page-head h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.ta-btn-primary {
  padding: 0.8rem 1.6rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
}

.ta-btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.ta-btn-ghost {
  padding: 0.8rem 1.6rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  cursor: pointer;
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32rem, 1fr));
  gap: 1.6rem;
}

.ta-media-card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 1.2rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.ta-media-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 0.6rem 2rem rgba(0,0,0,0.08);
  transform: translateY(-0.3rem);
}

.ta-media-cover {
  width: 100%;
  aspect-ratio: 246 / 90;
  overflow: hidden;
  background: #f3f4f6;
}

.ta-media-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ta-media-card:hover .ta-media-cover img {
  transform: scale(1.05);
}

.ta-media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.ta-placeholder-icon {
  font-size: 4.2rem;
  opacity: 0.7;
}

.ta-media-body {
  padding: 1.4rem 1.6rem;
}

.ta-media-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.ta-media-meta {
  font-size: 1.2rem;
  color: #6b7280;
  margin-top: 0.4rem;
}

.ta-media-path {
  font-size: 1.1rem;
  color: #9ca3af;
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 24rem;
}

.ta-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
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
  width: min(52rem, calc(100vw - 3.2rem));
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 1.4rem;
  box-shadow: 0 1.2rem 4rem rgba(0, 0, 0, 0.12);
  padding: 2rem;
}

.ta-modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.4rem;
}

.ta-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.ta-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
  margin-top: 0.6rem;
}

.ta-input {
  height: 4rem;
  padding: 0 1.2rem;
  border: 1px solid #eaeaea;
  border-radius: 1rem;
  outline: none;
  font-size: 1.3rem;
  background: #fff;
}

.ta-input:focus {
  border-color: #2563eb;
}

.ta-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.6rem;
}

.ta-error {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #ef4444;
}
</style>
