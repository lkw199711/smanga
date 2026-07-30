import {
	computed,
	toValue,
	watch,
	type MaybeRefOrGetter,
	type Ref,
	type WritableComputedRef,
} from 'vue'
import { useThemeListStateStore } from '@/themes/stores/list-state'
import { usePageSize, type PageSizeKind } from './use-page-size'

export interface ThemeListPagination {
	page: WritableComputedRef<number>
	pageSize: WritableComputedRef<number>
	pageSizes: Ref<number[]>
	reset: () => void
	setPage: (page: number, pageSize?: number) => void
}

/**
 * 将新主题列表的页码接入 theme-list-state。
 *
 * cacheKey 可以是 computed/ref。业务上下文变化时，page/pageSize 会自动切换到
 * 对应的独立缓存项，不再像旧 browse 那样让所有漫画或管理列表共用一个页码。
 */
export function useThemeListPagination(
	cacheKey: MaybeRefOrGetter<string>,
	kind: PageSizeKind | Ref<PageSizeKind> = 'chapter',
	autoPageSize?: Ref<number>,
): ThemeListPagination {
	const store = useThemeListStateStore()
	const { pageSizes, defaultPageSize } = usePageSize(kind, autoPageSize)
	const resolvedKey = computed(() => toValue(cacheKey) || 'route:unknown:default')

	function readPosition() {
		return store.ensure(resolvedKey.value, defaultPageSize.value)
	}

	const page = computed<number>({
		get: () => readPosition().page,
		set: value => store.set(resolvedKey.value, value, readPosition().pageSize),
	})

	const pageSize = computed<number>({
		get: () => readPosition().pageSize,
		set: value => store.set(resolvedKey.value, readPosition().page, value),
	})

	function setPage(nextPage: number, nextPageSize = pageSize.value) {
		store.set(resolvedKey.value, nextPage, nextPageSize)
	}

	function reset() {
		store.reset(resolvedKey.value, defaultPageSize.value)
	}

	// 自动基准容量变化时同步仍跟随自动值的列表；手动选择的容量保持不变。
	watch(pageSizes, (sizes, previousSizes) => {
		if (!sizes.length) return
		const position = readPosition()
		const previousDefault = previousSizes?.[0] || 1
		const followsAutomaticSize = position.pageSize <= 1 || position.pageSize === previousDefault
		if (!followsAutomaticSize || position.pageSize === sizes[0]) return

		const value = sizes[0]
		const firstItemIndex = (position.page - 1) * position.pageSize
		const anchoredPage = Math.floor(firstItemIndex / value) + 1
		store.set(resolvedKey.value, anchoredPage, value)
	})

	return { page, pageSize, pageSizes, reset, setPage }
}
