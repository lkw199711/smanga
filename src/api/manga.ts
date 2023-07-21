import {ajax} from "./index";

/**
 * 获取漫画记录
 * @param mediaId
 * @param recordStart
 * @param pageSize
 */
export function get_manga(mediaId: number, page: number, pageSize: number,order='') {
    return ajax({
			url: "manga/get",
			data: { mediaId, page, pageSize, order },
		});
}

/**
 * 更改漫画记录
 * @param data
 */
export function update_manga(data: any) {
    return ajax({
        url: 'manga/update',
        data
    })
}

/**
 * 删除漫画
 * @param mangaId
 * @param deleteFile
 */
export function delete_manga(mangaId: number, deleteFile = false) {
    return ajax({
        url: 'manga/delete',
        data: {mangaId, deleteFile}
    })
}
