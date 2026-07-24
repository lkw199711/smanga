import { ResType } from '@/type/api';
import { ajax } from './index';

type tagParams = {
	tagId?: number;
	tagName: string;
	tagColor: string;
	description: string;
};

type tagItemType = {
	tagId: number;
	mangaTagId: number;
	tagName: string;
	tagColor: string;
	description: string;
	checked: boolean;
};

export { tagParams, tagItemType };

const tagApi = {
	/**
	 * @description: 获取标签
	 * @return {*}
	 */
	get: async function (
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const res = ajax.get('tag', { params: { page, pageSize } });

		const resData: ResType = (await res).data;

		return {
			list: resData.list,
			count: resData.count,
		};
	},

	/**
	 * @description: 无分页模式下获取标签
	 * @return {*}
	 */
	get_nopage: async function () {
		const res = ajax({
			url: 'tag',
			data: { nopage: true },
		});

		const resData: ResType = (await res).data;

		return resData.list;
	},

	/**
	 * @description: 新增标签
	 * @param {string} tagName
	 * @param {string} tagColor
	 * @param {string} description
	 * @return {*}
	 */
	add: async function (tagName: string, tagColor: string, description: string) {
		await ajax.post('tag', { tagName, tagColor, description });
	},

	/**
	 * @description: 获取漫画标签
	 * @param {number} mangaId
	 * @return {*}
	 */
	get_manga_tag: async function (mangaId: number) {
		const res = ajax.get(`manga-tag/${mangaId}`);

		const resData: ResType = (await res).data;

		return resData.list;
	},

	/**
	 * @description: 新增漫畫標簽
	 * @param {number} mangaId
	 * @param {*} tagIds
	 * @return {*}
	 */
	add_manga_tag: async function (mangaId: number, tags: tagItemType[], metaWriteJson: boolean = true) {
		await ajax.put(`manga/${mangaId}/tags`, { mangaId, tags, metaWriteJson });
	},

	/**
	 * @description: 移除漫画的标签
	 * @param {number} mangaTagId
	 * @return {*}
	 */
	remove_manga_tag: async function (mangaTagId: number) {
		await ajax.delete(`manga-tag/${mangaTagId}`);
	},

	/**
	 * @description: 修改标签
	 * @param {tagParams} data
	 * @return {*}
	 */
	update: async function (data: tagParams) {
		await ajax.put(`tag/${data.tagId}`, { ...data });
	},

	/**
	 * @description: 删除标签
	 * @param {number} tagId
	 * @return {*}
	 */
	delete: async function (tagId: number) {
		await ajax.delete(`tag/${tagId}`);
	},

	/**
	 * @description: 批量删除标签
	 * @param {number[]} tagIds
	 * @return {*}
	 */
	batch_delete: async function (tagIds: number[]) {
		await ajax.delete(`tag/${tagIds.join(',')}/batch`, { data: { tagIds } });
	},

	/**
	 * @description: 根据标签ID获取漫画列表
	 * @param {string} tagIds 逗号分隔的标签ID
	 * @param {number} page
	 * @param {number} pageSize
	 * @param {string} order
	 * @return {*}
	 */
	get_manga_by_tags: async function (
		tagIds: string,
		page: number,
		pageSize: number,
		order = ''
	) {
		const res = await ajax.get('tags-manga', { params: { tagIds, page, pageSize, order } });
		return res.data;
	},

};

export default tagApi;
