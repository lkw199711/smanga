/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-14 08:43:18
 * @FilePath: \smanga\src\api\chapter.ts
 */
import {userConfig} from '@/store';
import {ajax} from './index';

interface chapterGetRes extends ResType {
	list: {
		data: [];
		total: number;
	};
}

/**
 * 修改章节记录
 * @param data
 */
export function update_chapter(data: any) {
	return ajax({
		url: 'chapter/update',
		data,
	});
}

/**
 * 删除章节记录
 * @param chapterId
 * @param deleteFile
 */
export function delete_chapter(chapterId: any, deleteFile = false) {
	return ajax({
		url: 'chapter/delete',
		data: {chapterId, deleteFile},
	});
}

const chapterApi = {
	get: async function (
		mangaId: number,
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined,
		order = userConfig.order,
		keyWord = ''
	) {
		const res = await ajax({
			url: 'chapter/get',
			data: {mangaId, page, pageSize, order, keyWord},
		});

		const resData: chapterGetRes = res.data;

		// 接口错误返回默认值
		if (resData.code !== 0) {
			return {
				list: [],
				count: 0,
			};
		}

		const resFormat: chapterGetFormatType = {
			list: resData.list.data,
			count: resData.list.total,
		};

		return resFormat;
	},

	/**
	 * @description: 获取漫画第一章
	 * @param {number} mangaId
	 * @param {string} order
	 * @return {*}
	 */
	async get_first(mangaId: number, order: string) {
		const res = await ajax({
			url: 'chapter/get_first',
			data: {mangaId, order},
		});

		return res.data;
	},

	/**
	 * @description: 获取漫画最后阅读记录
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_latest(mangaId: number) {
		const res = await ajax({
			url: 'chapter/get_first',
			data: {mangaId},
		});

		if (res.data.code == 1) {
			return false;
		} else {
			return res.data.info;
		}
	},
};

type chapterGetFormatType = {
	list: [];
	count: number;
};

export default chapterApi;
