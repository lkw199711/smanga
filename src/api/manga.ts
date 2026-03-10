import { ajax } from './index';
import type { ResType } from '@/type/api';

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
		const res = ajax.get('manga', { params: { mediaId, page, pageSize, order, keyWord } });

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
		const http = await ajax.get('tags-manga', { params: { tagIds, page, pageSize, order } });
		const response = http.data;
		return response;
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
			url: 'manga',
			data: { parentPath, page, pageSize, order },
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
			url: 'manga',
			data: { mediaId },
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
		const res = await ajax({
			url: `manga/${mangaId}`,
		});

		const data = res.data;

		return data.code === 0 ? data.data : {};
	},

	/**
	 * 更改漫画记录
	 * @param data
	 */
	async update_manga(data: any) {
		const res = ajax.put(`manga/${data.mangaId}`, data);

		return (await res).data;
	},

	async update_manga_meta(data: any, wirteMetaJson: boolean = true) {
		const res = ajax.put(`manga/${data.mangaId}/meta`, { ...data, wirteMetaJson });

		return (await res).data;
	},

	/**
	 * 删除漫画
	 * @param mangaId
	 * @param deleteFile
	 */
	async delete_manga(mangaId: number, deleteFile = false) {
		const res = ajax.delete(`manga/${mangaId}`, { data: { deleteFile } });

		return (await res).data;
	},

	/**
	 * 扫描漫画
	 * @param mangaId 漫画id
	 * @returns 
	 */
	async scan(mangaId: number) {
		const res = ajax.put(`manga/${mangaId}/scan`, { mangaId });
		return (await res).data;
	},

	async reload_meta(mangaId: number) {
		const res = ajax.put(`manga/${mangaId}/reload-meta`, { mangaId });
		return (await res).data;
	},

	/**
	 * @description: 批量删除漫画
	 * @param {number[]} mangaIds
	 * @return {*}
	 */
	async batch_delete_manga(mangaIds: number[]) {
		const res = ajax.delete(`manga/${mangaIds.join(',')}/batch`, { data: { mangaIds } });

		const resData = (await res).data;
		return resData;
	},
	/**
	 * @description: 压缩漫画
	 * @param {number} mangaId
	 * @return {*}
	 */
	async compress_all(mangaId: number) {
		const res = ajax.put(`manga/${mangaId}/compress`, { mangaId });
		return (await res).data;
	},
	/**
	 * @description: 删除漫画压缩文件
	 * @param {number} mangaId
	 * @return {*}
	 */
	async compress_delete(mangaId: number) {
		const res = ajax.delete(`manga/${mangaId}/compress`, { data: { mangaId } });
		return (await res).data;
	},
};

export default mangaApi;
