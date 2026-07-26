<template>
  <transition name="lcp-fade">
    <div v-if="visible" class="lcp-mask" @click.self="close" @contextmenu.stop.prevent>
      <transition :name="isMobile ? 'lcp-slide-up' : 'lcp-zoom'" appear>
        <div v-if="visible" class="lcp-sheet" :class="{ 'is-mobile': isMobile }">
          <!-- 顶部拖动条 -->
          <div class="lcp-handle" />

          <!-- 标题 -->
          <div class="lcp-title" :title="browse.currentChapter?.chapterName">
            {{ browse.currentChapter?.chapterName || $t('sidebar.rightMenu') }}
          </div>

          <!-- 跳转宫格 -->
          <div class="lcp-section-label">{{ $t('sidebar.mediaList') }} · {{ $t('sidebar.mangaInfo') }}</div>
          <div class="lcp-grid">
            <button type="button" class="lcp-grid-item" @click="run('home')">
              <i class="iconfont icon-home" />
              <span>Smanga</span>
            </button>
            <button type="button" class="lcp-grid-item" @click="run('media')">
              <i class="iconfont icon-folder" />
              <span>{{ $t('sidebar.mediaList') }}</span>
            </button>
            <button type="button" class="lcp-grid-item" :disabled="!mediaId" @click="run('manga-list')">
              <i class="iconfont icon-menu" />
              <span>{{ $t('sidebar.mangaList') }}</span>
            </button>
            <button type="button" class="lcp-grid-item" :disabled="!mangaId" @click="run('manga-info')">
              <i class="iconfont icon-info" />
              <span>{{ $t('sidebar.mangaInfo') }}</span>
            </button>
            <button type="button" class="lcp-grid-item" @click="openChapterList">
              <i class="iconfont icon-menu" />
              <span>{{ $t('sidebar.chapterList') || '章节' }}</span>
            </button>
            <button
              type="button"
              class="lcp-grid-item"
              :class="{ 'is-active': browse.bookmarkShow }"
              @click="toggleBookmark"
            >
              <i class="iconfont icon-star" />
              <span>{{ bookmarkTitle }}</span>
            </button>
            <button type="button" class="lcp-grid-item" @click="openRightMenu">
              <i class="iconfont icon-more" />
              <span>{{ $t('sidebar.rightMenu') }}</span>
            </button>
          </div>

          <!-- 阅读模式 -->
          <div class="lcp-section-label">{{ $t('browse.model') }}</div>
          <div class="lcp-chip-row">
         <button
              v-for="mode in modes"
              :key="mode.key"
              type="button"
              class="lcp-chip"
              :class="{ 'is-active': mode.key === currentMode }"
              @click="changeMode(mode.key)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { config } from '@/store'
import i18n from '@/i18n'
import useBrowseStore from '@/store/browse'

const route = useRoute()
const router = useRouter()
const browse = useBrowseStore()
const { t } = i18n.global

// 面板可见状态: 与 config.controlPanel 双向同步
const visible = ref(!!(config as any).controlPanel)
watch(() => (config as any).controlPanel, (val) => { visible.value = !!val })
watch(visible, (val) => { if (!val) (config as any).controlPanel = false })

function close() {
  ;(config as any).controlPanel = false
}

// 响应式: 桌面 / 手机
const isMobile = ref(false)
let mql: MediaQueryList | null = null
function syncMobile(e: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = 'matches' in e ? e.matches : false
}
onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  mql.addEventListener?.('change', syncMobile)
})
onBeforeUnmount(() => {
  mql?.removeEventListener?.('change', syncMobile)
})

// 计算属性
const mediaId = computed(() => Number(route.query.mediaId) || 0)
const mangaId = computed(() => Number(route.query.mangaId) || 0)
const currentMode = computed(() => String(route.query.readerMode || 'flow'))
const modes = computed(() => [
  { key: 'flow', label: t('browse.flow') },
  { key: 'single', label: t('browse.single') },
  { key: 'double', label: t('browse.double') },
  { key: 'half', label: t('browse.half') },
])
const bookmarkTitle = computed(() =>
  browse.bookmarkShow ? t('bookmarkManage.remove') : t('bookmarkManage.add')
)

