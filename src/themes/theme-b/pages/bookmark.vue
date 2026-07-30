<template>
	<div class="tb-page">
		<div class="tb-page-head"><h1>书签</h1></div>
		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div ref="listRef" class="tb-bookmark-list">
					<t-bookmark-item
						v-for="item in list"
						:key="item.bookmarkId"
						:item="item"
						variant="B"
						@click="goRead(item)"
						@contextmenu="openThemeContextMenu($event, 'chapter', item)"
					/>
				</div>
			</template>
		</div>

		<media-pager
			:page="page"
			:page-size="pageSize"
			:count="count"
			:page-size-config="pageSizes"
			@page-change="pageChange"
		/>

		<div v-if="!loading && !list.length" class="tb-empty">暂无书签</div>
	</div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import bookmarkApi from '@/api/bookmark'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import TBookmarkItem from '@/themes/components/bookmark-item.vue'
import { openThemeContextMenu } from '@/themes/context-menu'
import { useListPage, useGoRead } from '@/themes/composables'

const { goRead } = useGoRead({ withPageJump: true, syncGlobalNames: true })
const listRef = ref<HTMLElement | null>(null)
const { page, pageSize, list, count, loading, pageSizes, pageChange } = useListPage<any>({
	kind: 'chapter',
	container: listRef,
	loader: async ({ page, pageSize }) => {
		const res = await bookmarkApi.get(page, pageSize)
		return { list: res?.list || [], count: Number(res?.count || 0) }
	},
})
</script>
<style scoped>
.tb-page{max-width:98rem;margin:0 auto}
.tb-page-head{margin-bottom:2.4rem}
.tb-page-head h1{font-size:2rem;font-weight:700;margin:0;color:#1f2937}
.tb-bookmark-list{display:flex;flex-direction:column;gap:1rem}
.tb-empty{text-align:center;padding:6rem;color:#6b7280}
</style>
