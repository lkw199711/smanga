<template>
  <div class="tb-reader-layout">
    <header class="tb-reader-top" v-show="showControls">
      <button @click="router.back()">← 返回</button>
      <span>{{ globalData.mangaName }} - {{ globalData.chapterName }}</span>
      <button>目录</button>
    </header>
    <div class="tb-reader-body" @click="showControls=!showControls"><router-view /></div>
    <footer class="tb-reader-bottom" v-show="showControls">
      <button>上一章</button>
      <div class="tb-progress"><div class="tb-progress-bar" :style="{width: pct+'%'}"></div></div>
      <span class="tb-page-num">{{ globalData.page+1 }}</span>
      <button>下一章</button>
    </footer>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { globalData } from '@/store'
const router = useRouter()
const showControls = ref(true)
const pct = computed(() => { const l = globalData.imgPathList?.length || 1; return Math.round(((globalData.page+1)/l)*100) })
</script>
<style scoped>
.tb-reader-layout{display:flex;flex-direction:column;height:100vh;background:#0a0515;color:#fff}
.tb-reader-top{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:rgba(30,15,60,0.9);backdrop-filter:blur(12px)}
.tb-reader-top button{padding:6px 14px;background:rgba(255,255,255,0.1);border:none;border-radius:16px;color:#fff;cursor:pointer;font-size:12px}
.tb-reader-top span{font-size:13px;color:rgba(255,255,255,0.7);max-width:50%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-reader-body{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center}
.tb-reader-bottom{display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(30,15,60,0.9);backdrop-filter:blur(12px)}
.tb-reader-bottom button{padding:6px 14px;background:rgba(255,255,255,0.1);border:none;border-radius:16px;color:#fff;cursor:pointer;font-size:12px}
.tb-progress{flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden}
.tb-progress-bar{height:100%;background:linear-gradient(90deg,#a855f7,#ec4899);border-radius:2px;transition:width .2s}
.tb-page-num{font-size:12px;color:rgba(255,255,255,0.5)}
</style>
