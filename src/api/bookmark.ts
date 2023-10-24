/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-25 00:18:31
 * @FilePath: \smanga\src\api\bookmark.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';
import {global_get, global_get_array, global_set_json} from '@/utils';
import {config} from '@/store';

const bookmarkApi = {
	/**
	 * @description: 添加书签
	 * @param {number} page
	 * @return {*}
	 */
	async add_bookmark(page: number) {
		let pageImage = global_get('pageImage');

		if (config.browseType == 'flow') {
			const imgPathList = global_get_array('imgPathList');
			pageImage = imgPathList[page];
		}

		const res = ajax({
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

		return (await res).data;
	},

	/**
	 * @description: 获取书签列表
	 * @return {*}
	 */
	async get_bookmark(
		page: number | undefined = undefined,
		pageSize: number | undefined = undefined
	) {
		const res = ajax({
			url: 'bookmark/get',
			data: {page, pageSize},
		});

		return (await res).data;
	},

	/**
	 * @description: 删除书签
	 * @param {number} bookmarkId
	 * @return {*}
	 */
	async delete_bookmark(bookmarkId: number) {
		const res = await ajax({
			url: 'bookmark/remove',
			data: {
				bookmarkId,
			},
		});

		return res.data;
	},

	async delete_and_update(bookmarkId: number) {
		const res = await ajax({
			url: 'bookmark/remove',
			data: {
				bookmarkId,
			},
		});

		const res1 = await this.get_bookmark();
		global_set_json('bookmarkList', res1.list);

		return res.data;
	},
};

export default bookmarkApi;
