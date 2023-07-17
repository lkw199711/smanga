/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-06-13 21:23:19
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-06-13 21:24:39
 * @FilePath: \smanga\src\api\log.ts
 */
import {ajax} from './index';

export function get_log(page: number, pageSize = 10) {
	return ajax({
		url: 'log/get',
		data: {page, pageSize},
	});
}
