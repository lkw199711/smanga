import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        redirect: 'manga-list',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
        path: '/manga-list',
        name: 'manga-list',
        component: () => import('../views/manga-list/index.vue')
    },
    {
        path: '/chapter-list',
        name: 'chapter-list',
        component: () => import('../views/chapter-list/index.vue')
    },
    {
        path: '/browse-view',
        name: 'browse-view',
        component: () => import('../views/browse-view/index.vue')
    },
    {
        path: '/setting-path',
        name: 'setting-path',
        component: () => import('../views/setting-path/index.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
