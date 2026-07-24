<template>
  <div ref="rootEl" class="ta-flow">
    <t-reader-image v-for="(file, i) in files" :key="file" :file="file" class="ta-flow-img" :data-idx="i" />
    <div v-if="files.length === 0" class="ta-flow-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'
import { useFlowReader } from '@/themes/composables'

const files = computed(() => globalData.imgPathList || [])
const rootEl = ref<HTMLElement | null>(null)

useFlowReader(rootEl, {
  imgSelector: '.ta-flow-img',
  filesLength: () => files.value.length,
})
</script>

<style scoped>
.ta-flow { width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
.ta-flow-img { width: 100%; display: block; }
.ta-flow-empty { padding: 60px; color: #9ca3af; font-size: 14px; }
</style>