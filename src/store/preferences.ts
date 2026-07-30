import { defineStore } from 'pinia'
import pinia from '@/store/pinia'
import {
	STORAGE_KEYS,
	readLocalPreference,
	toStoredNumber,
	writeLocalPreference,
} from '@/utils/persistence'

export type ShellTheme = 'A' | 'B' | 'D' | 'Legacy'
export type ThemeDColor = 'blue' | 'pink' | 'green' | 'purple' | 'red' | 'cyan' | 'orange' | 'grey' | 'dark'

const shellThemes = new Set<ShellTheme>(['A', 'B', 'D', 'Legacy'])
const themeDColors = new Set<ThemeDColor>(['blue', 'pink', 'green', 'purple', 'red', 'cyan', 'orange', 'grey', 'dark'])

function readShellTheme(): ShellTheme {
	const value = readLocalPreference(STORAGE_KEYS.shellTheme, 'A')
	return shellThemes.has(value as ShellTheme) ? value as ShellTheme : 'A'
}

function readThemeDColor(): ThemeDColor {
	const value = readLocalPreference(STORAGE_KEYS.themeDColor, 'blue')
	return themeDColors.has(value as ThemeDColor) ? value as ThemeDColor : 'blue'
}

export const usePreferencesStore = defineStore('preferences', {
	state: () => ({
		shellTheme: readShellTheme(),
		colorTheme: readLocalPreference(STORAGE_KEYS.colorTheme, 'light'),
		softBackground: readLocalPreference(STORAGE_KEYS.softBackground, 'false') === 'true',
		themeDColor: readThemeDColor(),
		mangaPageSize: toStoredNumber(readLocalPreference(STORAGE_KEYS.mangaPageSize)),
		chapterPageSize: toStoredNumber(readLocalPreference(STORAGE_KEYS.chapterPageSize)),
		language: readLocalPreference(STORAGE_KEYS.language, 'zhCn'),
	}),

	actions: {
		setShellTheme(theme: ShellTheme) {
			this.shellTheme = shellThemes.has(theme) ? theme : 'A'
			writeLocalPreference(STORAGE_KEYS.shellTheme, this.shellTheme)
		},

		setColorTheme(theme: string) {
			this.colorTheme = theme || 'light'
			writeLocalPreference(STORAGE_KEYS.colorTheme, this.colorTheme)
		},

		setSoftBackground(enabled: boolean) {
			this.softBackground = enabled
			writeLocalPreference(STORAGE_KEYS.softBackground, String(enabled))
		},

		setThemeDColor(theme: ThemeDColor) {
			this.themeDColor = themeDColors.has(theme) ? theme : 'blue'
			writeLocalPreference(STORAGE_KEYS.themeDColor, this.themeDColor)
		},

		setPageSizes(manga: number, chapter: number) {
			this.mangaPageSize = Number.isFinite(manga) && manga >= 0 ? manga : 0
			this.chapterPageSize = Number.isFinite(chapter) && chapter >= 0 ? chapter : 0
			writeLocalPreference(STORAGE_KEYS.mangaPageSize, String(this.mangaPageSize))
			writeLocalPreference(STORAGE_KEYS.chapterPageSize, String(this.chapterPageSize))
		},

		setLanguage(language: string) {
			this.language = language || 'zhCn'
			writeLocalPreference(STORAGE_KEYS.language, this.language)
		},

		/**
		 * 兼容未改动的旧主题：旧页面仍可能直接写 localStorage，
		 * 每次路由完成后将这些值重新同步到响应式 store。
		 */
		refreshLegacyValues() {
			this.mangaPageSize = toStoredNumber(readLocalPreference(STORAGE_KEYS.mangaPageSize))
			this.chapterPageSize = toStoredNumber(readLocalPreference(STORAGE_KEYS.chapterPageSize))
			this.language = readLocalPreference(STORAGE_KEYS.language, this.language)
		},
	},
})

export const preferencesStore = usePreferencesStore(pinia)
