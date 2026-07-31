import { reactive } from 'vue'

export type ThemeToastType = 'success' | 'error' | 'info'

export interface ThemeToastItem {
  id: number
  type: ThemeToastType
  message: string
}

// 模块级单例队列: 任意组件/模块直接调用, 无需 app.use;
// 渲染由 theme-toast.vue 承担 (挂在 layout-wrapper 一处即可)
export const themeToastState = reactive({ items: [] as ThemeToastItem[] })

let seed = 0

function push(type: ThemeToastType, message: string, duration = 1800) {
  const id = ++seed
  themeToastState.items.push({ id, type, message })
  window.setTimeout(() => dismiss(id), duration)
}

function dismiss(id: number) {
  const index = themeToastState.items.findIndex((item) => item.id === id)
  if (index >= 0) themeToastState.items.splice(index, 1)
}

export const themeToast = {
  success: (message: string) => push('success', message),
  // 错误信息多为接口报错, 停留久一点便于阅读
  error: (message: string) => push('error', message, 2600),
  info: (message: string) => push('info', message),
}

export function useThemeToast() {
  return themeToast
}
