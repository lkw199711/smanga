<template>
  <teleport to="body">
    <transition name="thd-fade">
      <div v-if="themeConfirmState.visible" class="thd-mask smanga-backable" @click.self="cancel" @contextmenu.stop.prevent>
        <div class="thd-card" role="alertdialog" aria-modal="true">
          <div class="thd-title">
            <span v-if="typeIcon" class="thc-icon" :class="`thc-icon--${options.type}`" aria-hidden="true">{{ typeIcon }}</span>
            {{ options.title || $t('option.confirmTitle') }}
          </div>
          <p class="thd-message">{{ options.message }}</p>
          <div class="thd-actions">
            <button v-if="!options.alertOnly" type="button" class="thd-btn" @click="cancel">
              {{ options.cancelText || $t('option.cancel') }}
            </button>
            <button type="button" class="thd-btn" :class="options.type === 'danger' ? 'is-danger' : 'is-primary'" @click="ok">
              {{ options.confirmText || $t('option.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { themeConfirmState } from '@/themes/composables/use-theme-confirm'

const options = computed(() => themeConfirmState.options)

const typeIcon = computed(() => {
  if (options.value.type === 'warning') return '⚠'
  if (options.value.type === 'danger') return '⚠'
  return ''
})

function ok() {
  themeConfirmState.resolve?.(true)
}

function cancel() {
  themeConfirmState.resolve?.(false)
}

function onKeydown(event: KeyboardEvent) {
  if (!themeConfirmState.visible) return
  if (event.key === 'Escape') cancel()
  if (event.key === 'Enter') ok()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="less">
@import '@/themes/style/dialog.less';

.thc-icon {
  margin-right: 0.5rem;
}

.thc-icon--warning {
  color: #f59e0b;
}

.thc-icon--danger {
  color: #ef4444;
}
</style>
