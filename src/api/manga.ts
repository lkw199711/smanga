import {ajax} from './index';

/**
 * 获取漫画记录
 * @param mediaId
 * @param page
 * @param pageSize
 */
export function get_manga(
	mediaId: number,
	page: number,
	pageSize: number,
	order = ''
) {
	return ajax({
		url: 'manga/get',
		data: {mediaId, page, pageSize, order},
	});
}

/**
 * 更改漫画记录
 * @param data
 */
export function update_manga(data: any) {
	return ajax({
		url: 'manga/update',
		data,
	});
}

/**
 * 删除漫画
 * @param mangaId
 * @param deleteFile
 */
export function delete_manga(mangaId: number, deleteFile = false) {
	return ajax({
		url: 'manga/delete',
		data: {mangaId, deleteFile},
	});
}

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
};

export default mangaApi;
