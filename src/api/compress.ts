/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 20:49:47
 * @FilePath: \smanga\src\api\compress.ts
 */
import {ajax} from "./index";

/**
 * 获取转换记录
 * @param page
 * @param pageSize
 */
export function get_compress(page: number, pageSize: number) {
    return ajax({
        url: 'compress/get',
        data: {page, pageSize}
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
