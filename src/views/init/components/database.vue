<template>
	<div class="database-box">
		<p class="title">数据库链接</p>
		<p class="note"></p>
		<p class="note">
			外置数据库操作, 请先处理好数据库连通, 然后新建一个'smanga'的数据库,
			测试链接方可成功. 之后请手动导入sql文件.
			如不使用外置数据库则不需要设置此项.
			<a href="/file/smanga.sql">数据库导入文件</a>
		</p>

		<el-form :model="form" :inline="true">
			<el-form-item label="database:">
				<el-input v-model="form.database" style="width: 28rem" />
			</el-form-item>
			<el-form-item label="ip:">
				<el-input v-model="form.ip" style="width: 16rem" />
			</el-form-item>
			<el-form-item label="端口:">
				<el-input v-model="form.port" style="width: 9rem" />
			</el-form-item>
			<el-form-item label="用户名:">
				<el-input v-model="form.userName" style="width: 11rem" />
			</el-form-item>
			<el-form-item label="密码:">
				<el-input v-model="form.passWord" style="width: 11rem" />
			</el-form-item>
		</el-form>

		<div class="btn-box">
			<!-- <el-button type="success" @click="check">测试链接</el-button> -->
			<el-button type="primary" @click="setting">确认修改</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {reactive, onMounted, defineProps, defineEmits} from 'vue';
import {database_check, database_set, database_get} from '@/api/login';
import {ElMessage} from 'element-plus';

const emit = defineEmits(['update']);

// do not use same name with ref
const form = reactive({
	ip: '127.0.0.1',
	database: 'smanga',
	port: '3306',
	userName: 'smanga',
	passWord: 'smanga',
});

onMounted(async () => {
	const res = await database_get();
	const data = res.data;

	if (data.code === 0) {
		Object.assign(form, data);
	}

	await check();
});

async function check() {
	if (!form_check()) return false;
	const res = await database_check(form);
	const code = res.data.code;
	emit('update', code === 0);
}

function form_check() {
	if (!form.ip) {
		ElMessage.warning('请填写ip地址');
		return false;
	}
	if (!form.userName) {
		ElMessage.warning('请填写用户名');
		return false;
	}
	if (!form.passWord) {
		ElMessage.warning('请填写密码');
		return false;
	}
	if (!form.port) {
		ElMessage.warning('请填端口');
		return false;
	}

	return true;
}

async function setting() {
	if (!form_check()) return false;
	const res = await database_set(form);
	const code = res.data.code;
	emit('update', code === 0);
}
</script>

<style scoped lang="less">
.title {
	color: grey;
	font-size: 1.6rem;
	margin-bottom: 2rem;
}
.btn-box {
	text-align: right;
}
</style>
