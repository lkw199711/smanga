<template>
  <div class="ta-flow">
    <img v-for="(img, i) in images" :key="i" :src="img" class="ta-flow-img" />
    <div v-if="images.length === 0" class="ta-flow-empty">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { globalData } from '@/store'

const images = computed(() => globalData.imgPathList || [])
</script>

<style scoped>
.ta-flow {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ta-flow-img {
  width: 100%;
  display: block;
}

.ta-flow-empty {
  padding: 60px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
