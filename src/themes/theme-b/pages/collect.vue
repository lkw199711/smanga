<template>
  <div class="tb-page">
    <div class="tb-page-head"><h1>收藏</h1></div>

    <t-tabs-switcher v-model="tab" variant="B" :tabs="[{label:'漫画',value:'manga',count},{label:'章节',value:'chapter',count}]" />

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="tb-grid" v-if="tab === 'manga'">
          <div v-for="item in list" :key="item.collectId" class="tb-card" @click="goManga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)">
            <t-cover class="tb-card-cover" variant="B" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" fit="cover" />
            <div class="tb-card-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="tb-chapter-list" v-else>
          <t-chapter-item
            v-for="item in list"
            :key="item.collectId"
            :item="item"
            variant="B"
            :title="item.mangaName || '未知漫画'"
            :sub="item.chapterName || '未知章节'"
            @click="goRead(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="pageChange" />

    <div v-if="!loading && !list.length" class="tb-empty">暂无收藏</div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import collectApi from '@/api/collect'
import { userConfig } from '@/store'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TCover from '@/themes/components/media-cover.vue'
import TChapterItem from '@/themes/components/chapter-item.vue'
import TTabsSwitcher from '@/themes/components/tabs-switcher.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage, useGoRead } from '@/themes/composables'

const router = useRouter()
const tab = ref<'manga' | 'chapter'>('manga')
const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))

const { goRead } = useGoRead()
const { page, list, count, loading, pageSizes, pageChange } = useListPage<any>({
  kind: computed(() => (tab.value === 'manga' ? 'manga' : 'chapter')),
  resetDeps: [() => tab.value, () => orderBy.value],
  loader: async ({ page, pageSize }) => {
    const res = await collectApi.get(tab.value, page, pageSize, orderBy.value)
    return { list: res?.list || [], count: Number(res?.count || 0) }
  },
})

function goManga(item: any) {
  if (!item?.mangaId) return
  router.push(`/t/manga/${item.mangaId}`)
}
</script>
<style scoped>
.tb-page{max-width:980px;margin:0 auto}
.tb-page-head{margin-bottom:18px}
.tb-page-head h1{font-size:20px;font-weight:700;margin:0;color:#1f2937}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px}
.tb-card{cursor:pointer;transition:transform .2s}.tb-card:hover{transform:translateY(-3px)}
.tb-card-cover{aspect-ratio:3/4;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);margin-bottom:8px}
.tb-card-name{font-size:13px;font-weight:500;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-chapter-list{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.tb-empty{text-align:center;padding:60px;color:#6b7280;grid-column:1/-1}
</style>