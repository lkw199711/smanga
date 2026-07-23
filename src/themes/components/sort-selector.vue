<template>
  <select :value="modelValue" class="tm-sort-select" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mangaSortOrder, chapterSortOrder } from '@/store'

const props = defineProps<{
  modelValue: string
  /** 'manga' | 'chapter' — 漫画使用 mangaSortOrder（含 chapterUpdate），章节使用 chapterSortOrder */
  model: 'manga' | 'chapter'
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const labels: Record<string, string> = {
  id: 'ID 正序', idDesc: 'ID 倒序',
  name: '名称 正序', nameDesc: '名称 倒序',
  number: '章节号 正序', numberDesc: '章节号 倒序',
  createTime: '创建时间 正序', createTimeDesc: '创建时间 倒序',
  updateTime: '更新时间 正序', updateTimeDesc: '更新时间 倒序',
  chapterUpdate: '章节更新 正序', chapterUpdateDesc: '章节更新 倒序',
}

const options = computed(() => {
  const list = props.model === 'chapter' ? chapterSortOrder : mangaSortOrder
  return list.map((v: string) => ({ value: v, label: labels[v] || v }))
})
</script>

<style scoped>
.tm-sort-select {
  padding: 7px 10px;
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: var(--sd-text, #172033);
}
.tm-sort-select:focus {
  border-color: var(--sd-primary, #2563eb);
}
</style>
