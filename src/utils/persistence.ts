/**
 * 浏览器持久化的唯一底层入口。
 *
 * cookie 只保留需要兼容现有鉴权协议的数据；界面偏好和页面缓存统一放在
 * localStorage/sessionStorage，避免继续扩大 document.cookie。
 */

export const COOKIE_KEYS = {
	serverKey: 'smanga-server-key',
	userId: 'userId',
	userName: 'userName',
	header: 'header',
	avatarPath: 'avatarPath',
	editUser: 'editUser',
	editMedia: 'editMedia',
} as const

export const STORAGE_KEYS = {
	sessionProfile: 'smanga.session.profile',
	shellTheme: 'smanga-theme',
	colorTheme: 'theme',
	softBackground: 'useSoftBackground',
	themeDColor: 'smanga-theme-d-color',
	mangaPageSize: 'mangaPageSize',
	chapterPageSize: 'chapterPageSize',
	language: 'language',
	versionNotice: 'alertsVersionMsg',
	pendingReaderPage: 'smanga.reader.pending-page',
} as const

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function canUseDocument() {
	return typeof document !== 'undefined'
}

function getStorage(kind: 'local' | 'session'): Storage | null {
	if (typeof window === 'undefined') return null
	try {
		return kind === 'local' ? window.localStorage : window.sessionStorage
	} catch {
		return null
	}
}

export const cookieStorage = {
	get(key: string): string {
		if (!canUseDocument()) return ''
		const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapeRegExp(key)}=([^;]*)`))
		if (!match) return ''
		try {
			return decodeURIComponent(match[1])
		} catch {
			return match[1]
		}
	},

	set(key: string, value: string, days = 365): string {
		if (!canUseDocument()) return value
		const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
		const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? ';Secure' : ''
		document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax${secure}`
		return value
	},

	remove(key: string): string {
		if (canUseDocument()) {
			document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
		}
		return key
	},
}

function createWebStorage(kind: 'local' | 'session') {
	return {
		get(key: string): string {
			try {
				return getStorage(kind)?.getItem(key) || ''
			} catch {
				return ''
			}
		},

		set(key: string, value: string): string {
			try {
				getStorage(kind)?.setItem(key, value)
			} catch (error) {
				console.warn(`[persistence] 无法写入 ${kind}Storage: ${key}`, error)
			}
			return value
		},

		remove(key: string): string {
			try {
				getStorage(kind)?.removeItem(key)
			} catch {
				// 存储不可用时删除本身就是幂等操作。
			}
			return key
		},

		getJson<T>(key: string, fallback: T): T {
			const raw = this.get(key)
			if (!raw) return fallback
			try {
				return JSON.parse(raw) as T
			} catch {
				this.remove(key)
				return fallback
			}
		},

		setJson<T>(key: string, value: T): T {
			this.set(key, JSON.stringify(value))
			return value
		},
	}
}

export const localStorageCache = createWebStorage('local')
export const sessionStorageCache = createWebStorage('session')

/**
 * 将历史 preference cookie 单向迁移到 localStorage，并清理旧 cookie。
 */
export function readLocalPreference(key: string, fallback = '', legacyCookieKey = key): string {
	const legacy = cookieStorage.get(legacyCookieKey)
	if (legacy) {
		localStorageCache.set(key, legacy)
		cookieStorage.remove(legacyCookieKey)
		return legacy
	}

	const stored = localStorageCache.get(key)
	if (stored) return stored
	return fallback
}

export function writeLocalPreference(key: string, value: string, legacyCookieKey = key): string {
	localStorageCache.set(key, value)
	cookieStorage.remove(legacyCookieKey)
	return value
}

export function toStoredNumber(value: string, fallback = 0): number {
	const parsed = Number(value)
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}
