<template>
  <transition name="lrf-slide">
    <footer v-if="visible && browse.pageCount > 0" class="lrf-bar">
      <button type="button" class="lrf-btn lrf-btn-warn" @click="triggerChapter('beforeChapter')">
        {{ $t('page.before') }}
      </button>

      <!-- 滑块 (flow 恒用滑块; 翻页模式跟随 userSlider 设置) -->
      <div v-if="useSlider" class="lrf-slider">
        <input
          v-model.number="localPage"
          class="lrf-range"
          type="range"
          :min="1"
          :max="browse.pageCount"
          :style="rangeFillStyle"
          @change="commitPage"
        />
        <span class="lrf-page">{{ localPage }} / {{ browse.pageCount }}</span>
      </div>

      <!-- 传统页码器 (翻页模式且关闭进度条时) -->
      <div v-else class="lrf-pager">
        <button type="button" class="lrf-step" :disabled="localPage <= 1" @click="stepPage(-1)">‹</button>
        <span class="lrf-page">{{ localPage }} / {{ browse.pageCount }}</span>
        <button type="button" class="lrf-step" :disabled="localPage >= browse.pageCount" @click="stepPage(1)">›</button>
      </div>

      <button type="button" class="lrf-btn lrf-btn-ok" @click="triggerChapter('nextChapter')">
        {{ $t('page.next') }}
      </button>
    </footer>
  </transition>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { config, userConfig } from '@/store'
import useBrowseStore from '@/store/browse'

const route = useRoute()
const browse = useBrowseStore()

const currentMode = computed(() => String(route.query.readerMode || 'flow'))

// 显隐: 与旧皮肤各自的开关语义对齐 (flow 底部条跟随 browseTop, 翻页模式跟随 browseFooter)
const visible = computed(() => {
  if (currentMode.value === 'flow') return config.browseTop
  if (currentMode.value === 'pdfView') return false
  return config.browseFooter
})

// flow 恒用滑块; 翻页模式尊重 userSlider 用户设置
const useSlider = computed(() => currentMode.value === 'flow' || userConfig.userSlider)

// 本地页码: 拖动中不回写, change 确认后触发跳页
const localPage = ref(browse.page || 1)
watch(() => browse.page, (val) => {
  localPage.value = val || 1
})

const rangeFillStyle = computed(() => {
  const max = browse.pageCount
  const pct = max > 1 ? ((localPage.value - 1) / (max - 1)) * 100 : 0
  return {
    background: `linear-gradient(to right, var(--theme-reader-topbar-accent, #60a5fa) ${pct}%, rgba(255, 255, 255, 0.16) ${pct}%)`,
  }
})

function commitPage() {
  const target = Math.min(Math.max(localPage.value || 1, 1), browse.pageCount)
  if (target !== browse.page) browse.trigger_jump_to_page(target)
}

function stepPage(delta: number) {
  const target = Math.min(Math.max(localPage.value + delta, 1), browse.pageCount)
  if (target === localPage.value) return
  localPage.value = target
  commitPage()
}

function triggerChapter(action: 'beforeChapter' | 'nextChapter') {
  browse.trigger_reader_action(action)
}
</script>

<style scoped lang="less">
.lrf-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 1.4rem calc(0.8rem + env(safe-area-inset-bottom));
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.86));
  color: var(--theme-reader-topbar-text, #f8fafc);
  backdrop-filter: blur(10px);
  box-shadow: 0 -0.3rem 1.2rem rgba(0, 0, 0, 0.25);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* 章节按钮 */
.lrf-btn {
  flex-shrink: 0;
  height: 3.2rem;
  padding: 0 1.4rem;
  border: 0;
  border-radius: 999px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.lrf-btn-warn {
  background: rgba(251, 191, 36, 0.18);
  color: #fbbf24;
}
.lrf-btn-warn:hover { background: rgba(251, 191, 36, 0.32); }

.lrf-btn-ok {
  background: rgba(52, 211, 153, 0.18);
  color: #34d399;
}
.lrf-btn-ok:hover { background: rgba(52, 211, 153, 0.32); }

/* 滑块区 */
.lrf-slider {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.lrf-range {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  min-width: 0;
  height: 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  outline: none;
  cursor: pointer;
}

.lrf-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 0.3rem solid var(--theme-reader-topbar-accent, #60a5fa);
  background: #fff;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.lrf-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.lrf-range::-moz-range-thumb {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 0.3rem solid var(--theme-reader-topbar-accent, #60a5fa);
  background: #fff;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.3);
}

.lrf-page {
  flex-shrink: 0;
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

/* 传统页码器 */
.lrf-pager {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
}

.lrf-step {
  width: 3.2rem;
  height: 3.2rem;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lrf-step:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

.lrf-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* 手机模式仅保留阅读进度控件，章节切换入口放在章节菜单中。 */
@media (max-width: 767px) {
  .lrf-btn {
    display: none;
  }
}

/* 过渡 */
.lrf-slide-enter-active,
.lrf-slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.lrf-slide-enter-from,
.lrf-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>
