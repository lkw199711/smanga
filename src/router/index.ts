import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import Layout from '@/layout/index.vue';
import browse from '@/layout/browse.vue';
import layout from '@/layout/index.vue';

const routes: Array<RouteRecordRaw> = [
	// 系统界面
	{
		path: '/',
		name: 'home',
		redirect: '/media-list',
		meta: {sidebar: false},
		component: Layout,
	},
	{
		path: '/login',
		name: 'login',
		meta: {sidebar: false},
		component: () => import('../views/login/index.vue'),
	},

	// 媒体库界面
	{
		path: '/media-list',
		redirect: '/media-list/index',
		meta: {sidebar: true, title: 'mediaList', icon: 'Reading', view: 'list'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'media-list',
				meta: {view: 'list'},
				component: () => import('../views/media-list/index.vue'),
			},
		],
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
				meta: {view: 'list'},
				component: () => import('../views/manga-list/index.vue'),
			},
		],
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
				meta: {view: 'list'},
				component: () => import('../views/chapter-list/index.vue'),
			},
		],
	},
	{
		path: '/history',
		redirect: '/history/index',
		meta: {sidebar: true, title: 'history', icon: 'Clock'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'history',
				meta: {view: 'list'},
				component: () => import('../views/history/index.vue'),
			},
		],
	},
	{
		path: '/bookmark',
		redirect: '/bookmark/index',
		meta: {sidebar: true, title: 'bookmark', icon: 'Collection'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'bookmark',
				meta: {view: 'list'},
				component: () => import('../views/bookmark/index.vue'),
			},
		],
	},
	{
		path: '/collect',
		redirect: '/collect/index',
		meta: {sidebar: true, title: 'collect', icon: 'Star'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'collect',
				meta: {view: 'list'},
				component: () => import('../views/collect/index.vue'),
			},
		],
	},
	{
		path: '/tag-list',
		redirect: '/tag-list/index',
		meta: {sidebar: true, title: 'tagList', icon: 'Ticket'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'tag-list',
				meta: {view: 'list'},
				component: () => import('../views/tag-list/index.vue'),
			},
		],
	},
	{
		path: '/search',
		redirect: '/search/index',
		meta: {sidebar: true, title: 'search', icon: 'Search'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'search',
				meta: {view: 'search'},
				component: () => import('../views/search/index.vue'),
			},
		],
	},

	// 设置界面
	{
		path: '/account',
		redirect: '/account/index',
		meta: {sidebar: true, title: 'account', icon: 'Stamp'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'account',
				meta: {view: 'setting'},
				component: () => import('../views/account/index.vue'),
			},
		],
	},
	{
		path: '/media-setting',
		redirect: '/media-setting/index',
		meta: {sidebar: true, title: 'mediaManage', icon: 'Reading'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'media-setting',
				meta: {view: 'setting'},
				component: () => import('../views/media-setting/index.vue'),
			},
		],
	},
	{
		path: '/manga-setting',
		redirect: '/manga-setting/index',
		meta: {sidebar: true, title: 'mangaManage', icon: 'Notebook'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'manga-setting',
				meta: {view: 'setting'},
				component: () => import('../views/manga-setting/index.vue'),
			},
		],
	},
	{
		path: '/path-setting',
		redirect: '/path-setting/index',
		meta: {sidebar: true, title: 'pathManage', icon: 'FolderOpened'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'path-setting',
				meta: {view: 'setting'},
				component: () => import('../views/path-setting/index.vue'),
			},
		],
	},
	{
		path: '/chapter-setting',
		redirect: '/chapter-setting/index',
		meta: {sidebar: true, title: 'chapterManage', icon: 'Tickets'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'chapter-setting',
				meta: {view: 'setting'},
				component: () => import('../views/chapter-setting/index.vue'),
			},
		],
	},
	{
		path: '/bookmark-setting',
		redirect: '/bookmark-setting/index',
		meta: {sidebar: true, title: 'bookmarkManage', icon: 'Collection'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'bookmark-setting',
				meta: {view: 'setting'},
				component: () => import('../views/bookmark-setting/index.vue'),
			},
		],
	},
	{
		path: '/tag-setting',
		redirect: '/tag-setting/index',
		meta: {sidebar: true, title: 'tagManage', icon: 'Ticket'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'tag-setting',
				meta: {view: 'setting'},
				component: () => import('../views/tag-setting/index.vue'),
			},
		],
	},
	{
		path: '/compress-setting',
		redirect: '/compress-setting/index',
		meta: {sidebar: true, title: 'compressManage', icon: 'Switch'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'compress-setting',
				meta: {view: 'setting'},
				component: () => import('../views/compress-setting/index.vue'),
			},
		],
	},
	{
		path: '/user-setting',
		redirect: '/user-setting/index',
		meta: {sidebar: true, title: 'userSetting', icon: 'User'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'user-setting',
				meta: {view: 'default'},
				component: () => import('../views/user-setting/index.vue'),
			},
		],
	},
	{
		path: '/serve-setting',
		redirect: '/serve-setting/index',
		meta: {sidebar: true, title: 'serveSetting', icon: 'Setting'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'serve-setting',
				meta: {view: 'default'},
				component: () => import('../views/serve-setting/index.vue'),
			},
		],
	},
	{
		path: '/init',
		name: 'init',
		meta: {sidebar: false, title: 'userSetting'},
		component: () => import('../views/init/index.vue'),
	},
	{
		path: '/log',
		redirect: '/log/index',
		meta: {sidebar: true, title: 'log', icon: 'Document'},
		component: Layout,
		children: [
			{
				path: 'index',
				name: 'log',
				meta: {view: 'searchOnly'},
				component: () => import('../views/log/index.vue'),
			},
		],
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
				meta: {view: 'browse'},
				component: () => import('../views/browse-view/flow.vue'),
			},
			{
				path: 'single',
				name: 'single',
				meta: {view: 'browse'},
				component: () => import('../views/browse-view/single.vue'),
			},
			{
				path: 'double',
				name: 'double',
				meta: {view: 'browse'},
				component: () => import('../views/browse-view/double.vue'),
			},
			{
				path: 'half',
				name: 'half',
				meta: {view: 'browse'},
				component: () => import('../views/browse-view/half.vue'),
			},
		],
	},

	// wiki
	{
		path: '/wiki',
		redirect: '/wiki/index',
		component: layout,
		meta: {sidebar: true, title: 'wiki', icon: 'DataAnalysis'},
		children: [
			{
				name: 'wiki',
				path: 'index',
				component: () => import('../views/wiki/index.vue'),
			},
		],
	},

	// 测试界面
	{
		path: '/test',
		name: 'test',
		meta: {sidebar: false},
		component: () => import('../views/test/index.vue'),
	},

	// 404
	{
		path: '/404',
		name: '404',
		meta: {sidebar: false},
		component: () => import('../views/404/index.vue'),
	},
	{
		path: '/:pathMatch(.*)',
		redirect: '/404',
		meta: {sidebar: false},
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
