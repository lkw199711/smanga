import { defineStore } from 'pinia'
import pinia from '@/store/pinia'
import {
	STORAGE_KEYS,
	localStorageCache,
	sessionStorageCache,
} from '@/utils/persistence'

function normalizePage(value: unknown): number | null {
	const page = Number(value)
	return Number.isFinite(page) && page >= 1 ? Math.floor(page) : null
}

export const useNavigationStore = defineStore('navigation', {
	state: () => ({
		pendingReaderPage: null as number | null,
	}),

	actions: {
		queueReaderPage(value: unknown) {
			const page = normalizePage(value) || 1
			this.pendingReaderPage = page
			sessionStorageCache.set(STORAGE_KEYS.pendingReaderPage, String(page))
			// 新逻辑不再把一次性跳页状态长期留在 localStorage。
			localStorageCache.remove('pageJump')
			return page
		},

		consumeReaderPage() {
			const page = this.pendingReaderPage
				?? normalizePage(sessionStorageCache.get(STORAGE_KEYS.pendingReaderPage))
				// 兼容未修改的旧主题跳转来源。
				?? normalizePage(localStorageCache.get('pageJump'))
				?? 1

			this.pendingReaderPage = null
			sessionStorageCache.remove(STORAGE_KEYS.pendingReaderPage)
			localStorageCache.remove('pageJump')
			return page
		},

		clearReaderPage() {
			this.pendingReaderPage = null
			sessionStorageCache.remove(STORAGE_KEYS.pendingReaderPage)
			localStorageCache.remove('pageJump')
		},
	},
})

export const navigationStore = useNavigationStore(pinia)
