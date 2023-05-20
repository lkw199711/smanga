/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-19 23:03:54
 * @FilePath: \smanga\src\api\login.ts
 */
import { ajax } from "./index";

export function database_check(data: any) {
    return ajax({
        url: 'deploy/database-test',
        data,
    })
}

export function database_set(data: any) {
    return ajax({
        url: 'deploy/database-set',
        data,
    })
}

export function database_get() {
    return ajax({
        url: 'deploy/database-get'
    })
}