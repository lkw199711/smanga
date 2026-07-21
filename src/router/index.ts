import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import browse from '@/layout/browse.vue';
import useBrowseStore from '@/store/browse';
import ThemeLayout from '@/themes/layout-wrapper.vue';
import ThemeBridge from '@/themes/bridge.vue';
import LegacyReaderBridge from '@/themes/legacy-reader-bridge.vue';
import { url } from '@/api/index';

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

// deploy 状态缓存：null=未检查，true=已部署，false=未部署
let deployChecked: boolean | null = null

const routes: Array<RouteRecordRaw> = [
	// 系统界面
	{
		path: '/',
		name: 'home',
		redirect: '/start',
		children: [],
		meta: { sidebar: false },
		component: Layout,
	},
	{
		path: '/login',
		name: 'login',
		meta: { sidebar: false },
		component: () => import('../views/login/index.vue'),
	},

	{
		path: '/start',
		meta: {
			name: 'start',
			title: 'start',
			view: 'list',
		},
		redirect: '/index',
		component: Layout,
		children: [
			{
				path: '/index',
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
			{
				path: '/parent-path-list',
				name: 'parent-path-list',
				meta: { sidebar: false, view: 'list' },
				component: () => import('../views/parent-path-list/index.vue'),
			},
			// 漫画目录浏览（按文件夹层级）
			{
				path: '/manga-browser',
				name: 'manga-browser',
				meta: {
					sidebar: true,
					title: 'mangaBrowser',
					icon: 'folder',
					view: 'list',
				},
				component: () => import('../views/manga-browser/index.vue'),
			},
			// 漫画列表
			{
				path: '/manga-list',
				name: 'manga-list',
				meta: { sidebar: false, view: 'list' },
				component: () => import('../views/manga-list/index.vue'),
			},
			// 章节列表
			{
				path: '/chapter-list',
				name: 'chapter-list',
				meta: { sidebar: false, view: 'list' },
				component: () => import('../views/chapter-list/index.vue'),
			},
			// 历史记录
			{
				path: '/history',
				name: 'history',
				meta: { sidebar: true, title: 'history', icon: 'time2', view: 'list' },
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
				meta: { sidebar: true, title: 'collect', icon: 'star', view: 'list' },
				component: () => import('../views/collect/index.vue'),
			},
			// 标签列表
			{
				path: '/tag-list',
				name: 'tag-list',
				meta: { sidebar: true, title: 'tagList', icon: 'tag', view: 'list' },
				component: () => import('../views/tag-list/index.vue'),
			},
			// 搜索界面
			{
				path: '/search',
				name: 'search',
				meta: { sidebar: true, title: 'search', icon: 'search', view: 'search' },
				component: () => import('../views/search/index.vue'),
			},
			// 漫画信息
			{
				path: '/manga-info',
				name: 'manga-info',
				meta: { sidebar: false, title: 'manga-info', view: 'list' },
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
			onlyAdmin: true,
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
				component: () => import('../views/user-manage/index.vue'),
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
				component: () => import('../views/media-manage/index.vue'),
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
				component: () => import('../views/manga-manage/index.vue'),
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
				component: () => import('../views/path-manage/index.vue'),
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
				component: () => import('../views/chapter-manage/index.vue'),
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
				component: () => import('../views/bookmark-manage/index.vue'),
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
				component: () => import('../views/tag-manage/index.vue'),
			},
			// 解压管理
			{
				path: '/compress-setting',
				name: 'compress-setting',
				meta: {
					sidebar: true,
					title: 'compressManage',
					icon: 'compress',
					view: 'setting',
				},
				component: () => import('../views/compress-manage/index.vue'),
			},
			// 任务管理
			{
				path: '/jobs-setting',
				name: 'jobs-setting',
				meta: {
					sidebar: true,
					title: 'jobsManage',
					icon: 'job-manage',
					view: 'setting',
				},
				component: () => import('../views/jobs-manage/index.vue'),
			},
			// 漫画同步
			{
				path: '/manga-sync',
				name: 'manga-sync',
				meta: {
					sidebar: true,
					title: 'mangaSync',
					icon: 'sync',
					view: 'setting',
				},
				component: () => import('../views/manga-sync/index.vue'),
			},
			// 漫画分享
			{
				path: '/manga-share',
				name: 'manga-share',
				meta: {
					sidebar: true,
					title: 'mangaShare',
					icon: 'share',
					view: 'setting',
				},
				component: () => import('../views/manga-share/index.vue'),
			},
		],
	},

	// P2P 共享
	{
		path: '/p2p',
		redirect: '/p2p-group',
		meta: {
			submenu: true,
			sidebar: true,
			onlyAdmin: true,
			title: 'p2p',
			icon: 'share',
			view: 'setting',
		},
		component: Layout,
		children: [
			{
				path: '/p2p-group',
				name: 'p2p-group',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'p2pGroup',
					icon: 'share',
					view: 'setting',
				},
				component: () => import('../views/p2p-group/index.vue'),
			},
			{
				path: '/p2p-share',
				name: 'p2p-share',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'p2pShare',
					icon: 'share',
					view: 'setting',
				},
				component: () => import('../views/p2p-share/index.vue'),
			},
			{
				path: '/p2p-peers',
				name: 'p2p-peers',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'p2pPeers',
					icon: 'media-list',
					view: 'setting',
				},
				component: () => import('../views/p2p-peers/index.vue'),
			},
			{
				path: '/p2p-transfer',
				name: 'p2p-transfer',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'p2pTransfer',
					icon: 'sync',
					view: 'setting',
				},
				component: () => import('../views/p2p-transfer/index.vue'),
			},
			{
				path: '/tracker-group',
				name: 'tracker-group',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'trackerGroup',
					icon: 'job-manage',
					view: 'setting',
				},
				component: () => import('../views/tracker-group/index.vue'),
			},
			{
				path: '/tracker-node',
				name: 'tracker-node',
				meta: {
					sidebar: true,
					onlyAdmin: true,
					title: 'trackerNode',
					icon: 'person',
					view: 'setting',
				},
				component: () => import('../views/tracker-node/index.vue'),
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
					onlyAdmin: true,
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
					onlyAdmin: true,
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
				meta: { sidebar: true, title: 'wiki', icon: 'wiki' },
			},
		],
	},

	{
		path: '/init',
		name: 'init',
		meta: { sidebar: false, title: '初始化' },
		component: () => import('../themes/theme-a/pages/init.vue'),
	},

	// 浏览界面
	{
		path: '/browse-view',
		name: 'browse-view',
		redirect: '/browse-view/flow',
		component: browse,
		meta: { sidebar: false },
		children: [
			{
				path: 'flow',
				name: 'flow',
				meta: { view: 'browse' },
				component: () => import('../views/browse-view/flow.vue'),
			},
			{
				path: 'single',
				name: 'single',
				meta: { view: 'browse' },
				component: () => import('../views/browse-view/single.vue'),
			},
			{
				path: 'double',
				name: 'double',
				meta: { view: 'browse' },
				component: () => import('../views/browse-view/double.vue'),
			},
			{
				path: 'half',
				name: 'half',
				meta: { view: 'browse' },
				component: () => import('../views/browse-view/half.vue'),
			},
			{
				path: 'pdfView',
				name: 'pdfView',
				meta: { view: 'browse' },
				component: () => import('../views/browse-view/pdf.vue'),
			}
		],
	},

	// 测试界面
	{
		path: '/test',
		name: 'test',
		meta: { sidebar: false },
		component: () => import('../views/test/index.vue'),
	},

	// UI 风格预览（独立页面，不走 Layout）
	{
		path: '/ui-preview',
		name: 'ui-preview',
		meta: { sidebar: false, title: 'UI Preview' },
		component: () => import('../views/ui-preview/index.vue'),
	},

	// ===== 主题系统路由 =====
	{
		path: '/t',
		component: ThemeLayout,
		meta: { sidebar: false },
		children: [
			{ path: '', name: 't-home', component: ThemeBridge, props: { page: 'home' }, meta: { title: '首页' } },
			{ path: 'media', name: 't-media-list', component: ThemeBridge, props: { page: 'media' }, meta: { title: '媒体库' } },
			{ path: 'media/:mediaId', name: 't-manga-list', component: ThemeBridge, props: { page: 'manga-list' }, meta: { title: '漫画列表' } },
			{ path: 'manga/:mangaId', name: 't-manga-info', component: ThemeBridge, props: { page: 'manga-info' }, meta: { title: '漫画详情' } },
			{ path: 'manga/:mangaId/chapters', name: 't-chapter-list', component: ThemeBridge, props: { page: 'chapter-list' }, meta: { title: '章节列表' } },
			{ path: 'history', name: 't-history', component: ThemeBridge, props: { page: 'history' }, meta: { title: '历史' } },
			{ path: 'bookmark', name: 't-bookmark', component: ThemeBridge, props: { page: 'bookmark' }, meta: { title: '书签' } },
			{ path: 'collect', name: 't-collect', component: ThemeBridge, props: { page: 'collect' }, meta: { title: '收藏' } },
			{ path: 'search', name: 't-search', component: ThemeBridge, props: { page: 'search' }, meta: { title: '搜索' } },
			{ path: 'tags', name: 't-tag-list', component: ThemeBridge, props: { page: 'tag-list' }, meta: { title: '标签' } },
			{ path: 'setting/user', name: 't-user-setting', component: ThemeBridge, props: { page: 'user-setting' }, meta: { title: '用户设置' } },
			{ path: 'setting/serve', name: 't-serve-setting', component: ThemeBridge, props: { page: 'serve-setting' }, meta: { title: '服务器设置' } },
			{ path: 'manage', name: 't-manage', component: ThemeBridge, props: { page: 'manage' }, meta: { title: '管理' } },
		],
	},
	{
		path: '/t/login',
		name: 't-login',
		component: ThemeBridge,
		props: { page: 'login' },
		meta: { sidebar: false, title: '登录' },
	},
	{
		path: '/t/reader/:chapterId',
		name: 't-reader',
		// 主题页面暂时复用成熟的旧阅读器，避免每套皮肤维护一套阅读组件。
		component: LegacyReaderBridge,
		meta: { sidebar: false, title: '阅读' },
	},

	// 404
	{
		path: '/404',
		name: '404',
		meta: { sidebar: false },
		component: () => import('../views/404/index.vue'),
	},
	{
		path: '/:pathMatch(.*)',
		redirect: '/404',
		meta: { sidebar: false },
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to) => {
	start();

	// 首次导航时检查部署状态
	if (deployChecked === null) {
		try {
			const res = await fetch(`${url}/deploy/status`)
			const json = await res.json()
			// 严格校验：只有 code=200 且 data.sql 存在才可信
			// data.sql.deploy 为原始值（0=未部署, 1=已部署）
			if (res.ok && json?.code === 200 && json?.data?.sql) {
				deployChecked = !!json.data.sql.deploy
			} else {
				close()
				return '/404'
			}
		} catch {
			// 网络不可达
			close()
			return '/404'
		}

		// 未部署且不在 init 页 → 跳转
		if (!deployChecked && to.path !== '/init') {
			close()
			return '/init'
		}
	}
});

router.afterEach((to, from) => {
	close();
	const browseStore = useBrowseStore();
	browseStore.route = to;
});

export default router;
