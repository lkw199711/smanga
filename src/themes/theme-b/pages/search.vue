<template>
  <div class="tb-page">
    <h1>搜索</h1>

    <t-tabs-switcher v-model="tab" variant="B" :tabs="[{label:'漫画',value:'manga',count},{label:'章节',value:'chapter',count}]" />

    <div class="tb-search-bar">
      <input
        v-model="keyword"
        :placeholder="tab === 'manga' ? '搜索漫画...' : '搜索章节...'"
        @keydown.enter="page_change(1)" />
      <button @click="page_change(1)">搜索</button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div ref="listRef" class="tb-grid" v-if="tab === 'manga'">
          <t-manga-card v-for="item in list" :key="item.mangaId" :item="item" variant="B" @click="go_manga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)" />
        </div>

        <div ref="listRef" class="tb-chapter-list" v-else>
          <t-chapter-item
            v-for="item in list"
            :key="item.chapterId"
            :item="item"
            variant="B"
            :sub="(item.latest && item.latest.page) ? `上次看到第 ${item.latest.page} 页` : '未读'"
            @click="go_read(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      </template>
    </div>

    <media-pager :page="page" :page-size="activePageSize || defaultPageSize" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <div v-if="searched && !loading && !list.length" class="tb-empty">未找到结果</div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
const keyword = ref((route.query.q as string) || '')
const list = ref<any[]>([])
const page = ref(1)
const count = ref(0)
const loading = ref(false)
const searched = ref(false)
const listRef = ref<HTMLElement | null>(null)
const activePageSize = ref(0)

const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))
const pageSizeKind = computed(() => tab.value === 'manga' ? 'manga' : 'chapter')
const { autoPageSize } = useAutoPageSize(listRef, { kind: pageSizeKind })
const { pageSizes, defaultPageSize } = usePageSize(pageSizeKind, autoPageSize)

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
  if (!keyword.value.trim()) return
  searched.value = true
  page.value = pageParams
  activePageSize.value = pageSize
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

watch(pageSizes, sizes => {
  if (sizes.length !== 1) return
  const value = sizes[0]
  if (!searched.value || value < 1 || value === activePageSize.value) return
  const firstItemIndex = (page.value - 1) * Math.max(1, activePageSize.value)
  void page_change(Math.floor(firstItemIndex / value) + 1, value)
})

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
h1{font-size:2rem;font-weight:700;margin:0 0 2rem;color:#1f2937}
.tb-search-bar{display:flex;gap:1rem;margin-bottom:2rem}
.tb-search-bar input{flex:1;max-width:40rem;padding:1rem 1.6rem;background:rgba(255,255,255,0.8);border:1px solid rgba(0,0,0,0.1);border-radius:2rem;color:#1f2937;font-size:1.4rem;outline:none}
.tb-search-bar input::placeholder{color:rgba(0,0,0,0.4)}
.tb-search-bar button{padding:1rem 2rem;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:2rem;color:#1f2937;cursor:pointer;font-size:1.3rem}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:1.6rem}
.tb-card{cursor:pointer;transition:transform .2s}.tb-card:hover{transform:translateY(-0.3rem)}
.tb-card-cover{aspect-ratio:3/4;border-radius:1.4rem;overflow:hidden;background:rgba(255,255,255,0.8);box-shadow:0 0.4rem 1.6rem rgba(0,0,0,0.08);margin-bottom:0.8rem}
.tb-card-name{font-size:1.3rem;font-weight:500;color:#1f2937;line-height:1.35;max-height:calc(1.3rem * 1.35 * 2);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;text-overflow:ellipsis;word-break:break-word;overflow-wrap:anywhere}
.tb-chapter-list{display:flex;flex-direction:column;gap:1rem;margin-bottom:1.8rem}
</style>


