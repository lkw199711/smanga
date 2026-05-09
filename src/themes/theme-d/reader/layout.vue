<template>
  <div class="td-reader-layout">
    <div class="td-reader-header">
      <button class="td-back" @click="router.back()">← 返回</button>
      <span class="td-chapter-title">{{ chapterName }}</span>
      <div class="td-reader-modes">
        <button :class="{ active: mode==='single' }" @click="mode='single'">单页</button>
        <button :class="{ active: mode==='double' }" @click="mode='double'">双页</button>
        <button :class="{ active: mode==='flow' }" @click="mode='flow'">条漫</button>
      </div>
    </div>
    <div class="td-reader-body">
      <component :is="readerComp" :images="images" :chapter-id="chapterId" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import chapterApi from '@/api/chapter'
import TdSingle from './single.vue'
import TdDouble from './double.vue'
import TdFlow from './flow.vue'

const route = useRoute()
const router = useRouter()
const chapterId = computed(() => route.params.chapterId as string)
const images = ref<string[]>([])
const chapterName = ref('')
const mode = ref<'single'|'double'|'flow'>('single')

const readerComp = computed(() => {
  if (mode.value === 'double') return TdDouble
  if (mode.value === 'flow') return TdFlow
  return TdSingle
})

onMounted(async () => {
  try {
    const r = await chapterApi.getContent(chapterId.value)
    images.value = r?.data?.images || r?.data?.list || []
    chapterName.value = r?.data?.chapterName || ''
  } catch {}
})
</script>

<style scoped>
.td-reader-layout { display: flex; flex-direction: column; height: 100vh; background: var(--bg); }
.td-reader-header { display: flex; align-items: center; gap: 12px; padding: 10px 20px; background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.td-back { background: none; border: none; color: var(--accent); font-size: 14px; cursor: pointer; padding: 4px 8px; }
.td-chapter-title { flex: 1; font-size: 14px; color: var(--fg); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-reader-modes { display: flex; gap: 4px; }
.td-reader-modes button { padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--fg2); font-size: 12px; cursor: pointer; transition: all .2s; }
.td-reader-modes button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.td-reader-body { flex: 1; overflow: auto; }
</style>
