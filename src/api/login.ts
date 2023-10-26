/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 20:19:31
 * @FilePath: \smanga\src\api\login.ts
 */
import {ajax} from './index';

const loginApi = {
	async system_init(userName: string, passWord: string) {
		const res = ajax({
			timeout: 3 * 60 * 1000,
			url: 'deploy/database-init',
			data: {userName, passWord},
		});

		return (await res).data;
	},

	/**
	 * @description: 检查数据库连接
	 * @param {any} data
	 * @return {*}
	 */
	async database_check(data: any) {
		const res= ajax({
			url: 'deploy/database-test',
			data,
        });
        
        return (await res).data;
	},

	/**
	 * @description: 设置数据库连接
	 * @param {any} data
	 * @return {*}
	 */
	async database_set(data: any) {
		const res = ajax({
			url: 'deploy/database-set',
			data,
        });
        
        return (await res).data;
	},

	/**
	 * @description: 获取数据库连接信息
	 * @return {*}
	 */
	async database_get() {
		const res = ajax({
			url: 'deploy/database-get',
        });
        
        return (await res).data;
	},
};

export default loginApi;
