<template>
  <div class="tb-page tb-manga-list">
    <div class="tb-toolbar">
      <div class="tb-toolbar-title">
        <h1>{{ mediaName || '漫画列表' }}</h1>
        <span v-if="total > 0" class="tb-count-badge">{{ total }}</span>
        <button
          class="tb-filter-toggle"
          :class="{ 'is-open': filterOpen, 'has-filter': hasActiveFilter }"
          type="button"
          :aria-expanded="filterOpen"
          aria-controls="tb-filter-panel"
          :title="filterOpen ? '收起筛选' : '打开筛选'"
          @click="filterOpen = !filterOpen"
        >
          <span class="tb-filter-toggle-icon" aria-hidden="true">🔎</span>
          <span class="tb-filter-toggle-label">筛选</span>
          <span v-if="hasActiveFilter" class="tb-filter-dot" aria-hidden="true"></span>
        </button>
      </div>

      <transition name="tb-filter-slide">
        <div
          v-show="filterOpen"
          id="tb-filter-panel"
          class="tb-toolbar-controls"
        >
          <div class="tb-search" :class="{ 'is-active': keyword }">
            <span class="tb-search-icon" aria-hidden="true">🔍</span>
            <input
              v-model="keyword"
              class="tb-search-input"
              :placeholder="`搜索${mediaName || '漫画'}...`"
              @keydown.enter="loadData"
            />
            <button
              v-if="keyword"
              class="tb-search-clear"
              title="清空"
              aria-label="清空搜索"
              @click="clearKeyword"
            >×</button>
            <button
              class="tb-search-submit"
              title="搜索"
              aria-label="搜索"
              @click="loadData"
            >搜索</button>
          </div>

          <div class="tb-sort-chips" role="tablist" aria-label="排序方式">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="tb-sort-chip"
              :class="{ active: order === opt.value }"
              role="tab"
              :aria-selected="order === opt.value"
              @click="setOrder(opt.value)"
            >
              <span class="tb-sort-chip-icon" aria-hidden="true">{{ opt.icon }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div class="tb-grid">
      <t-manga-card
        v-for="m in list"
        :key="m.mangaId"
        :item="m"
        variant="B"
        :meta="`${m.chapterCount || 0} 章节`"
        @click="goMangaInfo(m)"
        @contextmenu="openThemeContextMenu($event, 'manga', m)"
      />
    </div>

    <div v-if="list.length === 0 && !loading" class="tb-empty">暂无漫画</div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="tb-pagination">
      <button :disabled="page <= 1" @click="page--; loadData()">◀</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadData()">▶</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import queue from '@/store/quque'
import imageApi from '@/api/image'
import TMangaCard from '@/themes/components/manga-card.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import useBrowseStore from '@/store/browse'

const router = useRouter()
const route = useRoute()
const browse = useBrowseStore()

const list = ref<any[]>([])
const keyword = ref('')
const order = ref('updateTimeDesc')
const page = ref(browse.mangaListPage)
const pageSize = computed(() => browse.mangaListPageSize)
const total = ref(0)
const loading = ref(false)
const mediaName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 排序选项 - 视觉化 chips
const sortOptions = [
  { value: 'updateTimeDesc', label: '最近更新', icon: '🕒' },
  { value: 'createTimeDesc', label: '最近添加', icon: '✨' },
  { value: 'name', label: 'A → Z', icon: '⇅' },
  { value: 'nameDesc', label: 'Z → A', icon: '⇵' },
]

// 筛选面板展开状态(所有视图默认收起)
const filterOpen = ref(false)

// 是否存在非默认筛选(激活小圆点提示)
const hasActiveFilter = computed(() => {
  return !!keyword.value || order.value !== 'updateTimeDesc'
})

function clearKeyword() {
  keyword.value = ''
  loadData()
}

function setOrder(v: string) {
  order.value = v
  page.value = 1
  loadData()
}

watch(() => route.params.mediaId, () => {
  page.value = browse.mangaListPage
  keyword.value = ''
  order.value = 'updateTimeDesc'
  loadData()
}, { immediate: true })

async function loadData() {
  const mediaId = Number(route.params.mediaId) || 0
  loading.value = true
  try {
    const res = await mangaApi.get(mediaId, page.value, pageSize.value, order.value, keyword.value)
    list.value = res?.list || res?.data?.list || []
    total.value = res?.count || res?.data?.count || 0
    mediaName.value = res?.mediaName || res?.data?.mediaName || mediaName.value
    browse.mangaListPage = page.value
    browse.mangaListPageSizeCache = pageSize.value

    // 加载封面图片
    list.value.forEach(async (item) => {
      queue.mangaQueue.add(() => get_poster(item))
    })
  } catch (e) { /* empty */ }
  loading.value = false
}

function goMangaInfo(m: any) {
  router.push(`/t/manga/${m.mangaId}`)
}

async function get_poster(item: any) {
  item.blob = await imageApi.get({ file: item.mangaCover })
}
</script>

<style scoped>
/* ============ 工具条(标题 + 筛选按钮 + 可折叠面板) ============ */
.tb-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0 0 1.4rem;
  margin-bottom: 1.6rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.tb-toolbar-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.tb-toolbar-title h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tb-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.9rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 999px;
  flex-shrink: 0;
}

