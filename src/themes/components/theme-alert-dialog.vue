<template>
  <Teleport to="body">
    <Transition name="theme-alert">
      <div
        v-if="currentAlert"
        class="theme-alert-overlay"
        :class="{ 'theme-alert-dark': isDarkMode }"
        role="presentation"
      >
        <section
          class="theme-alert-dialog smanga-backable"
          :role="currentAlert.kind === 'confirm' ? 'dialog' : 'alertdialog'"
          aria-modal="true"
          aria-labelledby="theme-alert-title"
          aria-describedby="theme-alert-message"
        >
          <header class="theme-alert-header">
            <span class="theme-alert-icon" aria-hidden="true">!</span>
            <h2 id="theme-alert-title">
              {{ currentAlert.kind === 'confirm' ? '请确认' : '提示' }}
            </h2>
          </header>

          <p id="theme-alert-message" class="theme-alert-message">
            {{ currentAlert.message }}
          </p>

          <footer class="theme-alert-footer">
            <button
              v-if="currentAlert.kind === 'confirm'"
              type="button"
              class="theme-alert-cancel smanga-back-close"
              @click="dismiss(false)"
            >
              取消
            </button>
            <button
              ref="confirmButton"
              type="button"
              class="theme-alert-confirm"
              :class="{ 'smanga-back-close': currentAlert.kind === 'alert' }"
              @click="dismiss(true)"
            >
              确定
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useColorTheme } from '@/themes/composables/use-color-theme'
import { dismissThemeAlert, themeAlertQueue } from './theme-alert'

const confirmButton = ref<HTMLButtonElement | null>(null)
const currentAlert = computed(() => themeAlertQueue[0])
const { isDarkMode } = useColorTheme()

function dismiss(confirmed: boolean) {
  dismissThemeAlert(confirmed)
}

function onKeydown(event: KeyboardEvent) {
  if (!currentAlert.value) return
  if (event.key !== 'Enter' && event.key !== 'Escape') return

  event.preventDefault()
  event.stopPropagation()
  dismiss(event.key === 'Enter')
}

watch(
  () => currentAlert.value?.id,
  async (id) => {
    if (!id) return
    await nextTick()
    confirmButton.value?.focus()
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKeydown, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true))
</script>

<style scoped>
.theme-alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
  padding: max(2rem, env(safe-area-inset-top)) max(2rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(2rem, env(safe-area-inset-left));
  padding-top: calc(max(2rem, env(safe-area-inset-top)) + 2.4rem);
  background: rgba(15, 23, 42, 0.5);
  -webkit-tap-highlight-color: transparent;
}

.theme-alert-dialog {
  width: min(42rem, 100%);
  overflow: hidden;
  color: #1f2937;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.4rem;
  box-shadow: 0 2.4rem 6rem rgba(15, 23, 42, 0.24);
}

.theme-alert-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.8rem 2rem 0;
}

.theme-alert-header h2 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1.4;
}

.theme-alert-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  background: #2563eb;
  border-radius: 50%;
}

.theme-alert-message {
  max-height: min(50vh, 30rem);
  margin: 0;
  padding: 1.6rem 2rem 2rem;
  overflow: auto;
  color: #4b5563;
  font-size: 1.4rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.theme-alert-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1.2rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.theme-alert-confirm,
.theme-alert-cancel {
  min-width: 8rem;
  min-height: 4rem;
  padding: 0.8rem 1.8rem;
  font: inherit;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  border: 0;
  border-radius: 0.8rem;
  touch-action: manipulation;
}

.theme-alert-confirm {
  color: #fff;
  background: #2563eb;
}

.theme-alert-cancel {
  color: #374151;
  background: #e5e7eb;
}

.theme-alert-confirm:hover {
  background: #1d4ed8;
}

.theme-alert-cancel:hover {
  background: #d1d5db;
}

.theme-alert-confirm:focus-visible {
  outline: 0.3rem solid rgba(37, 99, 235, 0.3);
  outline-offset: 0.2rem;
}

.theme-alert-cancel:focus-visible {
  outline: 0.3rem solid rgba(107, 114, 128, 0.3);
  outline-offset: 0.2rem;
}

.theme-alert-dark {
  background: rgba(0, 0, 0, 0.68);
}

.theme-alert-dark .theme-alert-dialog {
  color: #f3f4f6;
  background: #1f2937;
  border-color: #374151;
}

.theme-alert-dark .theme-alert-message {
  color: #d1d5db;
}

.theme-alert-dark .theme-alert-footer {
  background: #111827;
  border-top-color: #374151;
}

.theme-alert-dark .theme-alert-cancel {
  color: #e5e7eb;
  background: #374151;
}

.theme-alert-dark .theme-alert-cancel:hover {
  background: #4b5563;
}

.theme-alert-enter-active,
.theme-alert-leave-active {
  transition: opacity 0.16s ease;
}

.theme-alert-enter-active .theme-alert-dialog,
.theme-alert-leave-active .theme-alert-dialog {
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.theme-alert-enter-from,
.theme-alert-leave-to {
  opacity: 0;
}

.theme-alert-enter-from .theme-alert-dialog,
.theme-alert-leave-to .theme-alert-dialog {
  opacity: 0;
  transform: translateY(0.8rem) scale(0.98);
}

@media (max-width: 480px) {
  .theme-alert-overlay {
    align-items: flex-start;
    padding: 1.2rem;
    padding-top: calc(max(1.2rem, env(safe-area-inset-top)) + 2.4rem);
  }

  .theme-alert-dialog {
    width: 100%;
  }

  .theme-alert-confirm,
  .theme-alert-cancel {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-alert-enter-active,
  .theme-alert-leave-active,
  .theme-alert-enter-active .theme-alert-dialog,
  .theme-alert-leave-active .theme-alert-dialog {
    transition: none;
  }
}
</style>
