<template>
  <div class="td-manga-list">
    <!-- 顶部工具条:标题 + 筛选按钮 -->
    <div class="td-toolbar">
      <div class="td-toolbar-head">
        <h2 class="td-page-title">{{ mediaName || '漫画列表' }}</h2>
        <div class="td-count-badge" v-if="total > 0">{{ total }}</div>
        <button
          class="td-filter-toggle"
          :class="{ 'is-open': filterOpen, 'has-active': hasActiveFilter }"
          @click="filterOpen = !filterOpen"
          type="button"
          aria-label="筛选"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>筛选</span>
          <span class="td-filter-dot" v-if="hasActiveFilter"></span>
        </button>
      </div>

      <transition name="td-filter-slide">
        <div class="td-filter-panel" v-show="filterOpen">
          <!-- 搜索胶囊 -->
          <div class="td-search">
            <svg class="td-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              class="td-search-input"
              type="text"
              v-model="keyword"
              placeholder="搜索漫画名称"
              @keydown.enter="onSearch"
            />
            <button v-if="keyword" class="td-search-clear" @click="clearKeyword" type="button" aria-label="清空">×</button>
          </div>

          <!-- 排序 chips -->
          <div class="td-sort-chips">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="td-sort-chip"
              :class="{ 'is-active': order === opt.value }"
              type="button"
              @click="setOrder(opt.value)"
            >{{ opt.label }}</button>
          </div>
        </div>
      </transition>
    </div>

    <div class="td-card-grid">
      <div class="td-card" v-for="m in list" :key="m.mangaId" v-long-press="() => openThemeActionSheet('manga', m)" @click="router.push(`/t/manga/${m.mangaId}`)" @contextmenu="openThemeContextMenu($event, 'manga', m)">
        <div class="td-card-cover"><img :src="m.poster || '/favicon.ico'" /></div>
        <div class="td-card-body">
          <div class="td-card-title">{{ m.mangaName }}</div>
          <div class="td-card-sub">{{ m.chapterCount || 0 }} 章</div>
        </div>
      </div>
    </div>
    <div class="td-empty" v-if="!list.length">暂无数据</div>
    <div class="td-pagination" v-if="total > pageSize">
      <button :disabled="page<=1" @click="page--;loadData()">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total/pageSize) }}</span>
      <button :disabled="page>=Math.ceil(total/pageSize)" @click="page++;loadData()">下一页</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
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
const keyword = ref('')

// order 桥接全局 userConfig.order,以保留原来的联动
const order = computed<string>({
  get: () => (userConfig.order as string) || 'updateTimeDesc',
  set: (v: string) => {(userConfig as any).order = v }
})

const sortOptions = [
  { label: '最近更新', value: 'updateTimeDesc' },
  { label: '最早更新', value: 'updateTimeAsc' },
  { label: '名称正序', value: 'nameAsc' },
  { label: '名称倒序', value: 'nameDesc' },
  { label: 'ID 正序', value: 'id' },
]

const filterOpen = ref(false)
const hasActiveFilter = computed(() => {
  return keyword.value.trim().length > 0 || order.value !== 'updateTimeDesc'
})

function clearKeyword() {
  keyword.value = ''
  onSearch()
}

function onSearch() {
  page.value = 1
loadData()
}

function setOrder(v: string) {
  order.value = v
  page.value = 1
  loadData()
}

async function loadData() {
  try {
    const mediaId = Number(route.params.mediaId) || 0
    const r = await mangaApi.get(mediaId, page.value, pageSize, order.value, keyword.value)
    list.value = r?.list || r?.data?.list || []
    total.value = r?.count || r?.data?.total || 0
    mediaName.value = r?.mediaName || r?.data?.mediaName || ''
    list.value.forEach((item: any) => {
      queue.mangaQueue.add(async () => {
        item.poster = await imageApi.get({ file: item.mangaCover })
      })
    })
  } catch {}
}

watch(() => route.params.mediaId, () => {
  page.value = 1
  keyword.value = ''
  loadData()
}, { immediate: true })
</script>

<style scoped>
.td-manga-list { margin: 0 auto; }

