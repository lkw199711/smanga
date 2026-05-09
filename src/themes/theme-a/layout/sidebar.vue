<template>
  <aside class="ta-sidebar">
    <div class="ta-logo">
      <div class="ta-logo-mark">S</div>
      <div class="ta-logo-text">smanga</div>
    </div>

    <div class="ta-sec-title">导航</div>
    <nav class="ta-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="ta-nav-item"
        active-class="active"
      >
        <span class="ta-nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="ta-sec-title">媒体库</div>
    <nav class="ta-nav ta-media-nav">
      <div
        v-for="m in mediaListData"
        :key="m.mediaId"
        class="ta-nav-item"
        @click="goMedia(m.mediaId)"
      >
        <span class="ta-nav-icon">📁</span>
        <span class="ta-nav-label">{{ m.mediaName || m.mediaId }}</span>
        <span class="ta-nav-count">{{ m.mangaCount || 0 }}</span>
      </div>
      <div v-if="mediaListData.length === 0" class="ta-nav-empty">暂无媒体库</div>
    </nav>

    <div class="ta-user">
      <div class="ta-avatar">{{ userInfo.userName?.charAt(0) || 'U' }}</div>
      <div class="ta-user-info">
        <div class="ta-user-name">{{ userInfo.userName || 'User' }}</div>
        <div class="ta-user-role">{{ userInfo.editUser ? '管理员' : '用户' }}</div>
      </div>
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
  { path: '/history', icon: '🕐', label: '历史记录' },
  { path: '/bookmark', icon: '🔖', label: '书签' },
  { path: '/collect', icon: '⭐', label: '收藏' },
  { path: '/search', icon: '🔍', label: '搜索' },
  { path: '/tag-list', icon: '🏷️', label: '标签' },
  { path: '/user-setting', icon: '⚙️', label: '设置' },
]

const mediaListData = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await mediaApi.get()
    mediaListData.value = res?.list || []
  } catch (e) {
    mediaListData.value = []
  }
})

function goMedia(mediaId: number) {
  router.push({ path: '/manga-list', query: { mediaId: String(mediaId) } })
}
</script>

<style scoped>
.ta-sidebar {
  flex-shrink: 0;
  width: 240px;
  padding: 20px 12px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.ta-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
}

.ta-logo-mark {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #171717;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
}

.ta-logo-text {
  font-size: 16px;
  font-weight: 700;
}

.ta-sec-title {
  padding: 12px 8px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ta-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ta-media-nav {
  flex: 1;
  overflow-y: auto;
}

.ta-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  color: #4b5563;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.ta-nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.ta-nav-item.active {
  background: #f3f4f6;
  color: #111827;
  font-weight: 500;
}

.ta-nav-icon {
  width: 18px;
  font-size: 14px;
  text-align: center;
}

.ta-nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ta-nav-count {
  margin-left: auto;
  padding: 1px 7px;
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 10px;
}

.ta-nav-empty {
  padding: 8px 10px;
  font-size: 12px;
  color: #9ca3af;
}

.ta-user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-top: 1px solid #eaeaea;
}

.ta-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  border-radius: 50%;
  font-size: 14px;
}

.ta-user-name {
  font-weight: 500;
  font-size: 13px;
}

.ta-user-role {
  font-size: 11px;
  color: #9ca3af;
}
</style>
