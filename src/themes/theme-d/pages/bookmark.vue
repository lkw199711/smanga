<template>
	<div class="td-bookmark">
		<h2 class="td-page-title">书签</h2>

		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div class="td-bookmark-list">
					<t-bookmark-item
						v-for="item in list"
						:key="item.bookmarkId"
						:item="item"
						variant="D"
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

		<p class="td-empty" v-if="!loading && !list.length">暂无书签</p>
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

<style scoped>
.td-bookmark { max-width: 80rem; margin: 0 auto; }
.td-page-title { font-size: 2rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
.td-bookmark-list { display: flex; flex-direction: column; gap: 1rem; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 4rem; }
</style>