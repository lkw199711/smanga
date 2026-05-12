<template>
  <div class="ta-manage">
    <div class="ta-page-head"><h1>管理面板</h1></div>
    <div class="ta-manage-nav">
      <button v-for="tab in tabs" :key="tab.key" :class="['ta-tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>
    <div class="ta-manage-content">
      <div class="ta-manage-card">
        <div class="ta-manage-card-title">{{ activeTabInfo.label }}</div>
        <div class="ta-manage-card-desc">{{ activeTabInfo.desc }}</div>
        <button class="ta-btn-primary" @click="go(activeTabInfo.path)">打开</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const tabs = [
  { key: 'user', label: '用户管理', desc: '管理系统用户与权限', path: '/account' },
  { key: 'media', label: '媒体库管理', desc: '新增/修改媒体库与扫描', path: '/media-setting' },
  { key: 'manga', label: '漫画管理', desc: '批量操作漫画元数据', path: '/manga-setting' },
  { key: 'chapter', label: '章节管理', desc: '管理章节与压缩缓存', path: '/chapter-setting' },
  { key: 'path', label: '路径管理', desc: '管理扫描路径与索引', path: '/path-setting' },
  { key: 'bookmark', label: '书签管理', desc: '批量删除与整理书签', path: '/bookmark-setting' },
  { key: 'tag', label: '标签管理', desc: '维护标签与关联关系', path: '/tag-setting' },
  { key: 'compress', label: '解压管理', desc: '解压/压缩相关任务', path: '/compress-setting' },
  { key: 'jobs', label: '任务管理', desc: '查看后台任务队列', path: '/jobs-setting' },
  { key: 'manga-sync', label: '漫画同步', desc: '同步漫画数据与元信息', path: '/manga-sync' },
  { key: 'manga-share', label: '漫画分享', desc: '管理漫画分享与导出', path: '/manga-share' },
  { key: 'p2p', label: 'P2P管理', desc: '管理P2P共享与节点', path: '/p2p-group' },
  { key: 'serve-setting', label: '服务器设置', desc: '配置服务器参数与性能', path: '/serve-setting' },
  { key: 'wiki', label: '帮助文档', desc: '查看系统使用文档与指南', path: '/wiki' },
]

const activeTab = ref('user')
const activeTabInfo = computed(() => tabs.find((t) => t.key === activeTab.value) || tabs[0])

const router = useRouter()
function go(path: string) {
  router.push(path)
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-manage-nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
.ta-tab { padding: 7px 14px; font-size: 13px; border: 1px solid #eaeaea; border-radius: 8px; background: #fff; cursor: pointer; color: #4b5563; }
.ta-tab.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.ta-manage-content { background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 24px; }
.ta-manage-card { display: flex; flex-direction: column; gap: 10px; padding: 18px; border: 1px solid #eaeaea; border-radius: 12px; background: #fff; }
.ta-manage-card-title { font-size: 16px; font-weight: 700; color: #111827; }
.ta-manage-card-desc { font-size: 13px; color: #6b7280; }
.ta-btn-primary { padding: 8px 16px; font-size: 13px; font-weight: 500; color: #fff; background: #2563eb; border: none; border-radius: 8px; cursor: pointer; width: fit-content; }
</style>