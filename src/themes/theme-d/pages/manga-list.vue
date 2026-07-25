<template>
  <div class="td-manga-list">
    <h2 class="td-page-title">{{ mediaName || '漫画列表' }}</h2>
    <div class="td-card-grid">
      <div class="td-card" v-for="m in list" :key="m.mangaId" v-long-press="() => openThemeActionSheet('manga', m)" @click="router.push(`/t/manga/${m.mangaId}`)" @contextmenu="openThemeContextMenu($event, 'manga', m)">
        <div class="td-card-cover"><img :src="m.poster || '/favicon.ico'" /></div>
        <div class="td-card-body">
          <div class="td-card-title">{{ m.mangaName }}</div>
          <div class="td-card-sub">{{ m.chapterCount || 0 }} 章</div>
        </div>
      </div>
    </div>
    <div class="td-pagination" v-if="total > pageSize">
      <button :disabled="page<=1" @click="page--;loadData()">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total/pageSize) }}</span>
      <button :disabled="page>=Math.ceil(total/pageSize)" @click="page++;loadData()">下一页</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import queue from '@/store/quque'
import { userConfig } from '@/store'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

const route = useRoute()
const router = useRouter()
const list = ref<any[]>([])
const mediaName = ref('')
const page = ref(1)
const pageSize = 30
const total = ref(0)

async function loadData() {
  try {
    const mediaId = Number(route.params.mediaId) || 0
    const r = await mangaApi.get(mediaId, page.value, pageSize, userConfig.order)
    list.value = r?.list || r?.data?.list || []
    total.value = r?.count || r?.data?.total || 0
    mediaName.value = r?.mediaName || r?.data?.mediaName || ''
    // 加载封面
    list.value.forEach((item: any) => {
      queue.mangaQueue.add(async () => {
        item.poster = await imageApi.get({ file: item.mangaCover })
      })
    })
  } catch {}
}
watch(() => route.params.mediaId, () => {
  page.value = 1
  loadData()
}, { immediate: true })
watch(() => userConfig.order, () => {
  page.value = 1
  loadData()
})
</script>

<style scoped>
.td-manga-list { margin: 0 auto; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.6rem; }
.td-card { position: relative; background: var(--bg2); border-radius: 1rem; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-0.2rem); box-shadow: 0 0.4rem 1.2rem rgba(0,0,0,0.06); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.td-card-body { padding: 0.8rem 1rem; }
.td-card-title { font-size: 1.3rem; font-weight: 500; color: var(--fg); line-height: 1.35; max-height: calc(1.3rem * 1.35 * 2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: anywhere; }
.td-card-sub { font-size: 1.1rem; color: var(--fg2); margin-top: 0.2rem; }
.td-pagination { display: flex; align-items: center; justify-content: center; gap: 1.6rem; margin-top: 2.4rem; }
.td-pagination button { padding: 0.6rem 1.6rem; border-radius: 0.6rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); cursor: pointer; }
.td-pagination button:disabled { opacity: 0.4; cursor: default; }
.td-pagination button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
</style>
