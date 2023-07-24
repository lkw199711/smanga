/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-15 23:39:21
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
 * 获取章节记录
 * @param mangaId
 * @param recordStart
 * @param pageSize
 */
export function get_chapter(
	mangaId: number,
	page: number | undefined = undefined,
	pageSize: number | undefined = undefined,
	order = ''
) {
	return ajax({
		url: 'chapter/get',
		data: {mangaId, page, pageSize, order},
	});
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
		order = userConfig.order
	) {
		const res = await ajax({
			url: 'chapter/get',
			data: {mangaId, page, pageSize, order},
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
};

type chapterGetFormatType = {
	list: [];
	count: number;
};

export default chapterApi;
