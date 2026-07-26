<template>
  <transition name="lcp-fade">
    <div v-if="visible" class="lcp-mask" @click.self="close" @contextmenu.stop.prevent>
      <transition :name="isMobile ? 'lcp-slide-up' : 'lcp-zoom'" appear>
        <div v-if="visible" class="lcp-sheet" :class="{ 'is-mobile': isMobile }">
          <!-- 拖动条 -->
          <div class="lcp-handle" />

          <!-- 关闭按钮 -->
          <button type="button" class="lcp-close" :aria-label="$t('option.cancel')" @click="close">
            <span class="lcp-ico lcp-ico-close" aria-hidden="true">×</span>
          </button>

          <!-- 标题 -->
          <div class="lcp-title" :title="browse.currentChapter?.chapterName">
            {{ browse.currentChapter?.chapterName || $t('sidebar.chapterList') }}
          </div>

          <!-- 快速开关行:书签 / 操作面板 / 全屏 / 下载 / 右侧菜单(旧) -->
          <div class="lcp-quick-row">
            <button
              type="button"
              class="lcp-quick"
              :class="{ 'is-active': browse.bookmarkShow }"
              @click="toggleBookmark"
            >
              <span class="lcp-ico" aria-hidden="true">★</span>
              <span>{{ bookmarkTitle }}</span>
            </button>
            <button
              type="button"
              class="lcp-quick"
              :class="{ 'is-active': config.enableOperation }"
              @click="toggleOperation"
            >
              <span class="lcp-ico" aria-hidden="true">≡</span>
              <span>{{ $t('option.option') }}</span>
            </button>
            <button
              type="button"
              class="lcp-quick"
              :class="{ 'is-active': fullscreen }"
              @click="toggleFullscreen"
            >
              <span class="lcp-ico" aria-hidden="true">⛶</span>
              <span>{{ fullscreen ? $t('option.exitFullscreen') : $t('option.fullscreen') }}</span>
            </button>
            <button type="button" class="lcp-quick" @click="triggerAction('download')">
              <span class="lcp-ico" aria-hidden="true">⭳</span>
              <span>{{ $t('option.dwonload') }}</span>
            </button>
            <button type="button" class="lcp-quick" @click="openLegacyRightSidebar">
              <span class="lcp-ico" aria-hidden="true">⋯</span>
              <span>{{ $t('sidebar.legacyMenu') }}</span>
            </button>
          </div>

          <!-- 导航宫格 -->
          <div class="lcp-section-label">{{ $t('sidebar.pageJump') }}</div>
          <div class="lcp-grid">
            <button type="button" class="lcp-grid-item" @click="run('home')">
              <span class="lcp-ico" aria-hidden="true">⌂</span>
              <span>Smanga</span>
            </button>
            <button type="button" class="lcp-grid-item" @click="run('media')">
              <span class="lcp-ico" aria-hidden="true">▤</span>
              <span>{{ $t('sidebar.mediaList') }}</span>
            </button>
            <button type="button" class="lcp-grid-item" :disabled="!mediaId" @click="run('manga-list')">
              <span class="lcp-ico" aria-hidden="true">☰</span>
              <span>{{ $t('sidebar.mangaList') }}</span>
            </button>
            <button type="button" class="lcp-grid-item" :disabled="!mangaId" @click="run('manga-info')">
              <span class="lcp-ico" aria-hidden="true">ⓘ</span>
              <span>{{ $t('sidebar.mangaInfo') }}</span>
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

          <!-- 高级操作: 跳页 / 设图宽 / 双页方向 / 移除首张 -->
          <div class="lcp-section-label">{{ $t('option.option') }}</div>
          <div class="lcp-chip-row">
            <button
              v-if="canJumpPage"
              type="button"
              class="lcp-chip"
              @click="triggerAction('jumpPage')"
            >
              {{ $t('option.jumpPage') }}
            </button>
            <button type="button" class="lcp-chip" @click="triggerAction('setImageWidth')">
              {{ $t('option.setImageWidth') }}
            </button>
            <button
              v-if="isDouble"
              type="button"
              class="lcp-chip"
              :class="{ 'is-active': browse.readerFlags.direction }"
              @click="triggerAction('toggleDirection')"
            >
              {{ $t('option.direction') }}
            </button>
            <button
              v-if="isDouble"
              type="button"
              class="lcp-chip"
              :class="{ 'is-active': browse.readerFlags.removeFirst }"
              @click="triggerAction('toggleRemoveFirst')"
            >
              {{ $t('option.removeFirst') }}
            </button>
          </div>

          <!-- 章节列表 (可折叠, 移动端默认收起) -->
          <button
            type="button"
            class="lcp-section-label lcp-chapter-header lcp-chapter-toggle"
            @click="chapterExpanded = !chapterExpanded"
          >
            <span>
              {{ $t('sidebar.chapterList') }}
              <span class="lcp-chapter-count">{{ browse.chapterList.length }}</span>
            </span>
            <span class="lcp-ico lcp-chapter-arrow" :class="{ 'is-open': chapterExpanded }" aria-hidden="true">▾</span>
          </button>
          <div v-show="chapterExpanded" class="lcp-chapter-list" ref="chapterListRef">
            <button
              v-for="(chapter, index) in browse.chapterList"
              :key="chapter.chapterId"
              type="button"
              class="lcp-chapter-item"
              :class="{ 'is-active': index === browse.currentChapterIndex }"
              :data-index="index"
              @click="goChapter(chapter.chapterId)"
            >
              <span class="lcp-chapter-name">{{ chapter.chapterName }}</span>
              <i v-if="chapter.latest?.finish" class="iconfont icon-success-fill lcp-chapter-read" />
            </button>
          </div>
          <div class="lcp-chapter-actions">
            <button type="button" class="lcp-chip lcp-chip-warn" @click="triggerAction('beforeChapter')">
              {{ $t('page.before') }}
            </button>
            <button type="button" class="lcp-chip lcp-chip-ok" @click="triggerAction('nextChapter')">
              {{ $t('page.next') }}
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
// 章节列表展开状态: 桌面默认展开, 移动端默认收起
const chapterExpanded = ref(!(typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches))
watch(() => (config as any).controlPanel, (val) => {
  visible.value = !!val
  if (val && chapterExpanded.value) nextTick(() => scrollCurrentChapterIntoView())
})
watch(visible, (val) => { if (!val) (config as any).controlPanel = false })
// 章节列表展开时滚动到当前章节
watch(chapterExpanded, (val) => {
  if (val) nextTick(() => scrollCurrentChapterIntoView())
})

