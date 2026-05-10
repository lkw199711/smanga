<template>
	<div ref="rootEl" :class="['t-cover', `t-cover--${variant}`]" :style="styleObj">
		<slot />
	</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import imageApi from '@/api/image'

const props = withDefaults(
	defineProps<{
		file?: string
		seed?: number
		variant?: 'A' | 'B' | 'D'
	}>(),
	{
		file: '',
		seed: 0,
		variant: 'A',
	}
)

const rootEl = ref<HTMLElement | null>(null)
const src = ref<string>('')
let observer: IntersectionObserver | null = null

async function load() {
	if (!props.file) {
		src.value = ''
		return
	}
	src.value = await imageApi.get({ file: props.file })
}

onMounted(() => {
	if (!rootEl.value) return
	observer = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue
			load()
			observer?.disconnect()
			observer = null
			break
		}
	})
	observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
	observer?.disconnect()
	observer = null
})

watch(
	() => props.file,
	() => {
		src.value = ''
		if (!observer) load()
	}
)

const gradient = computed(() => {
	const n = Math.abs(Number(props.seed) || 0)
	const palette: [string, string][] = [
		['#FFB5A7', '#FEC89A'],
		['#A0C4FF', '#BDB2FF'],
		['#B9FBC0', '#A0E8AF'],
		['#FDCB82', '#F7B267'],
		['#CDB4DB', '#FFC8DD'],
		['#90DBF4', '#8EECF5'],
	]
	return palette[n % palette.length]
})

const styleObj = computed<Record<string, string>>(() => {
	if (src.value) return { backgroundImage: `url("${src.value}")` }
	return { backgroundImage: `linear-gradient(135deg, ${gradient.value[0]}, ${gradient.value[1]})` }
})
</script>

<style scoped>
.t-cover {
	position: relative;
	overflow: hidden;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
}

.t-cover--A {
	background-color: #f3f4f6;
}

.t-cover--B {
	background-color: rgba(255, 255, 255, 0.06);
}

.t-cover--D {
	background-color: var(--bg2);
}
</style>
