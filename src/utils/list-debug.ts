const DEBUG_PREFIX = '[ThemeListDebug]'

export function listDebug(event: string, details: Record<string, unknown> = {}) {
	if (!import.meta.env.DEV) return
	try {
		console.info(`${DEBUG_PREFIX} ${event} ${JSON.stringify(details)}`)
	} catch {
		console.info(`${DEBUG_PREFIX} ${event}`, details)
	}
}
