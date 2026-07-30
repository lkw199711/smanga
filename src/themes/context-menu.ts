import { reactive } from 'vue'

export type ThemeContextTarget = 'manga' | 'chapter' | 'media'
export const THEME_CHAPTER_READ_CHANGED_EVENT = 'smanga:theme-chapter-read-changed'

export const themeContextMenu = reactive({
  visible: false,
  presentation: 'menu' as 'menu' | 'sheet',
  x: 0,
  y: 0,
  target: 'manga' as ThemeContextTarget,
  item: null as any,
})

export function openThemeContextMenu(event: MouseEvent, target: ThemeContextTarget, item: any) {
  event.preventDefault()
  // 触摸设备上 contextmenu 由 v-long-press 指令触发 openThemeActionSheet，
  // 但在 iOS Safari 等浏览器中长按也会触发 contextmenu 事件，此时应走底部菜单。
  // matchMedia('(pointer: coarse)') 可稳定检测触摸屏设备。
  if (window.matchMedia?.('(pointer: coarse)').matches) {
    openThemeActionSheet(target, item)
    return
  }
  themeContextMenu.x = event.clientX
  themeContextMenu.y = event.clientY
  themeContextMenu.target = target
  themeContextMenu.item = item
  themeContextMenu.presentation = 'menu'
  themeContextMenu.visible = true
}

/** Mobile/touch entry point.  It deliberately does not depend on a synthetic right-click event. */
export function openThemeActionSheet(target: ThemeContextTarget, item: any) {
  themeContextMenu.target = target
  themeContextMenu.item = item
  themeContextMenu.presentation = 'sheet'
  themeContextMenu.visible = true
}

export function closeThemeContextMenu() {
  themeContextMenu.visible = false
}

export function notifyThemeContextMenuChanged(target: ThemeContextTarget) {
  window.dispatchEvent(new CustomEvent('smanga:theme-context-menu-changed', { detail: { target } }))
}

export function notifyThemeChapterReadChanged(chapterId: number) {
  window.dispatchEvent(new CustomEvent(THEME_CHAPTER_READ_CHANGED_EVENT, {
    detail: { chapterId },
  }))
}
