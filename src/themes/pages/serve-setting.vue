<template>
  <div :class="['setting-page', `setting-page--${themeState.current.toLowerCase()}`]">
    <div class="setting-page-head"><h1>服务器设置</h1></div>
    <div class="setting-groups">
      <div class="setting-card">
        <h3>服务器信息</h3>
        <div class="setting-row">
          <span class="setting-label">服务器地址</span>
          <span class="setting-value">{{ serverInfo.host || '-' }}</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">端口</span>
          <span class="setting-value">{{ serverInfo.port || '-' }}</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">版本</span>
          <span class="setting-value">{{ serverInfo.version || '-' }}</span>
        </div>
      </div>
      <div class="setting-card">
        <h3>操作</h3>
        <div class="setting-row">
          <span class="setting-label">下载 APK</span>
          <button class="setting-btn-ghost" @click="downloadApk">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import loginApi from '@/api/login'
import { themeState } from '@/themes/store'

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
.setting-page {
  --setting-accent: #2563eb;
  --setting-card-background: #fff;
  --setting-card-border: #eaeaea;
  --setting-card-radius: 12px;
  --setting-card-shadow: none;
  --setting-control-radius: 6px;
  --setting-heading: #111827;
  --setting-label: #4b5563;
  --setting-value: #111827;
  --setting-row-border: #f3f4f6;
  --setting-button-background: #fff;
  --setting-button-hover: #f3f4f6;
}
.setting-page--b {
  --setting-accent: #a855f7;
  --setting-card-background: rgba(255, 255, 255, 0.78);
  --setting-card-border: rgba(255, 255, 255, 0.9);
  --setting-card-radius: 16px;
  --setting-card-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
  --setting-control-radius: 8px;
}
.setting-page--d {
  --setting-accent: var(--accent, var(--sd-primary, #2563eb));
  --setting-card-background: var(--bg2, var(--sd-card, #fff));
  --setting-card-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-card-radius: 12px;
  --setting-card-shadow: none;
  --setting-control-radius: 8px;
  --setting-heading: var(--fg, var(--sd-text, #0f172a));
  --setting-label: var(--fg2, var(--sd-text-muted, #64748b));
  --setting-value: var(--fg, var(--sd-text, #0f172a));
  --setting-row-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-button-background: var(--bg, var(--sd-back, #eff6ff));
  --setting-button-hover: var(--bg2, var(--sd-card, #fff));
}
.setting-page-head { margin-bottom: 24px; }
.setting-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; color: var(--setting-heading); }
.setting-groups { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.setting-card { background: var(--setting-card-background); border: 1px solid var(--setting-card-border); border-radius: var(--setting-card-radius); padding: 20px 24px; box-shadow: var(--setting-card-shadow); backdrop-filter: blur(16px); }
.setting-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 16px; color: var(--setting-heading); }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--setting-row-border); }
.setting-row:last-child { border-bottom: none; }
.setting-label { font-size: 13px; color: var(--setting-label); }
.setting-value { font-size: 13px; color: var(--setting-value); font-weight: 500; }
.setting-btn-ghost { padding: 6px 14px; font-size: 13px; color: var(--setting-value); border: 1px solid var(--setting-card-border); border-radius: var(--setting-control-radius); background: var(--setting-button-background); cursor: pointer; }
.setting-btn-ghost:hover { background: var(--setting-button-hover); }
.setting-page--b .setting-btn-ghost:hover { border-color: var(--setting-accent); background: rgba(255, 255, 255, 0.95); }
</style>
