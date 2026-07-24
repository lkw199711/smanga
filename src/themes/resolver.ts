import { defineAsyncComponent, type Component } from 'vue'
import type { ThemeKey } from './store'
import { config } from '@/store'

// Layout components
const layouts: Record<ThemeKey, () => Promise<Component>> = {
  A: () => import('./theme-a/layout/index.vue'),
  B: () => import('./theme-b/layout/index.vue'),
  D: () => import('./theme-d/layout/index.vue'),
  Legacy: () => import('./theme-a/layout/index.vue'), // Legacy 走路由守卫重定向，此处仅做回退
}

// Mobile Layout components
const mobileLayouts: Record<ThemeKey, () => Promise<Component>> = {
  A: () => import('./theme-a/layout/mobile.vue'),
  B: () => import('./theme-b/layout/mobile.vue'),
  D: () => import('./theme-d/layout/mobile.vue'),
  Legacy: () => import('./theme-a/layout/mobile.vue'),
}

// Reader layout components
const readerLayouts: Record<ThemeKey, () => Promise<Component>> = {
  A: () => import('./theme-a/reader/layout.vue'),
  B: () => import('./theme-b/reader/layout.vue'),
  D: () => import('./theme-d/reader/layout.vue'),
  Legacy: () => import('./theme-a/reader/layout.vue'),
}

// 设置页属于跨主题的账�?服务配置能力，A、B 共用同一份实现，
// 避免主题切换后出现字段、头像上传等功能不一致�?
const sharedSettingsPages = {
  'user-setting': () => import('./pages/user-setting.vue'),
  'serve-setting': () => import('./pages/serve-setting.vue'),
}

// Page component map
const pages: Record<ThemeKey, Record<string, () => Promise<Component>>> = {
  A: {
    home: () => import('./theme-a/pages/home.vue'),
    'media-list': () => import('./theme-a/pages/media-list.vue'),
    'manga-list': () => import('./theme-a/pages/manga-list.vue'),
    media: () => import('./theme-a/pages/media.vue'),
    'chapter-list': () => import('./theme-a/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-a/pages/manga-info.vue'),
    history: () => import('./theme-a/pages/history.vue'),
    bookmark: () => import('./theme-a/pages/bookmark.vue'),
    collect: () => import('./theme-a/pages/collect.vue'),
    search: () => import('./theme-a/pages/search.vue'),
    'tag-list': () => import('./pages/tag-list.vue'),
    ...sharedSettingsPages,
    manage: () => import('./theme-a/pages/manage.vue'),
    'manage-users': () => import('./theme-a/pages/manage/users.vue'),
    'manage-media': () => import('./theme-a/pages/manage/media.vue'),
    'manage-manga': () => import('./theme-a/pages/manage/manga.vue'),
    'manage-chapters': () => import('./theme-a/pages/manage/chapters.vue'),
    'manage-paths': () => import('./theme-a/pages/manage/paths.vue'),
    'manage-bookmarks': () => import('./theme-a/pages/manage/bookmarks.vue'),
    'manage-tags': () => import('./theme-a/pages/manage/tags.vue'),
    'manage-compress': () => import('./theme-a/pages/manage/compress.vue'),
    'manage-jobs': () => import('./theme-a/pages/manage/jobs.vue'),
    'manage-sync': () => import('./theme-a/pages/manage/sync.vue'),
    'manage-share': () => import('./theme-a/pages/manage/share.vue'),
    'manage-p2p': () => import('./theme-a/pages/manage/p2p.vue'),
    'manage-server': () => import('./theme-a/pages/manage/server.vue'),
    'manage-wiki': () => import('./theme-a/pages/manage/wiki.vue'),
    login: () => import('./theme-a/pages/login.vue'),
  },
  B: {
    home: () => import('./theme-b/pages/home.vue'),
    'media-list': () => import('./theme-b/pages/media-list.vue'),
    'manga-list': () => import('./theme-b/pages/manga-list.vue'),
    media: () => import('./theme-b/pages/media.vue'),
    'chapter-list': () => import('./theme-b/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-b/pages/manga-info.vue'),
    history: () => import('./theme-b/pages/history.vue'),
    bookmark: () => import('./theme-b/pages/bookmark.vue'),
    collect: () => import('./theme-b/pages/collect.vue'),
    search: () => import('./theme-b/pages/search.vue'),
    'tag-list': () => import('./pages/tag-list.vue'),
    ...sharedSettingsPages,
    manage: () => import('./theme-b/pages/manage.vue'),
    'manage-users': () => import('./theme-a/pages/manage/users.vue'),
    'manage-media': () => import('./theme-a/pages/manage/media.vue'),
    'manage-manga': () => import('./theme-a/pages/manage/manga.vue'),
    'manage-chapters': () => import('./theme-a/pages/manage/chapters.vue'),
    'manage-paths': () => import('./theme-a/pages/manage/paths.vue'),
    'manage-bookmarks': () => import('./theme-a/pages/manage/bookmarks.vue'),
    'manage-tags': () => import('./theme-a/pages/manage/tags.vue'),
    'manage-compress': () => import('./theme-a/pages/manage/compress.vue'),
    'manage-jobs': () => import('./theme-a/pages/manage/jobs.vue'),
    'manage-sync': () => import('./theme-a/pages/manage/sync.vue'),
    'manage-share': () => import('./theme-a/pages/manage/share.vue'),
    'manage-p2p': () => import('./theme-a/pages/manage/p2p.vue'),
    'manage-server': () => import('./theme-a/pages/manage/server.vue'),
    'manage-wiki': () => import('./theme-a/pages/manage/wiki.vue'),
    login: () => import('./theme-b/pages/login.vue'),
  },
  D: {
    home: () => import('./theme-d/pages/home.vue'),
    'media-list': () => import('./theme-d/pages/media-list.vue'),
    'manga-list': () => import('./theme-d/pages/manga-list.vue'),
    media: () => import('./theme-d/pages/media.vue'),
    'chapter-list': () => import('./theme-d/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-d/pages/manga-info.vue'),
    history: () => import('./theme-d/pages/history.vue'),
    bookmark: () => import('./theme-d/pages/bookmark.vue'),
    collect: () => import('./theme-d/pages/collect.vue'),
    search: () => import('./theme-d/pages/search.vue'),
    'tag-list': () => import('./pages/tag-list.vue'),
    ...sharedSettingsPages,
    manage: () => import('./theme-d/pages/manage.vue'),
    'manage-users': () => import('./theme-a/pages/manage/users.vue'),
    'manage-media': () => import('./theme-a/pages/manage/media.vue'),
    'manage-manga': () => import('./theme-a/pages/manage/manga.vue'),
    'manage-chapters': () => import('./theme-a/pages/manage/chapters.vue'),
    'manage-paths': () => import('./theme-a/pages/manage/paths.vue'),
    'manage-bookmarks': () => import('./theme-a/pages/manage/bookmarks.vue'),
    'manage-tags': () => import('./theme-a/pages/manage/tags.vue'),
    'manage-compress': () => import('./theme-a/pages/manage/compress.vue'),
    'manage-jobs': () => import('./theme-a/pages/manage/jobs.vue'),
    'manage-sync': () => import('./theme-a/pages/manage/sync.vue'),
    'manage-share': () => import('./theme-a/pages/manage/share.vue'),
    'manage-p2p': () => import('./theme-a/pages/manage/p2p.vue'),
    'manage-server': () => import('./theme-a/pages/manage/server.vue'),
    'manage-wiki': () => import('./theme-a/pages/manage/wiki.vue'),
    login: () => import('./theme-d/pages/login.vue'),
  },
  Legacy: {
    home: () => import('./theme-a/pages/home.vue'),
    'media-list': () => import('./theme-a/pages/media-list.vue'),
    'manga-list': () => import('./theme-a/pages/manga-list.vue'),
    media: () => import('./theme-a/pages/media.vue'),
    'chapter-list': () => import('./theme-a/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-a/pages/manga-info.vue'),
    history: () => import('./theme-a/pages/history.vue'),
    bookmark: () => import('./theme-a/pages/bookmark.vue'),
    collect: () => import('./theme-a/pages/collect.vue'),
    search: () => import('./theme-a/pages/search.vue'),
    'tag-list': () => import('./pages/tag-list.vue'),
    ...sharedSettingsPages,
    manage: () => import('./theme-a/pages/manage.vue'),
    'manage-users': () => import('./theme-a/pages/manage/users.vue'),
    'manage-media': () => import('./theme-a/pages/manage/media.vue'),
    'manage-manga': () => import('./theme-a/pages/manage/manga.vue'),
    'manage-chapters': () => import('./theme-a/pages/manage/chapters.vue'),
    'manage-paths': () => import('./theme-a/pages/manage/paths.vue'),
    'manage-bookmarks': () => import('./theme-a/pages/manage/bookmarks.vue'),
    'manage-tags': () => import('./theme-a/pages/manage/tags.vue'),
    'manage-compress': () => import('./theme-a/pages/manage/compress.vue'),
    'manage-jobs': () => import('./theme-a/pages/manage/jobs.vue'),
    'manage-sync': () => import('./theme-a/pages/manage/sync.vue'),
    'manage-share': () => import('./theme-a/pages/manage/share.vue'),
    'manage-p2p': () => import('./theme-a/pages/manage/p2p.vue'),
    'manage-server': () => import('./theme-a/pages/manage/server.vue'),
    'manage-wiki': () => import('./theme-a/pages/manage/wiki.vue'),
    login: () => import('./theme-a/pages/login.vue'),
  },
}

