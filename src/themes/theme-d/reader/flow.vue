<template>
  <div class="td-flow">
    <img v-for="(img, i) in images" :key="i" :src="img" class="td-flow-img" />
    <p class="td-empty" v-if="!images.length">暂无图片</p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ images: string[]; chapterId?: string }>()
</script>

<style scoped>
.td-flow { display: flex; flex-direction: column; align-items: center; padding: 0; }
.td-flow-img { width: 100%; max-width: 800px; display: block; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
