<template>
  <span
    class="tm-tag-chip"
    :class="{ 'tm-tag-chip--active': active, 'tm-tag-chip--clickable': clickable }"
    :style="chipStyle"
    @click="clickable && $emit('click')"
  >
    <span v-if="active" class="tm-tag-chip__state" aria-hidden="true">✓</span>
    <span v-else-if="showDot || clickable" class="tm-tag-chip__dot" aria-hidden="true"></span>
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
  const color = normalizeHexColor(props.color)
  const style: Record<string, string> = {
    '--tm-tag-color': color,
  }

  if (props.active) {
    style.backgroundColor = color
    style.color = contrastTextColor(color)
    style.borderColor = color
  } else {
    // Keep the tag identity visible while making the unselected state visually lighter.
    style.backgroundColor = `color-mix(in srgb, ${color} 14%, var(--sd-bg2, #fff))`
    style.color = `color-mix(in srgb, ${color} 55%, var(--sd-text, #1f2937))`
    style.borderColor = `color-mix(in srgb, ${color} 58%, var(--sd-border, #e5e7eb))`
  }

  return style
})

function normalizeHexColor(color?: string): string {
  const value = color?.trim()
  if (/^#[0-9a-f]{6}$/i.test(value || '')) return value!
  if (/^#[0-9a-f]{3}$/i.test(value || '')) {
    return `#${value![1]}${value![1]}${value![2]}${value![2]}${value![3]}${value![3]}`
  }
  return '#6366f1'
}

function contrastTextColor(color: string): '#111827' | '#ffffff' {
  const channels = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)].map((hex) =>
    Number.parseInt(hex, 16)
  )
  const luminance = channels
    .map((channel) => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)

  const whiteContrast = 1.05 / (luminance + 0.05)
  const darkContrast = (luminance + 0.05) / 0.059
  return darkContrast > whiteContrast ? '#111827' : '#ffffff'
}
</script>

<style scoped>
.tm-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  /* PC-first defaults: compact rectangle with soft radius, larger readable text */
  padding: 0.5rem 1rem;
  min-height: 2.8rem;
  border-radius: 0.6rem;
  font-size: 1.3rem;
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
  font-weight: 600;
}

.tm-tag-chip__dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--tm-tag-color, currentColor);
  opacity: 0.9;
  flex-shrink: 0;
}

.tm-tag-chip__state {
  font-size: 1.1em;
  font-weight: 800;
  line-height: 1;
  flex-shrink: 0;
}

.tm-tag-chip__count {
  font-size: 1.1rem;
  opacity: 0.7;
  margin-left: 0.2rem;
}

/* Coarse-pointer (touch) — pill shape with larger tap target */
@media (pointer: coarse) {
  .tm-tag-chip {
    min-height: 3.4rem;
    padding: 0.7rem 1.4rem;
    font-size: 1.4rem;
    border-radius: 99.9rem;
  }
  .tm-tag-chip__dot { width: 0.7rem; height: 0.7rem; }
  .tm-tag-chip__count { font-size: 1.2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .tm-tag-chip { transition: none; }
  .tm-tag-chip--clickable:active { transform: none; }
}
</style>
