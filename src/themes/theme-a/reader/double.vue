<template>
  <div class="ta-double">
    <t-reader-image v-if="leftFile" :file="leftFile" class="ta-double-img" :lazy="false" />
    <t-reader-image v-if="rightFile" :file="rightFile" class="ta-double-img" :lazy="false" />
    <div v-if="!leftFile && !rightFile" class="ta-double-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'
import TReaderImage from '@/themes/components/reader-image.vue'

const leftFile = computed(() => {
  const list = globalData.imgPathList || []
  const idx = globalData.page * 2
  return list[idx] || ''
})

const rightFile = computed(() => {
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
