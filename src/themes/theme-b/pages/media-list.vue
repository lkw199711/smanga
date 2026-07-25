<template>
  <div class="tb-page">
    <h1>媒体库</h1>
    <div class="tb-grid">
      <div v-for="m in list" :key="m.mediaId" class="tb-media-card" v-long-press="() => openThemeActionSheet('media', m)" @click="goMedia(m)" @contextmenu="openThemeContextMenu($event, 'media', m)">
        <div class="tb-media-cover">
          <img v-if="getMediaCover(m)" :src="getMediaCover(m)" alt="" />
          <div v-else class="tb-media-placeholder">
            <span class="tb-placeholder-icon">📁</span>
          </div>
        </div>
        <div class="tb-media-body">
          <div class="tb-media-name">{{ m.mediaName }}</div>
          <div class="tb-media-count">{{ m.mangaCount || 0 }} 部漫画</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mediaApi from '@/api/media'
import imageApi from '@/api/image'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'
const router = useRouter()
const list = ref<any[]>([])

// 媒体库封面缓存
const mediaCoverCache = ref<{[key: string]: string}>({})

onMounted(async () => {
  try {
    list.value = pickMediaList(await mediaApi.get())
    list.value.forEach(item => {
      if (item.mediaCover) loadMediaCover(item)
    })
  } catch(e) {}
})

async function loadMediaCover(item: any) {
  if (!item.mediaCover) return
  try {
    const blobUrl = await imageApi.get({ file: item.mediaCover })
    if (blobUrl) mediaCoverCache.value[item.mediaId] = blobUrl
  } catch (e) { /* silent */ }
}

function getMediaCover(media: any) {
  return mediaCoverCache.value[media.mediaId] || ''
}

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
h1 { font-size: 2rem; font-weight: 700; margin: 0 0 2rem; color: #1f2937; }
.tb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr)); gap: 2rem; }
.tb-media-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(0.8rem); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.4rem; overflow: hidden; cursor: pointer; transition: all 0.25s ease; }
.tb-media-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-0.3rem); box-shadow: 0 0.6rem 2rem rgba(0,0,0,0.08); }
.tb-media-cover { width: 100%; aspect-ratio: 246 / 90; overflow: hidden; background: rgba(0,0,0,0.05); }
.tb-media-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.tb-media-card:hover .tb-media-cover img { transform: scale(1.05); }
.tb-media-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1)); }
.tb-placeholder-icon { font-size: 3.6rem; opacity: 0.6; }
.tb-media-body { padding: 1.4rem 1.6rem; }
.tb-media-name { font-size: 1.5rem; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tb-media-count { font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-top: 0.4rem; }
</style>
