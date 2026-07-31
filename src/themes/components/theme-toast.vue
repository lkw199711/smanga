<template>
  <teleport to="body">
    <div class="theme-toast-region" aria-live="polite">
      <transition-group name="theme-toast">
        <div v-for="item in themeToastState.items" :key="item.id" class="theme-toast" :class="`theme-toast--${item.type}`">
          <span class="theme-toast-dot" aria-hidden="true" />
          <span class="theme-toast-text">{{ item.message }}</span>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { themeToastState } from '@/themes/composables/use-theme-toast'
</script>

<style scoped lang="less">
.theme-toast-region {
  position: fixed;
  top: calc(2rem + env(safe-area-inset-top));
  left: 50%;
  z-index: 3100; /* 高于抽屉/面板 3001 与 thd-mask 3050 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  transform: translateX(-50%);
  pointer-events: none;
  max-width: min(48rem, 92vw);
}

/* 顶部居中小胶囊, 深色毛玻璃, 与 lcp-sheet / lrd-card 风格统一 */
.theme-toast {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  max-width: 100%;
  padding: 0.9rem 1.6rem;
  border-radius: 999px;
  background: var(--theme-reader-topbar-bg, rgba(17, 24, 39, 0.94));
  color: var(--theme-reader-topbar-text, #f8fafc);
  box-shadow: 0 0.6rem 2.4rem rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  font-size: 1.3rem;
}

.theme-toast-dot {
  flex-shrink: 0;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
}

.theme-toast--success .theme-toast-dot { background: #22c55e; }
.theme-toast--error .theme-toast-dot { background: #ef4444; }
.theme-toast--info .theme-toast-dot { background: var(--theme-reader-topbar-accent, #60a5fa); }

.theme-toast-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.theme-toast-enter-active,
.theme-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.theme-toast-enter-from,
.theme-toast-leave-to {
  opacity: 0;
  transform: translateY(-0.6rem);
}
</style>
