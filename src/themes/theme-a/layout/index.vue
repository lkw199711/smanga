<template>
	<div class="style-a" :class="{ 'sa-dark': isDark }">
		<ta-sidebar />
		<div class="sa-body">
			<ta-topbar />
			<main class="sa-main">
				<router-view :key="refreshKey" />
			</main>
		</div>
		<theme-context-menu />
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import TaSidebar from './sidebar.vue'
import TaTopbar from './topbar.vue'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import './dark-overrides.css'

const refreshKey = ref(0)
function refreshPage() { refreshKey.value += 1 }

// ---- 夜间模式 ----
function getCookie(name: string): string | undefined {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop()?.split(';').shift()
	return undefined
}

const isDark = ref((getCookie('theme') || 'light') === 'dark')

function onColorThemeChanged(e: Event) {
	const detail = (e as CustomEvent).detail as string | undefined
	const theme = detail || getCookie('theme') || 'light'
	isDark.value = theme === 'dark'
}

onMounted(() => {
	window.addEventListener('smanga:theme-context-menu-changed', refreshPage)
	window.addEventListener('smanga:color-theme-changed', onColorThemeChanged)
})
onBeforeUnmount(() => {
	window.removeEventListener('smanga:theme-context-menu-changed', refreshPage)
	window.removeEventListener('smanga:color-theme-changed', onColorThemeChanged)
})
</script>

<style scoped>
.style-a {
	--tcm-bg: #fff;
	--tcm-text: #171717;
	--tcm-border: #e5e7eb;
	--tcm-hover: #f3f4f6;
	display: flex;
	height: 100vh;
	overflow: hidden;
	background: #fafafa;
	color: #171717;
	font-size: 1.4rem;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.style-a.sa-dark {
	--tcm-bg: #1f2937;
	--tcm-text: #e5e7eb;
	--tcm-border: #374151;
	--tcm-hover: #374151;
	background: #0f172a;
	color: #e5e7eb;
}

.sa-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.sa-main {
	flex: 1;
	padding: 2.8rem;
	overflow: auto;
}
</style>