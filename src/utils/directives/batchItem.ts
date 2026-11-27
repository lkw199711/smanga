import type { Directive } from 'vue'
import type { BatchItemBinding } from '@/themes/composables/use-batch-selection'

const states = new WeakMap<HTMLElement, {
  value: BatchItemBinding
  restore?: () => void
  cleanup: () => void
}>()

const batchItem: Directive<HTMLElement, BatchItemBinding> = {
  mounted(el, binding) {
    const onClick = (event: MouseEvent) => {
      const state = states.get(el)
      if (!state?.value.active) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (event.type === 'click') state.value.toggle()
    }
    const onKey = (event: KeyboardEvent) => {
      const state = states.get(el)
      if (!state?.value.active || event.target !== el || !['Enter', ' '].includes(event.key)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (!event.repeat) state.value.toggle()
    }
    el.addEventListener('click', onClick, true)
    el.addEventListener('contextmenu', onClick, true)
    el.addEventListener('keydown', onKey, true)
    states.set(el, {
      value: binding.value,
      cleanup() {
        el.removeEventListener('click', onClick, true)
        el.removeEventListener('contextmenu', onClick, true)
        el.removeEventListener('keydown', onKey, true)
      },
    })
    render(el, binding.value)
  },
  updated(el, binding) {
    render(el, binding.value)
  },
  beforeUnmount(el) {
    const state = states.get(el)
    state?.restore?.()
    state?.cleanup()
    states.delete(el)
  },
}

function render(el: HTMLElement, value: BatchItemBinding) {
  const state = states.get(el)
  if (!state) return
  state.value = value
  if (!value.active) {
    state.restore?.()
    state.restore = undefined
    return
  }
  if (!state.restore) {
    const attrs = ['role', 'aria-checked', 'aria-label', 'tabindex']
    const original = attrs.map((attr) => el.getAttribute(attr))
    const indicator = document.createElement('span')
    indicator.className = 'batch-item-check'
    indicator.setAttribute('aria-hidden', 'true')
    indicator.textContent = '✓'
    el.append(indicator)
    state.restore = () => {
      indicator.remove()
      el.removeAttribute('data-batch-selected')
      el.removeAttribute('data-batch-owner')
      el.removeAttribute('data-batch-id')
      attrs.forEach((attr, index) => {
        const previous = original[index]
        if (previous === null) el.removeAttribute(attr)
        else el.setAttribute(attr, previous)
      })
    }
  }
  el.dataset.batchSelected = String(value.selected)
  el.dataset.batchOwner = value.owner
  el.dataset.batchId = String(value.id)
  el.setAttribute('role', 'checkbox')
  el.setAttribute('tabindex', '0')
  el.setAttribute('aria-checked', String(value.selected))
  el.setAttribute('aria-label', value.label || '选择列表项')
}

export default batchItem
