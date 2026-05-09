<template>
  <aside class="tb-sidebar">
    <div class="tb-logo">
      <div class="tb-logo-mark">S</div>
      <div class="tb-logo-text">smanga</div>
    </div>
    <nav class="tb-nav">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="tb-nav-item" active-class="active">
        <span class="tb-nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
    <div class="tb-nav-divider"></div>
    <div class="tb-media-title">✨ 我的书架</div>
    <nav class="tb-nav tb-media-nav">
      <div v-for="m in mediaList" :key="m.mediaId" class="tb-nav-item" @click="goMedia(m.mediaId)">
        <span class="tb-nav-icon">📚</span>
        <span>{{ m.mediaName || m.mediaId }}</span>
      </div>
    </nav>
    <div class="tb-user">
      <div class="tb-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
      <span class="tb-user-name">{{ userInfo.userName || 'User' }}</span>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userInfo } from '@/store'
import mediaApi from '@/api/media'

const router = useRouter()
const navItems = [
  { path: '/index', icon: '🏠', label: '首页' },
  { path: '/history', icon: '🕐', label: '历史' },
  { path: '/bookmark', icon: '🔖', label: '书签' },
  { path: '/collect', icon: '⭐', label: '收藏' },
  { path: '/search', icon: '🔍', label: '搜索' },
  { path: '/tag-list', icon: '🏷️', label: '标签' },
  { path: '/user-setting', icon: '⚙️', label: '设置' },
]

const mediaList = ref<any[]>([])
onMounted(async () => {
  try { mediaList.value = (await mediaApi.get())?.list || [] } catch (e) { /* empty */ }
})

function goMedia(id: number) {
  router.push({ path: '/manga-list', query: { mediaId: String(id) } })
}
</script>

<style scoped>
.tb-sidebar {
  flex-shrink: 0;
  width: 240px;
  margin: 16px 0 16px 16px;
  padding: 20px 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(108, 141, 255, 0.1);
}

.tb-logo { display: flex; align-items: center; gap: 10px; padding: 4px 8px 16px; }
.tb-logo-mark { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ff6fa3, #6c8dff); color: #fff; font-weight: 700; border-radius: 10px; }
.tb-logo-text { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #ff6fa3, #6c8dff); -webkit-background-clip: text; background-clip: text; color: transparent; }

.tb-nav { display: flex; flex-direction: column; gap: 4px; }
.tb-media-nav { flex: 1; overflow-y: auto; }
.tb-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; color: #4b5563; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-decoration: none; font-size: 13px; font-weight: 500; }
.tb-nav-item:hover { background: rgba(255, 255, 255, 0.8); transform: translateX(2px); color: #1f2937; }
.tb-nav-item.active { background: linear-gradient(135deg, rgba(255, 111, 163, 0.18), rgba(108, 141, 255, 0.18)); color: #1f2937; font-weight: 600; }
.tb-nav-icon { width: 18px; font-size: 14px; text-align: center; }
.tb-nav-divider { height: 1px; background: rgba(108, 141, 255, 0.15); margin: 12px 0; }
.tb-media-title { padding: 8px 12px 6px; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }

.tb-user { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 12px 8px; border-top: 1px solid rgba(108, 141, 255, 0.15); }
.tb-avatar { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ff6fa3, #6c8dff); color: #fff; font-weight: 600; border-radius: 50%; font-size: 13px; }
.tb-user-name { font-size: 13px; color: #4b5563; }
</style>