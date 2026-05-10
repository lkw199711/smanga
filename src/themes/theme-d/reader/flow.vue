<template>
  <div class="td-flow">
    <t-reader-image v-for="(file, i) in images" :key="file" :data-idx="i" :file="file" class="td-flow-img" />
    <p class="td-empty" v-if="!images.length">暂无图片</p>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch } from 'vue'
import TReaderImage from '@/themes/components/reader-image.vue'

const props = defineProps<{ images: string[]; chapterId?: number; initialPage?: number }>()

async function scrollToInitial() {
	const idx = Number(props.initialPage || 0)
	if (!Number.isFinite(idx) || idx <= 0) return
	await nextTick()
	const el = document.querySelector(`.td-flow-img[data-idx="${idx}"]`) as HTMLElement | null
	el?.scrollIntoView({ block: 'start' })
}

onMounted(() => {
	scrollToInitial()
})

watch(
	() => [props.initialPage, props.images.length] as const,
	() => {
		scrollToInitial()
	}
)
</script>

<style scoped>
.td-flow { display: flex; flex-direction: column; align-items: center; padding: 0; }
.td-flow-img { width: 100%; max-width: 800px; display: block; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>
