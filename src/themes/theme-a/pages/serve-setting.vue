<template>
  <div class="ta-setting">
    <div class="ta-page-head"><h1>服务器设置</h1></div>
    <div class="ta-setting-groups">
      <div class="ta-setting-card">
        <h3>服务器信息</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">服务器地址</span>
          <span class="ta-setting-value">{{ serverInfo.host || '-' }}</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">端口</span>
          <span class="ta-setting-value">{{ serverInfo.port || '-' }}</span>
        </div>
        <div class="ta-setting-row">
          <span class="ta-setting-label">版本</span>
          <span class="ta-setting-value">{{ serverInfo.version || '-' }}</span>
        </div>
      </div>
      <div class="ta-setting-card">
        <h3>操作</h3>
        <div class="ta-setting-row">
          <span class="ta-setting-label">下载 APK</span>
          <button class="ta-btn-ghost" @click="downloadApk">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import loginApi from '@/api/login'

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
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-setting-groups { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.ta-setting-card { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 20px 24px; }
.ta-setting-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 16px; color: #111827; }
.ta-setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.ta-setting-row:last-child { border-bottom: none; }
.ta-setting-label { font-size: 13px; color: #4b5563; }
.ta-setting-value { font-size: 13px; color: #111827; font-weight: 500; }
.ta-btn-ghost { padding: 6px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 6px; background: #fff; cursor: pointer; }
.ta-btn-ghost:hover { background: #f3f4f6; }
</style>
