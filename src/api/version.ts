/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-16 01:22:01
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-16 01:24:55
 * @FilePath: \smanga\src\api\version.ts
 */
import {ajax} from './index';

export function get_version() {
	return ajax({
		url: 'version/get',
	});
}