<template>
  <div class="ta-search-page">
    <div class="ta-page-head"><h1>搜索</h1></div>

    <t-tabs-switcher
      v-model="tab"
      variant="A"
      :tabs="[
        { label: '漫画', value: 'manga', count },
        { label: '章节', value: 'chapter', count }
      ]"
    />

    <div class="ta-search-bar">
      <input
        v-model="keyword"
        class="ta-input"
        :placeholder="tab === 'manga' ? '输入关键字搜索漫画...' : '输入关键字搜索章节...'"
        @keydown.enter="page_change(1)" />
      <button class="ta-btn-primary" @click="page_change(1)">搜索</button>
    </div>

    <div class="touch-dom">
      <template>
        <div ref="listRef" class="ta-grid" v-if="tab === 'manga'">
          <t-manga-card v-for="item in list" :key="item.mangaId" :item="item" variant="A" @click="go_manga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)" />
        </div>

        <div ref="listRef" class="ta-chapter-list" v-else>
          <t-chapter-item
            v-for="item in list"
            :key="item.chapterId"
            :item="item"
            variant="A"
            :sub="(item.latest && item.latest.page) ? `上次看到第 ${item.latest.page} 页` : '未读'"
            @click="go_read(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      </template>
      <list-skeleton v-if="loading" />
    </div>

    <media-pager v-if="!loading" :page="page" :page-size="activePageSize || defaultPageSize" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <div v-if="searched && !loading && list.length === 0" class="ta-empty">未找到结果</div>
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

const router = useRouter()
const route = useRoute()
const { goRead } = useGoRead({ withPageJump: true })

const tab = ref<'manga' | 'chapter'>('manga')
const keyword = ref('')
const list = ref<any[]>([])
const page = ref(1)
const count = ref(0)
const loading = ref(false)
const searched = ref(false)
const listRef = ref<HTMLElement | null>(null)
const activePageSize = ref(0)

const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))
const pageSizeKind = computed(() => tab.value === 'manga' ? 'manga' : 'chapter')
const { autoPageSize, measurementReady } = useAutoPageSize(listRef, { kind: pageSizeKind })
const { pageSizes, defaultPageSize } = usePageSize(pageSizeKind, autoPageSize)
let pendingSearch = false
let searchSequence = 0

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
  const q = keyword.value.trim()
  if (!q) return

  searched.value = true
  if (!measurementReady.value) {
    pendingSearch = true
    loading.value = true
    return
  }
  pendingSearch = false
  const sequence = ++searchSequence
  page.value = pageParams
  activePageSize.value = pageSize
  loading.value = true
  list.value = []
  try {
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
  if (sizes.length !== 1) return
  const value = sizes[0]
  if (!searched.value || value < 1 || value === activePageSize.value) return
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
  if (route.query.q) keyword.value = String(route.query.q)
  if (keyword.value.trim()) page_change(1)
})
</script>

<style scoped>
.ta-page-head { margin-bottom: 2.4rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-search-bar { display: flex; gap: 1rem; margin-bottom: 2.4rem; }
.ta-input { flex: 1; max-width: 48rem; padding: 1rem 1.4rem; font-size: 1.4rem; border: 1px solid #eaeaea; border-radius: 0.8rem; outline: none; background: #fff; }
.ta-btn-primary { padding: 1rem 2rem; font-size: 1.4rem; font-weight: 500; color: #fff; background: #2563eb; border: none; border-radius: 0.8rem; cursor: pointer; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 1.8rem; row-gap: 1.2rem; }
.ta-grid-card { cursor: pointer; transition: transform 0.15s; }
.ta-grid-card:hover { transform: translateY(-0.2rem); }
.ta-grid-cover { aspect-ratio: 3 / 4; border-radius: 1rem; overflow: hidden; margin-bottom: 0.8rem; background: #f3f4f6; box-shadow: 0 0.2rem 0.8rem rgba(0,0,0,0.06); }
.ta-grid-name { font-size: 1.3rem; font-weight: 500; color: #111827; line-height: 1.35; max-height: calc(1.3rem * 1.35 * 2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;text-overflow: ellipsis; word-break: break-word; overflow-wrap: anywhere; }
.ta-empty { text-align: center; padding: 6rem; color: #9ca3af; }
.ta-chapter-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.8rem; }
</style>
