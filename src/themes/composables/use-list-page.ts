import {
	computed,
	onMounted,
	ref,
	unref,
	watch,
	type MaybeRefOrGetter,
	type Ref,
} from 'vue'
import { useRoute } from 'vue-router'
import { themeListKeys } from '@/themes/stores/list-state'
import { type PageSizeKind } from './use-page-size'
import { useThemeListPagination } from './use-list-state'

export interface ListPageResult<T> {
	list: T[]
	count: number
}

export type ListPageLoader<T> = (params: {
	page: number
	pageSize: number
}) => Promise<ListPageResult<T>>

export interface UseListPageOptions<T> {
	/** 加载函数，返回 { list, count }。 */
	loader: ListPageLoader<T>
	/**
	 * 分页大小类型，默认 chapter。
	 * 可传 ref 支持动态切换，例如收藏页的漫画/章节 Tab。
	 */
	kind?: PageSizeKind | Ref<PageSizeKind>
	/** 是否在 onMounted 时自动加载，默认 true。 */
	immediate?: boolean
	/** 这些依赖变化时回到第一页并重新加载。 */
	resetDeps?: Array<Ref<any> | (() => any)>
	/**
	 * 新主题分页缓存键。未提供时使用当前路由名。
	 * 带业务上下文的列表应显式传入，例如 manga:${mediaId}。
	 */
	cacheKey?: MaybeRefOrGetter<string>
}

/**
 * 新主题通用列表分页。
 *
 * 接口结果仍属于页面局部数据；page/pageSize 由 theme-list-state 管理，
 * 因此离开列表再返回时可以恢复位置，同时不会污染旧主题的 browse store。
 */
export function useListPage<T = any>(options: UseListPageOptions<T>) {
	const { loader, kind = 'chapter', immediate = true, resetDeps = [] } = options
	const route = useRoute()

	const kindRef = ref<PageSizeKind>(unref(kind as any))
	const isKindRef = kind && typeof kind === 'object' && 'value' in (kind as any)
	if (isKindRef) {
		watch(kind as Ref<PageSizeKind>, value => (kindRef.value = value))
	}

	const inferredCacheKey = computed(() => themeListKeys.route(route.name || route.path))
	const {
		page,
		pageSize,
		pageSizes,
		reset: resetPagination,
		setPage,
	} = useThemeListPagination(options.cacheKey || inferredCacheKey, kindRef)

	// 保留完整 Ref 类型，让 Vue 模板正确解包泛型数组。
	const list = ref<T[]>([]) as Ref<T[]>
	const count = ref(0)
	const loading = ref(false)

	async function load() {
		loading.value = true
		list.value = []
		try {
			const result = await loader({ page: page.value, pageSize: pageSize.value })
			list.value = result?.list || []
			count.value = Number(result?.count || 0)
		} catch {
			list.value = []
			count.value = 0
		} finally {
			loading.value = false
		}
	}

	async function pageChange(nextPage = 1, nextPageSize = pageSize.value) {
		if (nextPage < 1) return
		setPage(nextPage, nextPageSize)
		await load()
	}

	async function reset() {
		resetPagination()
		await load()
	}

	if (resetDeps.length) {
		watch(resetDeps as any, () => reset())
	}

	if (immediate) {
		onMounted(load)
	}

	return { page, pageSize, pageSizes, list, count, loading, load, pageChange, reset }
}
