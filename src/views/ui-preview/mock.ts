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

// ========== 阅读器场景 mock ==========
export const readerMock = {
	mangaName: '葬送的芙莉莲',
	chapterName: '第 128 话 · 魔法的才能',
	currentPage: 5,
	totalPages: 24,
	pages: Array.from({ length: 12 }, (_, i) => ({
		id: i + 1,
		gradient: palette[i % palette.length],
	})),
	chapters: [
		{ id: 1, name: '第 125 话', read: true },
		{ id: 2, name: '第 126 话', read: true },
		{ id: 3, name: '第 127 话', read: true },
		{ id: 4, name: '第 128 话', read: false, current: true },
		{ id: 5, name: '第 129 话', read: false },
		{ id: 6, name: '第 130 话', read: false },
		{ id: 7, name: '第 131 话', read: false },
		{ id: 8, name: '第 132 话', read: false },
	],
};

// ========== 管理场景 mock ==========
export const manageMock = {
	tableData: [
		{ mangaId: 1, mediaId: 1, mangaName: '进击的巨人', createTime: '2024-01-15 08:30', updateTime: '2024-12-01 14:22' },
		{ mangaId: 2, mediaId: 1, mangaName: '咒术回战', createTime: '2024-02-20 10:15', updateTime: '2024-11-28 09:45' },
		{ mangaId: 3, mediaId: 2, mangaName: '葬送的芙莉莲', createTime: '2024-03-10 14:00', updateTime: '2024-12-02 16:30' },
		{ mangaId: 4, mediaId: 1, mangaName: '间谍过家家', createTime: '2024-04-05 11:20', updateTime: '2024-11-30 08:10' },
		{ mangaId: 5, mediaId: 3, mangaName: '蓝锁', createTime: '2024-05-12 09:45', updateTime: '2024-12-01 20:55' },
		{ mangaId: 6, mediaId: 2, mangaName: '药屋少女的呢喃', createTime: '2024-06-18 16:30', updateTime: '2024-11-25 12:40' },
		{ mangaId: 7, mediaId: 3, mangaName: '排球少年', createTime: '2024-07-22 13:10', updateTime: '2024-10-15 07:20' },
		{ mangaId: 8, mediaId: 1, mangaName: '海贼王', createTime: '2024-01-01 00:00', updateTime: '2024-12-03 06:00' },
	],
	totalCount: 1284,
};

// ========== 设置场景 mock ==========
export type SettingItem = {
	label: string;
	type: 'switch' | 'select' | 'input' | 'slider';
	value?: any;
	options?: string[];
	desc?: string;
};

export type SettingGroup = {
	title: string;
	items: SettingItem[];
};

export const settingMock: SettingGroup[] = [
	{
		title: '界面设置',
		items: [
			{ label: '语言设置', type: 'select', value: '中文', options: ['中文', 'English', '日本語'] },
			{ label: '主题设置', type: 'select', value: '蓝色', options: ['蓝色', '粉色', '绿色', '紫色', '暗色'] },
			{ label: '侧边栏媒体库', type: 'switch', value: true },
		],
	},
	{
		title: '列表设置',
		items: [
			{ label: '漫画默认排序', type: 'select', value: '更新时间', options: ['更新时间', '创建时间', '名称', 'ID'] },
			{ label: '章节默认排序', type: 'select', value: '升序', options: ['升序', '降序'] },
			{ label: '开启滑动翻页', type: 'switch', value: true },
			{ label: '封面加载并发', type: 'input', value: '4' },
			{ label: '漫画页面容量', type: 'input', value: '30' },
		],
	},
	{
		title: '阅读设置',
		items: [
			{ label: '翻页按钮反向', type: 'switch', value: false },
			{ label: '显示页码', type: 'switch', value: true },
			{ label: '使用阅读进度条', type: 'switch', value: true },
			{ label: '条漫加载步进', type: 'input', value: '5' },
			{ label: '启用翻页动画', type: 'switch', value: true },
			{ label: '翻页动画类型', type: 'select', value: '淡入淡出', options: ['淡入淡出', '左右滑动', '实体书翻页'] },
			{ label: '动画速度', type: 'slider', value: 300 },
		],
	},
	{
		title: '缓存设置',
		items: [
			{ label: '图片缓存数量限制', type: 'input', value: '100', desc: '设置为0表示无限制' },
		],
	},
];

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
	E: {
		title: '新拟物主义 · Neumorphism',
		palette: [
			['背景', '#E0E5EC'],
			['卡片', '#E0E5EC'],
			['内阴影', 'inset 2px 2px 5px #BABECC'],
			['外阴影', '5px 5px 10px #BABECC'],
			['高光', '-5px -5px 10px #FFFFFF'],
			['主文本', '#2D3748'],
		],
		spec: ['圆角 12px', '内外阴影营造立体感', '柔和渐变', '现代科技感'],
	},
	F: {
		title: '极简日式 · Japanese Minimal',
		palette: [
			['背景', '#FAF9F7'],
			['卡片', '#FFFFFF'],
			['边框', '#E5E3E0'],
			['主文本', '#2D2D2D'],
			['次级文本', '#8B8680'],
			['强调色', '#D64541'],
		],
		spec: ['圆角 2px', '直角设计', '细腻分隔线', 'Noto Sans JP 字体'],
	},
	G: {
		title: '赛博朋克 · Cyberpunk',
		palette: [
			['背景', '#0F0F23'],
			['面板', '#1A1A2E'],
			['卡片', '#16213E'],
			['边框', '#E94560'],
			['主文本', '#E94560'],
			['次级文本', '#0F3460'],
		],
		spec: ['圆角 2px', '霓虹色彩对比', '等宽字体', '科技感十足'],
	},
};