// 关闭面板 (与导航/唤起其他抽屉的时序错开)
async function withClose(fn: () => void | Promise<void>) {
  close()
  await nextTick()
  await fn()
}

async function run(key: string) {
  const targets: Record<string, string> = {
    home: '/t',
    media: '/t/media',
    'manga-list': `/t/media/${mediaId.value}`,
    'manga-info': `/t/manga/${mangaId.value}`,
  }
  if (targets[key]) {
    await withClose(() => router.push(targets[key]))
  }
}

async function changeMode(mode: string) {
  if (mode === currentMode.value) {
    close()
    return
  }
  await withClose(() =>
    router.push({
      name: 't-reader',
      params: { chapterId: route.params.chapterId },
      query: { ...route.query, readerMode: mode },
    })
  )
}

async function toggleBookmark() {
  await browse.toggle_bookmark()
  // 保持面板打开: 允许连续切换
}

// 打开原章节抽屉 (chapter-list-menu)
function openChapterList() {
  withClose(() => {
    ;(config as any).chapterList = true
  })
}

// 打开右侧工具抽屉 (right-sidebar)
function openRightMenu() {
  withClose(() => {
    config.rightSidebar = true
  })
}
</script>

<style scoped lang="less">
/* 遮罩层 */
.lcp-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 0;
}

/* 桌面: 居中 */
@media (min-width: 768px) {
  .lcp-mask {
    align-items: center;
  }
}

/* 面板本体 (沿用 topbar reader-mobile-sheet 风格) */
.lcp-sheet {
  position: relative;
  width: min(56rem, 92vw);
  max-width: 56rem;
  max-height: 86vh;
  overflow: hidden auto;
  padding: 0.8rem 1.6rem 2rem;
  border-radius: 1.6rem;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.94));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 -0.4rem 2rem rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(14px);
}

/* 手机: 底部滑起, 顶部圆角 */
.lcp-sheet.is-mobile {
  width: 100%;
  max-width: 100%;
  border-radius: 1.6rem 1.6rem 0 0;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom));
}

.lcp-handle {
  width: 3.6rem;
  height: 0.4rem;
  margin: 0.4rem auto 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
}

.lcp-title {
  font-size: 1.4rem;
  text-align: center;
  opacity: 0.85;
  margin-bottom: 1.6rem;
  padding: 0 0.6rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lcp-section-label {
  margin: 1.4rem 0.2rem 0.8rem;
  font-size: 1.15rem;
  opacity: 0.6;
  letter-spacing: 0.05em;
}

.lcp-section-label:first-of-type {
  margin-top: 0.4rem;
}

/* 宫格 */
.lcp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
}

.lcp-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.1rem 0.4rem;
  border: 0;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.lcp-grid-item:hover:not(:disabled),
.lcp-grid-item.is-active {
  background: rgba(255, 255, 255, 0.14);
  color: var(--theme-reader-topbar-accent, #60a5fa);
}

.lcp-grid-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.lcp-grid-item .iconfont {
  font-size: 2rem;
  pointer-events: none;
}

/* 芯片行 (阅读模式) */
.lcp-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.lcp-chip {
  height: 3rem;
  padding: 0 1.4rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.lcp-chip:hover {
  background: rgba(255, 255, 255, 0.16);
}

.lcp-chip.is-active {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
}

/* 遮罩淡入淡出 */
.lcp-fade-enter-active,
.lcp-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lcp-fade-enter-from,
.lcp-fade-leave-to {
  opacity: 0;
}

/* 手机: 从底部滑起 */
.lcp-slide-up-enter-active,
.lcp-slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.lcp-slide-up-enter-from,
.lcp-slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0.6;
}

/* 桌面: 缩放 */
.lcp-zoom-enter-active,
.lcp-zoom-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.lcp-zoom-enter-from,
.lcp-zoom-leave-to {
  transform: scale(0.94);
  opacity: 0;
}
</style>