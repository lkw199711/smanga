/*
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-04-05 03:53:27
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-03-14 21:07:21
 * @FilePath: \smanga\src\api\latest.ts
 */
import { ajax } from './index';

/**
 * @description: 上次阅读记录
 * @return {*}
 */
const latestApi = {
	/**
	 * @description: 获取漫画最后阅读记录
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_latest(mangaId: number) {
		const res = await ajax({
			url: `latest/${mangaId}`,
			data: { mangaId },
		});

		if (res.data.code == 1) {
			return false;
		} else {
			return res.data.data;
		}
	},

	/**
	 * @description: 更新最终阅读记录
	 * @param {number} page
	 * @param {number} chapterId
	 * @param {number} mangaId
	 * @return {*}
	 */
	async add({ chapterId, mangaId, page, count, finish }: { chapterId: number; mangaId: number; page: number; count: number; finish: boolean }) {
		await ajax({
			url: 'latest',
			method: 'post',
			data: { page, count, chapterId, mangaId, finish: Number(finish) },
		});
	},

	async delete(chapterId: number) {
		const http = await ajax.delete(`latest/${chapterId}`);
		return http.data;
	},

	/**
	 * @description: 获取最终阅读记录
	 * @param {number} page
	 * @param {number} pageSize
	 * @return {*}
	 */
	async get(page = 1, pageSize = 10) {
		const res = ajax.get('latest', { params: { page, pageSize } });

		return (await res).data.list;
	},
};

export default latestApi;
