/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 20:57:31
 * @FilePath: \smanga\src\api\media.ts
 */
import {ajax} from "./index";

/**
 * 获取媒体记录
 */
export function get_media(page: number, pageSize: number) {
    return ajax({
        url: 'media/get',
        data: {page, pageSize}
    })
}

/**
 * 修改媒体库
 * @param data
 */
export function update_media(data: any) {
    return ajax({
        url: 'media/update',
        data
    })
}

/**
 * 新增媒体库
 * @param data
 */
export function add_media(data: any) {
    return ajax({
        url: 'media/add',
        data
    })
}

/**
 * 获取路径记录
 * @param mediaId
 * @param page
 * @param pageSize
 */
export function get_path(mediaId: any, page: number | undefined = undefined, pageSize: number | undefined = undefined) {
    return ajax({
        url: 'path/get',
        data: {mediaId,page,pageSize}
    })
}

/**
 * 删除路径
 * @param pathId
 */
export function delete_path(pathId: any) {
    return ajax({
        url: 'path/delete',
        data: {pathId}
    })
}

/**
 * 删除媒体库
 * @param mediaId
 */
export function delete_media(mediaId: any) {
    return ajax({
        url: 'media/delete',
        data: {mediaId}
    })
}

