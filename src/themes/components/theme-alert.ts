import { reactive } from 'vue'

export interface ThemeAlertItem {
  id: number
  message: string
  kind: 'alert' | 'confirm'
  resolve?: (confirmed: boolean) => void
}

export const themeAlertQueue = reactive<ThemeAlertItem[]>([])

let nextAlertId = 1

/**
 * 显示一个不依赖浏览器原生弹窗的提示。
 * 多条提示会按调用顺序排队，避免后发消息覆盖先发消息。
 */
export function showThemeAlert(message: unknown): void {
  let text: string

  if (message instanceof Error) {
    text = message.message
  } else if (typeof message === 'string') {
    text = message
  } else {
    text = String(message ?? '')
  }

  themeAlertQueue.push({ id: nextAlertId++, message: text, kind: 'alert' })
}

/** 显示自绘确认框，用户操作后返回确认结果。 */
export function showThemeConfirm(message: unknown): Promise<boolean> {
  const text = message instanceof Error ? message.message : String(message ?? '')

  return new Promise((resolve) => {
    themeAlertQueue.push({
      id: nextAlertId++,
      message: text,
      kind: 'confirm',
      resolve,
    })
  })
}

export function dismissThemeAlert(confirmed = true): void {
  const dismissed = themeAlertQueue.shift()
  dismissed?.resolve?.(confirmed)
}
