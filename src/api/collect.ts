/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-03 11:35:44
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-14 01:55:19
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
		url: 'php/laravel/public/index.php/collect/get',
		data: {collectType, page, pageSize, order},
	});
}

/**
 * 新增收藏
 * @param data
 */
export function add_collect(data: any) {
	return ajax({
		url: 'php/laravel/public/index.php/collect/add',
		data,
	});
}

export function is_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'php/laravel/public/index.php/collect/is-collect',
		data: {collectType, targetId},
	});
}

export function remove_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'php/laravel/public/index.php/collect/remove',
		data: {collectType, targetId},
	});
}
