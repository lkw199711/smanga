<template>
  <div class="tb-page">
    <h1>媒体库</h1>
    <div class="tb-grid">
      <div v-for="m in list" :key="m.mediaId" class="tb-media-card" v-long-press="() => openThemeActionSheet('media', m)" @click="goMedia(m)" @contextmenu="openThemeContextMenu($event, 'media', m)">
        <div class="tb-media-icon">📁</div>
        <div class="tb-media-name">{{ m.mediaName }}</div>
		<div class="tb-media-count">{{ m.mangaCount || 0 }} 部漫画</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mediaApi from '@/api/media'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'
const router = useRouter()
const list = ref<any[]>([])
onMounted(async () => { try { list.value = pickMediaList(await mediaApi.get()) } catch(e){} })
function pickMediaList(payload: any): any[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.list)) return payload.list
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.list)) return payload.data.list
  return []
}
function goMedia(m: any) { router.push(`/t/media/${m.mediaId}`) }
</script>

<style scoped>
h1 { font-size: 20px; font-weight: 700; margin: 0 0 20px; color: #1f2937; }
.tb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.tb-media-card { padding: 24px; background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; cursor: pointer; transition: all 0.2s; }
.tb-media-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
.tb-media-icon { font-size: 32px; margin-bottom: 12px; }
.tb-media-name { font-size: 15px; font-weight: 600; color: #1f2937; }
.tb-media-count { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }
</style>
