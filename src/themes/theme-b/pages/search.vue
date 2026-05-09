<template><div class="tb-page"><h1>搜索</h1><div class="tb-search-bar"><input v-model="keyword" placeholder="搜索漫画..." @keydown.enter="doSearch" /><button @click="doSearch">搜索</button></div><div class="tb-grid"><div v-for="item in list" :key="item.mangaId" class="tb-card" @click="goManga(item)"><div class="tb-card-cover"><img v-if="item.mangaCover" :src="item.mangaCover" /><div v-else class="tb-card-ph">📚</div></div><div class="tb-card-name">{{ item.mangaName }}</div></div></div></div></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import searchApi from '@/api/search'
const router = useRouter()
const route = useRoute()
const keyword = ref('')
const list = ref<any[]>([])
onMounted(() => { if(route.query.keyword){keyword.value=String(route.query.keyword);doSearch()} })
async function doSearch(){ if(!keyword.value.trim())return; try{ list.value=(await searchApi.get(keyword.value,1,50))?.list||[] }catch(e){} }
function goManga(item:any){ router.push({path:'/chapter-list',query:{mangaId:item.mangaId}}) }
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#fff}
.tb-search-bar{display:flex;gap:10px;margin-bottom:20px}
.tb-search-bar input{flex:1;max-width:400px;padding:10px 16px;background:rgba(255,255,255,0.08);border:none;border-radius:20px;color:#fff;font-size:14px;outline:none}
.tb-search-bar input::placeholder{color:rgba(255,255,255,0.4)}
.tb-search-bar button{padding:10px 20px;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:20px;color:#fff;cursor:pointer;font-size:13px}
.tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px}
.tb-card{cursor:pointer;transition:transform .2s}.tb-card:hover{transform:translateY(-3px)}
.tb-card-cover{aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:rgba(255,255,255,0.05);box-shadow:0 4px 16px rgba(0,0,0,0.3);margin-bottom:8px}
.tb-card-cover img{width:100%;height:100%;object-fit:cover}
.tb-card-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(135deg,#6366f1,#a855f7)}
.tb-card-name{font-size:13px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style>