/* 筛选切换按钮 */
.tb-filter-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.tb-filter-toggle:hover {
  background: rgba(255, 255, 255, 1);
  color: #1f2937;
}

.tb-filter-toggle.is-open {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.3);
}

.tb-filter-toggle-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.tb-filter-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.4rem;
  width: 0.7rem;
  height: 0.7rem;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

/* 面板过渡 */
.tb-filter-slide-enter-active,
.tb-filter-slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease, margin-top 0.25s ease;
  overflow: hidden;
}
.tb-filter-slide-enter-from,
.tb-filter-slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: -0.4rem;
}
.tb-filter-slide-enter-to,
.tb-filter-slide-leave-from {
  max-height: 30rem;
  opacity: 1;
}

.tb-toolbar-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 搜索胶囊 */
.tb-search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.4rem 0.4rem 1.2rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.tb-search:focus-within,
.tb-search.is-active {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.tb-search-icon {
  font-size: 1.4rem;
  color: #6b7280;
  flex-shrink: 0;
}

.tb-search-input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0;
  font-size: 1.4rem;
  border: none;
  outline: none;
  background: transparent;
  color: #1f2937;
}

.tb-search-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.tb-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: #6b7280;
  background: rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s;
}

.tb-search-clear:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #1f2937;
}

.tb-search-submit {
  padding: 0.7rem 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.1s;
}

.tb-search-submit:hover {
  background: #1d4ed8;
}
.tb-search-submit:active {
  transform: scale(0.96);
}

/* 排序 chips */
.tb-sort-chips {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.2rem;
  margin: 0 -0.2rem;
}
.tb-sort-chips::-webkit-scrollbar { display: none; }

.tb-sort-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.tb-sort-chip:hover {
  background: #fff;
  color: #1f2937;
}

.tb-sort-chip.active {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.tb-sort-chip-icon {
  font-size: 1.3rem;
  line-height: 1;
}

/* ============ 网格与分页 ============ */
.tb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  column-gap: 1.6rem;
  row-gap: 1.2rem;
}

.tb-empty {
  text-align: center;
  padding: 6rem;
  color: #6b7280;
}

.tb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-top: 3.2rem;
  padding: 1.6rem;
}

.tb-pagination button {
  padding: 0.8rem 1.6rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2rem;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.05);
}

.tb-pagination button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.1);
}

.tb-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tb-pagination span {
  color: #6b7280;
  font-size: 1.3rem;
}

/* 响应式适配 */
@media (max-width: 76.8rem) {
  .tb-toolbar-title h1 {
    font-size: 1.7rem;
  }
  .tb-search-input {
    font-size: 1.5rem; /* 移动端防 iOS 缩放 */
  }
  .tb-grid {
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1.2rem;
    row-gap: 1rem;
  }
}

@media (max-width: 48rem) {
  .tb-grid {
    grid-template-columns: repeat(3, 1fr);
    column-gap: 0.8rem;
    row-gap: 0.8rem;
  }
}
</style>
