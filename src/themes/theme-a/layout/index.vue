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
import { computed } from 'vue'
import TaSidebar from './sidebar.vue'
import TaTopbar from './topbar.vue'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'
import { useColorTheme } from '@/themes/composables/use-color-theme'
import { useThemeUiStore } from '@/store/theme-ui'
import './dark-overrides.css'

const themeUi = useThemeUiStore()
const refreshKey = computed(() => themeUi.contentRevision)

const { isDarkMode: isDark } = useColorTheme()

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
