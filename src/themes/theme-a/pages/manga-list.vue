<template>
  <div class="ta-manga-list">
    <div class="ta-page-head">
      <h1>{{ mediaName || '漫画列表' }}</h1>
      <div class="ta-head-actions">
        <input v-model="keyword" class="ta-input" placeholder="搜索..." @keydown.enter="loadData" />
        <select v-model="order" class="ta-select">
          <option value="updateTimeDesc">最近更新</option>
          <option value="nameDesc">名称 Z-A</option>
          <option value="name">名称 A-Z</option>
          <option value="createTimeDesc">最近添加</option>
        </select>
      </div>
    </div>
    <div class="ta-grid">
      <div v-for="m in list" :key="m.mangaId" class="ta-manga-card" v-long-press="() => openThemeActionSheet('manga', m)" @click="goMangaInfo(m)" @contextmenu.prevent="openThemeContextMenu($event, 'manga', m)">
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
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import queue from '@/store/quque'
import { userConfig } from '@/store'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()

const list = ref<any[]>([])
const keyword = ref('')
const order = computed({ get: () => userConfig.order, set: (v) => { userConfig.order = v } })
const page = ref(1)
const pageSize = 32
const total = ref(0)
const loading = ref(false)
const mediaName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize))

watch(() => route.params.mediaId, () => {
  page.value = 1
  keyword.value = ''
  loadData()
}, { immediate: true })

// 监听全局排序变化
watch(() => userConfig.order, () => {
  page.value = 1
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
      queue.mangaQueue.add(() => get_poster(item))
    })
  } catch (e) { /* empty */ }
  loading.value = false
}

function goMangaInfo(m: any) {
	router.push(`/t/manga/${m.mangaId}`)
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
  margin-bottom: 2.4rem;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.ta-page-head h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.ta-head-actions {
  display: flex;
  gap: 0.8rem;
}

.ta-input {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  outline: none;
  background: #fff;
}

.ta-select {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  background: #fff;
  outline: none;
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.8rem;
}

.ta-manga-card {
	position: relative;
  cursor: pointer;
  transition: transform 0.15s;
}


.ta-manga-card:hover {
  transform: translateY(-0.2rem);
}

.ta-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.8rem;
  background: #f3f4f6;
  box-shadow: 0 0.2rem 0.8rem rgba(0,0,0,0.06);
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
  font-size: 3.2rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-manga-name {
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-manga-meta {
  font-size: 1.1rem;
  color: #9ca3af;
  margin-top: 0.2rem;
}

.ta-empty {
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
}

.ta-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-top: 3.2rem;
  padding: 1.6rem;
}

.ta-pagination button {
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.6rem;
  background: #fff;
  cursor: pointer;
}

.ta-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ta-pagination span {
  font-size: 1.3rem;
  color: #6b7280;
}

/* 响应式适配 */
@media (max-width: 76.8rem) {
  .ta-page-head {
    flex-direction: column;
    align-items: stretch;
    gap: 1.2rem;
  }

  .ta-head-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .ta-input,
  .ta-select {
    width: 100%;
  }

  .ta-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  .ta-manga-name {
    font-size: 1.2rem;
  }
}

@media (max-width: 48rem) {
  .ta-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .ta-manga-cover {
    height: 16rem;
  }
}
</style>
