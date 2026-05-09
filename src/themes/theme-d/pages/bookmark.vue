<template>
  <div class="td-bookmark">
    <h2 class="td-page-title">书签</h2>
    <div class="td-list">
      <div class="td-list-item" v-for="item in list" :key="item.bookmarkId" @click="router.push(`/reader/${item.chapterId}`)">
        <img class="td-list-cover" :src="item.poster || '/favicon.ico'" />
        <div class="td-list-info">
          <div class="td-list-name">{{ item.mangaName }}</div>
          <div class="td-list-sub">{{ item.chapterName }} - 第{{ item.page }}页</div>
        </div>
      </div>
    </div>
    <p class="td-empty" v-if="!list.length">暂无书签</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bookmarkApi from '@/api/bookmark'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try { const r = await bookmarkApi.get('', 1, 50, ''); list.value = r?.data?.list || [] } catch {}
})
</script>

<style scoped>
.td-bookmark { max-width: 800px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-list { display: flex; flex-direction: column; gap: 8px; }
.td-list-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all .2s; }
.td-list-item:hover { border-color: var(--accent); }
.td-list-cover { width: 40px; height: 54px; border-radius: 6px; object-fit: cover; }
.td-list-name { font-size: 14px; font-weight: 500; color: var(--fg); }
.td-list-sub { font-size: 12px; color: var(--fg2); margin-top: 2px; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
