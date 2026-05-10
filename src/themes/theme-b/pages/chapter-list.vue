<template>
  <div class="tb-page">
    <button class="tb-btn-back" @click="router.back()">← 返回</button>
    <h1>{{ mangaName || '章节列表' }}</h1>
    <div class="tb-chapters">
      <div v-for="(ch, idx) in list" :key="ch.chapterId" class="tb-ch-item" @click="goRead(ch, idx)">
        <div class="tb-ch-name">{{ ch.chapterName }}</div>
        <div class="tb-ch-meta">{{ ch.pageCount || '?' }} 页</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import chapterApi from '@/api/chapter'
import mangaApi from '@/api/manga'
import { globalData } from '@/store'
const router = useRouter()
const route = useRoute()
const list = ref<any[]>([])
const mangaName = ref('')

onMounted(async () => {
  const mangaId = Number(route.params.mangaId) || 0
  if (!mangaId) return
  try {
    const info = await mangaApi.get_manga_info(mangaId)
    mangaName.value = info?.mangaName || ''
    globalData.mangaName = mangaName.value || globalData.mangaName
  } catch {}
  try {
    const r = await chapterApi.get({ mangaId, page: 1, pageSize: 200, order: 'number' })
    list.value = r?.list || []
  } catch(e){}
})

function goRead(ch:any, idx: number){
  globalData.chapterList = list.value
  globalData.chapterIndex = idx
  globalData.chapterName = ch.chapterName || ''
  router.push(`/t/reader/${ch.chapterId}`)
}
</script>

<style scoped>
h1 { font-size: 20px; font-weight: 700; margin: 0 0 20px; color: #fff; }
.tb-btn-back { padding: 6px 14px; font-size: 13px; background: rgba(255,255,255,0.08); border: none; border-radius: 20px; color: #fff; cursor: pointer; margin-bottom: 16px; }
.tb-chapters { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.tb-ch-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; transition: all 0.15s; }
.tb-ch-item:hover { background: rgba(255,255,255,0.12); }
.tb-ch-name { font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tb-ch-meta { font-size: 11px; color: rgba(255,255,255,0.4); flex-shrink: 0; margin-left: 12px; }
</style>
