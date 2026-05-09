<template>
  <div class="td-tag-list">
    <h2 class="td-page-title">标签</h2>
    <div class="td-tags" v-if="tags.length">
      <span class="td-tag-chip" v-for="t in tags" :key="t.tagId" :class="{ active: selected === t.tagId }" @click="selectTag(t.tagId)">{{ t.tagName }}</span>
    </div>
    <div class="td-card-grid" v-if="list.length">
      <div class="td-card" v-for="item in list" :key="item.mangaId" @click="router.push(`/manga/${item.mangaId}`)">
        <div class="td-card-cover"><img :src="item.poster || '/favicon.ico'" /></div>
        <div class="td-card-title">{{ item.mangaName }}</div>
      </div>
    </div>
    <p class="td-empty" v-if="!tags.length">暂无标签</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import tagApi from '@/api/tag'

const router = useRouter()
const tags = ref<any[]>([])
const list = ref<any[]>([])
const selected = ref('')

async function selectTag(tagId: string) {
  selected.value = tagId
  try { const r = await tagApi.getManga(tagId); list.value = r?.data?.list || r?.data || [] } catch {}
}

onMounted(async () => {
  try { const r = await tagApi.get(); tags.value = r?.data?.list || r?.data || [] } catch {}
})
</script>

<style scoped>
.td-tag-list { max-width: 1200px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.td-tag-chip { padding: 6px 14px; border-radius: 16px; background: var(--bg2); border: 1px solid var(--border); color: var(--fg); font-size: 13px; cursor: pointer; transition: all .2s; }
.td-tag-chip:hover, .td-tag-chip.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.td-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.td-card { background: var(--bg2); border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .2s; }
.td-card:hover { transform: translateY(-2px); }
.td-card-cover { aspect-ratio: 3/4; overflow: hidden; background: var(--bg); }
.td-card-cover img { width: 100%; height: 100%; object-fit: cover; }
.td-card-title { padding: 8px 10px; font-size: 13px; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
