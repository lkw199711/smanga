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
						@click="goRead(item)"
						@contextmenu="openThemeContextMenu($event, 'chapter', item)"
					/>
				</div>
			</template>
		</div>

		<media-pager
			:page="page"
			:count="count"
			:page-size-config="pageSizes"
			@page-change="pageChange"
		/>

		<div v-if="!loading && list.length === 0" class="ta-empty">暂无记录</div>
	</div>
</template>

<script lang="ts" setup>
import historyApi from '@/api/history'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import THistoryItem from '@/themes/components/history-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage, useGoRead } from '@/themes/composables'

const { goRead } = useGoRead()
const { page, list, count, loading, pageSizes, pageChange } = useListPage<any>({
	kind: 'chapter',
	loader: async ({ page, pageSize }) => {
		const res = await historyApi.get_history(page, pageSize)
		return { list: res?.list || [], count: Number(res?.count || 0) }
	},
})
</script>

<style scoped lang="less">
.ta-history {
	max-width: 98rem;
	margin: 0 auto;
}

.ta-page-head {
	margin-bottom: 2.4rem;
}

.ta-page-head h1 {
	font-size: 2rem;
	font-weight: 700;
	margin: 0;
}

.ta-empty {
	text-align: center;
	padding: 6rem;
	color: #9ca3af;
}

.ta-history-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
</style>