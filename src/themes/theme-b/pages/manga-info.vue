<template>
  <div class="tb-page">
    <button class="tb-btn-back" @click="router.back()">�?返回</button>
    <div class="tb-info-card">
      <div class="tb-info-cover"><img v-if="info.mangaCover" :src="info.mangaCover" /><div v-else class="tb-ph">📚</div></div>
      <div class="tb-info-detail">
        <h1>{{ info.mangaName || '加载�?..' }}</h1>
        <p class="tb-meta">{{ info.chapterCount || 0 }} 章节</p>
        <p class="tb-desc">{{ info.description || '暂无简�? }}</p>
        <button class="tb-btn-read" @click="startRead">开始阅�?/button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import { globalData } from '@/store'
const router = useRouter()
const route = useRoute()
const info = ref<any>({})
const mangaId = computed(() => Number(route.params.mangaId) || 0)
onMounted(async () => {
  if(!mangaId.value) return
  info.value = await mangaApi.get_manga_info(mangaId.value) || {}
  globalData.mangaName = info.value?.mangaName || globalData.mangaName
})
async function startRead() {
  if(!mangaId.value) return
  const f = await chapterApi.get_first(mangaId.value,'number')
  if(f?.chapterId) router.push(`/t/reader/${f.chapterId}`)
}
</script>

<style scoped>
.tb-btn-back { padding: 6px 14px; font-size: 13px; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; color: #1f2937; cursor: pointer; margin-bottom: 20px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.tb-btn-back:hover { background: rgba(255,255,255,1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.tb-info-card { display: flex; gap: 32px; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
.tb-info-cover { flex-shrink: 0; width: 180px; height: 260px; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
.tb-info-cover img { width: 100%; height: 100%; object-fit: cover; }
.tb-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); }
.tb-info-detail h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #1f2937; }
.tb-meta { font-size: 13px; color: #6b7280; margin: 0 0 12px; }
.tb-desc { font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px; }
.tb-btn-read { padding: 10px 24px; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 20px; color: #1f2937; font-weight: 500; cursor: pointer; font-size: 14px; box-shadow: 0 4px 16px rgba(168,85,247,0.3); }
.tb-btn-read:hover { box-shadow: 0 6px 20px rgba(168,85,247,0.4); transform: translateY(-1px); }
</style>

