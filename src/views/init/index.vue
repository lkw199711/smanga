<template>
	<div class="init">
		<div class="top">
			<div class="logo">
				<img src="../../assets/smanga-logo.png" alt="logo" />
			</div>
			<div :class="['title', setps[active].titlestate]">
				{{ setps[active].titleText }}
			</div>
		</div>
		<div class="middle">
			<div class="middle-content">
				<!-- 数据库设置 -->
				<database
					:firstLoad="firstLoad"
					@update="update_database_view"
					v-if="active === 0" />
				<new-user @update="update_user_view" v-if="active === 1" />
				<database-update
					@update="update_system_view"
					:firstLoad="firstLoad"
					v-if="active === 2" />
				<result v-if="active === 3" />
			</div>
		</div>
		<div class="bottom">
			<div class="bottom-content">
				<el-steps :active="active" align-center v-if="isPhone">
					<el-step title="数据库" />
					<el-step title="新建用户" />
					<el-step title="初始化" />
					<el-step title="完成" />
				</el-steps>
				<el-steps :active="active" align-center v-else>
					<el-step title="数据库" description="设置数据库链接" />
					<el-step title="新建用户" description="新建用户" />
					<el-step title="初始化" description="数据库与环境升级" />
					<el-step title="完成" description="版本信息与注意事项" />
				</el-steps>
				<div class="btn-box">
					<el-button
						type="danger"
						@click="before"
						:loading="btnLoading"
						:disabled="btnDisabled"
						>上一步</el-button
					>
					<el-button
						type="success"
						@click="next"
						:loading="btnLoading"
						:disabled="btnDisabled"
						>下一步</el-button
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router';
import {computed} from 'vue';
import database from './components/database.vue';
import newUser from './components/new-user.vue';
import databaseUpdate from './components/database-update.vue';
import result from './components/result.vue';

const router = useRouter();

import {ref} from 'vue';
import {config} from '@/store';

const setps = ref([
	{
		titleText: 'smanga正在进行初始化......',
		titlestate: 'default',
	},
	{
		titleText: '创建用户或是跳过',
		titlestate: 'default',
	},
	{
		titleText: 'smanga正在进行数据库与环境升级......',
		titlestate: 'default',
	},
	{
		titleText: 'smanga初始化成功!',
		titlestate: 'success',
	},
]);

const active = ref(0);
const btnLoading = ref(true);
const btnDisabled = ref(false);
const firstLoad = ref(true);

const isPhone = computed(() => {
	const screenType = config.screenType;
	return screenType === 'small' || screenType === 'mini';
});

function before() {
	if (active.value > 0) active.value--;
}

function next() {
	if (active.value < 3) active.value++;
}

function update_database_view(test: boolean) {
	btnLoading.value = false;
	btnDisabled.value = !test;
	firstLoad.value = false;

	setps.value[0].titleText = test
		? '数据库连接成功,您可以继续操作'
		: '数据库连接失败,请检查配置';
	setps.value[0].titlestate = test ? 'success' : 'fail';
}

function update_user_view(test: boolean) {
	btnLoading.value = false;
	btnDisabled.value = !test;
	firstLoad.value = false;

	setps.value[1].titleText = test ? '新建用户成功' : '新建用户失败';
	setps.value[1].titlestate = test ? 'success' : 'fail';
}

function update_system_view(
	test: boolean,
	targetStep: number,
	targetText: string
) {
	active.value = targetStep;
	setps.value[targetStep].titleText = targetText;
	setps.value[targetStep].titlestate = test ? 'success' : 'fail';
}
</script>

<style scoped lang="less">
.init {
	position: relative;
	height: 100vh;
	background-color: #0082c9;
}
.top {
	position: absolute;
	top: 0;
	width: 100%;
	height: 10rem;
	padding: 2rem 0;
	.logo {
		text-align: center;
	}
	.title {
		margin: 0 auto;
		line-height: 4rem;
		border-radius: 2rem;
		background-color: #fff;
		text-align: center;
		&.success {
			color: green;
		}
		&.fail {
			color: red;
		}
	}
}

.middle {
	position: absolute;
	top: 20rem;
	bottom: 30rem;
	width: 100%;
	&-content {
		margin: 0rem auto;
		padding: 2rem 2rem;
		height: 100%;
		border-radius: 1rem;
		background-color: #fff;
		overflow: hidden;
	}
}

.bottom {
	position: absolute;
	bottom: 0;
	width: 100%;

	&-content {
		margin: 2rem auto;
		padding: 2rem;
		border-radius: 1rem;
		background-color: #fff;
	}

	.btn-box {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
	}
}

@media only screen and (min-width: 1200px) {
	.top {
		.title {
			width: 48rem;
		}
	}
	.middle {
		&-content {
			width: 42rem;
		}
	}
	.bottom {
		&-content {
			width: 82rem;
		}

		.btn-box {
			padding: 0 4rem;
		}
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.top {
		.title {
			width: 48rem;
		}
	}
	.middle {
		&-content {
			width: 42rem;
		}
	}
	.bottom {
		&-content {
			width: 82rem;
		}

		.btn-box {
			padding: 0 4rem;
		}
	}
}

@media only screen and (max-width: 767px) {
	.top {
		.logo {
			display: none;
		}
		.title {
			width: 90%;
		}
	}
	.middle {
		top: 8rem;
		bottom: 23rem;
		&-content {
			padding: 2rem 2rem;
			width: 80%;
		}
	}
	.bottom {
		&-content {
			width: 80%;
		}

		.btn-box {
			padding: 0 4rem;
		}
	}
}
</style>
