<template>
  <div class="ta-collect">
    <div class="ta-page-head"><h1>收藏</h1></div>

    <div class="ta-tabs">
      <button class="ta-tab" :class="{ active: tab === 'manga' }" @click="tab = 'manga'">
        漫画
        <span class="ta-tab-badge" v-if="tab === 'manga' && count">{{ count }}</span>
      </button>
      <button class="ta-tab" :class="{ active: tab === 'chapter' }" @click="tab = 'chapter'">
        章节
        <span class="ta-tab-badge" v-if="tab === 'chapter' && count">{{ count }}</span>
      </button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="ta-grid" v-if="tab === 'manga'">
          <div v-for="item in list" :key="item.collectId" class="ta-grid-card" @click="go_manga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)">
            <div class="ta-grid-cover">
              <img v-if="getCoverUrl(item.mangaCover || '')" :src="getCoverUrl(item.mangaCover || '')" alt="" />
              <div v-else class="ta-cover-placeholder">📚</div>
            </div>
            <div class="ta-grid-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="ta-chapter-list" v-else>
          <div v-for="item in list" :key="item.collectId" class="ta-chapter-item" @click="go_read(item)" @contextmenu="openThemeContextMenu($event, 'chapter', item)">
            <div class="ta-chapter-cover">
              <img v-if="getCoverUrl(item.pageImage || item.chapterCover || '')" :src="getCoverUrl(item.pageImage || item.chapterCover || '')" alt="" />
              <div v-else class="ta-cover-placeholder">📖</div>
            </div>
            <div class="ta-chapter-info">
              <div class="ta-chapter-title">{{ item.chapterName || '未知章节' }}</div>
              <div v-if="item.mangaName" class="ta-chapter-sub">{{ item.mangaName }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <div v-if="!loading && list.length === 0" class="ta-empty">暂无收藏</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import collectApi from '@/api/collect'
import imageApi from '@/api/image'
import { config, userConfig } from '@/store'
import { mangaPageSize, chapterPageSize } from '@/store/page-size'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const tab = ref<'manga' | 'chapter'>('manga')
const page = ref(1)
const list = ref<any[]>([])
const count = ref(0)
const loading = ref(false)
const pageSizes = ref<number[]>([])
const defaultPageSize = ref(10)
const coverCache = ref<Record<string, string>>({})

const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))

function setup_page_size() {
  const screen = config.screenType
  const sizes = tab.value === 'manga' ? mangaPageSize[screen] : chapterPageSize[screen]
  pageSizes.value = sizes
  defaultPageSize.value = sizes[0] || 10
}

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
  if (pageParams < 1) return
  page.value = pageParams
  loading.value = true
  list.value = []
  try {
    const res = await collectApi.get(tab.value, pageParams, pageSize, orderBy.value)
    list.value = res?.list || []
    count.value = Number(res?.count || 0)
    // 加载封面
    if (tab.value === 'manga') {
      for (const item of list.value) {
        if (item.mangaCover) loadCover(item.mangaCover)
      }
    } else {
      for (const item of list.value) {
        const key = item.pageImage || item.chapterCover
        if (key) loadCover(key)
      }
    }
  } catch {
    list.value = []
    count.value = 0
  } finally {
    loading.value = false
  }
}

function go_manga(item: any) {
  if (!item?.mangaId) return
  router.push(`/t/manga/${item.mangaId}`)
}

async function loadCover(key: string) {
  if (!key || coverCache.value[key]) return
  try {
    const url = await imageApi.get({ file: key })
    if (url) coverCache.value[key] = url
  } catch { /* ignore */ }
}

function getCoverUrl(key: string) {
  return coverCache.value[key] || ''
}

function go_read(item: any) {
  if (!item?.chapterId) return
  router.push(`/t/reader/${item.chapterId}`)
}

watch(
  () => tab.value,
  () => {
    setup_page_size()
    page_change(1)
  }
)

watch(
  () => orderBy.value,
  () => {
    page_change(1)
  }
)

onMounted(() => {
  setup_page_size()
  page_change(1)
})
</script>

<style scoped lang="less">
.ta-collect {
  max-width: 980px;
  margin: 0 auto;
}

.ta-page-head {
  margin-bottom: 16px;
  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
}

.ta-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f3f4f6;
}

.ta-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  outline: none;
  white-space: nowrap;

  &:hover {
    color: #6b7280;
  }

  &.active {
    color: #2563eb;
    font-weight: 600;
    border-bottom-color: #2563eb;
  }
}

.ta-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: 10px;
  background: #f3f4f6;
  color: #9ca3af;
  transition: background 0.2s, color 0.2s;

  .ta-tab.active & {
    background: #dbeafe;
    color: #2563eb;
  }
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.ta-grid-card {
  cursor: pointer;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-2px);
  }
}

.ta-grid-cover {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ta-grid-cover img {
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

.ta-grid-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-chapter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.ta-chapter-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #eaeaea;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.ta-chapter-cover {
  flex-shrink: 0;
  width: 52px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ta-chapter-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-chapter-info {
  min-width: 0;
  flex: 1;
}

.ta-chapter-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-chapter-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-empty {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .ta-collect {
    padding: 0 4px;
  }

  .ta-tab {
    padding: 10px 16px;
    font-size: 13px;
  }

  .ta-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .ta-chapter-item {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .ta-tabs {
    gap: 0;
  }

  .ta-tab {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 13px;
  }

  .ta-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .ta-chapter-cover {
    width: 44px;
    height: 60px;
  }

  .ta-chapter-title {
    font-size: 13px;
  }

  .ta-chapter-sub {
    font-size: 11px;
  }
}
</style>
