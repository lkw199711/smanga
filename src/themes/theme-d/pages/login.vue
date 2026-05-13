<template>
  <div class="td-login">
    <div class="td-login-card">
      <h1 class="td-login-title">SManga</h1>
      <p class="td-login-sub">登录以继续</p>
      <div class="td-form-group">
        <input class="td-input" v-model="form.username" placeholder="用户名" @keyup.enter="login" />
      </div>
      <div class="td-form-group">
        <input class="td-input" type="password" v-model="form.password" placeholder="密码" @keyup.enter="login" />
      </div>
      <button class="td-btn-login" @click="login">登录</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import loginApi from '@/api/login'

const router = useRouter()
const form = reactive({ username: '', password: '' })

async function login() {
  try {
    const r = await loginApi.login({ userName: form.username, passWord: form.password })
    if (r?.token) {
      document.cookie = `token=${r.token}; path=/`
      router.push('/t')
    }
  } catch { alert('登录失败') }
}
</script>

<style scoped>
.td-login { display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg); }
.td-login-card { width: 340px; background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 40px 32px; text-align: center; }
.td-login-title { font-size: 24px; font-weight: 700; color: var(--accent); margin: 0 0 4px; }
.td-login-sub { font-size: 13px; color: var(--fg2); margin: 0 0 24px; }
.td-form-group { margin-bottom: 14px; }
.td-input { width: 100%; height: 40px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font-size: 14px; outline: none; box-sizing: border-box; }
.td-input:focus { border-color: var(--accent); }
.td-btn-login { width: 100%; height: 40px; border-radius: 10px; background: var(--accent); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: opacity .2s; }
.td-btn-login:hover { opacity: 0.85; }
</style>
