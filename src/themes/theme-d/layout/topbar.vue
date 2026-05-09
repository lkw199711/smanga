<template>
  <div class="td-topbar">
    <div class="td-topbar-left">
      <span class="td-breadcrumb">{{ route.meta?.title || 'Home' }}</span>
    </div>
    <div class="td-topbar-right">
      <input class="td-search-input" placeholder="搜索..." @keyup.enter="doSearch" v-model="keyword" />
      <div class="td-user-avatar" @click="router.push('/setting/user')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

function doSearch() {
  if (keyword.value.trim()) {
    router.push({ path: '/search', query: { q: keyword.value.trim() } })
  }
}
</script>

<style scoped>
.td-topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; padding: 0 24px;
  background: var(--bg2); border-bottom: 1px solid var(--border);
}
.td-breadcrumb { font-size: 15px; font-weight: 600; color: var(--fg); }
.td-topbar-right { display: flex; align-items: center; gap: 12px; }
.td-search-input {
  width: 200px; height: 32px; padding: 0 12px; border-radius: 16px;
  border: 1px solid var(--border); background: var(--bg); color: var(--fg);
  font-size: 13px; outline: none; transition: border-color .2s;
}
.td-search-input:focus { border-color: var(--accent); }
.td-user-avatar {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: var(--accent-soft); color: var(--accent); cursor: pointer; transition: transform .2s;
}
.td-user-avatar:hover { transform: scale(1.1); }
</style>
