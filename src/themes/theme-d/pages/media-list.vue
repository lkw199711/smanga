<template>
  <div class="td-media-list">
    <div class="td-page-head">
      <h1>媒体库</h1>
      <button class="td-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
    </div>
    <div class="td-grid">
      <div v-for="m in list" :key="m.mediaId" class="td-media-card" v-long-press="() => openThemeActionSheet('media', m)" @click="goMedia(m)" @contextmenu="openThemeContextMenu($event, 'media', m)">
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
      <div v-if="list.length === 0" class="td-empty">暂无媒体库，点击右上角添加</div>
    </div>

    <div v-if="showAdd" class="td-modal" @click.self="closeAdd">
      <div class="td-modal-card">
        <div class="td-modal-title">新建媒体库</div>
        <div class="td-form">
          <label class="td-label">名称</label>
          <input v-model="form.mediaName" class="td-input" placeholder="例如：少年漫画" />
          <label class="td-label">路径</label>
          <input v-model="form.mediaPath" class="td-input" placeholder="例如：D:\\Manga" />
        </div>
        <div class="td-modal-actions">
          <button class="td-btn-ghost" @click="closeAdd">取消</button>
          <button class="td-btn-primary" :disabled="submitting" @click="submitAdd">创建</button>
        </div>
        <div v-if="error" class="td-error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mediaApi from '@/api/media'
import imageApi from '@/api/image'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()
const list = ref<any[]>([])
const showAdd = ref(false)
const submitting = ref(false)
const error = ref('')
const form = ref({ mediaName: '', mediaPath: '' })

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
    if (v === '1') showAdd.value = true
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
.td-media-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.td-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.td-page-head h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--sd-text);
}

.td-btn-primary {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--sd-primary);
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
  color: var(--sd-text-muted);
  background: transparent;
  border: 1px solid var(--sd-border);
  border-radius: 8px;
  cursor: pointer;
}

.td-btn-ghost:hover {
  background: var(--sd-hover);
}

.td-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.td-media-card {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.td-media-card:hover {
  border-color: var(--sd-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
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
  font-size: 42px;
  opacity: 0.7;
}

.td-media-body {
  padding: 14px 16px;
}

.td-media-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--sd-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-media-meta {
  font-size: 12px;
  color: var(--sd-text-muted);
  margin-top: 5px;
}

.td-media-path {
  font-size: 11px;
  color: var(--sd-text-faint);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: var(--sd-text-muted);
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
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.td-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--sd-text);
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
  color: var(--sd-text-muted);
  margin-top: 6px;
}

.td-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--sd-border);
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  background: var(--sd-card);
  color: var(--sd-text);
}

.td-input:focus {
  border-color: var(--sd-primary);
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
