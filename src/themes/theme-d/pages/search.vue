<template>
  <div class="td-search">
    <h2 class="td-page-title">搜索</h2>
    <t-tabs-switcher v-model="tab" variant="D" :tabs="[{label:'漫画',value:'manga',count},{label:'章节',value:'chapter',count}]" />

    <div class="td-search-bar">
      <input
        class="td-search-box"
        v-model="keyword"
        :placeholder="tab === 'manga' ? '输入关键词搜索漫画...' : '输入关键词搜索章节...'"
        @keyup.enter="page_change(1)" />
      <button class="td-btn" @click="page_change(1)">搜索</button>
    </div>

    <div class="touch-dom">
        <div ref="listRef" class="td-card-grid" v-if="tab === 'manga'">
          <t-manga-card v-for="item in list" :key="item.mangaId" :item="item" variant="D" @click="go_manga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)" />
        </div>

        <div ref="listRef" class="td-chapter-list" v-if="tab === 'chapter'">
          <t-chapter-item
            v-for="item in list"
            :key="item.chapterId"
            :item="item"
            variant="D"
            :sub="(item.latest && item.latest.page) ? `上次看到第 ${item.latest.page} 页` : '未读'"
            @click="go_read(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      <list-skeleton v-if="loading" />
    </div>

    <media-pager v-if="!loading" :page="page" :page-size="activePageSize || defaultPageSize" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <p class="td-empty" v-if="searched && !loading && !list.length">未找到结果</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import searchApi from '@/api/search'
import { userConfig } from '@/store'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TCover from '@/themes/components/media-cover.vue'
import TMangaCard from '@/themes/components/manga-card.vue'
import TChapterItem from '@/themes/components/chapter-item.vue'
import TTabsSwitcher from '@/themes/components/tabs-switcher.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useAutoPageSize, useGoRead, usePageSize } from '@/themes/composables'

const route = useRoute()
const router = useRouter()
const { goRead } = useGoRead({ withPageJump: true })
const tab = ref<'manga' | 'chapter'>('manga')
const keyword = ref((route.query.q as string) || '')
const list = ref<any[]>([])
const searched = ref(false)
const page = ref(1)
const count = ref(0)
const loading = ref(false)
const listRef = ref<HTMLElement | null>(null)
const activePageSize = ref(0)

const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))
const pageSizeKind = computed(() => tab.value === 'manga' ? 'manga' : 'chapter')
const { autoPageSize, measurementReady } = useAutoPageSize(listRef, { kind: pageSizeKind })
const { pageSizes, defaultPageSize } = usePageSize(pageSizeKind, autoPageSize)
let pendingSearch = false
let searchSequence = 0
let followsAutomaticPageSize = true

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
  if (!keyword.value.trim()) return
  searched.value = true
  if (!measurementReady.value) {
    pendingSearch = true
    loading.value = true
    return
  }
  pendingSearch = false
  followsAutomaticPageSize = pageSize === defaultPageSize.value
  const sequence = ++searchSequence
  page.value = pageParams
  activePageSize.value = pageSize
  loading.value = true
  list.value = []
  try {
    const q = keyword.value.trim()
    const res = await searchApi.get(q, tab.value, pageParams, pageSize, orderBy.value)
    if (sequence !== searchSequence) return
    list.value = res?.list || []
    count.value = Number(res?.count || 0)
    await router.replace({ name: route.name as any, query: { ...route.query, q } })
  } catch {
    if (sequence !== searchSequence) return
    list.value = []
    count.value = 0
  } finally {
    if (sequence === searchSequence) loading.value = false
  }
}

function go_manga(item: any) {
  if (!item?.mangaId) return
  router.push(`/t/manga/${item.mangaId}`)
}

function go_read(item: any) {
  return goRead(item)
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
    if (keyword.value.trim()) page_change(1)
    else {
      list.value = []
      count.value = 0
      searched.value = false
    }
  }
)

watch([pageSizes, measurementReady], ([sizes, ready]) => {
  if (!ready) return
  if (pendingSearch) {
    void page_change(1, sizes[0] || defaultPageSize.value)
    return
  }
  const value = sizes[0]
  if (!followsAutomaticPageSize || !searched.value || value < 1 || value === activePageSize.value) return
  const firstItemIndex = (page.value - 1) * Math.max(1, activePageSize.value)
  void page_change(Math.floor(firstItemIndex / value) + 1, value)
}, { flush: 'post' })

watch(
  () => orderBy.value,
  () => {
    if (keyword.value.trim()) page_change(1)
  }
)

onMounted(() => {
  if (keyword.value) page_change(1)
})
</script>

<style scoped>
.td-search { max-width: 120rem; margin: 0 auto; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
.td-search-bar { display: flex; gap: 1rem; margin-bottom: 1.8rem; }
.td-search-box { width: 100%; max-width: 40rem; height: 4rem; padding: 0 1.6rem; border-radius: 2rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); font-size: 1.4rem; outline: none; transition: border-color .2s; }
.td-search-box:focus { border-color: var(--accent); }
.td-btn { padding: 1rem 1.8rem; border-radius: 2rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); cursor: pointer; transition: all .15s; }
.td-btn:hover { border-color: var(--accent); }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.6rem; }
.td-card { background: var(--bg2); border-radius: 1rem; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-0.2rem); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-title { padding: 0.8rem 1rem; font-size: 1.3rem; font-weight: 500; color: var(--fg); line-height: 1.35; max-height: calc(1.3rem * 1.35 * 2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: anywhere; }
.td-chapter-list { display: flex; flex-direction: column; gap: 1rem; margin: 0 0 1.8rem; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 4rem; }
</style>
