import { ajax } from './index';

const pathApi = {
	/**
	 * 获取路径记录
	 * @param mediaId
	 * @param page
	 * @param pageSize
	 */
	async get_path(mediaId: number, page: number, pageSize: number) {
		const res = ajax({
			url: 'path',
			params: { mediaId, page, pageSize },
		});

		return (await res).data;
	},

	async get(mediaId: number) {
		const httpResponse = await ajax.get('path', { params: { mediaId } });
		return httpResponse.data;
	},

	/**
	 * 扫描路径
	 * @param mediaId
	 * @param path
	 * @param pathId
	 */
	async rescan_path(pathId: any) {
		const res = ajax.put(`path/${pathId}/rescan`);
		return (await res).data;
	},

	/**
	 * 扫描路径
	 * @param mediaId
	 * @param path
	 * @param pathId
	 */
	async scan_path(pathId: any) {
		const res = ajax({
			method: 'PUT',
			url: `path/scan/${pathId}`,
		});

		return (await res).data;
	},

	/**
	 * 删除路径
	 * @param pathId
	 */
	async delete_path(pathId: any) {
		const res = ajax.delete(`path/${pathId}`);

		return (await res).data;
	},

	/**
	 * 新增路径
	 * @param mediaId
	 * @param path
	 */
	async add_path(mediaId: any, pathForm: any) {
		const http = await ajax.post('path', Object.assign({ mediaId }, pathForm));
		const response = http.data;
		return response.data;
	},

	async update_path(pathId: any, pathForm: any) {
		const http = await ajax.put(`path/${pathId}`, pathForm);
		const response = http.data;
		return response.data;
	}
};

export default pathApi;
