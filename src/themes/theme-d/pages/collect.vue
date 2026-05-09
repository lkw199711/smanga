<template>
  <div class="td-collect">
    <h2 class="td-page-title">收藏</h2>
    <div class="td-card-grid">
      <div class="td-card" v-for="item in list" :key="item.mangaId" @click="router.push(`/manga/${item.mangaId}`)">
        <div class="td-card-cover"><img :src="item.poster || '/favicon.ico'" /></div>
        <div class="td-card-title">{{ item.mangaName }}</div>
      </div>
    </div>
    <p class="td-empty" v-if="!list.length">暂无收藏</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import collectApi from '@/api/collect'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try { const r = await collectApi.get('', 1, 50, ''); list.value = r?.data?.list || [] } catch {}
})
</script>

<style scoped>
.td-collect { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.td-card { background: var(--bg2); border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.td-card-title { padding: 8px 10px; font-size: 13px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
