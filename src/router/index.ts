import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import Layout from '@/layout/index.vue';
import browse from '@/layout/browse.vue';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
NProgress.configure({
	easing: 'ease', // 动画方式
	speed: 500, // 递增进度条的速度
	showSpinner: false, // 是否显示加载ico
	trickleSpeed: 200, // 自动递增间隔
	minimum: 0.3, // 初始化时的最小百分比,
});

// 打开进度条
export const start = () => {
	NProgress.start();
};

// 关闭进度条
export const close = () => {
	NProgress.done();
};

const routes: Array<RouteRecordRaw> = [
	// 系统界面
	{
		path: '/',
		name: 'home',
		redirect: '/index',
		meta: {sidebar: false},
		component: Layout,
	},
	{
		path: '/login',
		name: 'login',
		meta: {sidebar: false},
		component: () => import('../views/login/index.vue'),
	},

	{
		path: '/index',
		meta: {
			name: 'index',
			title: 'index',
			view: 'list',
		},
		redirect: '/index/index',
		component: Layout,
		children: [
			{
				path: '/index/index',
				name: 'index',
				meta: {
					sidebar: false,
					title: 'index',
					icon: 'index',
					view: 'list',
				},
				component: () => import('../views/index/index.vue'),
			},
		],
	},

	// 媒体库界面
	{
		path: '/media',
		redirect: '/media-list',
		meta: {
			submenu: true,
			sidebar: true,
			title: 'media',
			icon: 'media',
			view: 'list',
		},
		component: Layout,
		children: [
			// 媒体库列表
			{
				path: '/media-list',
				name: 'media-list',
				meta: {
					sidebar: true,
					title: 'mediaList',
					icon: 'media-list',
					view: 'list',
				},
				component: () => import('../views/media-list/index.vue'),
			},
			// 漫画列表
			{
				path: '/manga-list',
				name: 'manga-list',
				meta: {sidebar: false, view: 'list'},
				component: () => import('../views/manga-list/index.vue'),
			},
			// 章节列表
			{
				path: '/chapter-list',
				name: 'chapter-list',
				meta: {sidebar: false, view: 'list'},
				component: () => import('../views/chapter-list/index.vue'),
			},
			// 历史记录
			{
				path: '/history',
				name: 'history',
				meta: {sidebar: true, title: 'history', icon: 'time2', view: 'list'},
				component: () => import('../views/history/index.vue'),
			},
			// 书签列表
			{
				path: '/bookmark',
				name: 'bookmark',
				meta: {
					sidebar: true,
					title: 'bookmark',
					icon: 'bookmark',
					view: 'list',
				},
				component: () => import('../views/bookmark/index.vue'),
			},
			// 收藏列表
			{
				path: '/collect',
				name: 'collect',
				meta: {sidebar: true, title: 'collect', icon: 'star', view: 'list'},
				component: () => import('../views/collect/index.vue'),
			},
			// 标签列表
			{
				path: '/tag-list',
				name: 'tag-list',
				meta: {sidebar: true, title: 'tagList', icon: 'tag', view: 'list'},
				component: () => import('../views/tag-list/index.vue'),
			},
			// 搜索界面
			{
				path: '/search',
				name: 'search',
				meta: {sidebar: true, title: 'search', icon: 'search', view: 'search'},
				component: () => import('../views/search/index.vue'),
			},
			// 漫画信息
			{
				path: '/manga-info',
				name: 'manga-info',
				meta: {sidebar: false, title: 'manga-info', view: 'list'},
				component: () => import('../views/manga-info/index.vue'),
			},
		],
	},

	// 管理界面
	{
		path: '/manage',
		redirect: '/account',
		meta: {
			submenu: true,
			sidebar: true,
			title: 'manage',
			icon: 'manage',
			view: 'setting',
		},
		component: Layout,
		children: [
			// 用户设置
			{
				path: '/account',
				name: 'account',
				meta: {
					sidebar: true,
					title: 'account',
					icon: 'person',
					view: 'setting',
				},
				component: () => import('../views/account/index.vue'),
			},
			// 媒体库设置
			{
				path: '/media-setting',
				name: 'media-setting',
				meta: {
					sidebar: true,
					title: 'mediaManage',
					icon: 'media-manage',
					view: 'setting',
				},
				component: () => import('../views/media-setting/index.vue'),
			},
			// 漫画设置
			{
				path: '/manga-setting',
				name: 'manga-setting',
				meta: {
					sidebar: true,
					title: 'mangaManage',
					icon: 'manga-manage',
					view: 'setting',
				},
				component: () => import('../views/manga-setting/index.vue'),
			},
			// 路径管理
			{
				path: '/path-setting',
				name: 'path-setting',
				meta: {
					sidebar: true,
					title: 'pathManage',
					icon: 'folder',
					view: 'setting',
				},
				component: () => import('../views/path-setting/index.vue'),
			},
			// 章节管理
			{
				path: '/chapter-setting',
				name: 'chapter-setting',
				meta: {
					sidebar: true,
					title: 'chapterManage',
					icon: 'chapter-manage',
					view: 'setting',
				},
				component: () => import('../views/chapter-setting/index.vue'),
			},
			// 书签管理
			{
				path: '/bookmark-setting',
				name: 'bookmark-setting',
				meta: {
					sidebar: true,
					title: 'bookmarkManage',
					icon: 'bookmark',
					view: 'setting',
				},
				component: () => import('../views/bookmark-setting/index.vue'),
			},
			// 标签管理
			{
				path: '/tag-setting',
				name: 'tag-setting',
				meta: {
					sidebar: true,
					title: 'tagManage',
					icon: 'tag',
					view: 'setting',
				},
				component: () => import('../views/tag-setting/index.vue'),
			},
			// 解压管理
			{
				path: '/compress-setting',
				name: 'compress-setting',
				meta: {
					sidebar: true,
					title: 'compressManage',
					icon: 'comporess',
					view: 'setting',
				},
				component: () => import('../views/compress-setting/index.vue'),
			},
		],
	},

	// 用户与服务器设置
	{
		path: '/setting',
		redirect: '/user-setting',
		meta: {
			submenu: true,
			sidebar: true,
			title: 'setting',
			icon: 'setting',
			view: 'default',
		},
		component: Layout,
		children: [
			// 用户设置
			{
				path: '/user-setting',
				name: 'user-setting',
				meta: {
					sidebar: true,
					title: 'userSetting',
					icon: 'person9',
					view: 'default',
				},
				component: () => import('../views/user-setting/index.vue'),
			},
			// 服务器设置
			{
				path: '/serve-setting',
				name: 'serve-setting',
				meta: {
					sidebar: true,
					title: 'serveSetting',
					icon: 'shezhi',
					view: 'default',
				},
				component: () => import('../views/serve-setting/index.vue'),
			},
			{
				path: '/log',
				name: 'log',
				meta: {
					sidebar: true,
					title: 'log',
					icon: 'log',
					view: 'searchOnly',
				},
				component: () => import('../views/log/index.vue'),
			},
			// wiki
			{
				path: '/wiki',
				name: 'wiki',
				component: () => import('../views/wiki/index.vue'),
				meta: {sidebar: true, title: 'wiki', icon: 'wiki'},
			},
		],
	},

	{
		path: '/init',
		name: 'init',
		meta: {sidebar: false, title: 'userSetting'},
		component: () => import('../views/init/index.vue'),
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

router.beforeEach((pre, next) => {
	start();
});

router.afterEach(() => {
	close();
});

export default router;
