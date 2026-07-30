<template>
  <div :class="['ta-login', `ta-bg-${BG_SCHEME}`]">
    <!-- 装饰光斑：仅 aurora 方案显示，低饱和主题色 -->
    <div class="ta-bg-blob ta-bg-blob-1"></div>
    <div class="ta-bg-blob ta-bg-blob-2"></div>
    <div class="ta-bg-blob ta-bg-blob-3"></div>

    <div class="ta-login-card">
      <div class="ta-login-logo">
        <div class="ta-logo-mark">S</div>
        <div class="ta-logo-text">smanga</div>
      </div>
      <h2>登录</h2>
      <p class="ta-login-sub">欢迎回来，请登录您的账号</p>
      <form @submit.prevent="doLogin">
        <div class="ta-form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="username" />
        </div>
        <div class="ta-form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </div>
        <button class="ta-btn-login" type="submit" :disabled="loading">{{ loading ? '登录中…' : '登录' }}</button>
      </form>
      <p v-if="error" class="ta-error">{{ error }}</p>
      <p class="ta-apk-box">
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

// 背景方案：'aurora' 柔光光斑 | 'grid' 点阵网格 | 'mesh' 淡彩渐变 | 'plain' 纯色
const BG_SCHEME = 'aurora'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const apkDownloading = ref(false)
const session = useSessionStore()

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

async function doLogin() {
  if (loading.value) return
  error.value = ''
  loading.value = true
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
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ta-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #fafafa;
  overflow: hidden;
}

/* ---------- 背景方案 ---------- */

/* aurora：低饱和主题色光斑，配合毛玻璃卡片 */
.ta-bg-blob {
  display: none;
  position: absolute;
  border-radius: 50%;
  filter: blur(8rem);
  pointer-events: none;
}

.ta-bg-aurora .ta-bg-blob {
  display: block;
}

.ta-bg-aurora .ta-bg-blob-1 {
  width: 42rem;
  height: 42rem;
  top: -12rem;
  left: -10rem;
  background: rgba(37, 99, 235, 0.14);
}

.ta-bg-aurora .ta-bg-blob-2 {
  width: 38rem;
  height: 38rem;
  right: -10rem;
  bottom: -12rem;
  background: rgba(124, 58, 237, 0.1);
}

.ta-bg-aurora .ta-bg-blob-3 {
  width: 30rem;
  height: 30rem;
  left: 55%;
  top: -14rem;
  background: rgba(6, 182, 212, 0.08);
}

/* grid：点阵网格 + 顶部主题色微光 */
.ta-bg-grid {
  background-image:
    radial-gradient(circle at 50% -10%, rgba(37, 99, 235, 0.08), transparent 50%),
    radial-gradient(#d4d4d8 1px, transparent 1px);
  background-size: 100% 100%, 2.4rem 2.4rem;
}

/* mesh：淡彩多色渐变，饱和度压得很低 */
.ta-bg-mesh {
  background:
    radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.08), transparent 45%),
    radial-gradient(circle at 85% 25%, rgba(124, 58, 237, 0.07), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(6, 182, 212, 0.06), transparent 50%),
    #fafafa;
}

/* plain：纯色，无装饰 */

/* ---------- 毛玻璃登录卡片 ---------- */
.ta-login-card {
  position: relative;
  z-index: 1;
  width: 36rem;
  max-width: calc(100vw - 3.2rem);
  padding: 4rem;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(2rem) saturate(140%);
  -webkit-backdrop-filter: blur(2rem) saturate(140%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 1.6rem;
  box-shadow: 0 0.8rem 3rem rgba(0, 0, 0, 0.06);
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
  color: #171717;
}

.ta-login-card h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #171717;
  margin: 0 0 0.6rem;
}

.ta-login-sub {
  font-size: 1.3rem;
  color: #6b7280;
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
  color: #171717;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ta-form-group input::placeholder {
  color: #9ca3af;
}

.ta-form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 0.3rem rgba(37, 99, 235, 0.12);
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
  transition: background 0.2s;
}

.ta-btn-login:hover {
  background: #1d4ed8;
}

.ta-btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ta-error {
  margin-top: 1.2rem;
  font-size: 1.3rem;
  color: #ef4444;
  text-align: center;
}

.ta-apk-box {
  margin: 1.6rem 0 0;
  text-align: center;
}

.ta-apk-box a {
  font-size: 1.3rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.ta-apk-box a:hover {
  color: #2563eb;
}
</style>
