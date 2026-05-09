<template>
  <div class="tb-page"><h1>历史记录</h1>
    <div class="tb-list">
      <div v-for="item in list" :key="item.historyId" class="tb-list-item" @click="goRead(item)">
        <span class="tb-item-name">{{ item.mangaName }} - {{ item.chapterName }}</span>
        <span class="tb-item-time">{{ item.updateTime || '' }}</span>
      </div>
    </div>
    <div v-if="!list.length" class="tb-empty">暂无记录</div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
const router = useRouter()
const list = ref<any[]>([])
onMounted(async () => { try { list.value = (await historyApi.get(1,50))?.list || [] } catch(e){} })
function goRead(item:any){ router.push({path:'/browse-view/flow',query:{chapterId:item.chapterId}}) }
</script>
<style scoped>
h1{font-size:20px;font-weight:700;margin:0 0 20px;color:#fff}
.tb-list{display:flex;flex-direction:column;gap:6px}
.tb-list-item{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.06);border-radius:12px;cursor:pointer;transition:all .15s}
.tb-list-item:hover{background:rgba(255,255,255,0.1)}
.tb-item-name{font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-item-time{font-size:11px;color:rgba(255,255,255,0.4);flex-shrink:0;margin-left:12px}
.tb-empty{text-align:center;padding:60px;color:rgba(255,255,255,0.4)}
</style>
