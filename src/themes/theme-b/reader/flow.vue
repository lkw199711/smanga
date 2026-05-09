<template><div class="tb-flow"><img v-for="(img,i) in images" :key="i" :src="img" /><div v-if="!images.length" class="tb-empty">加载中...</div></div></template>
<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
const images = computed(() => globalData.imgPathList||[])
</script>
<style scoped>
.tb-flow{width:100%;max-width:900px;margin:0 auto;display:flex;flex-direction:column;align-items:center}
.tb-flow img{width:100%;display:block}
.tb-empty{padding:60px;color:rgba(255,255,255,0.4)}
</style>
