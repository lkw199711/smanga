import {ajax} from "./index";

/**
 * 获取转换记录
 * @param recordStart
 * @param pageSize
 */
export function get_compress(recordStart: number, pageSize: number) {
    return ajax({
        url: 'php/compress/get.php',
        data: {recordStart, pageSize}
    })
}

export function delete_compress(compressId: number) {
    return ajax({
        url: 'php/compress/delete.php',
        data: {
            compressId
        }
    })
}
