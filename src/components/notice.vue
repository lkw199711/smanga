<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-21 22:52:41
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-23 03:55:00
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

const localhost = 'ws://192.168.5.8:9501';
const network = 'ws://' + location.host + '/websocket';

const url = process.env.NODE_ENV === 'development' ? localhost : network;

// userid变换重新告知
watch(
	() => userInfo.userId,
	() => {
		ws.send(userInfo.userId);
	}
);

onMounted(() => {
	socket_init();
	socket_daemon();
});

onBeforeUnmount(() => {
	ws.close();
});

/**
 * @description: 初始化连接
 * @return {*}
 */
function socket_init() {
	ws = new WebSocket(url);
	ws.onopen = () => {
		console.log('socket连接成功');
		ws.send(Cookies.get('userId'));
	};

	ws.onmessage = (e: any) => {
		const res = JSON.parse(e.data);
		socket_message(res);
	};

	ws.onerror = (e: any) => {
		// 链接错误,十秒钟后尝试重连
		setTimeout(socket_init, 10 * 1000);
	};

	ws.onclose = (e: any) => {
		console.log('socket连接关闭');
	};
}

/**
 * @description: 发送消息
 * @param {*} socketRes
 * @return {*}
 */
function socket_message(socketRes: any) {
	if (!socketRes.message) return;

	let type: string;
	switch (Number(socketRes.code)) {
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

	ElNotification({
		title: socketRes.title,
		message: socketRes.message,
		type,
	});
}

/**
 * @description: 链接守护进程
 * 每隔十分钟发送一次信息,发送失败则重启进程
 * @return {*}
 */
function socket_daemon() {
	setInterval(() => {
		if (ws.readyState == 1) {
			ws.send(userInfo.userId);
		} else {
			socket_init();
		}
	}, 2 * 60 * 1000);
}
</script>
