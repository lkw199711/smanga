<template>
  <div class="ta-list-page">
    <div class="ta-page-head"><h1>书签</h1></div>
    <div class="ta-list">
      <div v-for="item in list" :key="item.bookmarkId" class="ta-list-item" @click="goRead(item)">
        <div class="ta-list-cover">
          <img v-if="item.chapterCover" :src="item.chapterCover" alt="" />
          <div v-else class="ta-list-cover-ph">🔖</div>
        </div>
        <div class="ta-list-info">
          <div class="ta-list-title">{{ item.mangaName }}</div>
          <div class="ta-list-sub">{{ item.chapterName }} - 第{{ item.page }}页</div>
        </div>
      </div>
    </div>
    <div v-if="list.length === 0" class="ta-empty">暂无书签</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bookmarkApi from '@/api/bookmark'
import { globalData } from '@/store'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await bookmarkApi.get(1, 50)
    list.value = res?.list || []
  } catch (e) { /* empty */ }
})

function goRead(item: any) {
  globalData.mangaName = item.mangaName || globalData.mangaName
  globalData.chapterName = item.chapterName || globalData.chapterName
  router.push(`/t/reader/${item.chapterId}`)
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-list { display: flex; flex-direction: column; gap: 8px; }
.ta-list-item { display: flex; align-items: center; gap: 14px; padding: 12px; background: #fff; border: 1px solid #eaeaea; border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.ta-list-item:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.ta-list-cover { flex-shrink: 0; width: 48px; height: 64px; border-radius: 6px; overflow: hidden; background: #f3f4f6; }
.ta-list-cover img { width: 100%; height: 100%; object-fit: cover; }
.ta-list-cover-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px; background: linear-gradient(135deg, #fef3c7, #fde68a); }
.ta-list-info { min-width: 0; flex: 1; }
.ta-list-title { font-size: 14px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-list-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
.ta-empty { text-align: center; padding: 60px; color: #9ca3af; }
</style>
