<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-25 22:59:45
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 09:46:56
 * @FilePath: /smanga/src/views/browse-view/components/operation-cover.vue
-->
<template>
	<div class="operation-cover" v-show="config.enableOperation">
		<div class="top" @click="switch_menu" :style="topStyle"></div>
		<div class="middle">
			<div class="left" @click="do_left"></div>
			<div class="right" @click="do_right"></div>
		</div>
		<div class="bottom" @click="switch_footer" :style="bottomStyle"></div>
	</div>
</template>

<script lang="ts">
export default { name: 'operation-cover' };
</script>
<script setup lang="ts">
import { computed } from 'vue';
import { config, userConfig } from '@/store';

/**
* 根据反转设置项 如无反转则前翻译 有反转则向后翻页
*/
let do_left = computed(() => {
	return userConfig.pageTurningReverse ? next : before;
})

let do_right = computed(() => {
	return userConfig.pageTurningReverse ? before : next;
})

let topStyle = computed(() => {
	const height = userConfig.browseOperationTop + '%';
	return { height };
})

let bottomStyle = computed(() => {
	const height = userConfig.browseOperationBottom + '%';
	return { height };
})


const emit = defineEmits([
	'before',
	'next',
	'switchMenu',
	'switchFooter',
]);

function before() {
	emit('before');
}
function next() {
	emit('next');
}
function switch_menu() {
	emit('switchMenu');
}
function switch_footer() {
	emit('switchFooter');
}
function context_menu() {
	config.rightSidebar = true;
}

</script>

<style scoped lang="less">
.operation-cover {
	position: absolute;
	display: flex;
	flex-direction: column;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;

	.top {
		height: 30%;
	}

	.middle {
		display: flex;
		flex: 1;

		.left {
			width: 50%;
			height: 100%;
		}

		.right {
			width: 50%;
			height: 100%;
		}
	}

	.bottom {
		height: 30%;
	}
}
</style>
