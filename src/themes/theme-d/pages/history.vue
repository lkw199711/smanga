<template>
	<div class="td-history">
		<h2 class="td-page-title">阅读历史</h2>

		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div class="chapter-list-box block">
					<chapter
						v-for="item in list"
						:key="item.chapterId"
						viewType="list"
						:chapterInfo="item"
						@click="go_read(item)"
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

		<p class="td-empty" v-if="!loading && !list.length">暂无阅读记录</p>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import chapter from '@/components/chapter.vue'
import historyApi from '@/api/history'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import { chapterPageSize } from '@/store/page-size'
import { config } from '@/store'

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

<style scoped>
.td-history { max-width: 800px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-empty { text-align: center; color: var(--fg2); margin-top: 40px; }
</style>

<style src="@/style/chapter-list.less" scoped lang="less"></style>
