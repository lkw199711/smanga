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

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

async function doLogin() {
  error.value = ''
  try {
    const res = await loginApi.login({ userName: username.value, passWord: password.value })
    if (res) {
      router.push('/')
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
  width: 360px;
  padding: 40px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.ta-login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.ta-logo-mark {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #171717;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
}

.ta-logo-text {
  font-size: 18px;
  font-weight: 700;
}

.ta-login-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px;
}

.ta-form-group {
  margin-bottom: 16px;
}

.ta-form-group label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 6px;
}

.ta-form-group input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
}

.ta-form-group input:focus {
  border-color: #2563eb;
}

.ta-btn-login {
  width: 100%;
  padding: 11px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
}

.ta-btn-login:hover {
  background: #1d4ed8;
}

.ta-error {
  margin-top: 12px;
  font-size: 13px;
  color: #ef4444;
  text-align: center;
}
</style>
