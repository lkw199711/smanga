import { defineStore } from 'pinia'
import pinia from '@/store/pinia'
import { userInfo } from '@/store'
import { Cookies } from '@/utils'
import {
	COOKIE_KEYS,
	STORAGE_KEYS,
	getServerKey,
	localStorageCache,
	readScopedCookie,
	removeScopedCookie,
	removeServerKey,
	setServerKey,
	writeScopedCookie,
} from '@/utils/persistence'

export interface SessionProfile {
	userId: number
	userName: string
	header: string
	avatarPath: string
}

export interface LoginSessionPayload {
	userId?: number | string
	userName?: string
	header?: string
	avatarPath?: string
	serverKey?: string
	token?: string
	userRole?: string
}

function profileStorageKey(serverKey: string) {
	return serverKey ? `${STORAGE_KEYS.sessionProfile}.${serverKey}` : STORAGE_KEYS.sessionProfile
}

function readProfile(serverKey = getServerKey()): SessionProfile {
	const scopedKey = profileStorageKey(serverKey)
	let stored = localStorageCache.getJson<Partial<SessionProfile>>(scopedKey, {})

	// 兼容本次重构早期的未分服务 profile key。
	if (serverKey && Object.keys(stored).length === 0) {
		stored = localStorageCache.getJson<Partial<SessionProfile>>(STORAGE_KEYS.sessionProfile, {})
		if (Object.keys(stored).length > 0) {
			localStorageCache.setJson(scopedKey, stored)
			localStorageCache.remove(STORAGE_KEYS.sessionProfile)
		}
	}

	return {
		userId: Number(stored.userId ?? readScopedCookie(COOKIE_KEYS.userId, serverKey)) || 0,
		userName: String(stored.userName ?? readScopedCookie(COOKIE_KEYS.userName, serverKey) ?? ''),
		header: String(stored.header ?? readScopedCookie(COOKIE_KEYS.header, serverKey) ?? ''),
		avatarPath: String(stored.avatarPath ?? readScopedCookie(COOKIE_KEYS.avatarPath, serverKey) ?? ''),
	}
}

function syncLegacyUserInfo(profile: SessionProfile) {
	Object.assign(userInfo, profile)
}

const initialProfile = readProfile()

export const useSessionStore = defineStore('session', {
	state: () => ({
		...initialProfile,
		serverKey: getServerKey(),
		role: Cookies.getRole(),
		tokenValue: Cookies.getToken(),
	}),

	getters: {
		token: (state) => state.tokenValue,
		isAuthenticated(): boolean {
			return Boolean(this.token)
		},
		isAdmin(): boolean {
			return this.role === 'admin'
		},
		profile(state): SessionProfile {
			return {
				userId: state.userId,
				userName: state.userName,
				header: state.header,
				avatarPath: state.avatarPath,
			}
		},
	},

	actions: {
		hydrate() {
			const serverKey = getServerKey()
			const profile = readProfile(serverKey)
			this.$patch({
				...profile,
				serverKey,
				role: Cookies.getRole(),
				tokenValue: Cookies.getToken(),
			})
			syncLegacyUserInfo(profile)
		},

		start(payload: LoginSessionPayload) {
			const serverKey = String(payload.serverKey || this.serverKey || '')
			if (serverKey) setServerKey(serverKey)

			const profile: SessionProfile = {
				userId: Number(payload.userId) || 0,
				userName: String(payload.userName || ''),
				header: String(payload.header || ''),
				avatarPath: String(payload.avatarPath || ''),
			}

			// 兼容旧主题；新版主题只从 session store 读取这些资料。
			writeScopedCookie(COOKIE_KEYS.userId, String(profile.userId || ''), serverKey)
			writeScopedCookie(COOKIE_KEYS.userName, profile.userName, serverKey)
			writeScopedCookie(COOKIE_KEYS.header, profile.header, serverKey)
			writeScopedCookie(COOKIE_KEYS.avatarPath, profile.avatarPath, serverKey)
			if (payload.token) Cookies.setToken(payload.token)
			if (payload.userRole) Cookies.setRole(payload.userRole)

			localStorageCache.setJson(profileStorageKey(serverKey), profile)
			this.$patch({
				...profile,
				serverKey,
				role: String(payload.userRole || Cookies.getRole() || ''),
				tokenValue: String(payload.token || Cookies.getToken() || ''),
			})
			syncLegacyUserInfo(profile)
		},

		updateProfile(patch: Partial<SessionProfile>) {
			const profile = { ...this.profile, ...patch }
			this.$patch(profile)
			localStorageCache.setJson(profileStorageKey(this.serverKey), profile)

			if (patch.userId !== undefined) writeScopedCookie(COOKIE_KEYS.userId, String(profile.userId || ''), this.serverKey)
			if (patch.userName !== undefined) writeScopedCookie(COOKIE_KEYS.userName, profile.userName, this.serverKey)
			if (patch.header !== undefined) writeScopedCookie(COOKIE_KEYS.header, profile.header, this.serverKey)
			if (patch.avatarPath !== undefined) writeScopedCookie(COOKIE_KEYS.avatarPath, profile.avatarPath, this.serverKey)
			syncLegacyUserInfo(profile)
		},

		logout() {
			// token/role 名称依赖 serverKey，必须先删它们，再删 serverKey。
			Cookies.removeToken()
			Cookies.removeRole()
			for (const key of [
				COOKIE_KEYS.userId,
				COOKIE_KEYS.userName,
				COOKIE_KEYS.header,
				COOKIE_KEYS.avatarPath,
				COOKIE_KEYS.editUser,
				COOKIE_KEYS.editMedia,
			]) {
				// 同时清理带前缀与旧版无前缀两种 cookie。
				removeScopedCookie(key, this.serverKey)
			}
			for (const key of ['smanga-userId', 'smanga-userName', 'token']) {
				Cookies.remove(key)
			}
			removeServerKey()
			localStorageCache.remove(profileStorageKey(this.serverKey))
			localStorageCache.remove(STORAGE_KEYS.sessionProfile)

			const empty: SessionProfile = { userId: 0, userName: '', header: '', avatarPath: '' }
			this.$patch({ ...empty, serverKey: '', role: '', tokenValue: '' })
			syncLegacyUserInfo(empty)
		},
	},
})

export const sessionStore = useSessionStore(pinia)
