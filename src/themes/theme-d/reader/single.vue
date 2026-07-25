<template>
  <div class="td-single">
    <t-reader-image v-if="currentFile" :file="currentFile" class="td-single-img" :lazy="false" @click="nextPage" />
    <div v-else class="td-single-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'

const currentFile = computed(() => {
  const list = globalData.imgPathList || []
  return list[globalData.page] || ''
})

function nextPage() {
  const list = globalData.imgPathList || []
  if (globalData.page < list.length - 1) {
    globalData.page++
  }
}
</script>

<style scoped>
.td-single {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.td-single-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.td-single-empty {
  color: #9ca3af;
  font-size: 1.4rem;
}
</style>
