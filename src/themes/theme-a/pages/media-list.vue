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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mediaApi from '@/api/media'

const router = useRouter()
const list = ref<any[]>([])
const showAdd = ref(false)

onMounted(async () => {
  try {
    const res = await mediaApi.get()
    list.value = res?.list || []
  } catch (e) { /* empty */ }
})

function goMedia(m: any) {
  router.push({ path: '/manga-list', query: { mediaId: m.mediaId } })
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
</style>
