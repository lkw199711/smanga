import Axios from 'axios';
import {url} from '@/api';
import {Cookies} from '@/utils';
import useImageStore from '@/store/image';
import {ajax} from '@/api';

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

// 使用import代替require
import placeholder from '@/assets/s-blue-high.png';
const imageCache: any = useImageStore();
const imageApi = {
	/**
	 * @description: 获取图片文件 blob
	 * @param {string} file
	 * @return {*}
	 */
	async get({
		file,
		saveCache = true,
		again = true,
	}: {
		file: string;
		saveCache?: boolean;
		again?: boolean;
	}): Promise<any> {
		if (!file) return false;

		// 存在缓存直接加载缓存图片
		if (imageCache[file]) return imageCache[file];

		const [res, err] = await img({data: {file}})
			.then((res) => [res, null])
			.catch((err) => [null, err]);

		if (res) {
			// 存入缓存
			if (saveCache) {
				imageCache[file] = res.data;
			}
			// 返回图片
			return res.data;
		}

		if (err) {
			// 有错误 则再次且仅一次请求
			if (again) {
				return this.get({file, saveCache, again: false});
			}

			// 返回占位图
			return placeholder;
		}
	},

	async get_from({file, origin, again = true}: any): Promise<any> {
		if (!file) return false;

		// 存在缓存直接加载缓存图片
		if (imageCache[file]) return imageCache[file];

		const [res, err] = await img({
			url: `${origin}/file`,
			data: {file},
			method: 'get',
			params: {file},
		})
			.then((res) => [res, null])
			.catch((err) => [null, err]);

		if (res) {
			// 存入缓存
			imageCache[file] = res.data;
			// 返回图片
			return res.data;
		}

		if (err) {
			// 有错误 则再次且仅一次请求
			if (again) {
				return this.get_from({file, origin, again: false});
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

	/**
	 * 上传漫画封面
	 * @param file 图片文件
	 * @returns 上传后的文件路径
	 */
	async upload({
		file,
		chapterId = '',
		mangaId = '',
		mediaId = '',
	}: {
		file: File;
		chapterId?: string;
		mangaId?: string;
		mediaId?: string;
	}) {
		const formData = new FormData();
		formData.append('image', file);
		formData.append('chapterId', chapterId);
		formData.append('mangaId', mangaId);
		formData.append('mediaId', mediaId);

		const res = ajax({
			url: 'image/upload',
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return (await res).data?.data?.filePath || '';
	},
};

export default imageApi;
