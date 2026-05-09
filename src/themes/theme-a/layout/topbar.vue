<template>
  <header class="ta-topbar">
    <div class="ta-search" @click="goSearch">
      <span class="ta-search-icon">🔍</span>
      <input v-model="keyword" placeholder="搜索漫画、章节、标签…" @keydown.enter="doSearch" />
      <span class="ta-search-kbd">Ctrl K</span>
    </div>
    <div class="ta-top-actions">
      <button class="ta-btn-ghost" @click="toggleView">
        {{ config.viewType === 'block' ? '📊 列表' : '📋 网格' }}
      </button>
      <button class="ta-btn-ghost" @click="showThemeSwitch = !showThemeSwitch">🎨 主题</button>
      <button class="ta-btn-primary" @click="addMediaDialog = true">+ 新建媒体库</button>
    </div>

    <!-- Theme switcher dropdown -->
    <div v-if="showThemeSwitch" class="ta-theme-dropdown">
      <div class="ta-theme-option" :class="{ active: themeState.current === 'A' }" @click="setTheme('A')">A - 现代简约</div>
      <div class="ta-theme-option" :class="{ active: themeState.current === 'B' }" @click="setTheme('B')">B - 漫画风</div>
      <div class="ta-theme-option" :class="{ active: themeState.current === 'D' }" @click="setTheme('D')">D - 多主题</div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { config } from '@/store'
import { themeState, setTheme } from '@/themes/store'

const router = useRouter()
const keyword = ref('')
const showThemeSwitch = ref(false)
const addMediaDialog = ref(false)

function goSearch() {
  // focus handled by input
}

function doSearch() {
  if (keyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: keyword.value } })
  }
}

function toggleView() {
  config.viewType = config.viewType === 'block' ? 'list' : 'block'
}
</script>

<style scoped>
.ta-topbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #fafafa;
  border-bottom: 1px solid #eaeaea;
}

.ta-search {
  flex: 1;
  max-width: 560px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
}

.ta-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #171717;
}

.ta-search input::placeholder {
  color: #9ca3af;
}

.ta-search-icon {
  color: #9ca3af;
  font-size: 13px;
}

.ta-search-kbd {
  padding: 2px 6px;
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #eaeaea;
  border-radius: 4px;
}

.ta-top-actions {
  display: flex;
  gap: 6px;
}

.ta-btn-ghost {
  padding: 7px 12px;
  font-size: 13px;
  color: #4b5563;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.ta-btn-ghost:hover {
  background: #fff;
  border-color: #eaeaea;
}

.ta-btn-primary {
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.ta-btn-primary:hover {
  background: #1d4ed8;
}

.ta-theme-dropdown {
  position: absolute;
  top: 100%;
  right: 24px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 100;
}

.ta-theme-option {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
}

.ta-theme-option:hover {
  background: #f3f4f6;
}

.ta-theme-option.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}
</style>
