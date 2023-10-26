/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-24 23:02:25
 * @FilePath: \smanga\src\api\account.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {ajax} from './index';

const userApi = {
	async register(data: any) {
		const res = ajax({
			url: 'user/register',
			data,
		});

		return (await res).data;
	},

	async get_account(page: number, pageSize: number) {
		const res = ajax({
			url: 'user/get',
			data: {page, pageSize},
		});

		return (await res).data;
	},

	async delete_account(targetUserId: number) {
		const res = ajax({
			url: 'user/delete',
			data: {
				targetUserId,
			},
		});

		return (await res).data;
	},

	async update_account(data: any) {
		const res = ajax({
			url: 'user/update',
			data,
		});

		return (await res).data;
	},

	async login(data: any) {
		const res = ajax({
			url: 'user/login',
			data,
		});

		return (await res).data;
	},

	async get_user_config() {
		const res = ajax({
			url: 'user/config/get',
		});

		return (await res).data;
	},

	async set_user_config(userName: string, configValue: string) {
		const res = ajax({
			url: 'user/config/set',
			data: {userName, configValue},
		});

		return (await res).data;
	},
};

export default userApi;
