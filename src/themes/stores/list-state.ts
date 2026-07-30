import { defineStore } from 'pinia'

export interface ThemeListPosition {
	page: number
	pageSize: number
}

function positiveInteger(value: unknown, fallback: number) {
	const number = Number(value)
	return Number.isFinite(number) && number >= 1 ? Math.floor(number) : fallback
}

function contextPart(value: unknown) {
	const text = String(value ?? '').trim()
	return text || 'default'
}

/**
 * 新主题专用的列表位置缓存键。
 *
 * manga/chapter 将业务主键放进缓存键，避免不同媒体库、不同漫画之间
 * 共用一个 page。route 供历史、书签、收藏等无业务主键的列表使用。
 */
export const themeListKeys = {
	manga: (mediaId: unknown) => `manga:${contextPart(mediaId)}`,
	chapter: (mangaId: unknown) => `chapter:${contextPart(mangaId)}`,
	route: (routeName: unknown, context?: unknown) =>
		`route:${contextPart(routeName)}:${contextPart(context)}`,
}

/**
 * 仅供 src/themes 使用的列表状态。
 *
 * 这里只缓存“回到列表时需要恢复”的轻量 UI 状态，不缓存接口返回的数据。
 * 状态默认只存在于当前 Pinia 生命周期中：切换路由后保留，刷新页面后重置。
 * 旧主题继续使用 src/store/browse.ts，二者刻意不互相同步。
 */
export const useThemeListStateStore = defineStore('theme-list-state', {
	state: () => ({
		positions: {} as Record<string, ThemeListPosition>,
	}),

	actions: {
		ensure(key: string, defaultPageSize: number): ThemeListPosition {
			const normalizedKey = contextPart(key)
			const fallbackPageSize = positiveInteger(defaultPageSize, 10)
			const current = this.positions[normalizedKey]

			if (!current) {
				this.positions[normalizedKey] = {
					page: 1,
					pageSize: fallbackPageSize,
				}
			} else {
				current.page = positiveInteger(current.page, 1)
				current.pageSize = positiveInteger(current.pageSize, fallbackPageSize)
			}

			return this.positions[normalizedKey]
		},

		set(key: string, page: number, pageSize: number) {
			const position = this.ensure(key, pageSize)
			position.page = positiveInteger(page, 1)
			position.pageSize = positiveInteger(pageSize, position.pageSize)
		},

		reset(key: string, defaultPageSize: number) {
			const position = this.ensure(key, defaultPageSize)
			position.page = 1
			position.pageSize = positiveInteger(defaultPageSize, position.pageSize)
		},

		remove(key: string) {
			delete this.positions[contextPart(key)]
		},

		clear() {
			this.positions = {}
		},
	},
})
