import { reactive } from 'vue'

export type ThemeContextTarget = 'manga' | 'chapter' | 'media'

export const themeContextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  target: 'manga' as ThemeContextTarget,
  item: null as any,
})

export function openThemeContextMenu(event: MouseEvent, target: ThemeContextTarget, item: any) {
  event.preventDefault()
  themeContextMenu.x = event.clientX
  themeContextMenu.y = event.clientY
  themeContextMenu.target = target
  themeContextMenu.item = item
  themeContextMenu.visible = true
}

export function closeThemeContextMenu() {
  themeContextMenu.visible = false
}

export function notifyThemeContextMenuChanged(target: ThemeContextTarget) {
  window.dispatchEvent(new CustomEvent('smanga:theme-context-menu-changed', { detail: { target } }))
}
