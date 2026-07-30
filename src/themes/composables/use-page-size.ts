import { ref, watch, isRef, type Ref } from 'vue'
import { config } from '@/store'
import { chapterPageSize, mangaPageSize } from '@/store/page-size'
import { preferencesStore } from '@/store/preferences'

export type PageSizeKind = 'chapter' | 'manga'

/**
 * 统一封装:根据当前屏幕类型返回可选分页大小列表 & 默认页大小。
 * 屏幕类型或 kind 变化时会自动刷新。
 */
export function usePageSize(kind: PageSizeKind | Ref<PageSizeKind> = 'chapter') {
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

	return { pageSizes, defaultPageSize, refresh }
}
