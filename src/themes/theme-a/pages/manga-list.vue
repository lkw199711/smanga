<template>
  <div class="ta-manga-list">
    <div class="ta-toolbar">
      <div class="ta-toolbar-title">
        <h1>{{ mediaName || '漫画列表' }}</h1>
        <span v-if="total > 0" class="ta-count-badge">{{ total }}</span>
        <button
          class="ta-filter-toggle"
          :class="{ 'is-open': filterOpen, 'has-filter': hasActiveFilter }"
          type="button"
          :aria-expanded="filterOpen"
          aria-controls="ta-filter-panel"
          :title="filterOpen ? '收起筛选' : '打开筛选'"
          @click="filterOpen = !filterOpen"
        >
          <span class="ta-filter-toggle-icon" aria-hidden="true">🔎</span>
          <span class="ta-filter-toggle-label">筛选</span>
          <span v-if="hasActiveFilter" class="ta-filter-dot" aria-hidden="true"></span>
        </button>
      </div>

      <transition name="ta-filter-slide">
        <div
          v-show="filterOpen"
          id="ta-filter-panel"
          class="ta-toolbar-controls"
        >
          <div class="ta-search" :class="{ 'is-active': keyword }">
            <span class="ta-search-icon" aria-hidden="true">🔍</span>
            <input
              v-model="keyword"
              class="ta-search-input"
              :placeholder="`搜索${mediaName || '漫画'}...`"
              @keydown.enter="loadData"
            />
            <button
              v-if="keyword"
              class="ta-search-clear"
              title="清空"
              aria-label="清空搜索"
              @click="clearKeyword"
            >×</button>
            <button
              class="ta-search-submit"
              title="搜索"
              aria-label="搜索"
              @click="loadData"
            >搜索</button>
          </div>

          <div class="ta-sort-chips" role="tablist" aria-label="排序方式">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="ta-sort-chip"
              :class="{ active: order === opt.value }"
              role="tab"
              :aria-selected="order === opt.value"
              @click="order = opt.value"
            >
              <span class="ta-sort-chip-icon" aria-hidden="true">{{ opt.icon }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
    <div class="ta-grid">
      <div v-for="m in list" :key="m.mangaId" class="ta-manga-card" v-long-press="() => openThemeActionSheet('manga', m)" @click="goMangaInfo(m)" @contextmenu.prevent="openThemeContextMenu($event, 'manga', m)">
        <div class="ta-manga-cover">
          <img v-if="m.blob" :src="m.blob" alt="" />
          <div v-else class="ta-cover-placeholder">📚</div>
        </div>
        <div class="ta-manga-name">{{ m.mangaName }}</div>
        <div class="ta-manga-meta">{{ m.chapterCount || 0 }} 章节</div>
      </div>
    </div>
    <div v-if="list.length === 0 && !loading" class="ta-empty">暂无漫画</div>
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="ta-pagination">
      <button :disabled="page <= 1" @click="page--; loadData()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadData()">下一页</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import imageApi from '@/api/image'
import queue from '@/store/quque'
import { userConfig } from '@/store'
import { openThemeActionSheet, openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()
const route = useRoute()

const list = ref<any[]>([])
const keyword = ref('')
const order = computed({ get: () => userConfig.order, set: (v) => { userConfig.order = v } })
const page = ref(1)
const pageSize = 32
const total = ref(0)
const loading = ref(false)
const mediaName = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 排序选项 - 使用视觉化 chips 替代原生 select
const sortOptions = [
  { value: 'updateTimeDesc', label: '最近更新', icon: '🕒' },
  { value: 'createTimeDesc', label: '最近添加', icon: '✨' },
  { value: 'name', label: 'A → Z', icon: '⇅' },
  { value: 'nameDesc', label: 'Z → A', icon: '⇵' },
]

function clearKeyword() {
  keyword.value = ''
  loadData()
}

// 筛选面板展开状态(所有视图默认收起,PC 顶栏已提供搜索/排序)
const filterOpen = ref(false)

// 是否存在非默认筛选(用于筛选按钮显示激活小圆点)
const hasActiveFilter = computed(() => {
  return !!keyword.value || order.value !== 'updateTimeDesc'
})

watch(() => route.params.mediaId, () => {
  page.value = 1
  keyword.value = ''
  loadData()
}, { immediate: true })

// 监听全局排序变化
watch(() => userConfig.order, () => {
  page.value = 1
  loadData()
})

async function loadData() {
  const mediaId = Number(route.params.mediaId) || 0
  loading.value = true
  try {
    const res = await mangaApi.get(mediaId, page.value, pageSize, order.value, keyword.value)
    list.value = res?.list || res?.data?.list || []
    total.value = res?.count || res?.data?.count || 0
    mediaName.value = res?.mediaName || res?.data?.mediaName || mediaName.value
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
	item.blob = await imageApi.get({file: item.mangaCover});
}
</script>

<style scoped>
/* ============ 新工具条(标题 + 搜索胶囊 + 排序 chips) ============ */
.ta-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0 0 1.4rem;
  margin-bottom: 1.6rem;
  border-bottom: 1px solid #eef0f3;
}

.ta-toolbar-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.ta-toolbar-title h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ta-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.9rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  flex-shrink: 0;
}

/* 筛选切换按钮 */
.ta-filter-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #4b5563;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ta-filter-toggle:hover {
  background: #e5e7eb;
  color: #111827;
}

