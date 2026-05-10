<template>
  <div class="td-collect">
    <h2 class="td-page-title">收藏</h2>

    <div class="td-tabs">
      <button class="td-tab" :class="{ active: tab === 'manga' }" @click="tab = 'manga'">漫画</button>
      <button class="td-tab" :class="{ active: tab === 'chapter' }" @click="tab = 'chapter'">章节</button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="td-card-grid" v-if="tab === 'manga'">
          <div class="td-card" v-for="item in list" :key="item.collectId" @click="go_manga(item)">
            <t-cover class="td-card-cover" variant="D" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" />
            <div class="td-card-title">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="td-chapter-list" v-else>
          <div class="td-chapter-item" v-for="item in list" :key="item.collectId" @click="go_read(item)">
            <t-cover
              class="td-chapter-cover"
              variant="D"
              :seed="Number(item?.chapterId || item?.mangaId || 0)"
              :file="item?.chapterCover || item?.mangaCover || ''" />
            <div class="td-chapter-info">
              <div class="td-chapter-title">{{ item.mangaName || '未知漫画' }}</div>
              <div class="td-chapter-sub">{{ item.chapterName || '未知章节' }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <p class="td-empty" v-if="!loading && !list.length">暂无收藏</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import collectApi from '@/api/collect'
import { config, userConfig } from '@/store'
import { mangaPageSize, chapterPageSize } from '@/store/page-size'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TCover from '@/themes/components/media-cover.vue'

const router = useRouter()
const tab = ref<'manga' | 'chapter'>('manga')
const page = ref(1)
const list = ref<any[]>([])
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
  if (pageParams < 1) return
  page.value = pageParams
  loading.value = true
  list.value = []
  try {
    const res = await collectApi.get(tab.value, pageParams, pageSize, orderBy.value)
    list.value = res?.list || []
    count.value = Number(res?.count || 0)
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

<style scoped>
.td-collect { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-tabs { display: flex; gap: 10px; margin-bottom: 16px; }
.td-tab { padding: 8px 14px; font-size: 13px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg2); color: var(--fg2); cursor: pointer; transition: all .15s; }
.td-tab.active { border-color: var(--accent); color: var(--fg); }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.td-card { background: var(--bg2); border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-title { padding: 8px 10px; font-size: 13px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-chapter-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.td-chapter-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border); cursor: pointer; transition: all .15s; }
.td-chapter-item:hover { border-color: var(--accent); }
.td-chapter-cover { flex-shrink: 0; width: 52px; height: 70px; border-radius: 10px; overflow: hidden; }
.td-chapter-info { min-width: 0; flex: 1; }
.td-chapter-title { font-size: 14px; font-weight: 600; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-chapter-sub { margin-top: 4px; font-size: 12px; color: var(--fg2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
