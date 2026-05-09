<template>
  <div class="td-single">
    <div class="td-single-page" v-if="images.length">
      <img :src="images[current]" @click="next" />
      <div class="td-single-nav">
        <button :disabled="current<=0" @click="current--">‹</button>
        <span>{{ current + 1 }} / {{ images.length }}</span>
        <button :disabled="current>=images.length-1" @click="current++">›</button>
      </div>
    </div>
    <p class="td-empty" v-else>暂无图片</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{ images: string[]; chapterId?: string }>()
const current = ref(0)

function next() { if (current.value < props.images.length - 1) current.value++ }
</script>

<style scoped>
.td-single { display: flex; flex-direction: column; align-items: center; padding: 20px; min-height: 100%; }
.td-single-page { text-align: center; }
.td-single-page img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 4px; cursor: pointer; }
.td-single-nav { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 16px; }
.td-single-nav button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); font-size: 18px; cursor: pointer; transition: all .2s; }
.td-single-nav button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.td-single-nav button:disabled { opacity: 0.3; }
.td-single-nav span { font-size: 13px; color: var(--fg2); }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
