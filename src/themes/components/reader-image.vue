<template>
	<img ref="imgEl" :src="src" :alt="altText" />
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import imageApi from '@/api/image'
import placeholder from '@/assets/s-blue-high.png'

const props = withDefaults(
	defineProps<{
		file?: string
		alt?: string
		lazy?: boolean
	}>(),
	{
		file: '',
		alt: '',
		lazy: true,
	}
)

const imgEl = ref<HTMLElement | null>(null)
const src = ref<string>(placeholder)
let observer: IntersectionObserver | null = null

const altText = computed(() => props.alt || 'image')

async function load() {
	if (!props.file) {
		src.value = placeholder
		return
	}
	src.value = await imageApi.get({ file: props.file })
}

onMounted(() => {
	if (!props.lazy) {
		load()
		return
	}
	if (!imgEl.value) return
	observer = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue
			load()
			observer?.disconnect()
			observer = null
			break
		}
	})
	observer.observe(imgEl.value)
})

onBeforeUnmount(() => {
	observer?.disconnect()
	observer = null
})

watch(
	() => props.file,
	() => {
		src.value = placeholder
		if (!props.lazy || !observer) load()
	}
)
</script>
