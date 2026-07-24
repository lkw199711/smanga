import { inject, nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { globalData } from '@/store'

export const READER_BODY_CLASS_KEY = 'reader-body-class'

export interface FlowReaderOptions {
  /** Selector of each image element inside the root, e.g. `.ta-flow-img`. */
  imgSelector: string
  /** Reactive length source (e.g. computed images.length) to re-observe on changes. */
  filesLength: () => number
  /** Optional class of the scroll container element. Auto-injected if omitted. */
  scrollRootClass?: string
}

/**
 * Shared IntersectionObserver logic for `flow` reader across all themes.
 * - Tracks the most visible image and syncs `globalData.page`.
 * - Watches `globalData.page` (external changes) and scrolls to the target image.
 */
export function useFlowReader(rootEl: Ref<HTMLElement | null>, options: FlowReaderOptions) {
  const injectedClass = inject<string | undefined>(READER_BODY_CLASS_KEY, undefined)
  const scrollRootClass = options.scrollRootClass || injectedClass || ''

  let observer: IntersectionObserver | null = null
  let updatingFromScroll = false
  let lastScrollPage = -1

  function setupObserver() {
    observer?.disconnect()
    observer = null
    if (!rootEl.value) return
    const els = Array.from(rootEl.value.querySelectorAll<HTMLElement>(options.imgSelector))
    if (!els.length) return

    const scrollRoot =
      scrollRootClass && rootEl.value.closest(`.${scrollRootClass}`)
        ? (rootEl.value.closest(`.${scrollRootClass}`) as HTMLElement | null)
        : null

    observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1
        let bestRatio = 0
        for(const e of entries) {
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
            updatingFromScroll =false
          })
        }
      },
      { root: scrollRoot, threshold: [0.2, 0.4, 0.6, 0.8] }
    )
    for (const el of els) observer.observe(el)
  }

  function scrollToPage(idx: number) {
    if (!rootEl.value) return
    const el = rootEl.value.querySelector<HTMLElement>(`${options.imgSelector}[data-idx="${idx}"]`)
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
    () => options.filesLength(),
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

  return { setupObserver, scrollToPage }
}