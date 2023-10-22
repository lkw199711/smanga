/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-23 01:27:51
 * @FilePath: \smanga\src\api\chapter.ts
 */
import {userConfig} from '@/store';
import {ajax} from './index';
import {global_get} from '@/utils';

interface chapterGetRes extends ResType {
	list: [];
	count: number;
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
			list: resData.list,
			count: resData.count,
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

	async get_images(chapterId: number) {
		const res = ajax({
			url: 'chapter/image',
			data: {
				chapterId: chapterId || global_get('chapterId'),
			},
		});

		const data = (await res).data;

		return {
			list: data.list,
			count: data.count,
			state: data.state,
		};
	},
};

type chapterGetFormatType = {
	list: [];
	count: number;
};

export default chapterApi;
