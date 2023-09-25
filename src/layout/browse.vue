<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-25 22:55:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-25 22:59:14
 * @FilePath: /smanga/src/layout/browse.vue
-->
<template>
	<div class="browse" :class="config.browseType">
		<div class="header" v-if="browseTop">
			<browse-top class="nav-top" />
			<div class="seat posted"></div>
		</div>

		<div class="middle" @contextmenu.prevent="context_menu">
			<router-view />
		</div>

		<div class="footer"></div>
	</div>
</template>
<script lang="ts">
export default { name: 'browse' };
</script>
<script setup lang="ts">
import { config } from '@/store';
import browseTop from '@/layout/components/browse-top.vue';

function context_menu() {
	config.rightSidebar = true;
}
</script>

<style scoped lang="less">
.browse {
	display: flex;
	flex-direction: column;

	.middle {
		flex: 1;
		overflow: hidden;
	}

	&.single,
	&.double,
	&.half {
		height: 100vh;
	}
}

.seat.posted {
	height: 60px;
}

.nav-top {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1;
}
</style>