function close() {
  ;(config as any).controlPanel = false
}

// 响应式: 桌面 / 手机
const isMobile = ref(false)
let mql: MediaQueryList | null = null
function syncMobile(e: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = 'matches' in e ? e.matches : false
}

// 全屏状态
const fullscreen = ref(false)
function syncFullscreen() {
  fullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  mql.addEventListener?.('change', syncMobile)
  document.addEventListener('fullscreenchange', syncFullscreen)
  syncFullscreen()
})
onBeforeUnmount(() => {
  mql?.removeEventListener?.('change', syncMobile)
  document.removeEventListener('fullscreenchange', syncFullscreen)
})

// 计算属性
const mediaId = computed(() => Number(route.query.mediaId) || 0)
const mangaId = computed(() => Number(route.query.mangaId) || 0)
const currentMode = computed(() => String(route.query.readerMode || 'flow'))
const isDouble = computed(() => currentMode.value === 'double')
const canJumpPage = computed(() => currentMode.value === 'flow' || currentMode.value === 'pdf')
const modes = computed(() => [
  { key: 'flow', label: t('browse.flow') },
  { key: 'single', label: t('browse.single') },
  { key: 'double', label: t('browse.double') },
  { key: 'half', label: t('browse.half') },
])
const bookmarkTitle = computed(() =>
  browse.bookmarkShow ? t('bookmarkManage.remove') : t('bookmarkManage.add')
)

// 章节列表: 打开面板后滚动到当前章节
const chapterListRef = ref<HTMLElement | null>(null)
function scrollCurrentChapterIntoView() {
  const container = chapterListRef.value
  if (!container) return
  const idx = browse.currentChapterIndex
  if (idx < 0) return
  const el = container.querySelector<HTMLElement>(`[data-index="${idx}"]`)
  if (el) el.scrollIntoView({ block: 'center' })
}

// 关闭面板并延迟执行 (导航等操作)
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
}

function toggleOperation() {
  config.enableOperation = !config.enableOperation
}

// 打开旧版右侧菜单 (保留兼容入口)
function openLegacyRightSidebar() {
  close()
  nextTick(() => {
    ;(config as any).rightSidebar = true
  })
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  } catch (e) {
    // 忽略权限/不支持错误
  }
}

// 触发 store action (由阅读器视图订阅执行)
function triggerAction(action: 'download' | 'jumpPage' | 'setImageWidth' | 'toggleDirection' | 'toggleRemoveFirst' | 'beforeChapter' | 'nextChapter') {
  // 章节切换类:关闭面板后再触发, 其他保持打开以便连续操作
  if (action === 'beforeChapter' || action === 'nextChapter') {
    withClose(() => browse.trigger_reader_action(action))
    return
  }
  // 需要弹窗的操作 (跳页/设图宽) 关闭面板避免遮挡
  if (action === 'jumpPage' || action === 'setImageWidth') {
    withClose(() => browse.trigger_reader_action(action))
    return
  }
  browse.trigger_reader_action(action)
}

