<template>
  <div class="td-manga-info">
    <button class="td-btn-back" @click="router.back()">← 返回</button>
    
    <!-- 顶部横幅 -->
    <div class="td-banner" v-if="banner.length">
      <div class="td-banner-toomics" v-if="bannerModel === 'toomics'">
        <img class="td-banner-fore" :src="banner[0]?.blob" alt="banner" />
        <img class="td-banner-back" :src="bannerBg?.blob" alt="bannerBg" />
      </div>
      <el-carousel class="td-carousel" :interval="interval" :type="carouselType" v-else>
        <el-carousel-item v-for="item in banner" :key="item.metaId">
          <img class="td-banner-img" :src="item.blob" alt="banner" />
        </el-carousel-item>
      </el-carousel>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="td-info-content">
      <div class="td-info-header">
        <div class="td-info-cover">
          <img v-if="mangaCover" :src="mangaCover" alt="cover" />
          <div v-else class="td-info-cover-ph">📚</div>
        </div>
        <div class="td-info-detail">
          <h1>{{ mangaInfo.mangaName || '加载中...' }}</h1>
          <div class="td-info-meta">
            <span>{{ mangaInfo.chapterCount || 0 }} 章节</span>
            <span v-if="mangaInfo.author">作者: {{ mangaInfo.author }}</span>
            <span v-if="mangaInfo.publishDate">发布时间: {{ mangaInfo.publishDate }}</span>
          </div>
          <p class="td-info-desc">{{ mangaInfo.describe || '暂无简介' }}</p>
          <div class="td-info-actions">
            <button class="td-btn-primary" @click="startRead">
              {{ hasLatest ? '继续阅读' : '开始阅读' }}
            </button>
            <button 
              class="td-btn-ghost" 
              @click="toggleCollect"
              :class="{ 'td-btn-collected': isCollected }"
            >
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
            <button class="td-btn-secondary" @click="goChapterList">章节列表</button>
          </div>
        </div>
      </div>

      <!-- 角色展示 -->
      <div class="td-character-section" v-if="character.length">
        <h2 class="td-section-title">角色</h2>
        <div class="td-character-list">
          <div 
            v-for="item in character" 
            :key="item.characterId" 
            class="td-character-item"
          >
            <img :src="item.blob" :alt="item.metaContent" />
            <div class="td-character-info">
              <p class="td-character-name">{{ item.metaContent }}</p>
              <p class="td-character-desc">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 漫画信息 -->
      <div class="td-meta-section">
        <h2 class="td-section-title">漫画信息</h2>
        <div class="td-meta-grid">
          <div class="td-meta-item">
            <span class="td-meta-label">漫画名称</span>
            <span class="td-meta-value">{{ mangaInfo.mangaName }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">作者</span>
            <span class="td-meta-value">{{ mangaInfo.author || '-' }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">发布时间</span>
            <span class="td-meta-value">{{ mangaInfo.publishDate || '-' }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">章节总数</span>
            <span class="td-meta-value">{{ mangaInfo.chapterCount || 0 }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">阅读方式</span>
            <span class="td-meta-value">{{ mangaInfo.browseType || '-' }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">所属媒体库</span>
            <span class="td-meta-value">{{ mangaInfo.media?.mediaName || '-' }}</span>
          </div>
          <div class="td-meta-item">
            <span class="td-meta-label">评分</span>
            <span class="td-meta-value">{{ mangaInfo.star || '-' }}</span>
          </div>
          <div class="td-meta-item td-meta-tags">
            <span class="td-meta-label">标签</span>
            <div class="td-meta-value td-meta-value-tags">
              <TagChip
                v-for="tag in mangaInfo.tags"
                :key="tag.tagId"
                :name="tag.tagName"
                :color="tag.tagColor"
              />
              <button class="td-btn-edit-tag" @click="editTagsDialog = true" v-if="mangaInfo.mangaId">
                {{ mangaInfo.tags?.length ? '编辑标签' : '添加标签' }}
              </button>
              <button class="td-btn-edit-tag" @click="openCoversEdit" v-if="mangaInfo.mangaId && hasManyCover">
                编辑封面
              </button>
              <button class="td-btn-edit-tag" @click="editMetaDialog = true" v-if="mangaInfo.mangaId">
                编辑元数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="td-chapter-section">
        <div class="td-chapter-header">
          <h2 class="td-section-title">章节列表</h2>
          <div class="td-chapter-controls">
            <el-switch 
              v-model="chapterListDesc" 
              @change="loadChapters"
              active-text="倒序"
              inactive-text="正序"
            />
          </div>
        </div>
        
        <div class="td-chapter-list">
          <div 
            v-for="(chapter, index) in chapterList" 
            :key="chapter.chapterId"
            class="td-chapter-item"
            :class="{ 'td-chapter-read': chapter.latest?.finish }"
            @click="goToChapter(chapter)"
            @contextmenu="openThemeContextMenu($event, 'chapter', chapter)"
          >
            <div class="td-chapter-info">
              <span class="td-chapter-number">第 {{ chapter.chapterNumber }} 话</span>
              <span class="td-chapter-name">{{ chapter.chapterName }}</span>
              <span class="td-chapter-date">{{ chapter.updateTime?.split(' ')[0] }}</span>
            </div>
            <div class="td-chapter-status" v-if="chapter.latest">
              <span v-if="chapter.latest.finish">✓ 已读</span>
              <span v-else>读至第 {{ chapter.latest.page }} 页</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签编辑弹窗 -->
    <div v-if="editTagsDialog" class="td-dialog-overlay smanga-backable" @click.self="editTagsDialog = false">
      <div class="td-dialog">
        <div class="td-dialog-head">
          <h3>编辑标签</h3>
          <button class="td-dialog-close smanga-back-close" @click="editTagsDialog = false">×</button>
        </div>
        <div class="td-dialog-body">
          <TagEditor
            :manga-id="mangaId"
            :tags="mangaInfo.tags || []"
            @update:tags="updateTags"
            @close="editTagsDialog = false"
          />
        </div>
      </div>
    </div>

    <!-- 封面编辑弹窗 -->
    <manga-cover-edit-dialog
      v-model="editCoverDialog"
      :manga-id="mangaInfo.mangaId"
      :current-cover="mangaInfo.mangaCover"
      :covers="covers"
      @reload="loadMangaInfo"
      @update:cover="onCoverUpdate"
    />

    <!-- 元数据编辑弹窗 -->
    <manga-meta-edit-dialog
      v-model="editMetaDialog"
      :manga-info="mangaInfo"
      @reload="loadMangaInfo"
    />
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
import TagChip from '@/themes/components/tag-chip.vue'
import TagEditor from '@/themes/components/tag-editor.vue'
import MangaCoverEditDialog from '@/themes/components/manga-cover-edit-dialog.vue'
import MangaMetaEditDialog from '@/themes/components/manga-meta-edit-dialog.vue'

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

// 数据状态
const mangaInfo = ref<any>({})
const chapterList = ref<any[]>([])
const isCollected = ref(false)
const hasLatest = ref(false)
const chapterListDesc = ref(false)
const editTagsDialog = ref(false)
const editCoverDialog = ref(false)
const editMetaDialog = ref(false)

// 元数据
const banner = ref<any[]>([])
const bannerBg = ref<any>(null)
const character = ref<any[]>([])
const mangaCover = ref<string>('')
const bannerModel = ref<string>('toptoon')
const interval = ref(6 * 1000)
const covers = ref<any[]>([])
const hasManyCover = ref(false)

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

      // 封面候选集合
      covers.value = mangaInfo.value.metas.filter((item: any) => item.metaName === 'cover')
      hasManyCover.value = covers.value.length > 0
      
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
    let jumpPage = 1

    if (hasLatest.value) {
      // 如果有阅读记录，获取最后一次阅读的章节
      const latest = await lastesApi.get_latest(mangaId.value)
      if (latest && latest.chapter) {
        chapterToRead = latest.chapter
        jumpPage = Number(latest.page) || 1
        browse.page = jumpPage
      }
    }

    if (!chapterToRead) {
      // 否则获取第一章
      chapterToRead = await chapterApi.get_first(mangaId.value, 'number')
      jumpPage = 1
      browse.page = 1
    }

    if (chapterToRead?.chapterId) {
      // reader 从 localStorage.pageJump 读取初始页码，必须同步写入才能跳到目标页
      if (jumpPage > 1) {
        localStorage.setItem('pageJump', String(jumpPage))
      } else {
        localStorage.removeItem('pageJump')
      }
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

function updateTags(tags: any[]) {
  mangaInfo.value.tags = tags
}

function openCoversEdit() {
  editCoverDialog.value = true
  covers.value.forEach(async (item: any) => {
    item.active = item.metaFile === mangaInfo.value.mangaCover
    item.blob = await imageApi.get({ file: item.metaFile })
  })
}

async function onCoverUpdate(v: string) {
  mangaInfo.value.mangaCover = v
  if (v) mangaCover.value = await imageApi.get({ file: v })
}

function goToChapter(chapter: any) {
  try {
    let jumpPage = 1
    if (chapter?.latest?.finish) {
      jumpPage = 1
    } else if (chapter?.latest?.page) {
      jumpPage = Number(chapter.latest.page) || 1
    }
    browse.page = jumpPage
    // 同步写入 pageJump，供 reader 读取初始页码
    if (jumpPage > 1) {
      localStorage.setItem('pageJump', String(jumpPage))
    } else {
      localStorage.removeItem('pageJump')
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
.td-manga-info {
  padding: 2rem;
  max-width: 120rem;
  margin: 0 auto;
}

.td-btn-back {
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  border: 1px solid var(--sd-border);
  border-radius: 0.8rem;
  background: var(--sd-card);
  color: var(--sd-text);
  cursor: pointer;
  margin-bottom: 2.4rem;
  display: inline-block;
  transition: all 0.2s;
}

.td-btn-back:hover {
  background: var(--sd-hover);
}

.td-banner {
  margin-bottom: 3.2rem;
  border-radius: 1.6rem;
  overflow: hidden;
}

.td-banner-toomics {
  position: relative;
  width: 100%;
  height: 30rem;
}

.td-banner-fore {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  max-width: 100%;
  z-index: 1;
  object-fit: cover;
}

.td-banner-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: blur(0.4rem);
  object-fit: cover;
}

.td-carousel {
  border-radius: 1.6rem;
  overflow: hidden;
}

.td-banner-img {
  width: 100%;
  height: 30rem;
  object-fit: cover;
}

.td-info-content {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 1.6rem;
  padding: 3.2rem;
  box-shadow: 0 0.2rem 1.2rem rgba(0, 0, 0, 0.04);
}

.td-info-header {
  display: flex;
  gap: 3.2rem;
  margin-bottom: 4rem;
}

.td-info-cover {
  flex-shrink: 0;
  width: 24rem;
  height: 33.6rem;
  border-radius: 1.2rem;
  overflow: hidden;
  background: var(--sd-hover);
  box-shadow: 0 0.8rem 2.4rem rgba(0, 0, 0, 0.12);
}

.td-info-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.td-info-cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6.4rem;
  background: linear-gradient(135deg, var(--sd-primary-bg), var(--sd-hover));
}

.td-info-detail {
  flex: 1;
  min-width: 0;
}

.td-info-detail h1 {
  font-size: 3.2rem;
  font-weight: 700;
  margin: 0 0 1.6rem;
  color: var(--sd-text);
}

.td-info-meta {
  display: flex;
  gap: 2rem;
  font-size: 1.5rem;
  color: var(--sd-text-muted);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.td-info-desc {
  font-size: 1.6rem;
  color: var(--sd-text-muted);
  line-height: 1.7;
  margin-bottom: 2.8rem;
}

.td-info-actions {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.td-btn-primary,
.td-btn-ghost,
.td-btn-secondary {
  padding: 1.2rem 2.4rem;
  font-size: 1.5rem;
  font-weight: 500;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.td-btn-primary {
  color: #fff;
  background: var(--sd-primary);
}

.td-btn-primary:hover {
  background: var(--sd-primary);
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.td-btn-ghost {
  color: var(--sd-text-muted);
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
}

.td-btn-ghost:hover {
  background: var(--sd-hover);
}

.td-btn-collected {
  color: var(--sd-primary);
  border-color: var(--sd-primary-bg);
  background: var(--sd-primary-bg);
}

.td-btn-secondary {
  color: var(--sd-text);
  background: var(--sd-hover);
}

.td-btn-secondary:hover {
  background: var(--sd-border);
}

.td-section-title {
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--sd-text);
  margin: 0 0 2.4rem;
}

.td-character-section {
  margin-bottom: 4rem;
}

.td-character-list {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 0.4rem 0 2rem;
}

.td-character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 12rem;
}

.td-character-item img {
  width: 9.6rem;
  height: 9.6rem;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.2rem;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.1);
}

.td-character-name {
  font-weight: 600;
  color: var(--sd-text);
  margin: 0 0 0.4rem;
  text-align: center;
}

.td-character-desc {
  font-size: 1.3rem;
  color: var(--sd-text-muted);
  text-align: center;
  margin: 0;
}

.td-meta-section {
  margin-bottom: 4rem;
}

.td-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
  gap: 1.6rem;
}

.td-meta-item {
  display: flex;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--sd-border);
}

.td-meta-label {
  font-weight: 600;
  color: var(--sd-text);
  min-width: 10rem;
  margin-right: 1.6rem;
}

.td-meta-value {
  color: var(--sd-text-muted);
  flex: 1;
}

.td-meta-tags {
  grid-column: 1 / -1;
}

.td-meta-value-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.td-btn-edit-tag {
  padding: 0.4rem 1.2rem;
  font-size: 1.2rem;
  color: var(--sd-primary, #2563eb);
  background: none;
  border: 1px dashed var(--sd-primary, #2563eb);
  border-radius: 99.9rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.td-btn-edit-tag:hover {
  background: var(--sd-primary, #2563eb);
  color: #fff;
}

/* dialog */
.td-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.td-dialog {
  background: var(--sd-card);
  border-radius: 1.4rem;
  width: 52rem;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 0.8rem 3.2rem rgba(0, 0, 0, 0.12);
}
.td-dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.6rem 2rem;
  border-bottom: 1px solid var(--sd-border);
}
.td-dialog-head h3 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}
.td-dialog-close {
  width: 3.2rem;
  height: 3.2rem;
  border: none;
  background: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 0.6rem;
}
.td-dialog-close:hover {
  background: var(--sd-hover);
}
.td-dialog-body {
  padding: 2rem;
}

.td-chapter-section {
  margin-bottom: 4rem;
}

.td-chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.td-chapter-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.td-chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem;
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.td-chapter-item:hover {
  background: var(--sd-hover);
  transform: translateY(-1px);
}

.td-chapter-item.td-chapter-read {
  background: var(--sd-primary-bg);
  border-left: 0.4rem solid var(--sd-primary);
}

.td-chapter-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.td-chapter-number {
  font-weight: 600;
  color: var(--sd-text);
}

.td-chapter-name {
  color: var(--sd-text-muted);
  font-size: 1.4rem;
}

.td-chapter-date {
  font-size: 1.3rem;
  color: var(--sd-text-faint);
}

.td-chapter-status {
  font-size: 1.3rem;
  color: var(--sd-primary);
}

@media (max-width: 76.8rem) {
  .td-manga-info {
    padding: 1.6rem;
  }
  
  .td-info-content {
    padding: 2rem;
  }
  
  .td-info-header {
    flex-direction: column;
    gap: 2.4rem;
  }
  
  .td-info-cover {
    width: 20rem;
    height: 28rem;
    margin: 0 auto;
  }
  
  .td-info-detail h1 {
    font-size: 2.4rem;
  }
  
  .td-info-actions {
    justify-content: center;
  }
  
  .td-meta-grid {
    grid-template-columns: 1fr;
  }
  
  .td-chapter-header {
    flex-direction: column;
    gap: 1.6rem;
    align-items: flex-start;
  }
}
</style>
