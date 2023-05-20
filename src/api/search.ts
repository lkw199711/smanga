/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-04-04 00:30:31
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-16 21:22:10
 * @FilePath: \smanga\src\api\search.ts
 */
import {ajax} from './index';

export function search(
	searchText: string,
	searchType: string,
	page: number,
	pageSize: number,
	order = ''
) {
	return ajax({
		url: 'php/laravel/public/index.php/search/get',
		data: {searchText, searchType, page, pageSize, order},
	});
}
