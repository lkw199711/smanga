<template><div class="tb-double"><t-reader-image v-if="leftFile" :file="leftFile" :lazy="false" /><t-reader-image v-if="rightFile" :file="rightFile" :lazy="false" /><div v-if="!leftFile&&!rightFile" class="tb-empty">加载中...</div></div></template>
<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'
const leftFile = computed(() => (globalData.imgPathList||[])[globalData.page*2]||'')
const rightFile = computed(() => (globalData.imgPathList||[])[globalData.page*2+1]||'')
</script>
<style scoped>
.tb-double{display:flex;align-items:center;justify-content:center;width:100%;height:100%;gap:4px}
.tb-double img{max-width:49%;max-height:100%;object-fit:contain}
.tb-empty{color:rgba(255,255,255,0.4);font-size:14px}
</style>
