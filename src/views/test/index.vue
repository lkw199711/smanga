<template>
	<div class="index">
		<h1>test</h1>
		<el-button @click="do_test">测试</el-button>
		<el-button @click="test_laravel">测试laravel</el-button>
		<el-button @click="websocket_send">发送消息</el-button>
		<el-button @click="websocket_close">关闭连接</el-button>
		<el-drawer
			v-model="drawer"
			title="I am the title"
			:direction="direction"
			:before-close="handleClose">
			<span>Hi, there!</span>
		</el-drawer>
		<el-drawer v-model="drawer2" :direction="direction">
			<template #header>
				<h4>set title by slot</h4>
			</template>
			<template #default>
				<div>
					<el-radio v-model="radio1" label="Option 1" size="large"
						>Option 1</el-radio
					>
					<el-radio v-model="radio1" label="Option 2" size="large"
						>Option 2</el-radio
					>
				</div>
			</template>
			<template #footer>
				<div style="flex: auto">
					<el-button @click="cancelClick">cancel</el-button>
					<el-button type="primary" @click="confirmClick">confirm</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import {defineComponent} from 'vue';
import {testAxios} from '@/api/test';
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {ElMessageBox} from 'element-plus';
import {ajax} from '@/api';
import {Cookies} from '@/utils';

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

onMounted(() => {});

onBeforeUnmount(() => {});

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
	console.log(res.data?.list);
}
</script>

<style scoped lang="less"></style>
