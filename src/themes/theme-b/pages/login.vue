<template>
  <div class="tb-login">
    <!-- 柔光光斑：与主题布局同源的马卡龙色系 -->
    <div class="tb-bg-blob tb-bg-blob-1"></div>
    <div class="tb-bg-blob tb-bg-blob-2"></div>
    <div class="tb-bg-blob tb-bg-blob-3"></div>

    <div class="tb-login-card">
      <h2>smanga</h2>
      <p class="tb-login-sub">欢迎回来</p>
      <form @submit.prevent="doLogin">
        <input v-model="username" type="text" placeholder="用户名" autocomplete="username" />
        <input v-model="password" type="password" placeholder="密码" autocomplete="current-password" />
        <button type="submit" :disabled="loading">{{ loading ? '登录中…' : '登录' }}</button>
      </form>
      <p v-if="error" class="tb-error">{{ error }}</p>
      <p class="tb-apk-box">
        <a href="#" @click.prevent="downloadApk">{{ apkDownloading ? '正在下载…' : '下载 Android 应用' }}</a>
      </p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import loginApi from '@/api/login'
import { useSessionStore } from '@/store/session'
const router = useRouter()
const session = useSessionStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const apkDownloading = ref(false)

// 下载套壳 APK：复用旧版 file/apk 接口
async function downloadApk() {
  if (apkDownloading.value) return
  apkDownloading.value = true
  try {
    await loginApi.download_apk()
  } finally {
    apkDownloading.value = false
  }
}
async function doLogin(){
  if (loading.value) return
  error.value=''
  loading.value = true
  try {
    const r = await loginApi.login({ userName: username.value, passWord: password.value })
    if (r?.token && r?.serverKey) {
      session.start(r)
      await router.push('/t')
    } else {
      error.value = '登录失败'
    }
  } catch {
    error.value = '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* 背景与 theme-b 布局保持同一渐变，登录前后视觉连续 */
.tb-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
  overflow: hidden;
}

.tb-bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(7rem);
  pointer-events: none;
}

.tb-bg-blob-1 {
  width: 40rem;
  height: 40rem;
  top: -12rem;
  left: -8rem;
  background: rgba(236, 72, 153, 0.16);
}

.tb-bg-blob-2 {
  width: 36rem;
  height: 36rem;
  right: -10rem;
  bottom: -10rem;
  background: rgba(168, 85, 247, 0.14);
}

.tb-bg-blob-3 {
  width: 28rem;
  height: 28rem;
  left: 58%;
  top: -10rem;
  background: rgba(96, 165, 250, 0.14);
}

.tb-login-card {
  position: relative;
  z-index: 1;
  width: 34rem;
  max-width: calc(100vw - 3.2rem);
  padding: 4rem;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2rem) saturate(140%);
  -webkit-backdrop-filter: blur(2rem) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 2.4rem;
  box-shadow: 0 1rem 4rem rgba(168, 85, 247, 0.12);
  text-align: center;
}

.tb-login-card h2 {
  font-size: 2.2rem;
  color: #1f2937;
  margin: 0 0 0.6rem;
}

.tb-login-sub {
  font-size: 1.3rem;
  color: #6b7280;
  margin: 0 0 2.8rem;
}

.tb-login-card input {
  display: block;
  width: 100%;
  padding: 1.2rem 1.6rem;
  margin-bottom: 1.4rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #ede9fe;
  border-radius: 1.4rem;
  color: #1f2937;
  font-size: 1.4rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tb-login-card input::placeholder {
  color: #9ca3af;
}

.tb-login-card input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 0.3rem rgba(168, 85, 247, 0.12);
}

.tb-login-card button {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border: none;
  border-radius: 2rem;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, box-shadow 0.2s;
}

.tb-login-card button:hover {
  box-shadow: 0 0.4rem 1.6rem rgba(168, 85, 247, 0.3);
}

.tb-login-card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tb-error {
  color: #ef4444;
  font-size: 1.3rem;
  margin-top: 1.2rem;
}

.tb-apk-box {
  margin: 1.6rem 0 0;
}

.tb-apk-box a {
  font-size: 1.3rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.tb-apk-box a:hover {
  color: #a855f7;
}
</style>
