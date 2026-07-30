import { ref, watch, isRef, type Ref } from 'vue'
import { config } from '@/store'
import { chapterPageSize, mangaPageSize } from '@/store/page-size'
import { preferencesStore } from '@/store/preferences'

export type PageSizeKind = 'chapter' | 'manga'

/**
 * 统一封装分页容量优先级：用户固定值 > 元素/布局自动测量值 > 屏幕分档回退值。
 * 任一来源或 kind 变化时都会自动刷新。
 */
export function usePageSize(
	kind: PageSizeKind | Ref<PageSizeKind> = 'chapter',
	autoPageSize?: Ref<number>,
) {
	const pageSizes = ref<number[]>([])
	const defaultPageSize = ref(10)

	function readKind(): PageSizeKind {
		return isRef(kind) ? kind.value : kind
	}

	function refresh() {
		const preferredSize = readKind() === 'manga'
			? preferencesStore.mangaPageSize
			: preferencesStore.chapterPageSize
		if (preferredSize > 0) {
			pageSizes.value = [preferredSize]
			defaultPageSize.value = preferredSize
			return
		}

		const measuredSize = Math.floor(Number(autoPageSize?.value || 0))
		if (measuredSize > 0) {
			pageSizes.value = [measuredSize]
			defaultPageSize.value = measuredSize
			return
		}

		const screen = config.screenType as keyof typeof chapterPageSize
		const table = readKind() === 'manga' ? mangaPageSize : chapterPageSize
		const sizes = table[screen] || []
		pageSizes.value = sizes
		defaultPageSize.value = sizes[0] || 10
	}

	refresh()
	watch(() => config.screenType, refresh)
	watch(
		() => [preferencesStore.mangaPageSize, preferencesStore.chapterPageSize],
		refresh,
	)
	if (isRef(kind)) watch(kind, refresh)
	if (autoPageSize) watch(autoPageSize, refresh)

	return { pageSizes, defaultPageSize, refresh }
}
