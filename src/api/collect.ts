import {ajax} from './index';

/**
 * 获取章节记录
 * @param collectType
 * @param recordStart
 * @param pageSize
 */
export function get_collect(
	collectType: string,
	recordStart: number,
	pageSize: number,
	order: string
) {
	return ajax({
		url: 'php/collect/get.php',
		data: {collectType, recordStart, pageSize, order},
	});
}

/**
 * 新增收藏
 * @param data
 */
export function add_collect(data: any) {
	return ajax({
		url: 'php/collect/add.php',
		data,
	});
}

/**
 * 删除章节记录
 * @param chapterId
 * @param deleteFile
 */
export function delete_chapter(chapterId: any, deleteFile = false) {
	return ajax({
		url: 'php/collect/delete.php',
		data: {chapterId, deleteFile},
	});
}

export function is_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'php/collect/is-collect.php',
		data: {collectType, targetId},
	});
}

export function remove_collect(collectType: string, targetId: number) {
	return ajax({
		url: 'php/collect/remove-collect.php',
		data: {collectType, targetId},
	});
}
