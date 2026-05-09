<template>
  <div class="tb-page">
    <button class="tb-btn-back" @click="router.back()">← 返回</button>
    <div class="tb-info-card">
      <div class="tb-info-cover"><img v-if="info.mangaCover" :src="info.mangaCover" /><div v-else class="tb-ph">📚</div></div>
      <div class="tb-info-detail">
        <h1>{{ info.mangaName || '加载中...' }}</h1>
        <p class="tb-meta">{{ info.chapterCount || 0 }} 章节</p>
        <p class="tb-desc">{{ info.description || '暂无简介' }}</p>
        <button class="tb-btn-read" @click="startRead">开始阅读</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
const router = useRouter()
const route = useRoute()
const info = ref<any>({})
onMounted(async () => { const id = Number(route.query.mangaId)||0; if(id) info.value = await mangaApi.get_manga_info(id) || {} })
async function startRead() { const id = Number(route.query.mangaId)||0; const f = await chapterApi.get_first(id,'number'); if(f?.chapterId) router.push({path:'/browse-view/flow',query:{chapterId:f.chapterId}}) }
</script>

<style scoped>
.tb-btn-back { padding: 6px 14px; font-size: 13px; background: rgba(255,255,255,0.08); border: none; border-radius: 20px; color: #fff; cursor: pointer; margin-bottom: 20px; display: inline-block; }
.tb-info-card { display: flex; gap: 32px; background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; }
.tb-info-cover { flex-shrink: 0; width: 180px; height: 260px; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.tb-info-cover img { width: 100%; height: 100%; object-fit: cover; }
.tb-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); }
.tb-info-detail h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #fff; }
.tb-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 12px; }
.tb-desc { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; margin: 0 0 24px; }
.tb-btn-read { padding: 10px 24px; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 20px; color: #fff; font-weight: 500; cursor: pointer; font-size: 14px; }
</style>
