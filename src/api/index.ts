import Axios from 'axios';
import {ElMessage} from 'element-plus';
import {Cookies} from '@/utils';
import router from '@/router';
import Response from '@/type/response';

const prodUrl = process.env.VUE_APP_PATH || '/php/public/index.php/';

// 接口路径的设置
// const url = (process.env.NODE_ENV === 'development' ? '/cms' : '') + prodUrl;
const url = prodUrl;

/**
 * 创建默认接口请求设置
 * 传参接收使用json
 * 默认传参 userid 时间戳 密钥
 * @type {Axios}
 */
const ajax = Axios.create({
	baseURL: url,
	timeout: 10 * 1000,
	params: {},
	headers: {
		'Content-Type': 'application/json; charset=UTF-8',
	},
	transformRequest: [
		(data, headers) => {
			// 设置请求头
			headers['token'] =
				localStorage.getItem('token') || 'ae3a90e4-cb48-4b3a-8860-56e2fd65b390';
			// 用户标识
			const userId = Cookies.get('userId');
			// 获取时间戳
			const timestamp = new Date().getTime();
			// 初始化传参
			data = data || {};
			// 加入时间戳与密钥
			data = Object.assign(data, {
				userId,
				timestamp,
			});

			// 删除多余参数
			if (data.data && data.data.createTime) {
				delete data.data.createTime;
			}
			if (data.data && data.data.updateTime) {
				delete data.data.updateTime;
			}

			// 返回json
			return JSON.stringify(data);
		},
	],
	transformResponse: [
		function (response: Response) {
			response = response || {};

			if (typeof response === 'string') response = JSON.parse(response);

			if (response.message) {
				let type: string;
				switch (response.code) {
					case 0:
						type = 'success';
						break;
					case 1:
						type = 'error';
						break;
					case 2:
						type = 'warning';
						break;
					default:
						type = 'info';
						break;
				}

				ElMessage({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.message,
					type: type,
				});
			}

			// 初次部署
			if (response.data === 'first deploy') {
				router.push('/init');
			}

			// 登录信息错误
			if (response.data === 'user error') {
				router.push('/login');
			}

			// 处理时间格式
			if (response.list) {
				response.list.forEach((item: any) => {
					if (item.createTime) {
						item.createTime = new Date(item.createTime).toLocaleString();
					}

					if (item.updateTime) {
						item.updateTime = new Date(item.updateTime).toLocaleString();
					}
				});
			}

			return response;
		},
	],
});

/**
 * 将加载到的list进行排序
 * @param arr
 */
function array_sort(arr: any[]) {
	arr.sort((a: any, b: any) => {
		const valueA: any = a.match(/\d+(?=\b)/);
		const valueB: any = b.match(/\d+(?=\b)/);

		return valueA - valueB;
	});
}

/**
 * 将加载到的list进行排序
 * @param arr
 */
function array_sort_name(arr: any[]) {
	arr.sort((a: any, b: any) => {
		const valueA: any = a.name.match(/\d+(?=\b)/);
		const valueB: any = b.name.match(/\d+(?=\b)/);

		return valueA - valueB;
	});
}

export {ajax, url, array_sort, array_sort_name};
