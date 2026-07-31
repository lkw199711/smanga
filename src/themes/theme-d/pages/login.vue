<template>
  <div class="td-login">
    <div class="td-login-card">
      <h1 class="td-login-title">SManga</h1>
      <p class="td-login-sub">登录以继续</p>
      <div class="td-form-group">
        <input class="td-input" v-model="form.username" placeholder="用户名" autocomplete="username" @keyup.enter="login" />
      </div>
      <div class="td-form-group">
        <input class="td-input" type="password" v-model="form.password" placeholder="密码" autocomplete="current-password" @keyup.enter="login" />
      </div>
      <button class="td-btn-login" :disabled="loading" @click="login">{{ loading ? '登录中…' : '登录' }}</button>
      <p v-if="error" class="td-error">{{ error }}</p>
      <p class="td-apk-box">
        <a href="#" @click.prevent="downloadApk">{{ apkDownloading ? '正在下载…' : '下载 Android 应用' }}</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import loginApi from '@/api/login'
import { useSessionStore } from '@/store/session'

const router = useRouter()
const session = useSessionStore()
const form = reactive({ username: '', password: '' })
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

async function login() {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const r = await loginApi.login({ userName: form.username, passWord: form.password })
    if (r?.token && r?.serverKey) {
      session.start(r)
      await router.push('/t')
    } else {
      error.value = '用户名或密码错误'
    }
  } catch {
    error.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

// Android APK 注入凭据自动登录
// APK 通过 window.javaObj 挂载 { hasCredentials, username, password, ... }
onMounted(() => {
  try {
    const jo = (window as any).javaObj
    if (jo && typeof jo === 'object' && jo.hasCredentials && jo.username && jo.password) {
      form.username = String(jo.username)
      form.password = String(jo.password)
      setTimeout(() => { login() }, 0)
    }
  } catch (e) {
    // 忽略注入对象读取异常，回落到手动登录
  }
})
</script>

<style scoped>
/* 登录页脱离主题布局渲染，--accent 等变量可能未注入，统一补 fallback 链 */
.td-login {
  --td-accent: var(--accent, var(--sd-primary, #2563EB));
  --td-bg: var(--bg, var(--sd-back, #EFF6FF));
  --td-card: var(--bg2, var(--sd-card, #FFFFFF));
  --td-border: var(--border, var(--sd-border, #E5E7EB));
  --td-fg: var(--fg, var(--sd-text, #0F172A));
  --td-fg2: var(--fg2, var(--sd-text-muted, #64748B));

  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  /* 主题色微晕染背景：低透明度双光斑，跟随当前配色 */
  background:
    radial-gradient(circle at 12% 15%, color-mix(in srgb, var(--td-accent) 10%, transparent), transparent 45%),
    radial-gradient(circle at 88% 85%, color-mix(in srgb, var(--td-accent) 7%, transparent), transparent 45%),
    var(--td-bg);
}

.td-login-card {
  width: 34rem;
  max-width: calc(100vw - 3.2rem);
  box-sizing: border-box;
  background: var(--td-card);
  border: 1px solid var(--td-border);
  border-radius: 1.6rem;
  box-shadow: 0 0.4rem 2.4rem color-mix(in srgb, var(--td-accent) 8%, transparent);
  padding: 4rem 3.2rem;
  text-align: center;
}

.td-login-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--td-accent);
  margin: 0 0 0.4rem;
}

.td-login-sub {
  font-size: 1.3rem;
  color: var(--td-fg2);
  margin: 0 0 2.4rem;
}

.td-form-group {
  margin-bottom: 1.4rem;
}

.td-input {
  width: 100%;
  height: 4rem;
  padding: 0 1.4rem;
  border-radius: 1rem;
  border: 1px solid var(--td-border);
  background: var(--td-card);
  color: var(--td-fg);
  font-size: 1.4rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.td-input:focus {
  border-color: var(--td-accent);
  box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--td-accent) 15%, transparent);
}

.td-btn-login {
  width: 100%;
  height: 4rem;
  border-radius: 1rem;
  background: var(--td-accent);
  color: #fff;
  border: none;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: opacity .2s;
}

.td-btn-login:hover {
  opacity: 0.85;
}

.td-btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.td-error {
  margin-top: 1.2rem;
  font-size: 1.3rem;
  color: #EF4444;
}

.td-apk-box {
  margin: 1.6rem 0 0;
}

.td-apk-box a {
  font-size: 1.3rem;
  color: var(--td-fg2);
  text-decoration: none;
  transition: color 0.2s;
}

.td-apk-box a:hover {
  color: var(--td-accent);
}
</style>
