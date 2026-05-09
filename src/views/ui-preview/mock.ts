// 预览用 mock 数据，不接后端

export const mediaList = [
	{ id: 1, name: '少年漫画', icon: '📚', count: 128 },
	{ id: 2, name: '少女漫画', icon: '🌸', count: 64 },
	{ id: 3, name: '青年漫画', icon: '📖', count: 96 },
	{ id: 4, name: '同人本', icon: '🎨', count: 32 },
];

export const sidebarMenu = [
	{ key: 'home', label: '首页', icon: '🏠' },
	{ key: 'history', label: '最近阅读', icon: '🕘' },
	{ key: 'bookmark', label: '书签', icon: '🔖' },
	{ key: 'collect', label: '收藏', icon: '⭐' },
	{ key: 'search', label: '搜索', icon: '🔍' },
	{ key: 'tag', label: '标签', icon: '🏷️' },
	{ key: 'manage', label: '管理', icon: '⚙️' },
	{ key: 'setting', label: '设置', icon: '🔧' },
];

// 封面用纯色占位，避免外网资源
const palette = [
	['#FFB5A7', '#FEC89A'],
	['#A0C4FF', '#BDB2FF'],
	['#B9FBC0', '#A0E8AF'],
	['#FDCB82', '#F7B267'],
	['#C5DEDD', '#F0EFEB'],
	['#FCD5CE', '#F8EDEB'],
	['#CDB4DB', '#FFC8DD'],
	['#BEE1E6', '#FAF3DD'],
	['#F1C0E8', '#CFBAF0'],
	['#90DBF4', '#8EECF5'],
	['#F7AEF8', '#B388EB'],
	['#FF9F1C', '#FFBF69'],
];

export type MangaMock = {
	id: number;
	name: string;
	chapter: string;
	unread: number;
	progress: number; // 0-100
	gradient: [string, string];
	tag?: string;
};

export const continueReading: MangaMock[] = [
	{ id: 1, name: '进击的巨人', chapter: '第 139 话 · 最终话', unread: 0, progress: 87, gradient: palette[0], tag: '完结' },
	{ id: 2, name: '咒术回战', chapter: '第 245 话', unread: 2, progress: 64, gradient: palette[1] },
	{ id: 3, name: '葬送的芙莉莲', chapter: '第 128 话', unread: 5, progress: 32, gradient: palette[2], tag: '更新' },
	{ id: 4, name: '间谍过家家', chapter: '第 95 话', unread: 1, progress: 45, gradient: palette[3] },
	{ id: 5, name: '药屋少女的呢喃', chapter: '第 72 话', unread: 0, progress: 78, gradient: palette[4] },
	{ id: 6, name: '蓝锁', chapter: '第 258 话', unread: 3, progress: 20, gradient: palette[5], tag: '热门' },
];

export const recentAdded: MangaMock[] = [
	{ id: 101, name: '排球少年', chapter: '全 45 卷', unread: 45, progress: 0, gradient: palette[6] },
	{ id: 102, name: '海贼王', chapter: '全 108 卷', unread: 12, progress: 0, gradient: palette[7] },
	{ id: 103, name: '死神', chapter: '全 74 卷', unread: 0, progress: 0, gradient: palette[8] },
	{ id: 104, name: '火影忍者', chapter: '全 72 卷', unread: 0, progress: 0, gradient: palette[9] },
	{ id: 105, name: '鬼灭之刃', chapter: '全 23 卷', unread: 0, progress: 0, gradient: palette[10] },
	{ id: 106, name: '龙珠', chapter: '全 42 卷', unread: 0, progress: 0, gradient: palette[11] },
	{ id: 107, name: '名侦探柯南', chapter: '第 1100 卷', unread: 8, progress: 0, gradient: palette[0], tag: 'New' },
	{ id: 108, name: '哆啦 A 梦', chapter: '全 45 卷', unread: 0, progress: 0, gradient: palette[1] },
	{ id: 109, name: '神之水滴', chapter: '全 44 卷', unread: 2, progress: 0, gradient: palette[2] },
	{ id: 110, name: '银魂', chapter: '全 77 卷', unread: 0, progress: 0, gradient: palette[3] },
	{ id: 111, name: '齐木楠雄的灾难', chapter: '全 26 卷', unread: 0, progress: 0, gradient: palette[4] },
	{ id: 112, name: '全职猎人', chapter: '第 400 话', unread: 1, progress: 0, gradient: palette[5] },
];

export const stats = {
	totalManga: 1284,
	totalChapter: 38562,
	readToday: 47,
	readThisWeek: 312,
};

export const styleSpec = {
	A: {
		title: '现代简约 · Linear / Notion',
		palette: [
			['背景', '#FAFAFA'],
			['卡片', '#FFFFFF'],
			['边框', '#EAEAEA'],
			['主文本', '#171717'],
			['次级文本', '#6B7280'],
			['强调色', '#2563EB'],
		],
		spec: ['圆角 12px', '阴影 0 1px 2px rgba(0,0,0,.04)', '字体 14px', '留白充足'],
	},
	B: {
		title: '漫画 / 二次元 · Bilibili / Pixiv',
		palette: [
			['渐变底', '#FFF5FA → #EEF4FF'],
			['玻璃卡', 'rgba(255,255,255,.72)'],
			['主色', '#FF6FA3'],
			['辅色', '#6C8DFF'],
			['强调', '#FFB020'],
			['主文本', '#1F2937'],
		],
		spec: ['圆角 16px', '胶囊按钮 999', '背景模糊 12px', 'hover 上浮 4px'],
	},
	C: {
		title: '暗色优先 · Plex / GitHub Dark',
		palette: [
			['底', '#0D0F12'],
			['面板', '#161A20'],
			['卡片', '#1E232B'],
			['边框', '#2A313C'],
			['主文本', '#E6E8EB'],
			['强调', '#F5A524'],
		],
		spec: ['圆角 8px', '无阴影 · 靠边框分层', '字体 13px', '长时间阅读友好'],
	},
	D: {
		title: '降饱和多主题 · 保留 9 套皮肤',
		palette: [
			['底 (blue)', '#EFF6FF'],
			['底 (pink)', '#FDF2F8'],
			['底 (green)', '#ECFDF5'],
			['卡片', '#FFFFFF'],
			['强调', '跟随主题'],
			['主文本', '#0F172A'],
		],
		spec: ['圆角 10px', '轻阴影', '保留主题切换', '改动最小'],
	},
};
