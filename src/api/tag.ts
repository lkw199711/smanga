/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-25 00:48:36
 * @FilePath: \smanga\src\api\tag.ts
 */
import {ajax} from './index';

type tagParams = {
	tagId?: number;
	tagName: string;
	tagColor: string;
	description: string;
};

type tagItemType = {
	tagId: number;
	mangaTagId: number;
	tagName: string;
	tagColor: string;
	description: string;
	checked: boolean;
};

export {tagParams, tagItemType};

const tagApi = {
	/**
	 * @description: 获取标签
	 * @return {*}
	 */
	get: async function (
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const res = ajax({
			url: 'tag/get',
			data: {page, pageSize},
		});

		const resData: ResType = (await res).data;

		return {
			list: resData.list,
			count: resData.count,
		};
	},

	/**
	 * @description: 无分页模式下获取标签
	 * @return {*}
	 */
	get_nopage: async function () {
		const res = ajax({
			url: 'tag/get',
			data: {nopage: true},
		});

		const resData: ResType = (await res).data;

		return resData.list;
	},

	/**
	 * @description: 新增标签
	 * @param {string} tagName
	 * @param {string} tagColor
	 * @param {string} description
	 * @return {*}
	 */
	add: async function (tagName: string, tagColor: string, description: string) {
		await ajax({
			url: 'tag/add',
			data: {tagName, tagColor, description},
		});
	},

	/**
	 * @description: 获取漫画标签
	 * @param {number} mangaId
	 * @return {*}
	 */
	get_manga_tag: async function (mangaId: number) {
		const res = ajax({
			url: 'tag/manga-tag/get',
			data: {
				nopage: true,
				mangaId,
			},
		});

		const resData: ResType = (await res).data;

		return resData.list;
	},

	/**
	 * @description: 新增漫畫標簽
	 * @param {number} mangaId
	 * @param {*} tagIds
	 * @return {*}
	 */
	add_manga_tag: async function (mangaId: number, tagId: number) {
		await ajax({
			url: 'tag/manga-tag/add',
			data: {mangaId, tagId},
		});
	},

	/**
	 * @description: 移除漫画的标签
	 * @param {number} mangaTagId
	 * @return {*}
	 */
	remove_manga_tag: async function (mangaTagId: number) {
		await ajax({
			url: 'tag/manga-tag/remove',
			data: {mangaTagId},
		});
	},

	/**
	 * @description: 修改标签
	 * @param {tagParams} data
	 * @return {*}
	 */
	update: async function (data: tagParams) {
		await ajax({
			url: 'tag/update',
			data,
		});
	},

	/**
	 * @description: 删除标签
	 * @param {number} tagId
	 * @return {*}
	 */
	delete: async function (tagId: number) {
		await ajax({
			url: 'tag/delete',
			data: {tagId},
		});
	},
};

export default tagApi;
