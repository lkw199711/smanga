/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-02-14 21:06:08
 * @FilePath: \smanga\src\api\media.ts
 */
import {ajax} from './index';

const mediaApi = {
	/**
	 * @description: 获取媒体库记录
	 * @param {number} page
	 * @param {number} pageSize
	 * @return {*}
	 */
	async get(page: number, pageSize: number) {
		const res = ajax.get('media', {params: {page, pageSize}});

		const resData = (await res).data;

		return resData;
	},
	/**
	 * @description: 更新媒体库信息
	 * @param {any} data
	 * @return {*}
	 */
	async update_media(data: any) {
		const res = ajax.put(`media/${data.mediaId}`, data);

		const resData = (await res).data;

		return resData;
	},

	/**
	 * @description: 新增媒体库
	 * @param {any} data
	 * @return {*}
	 */
	async add_media(data: any) {
		const res = ajax.post('media', data);
		const resData = (await res).data;
		return resData;
	},

	/**
	 * @description: 删除媒体库
	 * @param {any} mediaId
	 * @return {*}
	 */
	async delete_media(mediaId: any) {
		const res = ajax.delete(`media/${mediaId}`);

		const resData = (await res).data;
		return resData;
	},

	async create_cover(mediaId: number) { 
		const res = ajax.put(`media-cover/${mediaId}`);
		const resData = (await res).data;
		return resData.data;
	},
};

export default mediaApi;