// 直接切换章节
function goChapter(chapterId: number) {
  if (chapterId === browse.chapterId) {
    close()
    return
  }
  withClose(() => browse.trigger_change_chapter(chapterId))
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

@media (min-width: 768px) {
  .lcp-mask {
    align-items: center;
  }
}

.lcp-sheet {
  position: relative;
  width: min(56rem, 92vw);
  max-width: 56rem;
  max-height: 90vh;
  overflow: hidden auto;
  padding: 0.8rem 1.6rem 2rem;
  border-radius: 1.6rem;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.94));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 -0.4rem 2rem rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(14px);
  -webkit-overflow-scrolling: touch;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* 通用符号图标 (兜底: 项目 iconfont 缺失时使用 Unicode 符号) */
.lcp-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Sans Symbols', system-ui, sans-serif;
  font-style: normal;
  line-height: 1;
  pointer-events: none;
}

/* 关闭按钮 */
.lcp-close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 3.4rem;
  height: 3.4rem;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.15s ease;
}

.lcp-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lcp-close .iconfont,
.lcp-close .lcp-ico {
  font-size: 1.8rem;
  line-height: 1;
  pointer-events: none;
}

.lcp-sheet.is-mobile {
  width: 100%;
  max-width: 100%;
  max-height: 92vh;
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
  margin-bottom: 1.4rem;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 快速开关行 */
.lcp-quick-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
}

.lcp-quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.9rem 0.4rem;
  border: 0;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.lcp-quick:hover {
  background: rgba(255, 255, 255, 0.14);
}

.lcp-quick.is-active {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
}

.lcp-quick .iconfont,
.lcp-quick .lcp-ico {
  font-size: 1.8rem;
  line-height: 1;
}

/* 导航宫格 */
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

.lcp-grid-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  color: var(--theme-reader-topbar-accent, #60a5fa);
}

.lcp-grid-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.lcp-grid-item .iconfont,
.lcp-grid-item .lcp-ico {
  font-size: 2rem;
  line-height: 1;
  pointer-events: none;
}

/* 芯片行 */
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

.lcp-chip-warn {
  background: rgba(251, 191, 36, 0.18);
  color: #fbbf24;
}
.lcp-chip-warn:hover { background: rgba(251, 191, 36, 0.32); }

.lcp-chip-ok {
  background: rgba(52, 211, 153, 0.18);
  color: #34d399;
}
.lcp-chip-ok:hover { background: rgba(52, 211, 153, 0.32); }

/* 章节列表 */
.lcp-chapter-header .lcp-chapter-count {
  opacity: 0.8;
  font-size: 1.05rem;
}

/* 章节列表折叠开关: 让 lcp-section-label 也可作为按钮 */
button.lcp-chapter-toggle {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

button.lcp-chapter-toggle:hover {
  opacity: 0.9;
}

.lcp-chapter-toggle .lcp-chapter-count {
  margin-left: 0.6rem;
  padding: 0.1rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 1.05rem;
}

.lcp-chapter-toggle .iconfont,
.lcp-chapter-toggle .lcp-ico {
  font-size: 1.4rem;
  line-height: 1;
  opacity: 0.7;
  transition: transform 0.2s ease;
  display: inline-block;
}

.lcp-chapter-toggle .lcp-chapter-arrow.is-open {
  transform: rotate(180deg);
}

.lcp-chapter-list {
  max-height: 40vh;
  overflow-y: auto;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.4rem;
  touch-action: pan-y;
}

@media (min-width: 768px) {
  .lcp-chapter-list {
    max-height: 32vh;
  }
}

.lcp-chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 0.8rem;
  background: transparent;
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.2rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.lcp-chapter-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.lcp-chapter-item.is-active {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
  font-weight: 600;
}

.lcp-chapter-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.lcp-chapter-read {
  color: #34d399;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.lcp-chapter-item.is-active .lcp-chapter-read {
  color: #0b1120;
}

.lcp-chapter-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 1rem;
}

.lcp-chapter-actions .lcp-chip {
  height: 3.4rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 过渡 */
.lcp-fade-enter-active,
.lcp-fade-leave-active { transition: opacity 0.2s ease; }
.lcp-fade-enter-from,
.lcp-fade-leave-to { opacity: 0; }

.lcp-slide-up-enter-active,
.lcp-slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.lcp-slide-up-enter-from,
.lcp-slide-up-leave-to { transform: translateY(100%); opacity: 0.6; }

.lcp-zoom-enter-active,
.lcp-zoom-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.lcp-zoom-enter-from,
.lcp-zoom-leave-to { transform: scale(0.94); opacity: 0; }
</style>