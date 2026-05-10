<template>
  <div class="tb-page">
    <h1>{{ mediaName || '漫画列表' }}</h1>
    <div class="tb-grid">
      <div v-for="m in list" :key="m.mangaId" class="tb-card" @click="goChapters(m)">
        <div class="tb-card-cover"><img v-if="m.mangaCover" :src="m.mangaCover" /><div v-else class="tb-card-ph">📚</div></div>
        <div class="tb-card-name">{{ m.mangaName }}</div>
        <div class="tb-card-sub">{{ m.chapterCount || 0 }} 章节</div>
      </div>
    </div>
    <div v-if="totalPages > 1" class="tb-pagination">
      <button :disabled="page<=1" @click="page--;loadData()">◀</button>
      <span>{{ page }}/{{ totalPages }}</span>
      <button :disabled="page>=totalPages" @click="page++;loadData()">▶</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
const router = useRouter()
const route = useRoute()
const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const mediaName = ref('')
const totalPages = computed(() => Math.ceil(total.value / 32))
onMounted(() => loadData())
async function loadData() {
  const mediaId = Number(route.params.mediaId) || 0
  try {
    const res = await mangaApi.get(mediaId, page.value, 32, 'updateTimeDesc', '')
    list.value = res?.list || res?.data?.list || []
    total.value = res?.count || res?.data?.count || 0
    mediaName.value = res?.mediaName || res?.data?.mediaName || mediaName.value
  } catch(e){}
}
function goChapters(m: any) { router.push(`/t/manga/${m.mangaId}/chapters`) }
</script>

<style scoped>
h1 { font-size: 20px; font-weight: 700; margin: 0 0 20px; color: #fff; }
.tb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.tb-card { cursor: pointer; transition: transform 0.2s; }
.tb-card:hover { transform: translateY(-3px); }
.tb-card-cover { aspect-ratio: 3/4; border-radius: 14px; overflow: hidden; background: rgba(255,255,255,0.05); box-shadow: 0 4px 16px rgba(0,0,0,0.3); margin-bottom: 8px; }
.tb-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.tb-card-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; background: linear-gradient(135deg, #6366f1, #a855f7); }
.tb-card-name { font-size: 13px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tb-card-sub { font-size: 11px; color: rgba(255,255,255,0.5); }
.tb-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; }
.tb-pagination button { padding: 8px 16px; background: rgba(255,255,255,0.1); border: none; border-radius: 20px; color: #fff; cursor: pointer; }
.tb-pagination button:disabled { opacity: 0.3; }
.tb-pagination span { color: rgba(255,255,255,0.6); font-size: 13px; }
</style>
