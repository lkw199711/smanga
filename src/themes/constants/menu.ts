/**
 * 主题共享菜单配置（theme-a / theme-b / theme-d 共用）
 *
 * 说明：
 *  - path: 路由路径，作为唯一标识
 *  - icon: 图标（emoji 或字符）
 *  - label: 菜单标题
 *  - title: 页面标题（用于 mobile header），可选，默认为 label
 *  - exact: 是否严格匹配 active（用于 router-link 的 exact-active-class）
 *  - routeName: 对应路由 name，用于反查 pageTitle
 */
export interface MenuItem {
	path: string
	icon: string
	label: string
	title?: string
	exact?: boolean
	routeName?: string
}

/** 普通导航菜单（首页、书签、收藏、搜索等） */
export const navMenu: MenuItem[] = [
	{ path: '/t', icon: '🏠', label: '首页', exact: true, routeName: 't-home' },
	{ path: '/t/history', icon: '🕘', label: '最近阅读', routeName: 't-history' },
	{ path: '/t/bookmark', icon: '🔖', label: '书签', routeName: 't-bookmark' },
	{ path: '/t/collect', icon: '⭐', label: '收藏', routeName: 't-collect' },
	{ path: '/t/search', icon: '🔍', label: '搜索', routeName: 't-search' },
	{ path: '/t/tags', icon: '🏷️', label: '标签', routeName: 't-tag-list' },
	{ path: '/t/media', icon: '📁', label: '媒体库', routeName: 't-media-list' },
	{ path: '/t/manga-browser', icon: '🗂️', label: '目录浏览', routeName: 't-manga-browser' },
	{ path: '/t/setting/user', icon: '🔧', label: '设置', routeName: 't-user-setting' },
	{ path: '/t/wiki', icon: '📖', label: '帮助文档', routeName: 't-wiki' },
]

/** 管理员菜单 */
export const adminNavMenu: MenuItem[] = [
	{ path: '/t/manage/users', icon: '👤', label: '用户管理', routeName: 't-manage-users' },
	{ path: '/t/manage/media', icon: '📁', label: '媒体库管理', routeName: 't-manage-media' },
	{ path: '/t/manage/manga', icon: '📚', label: '漫画管理', routeName: 't-manage-manga' },
	{ path: '/t/manage/chapters', icon: '📑', label: '章节管理', routeName: 't-manage-chapters' },
	{ path: '/t/manage/paths', icon: '📂', label: '路径管理', routeName: 't-manage-paths' },
	{ path: '/t/manage/bookmarks', icon: '🔖', label: '书签管理', routeName: 't-manage-bookmarks' },
	{ path: '/t/manage/tags', icon: '🏷️', label: '标签管理', routeName: 't-manage-tags' },
	{ path: '/t/manage/compress', icon: '🗜️', label: '解压管理', routeName: 't-manage-compress' },
	{ path: '/t/manage/jobs', icon: '📋', label: '任务管理', routeName: 't-manage-jobs' },
	{ path: '/t/manage/sync', icon: '🔄', label: '漫画同步', routeName: 't-manage-sync' },
	{ path: '/t/manage/share', icon: '📤', label: '漫画分享', routeName: 't-manage-share' },
	{ path: '/t/manage/p2p', icon: '🌐', label: 'P2P管理', routeName: 't-manage-p2p' },
	{ path: '/t/manage/server', icon: '🖥️', label: '服务器设置', routeName: 't-manage-server' },
]

/**
 * 移动端底部导航栏顺序（三主题统一）
 * 顺序：首页 → 媒体 → 历史 → 书签 → 收藏 → 搜索
 */
export const bottomNavPaths: string[] = [
	'/t',
	'/t/media',
	'/t/history',
	'/t/bookmark',
	'/t/collect',
	'/t/search',
]

/** 底部栏菜单：从 navMenu 中筛选 + 自定义 label 覆盖 */
const bottomLabelOverride: Record<string, string> = {
	'/t/media': '媒体',
	'/t/history': '历史',
}

export const bottomNavMenu: MenuItem[] = bottomNavPaths
	.map((p) => navMenu.find((n) => n.path === p))
	.filter((v): v is MenuItem => !!v)
	.map((v) => ({ ...v, label: bottomLabelOverride[v.path] || v.label }))

/** 额外的 pageTitle 映射（不在导航菜单中的路由） */
const extraPageTitles: Record<string, string> = {
	't-manga-list': '漫画列表',
	't-manga-info': '漫画详情',
	't-chapter-list': '章节列表',
	't-serve-setting': '服务器设置',
}

/** 根据路由 name 获取页面标题 */
export function getPageTitle(routeName: string | undefined): string {
	if (!routeName) return 'smanga'
	const all = [...navMenu, ...adminNavMenu]
	const item = all.find((m) => m.routeName === routeName)
	if (item) return item.title || item.label
	return extraPageTitles[routeName] || 'smanga'
}
