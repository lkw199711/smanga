<template>
  <div class="ta-search-page">
    <div class="ta-page-head"><h1>搜索</h1></div>
    <div class="ta-search-bar">
      <input v-model="keyword" class="ta-input" placeholder="输入关键字搜索漫画..." @keydown.enter="doSearch" />
      <button class="ta-btn-primary" @click="doSearch">搜索</button>
    </div>
    <div class="ta-grid">
      <div v-for="item in list" :key="item.mangaId" class="ta-grid-card" @click="goManga(item)">
        <div class="ta-grid-cover">
          <img v-if="item.mangaCover" :src="item.mangaCover" alt="" />
          <div v-else class="ta-grid-cover-ph">📚</div>
        </div>
        <div class="ta-grid-name">{{ item.mangaName }}</div>
      </div>
    </div>
    <div v-if="searched && list.length === 0" class="ta-empty">未找到结果</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import searchApi from '@/api/search'

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const list = ref<any[]>([])
const searched = ref(false)

onMounted(() => {
  if (route.query.keyword) {
    keyword.value = String(route.query.keyword)
    doSearch()
  }
})

async function doSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  try {
    const res = await searchApi.get(keyword.value, 1, 50)
    list.value = res?.list || []
  } catch (e) { /* empty */ }
}

function goManga(item: any) {
  router.push({ path: '/chapter-list', query: { mangaId: item.mangaId } })
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-search-bar { display: flex; gap: 10px; margin-bottom: 24px; }
.ta-input { flex: 1; max-width: 480px; padding: 10px 14px; font-size: 14px; border: 1px solid #eaeaea; border-radius: 8px; outline: none; background: #fff; }
.ta-btn-primary { padding: 10px 20px; font-size: 14px; font-weight: 500; color: #fff; background: #2563eb; border: none; border-radius: 8px; cursor: pointer; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px; }
.ta-grid-card { cursor: pointer; transition: transform 0.15s; }
.ta-grid-card:hover { transform: translateY(-2px); }
.ta-grid-cover { aspect-ratio: 3 / 4; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ta-grid-cover img { width: 100%; height: 100%; object-fit: cover; }
.ta-grid-cover-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
.ta-grid-name { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-empty { text-align: center; padding: 60px; color: #9ca3af; }
</style>
