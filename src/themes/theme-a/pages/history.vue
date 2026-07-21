<template>
	<div class="ta-history">
		<div class="ta-page-head"><h1>历史记录</h1></div>
		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div class="ta-history-list">
					<t-history-item
						v-for="item in list"
						:key="item.chapterId"
						:item="item"
						variant="A"
						@click="go_read(item)"
						@contextmenu="openThemeContextMenu($event, 'chapter', item)"
					/>
				</div>
			</template>
		</div>

		<media-pager
			:page="page"
			:count="count"
			:page-size-config="pageSizes"
			@page-change="page_change"
		/>

		<div v-if="!loading && list.length === 0" class="ta-empty">暂无记录</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import { chapterPageSize } from '@/store/page-size'
import { config } from '@/store'
import THistoryItem from '@/themes/components/history-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'

const router = useRouter()

const page = ref(1)
const list = ref<any[]>([])
const count = ref(0)
const loading = ref(false)
const pageSizes = ref<number[]>([])
const defaultPageSize = ref(10)

function setupPageSize() {
	const screen = config.screenType
	pageSizes.value = chapterPageSize[screen]
	defaultPageSize.value = chapterPageSize[screen][0]
}

async function go_read(item: any) {
	if (!item?.chapterId) return
	await router.push(`/t/reader/${item.chapterId}`)
}

async function page_change(pageParams = 1, pageSize = defaultPageSize.value) {
	if (pageParams < 1) return
	page.value = pageParams
	loading.value = true
	list.value = []

	const res = await historyApi.get_history(pageParams, pageSize)
	list.value = res?.list || []
	count.value = Number(res?.count || 0)
	loading.value = false
}

onMounted(() => {
	setupPageSize()
	page_change()
})
</script>

<style scoped lang="less">
.ta-history {
	max-width: 980px;
	margin: 0 auto;
}

.ta-page-head {
	margin-bottom: 24px;
}

.ta-page-head h1 {
	font-size: 20px;
	font-weight: 700;
	margin: 0;
}

.ta-empty {
	text-align: center;
	padding: 60px;
	color: #9ca3af;
}

.ta-history-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
</style>
