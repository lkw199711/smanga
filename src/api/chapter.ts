/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-15 23:39:21
 * @FilePath: \smanga\src\api\chapter.ts
 */
import {ajax} from './index';

/**
 * 获取章节记录
 * @param mangaId
 * @param recordStart
 * @param pageSize
 */
export function get_chapter(
	mangaId: number,
	page: number | undefined = undefined,
	pageSize: number | undefined = undefined,
	order = ''
) {
	return ajax({
		url: 'php/laravel/public/index.php/chapter/get',
		data: {mangaId, page, pageSize, order},
	});
}

/**
 * 修改章节记录
 * @param data
 */
export function update_chapter(data: any) {
	return ajax({
		url: 'php/laravel/public/index.php/chapter/update',
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
		url: 'php/laravel/public/index.php/chapter/delete',
		data: {chapterId, deleteFile},
	});
}
