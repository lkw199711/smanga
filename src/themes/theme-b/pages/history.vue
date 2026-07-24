<template>
	<div class="tb-page">
		<div class="tb-page-head"><h1>历史记录</h1></div>
		<div class="touch-dom">
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div class="tb-history-list">
					<t-history-item
						v-for="item in list"
						:key="item.chapterId"
						:item="item"
						variant="B"
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

		<div v-if="!loading && !list.length" class="tb-empty">暂无记录</div>
	</div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import historyApi from '@/api/history'
import MediaPager from '@/components/media-pager.vue'
import listSkeleton from '@/components/list-skeleton.vue'
import { chapterPageSize } from '@/store/page-size'
import { config, globalData } from '@/store'
import THistoryItem from '@/themes/components/history-item.vue'

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
.tb-page{max-width:980px;margin:0 auto}
.tb-page-head{margin-bottom:24px}
.tb-page-head h1{font-size:20px;font-weight:700;margin:0;color:#1f2937}
.tb-history-list{display:flex;flex-direction:column;gap:10px}
.tb-empty{text-align:center;padding:60px;color:#6b7280}
</style>

