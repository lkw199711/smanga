/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-28 18:00:26
 * @FilePath: \smanga\src\api\account.ts
 */
import {ajax} from './index';

const chartsApi = {
	async browse() {
		const res = ajax({
			url: 'charts/browse',
		});

		return (await res).data;
	},

	async frequency(slice: number) {
		const res = ajax({
			url: 'charts/frequency',
			data: {slice},
		});

		return (await res).data;
	},

	async ranking(slice: number) {
		const res = ajax({
			url: 'charts/ranking',
			data: {slice},
		});

		return (await res).data;
	},

	async tag_count(slice: number) {
		const res = ajax({
			url: 'charts/tag_count',
			data: {slice},
		});

		return (await res).data;
	},
};

export default chartsApi;
