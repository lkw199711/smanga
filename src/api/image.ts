/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 03:30:05
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-03-14 16:26:11
 * @FilePath: /smanga/src/api/image.ts
 */
import Axios from 'axios';
import {url} from '@/api';
import { Cookies } from '@/utils';
import usePosterStore from '@/store/poster';

/**
 * 文件 图片请求
 * @type {Axios}
 */
const img = Axios.create({
	baseURL: url + '/image',
	timeout: 15 * 1000,
	method: 'post',
	responseType: 'blob', // 设置接收格式为blob格式
	params: {},
	headers: {
		'Content-Type': 'application/json; charset=UTF-8',
	},
	transformRequest: [
		(data, headers) => {
			// 设置请求头
			headers['token'] = Cookies.get('token');
			// 获取时间戳
			const timestamp = new Date().getTime();
			// 初始化传参
			data = data || {};
			// 加入时间戳与密钥
			data = Object.assign(data, {
				timestamp,
			});
			// 返回json
			return JSON.stringify(data);
		},
	],
	transformResponse: [
		function (data) {
			data = data || {};

			return URL.createObjectURL(data);
		},
	],
});

const placeholder = require('@/assets/s-blue.png');
const poster: any = usePosterStore();
const imageApi = {
	/**
	 * @description: 获取图片文件 blob
	 * @param {string} file
	 * @return {*}
	 */
	async get(file: string, again = true): Promise<any> {
		if (!file) return false;

		// 存在缓存直接加载缓存图片
		if (poster[file]) return poster[file];

		const [res, err] = await img({data: {file}})
			.then((res) => [res, null])
			.catch((err) => [null, err]);

		if (res) {			
			// 存入缓存
			poster[file] = res.data;
			// 返回图片
			return res.data
		};
		
		if (err) {
			// 有错误 则再次且仅一次请求
			if (again) {
				return this.get(file, false);
			}

			// 返回占位图
			return placeholder;
		}
	},

	async chapter_img(
		file: string,
		page: number,
		chapterId: number,
		mangaId: number
	) {
		if (!file) return false;
		const res = await img({data: {file, page, chapterId, mangaId}});
		return res.data;
	},
};

export default imageApi;
