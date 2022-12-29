import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import Layout from '@/layout/index.vue';
import browse from "@/layout/browse.vue";

const routes: Array<RouteRecordRaw> = [
    // 系统界面
    {
        path: '/',
        name: 'Home',
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
        meta: {sidebar: false},
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
        meta: {sidebar: true, title: '历史记录', icon: 'Tickets'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'history',
                component: () => import('../views/history/index.vue')
            }
        ],
    },

    // 设置界面
    {
        path: '/account',
        redirect: '/account/index',
        meta: {sidebar: true, title: '账户设置', icon: 'Stamp'},
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
        meta: {sidebar: true, title: '媒体库设置', icon: 'Reading'},
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
        meta: {sidebar: true, title: '漫画设置', icon: 'Notebook'},
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
        meta: {sidebar: true, title: '路径设置', icon: 'FolderOpened'},
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
        meta: {sidebar: true, title: '章节设置', icon: 'Tickets'},
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'chapter-setting',
                component: () => import('../views/chapter-setting/index.vue')
            }
        ]
    },

    // 浏览界面
    {
        path: '/browse-view',
        redirect: '/browse-view/index',
        component: browse,
        meta: {sidebar: false},
        children: [
            {
                path: 'index',
                name: 'browse-view',
                component: () => import('../views/browse-view/index.vue'),
            },
            {
                path: 'single-page',
                name: 'single-page',
                component: () => import('../views/browse-view/single-page.vue'),
            },
            {
                path: 'double-page',
                name: 'double-page',
                component: () => import('../views/browse-view/double-page.vue'),
            }
        ]
    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
