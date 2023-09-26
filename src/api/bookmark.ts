/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-26 13:38:38
 * @FilePath: \smanga\src\api\bookmark.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';
import {global_get, global_get_array, global_set_json} from '@/utils';
import {config} from '@/store';

export function add_bookmark(page: number) {
	let pageImage = global_get('pageImage');

	if (config.browseType == 'flow') {
		const imgPathList = global_get_array('imgPathList');
		pageImage = imgPathList[page];
	}

	return ajax({
		url: 'bookmark/add',
		data: {
			mediaId: global_get('mediaId'),
			mangaId: global_get('mangaId'),
			mangaName: global_get('mangaName'),
			mangaCover: global_get('mangaCover'),
			chapterId: global_get('chapterId'),
			chapterName: global_get('chapterName'),
			chapterPath: global_get('chapterPath'),
			chapterType: global_get('chapterType'),
			chapterCover: global_get('chapterCover'),
			page,
			pageImage,
			browseType: config.browseType,
		},
	});
}

export function get_bookmark(
	page: number | undefined = undefined,
	pageSize: number | undefined = undefined
) {
	return ajax({
		url: 'bookmark/get',
		data: {page, pageSize},
	});
}

export async function delete_bookmark(bookmarkId: number) {
	const res = await ajax({
		url: 'bookmark/remove',
		data: {
			bookmarkId,
		},
    });
    
	const res1 = await get_bookmark();
    global_set_json('bookmarkList', res1.data.list);
    
	return res.data;
}
