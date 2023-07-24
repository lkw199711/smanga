/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-16 03:18:23
 * @FilePath: \smanga\src\api\compress.ts
 */
import {ajax} from "./index";

/**
 * 获取转换记录
 * @param recordStart
 * @param pageSize
 */
export function get_compress(recordStart: number, pageSize: number) {
    return ajax({
        url: 'compress/get',
        data: {recordStart, pageSize}
    })
}

export function delete_compress(compressId: number) {
    return ajax({
        url: 'compress/delete',
        data: {
            compressId
        }
    })
}
