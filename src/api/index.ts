import Axios from 'axios';
import Qs from 'qs';
import store from '../store';
import {Md5} from 'ts-md5/dist/md5';
import {ElMessage} from 'element-plus';
import {Cookies} from '@/utils';
import router from '@/router';

const prodUrl = process.env.VUE_APP_PATH || '/php/public/index.php/';

// 接口路径的设置
const url = '/cms' + prodUrl;

/**
 * 创建默认接口请求设置
 * 传参接收使用json
 * 默认传参 userid 时间戳 密钥
 * @type {Axios}
 */
const ajax = Axios.create({
	baseURL: url,
	timeout: 10 * 1000,
	method: 'post',
	params: {},
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	},
	transformRequest: [
		(data) => {
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
				keyword: get_key_word(timestamp),
			});
			// 返回json
			return Qs.stringify(data);
		},
	],
	transformResponse: [
		function (data) {
			data = data || {};

			if (typeof data === 'string') data = JSON.parse(data);

			if (data.message) {
				let type: string;
				switch (data.code) {
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
					message: data.message,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					type: type,
				});
			}

			// 初次部署
			if (data.state === 'first deploy') {
				router.push('/init');
			}

			// 登录信息错误
			if (data.state === 'user error') {
				router.push('/login');
			}

			return data;
		},
	],
});

/**
 * 生成密钥
 * 时间戳 + 密文,经过md5加密后形成
 * @param time 时间戳 以毫秒为单位
 * @returns {*}
 */
function get_key_word(time: number) {
	// 密钥文本使用数组拆分
	const keyArr = ['s', 'u', 'n', 'l', 'i', 'g', 'h', 't'];
	const tailArr = ['-', 'm', 'a', 'n', 'g', 'a'];

	// 合并密钥文本与时间戳,使用md5加密
	// 返回密钥
	return Md5.hashStr(time + keyArr.join('') + tailArr.join(''));
}

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
