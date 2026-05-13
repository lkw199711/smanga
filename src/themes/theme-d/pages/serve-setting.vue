<template>
  <div class="td-serve-setting">
    <div class="td-page-head"><h1>服务器设置</h1></div>
    <div class="td-setting-groups">
      <div class="td-setting-card">
        <h3>服务器信息</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">服务器地址</span>
          <span class="td-setting-value">{{ serverInfo.host || '-' }}</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">端口</span>
          <span class="td-setting-value">{{ serverInfo.port || '-' }}</span>
        </div>
        <div class="td-setting-row">
          <span class="td-setting-label">版本</span>
          <span class="td-setting-value">{{ serverInfo.version || '-' }}</span>
        </div>
      </div>
      <div class="td-setting-card">
        <h3>主题设置</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">主题切换</span>
          <div class="td-theme-opts">
            <button v-for="t in themes" :key="t.key" class="td-theme-btn" :class="{ active: current === t.key }" @click="switchTheme(t.key)">{{ t.label }}</button>
          </div>
        </div>
      </div>
      <div class="td-setting-card">
        <h3>操作</h3>
        <div class="td-setting-row">
          <span class="td-setting-label">下载 APK</span>
          <button class="td-btn-ghost" @click="downloadApk">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { themeState, setTheme, type ThemeKey } from '@/themes/store'
import loginApi from '@/api/login'
import { computed } from 'vue'

const themes = [
  { key: 'A' as ThemeKey, label: '简约' },
  { key: 'B' as ThemeKey, label: '漫画风' },
  { key: 'D' as ThemeKey, label: '多彩' },
]
const current = computed(() => themeState.current)
function switchTheme(key: ThemeKey) { setTheme(key) }

const serverInfo = ref<any>({})

onMounted(async () => {
  try {
    const res = await loginApi.database_get()
    serverInfo.value = res?.data || {}
  } catch (e) { /* empty */ }
})

function downloadApk() {
  loginApi.download_apk()
}
</script>

<style scoped>
.td-page-head { margin-bottom: 24px; }
.td-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.td-setting-groups { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.td-setting-card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 20px 24px; }
.td-setting-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 16px; color: #111827; }
.td-setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.td-setting-row:last-child { border-bottom: none; }
.td-setting-label { font-size: 13px; color: #4b5563; }
.td-setting-value { font-size: 13px; color: #111827; font-weight: 500; }
.td-theme-opts { display: flex; gap: 8px; }
.td-theme-btn { padding: 6px 16px; border-radius: 8px; border: 1px solid #eaeaea; background: #fff; color: #374151; font-size: 13px; cursor: pointer; transition: all .2s; }
.td-theme-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.td-btn-ghost { padding: 6px 14px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; cursor: pointer; color: #374151; }
.td-btn-ghost:hover { background: #f9fafb; }
</style>