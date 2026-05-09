<template>
  <aside class="td-sidebar">
    <div class="td-logo"><span class="td-logo-mark">S</span><span class="td-logo-text">smanga</span></div>
    <nav class="td-nav">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="td-nav-item" active-class="active">
        <span class="td-icon">{{ item.icon }}</span><span>{{ item.label }}</span>
      </router-link>
    </nav>
    <div class="td-divider"></div>
    <div class="td-colors">
      <div v-for="c in colors" :key="c.key" :class="['td-color-dot',{active:colorScheme===c.key}]" :style="{background:c.color}" @click="setColor(c.key)"></div>
    </div>
    <div class="td-user">
      <div class="td-avatar">{{ userInfo.userName?.charAt(0)||'U' }}</div>
      <span>{{ userInfo.userName||'User' }}</span>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { inject, type Ref } from 'vue'
import { userInfo } from '@/store'

const colorScheme = inject<Ref<string>>('td-color')!
const setColorFn = inject<(c: string) => void>('td-set-color')!
function setColor(c: string) { setColorFn(c) }

const navItems = [
  { path: '/index', icon: '🏠', label: '首页' },
  { path: '/history', icon: '🕐', label: '历史' },
  { path: '/bookmark', icon: '🔖', label: '书签' },
  { path: '/collect', icon: '⭐', label: '收藏' },
  { path: '/search', icon: '🔍', label: '搜索' },
  { path: '/tag-list', icon: '🏷️', label: '标签' },
  { path: '/user-setting', icon: '⚙️', label: '设置' },
]

const colors = [
  { key: 'blue', color: '#0984e3' },
  { key: 'pink', color: '#e84393' },
  { key: 'green', color: '#00b894' },
  { key: 'purple', color: '#6c5ce7' },
  { key: 'orange', color: '#e17055' },
  { key: 'mint', color: '#00cec9' },
  { key: 'rose', color: '#fd79a8' },
  { key: 'amber', color: '#fdcb6e' },
  { key: 'dark', color: '#1a1a2e' },
]
</script>

<style scoped>
.td-sidebar { flex-shrink: 0; width: 220px; padding: 20px 12px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; }
.td-logo { display: flex; align-items: center; gap: 10px; padding: 4px 8px 20px; }
.td-logo-mark { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--accent); color: #fff; font-weight: 700; border-radius: 8px; font-size: 14px; }
.td-logo-text { font-size: 16px; font-weight: 700; }
.td-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.td-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; color: var(--fg2); border-radius: 8px; cursor: pointer; transition: all .15s; text-decoration: none; font-size: 13px; }
.td-nav-item:hover { background: var(--accent-soft); color: var(--fg); }
.td-nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
.td-icon { width: 18px; font-size: 14px; text-align: center; }
.td-divider { height: 1px; background: var(--border); margin: 12px 0; }
.td-colors { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; }
.td-color-dot { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all .15s; }
.td-color-dot.active { border-color: var(--fg); transform: scale(1.2); }
.td-user { display: flex; align-items: center; gap: 10px; padding: 12px 8px; border-top: 1px solid var(--border); margin-top: 12px; font-size: 13px; color: var(--fg2); }
.td-avatar { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--accent); color: #fff; font-weight: 600; border-radius: 50%; font-size: 12px; }
</style>
