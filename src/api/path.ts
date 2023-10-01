/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 20:57:38
 * @FilePath: \smanga\src\api\path.ts
 */
import {ajax} from './index';

/**
 * 获取路径记录
 * @param mediaId
 * @param page
 * @param pageSize
 */
export function get_path(
	mediaId: number,
	page: number,
	pageSize: number
) {
	return ajax({
		url: 'path/get',
		data: {mediaId, page, pageSize},
	});
}

/**
 * 扫描路径
 * @param mediaId
 * @param path
 * @param pathId
 */
export function rescan_path(mediaId: any, path: any, pathId: any) {
	return ajax({
		url: 'path/rescan',
		data: {mediaId, path, pathId},
	});
}

/**
 * 扫描路径
 * @param mediaId
 * @param path
 * @param pathId
 */
export function scan_path(mediaId: any, path: any, pathId: any) {
	return ajax({
		url: 'path/scan',
		data: {mediaId, path, pathId},
	});
}

/**
 * 删除路径
 * @param pathId
 */
export function delete_path(pathId: any) {
	return ajax({
		url: 'path/delete',
		data: {pathId},
	});
}

/**
 * 新增路径
 * @param mediaId
 * @param path
 */
export function add_path(mediaId: any, pathForm: any) {
	return ajax({
		url: 'path/add',
		data: Object.assign({mediaId}, pathForm),
	});
}

/**
 * 删除媒体库
 * @param mediaId
 */
export function delete_media(mediaId: any) {
	return ajax({
		url: 'php/media/delete.php',
		data: {mediaId},
	});
}
