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
		fit?: 'contain' | 'cover'
	}>(),
	{
		file: '',
		seed: 0,
		variant: 'A',
		fit: 'contain',
	}
)

const rootEl = ref<HTMLElement | null>(null)
const src = ref<string>('')
let observer: IntersectionObserver | null = null
let requestController: AbortController | null = null
let loadSequence = 0

function cancelLoad() {
	loadSequence++
	requestController?.abort()
	requestController = null
}

async function load() {
	cancelLoad()
	if (!props.file) {
		src.value = ''
		return
	}

	const file = props.file
	const sequence = loadSequence
	const controller = new AbortController()
	requestController = controller

	try {
		const nextSrc = await imageApi.get({
			file,
			priority: 100,
			signal: controller.signal,
		})
		if (sequence === loadSequence && file === props.file) {
			src.value = nextSrc
			observer?.disconnect()
			observer = null
		}
	} catch (error) {
		if (!(error instanceof Error) || error.name !== 'AbortError') {
			console.warn('封面加载失败', error)
		}
	} finally {
		if (requestController === controller) requestController = null
	}
}

function startObserving() {
	if (!rootEl.value) return
	observer?.disconnect()
	observer = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (e.isIntersecting) {
				if (!src.value && !requestController) void load()
			} else if (!src.value) {
				cancelLoad()
			}
		}
	})
	observer.observe(rootEl.value)
}

onMounted(() => {
	startObserving()
})

onBeforeUnmount(() => {
	observer?.disconnect()
	observer = null
	cancelLoad()
})

watch(
	() => props.file,
	() => {
		cancelLoad()
		src.value = ''
		startObserving()
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
	if (src.value) return { backgroundImage: `url("${src.value}")`, backgroundSize: props.fit }
	return { backgroundImage: `linear-gradient(135deg, ${gradient.value[0]}, ${gradient.value[1]})`, backgroundSize: props.fit }
})
</script>

<style scoped>
.t-cover {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: inherit;
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
}

.t-cover--A {
	background-color: #f3f4f6;
}

.t-cover--B {
	background-color: #f3f4f6;
}

.t-cover--D {
	background-color: var(--bg2);
}
</style>
