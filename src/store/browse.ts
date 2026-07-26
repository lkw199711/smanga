import bookmarkApi from '@/api/bookmark';
import { bookmarkType } from '@/type/bookmark';
import { defineStore } from 'pinia';
import { chapterType } from '@/type/chapter';
import chapterApi from '@/api/chapter';
import historyApi from '@/api/history';
import latestApi from '@/api/latest';
import { screenType } from '@/type/store';
import { config, userConfig } from '@/store';
import { mangaPageSize, chapterPageSize, manageListPageSizes } from '@/store/page-size';
import { ObjectFit } from '@/type/store';
import { mangaType } from '@/type/manga';
import { RouteLocationNormalizedLoaded } from 'vue-router';

function page_cahce() {
	const pageJump = localStorage.getItem('pageJump');
	if (pageJump && (Number(pageJump) > 1)) {
		localStorage.removeItem('pageJump');
		return Number(pageJump);
	}

	return 1;
}

const useBrowseStore = defineStore('browse', {
	state: () => ({
		pulling: false,
		mangaListPage: 1,
		mangaListPageSizeCache: 0,
		chapterListPage: 1,
		chapterListPageSizeCache: 0,
		manageListPage: 1,
		manageListPageSizeCache: 0,
		browseType: 'flow',
		mediaId: -1,
		mangaId: -1,
		chapterId: -1,
		manga: <mangaType>{},
		chapter: <chapterType>{},
		pdfPath: '',
		// 当前页码
		page: page_cahce(),
		// 当前图片路径 用于书签 与 下载图片
		pageImage: '',
		// 获取书签列表
		bookmarkList: <bookmarkType[]>[],
		// 章节列表
		chapterList: <chapterType[]>[],
		// 图片路径列表
		imagePathList: <string[]>[],
		// 图片文件列表
		imageFileList: <string[]>[],
		/**
		 * 用于存储上一个有效的 pageCount
		 * 条漫跳页的过程中 pageCount 的变化到导致闪烁
		 * 如果在跳页的过程中 pageCount 为 0 则使 pageCount 保持上一个有效值
		 */
		lastPageCount: 0,
		useAutoViewWidth: true,
		viewWidthValue: 50,
		dialogViewWidth: false,
		imageLoaded: false,
		// 排序方式
		mangaOrder: 'chapterUpdateDesc',
		chapterOrder: 'number',
		route: <RouteLocationNormalizedLoaded | null>null,
		// 阅读器操作触发计数器(control-panel 与阅读器视图之间的解耦通道)
		// 视图 watch 对应计数器,每次 +1 视图执行本地对应逻辑
		readerActionTick: {
			download: 0,
			jumpPage: 0,
			setImageWidth: 0,
			toggleDirection: 0,
			toggleRemoveFirst: 0,
			changeChapter: 0,
			beforeChapter: 0,
			nextChapter: 0,
		} as Record<string, number>,
		// 阅读器状态镜像(供 control-panel 直接读取显示)
		readerFlags: {
			direction: false, // double 模式的翻页方向
			removeFirst: false, // double 模式是否移除首张
		},
		// 章节切换目标(配合 changeChapter tick 使用)
		pendingChangeChapterId: 0,
	}),
	getters: {
		orderBy: (state) => {
			const mangaOrderBy = userConfig.order;
			const chapterOrderBy = userConfig.chapterOrder;
			const routeName = state.route?.name;

			switch (routeName) {
				case 'manga-info':
				case 't-manga-info':
					return chapterOrderBy;
				case 'chapter-list':
				case 't-chapter-list':
					return chapterOrderBy;
				case 'bookmark':
				case 't-bookmark':
					return chapterOrderBy;
				default:
					return mangaOrderBy;
			};
		},
		/**
		 * @description: 当前章节
		 * @return {*}
		 */
		currentChapter: (state) => {
			return state.chapterList.find((chapter) => chapter.chapterId === state.chapterId);
		},
		/**
		 * 当前章节坐标
		 * @param state 
		 * @returns 
		 */
		currentChapterIndex: (state) => {
			return state.chapterList.findIndex((chapter) => chapter.chapterId === state.chapterId);
		},
		/**
		 * 页码总数
		 * @param state 
		 * @returns 
		 */
		pageCount: (state) => {
			if (state.browseType === 'double') {
				return Math.ceil(state.imagePathList.length / 2);
			}

			if (state.browseType === 'half') {
				return state.imagePathList.length * 2;
			}

			if (state.browseType === 'flow') {
				const length = state.imagePathList.length;
				if (length === 0) {
					return state.lastPageCount;
				} else {
					state.lastPageCount = length;
				}
			}

			return state.imagePathList.length;
		},

		/**
		 * 书签展示状态
		 * @param state 
		 */
		bookmarkShow: (state) => {
			let page = state.page;

			if (state.browseType === 'double') {
				page = page * 2 - 1;
			}

			if (state.browseType === 'half') {
				page = Math.ceil(page / 2);
			}

			// 通过章节与页码判断书签展示
			for (let i = 0; i < state.bookmarkList.length; i++) {
				const bookmark = state.bookmarkList[i];

				if (state.chapterId != bookmark.chapterId) {
					continue;
				}

				if (bookmark.page == page) {
					return true;
				}
			}

			return false
		},

		flowViewStyle: (state) => {
			if (state.useAutoViewWidth) {
				return { width: 'auto' };
			} else {
				return { width: state.viewWidthValue + '%' };
			}
		},

		singleViewStyle: (state) => {
			if (state.useAutoViewWidth) {
				return { width: 'auto' };
			} else {
				return { width: state.viewWidthValue + '%', maxWidth: 'none', maxHeight: 'none', 'object-fit': 'cover' as ObjectFit };
			}
		},

		doubleViewStyle: (state) => {
			if (state.useAutoViewWidth) {
				return { width: 'auto' };
			} else {
				return { width: state.viewWidthValue / 2 + '%', maxWidth: 'none', maxHeight: 'none', 'object-fit': 'cover' as ObjectFit };
			}
		},

		viewWidth: (state) => {
			if (state.useAutoViewWidth) {
				return 'auto';
			} else {
				return state.viewWidthValue + '%';
			}
		},
		mangaListPageSize: (state) => {
			const storageMangaPageSize = localStorage.getItem('mangaPageSize');
			if (storageMangaPageSize && storageMangaPageSize !== '0') {
				return Number(storageMangaPageSize);
			}

			// 获取页面尺寸类型
			const screen: screenType = config.screenType;
			if (state.mangaListPageSizeCache === 0) {
				return mangaPageSize[screen][0];
			} else {
				return state.mangaListPageSizeCache;
			}
		},
		mangaListPageSizes: (state) => {
			const storageMangaPageSize = localStorage.getItem('mangaPageSize');
			if (storageMangaPageSize && storageMangaPageSize !== '0') {
				return [Number(storageMangaPageSize)];
			}

			// 获取页面尺寸类型
			const screen: screenType = config.screenType;
			return mangaPageSize[screen];
		},
		chapterListPageSize: (state) => {
			const storageChapterPageSize = localStorage.getItem('chapterPageSize');
			if (storageChapterPageSize && storageChapterPageSize !== '0') {
				return Number(storageChapterPageSize);
			}

			const screen: screenType = config.screenType;
			if (state.chapterListPageSizeCache === 0) {
				return chapterPageSize[screen][0];
			} else {
				return state.chapterListPageSizeCache;
			}
		},
		chapterListPageSizes: (state) => {
			const storageChapterPageSize = localStorage.getItem('chapterPageSize');
			if (storageChapterPageSize && storageChapterPageSize !== '0') {
				return [Number(storageChapterPageSize)];
			}

			const screen: screenType = config.screenType;
			return chapterPageSize[screen];
		},
		manageListPageSize: (state) => {
			if (state.manageListPageSizeCache === 0) {
				return manageListPageSizes[0];
			} else {
				return state.manageListPageSizeCache;
			}
		}
	},
	actions: {
		/**
		 * @description: 保存书签
		 * @return {*}
		 */
		async toggle_bookmark() {
			// 计算特殊页码
			let page = this.page;
			if (this.browseType === 'double') {
				page = page * 2 - 1;
			}

			if (this.browseType === 'half') {
				page = Math.ceil(page / 2);
			}

			if (this.bookmarkShow) {
				// 已存在书签 删除书签
				const bookmark = this.bookmarkList.find((bookmark) => {
					return bookmark.chapterId === this.chapterId && bookmark.page === page;
				});
				if (!bookmark) return;
				await bookmarkApi.delete(bookmark.bookmarkId);
			} else {
				let pageImage = this.pageImage;
				if (!pageImage) {
					const index = page - 1;
					pageImage = this.imagePathList?.[index] || '';
				}
				if (!pageImage) return;
				this.pageImage = pageImage;
				// 添加书签
				await bookmarkApi.add({
					page: page,
					pageImage: pageImage,
					browseType: this.browseType,
					mediaId: this.mediaId,
					mangaId: this.mangaId,
					chapterId: this.chapterId,
				});
			}

			// 更新书签状态
			await this.load_bookmark_list();
		},

		/**
		 * @description: 更新书签列表
		 */
		async load_bookmark_list() {
			this.bookmarkList = (await bookmarkApi.get()).list;
		},

		/**
		 * @description: 加载章节列表
		 * @return {*}
		 */
		async load_chapter_list() {
			this.chapterList = (await chapterApi.get({ mangaId: this.mangaId })).list;
		},

		/**
		 * @description: 读取路由参数
		 * @param {*} route
		 * @return {*}
		 */
		load_route_params(route: any) {
			if (!route) return;
			// 主题阅读器沿用旧阅读内容，但模式存放在 query 中，避免与 /t/reader 路由名耦合。
			this.browseType = route.name === 't-reader' ? String(route.query.readerMode || 'flow') : route.name;
			this.mediaId = Number(route.query.mediaId);
			this.mangaId = Number(route.query.mangaId);
			this.chapterId = Number(route.query.chapterId);
		},

		/**
		 * @description: 保存历史记录
		 */
		async save_history() {
			await historyApi.add({
				mediaId: this.mediaId,
				mangaId: this.mangaId,
				chapterId: this.chapterId
			});
		},

		/**
		 * @description: 保存最近阅读
		 */
		async save_latest(lastImageShown: boolean = false) {
			// 刚开始观看不保留记录
			if (this.page < 2) return;
			await latestApi.add({
				mangaId: this.mangaId,
				chapterId: this.chapterId,
				page: this.page,
				count: this.pageCount,
				finish: lastImageShown || this.page >= this.pageCount - 1
			});
		},

		set_view_width(browseType: string) {
			const varName = `${browseType}ViewWidthValue`;
			if (this.useAutoViewWidth) {
				localStorage.setItem(varName, 'auto');
			} else {
				localStorage.setItem(varName, this.viewWidthValue.toString());
			}

			this.dialogViewWidth = false;
		},

		load_view_width(browseType: string) {
			const varName = `${browseType}ViewWidthValue`;
			const viewWidthValue = localStorage.getItem(varName);

			if (!viewWidthValue || viewWidthValue === 'auto') {
				this.useAutoViewWidth = true;
			} else {
				this.useAutoViewWidth = false;
				this.viewWidthValue = Number(viewWidthValue);
			}
		},

		/**
		 * @description: 阅读器操作触发器
		 * control-panel 调用 → 视图 watch 计数器 → 视图执行本地实现
		 */
		trigger_reader_action(action: 'download' | 'jumpPage' | 'setImageWidth' | 'toggleDirection' | 'toggleRemoveFirst' | 'beforeChapter' | 'nextChapter') {
			this.readerActionTick[action] = (this.readerActionTick[action] || 0) + 1;
		},

		/**
		 * @description: 切换章节触发器
		 * control-panel 传入目标 chapterId → 视图执行 change_chapter
		 */
		trigger_change_chapter(chapterId: number) {
			this.pendingChangeChapterId = chapterId;
			this.readerActionTick.changeChapter = (this.readerActionTick.changeChapter || 0) + 1;
		}
	},
});

export default useBrowseStore;
