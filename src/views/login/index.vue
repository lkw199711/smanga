<template>
	<div class="login-index">
		<div class="seat"></div>

		<!-- 登录面板 -->
		<div class="login-box">
			<div class="logo">
				<img src="../../assets/smanga-logo.png" alt="logo" />
			</div>
			<el-form class="login-form" ref="form" :model="form" label-width="80px">
				<el-form-item label="用户名:">
					<el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
				</el-form-item>

				<el-form-item label="密码:">
					<el-input v-model="form.passWord" placeholder="请输入内容"></el-input>
				</el-form-item>
			</el-form>

			<p class="app-box">
				<a href="/file/smanga1.1.apk">下载Android应用</a>
			</p>

			<!--按钮盒子-->
			<div class="btn-box">
				<el-button class="login-btn" type="primary" @click="do_login">登录</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import userApi from '@/api/account';
import { Cookies } from '@/utils';

import { power, userInfo } from '@/store';

export default defineComponent({
	name: 'index',
	// 数据
	data() {
		return {
			form: {
				userName: '',
				passWord: '',
			},
			showDatabase: false,
		};
	},

	// 传值
	props: [],

	// 计算
	computed: {},

	// 组件
	components: {},

	// 方法
	methods: {
		async do_login() {
			const res = await userApi.login(this.form);
			if (res.code === 0) {
				// 缓存用户信息
				const resInfo = res.request;
				Object.assign(userInfo, resInfo);
				Cookies.set('userName', resInfo.userName);
				Cookies.set('userId', resInfo.userId);
				Cookies.set('editMedia', resInfo.editMedia);
				Cookies.set('editUser', resInfo.editUser);
				power.editMedia = resInfo.editMedia == 1;
				power.editUser = resInfo.editUser == 1;

				await this.$router.push('media-list');
			}
		},
	},

	// 生命周期
	created() {
		document.onkeypress = (e) => {
			const keycode = document.all ? e.keyCode : e.which;
			if (keycode === 13) {
				this.do_login();
				return false;
			}
		};
	},
});
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
	background: url('../../assets/banner/0.png') no-repeat;
	background-size: cover;
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
