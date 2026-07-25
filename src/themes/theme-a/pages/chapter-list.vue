<template>
  <div class="ta-chapter-list">
    <div class="ta-page-head">
      <div class="ta-head-left">
        <button class="ta-btn-back" @click="router.back()">← 返回</button>
        <h1>{{ mangaName || '章节列表' }}</h1>
      </div>
      <div class="ta-head-actions">
        <select v-model="order" class="ta-select">
          <option value="number">序号正序</option>
          <option value="numberDesc">序号倒序</option>
          <option value="name">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
        </select>
      </div>
    </div>
    <div class="ta-chapters">
      <t-chapter-item
        v-for="(ch, idx) in list"
        :key="ch.chapterId"
        :item="ch"
        variant="A"
        @click="goRead(ch, idx)"
        @contextmenu="openThemeContextMenu($event, 'chapter', ch)"
      />
    </div>
    <div v-if="!loading && list.length === 0" class="ta-empty">暂无章节</div>
    <media-pager :page="page" :count="count" :page-size-config="pageSizes" @page-change="pageChange" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import chapterApi from '@/api/chapter'
import mangaApi from '@/api/manga'
import { globalData, userConfig } from '@/store'
import MediaPager from '@/components/media-pager.vue'
import TChapterItem from '@/themes/components/chapter-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage } from '@/themes/composables'

const router = useRouter()
const route = useRoute()

const mangaId = computed(() => Number(route.params.mangaId) || 0)
const order = computed({ get: () => userConfig.chapterOrder, set: (v) => { userConfig.chapterOrder = v } })
const mangaName = ref('')

const { page, list, count, loading, pageSizes, pageChange } = useListPage<any>({
  kind: 'chapter',
  resetDeps: [() => order.value],
  loader: async ({ page, pageSize }) => {
    if (!mangaId.value) return { list: [], count: 0 }
    const res = await chapterApi.get({ mangaId: mangaId.value, page, pageSize, order: order.value })
    return { list: res?.list || [], count: Number(res?.count || 0) }
  },
})

onMounted(async () => {
  if (!mangaId.value) return
  try {
    const info = await mangaApi.get_manga_info(mangaId.value)
    mangaName.value = info?.mangaName || ''
  } catch { /* empty */ }
})

function goRead(ch: any, idx: number) {
  globalData.chapterList = list.value
  globalData.chapterIndex = idx
  globalData.chapterName = ch.chapterName || ''
  globalData.mangaName = mangaName.value || globalData.mangaName
  router.push(`/t/reader/${ch.chapterId}`)
}
</script>

<style scoped>
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.4rem; }
.ta-head-left { display: flex; align-items: center; gap: 1.2rem; }
.ta-head-left h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-btn-back { padding: 0.6rem 1.2rem; font-size: 1.3rem; border: 1px solid #eaeaea; border-radius: 0.6rem; background: #fff; cursor: pointer; }
.ta-select { padding: 0.7rem 1.2rem; font-size: 1.3rem; border: 1px solid #eaeaea; border-radius: 0.8rem; background: #fff; }
.ta-chapters { display: grid; grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr)); gap: 1.2rem; }
.ta-empty { text-align: center; padding: 6rem; color: #9ca3af; }
</style>