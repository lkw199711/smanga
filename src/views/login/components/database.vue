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
		<el-button type="success" @click="check">测试链接</el-button>
		<el-button type="primary" @click="setting">确认修改</el-button>
	</div>
</template>

<script lang="ts" setup>
import {reactive, onMounted} from 'vue';
import {database_check, database_set, database_get} from '@/api/login';
import {ElMessage} from 'element-plus';

// do not use same name with ref
const form = reactive({
	ip: '127.0.0.1',
	port: '3306',
	userName: 'smanga',
	passWord: 'smanga',
});

onMounted(async () => {
	const res = await database_get();
	const data = res.data.data;

	Object.assign(form, data);
});

function check() {
	if (!form_check()) return false;
	database_check(form);
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

function setting() {
	if (!form_check()) return false;
	database_set(form);
}
</script>

<style scoped lang="less">
.database-box {
	background-color: rgba(255, 255, 255, 0.25);
	box-shadow: #cccccc 2px 2px 8px;
	backdrop-filter: blur(15px);
}

.note {
	background-color: transparent;
}

.title {
	color: grey;
	font-size: 1.6rem;
	margin-bottom: 2rem;
}

@media only screen and (min-width: 1200px) {
	.database-box {
		position: absolute;
		top: 60%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 2rem 2rem;
		width: 40rem;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.database-box {
		position: absolute;
		top: 60%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 2rem 2rem;
		width: 40rem;
	}
}

@media only screen and (max-width: 767px) {
	.database-box {
		position: absolute;
		top: 74%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 2rem 2rem;
		width: 32rem;
	}
}
</style>
