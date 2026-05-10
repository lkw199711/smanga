<template><div class="tb-page"><h1>标签</h1><div class="tb-tags"><div v-for="tag in list" :key="tag.tagId" class="tb-tag" @click="goTag(tag)">{{ tag.tagName }}<span class="tb-tag-count">{{ tag.mangaCount||0 }}</span></div></div><div v-if="!list.length" class="tb-empty">暂无标签</div></div></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import tagApi from '@/api/tag'
const router = useRouter()
const list = ref<any[]>([])
onMounted(async () => { try { list.value = (await tagApi.get(1,200))?.list || [] } catch(e){} })
function goTag(tag:any){ router.push({path:'/t/search',query:{q:tag.tagName}}) }
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#fff}
.tb-tags{display:flex;flex-wrap:wrap;gap:10px}
.tb-tag{padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:20px;font-size:13px;color:#fff;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:8px}
.tb-tag:hover{background:rgba(168,85,247,0.3);border-color:rgba(168,85,247,0.5)}
.tb-tag-count{font-size:11px;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.08);padding:1px 6px;border-radius:8px}
.tb-empty{text-align:center;padding:60px;color:rgba(255,255,255,0.4)}
</style>
