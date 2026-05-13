<template>
  <div class="tb-page">
    <div class="tb-page-head">
      <h1>{{ mediaName || '漫画列表' }}</h1>
      <div class="tb-head-actions">
        <input 
          v-model="keyword" 
          class="tb-input" 
          placeholder="搜索漫画..." 
          @keydown.enter="loadData" 
        />
        <select v-model="order" class="tb-select" @change="loadData">
          <option value="updateTimeDesc">最近更新</option>
          <option value="nameDesc">名称 Z-A</option>
          <option value="name">名称 A-Z</option>
          <option value="createTimeDesc">最近添加</option>
        </select>
      </div>
    </div>
    
    <div class="tb-grid">
      <t-manga-card
        v-for="m in list"
        :key="m.mangaId"
        :item="m"
        variant="B"
        :meta="`${m.chapterCount || 0} 章节`"
        @click="goChapters(m)"
      />
    </div>
    
    <div v-if="list.length === 0 && !loading" class="tb-empty">暂无漫画</div>
    
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="tb-pagination">
      <button :disabled="page <= 1" @click="page--; loadData()">◀</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadData()">▶</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import queue from '@/store/quque'
import imageApi from '@/api/image'
import TMangaCard from '@/themes/components/manga-card.vue'

const router = useRouter()
const route = useRoute()

const list = ref<any[]>([])
const keyword = ref('')
const order = ref('updateTimeDesc')
const page = ref(1)
const pageSize = 32
const total = ref(0)
const loading = ref(false)
const mediaName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize))

onMounted(() => {
  loadData()
})

async function loadData() {
  const mediaId = Number(route.params.mediaId) || 0
  loading.value = true
  try {
    const res = await mangaApi.get(mediaId, page.value, pageSize, order.value, keyword.value)
    list.value = res?.list || res?.data?.list || []
    total.value = res?.count || res?.data?.count || 0
    mediaName.value = res?.mediaName || res?.data?.mediaName || mediaName.value
    
    // 加载封面图片
    list.value.forEach(async (item) => {
      queue.mangaQueue.add(() => get_poster(item))
    })
  } catch (e) { /* empty */ }
  loading.value = false
}

function goChapters(m: any) {
  router.push(`/t/manga/${m.mangaId}/chapters`)
}

async function get_poster(item: any) {
  item.blob = await imageApi.get({ file: item.mangaCover })
}
</script>

<style scoped>
.tb-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.tb-page-head h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.tb-head-actions {
  display: flex;
  gap: 8px;
}

.tb-input {
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  color: #1f2937;
}

.tb-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.tb-select {
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  color: #1f2937;
  outline: none;
}

.tb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.tb-empty {
  text-align: center;
  padding: 60px;
  color: #6b7280;
}

.tb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

.tb-pagination button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tb-pagination button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tb-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tb-pagination span {
  color: #6b7280;
  font-size: 13px;
}
</style>

