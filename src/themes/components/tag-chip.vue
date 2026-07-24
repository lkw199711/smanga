<template>
  <span
    class="tm-tag-chip"
    :class="{ 'tm-tag-chip--active': active, 'tm-tag-chip--clickable': clickable }"
    :style="chipStyle"
    @click="clickable && $emit('click')"
  >
    <span class="tm-tag-chip__dot" v-if="showDot"></span>
    {{ name }}
    <span class="tm-tag-chip__count" v-if="count !== undefined">{{ count }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    active?: boolean
    clickable?: boolean
    count?: number
    showDot?: boolean
  }>(),
  {
    color: '#6366f1',
    active: false,
    clickable: false,
    count: undefined,
    showDot: false,
  }
)

defineEmits<{
  click: []
}>()

const chipStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.active) {
    style.backgroundColor = props.color
    style.color = '#fff'
    style.borderColor = props.color
  }
  return style
})
</script>

<style scoped>
.tm-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--sd-bg2, #f3f4f6);
  color: var(--sd-text, #374151);
  border: 1px solid transparent;
  transition: all 0.15s;
  user-select: none;
}

.tm-tag-chip--clickable {
  cursor: pointer;
}

.tm-tag-chip--clickable:hover:not(.tm-tag-chip--active) {
  background: var(--sd-bg-hover, #e5e7eb);
}

.tm-tag-chip--active {
  background: var(--sd-primary, #2563eb);
  color: #fff;
  border-color: var(--sd-primary, #2563eb);
}

.tm-tag-chip__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.tm-tag-chip__count {
  font-size: 11px;
  opacity: 0.7;
  margin-left: 2px;
}
</style>
