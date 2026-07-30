<template>
  <div class="ta-login">
    <div class="ta-login-card">
      <div class="ta-login-logo">
        <div class="ta-logo-mark">S</div>
        <div class="ta-logo-text">smanga</div>
      </div>
      <h2>登录</h2>
      <form @submit.prevent="doLogin">
        <div class="ta-form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="ta-form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" />
        </div>
        <button class="ta-btn-login" type="submit">登录</button>
      </form>
      <p v-if="error" class="ta-error">{{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import loginApi from '@/api/login'
import { useSessionStore } from '@/store/session'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const session = useSessionStore()

async function doLogin() {
  error.value = ''
  try {
    const res = await loginApi.login({ userName: username.value, passWord: password.value })
    if (res?.token && res?.serverKey) {
      session.start(res)
      await router.push('/t')
    } else {
      error.value = '用户名或密码错误'
    }
  } catch (e) {
    error.value = '登录失败，请重试'
  }
}
</script>

<style scoped>
.ta-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #fafafa;
}

.ta-login-card {
  width: 36rem;
  padding: 4rem;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 1.6rem;
  box-shadow: 0 0.4rem 2.4rem rgba(0,0,0,0.04);
}

.ta-login-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.4rem;
}

.ta-logo-mark {
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #171717;
  color: #fff;
  font-weight: 700;
  border-radius: 0.8rem;
}

.ta-logo-text {
  font-size: 1.8rem;
  font-weight: 700;
}

.ta-login-card h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2.4rem;
}

.ta-form-group {
  margin-bottom: 1.6rem;
}

.ta-form-group label {
  display: block;
  font-size: 1.3rem;
  color: #4b5563;
  margin-bottom: 0.6rem;
}

.ta-form-group input {
  width: 100%;
  padding: 1rem 1.2rem;
  font-size: 1.4rem;
  border: 1px solid #eaeaea;
  border-radius: 0.8rem;
  outline: none;
  box-sizing: border-box;
}

.ta-form-group input:focus {
  border-color: #2563eb;
}

.ta-btn-login {
  width: 100%;
  padding: 1.1rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  margin-top: 0.8rem;
}

.ta-btn-login:hover {
  background: #1d4ed8;
}

.ta-error {
  margin-top: 1.2rem;
  font-size: 1.3rem;
  color: #ef4444;
  text-align: center;
}
</style>
