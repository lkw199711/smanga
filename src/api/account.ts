/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-14 20:03:04
 * @FilePath: \smanga\src\api\account.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';

export function register(data: any) {
	return ajax({
		url: 'php/laravel/public/index.php/user/register',
		data,
	});
}

export function get_account(recordStart: number, pageSize: number) {
	return ajax({
		url: 'php/laravel/public/index.php/user/get',
		data: {recordStart, pageSize},
	});
}

export function delete_account(targetUserId: number) {
	return ajax({
		url: 'php/laravel/public/index.php/user/delete',
		data: {
			targetUserId,
		},
	});
}

export function update_account(data: any) {
	return ajax({
		url: 'php/laravel/public/index.php/user/update',
		data,
	});
}

export function login(data: any) {
	return ajax({
		url: 'php/laravel/public/index.php/user/login',
		data,
	});
}

export function get_user_config() {
    return ajax({
		url: 'php/laravel/public/index.php/user/config/get',
	});
}

export function set_user_config(userName: string, configValue: string) {
	return ajax({
		url: 'php/laravel/public/index.php/user/config/set',
		data: {userName, configValue},
	});
}
