<template>
	<div class="td-history">
		<h2 class="td-page-title">阅读历史</h2>

		<div class="touch-dom">
				<div ref="listRef" class="td-history-list">
					<t-history-item
						v-for="item in list"
						:key="item.chapterId"
						:item="item"
						variant="D"
						@click="goRead(item)"
						@contextmenu="openThemeContextMenu($event, 'chapter', item)"
					/>
				</div>
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

		<p class="td-empty" v-if="!loading && !list.length">暂无阅读记录</p>
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
.td-history { max-width: 80rem; margin: 0 auto; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
.td-history-list { display: flex; flex-direction: column; gap: 1rem; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 4rem; }
</style>
