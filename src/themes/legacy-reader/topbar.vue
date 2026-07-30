<template>
  <header class="reader-quick-bar" :class="{ 'is-mobile': isMobile }">
    <!-- 章节标题条 -->
    <div class="chapter-name" :title="chapterTitle">
      <span class="chapter-name-text">{{ browse.currentChapter?.chapterName || '' }}</span>
      <span v-if="chapterProgress" class="chapter-progress">{{ chapterProgress }}</span>
    </div>

    <!-- 桌面端: 胶囊快捷按钮 (仅一个入口, 唤起 control-panel) -->
    <nav v-if="!isMobile" class="quick-capsule" aria-label="reader-quick-nav">
      <button class="qc-btn is-primary" :title="$t('sidebar.rightMenu')" @click="openPanel">
        <span class="qc-ico" aria-hidden="true">☰</span>
        <span class="qc-label">{{ $t('sidebar.rightMenu') }}</span>
      </button>
    </nav>

    <!-- 移动端: 悬浮圆形按钮 -->
    <button
      v-else
      type="button"
      class="mobile-fab"
      :title="$t('sidebar.rightMenu')"
      @click="openPanel"
    >
      <span class="qc-ico" aria-hidden="true">⋯</span>
    </button>
  </header>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { config } from '@/store'
import useBrowseStore from '@/store/browse'

const browse = useBrowseStore()

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
</script>

<style scoped lang="less">
.reader-quick-bar {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  padding-top: env(safe-area-inset-top);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* 章节标题条: 顶部窄条, 半透明 */
.chapter-name {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  height: 3.2rem;
  line-height: 3.2rem;
  padding: 0 12rem 0 1.6rem;
  color: var(--theme-reader-topbar-text, #f8fafc);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
  font-size: 1.3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chapter-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 桌面: 右上胶囊, 唤起 control-panel */
.quick-capsule {
  pointer-events: auto;
  position: absolute;
  top: calc(env(safe-area-inset-top) + 0.8rem);
  right: 1.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.72));
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.22);
  opacity: 0.6;
  transition: opacity 0.18s ease;
}

.quick-capsule:hover,
.quick-capsule:focus-within {
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

.qc-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 3.2rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.3rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.qc-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
}

.qc-btn.is-primary {
  background: rgba(255, 255, 255, 0.1);
}

.qc-btn .iconfont,
.qc-btn .qc-ico {
  font-size: 1.6rem;
  line-height: 1;
  pointer-events: none;
}

/* 中等屏 折叠文字 */
@media (max-width: 1080px) {
  .qc-label {
    display: none;
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

.qc-btn {
    padding: 0 0.9rem;
  }
}

/* 移动端 */
.reader-quick-bar.is-mobile .chapter-name {
  padding-right: 5rem;
}

.mobile-fab {
  pointer-events: auto;
  position: fixed;
  top: calc(env(safe-area-inset-top) + 0.6rem);
  right: 1rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: 0;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.78));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  cursor: pointer;
  z-index: 21;
}

.mobile-fab .iconfont,
.mobile-fab .qc-ico {
  font-size: 1.8rem;
  line-height: 1;
  pointer-events: none;
}
</style>
