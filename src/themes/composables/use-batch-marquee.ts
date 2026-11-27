import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { batchRowId, type BatchKind, type BatchRow, type BatchSelection } from './use-batch-selection'

type Point = { x: number; y: number }
const armedOwners = new Set<string>()

export function useBatchMarquee(options: {
  batch: BatchSelection
  kind: () => BatchKind
  rows: () => BatchRow[]
  disabled: () => boolean
  toolbar: () => HTMLElement | null
}) {
  const armed = ref(false)
  let pointerId: number | null = null
  let origin: Point = { x: 0, y: 0 }
  let current: Point = { x: 0, y: 0 }
  let overlay: HTMLDivElement | null = null
  let clickTimer: number | undefined
  let suppressClick = false

  const selector = () => `[data-batch-owner="${options.batch.owner}"]`
  const clampPoint = (event: PointerEvent): Point => ({
    x: Math.max(0, Math.min(window.innerWidth, event.clientX)),
    y: Math.max(0, Math.min(window.innerHeight, event.clientY)),
  })
  const rectangle = () => ({
    left: Math.min(origin.x, current.x),
    right: Math.max(origin.x, current.x),
    top: Math.min(origin.y, current.y),
    bottom: Math.max(origin.y, current.y),
  })

  function draw() {
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.className = 'batch-marquee-rect'
      overlay.setAttribute('aria-hidden', 'true')
      document.body.append(overlay)
    }
    const rect = rectangle()
    overlay.style.left = `${rect.left}px`
    overlay.style.top = `${rect.top}px`
    overlay.style.width = `${rect.right - rect.left}px`
    overlay.style.height = `${rect.bottom - rect.top}px`
  }

  function stopDrag() {
    pointerId = null
    overlay?.remove()
    overlay = null
    window.removeEventListener('pointermove', onMove, true)
    window.removeEventListener('pointerup', onUp, true)
    window.removeEventListener('pointercancel', onCancel, true)
  }

  function cancel() {
    stopDrag()
    armed.value = false
    armedOwners.delete(options.batch.owner)
    if (!armedOwners.size) document.body.classList.remove('batch-marquee-active')
  }

  function toggle() {
    if (armed.value) {
      cancel()
    } else if (options.batch.active.value && !options.batch.locked.value && !options.disabled()) {
      armed.value = true
      armedOwners.add(options.batch.owner)
      document.body.classList.add('batch-marquee-active')
    }
  }

  function onDown(event: PointerEvent) {
    if (!armed.value || pointerId !== null || !event.isPrimary || event.button !== 0 ||
        options.batch.locked.value || options.disabled()) return
    const target = event.target as Element | null
    if (!target || !document.querySelector(selector()) || options.toolbar()?.contains(target) ||
        target.closest('.batch-toolbar, .batch-toolbar-fixed')) return
    if (target.closest('a, button, input, select, textarea, [contenteditable], [role="button"], [role="link"], [role="switch"], [role="textbox"]')) return

    pointerId = event.pointerId
    origin = clampPoint(event)
    current = origin
    // Cover images can start the browser's native image drag before the
    // marquee receives a pointermove. Prevent that only for mouse input.
    if (event.pointerType === 'mouse') event.preventDefault()
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onCancel, true)
  }

  function onMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    current = clampPoint(event)
    if (!overlay && Math.hypot(current.x - origin.x, current.y - origin.y) < 6) return
    event.preventDefault()
    draw()
  }

  function onUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    current = clampPoint(event)
    const dragged = !!overlay
    const rect = rectangle()
    stopDrag()
    if (!dragged) return

    // A drag can end over a card. Consume its follow-up click so it cannot toggle
    // one of the items that the rectangle has just selected.
    suppressClick = true
    window.clearTimeout(clickTimer)
    clickTimer = window.setTimeout(() => { suppressClick = false }, 350)

    const rows = new Map(options.rows().map((row) => [batchRowId(options.kind(), row), row]))
    const toggled = new Set<number>()
    for (const element of document.querySelectorAll<HTMLElement>(selector())) {
      const id = Number(element.dataset.batchId)
      const row = rows.get(id)
      if (!row || toggled.has(id)) continue
      const bounds = element.getBoundingClientRect()
      if (bounds.left < rect.right && bounds.right > rect.left &&
          bounds.top < rect.bottom && bounds.bottom > rect.top) {
        toggled.add(id)
        if (options.batch.selected.has(id)) options.batch.selected.delete(id)
        else options.batch.selected.set(id, row)
      }
    }
  }

  function onCancel() { stopDrag() }

  function onClick(event: MouseEvent) {
    if (!suppressClick) return
    suppressClick = false
    window.clearTimeout(clickTimer)
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  function onDragStart(event: DragEvent) {
    if (armed.value) event.preventDefault()
  }

  function onKey(event: KeyboardEvent) {
    if (armed.value && event.key === 'Escape') cancel()
  }

  watch([() => options.batch.active.value, () => options.batch.locked.value, options.disabled],
    ([active, locked, disabled]) => { if (!active || locked || disabled) cancel() })

  onMounted(() => {
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('dragstart', onDragStart, true)
    document.addEventListener('keydown', onKey, true)
  })
  onBeforeUnmount(() => {
    cancel()
    window.clearTimeout(clickTimer)
    document.removeEventListener('pointerdown', onDown, true)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('dragstart', onDragStart, true)
    document.removeEventListener('keydown', onKey, true)
  })

  return { armed, toggle, cancel }
}
