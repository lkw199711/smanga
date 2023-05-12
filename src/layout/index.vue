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
				<router-view v-slot="{Component}">
					<keep-alive :include="['search', 'manga-list', 'chapter-list']">
					<component :is="Component" />
					</keep-alive>
				</router-view>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import topNav from './components/top-nav.vue';
import sidebar from './components/sidebar.vue';

export default defineComponent({
	name: 'layout',
	// 数据
	data() {
		return {};
	},

	// 传值
	props: [],

	// 引用
	computed: {},

	// 组件
	components: {topNav, sidebar},

	// 方法
	methods: {},

	// 生命周期
	created() {},
});
</script>

<style scoped lang="less">
.layout {
	display: flex;
	overflow: hidden;

	&-left {
	}

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
