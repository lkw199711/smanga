<template>
  <div class="ta-double">
    <img v-if="leftImage" :src="leftImage" class="ta-double-img" />
    <img v-if="rightImage" :src="rightImage" class="ta-double-img" />
    <div v-if="!leftImage && !rightImage" class="ta-double-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'

const leftImage = computed(() => {
  const list = globalData.imgPathList || []
  const idx = globalData.page * 2
  return list[idx] || ''
})

const rightImage = computed(() => {
  const list = globalData.imgPathList || []
  const idx = globalData.page * 2 + 1
  return list[idx] || ''
})
</script>

<style scoped>
.ta-double {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 4px;
}

.ta-double-img {
  max-width: 49%;
  max-height: 100%;
  object-fit: contain;
}

.ta-double-empty {
  color: #9ca3af;
  font-size: 14px;
}
</style>
