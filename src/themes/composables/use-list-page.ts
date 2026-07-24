import { ref, onMounted, watch, unref, type Ref } from 'vue'
import { usePageSize, type PageSizeKind } from './use-page-size'

export interface ListPageResult<T> {
	list: T[]
	count: number
}

export type ListPageLoader<T> = (params: {
	page: number
	pageSize: number
}) => Promise<ListPageResult<T>>

export interface UseListPageOptions<T> {
	/** 加载函数,返回 { list, count } */
	loader: ListPageLoader<T>
	/**
	 * 分页大小类型,默认 chapter。
	 * 可传 ref 以支持动态切换(如 collect 页面 tab 切换 manga/chapter)。
	 */
	kind?: PageSizeKind | Ref<PageSizeKind>
	/** 是否在 onMounted 时自动加载首页,默认 true */
	immediate?: boolean
	/**
	 * 触发列表 reset(回到第一页并重新加载)的依赖来源。
	 * 例如传 tab、orderBy 等 ref/getter 组成的数组。
	 */
	resetDeps?: Array<Ref<any> | (() => any)>
}

/**
 * 通用列表分页组合式函数。
 * 统一处理 page / pageSize / list / count / loading 状态,及 page_change 逻辑。
 */
export function useListPage<T = any>(options: UseListPageOptions<T>) {
	const { loader, kind = 'chapter', immediate = true, resetDeps = [] } = options

	const kindRef = ref<PageSizeKind>(unref(kind as any))
	const isKindRef = kind && typeof kind === 'object' && 'value' in (kind as any)
	if (isKindRef) {
		watch(kind as Ref<PageSizeKind>, v => (kindRef.value = v))
	}

	const { pageSizes, defaultPageSize, refresh: refreshPageSize } = usePageSize(kindRef)

	// kind 变化时重建页大小选项
	watch(kindRef, () => {
		// 直接内联,避免 usePageSize 内部 kind 不可变
		refreshPageSize()
	})

	const page = ref(1)
	const pageSize = ref(defaultPageSize.value)
	const list = ref<T[]>([]) as { value: T[] }
	const count = ref(0)
	const loading = ref(false)

	async function load() {
		loading.value = true
		list.value = []
		try {
			const res = await loader({ page: page.value, pageSize: pageSize.value })
			list.value = res?.list || []
			count.value = Number(res?.count || 0)
		} catch {
			list.value = []
			count.value = 0
		} finally {
			loading.value = false
		}
	}

	async function pageChange(nextPage = 1, nextPageSize = pageSize.value) {
		if (nextPage < 1) return
		page.value = nextPage
		pageSize.value = nextPageSize
		await load()
	}

	async function reset() {
		page.value = 1
		pageSize.value = defaultPageSize.value
		await load()
	}

	if (resetDeps.length) {
		watch(resetDeps as any, () => reset())
	}

	if (immediate) {
		onMounted(() => {
			pageSize.value = defaultPageSize.value
			load()
		})
	}

	return { page, pageSize, pageSizes, list, count, loading, load, pageChange, reset }
}