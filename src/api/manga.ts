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

export function delete_manga(mangaId: any) {
    return ajax({
        url: 'php/manga/delete.php',
        data: {mangaId}
    })
}
