/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-08 22:47:49
 * @FilePath: \smanga\src\api\chapter.ts
 */
import {userConfig} from '@/store';
import {ajax} from './index';
import {global_get} from '@/utils';

interface chapterGetRes extends ResType {
	list: [];
	count: number;
}

const chapterApi = {
	get: async function (
		mangaId: number,
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined,
		order = userConfig.order,
		keyWord = ''
	) {
		const res = await ajax.get('chapter', {
			params: {mangaId, page, pageSize, order, keyWord},
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
			url: `chapter-first`,
			params: {mangaId, order},
		});

		const response = res.data;
		return response.code === 0 ? response.data : {};
	},

	async get_images(chapterId: number) {
		const res = ajax({
			url: `chapter-images/${chapterId}`,
			data: {
				chapterId: chapterId,
			},
			timeout: 30 * 1000,
		});

		const data = (await res).data;

		return {
			list: data.data,
			count: data.count,
			state: data.status,
		};
	},

	/**
	 * 修改章节记录
	 * @param data
	 */
	async update_chapter(data: any) {
		const res = ajax.put(`chapter/${data.chapterId}`, data);

		return (await res).data;
	},

	/**
	 * 删除章节记录
	 * @param chapterId
	 * @param deleteFile
	 */
	async delete_chapter(chapterId: any, deleteFile = false) {
		const res = ajax.delete(`chapter/${chapterId}`, {params: {deleteFile}});

		return (await res).data;
	},
};

type chapterGetFormatType = {
	list: [];
	count: number;
};

export default chapterApi;
