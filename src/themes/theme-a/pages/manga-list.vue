<template>
  <div class="ta-manga-list">
    <div class="ta-page-head">
      <h1>{{ mediaName || '漫画列表' }}</h1>
      <div class="ta-head-actions">
        <input v-model="keyword" class="ta-input" placeholder="搜索..." @keydown.enter="loadData" />
        <select v-model="order" class="ta-select" @change="loadData">
          <option value="updateTimeDesc">最近更新</option>
          <option value="nameDesc">名称 Z-A</option>
          <option value="name">名称 A-Z</option>
          <option value="createTimeDesc">最近添加</option>
        </select>
      </div>
    </div>
    <div class="ta-grid">
      <div v-for="m in list" :key="m.mangaId" class="ta-manga-card" @click="goChapters(m)">
        <div class="ta-manga-cover">
          <img v-if="m.blob" :src="m.blob" alt="" />
          <div v-else class="ta-cover-placeholder">📚</div>
        </div>
        <div class="ta-manga-name">{{ m.mangaName }}</div>
        <div class="ta-manga-meta">{{ m.chapterCount || 0 }} 章节</div>
      </div>
    </div>
    <div v-if="list.length === 0 && !loading" class="ta-empty">暂无漫画</div>
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="ta-pagination">
      <button :disabled="page <= 1" @click="page--; loadData()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadData()">下一页</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import queue from '@/store/quque'

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
    list.value.forEach(async (item) => {
      await get_poster(item)
    })
  } catch (e) { /* empty */ }
  loading.value = false
}

function goChapters(m: any) {
  router.push(`/t/manga/${m.mangaId}/chapters`)
}

async function get_poster(item: any) {
	item.blob = await imageApi.get({file: item.mangaCover});
}
</script>

<style scoped>
.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.ta-page-head h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.ta-head-actions {
  display: flex;
  gap: 8px;
}

.ta-input {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  background: #fff;
}

.ta-select {
  padding: 7px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  outline: none;
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
}

.ta-manga-card {
  cursor: pointer;
  transition: transform 0.15s;
}

.ta-manga-card:hover {
  transform: translateY(-2px);
}

.ta-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ta-manga-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-manga-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-manga-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.ta-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

.ta-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

.ta-pagination button {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.ta-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ta-pagination span {
  font-size: 13px;
  color: #6b7280;
}
</style>
