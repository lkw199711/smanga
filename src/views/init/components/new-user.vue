<template>
	<div class="new-user-box">
		<p class="title">创建用户</p>
		<p class="note"></p>
		<p class="note">
			软件默认登录用户名密码为 (smanga/smanga)
			,您可以在此界面创建一个新的用户,或者是跳过,使用默认用户登录.
		</p>

		<el-form :model="form" :inline="true">
			<el-form-item label="用户名:">
				<el-input v-model="form.userName" style="width: 11rem" />
			</el-form-item>
			<el-form-item label="密码:">
				<el-input v-model="form.passWord" style="width: 11rem" />
			</el-form-item>
		</el-form>

		<div class="btn-box">
			<el-button type="primary" @click="setting">新建用户</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {reactive, onMounted, defineProps, defineEmits} from 'vue';
import {database_set} from '@/api/login';
import {ElMessage} from 'element-plus';
import {register} from '@/api/account';
import i18n from '@/i18n';

const emit = defineEmits(['update']);
const {t} = i18n.global;
// do not use same name with ref
const form = reactive({
	userName: '',
	passWord: '',
});

async function setting() {
	if (!/^[a-zA-Z]\w{2,19}$/.test(form.userName)) {
		ElMessage({
			message: t('account.formWarning'),
			type: 'warning',
		});
		return false;
	}
	const res = await register(form);
	const code = res.data?.code;

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
