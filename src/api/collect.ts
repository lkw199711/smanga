import {ajax} from './index';

const collectApi = {
	async get(mangaType: string, page: number, pageSize: number, order: string) {
		const http = await ajax.get(`collect-${mangaType}`, {
			params: {page, pageSize, order},
		});

		const response = http.data;

		return response;
	},
	/**
	 * @description: 查询漫画/章节 是否收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async is_collect(collectType: string, targetId: number) {
		const http = await ajax.get(`${collectType}-iscollect/${targetId}`, {
			params: {
				collectType,
				targetId,
			},
		});
		const response = http.data;
		return response.data;
	},
	/**
	 * @description: 移除漫画/章节 收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async remove_collect(collectType: string, targetId: number) {
		const res = ajax.post(`collect-${collectType}/${targetId}`, {});
		return (await res).data;
	},
	/**
	 * @description: 新增收藏
	 * @param {any} data
	 * @return {*}
	 */
	async add_collect(data: any) {
		const http = await ajax.post(
			`collect-${data.collectType}/${data.mangaId}`,
			data
		);
		const response = http.data;
		return response.data;
	},

	/**
	 * @description: 新增收藏
	 * @param {any} data
	 * @return {*}
	 */
	async add_chapter_collect(collectType: string, chapterId: number, data: any) {
		const http = await ajax.post(
			`collect-${collectType}/${chapterId}`,
			data
		);
		const response = http.data;
		return response.data;
	},
};

export default collectApi;
