<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-06-12 22:32:48
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 15:41:23
 * @FilePath: \smanga\src\views\log\index.vue
-->
<template>
	<div class="log">
		<div class="content-area">
			<p v-for="item in list" :key="item.logId">
				<span class="time">{{ item.createTime }}: &nbsp;</span>
				<span :class="logColor(item.logType)">{{ item.logContent }}</span>
			</p>
		</div>
		<!--分页-->
		<table-pager ref="pager" @pageChange="load_table" :count="count" />
	</div>
</template>

<script lang="ts" setup>
import logApi from '@/api/log';
import { computed, ref, onMounted } from 'vue';
import tablePager from '@/components/table-pager.vue';

const count = ref(0);

type logItemType = {
	logId: number;
	logType: string;
	logLevel: number;
	logContent: string;
	createTime: string;
}

const list = ref<logItemType[]>([
	{
		logId: 1,
		logType: 'error',
		logLevel: 1,
		logContent: '无日志信息',
		createTime: '',
	},
]);

const logColor = computed(() => {
	return function (logType: string) {
		switch (logType) {
			case 'error':
				return 'red';
			case 'process':
				return 'white';
			case 'operate':
				return 'green';
			default:
				return 'white';
		}
	};
});

async function load_table(page: number, pageSize: number) {
	const res: any = await logApi.get_log(page, pageSize);
	count.value = res.count;
	list.value = res.list;
}

onMounted(async () => {
	load_table(1, 10);
});
</script>

<style lang="less" scoped>
.content-area {
	padding: 2rem;
	height: 50rem;
	font-size: 1.4rem;
	line-height: 1.5;
	color: #fff;
	background-color: skyblue;

	.time {
		color: #333;
	}

	.white {
		color: white;
	}

	.green {
		color: green;
	}

	.red {
		color: red;
	}
}
</style>
