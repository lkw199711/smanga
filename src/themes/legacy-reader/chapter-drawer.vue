<template>
  <el-drawer
    v-model="visible"
    size="auto"
    direction="ltr"
    :with-header="false"
    append-to-body
    :z-index="3000"
    modal-class="theme-chapter-drawer-modal"
    class="theme-chapter-drawer"
  >
    <div class="tcd-panel">
      <android-seat />

      <!-- 标题 -->
      <div class="tcd-header">
        <span class="tcd-title">{{ $t('sidebar.chapterList') }}</span>
        <span class="tcd-count">{{ browse.chapterList.length }}</span>
      </div>

      <!-- 章节列表 -->
      <div class="tcd-list" ref="listRef">
        <button
          v-for="(chapter, index) in browse.chapterList"
          :key="chapter.chapterId"
          type="button"
          class="tcd-item"
          :class="{ 'is-active': index === browse.currentChapterIndex }"
          :data-index="index"
          @click="goChapter(chapter.chapterId)"
        >
          <span class="tcd-name">{{ chapter.chapterName }}</span>
          <i v-if="chapter.latest?.finish" class="iconfont icon-success-fill tcd-read" />
        </button>
      </div>

      <!-- 上一章 / 下一章 -->
      <div class="tcd-actions">
        <button type="button" class="tcd-btn tcd-btn-warn" @click="triggerAction('beforeChapter')">
          {{ $t('page.before') }}
        </button>
        <button type="button" class="tcd-btn tcd-btn-ok" @click="triggerAction('nextChapter')">
          {{ $t('page.next') }}
        </button>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { config } from '@/store'
import useBrowseStore from '@/store/browse'
import androidSeat from '@/layout/components/android-seat.vue'

const browse = useBrowseStore()

// 抽屉可见状态: 与 config.chapterDrawer 双向同步
const visible = ref(!!(config as any).chapterDrawer)
watch(() => (config as any).chapterDrawer, (val) => {
  visible.value = !!val
  if (val) nextTick(() => scrollCurrentChapterIntoView())
})
watch(visible, (val) => { if (!val) (config as any).chapterDrawer = false })

function close() {
  ;(config as any).chapterDrawer = false
}

// 打开后滚动到当前章节
const listRef = ref<HTMLElement | null>(null)
function scrollCurrentChapterIntoView() {
  const container = listRef.value
  if (!container) return
  const idx = browse.currentChapterIndex
  if (idx < 0) return
  const el = container.querySelector<HTMLElement>(`[data-index="${idx}"]`)
  if (el) el.scrollIntoView({ block: 'center' })
}

// 切换章节: 与 control-panel 一致, 走 browse store 触发器
function goChapter(chapterId: number) {
  if (chapterId === browse.chapterId) {
    close()
    return
  }
  browse.trigger_change_chapter(chapterId)
  close()
}

function triggerAction(action: 'beforeChapter' | 'nextChapter') {
  browse.trigger_reader_action(action)
  close()
}
</script>

<style scoped lang="less">
.tcd-panel {
  display: flex;
  flex-direction: column;
  width: 60rem;
  max-width: 78vw;
  height: 100%;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.96));
  color: var(--theme-reader-topbar-text, #f8fafc);
}

.tcd-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.6rem 1.8rem 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.tcd-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tcd-count {
  flex-shrink: 0;
  padding: 0.1rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 1.15rem;
  font-weight: 400;
  opacity: 0.85;
}

.tcd-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.4rem 1rem 1rem;
  -webkit-overflow-scrolling: touch;
}

.tcd-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 1.2rem;
  border: 0;
  border-radius: 0.8rem;
  background: transparent;
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.3rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.tcd-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.tcd-item.is-active {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
  font-weight: 600;
}

.tcd-name {
  flex: 1;
  overflow: hidden;
  white-space: break-spaces;
  word-break: break-all;
}

.tcd-read {
  flex-shrink: 0;
  color: #34d399;
  font-size: 1.5rem;
}

.tcd-item.is-active .tcd-read {
  color: #0b1120;
}

.tcd-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  padding: 1rem 1.4rem calc(1.4rem + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tcd-btn {
  height: 3.8rem;
  border: 0;
  border-radius: 0.9rem;
  font-size: 1.3rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.tcd-btn-warn {
  background: rgba(251, 191, 36, 0.18);
  color: #fbbf24;
}
.tcd-btn-warn:hover { background: rgba(251, 191, 36, 0.32); }

.tcd-btn-ok {
  background: rgba(52, 211, 153, 0.18);
  color: #34d399;
}
.tcd-btn-ok:hover { background: rgba(52, 211, 153, 0.32); }
</style>

<!-- append-to-body 后 el-drawer 挂到 body, 保证覆盖 imagesLoader 的 z-index:2000 遮罩 -->
<style lang="less">
.theme-chapter-drawer-modal {
  z-index: 3000 !important;
}
.theme-chapter-drawer {
  z-index: 3001 !important;
}
</style>
