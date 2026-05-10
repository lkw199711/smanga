<template>
  <div class="td-double">
    <div class="td-double-spread" v-if="images.length">
      <t-reader-image v-if="images[current*2]" :file="images[current*2]" :lazy="false" class="td-double-page" />
      <t-reader-image v-if="images[current*2+1]" :file="images[current*2+1]" :lazy="false" class="td-double-page" />
    </div>
    <div class="td-double-nav" v-if="images.length">
      <button :disabled="current<=0" @click="current--">‹</button>
      <span>{{ current*2+1 }}-{{ Math.min(current*2+2, images.length) }} / {{ images.length }}</span>
      <button :disabled="(current+1)*2>=images.length" @click="current++">›</button>
    </div>
    <p class="td-empty" v-if="!images.length">暂无图片</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import TReaderImage from '@/themes/components/reader-image.vue'

const props = defineProps<{ images: string[]; chapterId?: number; initialPage?: number }>()
const current = ref(0)

watch(
	() => [props.initialPage, props.images.length] as const,
	() => {
		const n = Number(props.initialPage || 0)
		const page = Number.isFinite(n) ? n : 0
		current.value = Math.max(0, Math.floor(page / 2))
	},
	{ immediate: true }
)
</script>

<style scoped>
.td-double { display: flex; flex-direction: column; align-items: center; padding: 20px; min-height: 100%; }
.td-double-spread { display: flex; gap: 4px; justify-content: center; }
.td-double-page { max-width: 48%; max-height: 80vh; object-fit: contain; border-radius: 4px; }
.td-double-nav { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 16px; }
.td-double-nav button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg2); color: var(--fg); font-size: 18px; cursor: pointer; transition: all .2s; }
.td-double-nav button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.td-double-nav button:disabled { opacity: 0.3; }
.td-double-nav span { font-size: 13px; color: var(--fg2); }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
