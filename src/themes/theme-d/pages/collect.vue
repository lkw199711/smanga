<template>
  <div class="td-collect">
    <h2 class="td-page-title">收藏</h2>

    <t-tabs-switcher v-model="tab" variant="D" :tabs="[{label:'漫画',value:'manga',count},{label:'章节',value:'chapter',count}]" />

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="td-card-grid" v-if="tab === 'manga'">
          <div class="td-card" v-for="item in list" :key="item.collectId" @click="goManga(item)" @contextmenu="openThemeContextMenu($event, 'manga', item)">
            <t-cover class="td-card-cover" variant="D" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" fit="cover" />
            <div class="td-card-title">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="td-chapter-list" v-else>
          <t-chapter-item
            v-for="item in list"
            :key="item.collectId"
            :item="item"
            variant="D"
            :title="item.mangaName || '未知漫画'"
            :sub="item.chapterName || '未知章节'"
            @click="goRead(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="pageChange" />

    <p class="td-empty" v-if="!loading && !list.length">暂无收藏</p>
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
.td-collect { max-width: 120rem; margin: 0 auto; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.6rem; }
.td-card { display: flex; flex-direction: column; background: var(--bg2); border-radius: 1rem; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-0.2rem); box-shadow: 0 0.4rem 1.2rem rgba(0,0,0,0.06); }
.td-card-cover { width: 100%; aspect-ratio: 3/4; height: auto; flex-shrink: 0; overflow: hidden; border-radius: 0.8rem 0.8rem 0 0; }
.td-card-title { padding: 0.8rem 1rem; font-size: 1.3rem; font-weight: 500; color: var(--fg); line-height: 1.35; max-height: calc(1.3rem * 1.35 * 2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: anywhere; }
.td-chapter-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.8rem; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 4rem; }
</style>