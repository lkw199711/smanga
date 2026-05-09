<template>
  <div class="td-serve-setting">
    <h2 class="td-page-title">服务器设置</h2>
    <div class="td-form-card">
      <div class="td-form-group">
        <label>主题切换</label>
        <div class="td-theme-opts">
          <button v-for="t in themes" :key="t.key" class="td-theme-btn" :class="{ active: current === t.key }" @click="switchTheme(t.key)">{{ t.label }}</button>
        </div>
      </div>
      <div class="td-form-group">
        <label>扫描路径</label>
        <input class="td-input" placeholder="媒体库路径" disabled />
      </div>
      <div class="td-form-group">
        <label>压缩质量</label>
        <input class="td-input" type="number" placeholder="80" disabled />
      </div>
      <p class="td-hint">更多设置功能开发中...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { themeState, setTheme, type ThemeKey } from '@/themes/store'
import { computed } from 'vue'

const themes = [
  { key: 'A' as ThemeKey, label: '简约' },
  { key: 'B' as ThemeKey, label: '漫画风' },
  { key: 'D' as ThemeKey, label: '多彩' },
]
const current = computed(() => themeState.current)
function switchTheme(key: ThemeKey) { setTheme(key) }
</script>

<style scoped>
.td-serve-setting { max-width: 500px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-form-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.td-form-group { margin-bottom: 20px; }
.td-form-group label { display: block; font-size: 13px; color: var(--fg2); margin-bottom: 8px; }
.td-theme-opts { display: flex; gap: 8px; }
.td-theme-btn { padding: 6px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font-size: 13px; cursor: pointer; transition: all .2s; }
.td-theme-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.td-input { width: 100%; height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font-size: 14px; outline: none; box-sizing: border-box; }
.td-hint { font-size: 12px; color: var(--fg2); margin-top: 16px; }
</style>
