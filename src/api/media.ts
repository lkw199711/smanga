import {ajax} from './index';
import { onMediaOperation } from '@/utils/cache';

const mediaApi = {
	/**
	 * @description: 获取媒体库记录
	 * @param {number} page
	 * @param {number} pageSize
	 * @return {*}
	 */
	async get(page: number = 1, pageSize: number = 999) {
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
		
		// 清除缓存
		onMediaOperation();

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
		
		// 清除缓存
		onMediaOperation();
		
		return resData;
	},

	/**
	 * @description: 删除媒体库
	 * @param {any} mediaId
	 * @return {*}
	 */
	async delete_media(mediaId: any, deleteFile = false) {
		const res = ajax.delete(`media/${mediaId}`, {data: {deleteFile}});

		const resData = (await res).data;
		
		// 清除缓存
		onMediaOperation();
		
		return resData;
	},

	async create_cover(mediaId: number) {
		const res = ajax.put(`media-cover/${mediaId}`);
		const resData = (await res).data;
		return resData.data;
	},

	async scan(mediaId: number) {
		const res = ajax.put(`media/${mediaId}/scan`);
		const resData = (await res).data;
		
		// 清除缓存
		onMediaOperation();
		
		return resData;
	},

	/**
	 * @description: 批量删除媒体库
	 * @param {number[]} mediaIds
	 * @return {*}
	 */
	async batch_delete_media(mediaIds: number[], deleteFile = false) {
		const res = ajax.delete(`media/${mediaIds.join(',')}/batch`, {
			data: {mediaIds, deleteFile},
		});

		const resData = (await res).data;
		
		// 清除缓存
		onMediaOperation();
		
		return resData;
	},
};

export default mediaApi;
