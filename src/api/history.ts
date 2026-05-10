import { historyCreateParamsType } from '@/type/history';
import { ajax } from './index';

/**
 * @description: 历史记录接口
 * @return {*}
 */
const historyApi = {
	/**
	 * @description: 获取漫画最后阅读记录
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_latest(mangaId: number) {
		const res = await ajax({
			url: 'history/get_latest',
			data: { mangaId },
		});

		return res.data?.info || false;
	},

	/**
	 * @description: 添加历史记录
	 * @return {*}
	 */
	async add(params: historyCreateParamsType) {
		const http = await ajax.post('history', params)

		const response = http.data;
		return response
	},

	/**
	 * @description: 获取历史记录
	 * @return {*}
	 */
	async get_history(
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const http = await ajax.get('history', {
			params: { page, pageSize },
		});
		const response = http.data;
		return response
	},

	async get(page: number | undefined = undefined, pageSize: number | undefined = undefined) {
		return this.get_history(page, pageSize)
	},

	/**
	 * @description: 删除历史记录
	 * @param {number} chapterId
	 * @return {*}
	 */
	async delete(chapterId: number) {
		const http = await ajax.delete(`history/${chapterId}`);
		const response = http.data;
		return response
	},

	/**
	 * @description: 删除所有历史记录
	 * @return {*}
	 */
	async read_all_chapters(mangaId: number) {
		const http = await ajax.put(`read-all-chapters/${mangaId}`, {});
		const response = http.data;
		return response
	},

	async unread_all_chapters(mangaId: number) {
		const http = await ajax.put(`unread-all-chapters/${mangaId}`, {});
		const response = http.data;
		return response
	},

	async is_read(chapterId: number) {
		const http = await ajax.get(`chapter-is-read/${chapterId}`);
		const response = http.data;
		return response.data
	}
};

export default historyApi;
