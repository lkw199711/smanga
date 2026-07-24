<template>
  <div class="tm-tag-filter-bar">
    <div class="tm-tag-filter-bar__chips">
      <TagChip
        v-for="tag in tags"
        :key="tag.tagId"
        :name="tag.tagName"
        :color="tag.tagColor"
        :count="tag.mangaCount"
        :active="isSelected(tag.tagId)"
        :clickable="true"
        @click="toggle(tag.tagId)"
      />
    </div>
    <div class="tm-tag-filter-bar__actions" v-if="selectedIds.length > 0">
      <button class="tm-tag-filter-bar__clear" @click="clearAll">清除筛选</button>
      <span class="tm-tag-filter-bar__hint">已选 {{ selectedIds.length }} 个标签</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import TagChip from './tag-chip.vue'

export interface TagItem {
  tagId: number
  tagName: string
  tagColor: string
  mangaCount?: number
}

const props = defineProps<{
  tags: TagItem[]
  modelValue?: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: number[]]
  change: [ids: number[]]
}>()

const selectedIds = ref<number[]>(props.modelValue || [])

watch(
  () => props.modelValue,
  (v) => { selectedIds.value = v || [] }
)

function isSelected(id: number): boolean {
  return selectedIds.value.includes(id)
}

function toggle(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
  emit('update:modelValue', [...selectedIds.value])
  emit('change', [...selectedIds.value])
}

function clearAll() {
  selectedIds.value = []
  emit('update:modelValue', [])
  emit('change', [])
}
</script>

<style scoped>
.tm-tag-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.tm-tag-filter-bar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tm-tag-filter-bar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.tm-tag-filter-bar__clear {
  padding: 4px 10px;
  font-size: 12px;
  color: var(--sd-text-secondary, #9ca3af);
  background: none;
  border: 1px solid var(--sd-border, #eaeaea);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.tm-tag-filter-bar__clear:hover {
  color: var(--sd-danger, #ef4444);
  border-color: var(--sd-danger, #ef4444);
}

.tm-tag-filter-bar__hint {
  font-size: 12px;
  color: var(--sd-text-secondary, #9ca3af);
}
</style>
