<template>
  <div class="ta-manage">
    <div class="ta-page-head"><h1>管理面板</h1></div>
    <div class="ta-manage-nav">
      <button v-for="tab in tabs" :key="tab.key" :class="['ta-tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>
    <div class="ta-manage-content">
      <div class="ta-manage-placeholder">
        <p>{{ activeTabLabel }} 管理功能</p>
        <p class="ta-sub">此页面为管理入口占位，后续对接实际数据</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const tabs = [
  { key: 'user', label: '用户管理' },
  { key: 'media', label: '媒体库管理' },
  { key: 'manga', label: '漫画管理' },
  { key: 'chapter', label: '章节管理' },
  { key: 'path', label: '路径管理' },
  { key: 'bookmark', label: '书签管理' },
  { key: 'tag', label: '标签管理' },
  { key: 'compress', label: '解压管理' },
  { key: 'jobs', label: '任务管理' },
]

const activeTab = ref('user')
const activeTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label || '')
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-manage-nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
.ta-tab { padding: 7px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 8px; background: #fff; cursor: pointer; color: #4b5563; }
.ta-tab.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.ta-manage-content { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 60px; text-align: center; }
.ta-manage-placeholder p { font-size: 16px; color: #111827; margin: 0 0 8px; }
.ta-manage-placeholder .ta-sub { font-size: 13px; color: #9ca3af; }
</style>
