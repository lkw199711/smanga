<template>
	<div class="style-a">
		<ta-sidebar />
		<div class="sa-body">
			<ta-topbar />
			<main class="sa-main">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import TaSidebar from './sidebar.vue'
import TaTopbar from './topbar.vue'
</script>

<style scoped>
.style-a {
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
