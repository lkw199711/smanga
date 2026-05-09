<template>
  <div class="ta-single">
    <img v-if="currentImage" :src="currentImage" class="ta-single-img" @click="nextPage" />
    <div v-else class="ta-single-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'

const currentImage = computed(() => {
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
.ta-single {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ta-single-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.ta-single-empty {
  color: #9ca3af;
  font-size: 14px;
}
</style>
