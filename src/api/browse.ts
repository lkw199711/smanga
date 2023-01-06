import {ajax} from "./index";
import {global_get} from "@/utils";

/**
 * 获取章节记录
 */
export function get_chapter_images() {
    return ajax({
        url: 'php/get-image-list.php',
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
