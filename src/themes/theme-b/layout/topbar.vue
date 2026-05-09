<template>
  <header class="tb-topbar">
    <div class="tb-search">
      <span>🔍</span>
      <input v-model="keyword" placeholder="搜索..." @keydown.enter="doSearch" />
    </div>
    <div class="tb-top-actions">
      <button class="tb-btn" @click="showTheme = !showTheme">🎨</button>
    </div>
    <div v-if="showTheme" class="tb-theme-popup">
      <div :class="['tb-th-opt', { active: themeState.current === 'A' }]" @click="setTheme('A')">A 简约</div>
      <div :class="['tb-th-opt', { active: themeState.current === 'B' }]" @click="setTheme('B')">B 漫画</div>
      <div :class="['tb-th-opt', { active: themeState.current === 'D' }]" @click="setTheme('D')">D 多主题</div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { themeState, setTheme } from '@/themes/store'

const router = useRouter()
const keyword = ref('')
const showTheme = ref(false)

function doSearch() {
  if (keyword.value.trim()) router.push({ path: '/search', query: { keyword: keyword.value } })
}
</script>

<style scoped>
.tb-topbar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; margin-bottom: 16px; background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 20px; box-shadow: 0 4px 16px rgba(108, 141, 255, 0.08); }
.tb-search { flex: 1; max-width: 400px; display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 999px; }
.tb-search input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; color: #1f2937; }
.tb-search input::placeholder { color: #9ca3af; }
.tb-btn { padding: 7px 12px; font-size: 14px; background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 10px; color: #4b5563; cursor: pointer; }
.tb-btn:hover { background: #fff; }
.tb-theme-popup { position: absolute; top: 100%; right: 24px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 12px; padding: 6px; z-index: 100; box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1); }
.tb-th-opt { padding: 8px 14px; font-size: 13px; border-radius: 8px; cursor: pointer; color: #4b5563; }
.tb-th-opt:hover { background: rgba(255, 111, 163, 0.1); }
.tb-th-opt.active { background: linear-gradient(135deg, rgba(255, 111, 163, 0.4), rgba(108, 141, 255, 0.3)); color: #fff; }
</style>