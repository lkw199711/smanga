/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-07-27 14:56:34
 * @FilePath: \smanga\src\api\tag.ts
 */
import {ajax} from './index';

const tagApi = {
	/**
	 * @description: 获取标签
	 * @return {*}
	 */
	get: async function (
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const res = ajax({
			url: 'tag/get',
			data: {page, pageSize},
		});

		const resData: ResType = (await res).data;

		return {
			list: resData.list.data,
			count: resData.list.total,
		};
	},

	/**
	 * @description: 新增标签
	 * @param {string} tagName
	 * @param {string} tagColor
	 * @param {string} description
	 * @return {*}
	 */
	add: async function (tagName: string, tagColor: string, description: string) {
		const res = ajax({
			url: 'tag/get',
			data: {tagName, tagColor, description},
		});
	},
};

export default tagApi;
