/**
 * useColorTheme
 * 统一封装"颜色主题(light/dark/其他配色)"的读取与切换逻辑，
 * 供 theme-a、theme-b 的桌面顶栏 & 移动端顶栏共享使用，
 * 避免每处重复实现 Cookie 读写、set_theme 调用、事件广播。
 *
 * 依赖：
 *  - Cookie `theme` 存储当前配色（'light' | 'dark' | 'grey' | ...）
 *  - 全局事件 `smanga:color-theme-changed` 通知布局层切换 .sa-dark / .tb-dark 类
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { userConfig } from '@/store'
import { set_theme } from '@/style/theme'

/** 从 document.cookie 读取指定 key */
function getCookie(name: string): string | undefined {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop()?.split(';').shift()
	return undefined
}

/** 模块级共享状态：所有组件共享同一份配色状态，切换即同步 */
const activeColorTheme = ref<string>(getCookie('theme') || 'light')

/** 记录上一次的亮色主题，用于从 dark 切回时恢复 */
const lastNonDarkTheme = ref<string>(activeColorTheme.value === 'dark' ? 'light' : activeColorTheme.value)

/** 内部：设置主题并广播 */
function commitTheme(value: string) {
	activeColorTheme.value = value
	set_theme(value)
	try {
		userConfig.theme = value
	} catch (_) {
		// userConfig 可能未初始化，忽略
	}
	window.dispatchEvent(new CustomEvent('smanga:color-theme-changed', { detail: value }))
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

/**
 * Composable 主入口。
 * 每个调用点都会在挂载时注册跨组件事件同步，卸载时清理。
 */
export function useColorTheme() {
	const isDarkMode = computed(() => activeColorTheme.value === 'dark')

	function onColorThemeChanged(e: Event) {
		const detail = (e as CustomEvent).detail as string | undefined
		const theme = detail || getCookie('theme') || 'light'
		if (activeColorTheme.value !== theme) {
			activeColorTheme.value = theme
			if (theme !== 'dark') lastNonDarkTheme.value = theme
		}
	}

	onMounted(() => {
		window.addEventListener('smanga:color-theme-changed', onColorThemeChanged)
	})
	onBeforeUnmount(() => {
		window.removeEventListener('smanga:color-theme-changed', onColorThemeChanged)
	})

	return {
		activeColorTheme,
		isDarkMode,
		toggleDarkMode,
		applyColorTheme,
	}
}