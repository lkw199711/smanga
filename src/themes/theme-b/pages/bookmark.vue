<template><div class="tb-page"><h1>书签</h1><div class="tb-list"><div v-for="item in list" :key="item.bookmarkId" class="tb-list-item" @click="goRead(item)"><span class="tb-item-name">{{ item.mangaName }} - {{ item.chapterName }}</span></div></div><div v-if="!list.length" class="tb-empty">暂无书签</div></div></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bookmarkApi from '@/api/bookmark'
const router = useRouter()
const list = ref<any[]>([])
onMounted(async () => { try { list.value = (await bookmarkApi.get(1,50))?.list || [] } catch(e){} })
function goRead(item:any){ router.push({path:'/browse-view/flow',query:{chapterId:item.chapterId}}) }
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#fff}
.tb-list{display:flex;flex-direction:column;gap:6px}
.tb-list-item{padding:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.06);border-radius:12px;cursor:pointer;transition:all .15s}
.tb-list-item:hover{background:rgba(255,255,255,0.1)}
.tb-item-name{font-size:13px;color:#fff}
.tb-empty{text-align:center;padding:60px;color:rgba(255,255,255,0.4)}
</style>
