<template>
  <div class="ta-collect">
    <div class="ta-page-head"><h1>收藏</h1></div>

    <t-tabs-switcher
      v-model="tab"
      variant="A"
      :tabs="[
        { label: '漫画', value: 'manga', count },
        { label: '章节', value: 'chapter', count }
      ]"
    />

    <div class="touch-dom">
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="ta-grid" v-if="tab === 'manga'">
          <div
            v-for="item in list"
            :key="item.collectId"
            class="ta-grid-card"
            @click="goManga(item)"
            @contextmenu="openThemeContextMenu($event, 'manga', item)"
          >
            <t-cover class="ta-grid-cover" variant="A" :seed="Number(item?.mangaId || 0)" :file="item?.mangaCover || ''" fit="cover" />
            <div class="ta-grid-name">{{ item.mangaName }}</div>
          </div>
        </div>

        <div class="ta-chapter-list" v-else>
          <t-chapter-item
            v-for="item in list"
            :key="item.collectId"
            :item="item"
            variant="A"
            @click="goRead(item)"
            @contextmenu="openThemeContextMenu($event, 'chapter', item)"
          />
        </div>
      </template>
    </div>

    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="pageChange" />

    <div v-if="!loading && list.length === 0" class="ta-empty">暂无收藏</div>
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

<style scoped lang="less">
.ta-collect {
  max-width: 98rem;
  margin: 0 auto;
}

.ta-page-head {
  margin-bottom: 1.6rem;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.8rem;
  row-gap: 4.8rem;
  margin-bottom: 1.8rem;
}

.ta-grid-card {
  cursor: pointer;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-0.2rem);
  }
}

.ta-grid-cover {
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.8rem;
  background: #f3f4f6;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.06);
}

.ta-grid-name {
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-chapter-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.ta-empty {
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
}

@media (max-width: 76.8rem) {
  .ta-collect { padding: 0 0.4rem; }
  .ta-grid { grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
}

@media (max-width: 48rem) {
  .ta-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
}
</style>