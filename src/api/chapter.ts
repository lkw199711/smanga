import {ajax} from './index';

/**
 * 获取章节记录
 * @param mangaId
 * @param recordStart
 * @param pageSize
 */
export function get_chapter(
	mangaId: number,
	recordStart: number | undefined = undefined,
	pageSize: number | undefined = undefined,
	order = ''
) {
	return ajax({
		url: 'php/chapter/get.php',
		data: {mangaId, recordStart, pageSize, order},
	});
}

/**
 * 修改章节记录
 * @param data
 */
export function update_chapter(data: any) {
	return ajax({
		url: 'php/chapter/update.php',
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
		url: 'php/chapter/delete.php',
		data: {chapterId, deleteFile},
	});
}
