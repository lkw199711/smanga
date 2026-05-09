<template>
  <div class="td-media-list">
    <h2 class="td-page-title">媒体库</h2>
    <div class="td-grid">
      <div class="td-media-card" v-for="m in list" :key="m.mediaId" @click="router.push(`/media/${m.mediaId}`)">
        <div class="td-media-card-icon">📂</div>
        <div class="td-media-card-name">{{ m.mediaName }}</div>
        <div class="td-media-card-count">{{ m.mangaCount || 0 }} 部漫画</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mediaApi from '@/api/media'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try { const r = await mediaApi.get(); list.value = r?.data?.list || r?.data || [] } catch {}
})
</script>

<style scoped>
.td-media-list { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.td-media-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all .2s; }
.td-media-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.td-media-card-icon { font-size: 36px; margin-bottom: 12px; }
.td-media-card-name { font-size: 14px; font-weight: 600; color: var(--fg); }
.td-media-card-count { font-size: 12px; color: var(--fg2); margin-top: 4px; }
</style>
