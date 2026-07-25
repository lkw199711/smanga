<template><div class="tb-single"><t-reader-image v-if="currentFile" :file="currentFile" :lazy="false" @click="nextPage" /><div v-else class="tb-empty">加载中...</div></div></template>
<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'
const currentFile = computed(() => (globalData.imgPathList||[])[globalData.page]||'')
function nextPage(){ if(globalData.page < (globalData.imgPathList||[]).length-1) globalData.page++ }
</script>
<style scoped>
.tb-single{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.tb-single img{max-width:100%;max-height:100%;object-fit:contain;cursor:pointer}
.tb-empty{color:rgba(255,255,255,0.4);font-size:1.4rem}
</style>
