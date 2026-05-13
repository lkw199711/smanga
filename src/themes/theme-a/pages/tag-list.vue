<template>
  <div class="ta-list-page">
    <div class="ta-page-head"><h1>标签</h1></div>
    <div class="ta-tags">
      <div v-for="tag in list" :key="tag.tagId" class="ta-tag" @click="goTag(tag)">
        <span class="ta-tag-name">{{ tag.tagName }}</span>
        <span class="ta-tag-count">{{ tag.mangaCount || 0 }}</span>
      </div>
    </div>
    <div v-if="list.length === 0" class="ta-empty">暂无标签</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import tagApi from '@/api/tag'

const router = useRouter()
const list = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await tagApi.get(1, 200)
    list.value = res?.list || []
  } catch (e) { /* empty */ }
})

function goTag(tag: any) {
  router.push({ path: '/t/search', query: { q: tag.tagName } })
}
</script>

<style scoped>
.ta-page-head { margin-bottom: 24px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.ta-tag { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #fff; border: 1px solid #eaeaea; border-radius: 20px; cursor: pointer; transition: all 0.15s; }
.ta-tag:hover { border-color: #2563eb; color: #2563eb; }
.ta-tag-name { font-size: 13px; font-weight: 500; }
.ta-tag-count { font-size: 11px; color: #9ca3af; background: #f3f4f6; padding: 1px 6px; border-radius: 8px; }
.ta-empty { text-align: center; padding: 60px; color: #9ca3af; }
</style>
