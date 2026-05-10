<template>
  <div class="tb-login">
    <div class="tb-login-card">
      <h2>✨ smanga</h2>
      <form @submit.prevent="doLogin">
        <input v-model="username" type="text" placeholder="用户名" />
        <input v-model="password" type="password" placeholder="密码" />
        <button type="submit">登录</button>
      </form>
      <p v-if="error" class="tb-error">{{ error }}</p>
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
async function doLogin(){ error.value=''; try{ const r=await loginApi.login({userName:username.value,passWord:password.value}); if(r)router.push('/t'); else error.value='登录失败' }catch(e){error.value='登录失败'} }
</script>
<style scoped>
.tb-login{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(160deg,#1a1040,#2d1b69)}
.tb-login-card{width:340px;padding:40px;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;text-align:center}
.tb-login-card h2{font-size:22px;color:#fff;margin:0 0 28px}
.tb-login-card input{display:block;width:100%;padding:12px 16px;margin-bottom:14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:14px;outline:none;box-sizing:border-box}
.tb-login-card input::placeholder{color:rgba(255,255,255,0.4)}
.tb-login-card button{width:100%;padding:12px;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:20px;color:#fff;font-size:14px;font-weight:500;cursor:pointer}
.tb-error{color:#f87171;font-size:13px;margin-top:12px}
</style>
