import { reactive } from 'vue';
import { GlobalData } from '@/store/type';
import { cookieStorage } from '@/utils/persistence';
import { screenType } from '@/type/store';

export const globalData: GlobalData = reactive({
	bookmarkList: [],
	chapterList: [],
	imgPathList: [],
	chapterIndex: 0,
	chapterId: 0,
	chapterName: '',
	chapterPath: '',
	chapterType: '',
	chapterCover: '',
	browseType: 'flow',
	mediaId: 0,
	mangaId: 0,
	mangaName: '',
	mangaCover: '',
	page: 0,
	pageImage: '',
	removeFirst: '0',
	direction: '0',
	userConfig: null,
	pageSizeConfig: null,
});

const editUser = cookieStorage.get('editUser');
const editMedia = cookieStorage.get('editMedia');
const cookieUserId = Number(cookieStorage.get('userId')) || 0
const cookieUserName = cookieStorage.get('userName')
const cookieHeader = cookieStorage.get('header')
const cookieAvatarPath = cookieStorage.get('avatarPath')

export const config = reactive({
	sidebarCollapse: false,
	browseTop: true,
	browseFooter: true,
	browseType: 'flow',
	screenType: 'large' as screenType, // mini | small | middle | large | 2k | 4k
	rightSidebar: false,
	// 章节列表抽屉开关 (合并方案: 顶栏 / right-sidebar 里都可唤起)
	chapterList: false,
	// legacy-reader 统一控制面板开关 (章节列表 + 工具栏 一屏合并)
	controlPanel: false,
	android: false,
	isMobile: false, // 移动端环境标识
	viewType: 'block',
	enableOperation: true,
});

export const power = reactive({
	editUser: editUser == '1',
	editMedia: editMedia == '1',
});

export const userInfo = reactive({
	userName: cookieUserName,
	userId: cookieUserId,
	header: cookieHeader,
	avatarPath: cookieAvatarPath,
	editMedia: editMedia == '1',
});

/**
 * 用户设置
 * 用户的操作习惯配置 将保存至数据库
 */
export const userConfig = reactive({
	// 语言
	language: 'zhCn',
	// 主题皮肤
	theme: 'light',
	// 默认排序规则
	order: 'chapterUpdateDesc',
	chapterOrder: 'number',
	// 翻页按钮调转
	pageTurningReverse: false,
	// 阅读操作面板 顶部与底部尺寸
	browseOperationTop: 30,
	browseOperationBottom: 30,
	// 显示页码
	showPageNumber: true,
	// 开启滑动翻页
	enableTouchPageChange: true,
	mangaPageSize: 0,
	chapterPageSize: 0,
	openNewTab: false, // 打开新标签页
	singleMediadirectChapterPage: true, // 单本漫画,由媒体库直接浏览章节页
	// 条漫模式下,自动加载所有图片
	loadAllFlowIamge: false,
	orderChapterByNumber: true, // 按章节数字顺序加载章节图片
	simpleChapterView: false, // 章节列表简洁模式
	userSlider: true, // 章节阅读进度条
	showSidebarMediaList: true, // 显示侧边栏媒体库列表
	// 翻页动画
	enablePageAnimation: true, // 启用翻页动画
	pageAnimationType: 'fade', // 翻页动画类型: fade(淡入淡出), slide(滑动), page(实体书翻页)
	pageAnimationSpeed: 300, // 翻页动画速度(毫秒)
	continueReadButtonShowChapterNumberOnly: false, // 继续阅读按钮仅展示章节序号而非章节全名
	flowLoadStep: 3, // 流览模式下,每次加载图片数量
	loadCoverConcurrency: 3, // 加载封面并发数量
	imageCacheLimit: 0, // 图片缓存数量限制，0表示无限制
});

export const pageSizeConfig = reactive({
	mini: [9, 12, 15, 18, 21],
	small: [15, 18, 32, 38, 44],
	tablet: [15, 18, 32, 38, 44],
	middle: [12, 18, 32, 38, 44],
	large: [8, 16, 32, 40, 48],
	'2k': [27, 36, 45, 54, 63],
	'4k': [32, 40, 48, 54, 62],
});

// 排序方式
export const mangaSortOrder = ['id', 'idDesc', 'name', 'nameDesc', 'createTime', 'createTimeDesc', 'updateTime', 'updateTimeDesc', 'chapterUpdate', 'chapterUpdateDesc'];
export const chapterSortOrder = ['id', 'idDesc', 'name', 'nameDesc', 'number', 'numberDesc', 'createTime', 'createTimeDesc', 'updateTime', 'updateTimeDesc'];


export default {};
