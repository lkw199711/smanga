import { ajax } from './index';

const jobsApi = {
	async delete(jobId: number) {
		const res = ajax.delete(`task/${jobId}`);

		return (await res).data;
	},

	/**
	 * @description: 批量删除任务
	 * @param {number[]} jobIds
	 * @return {*}
	 */
	async batch_delete(jobIds: number[]) {
		const res = ajax.delete(`task/${jobIds.join(',')}/batch`, {
			data: jobIds
		});

		return (await res).data;
	},

	async get() {
		const res = ajax.get('task');

		return (await res).data;
	},
};

export default jobsApi;
