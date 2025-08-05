import { ajax } from './index';

const jobsApi = {
	async delete(jobId: number) {
		const res = ajax.delete(`task/${jobId}`);

		return (await res).data;
	},

	async get() {
		const res = ajax.get('task');

		return (await res).data;
	},
};

export default jobsApi;
