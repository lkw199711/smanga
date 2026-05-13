<template>
  <div class="tb-page">
    <h1>收藏</h1>

    <div class="tb-tabs">
      <button class="tb-tab" :class="{active: tab === 'manga'}" @click="tab = 'manga'">漫画</button>
      <button class="tb-tab" :class="{active: tab === 'chapter'}" @click="tab = 'chapter'">章节</button>
    </div>

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="tb-grid" v-if="tab === 'manga'">
          <div v-for="item in list" :key="item.collectId" class="tb-card" @click="go_manga(item)">
            <t-cover class="tb-card-cover" variant="B" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" />
            <div class="tb-card-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="tb-chapter-list" v-else>
          <div v-for="item in list" :key="item.collectId" class="tb-chapter-item" @click="go_read(item)">
            <t-cover
              class="tb-chapter-cover"
              variant="B"
              :seed="Number(item?.chapterId || item?.mangaId || 0)"
              :file="item?.chapterCover || item?.mangaCover || ''" />
            <div class="tb-chapter-info">
              <div class="tb-chapter-title">{{ item.mangaName || '未知漫画' }}</div>
              <div class="tb-chapter-sub">{{ item.chapterName || '未知章节' }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <div v-if="!loading && !list.length" class="tb-empty">暂无收藏</div>
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
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#1f2937}
.tb-tabs{display:flex;gap:10px;margin-bottom:18px}
.tb-tab{padding:8px 14px;font-size:13px;border-radius:999px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.8);color:#6b7280;cursor:pointer}
.tb-tab.active{border-color:rgba(59,130,246,0.8);color:#1f2937;background:rgba(59,130,246,0.9)}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px}
.tb-card{cursor:pointer;transition:transform .2s}.tb-card:hover{transform:translateY(-3px)}
.tb-card-cover{aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:rgba(255,255,255,0.8);box-shadow:0 4px 16px rgba(0,0,0,0.08);margin-bottom:8px}
.tb-card-name{font-size:13px;font-weight:500;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-chapter-list{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.tb-chapter-item{display:flex;align-items:center;gap:14px;padding:12px;border-radius:14px;border:1px solid rgba(0,0,0,0.1);background:rgba(255,255,255,0.8);cursor:pointer;transition:all .15s}
.tb-chapter-item:hover{border-color:rgba(0,0,0,0.2);background:#f9fafb}
.tb-chapter-cover{flex-shrink:0;width:52px;height:70px;border-radius:12px;overflow:hidden}
.tb-chapter-info{min-width:0;flex:1}
.tb-chapter-title{font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-chapter-sub{margin-top:4px;font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-empty{text-align:center;padding:60px;color:#6b7280;grid-column:1/-1}
</style>

