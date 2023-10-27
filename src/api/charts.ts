/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-28 06:39:28
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

	async frequency() {
		const res = ajax({
			url: 'charts/frequency',
		});

		return (await res).data;
	},

	async ranking() {
		const res = ajax({
			url: 'charts/ranking',
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
