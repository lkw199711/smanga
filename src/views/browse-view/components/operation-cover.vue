<template>
	<div class="operation-cover" @contextmenu.prevent="context_menu">
		<div class="top" @click="switch_menu" :style="topStyle"></div>
		<div class="middle">
			<div class="left" @click="do_left"></div>
			<div class="right" @click="do_right"></div>
		</div>
		<div class="bottom" @click="switch_footer" :style="bottomStyle"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {config, userConfig} from '@/store';

export default defineComponent({
	name: 'operation-cover',
	// 数据
	data() {
		return {};
	},

	// 传值
	props: [],

	// 引用
	computed: {
		/**
		 * 根据反转设置项 如无反转则前翻译 有反转则向后翻页
		 */
		do_left() {
			return userConfig.pageTurningReverse ? this.next : this.before;
		},
		do_right() {
			return userConfig.pageTurningReverse ? this.before : this.next;
		},

		/**
		 * 配置上下操作面板的尺寸
		 */
		topStyle() {
			const height = userConfig.browseOperationTop + '%';
			return {height};
		},
		bottomStyle() {
			const height = userConfig.browseOperationBottom + '%';
			return {height};
		},
	},

	// 组件
	components: {},

	// 方法
	methods: {
		before() {
			this.$emit('before');
		},
		next() {
			this.$emit('next');
		},
		switch_menu() {
			this.$emit('switchMenu');
		},
		switch_footer() {
			this.$emit('switchFooter');
		},
		context_menu() {
			config.rightSidebar = true;
		},
	},

	// 生命周期
	created() {},
});
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
