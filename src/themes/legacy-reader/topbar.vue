<template>
  <header class="reader-quick-bar" :class="{ 'is-mobile': isMobile }">
    <!-- 漫画与章节标题条 -->
    <div class="chapter-name" :title="fullTitle">
      <span v-if="mangaName" class="manga-name-text">{{ mangaName }}</span>
      <div class="chapter-line">
        <span class="chapter-name-text">{{ browse.currentChapter?.chapterName || '' }}</span>
        <span v-if="chapterProgress" class="chapter-progress">{{ chapterProgress }}</span>
      </div>
    </div>

    <!-- 功能长条: 章节选择 + 功能菜单 (桌面 / 移动 通用) -->
    <nav class="quick-bar" :class="{ 'is-mobile': isMobile }" aria-label="reader-quick-nav">
      <button class="qb-seg qb-chapter" :title="$t('sidebar.chapterList')" :aria-label="$t('sidebar.chapterList')" @click="openChapterDrawer">
        <span class="qc-ico" aria-hidden="true">☰</span>
        <span class="qb-label">{{ $t('sidebar.chapterList') }}</span>
      </button>
      <span class="qb-divider" aria-hidden="true"></span>
      <button class="qb-seg qb-menu" :title="$t('sidebar.rightMenu')" :aria-label="$t('sidebar.rightMenu')" @click="openPanel">
        <span class="qc-ico" aria-hidden="true">⋯</span>
        <span class="qb-label">{{ $t('sidebar.rightMenu') }}</span>
      </button>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { config } from '@/store'
import useBrowseStore from '@/store/browse'

const browse = useBrowseStore()
const props = defineProps<{ mangaName: string }>()

const isMobile = ref(false)
const chapterProgress = computed(() => {
  const total = browse.chapterList.length
  const index = browse.currentChapterIndex
  if (!total || index < 0) return ''
  return `${index + 1} / ${total}`
})
const chapterTitle = computed(() => {
  const name = browse.currentChapter?.chapterName || ''
  return chapterProgress.value ? `${name} · ${chapterProgress.value}` : name
})
const fullTitle = computed(() => [props.mangaName, chapterTitle.value].filter(Boolean).join(' · '))

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

function openPanel() {
  ;(config as any).controlPanel = true
}

function openChapterDrawer() {
  ;(config as any).chapterDrawer = true
}
</script>

<style scoped lang="less">
.reader-quick-bar {
  position: fixed;
  z-index: 20;
  top: var(--reader-top-inset, 0px);
  left: 0;
  right: 0;
  padding-top: var(--reader-topbar-padding, env(safe-area-inset-top, 0px));
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.25s ease, opacity 0.25s ease;
  will-change: transform, opacity;
}

.reader-quick-bar.is-controls-hidden {
  transform: translate3d(0, -100%, 0);
  opacity: 0;
  pointer-events: none;
}

/* 漫画与章节标题条: 顶部双行, 半透明 */
.chapter-name {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
  height: 5.6rem;
  padding: 0 29rem 0 1.6rem;
  color: var(--theme-reader-topbar-text, #f8fafc);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
  font-size: 1.2rem;
  overflow: hidden;
}

.manga-name-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 2rem;
}

.chapter-line {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  white-space: nowrap;
  line-height: 2rem;
}

.chapter-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.95;
}

.chapter-progress {
  flex-shrink: 0;
  padding: 0 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
  line-height: 2rem;
  opacity: 0.9;
}

/* 功能长条: 右上角横向长条, 左段选章节, 右段开功能菜单 */
.quick-bar {
  pointer-events: auto;
  position: absolute;
  top: calc(var(--reader-topbar-padding, env(safe-area-inset-top, 0px)) + 1rem);
  right: 1.6rem;
  display: inline-flex;
  align-items: stretch;
  height: 3.6rem;
  border-radius: 999px;
  overflow: hidden;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.72));
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.22);
  opacity: 0.7;
  transition: opacity 0.18s ease;
}

.quick-bar:hover,
.quick-bar:focus-within {
  opacity: 1;
}

.qc-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Sans Symbols', system-ui, sans-serif;
  font-style: normal;
  line-height: 1;
  pointer-events: none;
}

.qb-seg {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  padding: 0 1.6rem;
  border: 0;
  background: transparent;
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.3rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.qb-seg:hover {
  background: rgba(255, 255, 255, 0.14);
}

.qb-seg .iconfont,
.qb-seg .qc-ico {
  font-size: 1.6rem;
  line-height: 1;
  pointer-events: none;
}

.qb-divider {
  width: 1px;
  align-self: center;
  height: 55%;
  background: rgba(255, 255, 255, 0.22);
  pointer-events: none;
}

/* 桌面端: 放大章节标题与右侧功能条, 提升可读性与点击面积 */
.reader-quick-bar:not(.is-mobile) .chapter-name {
  height: 6.4rem;
  font-size: 1.5rem;
}

.reader-quick-bar:not(.is-mobile) .manga-name-text {
  font-size: 1.9rem;
  line-height: 2.4rem;
}

.reader-quick-bar:not(.is-mobile) .chapter-line {
  line-height: 2.4rem;
}

.reader-quick-bar:not(.is-mobile) .chapter-progress {
  font-size: 1.4rem;
  line-height: 2.4rem;
}

.reader-quick-bar:not(.is-mobile) .quick-bar {
  top: calc(var(--reader-topbar-padding, env(safe-area-inset-top, 0px)) + 0.9rem);
  height: 4.6rem;
}

.reader-quick-bar:not(.is-mobile) .qb-seg {
  padding: 0 2rem;
  font-size: 1.6rem;
}

.reader-quick-bar:not(.is-mobile) .qb-seg .iconfont,
.reader-quick-bar:not(.is-mobile) .qb-seg .qc-ico {
  font-size: 2rem;
}

/* 移动端: 使用纯图标按钮，保留触控面积并给章节标题让位。 */
.reader-quick-bar.is-mobile .chapter-name {
  padding-right: 10.8rem;
}

.quick-bar.is-mobile {
  top: calc(var(--reader-topbar-padding, env(safe-area-inset-top, 0px)) + 0.9rem);
  right: 1rem;
  height: 3.8rem;
  z-index: 21;
}

.quick-bar.is-mobile .qb-seg {
  justify-content: center;
  width: 4.4rem;
  padding: 0;
  font-size: 1.25rem;
}

.quick-bar.is-mobile .qb-label {
  display: none;
}

</style>
