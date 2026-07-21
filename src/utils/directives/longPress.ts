import type { Directive } from 'vue'

type LongPressHandler = (event: PointerEvent) => void

const HOLD_DELAY = 450
const MOVE_TOLERANCE = 12

/**
 * Touch-only long press. Pointer Events are used because they fire reliably on
 * current Android/iOS browsers. Scrolling cancels it, and the click emitted after a
 * successful hold is captured so cards do not also navigate to their detail page.
 */
const longPress: Directive<HTMLElement, LongPressHandler> = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let startX = 0
    let startY = 0
    let triggered = false

    const clear = () => {
      if (timer) window.clearTimeout(timer)
      timer = undefined
    }

    const onStart = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return
      startX = event.clientX
      startY = event.clientY
      triggered = false
      clear()
      timer = window.setTimeout(() => {
        timer = undefined
        triggered = true
        binding.value?.(event)
      }, HOLD_DELAY)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return
      if (Math.abs(event.clientX - startX) > MOVE_TOLERANCE || Math.abs(event.clientY - startY) > MOVE_TOLERANCE) clear()
    }

    const onEnd = () => clear()
    const preventFollowUpClick = (event: MouseEvent) => {
      if (!triggered) return
      triggered = false
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    el.addEventListener('pointerdown', onStart, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', onEnd, { passive: true })
    el.addEventListener('pointercancel', onEnd, { passive: true })
    el.addEventListener('click', preventFollowUpClick, true)
    ;(el as any).__smangaLongPressCleanup = () => {
      clear()
      el.removeEventListener('pointerdown', onStart)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onEnd)
      el.removeEventListener('pointercancel', onEnd)
      el.removeEventListener('click', preventFollowUpClick, true)
    }
  },
  beforeUnmount(el) {
    ;(el as any).__smangaLongPressCleanup?.()
  },
}

export default longPress
