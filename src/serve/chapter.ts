import {ajax} from "./index";

/**
 * 获取章节记录
 * @param mangaId
 */
export function get_chapter(mangaId: number) {
    return ajax({
        url: 'php/chapter/get.php',
        data: {mangaId}
    })
}

/**
 * 修改章节记录
 * @param data
 */
export function update_chapter(data: any) {
    return ajax({
        url: 'php/chapter/update.php',
        data
    })
}

/**
 * 删除章节记录
 * @param chapterId
 */
export function delete_chapter(chapterId: any) {
    return ajax({
        url: 'php/chapter/delete.php',
        data: {chapterId}
    })
}
