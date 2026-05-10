<template>
  <div class="ta-search-page">
    <div class="ta-page-head"><h1>搜索</h1></div>

    <div class="ta-tabs">
      <button class="ta-tab" :class="{ active: tab === 'manga' }" @click="tab = 'manga'">漫画</button>
      <button class="ta-tab" :class="{ active: tab === 'chapter' }" @click="tab = 'chapter'">章节</button>
    </div>

    <div class="ta-search-bar">
      <input
        v-model="keyword"
        class="ta-input"
        :placeholder="tab === 'manga' ? '输入关键字搜索漫画...' : '输入关键字搜索章节...'"
        @keydown.enter="page_change(1)" />
      <button class="ta-btn-primary" @click="page_change(1)">搜索</button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="ta-grid" v-if="tab === 'manga'">
          <div v-for="item in list" :key="item.mangaId" class="ta-grid-card" @click="go_manga(item)">
            <t-cover class="ta-grid-cover" variant="A" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" />
            <div class="ta-grid-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="ta-chapter-list" v-else>
          <div v-for="item in list" :key="item.chapterId" class="ta-chapter-item" @click="go_read(item)">
            <t-cover class="ta-chapter-cover" variant="A" :seed="Number(item?.chapterId || 0)" :file="item?.chapterCover || ''" />
            <div class="ta-chapter-info">
              <div class="ta-chapter-title">{{ item.chapterName || '未知章节' }}</div>
              <div class="ta-chapter-sub" v-if="item.latest && item.latest.page">上次看到第 {{ item.latest.page }} 页</div>
              <div class="ta-chapter-sub" v-else>未读</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <div v-if="searched && !loading && list.length === 0" class="ta-empty">未找到结果</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import searchApi from '@/api/search'
import { config, userConfig } from '@/store'
import { mangaPageSize, chapterPageSize } from '@/store/page-size'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TCover from '@/themes/components/media-cover.vue'

const router = useRouter()
const route = useRoute()

const tab = ref<'manga' | 'chapter'>('manga')
const keyword = ref('')
const list = ref<any[]>([])
const page = ref(1)
const count = ref(0)
const loading = ref(false)
const searched = ref(false)
const pageSizes = ref<number[]>([])
const defaultPageSize = ref(10)

const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))

function setup_page_size() {
  const screen = config.screenType
  const sizes = tab.value === 'manga' ? mangaPageSize[screen] : chapterPageSize[screen]
  pageSizes.value = sizes
  defaultPageSize.value = sizes[0] || 10
}

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
  const q = keyword.value.trim()
  if (!q) return

  searched.value = true
  page.value = pageParams
  loading.value = true
  list.value = []
  try {
    const res = await searchApi.get(q, tab.value, pageParams, pageSize, orderBy.value)
    list.value = res?.list || []
    count.value = Number(res?.count || 0)
    await router.replace({ name: route.name as any, query: { ...route.query, q } })
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

function go_read(item: any) {
  if (!item?.chapterId) return
  const p = Number(item?.latest?.page || 0)
  if (p && p > 1) localStorage.setItem('pageJump', String(p))
  router.push(`/t/reader/${item.chapterId}`)
}

watch(
  () => route.query.q,
  (v) => {
    keyword.value = (v as string) || ''
    if (keyword.value.trim()) page_change(1)
    else {
      list.value = []
      count.value = 0
      searched.value = false
    }
  }
)

watch(
  () => tab.value,
  () => {
    setup_page_size()
    if (keyword.value.trim()) page_change(1)
    else {
      list.value = []
      count.value = 0
      searched.value = false
    }
  }
)

watch(
  () => orderBy.value,
  () => {
    if (keyword.value.trim()) page_change(1)
  }
)

onMounted(() => {
  if (route.query.q) keyword.value = String(route.query.q)
  setup_page_size()
  if (keyword.value.trim()) page_change(1)
})
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-search-bar { display: flex; gap: 10px; margin-bottom: 24px; }
.ta-tabs { display: flex; gap: 10px; margin: 0 0 14px; }
.ta-tab { padding: 8px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 999px; background: #fff; cursor: pointer; }
.ta-tab.active { border-color: #2563eb; color: #2563eb; font-weight: 600; }
.ta-input { flex: 1; max-width: 480px; padding: 10px 14px; font-size: 14px; border: 1px solid #eaeaea; border-radius: 8px; outline: none; background: #fff; }
.ta-btn-primary { padding: 10px 20px; font-size: 14px; font-weight: 500; color: #fff; background: #2563eb; border: none; border-radius: 8px; cursor: pointer; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px; }
.ta-grid-card { cursor: pointer; transition: transform 0.15s; }
.ta-grid-card:hover { transform: translateY(-2px); }
.ta-grid-cover { aspect-ratio: 3 / 4; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ta-grid-name { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-empty { text-align: center; padding: 60px; color: #9ca3af; }
.ta-chapter-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.ta-chapter-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; background: #fff; border: 1px solid #eaeaea; cursor: pointer; transition: all 0.15s; }
.ta-chapter-item:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.ta-chapter-cover { flex-shrink: 0; width: 52px; height: 70px; border-radius: 10px; overflow: hidden; }
.ta-chapter-info { min-width: 0; flex: 1; }
.ta-chapter-title { font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ta-chapter-sub { margin-top: 4px; font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
