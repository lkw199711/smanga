<template>
  <div class="tb-layout" :class="{ 'tb-dark': isDark }">
    <tb-sidebar />
    <div class="tb-layout-right">
      <tb-topbar />
      <div class="tb-layout-content">
        <router-view :key="refreshKey" />
      </div>
    </div>
    <theme-context-menu />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import TbSidebar from './sidebar.vue'
import TbTopbar from './topbar.vue'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import './dark-overrides.css'

const refreshKey = ref(0)
function refreshPage() { refreshKey.value += 1 }

const isDark = ref(false)
function readCookieTheme(): string {
	const m = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/)
	return m ? decodeURIComponent(m[1]) : ''
}
function syncDark() {
	isDark.value = readCookieTheme() === 'dark'
}
function onColorThemeChanged() { syncDark() }

onMounted(() => {
	syncDark()
	window.addEventListener('smanga:theme-context-menu-changed', refreshPage)
	window.addEventListener('smanga:color-theme-changed', onColorThemeChanged)
})
onBeforeUnmount(() => {
	window.removeEventListener('smanga:theme-context-menu-changed', refreshPage)
	window.removeEventListener('smanga:color-theme-changed', onColorThemeChanged)
})
</script>

<style scoped>
.tb-layout {
	--tcm-bg: rgba(255, 255, 255, .96);
	--tcm-text: #1f2937;
	--tcm-border: rgba(0, 0, 0, .1);
	--tcm-hover: #f8e7f0;
	display: flex;
	height: 100vh;
	overflow: hidden;
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	position: relative;
}

.tb-layout.tb-dark {
	--tcm-bg: rgba(30, 41, 59, .96);
	--tcm-text: #e5e7eb;
	--tcm-border: rgba(255, 255, 255, .1);
	--tcm-hover: #374151;
	background: linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%);
	color: #e5e7eb;
}

.tb-layout-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	padding: 16px;
}

.tb-layout-content {
	flex: 1;
	overflow: auto;
	padding: 0;
}
</style>