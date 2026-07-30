<template>
  <div class="tb-page">
    <div class="tb-page-head"><h1>收藏</h1></div>

    <t-tabs-switcher v-model="tab" variant="B" :tabs="[{label:'漫画',value:'manga',count},{label:'章节',value:'chapter',count}]" />

    <div class="touch-dom">
      <template>
        <div ref="listRef" class="tb-grid" v-if="tab === 'manga'">
          <div v-for="item in list" :key="item.collectId" class="tb-card" @click="goManga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)">
            <t-cover class="tb-card-cover" variant="B" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" fit="cover" />
            <div class="tb-card-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div ref="listRef" class="tb-chapter-list" v-else>
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
      <list-skeleton v-if="loading" />
    </div>

    <media-pager v-if="!loading" :page="page" :page-size="pageSize" :count="count" :page-size-config="pageSizes" @page-change="pageChange" />

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
const listRef = ref<HTMLElement | null>(null)
const orderBy = computed(() => (tab.value === 'manga' ? userConfig.order : userConfig.chapterOrder))

const { goRead } = useGoRead()
const { page, pageSize, list, count, loading, pageSizes, pageChange } = useListPage<any>({
  kind: computed(() => (tab.value === 'manga' ? 'manga' : 'chapter')),
  container: listRef,
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
.tb-page{max-width:98rem;margin:0 auto}
.tb-page-head{margin-bottom:1.8rem}
.tb-page-head h1{font-size:2rem;font-weight:700;margin:0;color:#1f2937}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:1.6rem}
.tb-card{cursor:pointer;display:flex;flex-direction:column;transition:transform .2s}.tb-card:hover{transform:translateY(-0.3rem)}
.tb-card-cover{width:100%;aspect-ratio:3/4;height:auto;flex-shrink:0;border-radius:1.4rem;overflow:hidden;box-shadow:0 0.4rem 1.6rem rgba(0,0,0,0.08);margin-bottom:0.8rem}
.tb-card-name{font-size:1.3rem;font-weight:500;color:#1f2937;line-height:1.35;max-height:calc(1.3rem * 1.35 * 2);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;text-overflow:ellipsis;word-break:break-word;overflow-wrap:anywhere}
.tb-chapter-list{display:flex;flex-direction:column;gap:1rem;margin-bottom:1.8rem}
.tb-empty{text-align:center;padding:6rem;color:#6b7280;grid-column:1/-1}
</style>
