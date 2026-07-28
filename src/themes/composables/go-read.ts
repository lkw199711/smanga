import { useRouter } from 'vue-router'
import { globalData } from '@/store'
import useBrowseStore from '@/store/browse'

export interface GoReadItem {
	chapterId?: number | string
	mediaId?: number | string
	mangaId?: number | string
	page?: number | string
	latest?: {
		page?: number | string
		[key: string]: any
	} | null
	mangaName?: string
	chapterName?: string
	[key: string]: any
}

export interface GoReadOptions {
	/** 是否将 item.page / item.latest.page 写入 pageJump,供 reader 恢复阅读进度 */
	withPageJump?: boolean
	/** 是否同步 mangaName/chapterName 到 globalData(bookmark 场景) */
	syncGlobalNames?: boolean
}

/**
 * 统一封装:跳转阅读页。
 * bookmark / collect / history / search / home / chapter-list / manga-info
 * 中原本各自重复实现的 go_read / goRead。三主题统一路径 `/t/reader/${chapterId}`。
 */
export function useGoRead(defaults: GoReadOptions = {}) {
	const router = useRouter()
	const browse = useBrowseStore()

	function goRead(item: GoReadItem | number | string, options?: GoReadOptions) {
		const merged = { ...defaults, ...(options || {}) }
		const isObj = typeof item === 'object' && item !== null
		const data = isObj ? (item as GoReadItem) : ({ chapterId: item } as GoReadItem)
		if (!data.chapterId && data.chapterId !== 0) return

		if (merged.withPageJump) {
			const rawPage = data.page ?? data.latest?.page ?? 1
			const parsedPage = Number(rawPage)
			const pageNum = Number.isFinite(parsedPage) && parsedPage >= 1
				? Math.floor(parsedPage)
				: 1
			// 与漫画详情页的继续阅读保持一致：先更新 Pinia 中阅读器直接消费的页码，
			// pageJump 仅作为跨页面/新标签页场景的后备值。
			browse.page = pageNum
			localStorage.setItem('pageJump', String(pageNum))
		}
		if (merged.syncGlobalNames) {
			globalData.mangaName = data.mangaName || globalData.mangaName
			globalData.chapterName = data.chapterName || globalData.chapterName
		}

		const query: Record<string, string> = {}
		if (data.mediaId !== undefined && data.mediaId !== null) query.mediaId = String(data.mediaId)
		if (data.mangaId !== undefined && data.mangaId !== null) query.mangaId = String(data.mangaId)

		return router.push({
			path: `/t/reader/${data.chapterId}`,
			query,
		})
	}

	return { goRead }
}
