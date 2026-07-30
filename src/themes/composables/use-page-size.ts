import { ref, watch, isRef, type Ref } from 'vue'
import { preferencesStore } from '@/store/preferences'

export type PageSizeKind = 'chapter' | 'manga'

/**
 * New-theme page-size priority: user preference > measured layout.
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

		// Automatic theme pages wait for a real layout measurement. They must
		// not issue a preliminary request using the old screen-width table.
		if (autoPageSize) {
			pageSizes.value = []
			defaultPageSize.value = 1
			return
		}

		pageSizes.value = [10]
		defaultPageSize.value = 10
	}

	refresh()
	watch(
		() => [preferencesStore.mangaPageSize, preferencesStore.chapterPageSize],
		refresh,
	)
	if (isRef(kind)) watch(kind, refresh)
	if (autoPageSize) watch(autoPageSize, refresh)

	return { pageSizes, defaultPageSize, refresh }
}
