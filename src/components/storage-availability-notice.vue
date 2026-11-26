<template>
  <div v-if="text" class="storage-notice" :class="{ 'storage-notice--compact': compact }" :role="compact ? undefined : 'status'">
    <span>{{ text }}</span>
    <button v-if="retry" type="button" :disabled="checking" @click.stop="emit('retry')">
      {{ checking ? '检测中…' : retryLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MediaAvailability, ResourceAvailability } from '@/type/availability'

const props = withDefaults(defineProps<{
  availability?: MediaAvailability | ResourceAvailability
  message?: string
  compact?: boolean
  retry?: boolean
  checking?: boolean
  retryLabel?: string
}>(), { retryLabel: '重新检测' })
const emit = defineEmits<{ retry: [] }>()

const text = computed(() => {
  if (props.message) return props.message
  const value = props.availability
  if (!value || value.status === 'available' || value.status === 'unmonitored') return ''
  if ('message' in value) return value.message
  if (value.status === 'partial') return `部分资源不可用 · ${value.unavailablePaths} 个路径异常`
  if (value.status === 'unavailable') return '存储不可用'
  return '存储状态暂未确认'
})
</script>

<style scoped>
.storage-notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .6rem 1.2rem;
  margin-block: .6rem;
  padding: .7rem .9rem;
  border: 1px solid currentColor;
  border-radius: .65rem;
  color: #854500;
  background: #fff7e5;
  color: light-dark(#854500, #ffce87);
  background: light-dark(#fff7e5, #352409);
  font-size: 1.3rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.storage-notice--compact {
  display: inline-flex;
  max-width: 100%;
  padding: .2rem .5rem;
  font-size: 1.1rem;
}
.storage-notice button {
  padding: .2rem .55rem;
  border: 1px solid currentColor;
  border-radius: .4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.storage-notice button:disabled { opacity: .65; cursor: wait; }
</style>
