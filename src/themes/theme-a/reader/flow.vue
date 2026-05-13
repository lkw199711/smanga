<template>
  <div ref="rootEl" class="ta-flow">
    <t-reader-image v-for="(file, i) in files" :key="file" :file="file" class="ta-flow-img" :data-idx="i" />
    <div v-if="files.length === 0" class="ta-flow-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'

const files = computed(() => globalData.imgPathList || [])
const rootEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let updatingFromScroll = false
let lastScrollPage = -1

function setupObserver() {
  observer?.disconnect()
  observer = null
  if (!rootEl.value) return
  const els = Array.from(rootEl.value.querySelectorAll<HTMLElement>('.ta-flow-img'))
  if (!els.length) return

  const scrollRoot = (rootEl.value.closest('.ta-reader-body') as HTMLElement | null) || null
  observer = new IntersectionObserver(
    (entries) => {
      let bestIdx = -1
      let bestRatio = 0
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const idx = Number((e.target as HTMLElement).dataset.idx || -1)
        if (!Number.isFinite(idx) || idx < 0) continue
        if (e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio
          bestIdx = idx
        }
      }
      if (bestIdx >= 0 && bestIdx !== lastScrollPage) {
        lastScrollPage = bestIdx
        updatingFromScroll = true
        globalData.page = bestIdx
        queueMicrotask(() => {
          updatingFromScroll = false
        })
      }
    },
    { root: scrollRoot, threshold: [0.2, 0.4, 0.6, 0.8] }
  )
  for (const el of els) observer.observe(el)
}

function scrollToPage(idx: number) {
  if (!rootEl.value) return
  const el = rootEl.value.querySelector<HTMLElement>(`.ta-flow-img[data-idx="${idx}"]`)
  if (!el) return
  el.scrollIntoView({ block: 'center' })
}

onMounted(async () => {
  await nextTick()
  setupObserver()
  scrollToPage(Number(globalData.page || 0))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(
  () => files.value.length,
  async () => {
    await nextTick()
    setupObserver()
  }
)

watch(
  () => globalData.page,
  (p) => {
    if (updatingFromScroll) return
    const idx = Number(p || 0)
    if (!Number.isFinite(idx) || idx < 0) return
    scrollToPage(idx)
  }
)
</script>

<style scoped>
.ta-flow {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ta-flow-img {
  width: 100%;
  display: block;
}

.ta-flow-empty {
  padding: 60px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
