<template>
  <div class="td-search">
    <h2 class="td-page-title">搜索</h2>
    <div class="td-tabs">
      <button class="td-tab" :class="{ active: tab === 'manga' }" @click="tab = 'manga'">漫画</button>
      <button class="td-tab" :class="{ active: tab === 'chapter' }" @click="tab = 'chapter'">章节</button>
    </div>

    <div class="td-search-bar">
      <input
        class="td-search-box"
        v-model="keyword"
        :placeholder="tab === 'manga' ? '输入关键词搜索漫画...' : '输入关键词搜索章节...'"
        @keyup.enter="page_change(1)" />
      <button class="td-btn" @click="page_change(1)">搜索</button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="td-card-grid" v-if="tab === 'manga' && list.length">
          <div class="td-card" v-for="item in list" :key="item.mangaId" @click="go_manga(item)">
            <t-cover class="td-card-cover" variant="D" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" />
            <div class="td-card-title">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="td-chapter-list" v-if="tab === 'chapter' && list.length">
          <div class="td-chapter-item" v-for="item in list" :key="item.chapterId" @click="go_read(item)">
            <t-cover class="td-chapter-cover" variant="D" :seed="Number(item?.chapterId || 0)" :file="item?.chapterCover || ''" />
            <div class="td-chapter-info">
              <div class="td-chapter-title">{{ item.chapterName || '未知章节' }}</div>
              <div class="td-chapter-sub" v-if="item.latest && item.latest.page">上次看到第 {{ item.latest.page }} 页</div>
              <div class="td-chapter-sub" v-else>未读</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <p class="td-empty" v-if="searched && !loading && !list.length">未找到结果</p>
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

const route = useRoute()
const router = useRouter()
const tab = ref<'manga' | 'chapter'>('manga')
const keyword = ref((route.query.q as string) || '')
const list = ref<any[]>([])
const searched = ref(false)
const page = ref(1)
const count = ref(0)
const loading = ref(false)
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
  if (!keyword.value.trim()) return
  searched.value = true
  page.value = pageParams
  loading.value = true
  list.value = []
  try {
    const q = keyword.value.trim()
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
  if (p && p > 1) {
    localStorage.setItem('pageJump', String(p))
  }
  router.push(`/t/reader/${item.chapterId}`)
}

watch(
  () => route.query.q,
  (v) => {
    keyword.value = (v as string) || ''
    if (keyword.value) page_change(1)
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
  setup_page_size()
  if (keyword.value) page_change(1)
})
</script>

<style scoped>
.td-search { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-tabs { display: flex; gap: 10px; margin-bottom: 14px; }
.td-tab { padding: 8px 14px; font-size: 13px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg2); color: var(--fg2); cursor: pointer; transition: all .15s; }
.td-tab.active { border-color: var(--accent); color: var(--fg); }
.td-search-bar { display: flex; gap: 10px; margin-bottom: 18px; }
.td-search-box { width: 100%; max-width: 400px; height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); font-size: 14px; outline: none; transition: border-color .2s; }
.td-search-box:focus { border-color: var(--accent); }
.td-btn { padding: 10px 18px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); cursor: pointer; transition: all .15s; }
.td-btn:hover { border-color: var(--accent); }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.td-card { background: var(--bg2); border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-2px); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-title { padding: 8px 10px; font-size: 13px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-chapter-list { display: flex; flex-direction: column; gap: 10px; margin: 0 0 18px; }
.td-chapter-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border); cursor: pointer; transition: all .15s; }
.td-chapter-item:hover { border-color: var(--accent); }
.td-chapter-cover { flex-shrink: 0; width: 52px; height: 70px; border-radius: 10px; overflow: hidden; }
.td-chapter-info { min-width: 0; flex: 1; }
.td-chapter-title { font-size: 14px; font-weight: 600; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-chapter-sub { margin-top: 4px; font-size: 12px; color: var(--fg2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
