<template>
  <div ref="rootEl" class="tb-flow">
    <t-reader-image v-for="(file, i) in files" :key="file" :file="file" class="tb-flow-img" :data-idx="i" />
    <div v-if="!files.length" class="tb-empty">加载中...</div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'
import { useFlowReader } from '@/themes/composables'
const files = computed(() => globalData.imgPathList || [])
const rootEl = ref<HTMLElement | null>(null)
useFlowReader(rootEl, { imgSelector: '.tb-flow-img', filesLength: () => files.value.length })
</script>
<style scoped>
.tb-flow{width:100%;max-width:90rem;margin:0 auto;display:flex;flex-direction:column;align-items:center}
.tb-flow img{width:100%;display:block}
.tb-empty{padding:6rem;color:rgba(255,255,255,0.4)}
</style>