/* 顶部工具条 */
.td-toolbar { padding: 0 0 1.6rem; margin-bottom: 1.6rem; border-bottom: 1px solid var(--border); }
.td-toolbar-head { display: flex; align-items: center; gap: 1rem; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin: 0; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-count-badge { flex: none; font-size: 1.2rem; padding: 0.2rem 0.8rem; border-radius: 1rem; background: var(--bg2); color: var(--fg2); border: 1px solid var(--border); }

/* 筛选按钮 */
.td-filter-toggle { flex: none; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; font-size: 1.3rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); border-radius: 999px; cursor: pointer; transition: all .2s; position: relative; }
.td-filter-toggle:hover { border-color: var(--accent); color: var(--accent); }
.td-filter-toggle.is-open { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.td-filter-dot { position: absolute; top: 0.3rem; right: 0.4rem; width: 0.6rem; height: 0.6rem; border-radius: 50%; background: #ef4444; }

/* 折叠面板 */
.td-filter-panel { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.2rem; }
.td-filter-slide-enter-active, .td-filter-slide-leave-active { transition: max-height .28s ease, opacity .2s ease, margin-top .28s ease; overflow: hidden; }
.td-filter-slide-enter-from, .td-filter-slide-leave-to { max-height: 0; opacity: 0; margin-top: 0; }
.td-filter-slide-enter-to, .td-filter-slide-leave-from { max-height: 30rem; opacity: 1; margin-top: 1.2rem; }

/* 搜索胶囊 */
.td-search { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 1rem; border: 1px solid var(--border); background: var(--bg2); border-radius: 999px; transition: border-color .2s; }
.td-search:focus-within { border-color: var(--accent); }
.td-search-icon { color: var(--fg2); flex: none; }
.td-search-input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 1.3rem; color: var(--fg); }
.td-search-input::placeholder { color: var(--fg2); }
.td-search-clear { flex: none; border: none; background: transparent; color: var(--fg2); font-size: 1.8rem; line-height: 1; cursor: pointer; padding: 0 0.2rem; }
.td-search-clear:hover { color: var(--fg); }

/* 排序 chips */
.td-sort-chips { display: flex; flex-wrap: nowrap; gap: 0.6rem; overflow-x: auto; scrollbar-width: none; }
.td-sort-chips::-webkit-scrollbar { display: none; }
.td-sort-chip { flex: none; padding: 0.4rem 1rem; font-size: 1.2rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg2); border-radius: 999px; cursor: pointer; transition: all .2s; white-space: nowrap; }
.td-sort-chip:hover { border-color: var(--accent); color: var(--accent); }
.td-sort-chip.is-active { background: var(--accent); border-color: var(--accent); color: #fff; }

/* 卡片区 */
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.6rem; }
.td-card { position: relative; background: var(--bg2); border-radius: 1rem; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-0.2rem); box-shadow: 0 0.4rem 1.2rem rgba(0,0,0,0.06); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.td-card-body { padding: 0.8rem 1rem; }
.td-card-title { font-size: 1.3rem; font-weight: 500; color: var(--fg); line-height: 1.35; max-height: calc(1.3rem * 1.35 * 2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; text-overflow: ellipsis; word-break: break-word; overflow-wrap: anywhere; }
.td-card-sub { font-size: 1.1rem; color: var(--fg2); margin-top: 0.2rem; }

.td-empty { text-align: center; color: var(--fg2); padding: 4rem 0; font-size: 1.3rem; }

.td-pagination { display: flex; align-items: center; justify-content: center; gap: 1.6rem; margin-top: 2.4rem; }
.td-pagination button { padding: 0.6rem 1.6rem; border-radius: 0.6rem; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); cursor: pointer; }
.td-pagination button:disabled { opacity: 0.4; cursor: default; }
.td-pagination button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

/* 响应式适配 */
@media (max-width: 76.8rem) {
  .td-card-grid { grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
  .td-card-title { font-size: 1.2rem; }
  .td-page-title { font-size: 1.8rem; }
  .td-search-input { font-size: 1.5rem; }
}

@media (max-width: 48rem) {
  .td-card-grid { grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
  .td-toolbar-head { gap: 0.6rem; }
  .td-filter-toggle span:not(.td-filter-dot) { display: none; }
  .td-filter-toggle { padding: 0.5rem 0.8rem; }
}
</style>