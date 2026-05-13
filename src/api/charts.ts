/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-08-07 10:33:57
 * @FilePath: \smanga\src\api\account.ts
 */
import {ajax} from './index';

const chartsApi = {
	async get_count() {
		try {
			const http = await ajax.get('chart-count');
			const response = http.data;
			return response.data || {};
		} catch {
			return {};
		}
	},

	async browse() {
		const http = await ajax.get('chart-browse');

		const response = http.data;

		return response.data;
	},

	async frequency(slice: number) {
		const http = await ajax.get('chart-frequency', {params: {slice}});

		const response = http.data;

		return response.data;
	},

	async ranking(slice: number) {
		const http = await ajax.get('chart-ranking', {params: {slice}});

		const response = http.data;

		return response.data;
	},

	async tag_count(slice: number) {
		const http = await ajax.get('chart-tag', {params: {slice}});

		const response = http.data;

		return response.data;
	},
};

export default chartsApi;
