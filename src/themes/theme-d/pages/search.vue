<template>
  <div class="td-search">
    <h2 class="td-page-title">搜索</h2>
    <input class="td-search-box" v-model="keyword" placeholder="输入关键词搜索..." @keyup.enter="doSearch" />
    <div class="td-card-grid" v-if="list.length">
      <div class="td-card" v-for="item in list" :key="item.mangaId" @click="router.push(`/manga/${item.mangaId}`)">
        <div class="td-card-cover"><img :src="item.poster || '/favicon.ico'" /></div>
        <div class="td-card-title">{{ item.mangaName }}</div>
      </div>
    </div>
    <p class="td-empty" v-if="searched && !list.length">未找到结果</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mangaApi from '@/api/manga'

const route = useRoute()
const router = useRouter()
const keyword = ref((route.query.q as string) || '')
const list = ref<any[]>([])
const searched = ref(false)

async function doSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  try { const r = await mangaApi.search(keyword.value); list.value = r?.data?.list || r?.data || [] } catch {}
}

onMounted(() => { if (keyword.value) doSearch() })
</script>

<style scoped>
.td-search { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-search-box { width: 100%; max-width: 400px; height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); font-size: 14px; outline: none; margin-bottom: 24px; transition: border-color .2s; }
.td-search-box:focus { border-color: var(--accent); }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.td-card { background: var(--bg2); border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-2px); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.td-card-title { padding: 8px 10px; font-size: 13px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
