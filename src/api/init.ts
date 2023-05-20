/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-03 11:35:53
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-20 11:15:14
 * @FilePath: \smanga\src\api\init.ts
 */
import {ajax} from './index';

export function system_init() {
	return ajax({
		url: 'php/laravel/public/index.php/deploy/database-init',
	});
}
