import { reactive } from 'vue'
import { preferencesStore, type ShellTheme } from '@/store/preferences'

export type ThemeKey = ShellTheme

/**
 * 兼容现有主题组件的 state.current API，实际数据统一由 preferences store 管理。
 */
export const themeState = reactive({
  get current(): ThemeKey {
    return preferencesStore.shellTheme
  },
  set current(value: ThemeKey) {
    preferencesStore.setShellTheme(value)
  },
})

export function setTheme(key: ThemeKey) {
  preferencesStore.setShellTheme(key)
}

export function useThemeStore() {
  return {
    state: themeState,
    setTheme,
  }
}
