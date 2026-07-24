import { useRouter } from 'vue-router'
import { globalData } from '@/store'

export interface GoReadItem {
	chapterId?: number | string
	page?: number | string
	mangaName?: string
	chapterName?: string
	[key: string]: any
}

export interface GoReadOptions {
	/** 是否将 item.page 写入 localStorage.pageJump,供 reader 跳页使用(bookmark 场景) */
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

	function goRead(item: GoReadItem | number | string, options?: GoReadOptions) {
		const merged = { ...defaults, ...(options || {}) }
		const isObj = typeof item === 'object' && item !== null
		const data = isObj ? (item as GoReadItem) : ({ chapterId: item } as GoReadItem)
		if (!data.chapterId && data.chapterId !== 0) return

		if (merged.withPageJump) {
			const pageNum = Number(data.page || 1)
			localStorage.setItem('pageJump', String(pageNum))
		}
		if (merged.syncGlobalNames) {
			globalData.mangaName = data.mangaName || globalData.mangaName
			globalData.chapterName = data.chapterName || globalData.chapterName
		}

		return router.push(`/t/reader/${data.chapterId}`)
	}

	return { goRead }
}