<template>
  <div class="ta-list-page">
    <div class="ta-page-head"><h1>收藏</h1></div>
    <div class="ta-grid">
      <div v-for="item in list" :key="item.collectId" class="ta-grid-card" @click="goManga(item)">
        <div class="ta-grid-cover">
          <img v-if="item.mangaCover" :src="item.mangaCover" alt="" />
          <div v-else class="ta-grid-cover-ph">⭐</div>
        </div>
        <div class="ta-grid-name">{{ item.mangaName }}</div>
      </div>
    </div>
    <div v-if="list.length === 0" class="ta-empty">暂无收藏</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import collectApi from '@/api/collect'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await collectApi.get('manga', 1, 50, '')
    list.value = res?.list || []
  } catch (e) { /* empty */ }
})

function goManga(item: any) {
  router.push(`/t/manga/${item.mangaId}`)
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px; }
.ta-grid-card { cursor: pointer; transition: transform 0.15s; }
.ta-grid-card:hover { transform: translateY(-2px); }
.ta-grid-cover { aspect-ratio: 3 / 4; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ta-grid-cover img { width: 100%; height: 100%; object-fit: cover; }
.ta-grid-cover-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #fef9c3, #fde047); }
.ta-grid-name { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-empty { text-align: center; padding: 60px; color: #9ca3af; grid-column: 1 / -1; }
</style>
