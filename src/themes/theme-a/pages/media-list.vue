<template>
  <div class="ta-media-list">
    <div class="ta-page-head">
      <h1>媒体库</h1>
      <button class="ta-btn-primary" @click="showAdd = true">+ 新建媒体库</button>
    </div>
    <div class="ta-grid">
      <div v-for="m in list" :key="m.mediaId" class="ta-media-card" @click="goMedia(m)">
        <div class="ta-media-icon">📁</div>
        <div class="ta-media-info">
          <div class="ta-media-name">{{ m.mediaName }}</div>
          <div class="ta-media-meta">{{ m.mangaCount || 0 }} 部漫画</div>
          <div class="ta-media-path">{{ m.mediaPath }}</div>
        </div>
      </div>
      <div v-if="list.length === 0" class="ta-empty">暂无媒体库，点击右上角添加</div>
    </div>

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
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mediaApi from '@/api/media'

const router = useRouter()
const route = useRoute()
const list = ref<any[]>([])
const showAdd = ref(false)
const submitting = ref(false)
const error = ref('')
const form = ref({ mediaName: '', mediaPath: '' })

async function loadData() {
  try {
    const res = await mediaApi.get()
    list.value = pickMediaList(res)
  } catch {
    list.value = []
  }
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
.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.ta-page-head h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
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

.ta-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
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