.ta-filter-toggle.is-open {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.ta-filter-toggle-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.ta-filter-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.4rem;
  width: 0.7rem;
  height: 0.7rem;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

/* 面板过渡:高度 + 透明度 */
.ta-filter-slide-enter-active,
.ta-filter-slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease, margin-top 0.25s ease;
  overflow: hidden;
}

.ta-filter-slide-enter-from,
.ta-filter-slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: -0.4rem;
}

.ta-filter-slide-enter-to,
.ta-filter-slide-leave-from {
  max-height: 30rem;
  opacity: 1;
}

.ta-toolbar-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 搜索胶囊 */
.ta-search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.4rem 0.4rem 1.2rem;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.ta-search:focus-within,
.ta-search.is-active {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.ta-search-icon {
  font-size: 1.4rem;
  color: #6b7280;
  flex-shrink: 0;
}

.ta-search-input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0;
  font-size: 1.4rem;
  border: none;
  outline: none;
  background: transparent;
  color: #111827;
}

.ta-search-input::placeholder {
  color: #9ca3af;
}

.ta-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: #6b7280;
  background: #e5e7eb;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s;
}

.ta-search-clear:hover {
  background: #d1d5db;
  color: #111827;
}

.ta-search-submit {
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

.ta-search-submit:hover {
  background: #1d4ed8;
}

.ta-search-submit:active {
  transform: scale(0.96);
}

/* 排序 chips */
.ta-sort-chips {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.2rem;
  margin: 0 -0.2rem;
}

.ta-sort-chips::-webkit-scrollbar {
  display: none;
}

.ta-sort-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ta-sort-chip:hover {
  background: #e5e7eb;
  color: #111827;
}

.ta-sort-chip.active {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.ta-sort-chip-icon {
  font-size: 1.3rem;
  line-height: 1;
}

/* ============ 旧 head 样式(保留兼容,不再使用) ============ */
.ta-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.4rem;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.ta-page-head h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.ta-head-actions {
  display: flex;
  gap: 0.8rem;
}

.ta-input {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  outline: none;
  background: #fff;
  box-sizing: border-box;
  min-width: 0;
}

.ta-select {
  padding: 0.7rem 1.2rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  min-width: 0;
}

.ta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.8rem;
  row-gap: .8rem;
  min-width: 0;
}

.ta-manga-card {
	position: relative;
  cursor: pointer;
  transition: transform 0.15s;
  min-width: 0;
}


.ta-manga-card:hover {
  transform: translateY(-0.2rem);
}

.ta-manga-cover {
  aspect-ratio: 3 / 4;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.8rem;
  background: #f3f4f6;
  box-shadow: 0 0.2rem 0.8rem rgba(0,0,0,0.06);
}

.ta-manga-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ta-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.ta-manga-name {
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.35;
  max-height: calc(1.3rem * 1.35 * 2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.ta-manga-meta {
  font-size: 1.1rem;
  color: #9ca3af;
  margin-top: 0.2rem;
}

.ta-empty {
  text-align: center;
  padding: 6rem;
  color: #9ca3af;
}

.ta-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-top: 3.2rem;
  padding: 1.6rem;
}

.ta-pagination button {
  padding: 0.6rem 1.4rem;
  font-size: 1.3rem;
  border: 1px solid #eaeaea;
  border-radius: 0.6rem;
  background: #fff;
  cursor: pointer;
}

.ta-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ta-pagination span {
  font-size: 1.3rem;
  color: #6b7280;
}

/* 响应式适配 */
@media (max-width: 76.8rem) {
  .ta-toolbar {
    padding: 0 0 1.2rem;
    margin-bottom: 1.2rem;
  }

  .ta-toolbar-title h1 {
    font-size: 1.7rem;
  }

  .ta-search-input {
    font-size: 1.5rem; /* 移动端 >=16px 防止 iOS 输入自动缩放 */
  }

  .ta-page-head {
    flex-direction: column;
    align-items: stretch;
    gap: 1.2rem;
  }

  .ta-head-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .ta-input,
  .ta-select {
    width: 100%;
  }

  .ta-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  .ta-manga-name {
    font-size: 1.2rem;
  }
}

@media (max-width: 48rem) {
  .ta-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }
}
</style>
