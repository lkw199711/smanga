import { ajax } from './index';
import { global_set_json } from '@/utils';

const bookmarkApi = {
	/**
	 * @description: 添加书签
	 * @param {number} page
	 * @return {*}
	 */
	async add(params: {
		page: number,
		pageImage: string,
		browseType: string,
		mediaId: number,
		mangaId: number,
		chapterId: number,
	 }) {
		const http = await ajax.post('bookmark', params);

		return http.data;
	},

	/**
	 * @description: 获取书签列表
	 * @return {*}
	 */
	async get(
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const res = ajax.get('bookmark', { params: { page, pageSize } });

		return (await res).data;
	},

	/**
	 * @description: 删除书签
	 * @param {number} bookmarkId
	 * @return {*}
	 */
	async delete(bookmarkId: number) {
		const res = await ajax.delete(`bookmark/${bookmarkId}`);
		return res.data;
	},

	async delete_and_update(bookmarkId: number) {
		const res = await ajax.delete(`bookmark/${bookmarkId}`);
		const res1 = await this.get();
		global_set_json('bookmarkList', res1.list);

		return res.data;
	},
};

export default bookmarkApi;
