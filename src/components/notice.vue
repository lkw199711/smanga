<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-21 22:52:41
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-22 21:21:51
 * @FilePath: \smanga\src\components\notice.vue
-->
<template>
	<div class="notice"></div>
</template>

<script lang="ts" setup>
import {userInfo} from '@/store';
import {Cookies} from '@/utils';
import {ElNotification} from 'element-plus';
import {onMounted, onBeforeUnmount, watch} from 'vue';

let ws: any;

const url =
	process.env.NODE_ENV === 'development'
		? 'ws://192.168.5.8:9501'
		: 'ws://127.0.0.1/websocket';

// userid变换重新告知
watch(
	() => userInfo.userId,
	() => {
		ws.send(userInfo.userId);
	}
);

onMounted(() => {
	ws = new WebSocket(url);
	ws.onopen = () => {
		console.log('socket连接成功');
		ws.send(Cookies.get('userId'));
	};

	ws.onmessage = (e: any) => {
		const res = JSON.parse(e.data);

		if (!res.message) return;

		let type: string;
		switch (Number(res.code)) {
			case 0:
				type = 'success';
				break;
			case 1:
				type = 'error';
				break;
			case 2:
				type = 'warning';
				break;
			default:
				type = 'info';
				break;
		}
		console.log(res);

		ElNotification({
			title: res.title,
			message: res.message,
			type,
		});

		console.log(res.message);
	};

	ws.onclose = (e: any) => {
		console.log('socket连接关闭');
	};
});

onBeforeUnmount(() => {
	ws.close();
});
</script>
