<template>
  <div class="tb-chapter-list">
    <div class="tb-header">
      <div class="tb-back" @click="goBack">
        <span>←</span>
        <span>返回漫画列表</span>
      </div>
      <div class="tb-title">{{ mangaInfo.mangaName }}</div>
      <div class="tb-actions">
        <button class="tb-btn-icon" @click="toggleCollect">
          <span v-if="isCollected">★</span>
          <span v-else>☆</span>
        </button>
      </div>
    </div>

    <div class="tb-content">
      <div class="tb-manga-info">
        <div class="tb-cover">
          <t-cover variant="B" :seed="Number(mangaId)" :file="mangaInfo.mangaCover || ''" />
        </div>
        <div class="tb-info">
          <div class="tb-author" v-if="mangaInfo.mangaAuthor">作者：{{ mangaInfo.mangaAuthor }}</div>
          <div class="tb-desc" v-if="mangaInfo.mangaDesc">{{ mangaInfo.mangaDesc }}</div>
          <div class="tb-meta">
            <span>{{ chapterList.length }} 章节</span>
            <span>{{ mangaInfo.updateTime | formatDate }}</span>
          </div>
        </div>
      </div>

      <div class="tb-chapters">
        <div class="tb-section-title">章节列表</div>
        <div class="tb-chapter-grid">
          <t-chapter-item
            v-for="ch in chapterList"
            :key="ch.chapterId"
            :item="ch"
            variant="B"
            @click="goRead(ch)"
            @contextmenu="openThemeContextMenu($event, 'chapter', ch)"
          />
        </div>
        <div v-if="chapterList.length === 0" class="tb-empty">暂无章节</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import collectApi from '@/api/collect'
import TCover from '@/themes/components/media-cover.vue'
import TChapterItem from '@/themes/components/chapter-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()

const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const mangaId = ref<number | null>(null)

onMounted(async () => {
  mangaId.value = Number(route.params.mangaId)
  if (mangaId.value) {
    await loadMangaInfo()
    await loadChapters()
    await checkCollectStatus()
  }
})

watch(() => route.params.mangaId, async (newMangaId) => {
  if (newMangaId) {
    mangaId.value = Number(newMangaId)
    await loadMangaInfo()
    await loadChapters()
    await checkCollectStatus()
  }
})

async function loadMangaInfo() {
  if (!mangaId.value) return
  try {
    const res = await mangaApi.get_info(mangaId.value)
    mangaInfo.value = res?.data || res || {}
  } catch (e) {
    mangaInfo.value = {}
  }
}

async function loadChapters() {
  if (!mangaId.value) return
  try {
    const res = await chapterApi.get(mangaId.value, 1, 999)
    chapterList.value = res?.list || res?.data?.list || []
  } catch (e) {
    chapterList.value = []
  }
}

async function checkCollectStatus() {
  if (!mangaId.value) return
  try {
    const res = await collectApi.is_collect(mangaId.value)
    isCollected.value = res?.data || false
  } catch (e) {
    isCollected.value = false
  }
}

async function toggleCollect() {
  if (!mangaId.value) return
  const action = isCollected.value ? 'remove' : 'add'
  try {
    if (action === 'add') {
      await collectApi.add(mangaId.value)
    } else {
      await collectApi.remove(mangaId.value)
    }
    isCollected.value = !isCollected.value
  } catch (e) {
    // 处理收藏失败
  }
}

function goBack() {
  router.back()
}

function goRead(chapter: any) {
  if (!mangaId.value || !chapter.chapterId) return
  router.push(`/t/read/${mangaId.value}/${chapter.chapterId}`)
}
</script>

<style scoped>
.tb-chapter-list {
  padding: 2.4rem;
  min-height: 100vh;
}

.tb-header {
  display: flex;
  align-items: center;
  margin-bottom: 2.4rem;
  gap: 1.6rem;
}

.tb-back {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  transition: background 0.15s;
}

.tb-back:hover {
  background: #f3f4f6;
}

.tb-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
}

.tb-actions {
  margin-left: auto;
}

.tb-btn-icon {
  width: 3.6rem;
  height: 3.6rem;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.tb-btn-icon:hover {
  background: #f3f4f6;
}

.tb-content {
  display: grid;
  grid-template-columns: 30rem 1fr;
  gap: 3.2rem;
}

.tb-manga-info {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.tb-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.08);
}

.tb-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tb-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.8rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.tb-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.tb-author {
  font-size: 1.3rem;
  color: #6b7280;
}

.tb-desc {
  font-size: 1.3rem;
  color: #374151;
  line-height: 1.5;
}

.tb-meta {
  display: flex;
  gap: 1.6rem;
  font-size: 1.2rem;
  color: #9ca3af;
}

.tb-chapters {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.tb-section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
}

.tb-chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 1.2rem;
}

.tb-empty {
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
}

@media (max-width: 76.8rem) {
  .tb-content {
    grid-template-columns: 1fr;
  }
  
  .tb-chapter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
