<template>
  <div class="td-chapter-list">
    <h2 class="td-page-title">章节列表</h2>
    <div class="td-chapters">
      <div class="td-chapter-item" v-for="c in list" :key="c.chapterId" @click="router.push(`/reader/${c.chapterId}`)">
        <span class="td-chapter-name">{{ c.chapterName }}</span>
        <span class="td-chapter-pages">{{ c.imageCount || '?' }} P</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import chapterApi from '@/api/chapter'

const route = useRoute()
const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try {
    const mangaId = route.params.mangaId as string
    const r = await chapterApi.get(mangaId, 1, 999, '')
    list.value = r?.data?.list || []
  } catch {}
})
</script>

<style scoped>
.td-chapter-list { max-width: 800px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-chapters { display: flex; flex-direction: column; gap: 2px; }
.td-chapter-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all .2s; }
.td-chapter-item:hover { border-color: var(--accent); background: var(--accent-soft); }
.td-chapter-name { font-size: 14px; color: var(--fg); }
.td-chapter-pages { font-size: 12px; color: var(--fg2); }
</style>
