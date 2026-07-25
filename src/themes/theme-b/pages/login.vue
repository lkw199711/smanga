<template>
  <div class="tb-login">
    <div class="tb-login-card">
      <h2>smanga</h2>
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
.tb-login-card{width:34rem;padding:4rem;background:rgba(255,255,255,0.8);backdrop-filter:blur(1.6rem);border:1px solid rgba(255,255,255,0.1);border-radius:2.4rem;text-align:center}
.tb-login-card h2{font-size:2.2rem;color:#1f2937;margin:0 0 2.8rem}
.tb-login-card input{display:block;width:100%;padding:1.2rem 1.6rem;margin-bottom:1.4rem;background:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:1.4rem;color:#1f2937;font-size:1.4rem;outline:none;box-sizing:border-box}
.tb-login-card input::placeholder{color:#9ca3af}
.tb-login-card button{width:100%;padding:1.2rem;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:2rem;color:#1f2937;font-size:1.4rem;font-weight:500;cursor:pointer}
.tb-error{color:#f87171;font-size:1.3rem;margin-top:1.2rem}
</style>


