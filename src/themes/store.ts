import { reactive, watch } from 'vue'
import { Cookies } from '@/utils'

export type ThemeKey = 'A' | 'B' | 'D'

const COOKIE_KEY = 'smanga-theme'

function loadTheme(): ThemeKey {
  const saved = Cookies.get(COOKIE_KEY)
  if (saved === 'A' || saved === 'B' || saved === 'D') return saved
  return 'A'
}

export const themeState = reactive({
  current: loadTheme(),
})

watch(
  () => themeState.current,
  (val) => {
    Cookies.set(COOKIE_KEY, val)
  }
)

export function setTheme(key: ThemeKey) {
  themeState.current = key
}

export function useThemeStore() {
  return {
    state: themeState,
    setTheme,
  }
}
