/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-23 23:54:44
 * @FilePath: \smanga\src\store\index.ts
 */
import {createStore} from 'vuex';
import {reactive} from 'vue';
import {GlobalData} from '@/store/type';
import {get_cookie} from '../utils/index';
import {screenType} from '@/type/store';

export default createStore({
	state: {
		chapterAwait: true,
		mangaAwait: true,
		previewAwait: true,
		collectAwait: true,
		searchAwait: true,
	} as any,
	mutations: {
		switch_await(state, {bool = true, running = 'chapterAwait'}) {
			state[running] = bool;
		},
	},
	actions: {},
	modules: {},
});

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
	doublePage: 0,
	pageImage: '',
	removeFirst: '0',
	direction: '0',
	loadedImages: 0,
	userConfig: null,
	pageSizeConfig: null,
});

const editUser = get_cookie('editUser');
const editMedia = get_cookie('editMedia');

export const config = reactive({
	sidebarCollapse: false,
	browseTop: true,
	browseFooter: true,
	browseType: 'flow',
	bookmarkShow: false,
	screenType: 'large' as screenType, // mini | small | middle | large | 2k | 4k
	rightSidebar: false,
	android: false,
	viewType: 'block',
});

export const power = reactive({
	editUser: editUser == '1',
	editMedia: editMedia == '1',
});

export const userInfo = reactive({
	userName: '',
	userId: 0,
	editUser: editUser == '1',
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
	theme: 'grey',
	// 默认排序规则
	order: 'name',
	// 翻页按钮调转
	pageTurningReverse: false,
	// 阅读操作面板 顶部与底部尺寸
	browseOperationTop: 30,
	browseOperationBottom: 30,
});

export const cache = reactive({
	bookmarkId: 0,
	chapterKeepAlive: true,
	mangaKeepAlive: true,
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
