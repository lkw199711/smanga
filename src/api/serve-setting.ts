import { ajax } from './index';

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
		const http = await ajax.get('serve-config');
		const response = http.data;
		return response.data;
	},

	/**
	 * @description: 设置自动扫描定时
	 * @param {string} value 字符串形式的数值 以s为单位 可以设置为*的表达式
	 * @return {*}
	 */
	async set(title: string, key: string, value: string | number | boolean | string[]) {
		const http = await ajax.put('serve-config', { key: title + '.' + key, value });
		const response = http.data;
		return response.data;
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
			data: { pem, key },
		});

		return (await res).data;
	},

	/**
	 * @description: 重置ssl证书配置
	 * @return {*}
	 */
	async reset_ssl() {
		const res = ajax({
			url: 'deploy/reset_ssl',
		});

		return (await res).data;
	},

	/**
	 * @description: 手动触发节点向 Tracker 注册
	 * - 成功: { code:0, message:'节点注册成功', data:{ nodeId, nodeName } }
	 * - 失败: { code:1, message:'<具体原因>', status:'error' }
	 * 这里不走全局 ajax 成功/失败弹窗逻辑,返回完整 response.data 交给页面自行处理展示
	 */
	async register_node_now() {
		const http = await ajax.post('p2p/node/register-now', {});
		return http.data;
	},

	/**
	 * @description: 手动触发 Tracker 间数据同步
	 */
	async trigger_tracker_sync() {
		const http = await ajax.post('p2p/tracker/sync-now', {});
		return http.data;
	},
};

export default serveSettingApi;
