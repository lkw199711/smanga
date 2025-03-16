/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-08-04 23:30:51
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-08-05 10:48:52
 * @FilePath: \smanga\src\store\browse.ts
 */
import bookmarkApi from '@/api/bookmark';
import { bookmarkType } from '@/type/bookmark';
import { defineStore } from 'pinia';
import { chapterType } from '@/type/chapter';
import chapterApi from '@/api/chapter';
import historyApi from '@/api/history';
import latestApi from '@/api/latest';
const useBrowseStore = defineStore('browse', {
	state: () => ({
		browseType: 'flow',
		mediaId: -1,
		mangaId: -1,
		chapterId: -1,
		// 当前页码
		page: 1,
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
	}),
	getters: {
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
				// 添加书签
				await bookmarkApi.add({
					page: page,
					pageImage: this.pageImage,
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
			this.chapterList = (await chapterApi.get(this.mangaId)).list;
		},

		/**
		 * @description: 读取路由参数
		 * @param {*} route
		 * @return {*}
		 */
		load_route_params(route: any) {
			if (!route) return;
			this.browseType = route.name;
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
		async save_latest() {
			// 刚开始观看不保留记录
			if (this.page < 2) return;
			await latestApi.add({
				mangaId: this.mangaId,
				chapterId: this.chapterId,
				page: this.page,
				count: this.pageCount,
				finish: this.page >= this.pageCount
			});
		}
	},
});

export default useBrowseStore;
