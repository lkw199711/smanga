/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-08-26 02:33:27
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-12-03 16:12:52
 * @FilePath: /smanga/src/api/serve-setting.ts
 */
import {ajax} from './index';

/**
 * @description: 服务器设置
 * @return {*}
 */
const serveSettingApi = {
	/**
	 * @description: 获取服务器配置
	 * 目前仅有两项 自动扫描定时 自动解压开关
	 * @return {*}
	 */
	async get() {
		const res = ajax({
			url: 'serve/get',
		});

		return (await res).data.request;
	},

	/**
	 * @description: 设置自动扫描定时
	 * @param {string} value 字符串形式的数值 以s为单位 可以设置为*的表达式
	 * @return {*}
	 */
	async set(title: string, key: string, value: string | number) {
		const res = ajax({
			url: 'serve/set',
			data: {title, key, value},
		});

		return (await res).data;
	},

	/**
	 * @description: 设置ssl证书
	 * @param {string} pem
	 * @param {string} key
	 * @return {*}
	 */
	async set_ssl(pem: string, key: string) {
		const res = ajax({
			url: 'deploy/set_ssl',
			data: {pem, key},
		});

		return (await res).data;
	},

	/**
	 * @description: 重置ssl证书配置
	 * @return {*}
	 */
	async reset_ssl() {
		const res = ajax({
			url: 'deploy/reset_ssl'
		});

		return (await res).data;
	},
};

export default serveSettingApi;
