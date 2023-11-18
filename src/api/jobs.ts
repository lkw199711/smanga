/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-11-19 02:00:49
 * @FilePath: \smanga\src\api\account.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';

const jobsApi = {
	async delete(jobId: number) {
		const res = ajax({
			url: 'jobs/delete',
			data: {jobId},
		});

		return (await res).data;
	},

	async get(page: number, pageSize: number) {
		const res = ajax({
			url: 'jobs/get',
			data: {page, pageSize},
		});

		return (await res).data;
	},
};

export default jobsApi;
