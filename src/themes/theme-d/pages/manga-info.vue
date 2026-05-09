<template>
  <div class="td-manga-info">
    <div class="td-info-header">
      <div class="td-info-cover"><img :src="info.poster || '/favicon.ico'" /></div>
      <div class="td-info-meta">
        <h1 class="td-info-title">{{ info.mangaName || '加载中...' }}</h1>
        <p class="td-info-author" v-if="info.author">作者：{{ info.author }}</p>
        <p class="td-info-desc">{{ info.description || '暂无简介' }}</p>
        <div class="td-info-tags" v-if="info.tags?.length">
          <span class="td-tag" v-for="t in info.tags" :key="t">{{ t }}</span>
        </div>
        <button class="td-btn-read" @click="startRead">开始阅读</button>
      </div>
    </div>
    <div class="td-info-chapters">
      <h2 class="td-section-title">章节 ({{ chapters.length }})</h2>
      <div class="td-chapter-grid">
        <div class="td-ch-item" v-for="c in chapters" :key="c.chapterId" @click="router.push(`/reader/${c.chapterId}`)">
          {{ c.chapterName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'

const route = useRoute()
const router = useRouter()
const info = ref<any>({})
const chapters = ref<any[]>([])

function startRead() {
  if (chapters.value.length) router.push(`/reader/${chapters.value[0].chapterId}`)
}

onMounted(async () => {
  const mangaId = route.params.mangaId as string
  try { const r = await mangaApi.getInfo(mangaId); info.value = r?.data || {} } catch {}
  try { const r = await chapterApi.get(mangaId, 1, 999, ''); chapters.value = r?.data?.list || [] } catch {}
})
</script>

<style scoped>
.td-manga-info { max-width: 900px; margin: 0 auto; }
.td-info-header { display: flex; gap: 24px; margin-bottom: 32px; }
.td-info-cover { width: 180px; flex-shrink: 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
.td-info-cover img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
.td-info-meta { flex: 1; }
.td-info-title { font-size: 22px; font-weight: 700; color: var(--fg); margin: 0 0 8px; }
.td-info-author { font-size: 13px; color: var(--fg2); margin: 0 0 8px; }
.td-info-desc { font-size: 13px; color: var(--fg2); line-height: 1.6; margin-bottom: 12px; }
.td-info-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.td-tag { padding: 2px 10px; border-radius: 12px; background: var(--accent-soft); color: var(--accent); font-size: 12px; }
.td-btn-read { padding: 8px 24px; border-radius: 8px; background: var(--accent); color: #fff; border: none; font-size: 14px; cursor: pointer; transition: opacity .2s; }
.td-btn-read:hover { opacity: 0.85; }
.td-section-title { font-size: 16px; font-weight: 600; color: var(--fg); margin-bottom: 12px; }
.td-chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.td-ch-item { padding: 8px 12px; border-radius: 6px; background: var(--bg2); border: 1px solid var(--border); font-size: 13px; color: var(--fg); cursor: pointer; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all .2s; }
.td-ch-item:hover { border-color: var(--accent); color: var(--accent); }
</style>
