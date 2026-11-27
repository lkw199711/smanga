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

	async failed() {
		return (await ajax.get('task/failed')).data;
	},

	async retry(jobId: number | string) {
		return (await ajax.post(`task/failed/${jobId}/retry`)).data;
	},

	async get() {
		const res = ajax.get('task');

		return (await res).data;
	},
};

export default jobsApi;
