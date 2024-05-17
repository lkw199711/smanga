/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-03 11:35:44
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-16 18:04:28
 * @FilePath: \smanga\src\api\collect.ts
 */
import {ajax} from './index';

/**
 * 获取章节记录
 * @param collectType
 * @param page
 * @param pageSize
 */
export function get_collect(
	collectType: string,
	page: number,
	pageSize: number,
	order: string
) {
	return ajax({
		url: 'collect',
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
