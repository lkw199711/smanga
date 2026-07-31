<template>
  <!-- 跳页弹窗 -->
  <transition name="lrd-fade">
    <div v-if="jumpVisible" class="lrd-mask smanga-backable" @click.self="closeJump" @contextmenu.stop.prevent>
      <div class="lrd-card">
        <div class="lrd-title">{{ $t('browse.jumpPageTitle') }}</div>

        <div class="lrd-value">
          <button type="button" class="lrd-step" :disabled="targetPage <= 1" @click="targetPage--">−</button>
          <span class="lrd-value-text">{{ targetPage }} / {{ browse.pageCount }}</span>
          <button type="button" class="lrd-step" :disabled="targetPage >= browse.pageCount" @click="targetPage++">+</button>
        </div>

        <input
          v-model.number="targetPage"
          class="lrd-range"
          type="range"
          :min="1"
          :max="browse.pageCount"
          :style="rangeFillStyle(targetPage, 1, browse.pageCount)"
        />

        <div class="lrd-actions">
          <button type="button" class="lrd-btn" @click="closeJump">{{ $t('option.cancel') }}</button>
          <button type="button" class="lrd-btn is-primary" @click="confirmJump">{{ $t('option.confirm') }}</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- 图宽设置弹窗 -->
  <transition name="lrd-fade">
    <div v-if="widthVisible" class="lrd-mask smanga-backable" @click.self="closeWidth" @contextmenu.stop.prevent>
      <div class="lrd-card">
        <div class="lrd-title">{{ $t('browse.title.setViewWidth') }}</div>

        <div class="lrd-row">
          <span class="lrd-label">{{ $t('browse.label.useAutoViewWidth') }}</span>
          <button
            type="button"
            class="lrd-switch"
            :class="{ 'is-on': browse.useAutoViewWidth }"
            role="switch"
            :aria-checked="browse.useAutoViewWidth"
            @click="browse.useAutoViewWidth = !browse.useAutoViewWidth"
          >
            <span class="lrd-switch-dot" />
          </button>
        </div>

        <template v-if="!browse.useAutoViewWidth">
          <div class="lrd-row">
            <span class="lrd-label">{{ $t('browse.label.setViewWidth') }}</span>
            <span class="lrd-value-text">{{ browse.viewWidthValue }}%</span>
          </div>
          <input
            v-model.number="browse.viewWidthValue"
            class="lrd-range"
            type="range"
            :min="0"
            :max="100"
            :style="rangeFillStyle(browse.viewWidthValue, 0, 100)"
          />
        </template>

        <div class="lrd-actions">
          <button type="button" class="lrd-btn" @click="closeWidth">{{ $t('option.cancel') }}</button>
          <button type="button" class="lrd-btn is-primary" @click="confirmWidth">{{ $t('option.confirm') }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { config } from '@/store'
import useBrowseStore from '@/store/browse'

const browse = useBrowseStore()

// ---- 跳页 ----
const jumpVisible = ref(false)
const targetPage = ref(1)
watch(() => (config as any).readerJumpPageDialog, (val) => {
  jumpVisible.value = !!val
  if (val) targetPage.value = browse.page || 1
})
watch(jumpVisible, (val) => { if (!val) (config as any).readerJumpPageDialog = false })

function closeJump() {
  jumpVisible.value = false
}

function confirmJump() {
  const target = Math.min(Math.max(targetPage.value || 1, 1), browse.pageCount)
  closeJump()
  if (target !== browse.page) browse.trigger_jump_to_page(target)
}

// ---- 图宽 ----
const widthVisible = ref(false)
watch(() => (config as any).readerViewWidthDialog, (val) => {
  widthVisible.value = !!val
})
watch(widthVisible, (val) => { if (!val) (config as any).readerViewWidthDialog = false })

function closeWidth() {
  widthVisible.value = false
}

function confirmWidth() {
  // browse.browseType 在 t-reader 路由下即 readerMode (flow/single/...)
  browse.set_view_width(browse.browseType)
  closeWidth()
}

// 滑块已滑过部分填充主题色
function rangeFillStyle(value: number, min: number, max: number) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  return {
    background: `linear-gradient(to right, var(--theme-reader-topbar-accent, #60a5fa) ${pct}%, rgba(255, 255, 255, 0.16) ${pct}%)`,
  }
}
</script>

<style scoped lang="less">
.lrd-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lrd-card {
  width: min(40rem, 92vw);
  padding: 2rem 2rem 1.6rem;
  border-radius: 1.6rem;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.94));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 0.6rem 2.4rem rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(14px);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.lrd-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.8rem;
}

/* 数值展示 + 步进 */
.lrd-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  margin-bottom: 1.4rem;
}

.lrd-value-text {
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

.lrd-step {
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

.lrd-step:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

.lrd-step:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* 行: 文案 + 控件 */
.lrd-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
  font-size: 1.3rem;
}

.lrd-label {
  opacity: 0.85;
}

/* 开关 */
.lrd-switch {
  position: relative;
  width: 4.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.lrd-switch.is-on {
  background: var(--theme-reader-topbar-accent, #60a5fa);
}

.lrd-switch-dot {
  position: absolute;
  top: 0.3rem;
  left: 0.3rem;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.lrd-switch.is-on .lrd-switch-dot {
  transform: translateX(2rem);
}

/* 滑块 */
.lrd-range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 0.6rem;
  margin: 0.6rem 0 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  outline: none;
  cursor: pointer;
}

.lrd-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 0.3rem solid var(--theme-reader-topbar-accent, #60a5fa);
  background: #fff;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.lrd-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.lrd-range::-moz-range-thumb {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 0.3rem solid var(--theme-reader-topbar-accent, #60a5fa);
  background: #fff;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.3);
}

/* 底部操作 */
.lrd-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.8rem;
}

.lrd-btn {
  height: 3.4rem;
  padding: 0 1.8rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--theme-reader-topbar-text, #f8fafc);
  font-size: 1.3rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.lrd-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.lrd-btn.is-primary {
  background: var(--theme-reader-topbar-accent, #60a5fa);
  color: #0b1120;
  font-weight: 600;
}

.lrd-btn.is-primary:hover {
  filter: brightness(1.1);
}

/* 过渡 */
.lrd-fade-enter-active,
.lrd-fade-leave-active { transition: opacity 0.2s ease; }
.lrd-fade-enter-from,
.lrd-fade-leave-to { opacity: 0; }
</style>
