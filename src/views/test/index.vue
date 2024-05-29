<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-08-17 20:57:16
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 11:15:21
 * @FilePath: /smanga/src/views/test/index.vue
-->
<template>
	<div class="index">
		<h1>test</h1>
		<el-button @click="do_test">测试</el-button>
		<el-button @click="test_laravel">测试laravel</el-button>
		<el-drawer v-model="drawer" title="I am the title" :direction="direction" :before-close="handleClose">
			<span>Hi, there!</span>
		</el-drawer>
		<el-drawer v-model="drawer2" :direction="direction">
			<template #header>
				<h4>set title by slot</h4>
			</template>
			<template #default>
				<div>
					<el-radio v-model="radio1" label="Option 1" size="large">Option 1</el-radio>
					<el-radio v-model="radio1" label="Option 2" size="large">Option 2</el-radio>
				</div>
			</template>
			<template #footer>
				<div style="flex: auto">
					<el-button @click="cancelClick">cancel</el-button>
					<el-button type="primary" @click="confirmClick">confirm</el-button>
				</div>
			</template>
		</el-drawer>

		<div class="touch-demo"></div>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import { testAxios } from '@/api/test';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessageBox } from 'element-plus';
import { ajax } from '@/api';
import { Cookies } from '@/utils';

const drawer = ref(false);
const drawer2 = ref(false);
const direction = ref('rtl');
const radio1 = ref('Option 1');
const handleClose = (done: () => void) => {
	ElMessageBox.confirm('Are you sure you want to close this?')
		.then(() => {
			done();
		})
		.catch(() => {
			// catch error
		});
};

onMounted(() => {
	var div = document.querySelector('.touch-demo');
	if(!div) return;
	// 获取手指初始坐标和盒子的原来位置
	var startX = 0;
	var startY = 0;
	// 获取盒子原来的位置
	var x = 0;
	var y = 0;
	div.addEventListener('touchstart', function (this: HTMLElement, e: Event) {
		console.log('start事件');
		// 使用类型断言来告诉 TypeScript 这是 TouchEvent
		const touchEvent = e as TouchEvent;
		// 得到初始的手指坐标
		startX = touchEvent.targetTouches[0].pageX;
		startY = touchEvent.targetTouches[0].pageY;
		// 获取盒子坐标
		x = this.offsetLeft;
		y = this.offsetTop;
	})
	div.addEventListener('touchmove', function (this: HTMLElement, e) {
		const touchEvent = e as TouchEvent;
		// 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
		var moveX = touchEvent.targetTouches[0].pageX - startX;
		var moveY = touchEvent.targetTouches[0].pageY - startY;
		// 移动盒子，盒子原来的位置+手指移动的距离
		this.style.left = x + moveX + 'px';
		this.style.top = y + moveY + 'px';
		// 阻止屏幕滚动行为
		e.preventDefault();
	})

	div.addEventListener('touchend', function (this: HTMLElement, e) {
		console.log('end事件');
		
		this.style.left = '0';
		// this.style.top = y + 'px';
	})
});

onBeforeUnmount(() => { });

function cancelClick() {
	drawer2.value = false;
}
function confirmClick() {
	ElMessageBox.confirm(`Are you confirm to chose ${radio1.value} ?`)
		.then(() => {
			drawer2.value = false;
		})
		.catch(() => {
			// catch error
		});
}
function do_test() {
	drawer.value = true;
}

async function test_laravel() {
	const res: any = await ajax({
		headers: {
			// 'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN')
		},
		url: 'http://laravel.cc:81/d3',
		data: {
			page: 1,
		},
	});
	console.log(res.data.list);
}
</script>

<style scoped lang="less">
div.touch-demo {
	position: absolute;
	left: 0;
	width: 100px;
	height: 100px;
	background-color: plum;
}
</style>
