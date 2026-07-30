<template>
	<div class="tb-page">
		<div class="tb-page-head"><h1>历史记录</h1></div>
		<div class="touch-dom">
			<template>
				<div ref="listRef" class="tb-history-list">
					<t-history-item
						v-for="item in list"
						:key="item.chapterId"
						:item="item"
						variant="B"
						@click="goRead(item)"
						@contextmenu="openThemeContextMenu($event, 'chapter', item)"
					/>
				</div>
			</template>
			<list-skeleton v-if="loading" />
		</div>

		<media-pager
			v-if="!loading"
			:page="page"
			:page-size="pageSize"
			:count="count"
			:page-size-config="pageSizes"
			@page-change="pageChange"
		/>

		<div v-if="!loading && !list.length" class="tb-empty">暂无记录</div>
	</div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import historyApi from '@/api/history'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import THistoryItem from '@/themes/components/history-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage, useGoRead } from '@/themes/composables'

const { goRead } = useGoRead({ withPageJump: true, syncGlobalNames: true })
const listRef = ref<HTMLElement | null>(null)
const { page, pageSize, list, count, loading, pageSizes, pageChange } = useListPage<any>({
	kind: 'chapter',
	container: listRef,
	estimatedItemHeight: 120,
	loader: async ({ page, pageSize }) => {
		const res = await historyApi.get_history(page, pageSize)
		return { list: res?.list || [], count: Number(res?.count || 0) }
	},
})
</script>
<style scoped>
.tb-page{max-width:98rem;margin:0 auto}
.tb-page-head{margin-bottom:2.4rem}
.tb-page-head h1{font-size:2rem;font-weight:700;margin:0;color:#1f2937}
.tb-history-list{display:flex;flex-direction:column;gap:1rem}
.tb-empty{text-align:center;padding:6rem;color:#6b7280}
</style>
