import { reactive } from 'vue'

export type ThemeConfirmType = 'info' | 'warning' | 'danger'

export interface ThemeConfirmOptions {
  title?: string
  message: string
  type?: ThemeConfirmType
  confirmText?: string
  cancelText?: string
  /** 只展示确认按钮 (替代 ElMessageBox.alert 场景) */
  alertOnly?: boolean
}

interface ThemeConfirmState {
  visible: boolean
  options: ThemeConfirmOptions
  resolve: ((value: boolean) => void) | null
}

// 模块级单例: 渲染由 theme-confirm.vue 承担 (挂在 layout-wrapper 一处即可)
export const themeConfirmState = reactive<ThemeConfirmState>({
  visible: false,
  options: { message: '' },
  resolve: null,
})

/**
 * 对齐 ElMessageBox.confirm 的调用习惯:
 *   await confirm({ message, type: 'warning' }) → 确认 resolve / 取消 reject
 */
export function themeConfirm(options: ThemeConfirmOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // 若已有弹窗, 先按取消处理旧的, 避免 promise 悬挂
    themeConfirmState.resolve?.(false)
    themeConfirmState.options = options
    themeConfirmState.visible = true
    themeConfirmState.resolve = (ok: boolean) => {
      themeConfirmState.visible = false
      themeConfirmState.resolve = null
      ok ? resolve() : reject(new Error('cancel'))
    }
  })
}

/** alert 便捷封装: 只有确认按钮, 且不会 reject */
export async function themeAlert(options: ThemeConfirmOptions): Promise<void> {
  try {
    await themeConfirm({ ...options, alertOnly: true })
  } catch {
    /* 关闭视为已读 */
  }
}

export function useThemeConfirm() {
  return { confirm: themeConfirm, alert: themeAlert }
}
