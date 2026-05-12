<template>
  <div class="tb-page">
    <h1>管理面板</h1>
    <div class="tb-card">
      <div class="tb-grid">
        <button class="tb-btn" @click="go('/account')">用户管理</button>
        <button class="tb-btn" @click="go('/media-setting')">媒体库管理</button>
        <button class="tb-btn" @click="go('/manga-setting')">漫画管理</button>
        <button class="tb-btn" @click="go('/chapter-setting')">章节管理</button>
        <button class="tb-btn" @click="go('/path-setting')">路径管理</button>
        <button class="tb-btn" @click="go('/bookmark-setting')">书签管理</button>
        <button class="tb-btn" @click="go('/tag-setting')">标签管理</button>
        <button class="tb-btn" @click="go('/compress-setting')">解压管理</button>
        <button class="tb-btn" @click="go('/jobs-setting')">任务管理</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function go(path: string) {
  router.push(path)
}
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#1f2937}
.tb-card{background:rgba(255,255,255,0.8);border:1px solid rgba(0,0,0,0.1);border-radius:16px;padding:60px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.08)}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.tb-btn{padding:12px 16px;background:rgba(255,255,255,1);border:1px solid rgba(0,0,0,0.1);border-radius:16px;color:#1f2937;cursor:pointer;font-size:13px;transition:all .15s;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.tb-btn:hover{background:#f9fafb;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
</style>
