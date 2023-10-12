import {ajax} from './index';

/**
 * @description: 上次阅读记录
 * @return {*}
 */
const lastReadApi = {
	/**
	 * @description: 获取漫画最后阅读记录
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_latest(mangaId: number) {
		const res = await ajax({
			url: 'lastread/get_latest',
			data: {mangaId},
		});

		if (res.data.code == 1) {
			return false;
		} else {
			return res.data.request;
		}
	},

	/**
	 * @description: 更新最终阅读记录
	 * @param {number} page
	 * @param {number} chapterId
	 * @param {number} mangaId
	 * @return {*}
	 */
	add(page: number, chapterId: number, mangaId: number, finish = false) {
		ajax({
			url: 'lastread/add',
			data: {page, chapterId, mangaId, finish},
		});
	},

	/**
	 * @description: 获取最终阅读记录
	 * @param {number} page
	 * @param {number} pageSize
	 * @return {*}
	 */
	async get(page = 1, pageSize = 10) {
		const res = ajax({
			url: 'lastread/get',
			data: {page, pageSize},
		});

		return (await res).data.list;
	},
};

export default lastReadApi;
