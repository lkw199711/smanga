import { ajax } from './index';

const scanRunApi = {
	async get(page: number = 1, pageSize: number = 20, params: any = {}) {
		const res = await ajax.get('scan-run', { params: { page, pageSize, ...params } });
		return res.data;
	},

	async show(scanRunId: number) {
		const res = await ajax.get(`scan-run/${scanRunId}`);
		return res.data.data;
	},

	async items(scanRunId: number, page: number = 1, pageSize: number = 100, params: any = {}) {
		const res = await ajax.get(`scan-run/${scanRunId}/items`, { params: { page, pageSize, ...params } });
		return res.data;
	},
};

export default scanRunApi;
