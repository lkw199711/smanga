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
  /* PC-first defaults: compact rectangle with soft radius, larger readable text */
  padding: 5px 10px;
  min-height: 28px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
  background: var(--sd-bg2, #f3f4f6);
  color: var(--sd-text, #374151);
  border: 1px solid var(--sd-border, #e5e7eb);
  transition: background-color 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tm-tag-chip--clickable {
  cursor: pointer;
}

/* Hover only for real mouse — avoid sticky :hover on touch devices */
@media (hover: hover) and (pointer: fine) {
  .tm-tag-chip--clickable:hover:not(.tm-tag-chip--active) {
    background: var(--sd-bg-hover, #e5e7eb);
    border-color: var(--sd-border-strong, #d1d5db);
  }
}
.tm-tag-chip--clickable:active { transform: scale(0.97); }

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
  opacity: 0.55;
  flex-shrink: 0;
}
.tm-tag-chip--active .tm-tag-chip__dot { opacity: 0.85; }

.tm-tag-chip__count {
  font-size: 11px;
  opacity: 0.7;
  margin-left: 2px;
}

/* Coarse-pointer (touch) — pill shape with larger tap target */
@media (pointer: coarse) {
  .tm-tag-chip {
    min-height: 34px;
    padding: 7px 14px;
    font-size: 14px;
    border-radius: 999px;
  }
  .tm-tag-chip__dot { width: 7px; height: 7px; }
  .tm-tag-chip__count { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .tm-tag-chip { transition: none; }
  .tm-tag-chip--clickable:active { transform: none; }
}
</style>
