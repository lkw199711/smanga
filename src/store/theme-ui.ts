import { defineStore } from 'pinia'
import pinia from '@/store/pinia'

export type ThemeContextTarget = 'manga' | 'chapter' | 'media'

/**
 * 跨主题共享的 UI 协调状态。
 * 替代 document/window CustomEvent，使刷新来源、目标和订阅关系可追踪。
 */
export const useThemeUiStore = defineStore('theme-ui', {
	state: () => ({
		contextMenu: {
			visible: false,
			presentation: 'menu' as 'menu' | 'sheet',
			x: 0,
			y: 0,
			target: 'manga' as ThemeContextTarget,
			item: null as any,
		},
		contentRevision: 0,
		lastChangedTarget: null as ThemeContextTarget | null,
		chapterReadRevision: 0,
		lastReadChapterId: 0,
	}),

	actions: {
		notifyContentChanged(target: ThemeContextTarget) {
			this.lastChangedTarget = target
			this.contentRevision += 1
		},

		notifyChapterReadChanged(chapterId: number) {
			this.lastReadChapterId = chapterId
			this.chapterReadRevision += 1
		},
	},
})

export const themeUiStore = useThemeUiStore(pinia)
