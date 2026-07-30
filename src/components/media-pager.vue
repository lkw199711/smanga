<template>
	<div class="media-pager">
		<!--分页-->
		<el-pagination class="pagination" v-model:current-page="pagerPage" v-model:page-size="pageSize"
			:default-current-page="1" :page-sizes="pageSizes" :pager-count="pageCount" :small="pageSmall"
			:disabled="disabled" :background="background" :layout="pageLayout" :total="props.count"
			@size-change="size_change" @current-change="page_change" />
	</div>
</template>

<script lang="ts">
export default { name: 'media-pager' }
</script>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { config } from '@/store';

const pageSize = ref(10);
const disabled = ref(false);
const background = ref(true);
const pageSizes = ref([10, 20, 30, 40]);

// 传值
const props = defineProps(['page', 'pageSize', 'count', 'pageSizeConfig']);
const emit = defineEmits(['pageChange']);

let pagerPage = computed(() => {
	return props.page;
})

const pageCount = computed(() => {
	// 展示最大页码数量
	const screenType = config.screenType;
	switch (screenType) {
		case '2k':
			return 46;
		case 'large':
			return 17;
		case 'middle':
			return 11;
		case 'small':
			return 7;
		case 'mini':
			return 5;
		default:
			return 21;
	}
})

let pageSmall = computed(() => {
	const screenType = config.screenType;
	switch (screenType) {
		case 'large':
			return false;
		case 'middle':
			return false;
		case 'small':
			return true;
		case 'mini':
			return true;
		default:
			return false;
	}
})

let pageLayout = computed(() => {
	const screenType = config.screenType;
	switch (screenType) {
		case 'large':
			return 'total, sizes, prev, pager, next, jumper';
		case 'middle':
			return 'sizes, prev, pager, next, jumper';
		case 'small':
			return 'prev, pager, next, jumper';
		case 'mini':
			return 'prev, pager, next, jumper';
		default:
			return 'total, sizes, prev, pager, next, jumper';
	}
})

/**
 * 页码尺寸变更
 * @param size
 */
function size_change(size: number) {
	pageSize.value = size;
	page_change();
}
/**
 * 页码变更
 * @param page
 */
function page_change(page = 1) {
	emit('pageChange', page, pageSize.value);
}

// 生命周期
function syncPageSize() {
	const configuredSizes = Array.isArray(props.pageSizeConfig)
		? props.pageSizeConfig
			.map((value: unknown) => Math.floor(Number(value)))
			.filter((value: number) => value > 0)
		: [];
	pageSizes.value = configuredSizes.length ? configuredSizes : [10];
	const preferredSize = Math.floor(Number(props.pageSize || pageSizes.value[0]));
	pageSize.value = preferredSize > 0 ? preferredSize : pageSizes.value[0];
}

watch(() => props.pageSizeConfig, syncPageSize, { deep: true });
watch(() => props.pageSize, syncPageSize);

onMounted(syncPageSize)

</script>

<style scoped lang="less">
.media-pager {
	margin-top: 8rem;
	width: 100%;
	overflow-x: auto;
}

@media only screen and (min-width: 1200px) {
	:deep(.el-pagination__jump) {
		margin-left: 0.12rem;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	:deep(.el-pagination__jump) {
		margin-left: 0.8rem;
	}
}

@media only screen and (max-width: 767px) {
	:deep(.el-pagination__jump) {
		margin-left: 0.4rem;
	}
}
</style>
