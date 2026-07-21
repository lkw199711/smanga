<template>
	<div class="style-a">
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

const refreshKey = ref(0)
function refreshPage() { refreshKey.value += 1 }
onMounted(() => window.addEventListener('smanga:theme-context-menu-changed', refreshPage))
onBeforeUnmount(() => window.removeEventListener('smanga:theme-context-menu-changed', refreshPage))
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
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sa-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	overflow: hidden;
}

.sa-main {
	flex: 1;
	padding: 28px;
	overflow: auto;
}
</style>
