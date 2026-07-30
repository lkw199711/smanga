/**
 * useColorTheme
 * 统一封装"颜色主题(light/dark/其他配色)"的读取与切换逻辑，
 * 供 theme-a、theme-b 的桌面顶栏 & 移动端顶栏共享使用，
 * 避免每处重复实现持久化、set_theme 调用与响应式同步。
 *
 * 依赖：
 *  - preferences store 存储当前配色（'light' | 'dark' | 'grey' | ...）
 */
import { computed, ref, watch } from 'vue'
import { userConfig } from '@/store'
import { set_theme } from '@/style/theme'
import { preferencesStore } from '@/store/preferences'

/** 所有组件共享 preferences store 中的同一份响应式配色状态。 */
const activeColorTheme = computed(() => preferencesStore.colorTheme)

/** 记录上一次的亮色主题，用于从 dark 切回时恢复 */
const lastNonDarkTheme = ref<string>(activeColorTheme.value === 'dark' ? 'light' : activeColorTheme.value)
watch(activeColorTheme, (theme) => {
	if (theme !== 'dark') lastNonDarkTheme.value = theme
})

/** 内部：设置并持久化主题 */
function commitTheme(value: string) {
	set_theme(value)
	userConfig.theme = value
}

/** 应用任意配色（下拉里的 light/dark/blue/...） */
export function applyColorTheme(value: string) {
	if (value !== 'dark') lastNonDarkTheme.value = value
	commitTheme(value)
}

/** 切换亮/暗（暗 ↔ 上一次的亮色主题） */
export function toggleDarkMode() {
	if (activeColorTheme.value === 'dark') {
		const target = lastNonDarkTheme.value || 'light'
		commitTheme(target)
	} else {
		lastNonDarkTheme.value = activeColorTheme.value
		commitTheme('dark')
	}
}

export function useColorTheme() {
	const isDarkMode = computed(() => activeColorTheme.value === 'dark')

	return {
		activeColorTheme,
		isDarkMode,
		toggleDarkMode,
		applyColorTheme,
	}
}
