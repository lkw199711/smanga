/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-15 23:40:53
 * @FilePath: \smanga\src\api\history.ts
 */
import {ajax} from "./index";
import {global_get} from "@/utils";

export function add_history() {
    return ajax({
        url: 'php/laravel/public/index.php/history/add',
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
        url: 'php/laravel/public/index.php/history/get',
        data: {page, pageSize}
    })
}

export function delete_history(historyId: number) {
    return ajax({
        url: 'php/laravel/public/index.php/history/delete',
        data: {
            historyId
        }
    })
}
