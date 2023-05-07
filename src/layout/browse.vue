<template>
	<div class="browse" :class="browseType">
		<div class="header" v-if="browseTop">
			<browse-top class="nav-top" />
			<div class="seat posted"></div>
		</div>

		<div class="middle">
			<router-view />
		</div>

		<div class="footer"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {config} from '@/store';
import browseTop from '@/layout/components/browse-top.vue';

export default defineComponent({
	name: 'browse',
	// 数据
	data() {
		return {};
	},

	// 传值
	props: [],

	// 引用
	computed: {
		browseTop() {
			return config.browseTop;
		},
		browseType() {
			return config.browseType;
		},
		calcHeight() {
			if (config.browseType === 'flow') {
				return {};
			} else {
				return {height: '100vh'};
			}
		},
	},

	// 组件
	components: {browseTop},

	// 方法
	methods: {},

	// 生命周期
	created() {},
});
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
