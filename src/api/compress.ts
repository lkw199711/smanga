/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-25 01:05:55
 * @FilePath: \smanga\src\api\compress.ts
 */
import {ajax} from './index';

const compressApi = {
	/**
	 * 获取转换记录
	 * @param page
	 * @param pageSize
	 */
	async get_compress(page: number, pageSize: number) {
		const res = ajax.get('compress', {params: {page, pageSize}});

		return (await res).data;
	},

	/**
	 * @description: 删除转换记录
	 * @param {number} compressId
	 * @return {*}
	 */
	async delete_compress(compressId: number) {
		const res = ajax.delete(`compress/${compressId}`);

		return (await res).data;
	},
};

export default compressApi;
