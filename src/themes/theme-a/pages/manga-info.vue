<template>
  <div class="ta-manga-info">
    <button class="ta-btn-back" @click="router.back()">← 返回</button>
    
    <!-- 顶部横幅 -->
    <div class="ta-banner" v-if="banner.length">
      <div class="ta-banner-toomics" v-if="bannerModel === 'toomics'">
        <img class="ta-banner-fore" :src="banner[0]?.blob" alt="banner" />
        <img class="ta-banner-back" :src="bannerBg?.blob" alt="bannerBg" />
      </div>
      <el-carousel class="ta-carousel" :interval="interval" :type="carouselType" v-else>
        <el-carousel-item v-for="item in banner" :key="item.metaId">
          <img class="ta-banner-img" :src="item.blob" alt="banner" />
        </el-carousel-item>
      </el-carousel>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="ta-info-content">
      <div class="ta-info-header">
        <div class="ta-info-cover">
          <img v-if="mangaCover" :src="mangaCover" alt="cover" />
          <div v-else class="ta-info-cover-ph">📚</div>
        </div>
        <div class="ta-info-detail">
          <h1>{{ mangaInfo.mangaName || '加载中...' }}</h1>
          <div class="ta-info-meta">
            <span>{{ mangaInfo.chapterCount || 0 }} 章节</span>
            <span v-if="mangaInfo.author">作者: {{ mangaInfo.author }}</span>
            <span v-if="mangaInfo.publishDate">发布时间: {{ mangaInfo.publishDate }}</span>
          </div>
          <p class="ta-info-desc">{{ mangaInfo.describe || '暂无简介' }}</p>
          <div class="ta-info-actions">
            <button class="ta-btn-primary" @click="startRead">
              {{ hasLatest ? '继续阅读' : '开始阅读' }}
            </button>
            <button 
              class="ta-btn-ghost" 
              @click="toggleCollect"
              :class="{ 'ta-btn-collected': isCollected }"
            >
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
            <button class="ta-btn-secondary" @click="goChapterList">章节列表</button>
          </div>
        </div>
      </div>

      <!-- 角色展示 -->
      <div class="ta-character-section" v-if="character.length">
        <h2 class="ta-section-title">角色</h2>
        <div class="ta-character-list">
          <div 
            v-for="item in character" 
            :key="item.characterId" 
            class="ta-character-item"
          >
            <img :src="item.blob" :alt="item.metaContent" />
            <div class="ta-character-info">
              <p class="ta-character-name">{{ item.metaContent }}</p>
              <p class="ta-character-desc">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 漫画信息 -->
      <div class="ta-meta-section">
        <h2 class="ta-section-title">漫画信息</h2>
        <div class="ta-meta-grid">
          <div class="ta-meta-item">
            <span class="ta-meta-label">漫画名称</span>
            <span class="ta-meta-value">{{ mangaInfo.mangaName }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">作者</span>
            <span class="ta-meta-value">{{ mangaInfo.author || '-' }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">发布时间</span>
            <span class="ta-meta-value">{{ mangaInfo.publishDate || '-' }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">章节总数</span>
            <span class="ta-meta-value">{{ mangaInfo.chapterCount || 0 }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">阅读方式</span>
            <span class="ta-meta-value">{{ mangaInfo.browseType || '-' }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">所属媒体库</span>
            <span class="ta-meta-value">{{ mangaInfo.media?.mediaName || '-' }}</span>
          </div>
          <div class="ta-meta-item">
            <span class="ta-meta-label">评分</span>
            <span class="ta-meta-value">{{ mangaInfo.star || '-' }}</span>
          </div>
          <div class="ta-meta-item ta-meta-tags" v-if="mangaInfo.tags?.length">
            <span class="ta-meta-label">标签</span>
            <div class="ta-meta-value">
              <span 
                v-for="tag in mangaInfo.tags" 
                :key="tag.tagId"
                class="ta-tag"
                :style="{ backgroundColor: tag.tagColor }"
              >
                {{ tag.tagName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="ta-chapter-section">
        <div class="ta-chapter-header">
          <h2 class="ta-section-title">章节列表</h2>
          <div class="ta-chapter-controls">
            <el-switch 
              v-model="chapterListDesc" 
              @change="loadChapters"
              active-text="倒序"
              inactive-text="正序"
            />
          </div>
        </div>
        
        <div class="ta-chapter-list">
          <div 
            v-for="(chapter, index) in chapterList" 
            :key="chapter.chapterId"
            class="ta-chapter-item"
            :class="{ 'ta-chapter-read': chapter.latest?.finish }"
            @click="goToChapter(chapter)"
			@contextmenu="openThemeContextMenu($event, 'chapter', chapter)"
          >
            <div class="ta-chapter-info">
              <span class="ta-chapter-number">第 {{ chapter.chapterNumber }} 话</span>
              <span class="ta-chapter-name">{{ chapter.chapterName }}</span>
              <span class="ta-chapter-date">{{ chapter.updateTime?.split(' ')[0] }}</span>
            </div>
            <div class="ta-chapter-status" v-if="chapter.latest">
              <span v-if="chapter.latest.finish">✓ 已读</span>
              <span v-else>读至第 {{ chapter.latest.page }} 页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import collectApi from '@/api/collect'
import imageApi from '@/api/image'
import lastesApi from '@/api/latest'
import useBrowseStore from '@/store/browse'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

// 数据状态
const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const hasLatest = ref(false)
const chapterListDesc = ref(false)

// 元数据
const banner = ref<any[]>([])
const bannerBg = ref<any>(null)
const character = ref<any[]>([])
const mangaCover = ref<string>('')
const bannerModel = ref<string>('toptoon')
const interval = ref(6 * 1000)

// 计算属性
const mangaId = computed(() => Number(route.params.mangaId) || Number(route.query.mangaId) || 0)

const carouselType = computed(() => {
  // 根据屏幕宽度返回合适的轮播类型
  const width = window.innerWidth
  if (width >= 1200) return 'card'
  return ''
})

// 生命周期
onMounted(async () => {
  if (!mangaId.value) {
    router.push('/')
    return
  }
  
  await loadMangaInfo()
  await loadChapters()
  await checkCollectStatus()
  await getLatestReading()
})

// 方法
async function loadMangaInfo() {
  try {
    // 获取漫画基本信息
    const info = await mangaApi.get_manga_info(mangaId.value)
    mangaInfo.value = info || {}
    
    // 获取封面图片
    if (mangaInfo.value.mangaCover) {
      mangaCover.value = await imageApi.get({ file: mangaInfo.value.mangaCover })
    }
    
    // 处理元数据
    if (mangaInfo.value.metas) {
      // 横幅
      banner.value = mangaInfo.value.metas.filter((item: any) => /banner/.test(item.metaName))
      bannerBg.value = banner.value.find((item: any) => /bannerBackground/.test(item.metaFile))
      if (bannerBg.value) bannerModel.value = 'toomics'
      
      // 为横幅图片获取blob
      for (const item of banner.value) {
        item.blob = await imageApi.get({ file: item.metaFile })
      }
      
      // 角色信息
      character.value = mangaInfo.value.metas.filter((item: any) => item.metaName === 'character')
      for (const item of character.value) {
        item.blob = await imageApi.get({ file: item.metaFile })
      }
      
      // 从元数据中提取信息
      const title = mangaInfo.value.metas.find((item: any) => item.metaName === 'title')?.metaContent
      if (title) mangaInfo.value.title = title
      
      const author = mangaInfo.value.metas.find((item: any) => item.metaName === 'author')?.metaContent
      if (author) mangaInfo.value.author = author
      
      const publishDate = mangaInfo.value.metas.find((item: any) => item.metaName === 'publishDate')?.metaContent
      if (publishDate) mangaInfo.value.publishDate = publishDate
      
      const describe = mangaInfo.value.metas.find((item: any) => item.metaName === 'describe')?.metaContent
      if (describe) mangaInfo.value.describe = describe
      
      const star = mangaInfo.value.metas.find((item: any) => item.metaName === 'star')?.metaContent
      if (star) mangaInfo.value.star = star
    }
  } catch (error) {
    console.error('加载漫画信息失败:', error)
  }
}

async function loadChapters() {
  try {
    const response = await chapterApi.get({
      mangaId: mangaId.value,
      mediaId: mangaInfo.value.mediaId,
      order: chapterListDesc.value ? 'numberDesc' : 'number'
    })
    chapterList.value = response.list || []
  } catch (error) {
    console.error('加载章节列表失败:', error)
  }
}

async function checkCollectStatus() {
  try {
    isCollected.value = await collectApi.is_collect('manga', mangaId.value)
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

async function getLatestReading() {
  try {
    const latest = await lastesApi.get_latest(mangaId.value)
    if (latest && !latest.finish) {
      hasLatest.value = true
    }
  } catch (error) {
    console.error('获取阅读记录失败:', error)
  }
}

async function toggleCollect() {
  try {
    if (isCollected.value) {
      await collectApi.remove_collect('manga', mangaId.value)
      isCollected.value = false
    } else {
      await collectApi.add_collect({ collectType: 'manga', mangaId: mangaId.value, mediaId: mangaInfo.value.mediaId })
      isCollected.value = true
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

async function startRead() {
  try {
    let chapterToRead
    
    if (hasLatest.value) {
      // 如果有阅读记录，获取最后一次阅读的章节
      const latest = await lastesApi.get_latest(mangaId.value)
      if (latest && latest.chapter) {
        chapterToRead = latest.chapter
        browse.page = latest.page || 1
      }
    }
    
    if (!chapterToRead) {
      // 否则获取第一章
      chapterToRead = await chapterApi.get_first(mangaId.value, 'number')
    }
    
    if (chapterToRead?.chapterId) {
      router.push(`/t/reader/${chapterToRead.chapterId}`)
    }
  } catch (error) {
    console.error('开始阅读失败:', error)
  }
}

function goChapterList() {
  router.push({
    name: 'chapter-list',
    query: { mangaId: mangaId.value },
    params: { browseType: mangaInfo.value.browseType, clear: '1' }
  })
}

function goToChapter(chapter: any) {
  try {
    if (chapter?.latest?.finish) {
      browse.page = 1
    } else if (chapter?.latest) {
      browse.page = chapter.latest.page
    } else {
      browse.page = 1
    }
    
    let routeName = chapter.browseType
    if (chapter.chapterType === 'pdf') {
      routeName = 'pdfView'
    }
    
    router.push({
      name: routeName,
      query: {
        mediaId: chapter.mediaId,
        mangaId: chapter.mangaId,
        chapterId: chapter.chapterId,
        chapterPath: chapter.chapterPath,
      },
    })
  } catch (error) {
    console.error('跳转章节失败:', error)
  }
}
</script>

<style scoped>
.ta-manga-info {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.ta-btn-back {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 24px;
  display: inline-block;
  transition: all 0.2s;
}

.ta-btn-back:hover {
  background: #f5f5f5;
}

.ta-banner {
  margin-bottom: 32px;
  border-radius: 16px;
  overflow: hidden;
}

.ta-banner-toomics {
  position: relative;
  width: 100%;
  height: 300px;
}

.ta-banner-fore {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  max-width: 100%;
  z-index: 1;
  object-fit: cover;
}

.ta-banner-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: blur(4px);
  object-fit: cover;
}

.ta-carousel {
  border-radius: 16px;
  overflow: hidden;
}

.ta-banner-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.ta-info-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.ta-info-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.ta-info-cover {
  flex-shrink: 0;
  width: 240px;
  height: 336px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
  font-size: 64px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-info-detail {
  flex: 1;
  min-width: 0;
}

.ta-info-detail h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #1f2937;
}

.ta-info-meta {
  display: flex;
  gap: 20px;
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ta-info-desc {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 28px;
}

.ta-info-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.ta-btn-primary,
.ta-btn-ghost,
.ta-btn-secondary {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.ta-btn-primary {
  color: #fff;
  background: #2563eb;
}

.ta-btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.ta-btn-ghost {
  color: #4b5563;
  background: #fff;
  border: 1px solid #d1d5db;
}

.ta-btn-ghost:hover {
  background: #f9fafb;
}

.ta-btn-collected {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.ta-btn-secondary {
  color: #374151;
  background: #f3f4f6;
}

.ta-btn-secondary:hover {
  background: #e5e7eb;
}

.ta-section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px;
}

.ta-character-section {
  margin-bottom: 40px;
}

.ta-character-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 4px 0 20px;
}

.ta-character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.ta-character-item img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ta-character-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
  text-align: center;
}

.ta-character-desc {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.ta-meta-section {
  margin-bottom: 40px;
}

.ta-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.ta-meta-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.ta-meta-label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
  margin-right: 16px;
}

.ta-meta-value {
  color: #6b7280;
  flex: 1;
}

.ta-meta-tags {
  grid-column: 1 / -1;
}

.ta-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  margin-right: 8px;
  margin-bottom: 8px;
  color: #fff;
}

.ta-chapter-section {
  margin-bottom: 40px;
}

.ta-chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ta-chapter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ta-chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ta-chapter-item:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.ta-chapter-item.ta-chapter-read {
  background: #eff6ff;
  border-left: 4px solid #2563eb;
}

.ta-chapter-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ta-chapter-number {
  font-weight: 600;
  color: #1f2937;
}

.ta-chapter-name {
  color: #6b7280;
  font-size: 14px;
}

.ta-chapter-date {
  font-size: 13px;
  color: #9ca3af;
}

.ta-chapter-status {
  font-size: 13px;
  color: #2563eb;
}

@media (max-width: 768px) {
  .ta-manga-info {
    padding: 16px;
  }
  
  .ta-info-content {
    padding: 20px;
  }
  
  .ta-info-header {
    flex-direction: column;
    gap: 24px;
  }
  
  .ta-info-cover {
    width: 200px;
    height: 280px;
    margin: 0 auto;
  }
  
  .ta-info-detail h1 {
    font-size: 24px;
  }
  
  .ta-info-actions {
    justify-content: center;
  }
  
  .ta-meta-grid {
    grid-template-columns: 1fr;
  }
  
  .ta-chapter-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
