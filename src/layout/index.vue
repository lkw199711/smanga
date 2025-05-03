<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-08-02 19:27:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-05 22:01:09
 * @FilePath: \smanga\src\layout\index.vue
-->
<template>
	<div class="layout">
		<div class="layout-left">
			<sidebar />
		</div>
		<div class="layout-right">
			<div class="layout-right-top">
				<top-nav />
			</div>
			<div class="layout-right-middle">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {name: 'layout'};
</script>
<script lang="ts" setup>
import topNav from './components/top-nav.vue';
import sidebar from './components/sidebar.vue';
</script>

<style scoped lang="less">
.layout {
	display: flex;
	overflow: hidden;

	&-left {}

	&-right {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;

		&-middle {
			flex: 1;
			overflow: auto;
		}
	}
}
</style>
