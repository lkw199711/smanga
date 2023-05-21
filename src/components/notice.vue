<template>
	<div class="notice"></div>
</template>

<script lang="ts" setup>
import {Cookies} from '@/utils';
import {ElNotification} from 'element-plus';
import {onMounted, onBeforeUnmount} from 'vue';

let ws: any;

onMounted(() => {
	ws = new WebSocket('ws://192.168.5.8:9501');
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
		}console.log(res);

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
