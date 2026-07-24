<template>
	<div class="ta-bookmark">
		<div class="ta-page-head"><h1>书签</h1></div>
		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div class="ta-bookmark-list">
					<t-bookmark-item
						v-for="item in list"
						:key="item.bookmarkId"
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

		<div v-if="!loading && list.length === 0" class="ta-empty">暂无书签</div>
	</div>
</template>

<script lang="ts" setup>
import bookmarkApi from '@/api/bookmark'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TBookmarkItem from '@/themes/components/bookmark-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage, useGoRead } from '@/themes/composables'

const { goRead } = useGoRead({ withPageJump: true, syncGlobalNames: true })
const { page, list, count, loading, pageSizes, pageChange } = useListPage<any>({
	kind: 'chapter',
	loader: async ({ page, pageSize }) => {
		const res = await bookmarkApi.get(page, pageSize)
		return { list: res?.list || [], count: Number(res?.count || 0) }
	},
})
</script>

<style scoped lang="less">
.ta-bookmark {
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

.ta-bookmark-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.ta-empty {
	text-align: center;
	padding: 60px;
	color: #9ca3af;
}
</style>