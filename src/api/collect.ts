/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-03 11:35:44
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-23 13:16:42
 * @FilePath: \smanga\src\api\collect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';

/**
 * 获取章节记录
 * @param collectType
 * @param recordStart
 * @param pageSize
 */
export function get_collect(
	collectType: string,
	page: number,
	pageSize: number,
	order: string
) {
	return ajax({
		url: 'collect/get',
		data: {collectType, page, pageSize, order},
	});
}

/**
 * 新增收藏
 * @param data
 */
export function add_collect(data: any) {
	return ajax({
		url: 'collect/add',
		data,
	});
}

export function is_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'collect/is-collect',
		data: {collectType, targetId},
	});
}

export function remove_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'collect/remove',
		data: {collectType, targetId},
	});
}

const collectApi = {
	/**
	 * @description: 查询漫画/章节 是否收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async is_collect(collectType: string, targetId: number) {
		const res = ajax({
			url: 'collect/is-collect',
			data: {collectType, targetId},
		});

		return (await res).data;
	},
	/**
	 * @description: 移除漫画/章节 收藏
	 * @param {string} collectType
	 * @param {number} targetId
	 * @return {*}
	 */
	async remove_collect(collectType: string, targetId: number) {
		const res = ajax({
			url: 'collect/remove',
			data: {collectType, targetId},
		});
		return (await res).data;
	},
	/**
	 * @description: 新增收藏
	 * @param {any} data
	 * @return {*}
	 */
	async add_collect(data: any) {
		const res = ajax({
			url: 'collect/add',
			data,
		});
		return (await res).data;
	},
};

export default collectApi;
