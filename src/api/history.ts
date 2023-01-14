import {ajax} from "./index";
import {global_get} from "@/utils";

export function add_history() {
    return ajax({
        url: 'php/history/add.php',
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

export function get_history(recordStart: number | undefined = undefined, pageSize: number | undefined = undefined) {
    return ajax({
        url: 'php/history/get.php',
        data: {recordStart, pageSize}
    })
}

export function delete_history(historyId: number) {
    return ajax({
        url: 'php/history/delete.php',
        data: {
            historyId
        }
    })
}

export function update_history(data: any) {
    return ajax({
        url: 'php/history/update.php',
        data
    })
}
