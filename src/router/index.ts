import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import Layout from '@/layout/index.vue';
import browse from "@/layout/browse.vue";
import layout from "@/layout/index.vue";

const routes: Array<RouteRecordRaw> = [
    // 系统界面
    {
        path: '/',
        name: 'home',
        redirect: '/media-list/index',
        meta: {sidebar: false},
        component: Layout,
    },
    {
        path: '/login',
        name: 'login',
        meta: {sidebar: false},
        component: () => import('../views/login/index.vue')
    },

    // 媒体库界面
    {
        path: '/media-list',
        redirect: '/media-list/index',
        meta: {sidebar: true, title: '媒体库', icon: 'Reading'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'media-list',
                component: () => import('../views/media-list/index.vue')
            }
        ]
    },
    {
        path: '/manga-list',
        redirect: '/manga-list/index',
        meta: {sidebar: false},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'manga-list',
                component: () => import('../views/manga-list/index.vue')
            }
        ]
    },
    {
        path: '/chapter-list',
        redirect: '/chapter-list/index',
        component: Layout,
        meta: {sidebar: false},
        children: [
            {
                path: 'index',
                name: 'chapter-list',
                component: () => import('../views/chapter-list/index.vue')
            }
        ]
    },
    {
        path: '/history',
        redirect: '/history/index',
        meta: {sidebar: true, title: '历史记录', icon: 'Clock'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'history',
                component: () => import('../views/history/index.vue')
            }
        ],
    },
    {
        path: '/bookmark',
        redirect: '/bookmark/index',
        meta: {sidebar: true, title: '书签', icon: 'Collection'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'bookmark',
                component: () => import('../views/bookmark/index.vue')
            }
        ],
    },

    // 设置界面
    {
        path: '/account',
        redirect: '/account/index',
        meta: {sidebar: true, title: '账户管理', icon: 'Stamp'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'account',
                component: () => import('../views/account/index.vue')
            }
        ]
    },
    {
        path: '/media-setting',
        redirect: '/media-setting/index',
        meta: {sidebar: true, title: '媒体库管理', icon: 'Reading'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'media-setting',
                component: () => import('../views/media-setting/index.vue')
            }
        ]
    },
    {
        path: '/manga-setting',
        redirect: '/manga-setting/index',
        meta: {sidebar: true, title: '漫画管理', icon: 'Notebook'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'manga-setting',
                component: () => import('../views/manga-setting/index.vue')
            }
        ]
    },
    {
        path: '/path-setting',
        redirect: '/path-setting/index',
        meta: {sidebar: true, title: '路径管理', icon: 'FolderOpened'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'path-setting',
                component: () => import('../views/path-setting/index.vue')
            }
        ]
    },
    {
        path: '/chapter-setting',
        redirect: '/chapter-setting/index',
        meta: {sidebar: true, title: '章节管理', icon: 'Tickets'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'chapter-setting',
                component: () => import('../views/chapter-setting/index.vue')
            }
        ]
    },
    {
        path: '/bookmark-setting',
        redirect: '/bookmark-setting/index',
        meta: {sidebar: true, title: '书签管理', icon: 'Collection'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'bookmark-setting',
                component: () => import('../views/bookmark-setting/index.vue')
            }
        ]
    },
    {
        path: '/compress-setting',
        redirect: '/compress-setting/index',
        meta: {sidebar: true, title: '转换管理', icon: 'Switch'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'compress-setting',
                component: () => import('../views/compress-setting/index.vue')
            }
        ]
    },

    // 浏览界面
    {
        path: '/browse-view',
        name: 'browse-view',
        redirect: '/browse-view/index',
        component: browse,
        meta: {sidebar: false},
        children: [
            {
                path: 'index',
                name: 'flow',
                component: () => import('../views/browse-view/flow.vue'),
            },
            {
                path: 'single',
                name: 'single',
                component: () => import('../views/browse-view/single.vue'),
            },
            {
                path: 'double',
                name: 'double',
                component: () => import('../views/browse-view/double.vue'),
            }
        ]
    },

    // wiki
    {
        path: '/wiki',
        redirect: '/wiki/index',
        component: layout,
        meta: {sidebar: true, title: '使用说明', icon: 'DataAnalysis'},
        children: [
            {
                name: 'wiki',
                path: 'index',
                component: () => import('../views/wiki/index.vue')
            }
        ],
    },

    // 测试界面
    {
        path: '/test',
        name: 'test',
        meta: {sidebar: false},
        component: () => import('../views/test/index.vue')
    },

    // 404
    {
        path: '/404',
        name: '404',
        meta: {sidebar: false},
        component: () => import('../views/404/index.vue')
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '/404',
        meta: {sidebar: false},
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
