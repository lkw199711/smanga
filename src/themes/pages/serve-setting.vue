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
  --setting-card-radius: 1.2rem;
  --setting-card-shadow: none;
  --setting-control-radius: 0.6rem;
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
  --setting-card-radius: 1.6rem;
  --setting-card-shadow: 0 0.8rem 2.4rem rgba(108, 141, 255, 0.1);
  --setting-control-radius: 0.8rem;
}
.setting-page--d {
  --setting-accent: var(--accent, var(--sd-primary, #2563eb));
  --setting-card-background: var(--bg2, var(--sd-card, #fff));
  --setting-card-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-card-radius: 1.2rem;
  --setting-card-shadow: none;
  --setting-control-radius: 0.8rem;
  --setting-heading: var(--fg, var(--sd-text, #0f172a));
  --setting-label: var(--fg2, var(--sd-text-muted, #64748b));
  --setting-value: var(--fg, var(--sd-text, #0f172a));
  --setting-row-border: var(--border, var(--sd-border, #e5e7eb));
  --setting-button-background: var(--bg, var(--sd-back, #eff6ff));
  --setting-button-hover: var(--bg2, var(--sd-card, #fff));
}
.setting-page-head { margin-bottom: 2.4rem; }
.setting-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; color: var(--setting-heading); }
.setting-groups { display: flex; flex-direction: column; gap: 1.6rem; max-width: 68rem; }
.setting-card { background: var(--setting-card-background); border: 1px solid var(--setting-card-border); border-radius: var(--setting-card-radius); padding: 2rem 2.4rem; box-shadow: var(--setting-card-shadow); backdrop-filter: blur(1.6rem); }
.setting-card h3 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.6rem; color: var(--setting-heading); }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--setting-row-border); }
.setting-row:last-child { border-bottom: none; }
.setting-label { font-size: 1.3rem; color: var(--setting-label); }
.setting-value { font-size: 1.3rem; color: var(--setting-value); font-weight: 500; }
.setting-btn-ghost { padding: 0.6rem 1.4rem; font-size: 1.3rem; color: var(--setting-value); border: 1px solid var(--setting-card-border); border-radius: var(--setting-control-radius); background: var(--setting-button-background); cursor: pointer; }
.setting-btn-ghost:hover { background: var(--setting-button-hover); }
.setting-page--b .setting-btn-ghost:hover { border-color: var(--setting-accent); background: rgba(255, 255, 255, 0.95); }
</style>
