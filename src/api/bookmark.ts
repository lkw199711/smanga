import {ajax} from "./index";
import {global_get} from "@/utils";
import {config} from "@/store";

export function add_bookmark(page: number) {
    return ajax({
        url: 'php/bookmark/add.php',
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
            pageImage: global_get('pageImage'),
            browseType: config.browseType,
        },
    })
}

export function get_bookmark(recordStart: number | undefined = undefined, pageSize: number | undefined = undefined) {
    return ajax({
        url: 'php/bookmark/get.php',
        data: {recordStart, pageSize}
    })
}

export function delete_bookmark(bookmarkId: number) {
    return ajax({
        url: 'php/bookmark/delete.php',
        data: {
            bookmarkId
        }
    })
}

export function update_bookmark(data: any) {
    return ajax({
        url: 'php/bookmark/update.php',
        data
    })
}
