<template>
  <div class="td-history">
    <h2 class="td-page-title">阅读历史</h2>
    <div class="td-list">
      <div class="td-list-item" v-for="item in list" :key="item.mangaId" @click="router.push(`/manga/${item.mangaId}`)">
        <img class="td-list-cover" :src="item.poster || '/favicon.ico'" />
        <div class="td-list-info">
          <div class="td-list-name">{{ item.mangaName }}</div>
          <div class="td-list-sub">{{ item.chapterName || '' }}</div>
        </div>
      </div>
    </div>
    <p class="td-empty" v-if="!list.length">暂无阅读记录</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try { const r = await historyApi.get(1, 50, ''); list.value = r?.data?.list || [] } catch {}
})
</script>

<style scoped>
.td-history { max-width: 800px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-list { display: flex; flex-direction: column; gap: 8px; }
.td-list-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all .2s; }
.td-list-item:hover { border-color: var(--accent); }
.td-list-cover { width: 40px; height: 54px; border-radius: 6px; object-fit: cover; }
.td-list-name { font-size: 14px; font-weight: 500; color: var(--fg); }
.td-list-sub { font-size: 12px; color: var(--fg2); margin-top: 2px; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
