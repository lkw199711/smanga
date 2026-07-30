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
import { listDebug } from '@/utils/list-debug'
import { themeListKeys } from '@/themes/stores/list-state'
import { type PageSizeKind } from './use-page-size'
import { useThemeListPagination } from './use-list-state'
import { useAutoPageSize } from './use-auto-page-size'

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
	/** Rendered grid/list whose real item and layout sizes drive automatic capacity. */
	container?: Ref<HTMLElement | null>
	/** Space kept below the list for its pager. */
	bottomReserve?: MaybeRefOrGetter<number>
	/** Row-height model used while the real list is still behind the skeleton. */
	estimatedItemHeight?: MaybeRefOrGetter<number>
}

let listPageDebugSequence = 0

/**
 * 新主题通用列表分页。
 *
 * 接口结果仍属于页面局部数据；page/pageSize 由 theme-list-state 管理，
 * 因此离开列表再返回时可以恢复位置，同时不会污染旧主题的 browse store。
 */
export function useListPage<T = any>(options: UseListPageOptions<T>) {
	const { loader, kind = 'chapter', immediate = true, resetDeps = [] } = options
	const route = useRoute()
	const debugId = `${String(route.name || route.path || 'unknown')}#${++listPageDebugSequence}`

	const kindRef = ref<PageSizeKind>(unref(kind as any))
	const isKindRef = kind && typeof kind === 'object' && 'value' in (kind as any)
	if (isKindRef) {
		watch(kind as Ref<PageSizeKind>, value => (kindRef.value = value))
	}

	const inferredCacheKey = computed(() => themeListKeys.route(route.name || route.path))
	const autoSizing = options.container
		? useAutoPageSize(options.container, {
			kind: kindRef,
			bottomReserve: options.bottomReserve,
			estimatedItemHeight: options.estimatedItemHeight,
		})
		: undefined
	const autoPageSize = autoSizing?.autoPageSize
	const {
		page,
		pageSize,
		pageSizes,
		reset: resetPagination,
		setPage,
	} = useThemeListPagination(options.cacheKey || inferredCacheKey, kindRef, autoPageSize)

	// 保留完整 Ref 类型，让 Vue 模板正确解包泛型数组。
	const list = ref<T[]>([]) as Ref<T[]>
	const count = ref(0)
	const loading = ref(Boolean(options.container))
	let loadSequence = 0
	let mounted = false
	let pendingLoad = false
	let hasRequested = false

	async function load() {
		listDebug('page.load.called', {
			id: debugId,
			page: page.value,
			pageSize: pageSize.value,
			measurementReady: autoSizing?.measurementReady.value ?? true,
			currentLength: list.value.length,
		})

		if (autoSizing && !autoSizing.measurementReady.value) {
			pendingLoad = true
			loading.value = true
			listDebug('page.load.waiting-for-measurement', { id: debugId })
			return
		}

		pendingLoad = false
		hasRequested = true
		const sequence = ++loadSequence
		const requestPage = page.value
		const requestPageSize = pageSize.value
		loading.value = true
		list.value = []
		listDebug('page.request.start', {
			id: debugId,
			sequence,
			page: requestPage,
			pageSize: requestPageSize,
		})

		try {
			const result = await loader({ page: requestPage, pageSize: requestPageSize })
			listDebug('page.request.result', {
				id: debugId,
				sequence,
				currentSequence: loadSequence,
				resultType: Array.isArray(result) ? 'array' : typeof result,
				resultKeys: result && typeof result === 'object' ? Object.keys(result) : [],
				listIsArray: Array.isArray(result?.list),
				listLength: Array.isArray(result?.list) ? result.list.length : -1,
				count: Number(result?.count || 0),
			})
			if (sequence !== loadSequence) {
				listDebug('page.request.stale', { id: debugId, sequence, currentSequence: loadSequence })
				return
			}
			list.value = result?.list || []
			count.value = Number(result?.count || 0)
			listDebug('page.state.committed', {
				id: debugId,
				listLength: list.value.length,
				count: count.value,
			})
		} catch (error) {
			if (sequence !== loadSequence) return
			list.value = []
			count.value = 0
			listDebug('page.request.error', {
				id: debugId,
				name: error instanceof Error ? error.name : typeof error,
				message: error instanceof Error ? error.message : String(error),
			})
		} finally {
			if (sequence === loadSequence) {
				loading.value = false
				listDebug('page.load.finished', {
					id: debugId,
					listLength: list.value.length,
					count: count.value,
				})
			}
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

	onMounted(() => {
		mounted = true
		listDebug('page.mounted', {
			id: debugId,
			immediate,
			containerConnected: Boolean(options.container?.value?.isConnected),
			containerWidth: options.container?.value?.clientWidth || 0,
		})
		if (immediate) void load()
	})

	if (autoSizing) {
		watch(
			[pageSize, autoSizing.measurementReady],
			([value, ready], [oldValue]) => {
				listDebug('page.measurement-watch', {
					id: debugId,
					pageSize: value,
					oldPageSize: oldValue,
					ready,
					mounted,
					pendingLoad,
					hasRequested,
				})
				if (!mounted || !ready) return
				if (pendingLoad || (immediate && !hasRequested)) {
					void load()
					return
				}
				if (hasRequested && value > 0 && value !== oldValue) void load()
			},
			{ flush: 'post' },
		)
	}

	watch(
		kindRef,
		() => {
			if (autoSizing) {
				pendingLoad = true
				loading.value = true
				autoSizing.recalculate()
			}
		},
		{ flush: 'sync' },
	)

	return {
		page,
		pageSize,
		pageSizes,
		autoPageSize,
		measurementReady: autoSizing?.measurementReady,
		list,
		count,
		loading,
		load,
		pageChange,
		reset,
	}
}
