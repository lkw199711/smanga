<template>
	<div ref="pagerElement" class="media-pager">
		<el-pagination v-if="!isCompact" class="pagination"
			:current-page="currentPage" :page-size="pageSize"
			:page-sizes="pageSizes" :pager-count="pagerCount"
			:disabled="disabled" :background="background"
			:layout="pagerLayout" :total="props.count"
			@size-change="size_change" @current-change="page_change" />

		<div v-else class="media-pager__compact" aria-label="分页">
			<button
				type="button"
				class="media-pager__button"
				:disabled="currentPage <= 1"
				aria-label="上一页"
				@click="page_change(currentPage - 1)"
			>上一页</button>
			<span class="media-pager__status">{{ currentPage }} / {{ totalPages }}</span>
			<button
				type="button"
				class="media-pager__button"
				:disabled="currentPage >= totalPages"
				aria-label="下一页"
				@click="page_change(currentPage + 1)"
			>下一页</button>
		</div>
	</div>
</template>

<script lang="ts">
export default { name: 'media-pager' }
</script>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const pageSize = ref(10);
const disabled = ref(false);
const background = ref(true);
const pageSizes = ref([10, 20, 30, 40]);
const pagerElement = ref<HTMLElement | null>(null)
const containerWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth)
let resizeObserver: ResizeObserver | null = null

const props = defineProps<{
	page: number
	pageSize?: number
	count: number
	pageSizeConfig?: number[]
}>()
const emit = defineEmits<{
	pageChange: [page: number, pageSize: number]
}>()
const normalizedCount = computed(() => Math.max(0, Math.floor(Number(props.count) || 0)))
const totalPages = computed(() => Math.max(1, Math.ceil(normalizedCount.value / pageSize.value)))
const currentPage = computed(() => Math.min(
	totalPages.value,
	Math.max(1, Math.floor(Number(props.page) || 1)),
))
const isCompact = computed(() => containerWidth.value < 680)
const pagerCount = computed(() => containerWidth.value < 960 ? 5 : 7)
const pagerLayout = computed(() => containerWidth.value < 960
	? 'sizes, prev, pager, next, jumper'
	: 'total, sizes, prev, pager, next, jumper')
let changingSize = false

function size_change(size: number) {
	if (!Number.isFinite(size) || size < 1) return
	const oldSize = Math.max(1, Math.floor(Number(props.pageSize) || pageSize.value))
	const firstItemIndex = (currentPage.value - 1) * oldSize
	pageSize.value = size;
	const nextPage = Math.min(
		Math.max(1, Math.ceil(normalizedCount.value / size)),
		Math.floor(firstItemIndex / size) + 1,
	)
	changingSize = true
	emit('pageChange', nextPage, size)
	queueMicrotask(() => (changingSize = false))
}

function page_change(page = 1) {
	if (changingSize) return
	const nextPage = Math.min(totalPages.value, Math.max(1, Math.floor(Number(page) || 1)))
	emit('pageChange', nextPage, pageSize.value);
}
function updateContainerWidth() {
	const width = pagerElement.value?.clientWidth
	if (width && width > 0) containerWidth.value = width
}

function syncPageSize() {
	const configuredSizes = Array.isArray(props.pageSizeConfig)
		? props.pageSizeConfig
			.map((value: unknown) => Math.floor(Number(value)))
			.filter((value: number) => value > 0)
		: [];
	const availableSizes = configuredSizes.length ? configuredSizes : [10]
	const preferredSize = Math.floor(Number(props.pageSize || availableSizes[0]));
	pageSize.value = preferredSize > 0 ? preferredSize : availableSizes[0];
	pageSizes.value = [...new Set([
		...availableSizes,
		pageSize.value,
	])].sort((left, right) => left - right)
}

watch(() => props.pageSizeConfig, syncPageSize, { deep: true });
watch(() => props.pageSize, syncPageSize);

onMounted(() => {
	syncPageSize()
	updateContainerWidth()
	if (typeof ResizeObserver !== 'undefined' && pagerElement.value) {
		resizeObserver = new ResizeObserver(updateContainerWidth)
		resizeObserver.observe(pagerElement.value)
	}
	window.addEventListener('resize', updateContainerWidth)
})

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	window.removeEventListener('resize', updateContainerWidth)
})

</script>

<style scoped lang="less">
.media-pager {
	margin-top: 8rem;
	width: 100%;
	overflow-x: auto;
}

.pagination {
	width: max-content;
	min-width: 100%;
	justify-content: center;
}

.media-pager__compact {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1.2rem;
	min-width: 0;
	color: var(--el-text-color-regular, #606266);
	font-size: 1.3rem;
}

.media-pager__status {
	min-width: 6.8rem;
	text-align: center;
	font-variant-numeric: tabular-nums;
}

.media-pager__button {
	box-sizing: border-box;
	height: 3.6rem;
	border: 1px solid var(--el-border-color, #dcdfe6);
	border-radius: 0.6rem;
	background: var(--el-fill-color-blank, #fff);
	color: var(--el-text-color-regular, #606266);
	font: inherit;
}

.media-pager__button {
	cursor: pointer;
	padding: 0 1.2rem;
}

.media-pager__button:hover:not(:disabled) {
	border-color: var(--el-color-primary, #409eff);
	color: var(--el-color-primary, #409eff);
}

.media-pager__button:disabled {
	cursor: not-allowed;
	opacity: 0.45;
}

.media-pager__button:focus-visible {
	outline: 2px solid var(--el-color-primary-light-5, #a0cfff);
	outline-offset: 1px;
}

@media only screen and (max-width: 767px) {
	.media-pager {
		margin-top: 4rem;
	}
}
</style>
