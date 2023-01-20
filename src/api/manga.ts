import {ajax} from "./index";

/**
 * 获取漫画记录
 * @param mediaId
 * @param recordStart
 * @param pageSize
 */
export function get_manga(mediaId: number, recordStart: number, pageSize: number) {
    return ajax({
        url: 'php/manga/get.php',
        data: {mediaId, recordStart, pageSize}
    })
}

/**
 * 更改漫画记录
 * @param data
 */
export function update_manga(data: any) {
    return ajax({
        url: 'php/manga/update.php',
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
        url: 'php/manga/delete.php',
        data: {mangaId, deleteFile}
    })
}
