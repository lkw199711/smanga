/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-08-16 23:05:11
 * @FilePath: \smanga\src\api\history.ts
 */
import {ajax} from "./index";
import {global_get} from "@/utils";

export function add_history() {
    return ajax({
        url: 'history/add',
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
        },
    })
}

export function get_history(page: number | undefined = undefined, pageSize: number | undefined = undefined) {
    return ajax({
        url: 'history/get',
        data: {page, pageSize}
    })
}

export function delete_history(historyId: number) {
    return ajax({
        url: 'history/delete',
        data: {
            historyId
        }
    })
}

/**
 * @description: 历史记录接口
 * @return {*}
 */
const historyApi = {
	/**
	 * @description: 获取漫画最后阅读记录
	 * @param {number} mangaId
	 * @return {*}
	 */
	async get_latest(mangaId: number) {
		const res = await ajax({
			url: 'history/get_latest',
			data: {mangaId},
		});

		if (res.data.code == 1) {
			return false;
		} else {
			return res.data.info;
		}
	},
};

export default historyApi;