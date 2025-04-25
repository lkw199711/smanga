<template>
	<div :class="['login-index', backClass]">
		<div class="seat"></div>

		<!-- 登录面板 -->
		<div class="login-box">
			<div class="logo">
				<img src="../../assets/smanga-logo.png" alt="logo" />
			</div>
			<el-form class="login-form" ref="form" label-width="80px">
				<el-form-item label="用户名:">
					<el-input v-model="userName" placeholder="请输入用户名" type="text"></el-input>
				</el-form-item>

				<el-form-item label="密码:">
					<el-input v-model="passWord" placeholder="请输入内容" type="password"></el-input>
				</el-form-item>
			</el-form>

			<p class="app-box">
				<a href="#" @click="download_apk">下载Android应用</a>
			</p>

			<!--按钮盒子-->
			<div class="btn-box">
				<el-button class="login-btn" type="primary" @click="do_login">登录</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'login',
};
</script>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Cookies } from '@/utils';
import { userInfo } from '@/store';
import loginApi from '@/api/login';

const router = useRouter();
const userName = ref('');
const passWord = ref('');
const backClass = ref('bg' + 1);

onMounted(() => {
	document.onkeypress = (e) => {
		const keycode = document.all ? e.keyCode : e.which;
		if (keycode === 13) {
			do_login();
			return false;
		}
	};

	backClass.value = getBackActive();

	const val = localStorage.getItem('activeBack');
	if (val && val !== '0') backClass.value = 'bg' + val;
})


async function do_login() {
	const loginResponse = await loginApi.login({ userName: userName.value, passWord: passWord.value });

	if (!loginResponse) return;
	// 缓存用户信息
	Object.assign(userInfo, loginResponse);
	Cookies.set('userName', loginResponse.userName);
	Cookies.set('userId', loginResponse.userId);
	Cookies.set('token', loginResponse.token);
	Cookies.set('header', loginResponse.header);
	Cookies.set('token', loginResponse.token)
	Cookies.set('role', loginResponse.userRole)

	await router.push('media-list');

}

function getBackActive() {
	// 取1-16的一个数据整数
	let num = Math.floor(Math.random() * 16) + 1;
	return 'bg' + num;
}

/**
 * @param event {MouseEvent} 事件
 * @description 下载apk文件
 */
async function download_apk(event: MouseEvent) {
	event.preventDefault();
	await loginApi.download_apk();
}

</script>

<style scoped lang="less">
.seat {
	height: 1px;
}

.zindex2 {
	z-index: 2;
}

.login-index {
	width: 100vw;
	height: 100vh;
	// background: url('../../assets/banner/0.png') no-repeat;
	// background-size: cover;
}

.login-box {
	position: absolute;
	z-index: 1;
	top: 50%;
	left: 50%;
	border-radius: 1rem;
	transform: translate(-50%, -50%);
	background-color: rgba(255, 255, 255, 0.25);
	box-shadow: #cccccc 2px 2px 8px;
	backdrop-filter: blur(15px);

	.logo {
		text-align: center;
	}

	.login-form {
		width: 80%;
		margin: 0 auto;
	}
}

.btn-box {
	display: flex;
	justify-content: flex-end;
	width: 80%;
	margin: 0 auto;

	.login-btn {
		width: 100%;
	}
}

.app-box {
	margin: 2rem 0 2rem 6rem;
}

@media only screen and (min-width: 1200px) {
	.login-box {
		margin: -20rem auto;
		width: 44rem;
		height: 32rem;

		.logo {
			margin: 1rem;
		}
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.login-box {
		margin: -16rem auto;
		width: 40rem;
		height: 30rem;

		.logo {
			margin: 1rem;
		}
	}
}

@media only screen and (max-width: 767px) {
	.login-box {
		width: 34rem;
		height: 26rem;
		margin: -12rem auto;
	}
}
</style>

<style scoped lang="less" src="@/style/login-bg.less"></style>
