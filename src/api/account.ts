/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 20:57:09
 * @FilePath: \smanga\src\api\account.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';

export function register(data: any) {
	return ajax({
		url: 'user/register',
		data,
	});
}

export function get_account(page: number, pageSize: number) {
	return ajax({
		url: 'user/get',
		data: {page, pageSize},
	});
}

export function delete_account(targetUserId: number) {
	return ajax({
		url: 'user/delete',
		data: {
			targetUserId,
		},
	});
}

export function update_account(data: any) {
	return ajax({
		url: 'user/update',
		data,
	});
}

export function login(data: any) {
	return ajax({
		url: 'user/login',
		data,
	});
}

export function get_user_config() {
    return ajax({
		url: 'user/config/get',
	});
}

export function set_user_config(userName: string, configValue: string) {
	return ajax({
		url: 'user/config/set',
		data: {userName, configValue},
	});
}