// Reader mode components
const readers: Record<ThemeKey, Record<string, () => Promise<Component>>> = {
  A: {
    single: () => import('./theme-a/reader/single.vue'),
    flow: () => import('./theme-a/reader/flow.vue'),
    double: () => import('./theme-a/reader/double.vue'),
  },
  B: {
    single: () => import('./theme-b/reader/single.vue'),
    flow: () => import('./theme-b/reader/flow.vue'),
    double: () => import('./theme-b/reader/double.vue'),
  },
  D: {
    single: () => import('./theme-d/reader/single.vue'),
    flow: () => import('./theme-d/reader/flow.vue'),
    double: () => import('./theme-d/reader/double.vue'),
  },
  Legacy: {
    single: () => import('./theme-a/reader/single.vue'),
    flow: () => import('./theme-a/reader/flow.vue'),
    double: () => import('./theme-a/reader/double.vue'),
  },
}

export function resolveLayout(theme: ThemeKey): Component {
  // 根据移动端标识选择对应�?layout
  const loader = config.isMobile ? mobileLayouts[theme] : layouts[theme]
  return defineAsyncComponent(loader)
}

export function resolveReaderLayout(theme: ThemeKey): Component {
  return defineAsyncComponent(readerLayouts[theme])
}

export function resolvePage(theme: ThemeKey, page: string): Component {
  const loader = pages[theme]?.[page]
  if (!loader) {
    console.warn(`[Theme] Page "${page}" not found for theme "${theme}"`)
    return defineAsyncComponent(pages['A']['home'])
  }
  return defineAsyncComponent(loader)
}

export function resolveReader(theme: ThemeKey, mode: string): Component {
  const loader = readers[theme]?.[mode]
  if (!loader) {
    return defineAsyncComponent(readers[theme]['single'] || readers['A']['single'])
  }
  return defineAsyncComponent(loader)
}
