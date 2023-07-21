/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-18 02:07:13
 * @FilePath: \smanga\src\api\browse.ts
 */
import {ajax} from "./index";
import {global_get} from "@/utils";

/**
 * 获取章节记录
 */
export function get_chapter_images() {
    return ajax({
        url: 'chapter/image',
        data:{
            imagePath: global_get('chapterPath'),
            mediaId: global_get('mediaId'),
            mangaId: global_get('mangaId'),
            chapterId: global_get('chapterId'),
            chapterPath: global_get('chapterPath'),
            chapterType: global_get('chapterType'),
            mangaCover: global_get('mangaCover'),
            chapterCover: global_get('chapterCover'),
        }
    })
}
