<template><div class="tb-double"><img v-if="left" :src="left" /><img v-if="right" :src="right" /><div v-if="!left&&!right" class="tb-empty">加载中...</div></div></template>
<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
const left = computed(() => (globalData.imgPathList||[])[globalData.page*2]||'')
const right = computed(() => (globalData.imgPathList||[])[globalData.page*2+1]||'')
</script>
<style scoped>
.tb-double{display:flex;align-items:center;justify-content:center;width:100%;height:100%;gap:4px}
.tb-double img{max-width:49%;max-height:100%;object-fit:contain}
.tb-empty{color:rgba(255,255,255,0.4);font-size:14px}
</style>
