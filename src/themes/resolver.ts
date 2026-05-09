import { defineAsyncComponent, type Component } from 'vue'
import type { ThemeKey } from './store'

// Layout components
const layouts: Record<ThemeKey, () => Promise<Component>> = {
  A: () => import('./theme-a/layout/index.vue'),
  B: () => import('./theme-b/layout/index.vue'),
  D: () => import('./theme-d/layout/index.vue'),
}

// Reader layout components
const readerLayouts: Record<ThemeKey, () => Promise<Component>> = {
  A: () => import('./theme-a/reader/layout.vue'),
  B: () => import('./theme-b/reader/layout.vue'),
  D: () => import('./theme-d/reader/layout.vue'),
}

// Page component map
const pages: Record<ThemeKey, Record<string, () => Promise<Component>>> = {
  A: {
    home: () => import('./theme-a/pages/home.vue'),
    'media-list': () => import('./theme-a/pages/media-list.vue'),
    'manga-list': () => import('./theme-a/pages/manga-list.vue'),
    'chapter-list': () => import('./theme-a/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-a/pages/manga-info.vue'),
    history: () => import('./theme-a/pages/history.vue'),
    bookmark: () => import('./theme-a/pages/bookmark.vue'),
    collect: () => import('./theme-a/pages/collect.vue'),
    search: () => import('./theme-a/pages/search.vue'),
    'tag-list': () => import('./theme-a/pages/tag-list.vue'),
    'user-setting': () => import('./theme-a/pages/user-setting.vue'),
    'serve-setting': () => import('./theme-a/pages/serve-setting.vue'),
    manage: () => import('./theme-a/pages/manage.vue'),
    login: () => import('./theme-a/pages/login.vue'),
  },
  B: {
    home: () => import('./theme-b/pages/home.vue'),
    'media-list': () => import('./theme-b/pages/media-list.vue'),
    'manga-list': () => import('./theme-b/pages/manga-list.vue'),
    'chapter-list': () => import('./theme-b/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-b/pages/manga-info.vue'),
    history: () => import('./theme-b/pages/history.vue'),
    bookmark: () => import('./theme-b/pages/bookmark.vue'),
    collect: () => import('./theme-b/pages/collect.vue'),
    search: () => import('./theme-b/pages/search.vue'),
    'tag-list': () => import('./theme-b/pages/tag-list.vue'),
    'user-setting': () => import('./theme-b/pages/user-setting.vue'),
    'serve-setting': () => import('./theme-b/pages/serve-setting.vue'),
    manage: () => import('./theme-b/pages/manage.vue'),
    login: () => import('./theme-b/pages/login.vue'),
  },
  D: {
    home: () => import('./theme-d/pages/home.vue'),
    'media-list': () => import('./theme-d/pages/media-list.vue'),
    'manga-list': () => import('./theme-d/pages/manga-list.vue'),
    'chapter-list': () => import('./theme-d/pages/chapter-list.vue'),
    'manga-info': () => import('./theme-d/pages/manga-info.vue'),
    history: () => import('./theme-d/pages/history.vue'),
    bookmark: () => import('./theme-d/pages/bookmark.vue'),
    collect: () => import('./theme-d/pages/collect.vue'),
    search: () => import('./theme-d/pages/search.vue'),
    'tag-list': () => import('./theme-d/pages/tag-list.vue'),
    'user-setting': () => import('./theme-d/pages/user-setting.vue'),
    'serve-setting': () => import('./theme-d/pages/serve-setting.vue'),
    manage: () => import('./theme-d/pages/manage.vue'),
    login: () => import('./theme-d/pages/login.vue'),
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
}

export function resolveLayout(theme: ThemeKey): Component {
  return defineAsyncComponent(layouts[theme])
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
