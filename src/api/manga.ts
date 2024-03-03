/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-26 20:25:18
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-03-04 04:14:45
 * @FilePath: /smanga/src/api/manga.ts
 */
import {ajax} from './index';

const mangaApi = {
	/**
	 * @description: 获取漫画列表
	 * @param {number} mediaId
	 * @param {number} page
	 * @param {number} pageSize
	 * @param {*} order
	 * @return {*}
	 */
	async get(
		mediaId: number,
		page: number,
		pageSize: number,
		order = '',
		keyWord = ''
	) {
		const res = ajax({
			url: 'manga/get',
			data: {mediaId, page, pageSize, order, keyWord},
		});

		return (await res).data;
	},

	/**
	 * @description: 根据标签获取漫画
	 * @return {*}
	 */
	async get_by_tags(
		tagIds: string,
		page: number,
		pageSize: number,
		order = ''
	) {
		const res = ajax({
			url: 'manga/get_by_tags',
			data: {tagIds, page, pageSize, order},
		});

		const data: ResType = (await res).data;

		return {
			list: data.list,
			count: data.count,
		};
	},

	/**
	 * @description: 根据标签获取漫画
	 * @return {*}
	 */
	async get_by_parent_path(
		parentPath: string,
		page: number,
		pageSize: number,
		order = ''
	) {
		const res = ajax({
			url: 'manga/get_by_parent_path',
			data: {parentPath, page, pageSize, order},
		});

		const data: ResType = (await res).data;

		return {
			list: data.list,
			count: data.count,
		};
	},

	/**
	 * @description: 根据标签获取漫画
	 * @return {*}
	 */
	async get_sub_path(mediaId: number) {
		const res = ajax({
			url: 'manga/get_sub_path',
			data: {mediaId},
		});

		const data: ResType = (await res).data;

		return {
			list: data.list,
			count: data.count,
		};
	},

	/**
	 * @description: 获取漫画元数据
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_manga_info(mangaId: number) {
		const res = ajax({
			url: 'manga/get_manga_info',
			data: {mangaId},
		});

		const data = (await res).data;

		return data.request;
	},

	/**
	 * 更改漫画记录
	 * @param data
	 */
	async update_manga(data: any) {
		const res = ajax({
			url: 'manga/update',
			data,
		});

		return (await res).data;
	},

	/**
	 * 删除漫画
	 * @param mangaId
	 * @param deleteFile
	 */
	async delete_manga(mangaId: number, deleteFile = false) {
		const res = ajax({
			url: 'manga/delete',
			data: {mangaId, deleteFile},
		});

		return (await res).data;
	},
};

export default mangaApi;
