import { reactive, watch } from 'vue'

export type ThemeKey = 'A' | 'B' | 'D'

const STORAGE_KEY = 'smanga-ui-theme'

function loadTheme(): ThemeKey {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'A' || saved === 'B' || saved === 'D') return saved
  return 'A'
}

export const themeState = reactive({
  current: loadTheme(),
})

watch(
  () => themeState.current,
  (val) => {
    localStorage.setItem(STORAGE_KEY, val)
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
