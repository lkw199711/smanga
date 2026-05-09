<template>
  <div class="ta-manga-info">
    <button class="ta-btn-back" @click="router.back()">← 返回</button>
    <div class="ta-info-header">
      <div class="ta-info-cover">
        <img v-if="info.mangaCover" :src="info.mangaCover" alt="" />
        <div v-else class="ta-info-cover-ph">📚</div>
      </div>
      <div class="ta-info-detail">
        <h1>{{ info.mangaName || '加载中...' }}</h1>
        <div class="ta-info-meta">
          <span>{{ info.chapterCount || 0 }} 章节</span>
          <span v-if="info.author">作者: {{ info.author }}</span>
        </div>
        <p class="ta-info-desc">{{ info.description || '暂无简介' }}</p>
        <div class="ta-info-actions">
          <button class="ta-btn-primary" @click="startRead">开始阅读</button>
          <button class="ta-btn-ghost">收藏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'

const router = useRouter()
const route = useRoute()
const info = ref<any>({})

onMounted(async () => {
  const mangaId = Number(route.query.mangaId) || 0
  if (mangaId) {
    info.value = await mangaApi.get_manga_info(mangaId) || {}
  }
})

async function startRead() {
  const mangaId = Number(route.query.mangaId) || 0
  if (!mangaId) return
  const first = await chapterApi.get_first(mangaId, 'number')
  if (first?.chapterId) {
    router.push({ path: '/browse-view/flow', query: { chapterId: first.chapterId } })
  }
}
</script>

<style scoped>
.ta-btn-back {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 24px;
  display: inline-block;
}

.ta-info-header {
  display: flex;
  gap: 32px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  padding: 32px;
}

.ta-info-cover {
  flex-shrink: 0;
  width: 200px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.ta-info-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-info-cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-info-detail {
  flex: 1;
  min-width: 0;
}

.ta-info-detail h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px;
}

.ta-info-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}

.ta-info-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 24px;
}

.ta-info-actions {
  display: flex;
  gap: 10px;
}

.ta-btn-primary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.ta-btn-ghost {
  padding: 10px 20px;
  font-size: 14px;
  color: #4b5563;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
}
</style>
