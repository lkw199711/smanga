/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-24 00:57:01
 * @FilePath: \smanga\src\api\path.ts
 */
import {ajax} from './index';

const pathApi = {
	/**
	 * 获取路径记录
	 * @param mediaId
	 * @param page
	 * @param pageSize
	 */
	async get_path(mediaId: number, page: number, pageSize: number) {
		const res = ajax({
			url: 'path/get',
			data: {mediaId, page, pageSize},
		});

		return (await res).data;
	},

	/**
	 * 扫描路径
	 * @param mediaId
	 * @param path
	 * @param pathId
	 */
	async rescan_path(mediaId: any, path: any, pathId: any) {
		const res = ajax({
			url: 'path/rescan',
			data: {mediaId, path, pathId},
		});

		return (await res).data;
	},

	/**
	 * 扫描路径
	 * @param mediaId
	 * @param path
	 * @param pathId
	 */
	async scan_path(mediaId: any, path: any, pathId: any) {
		const res = ajax({
			url: 'path/scan',
			data: {mediaId, path, pathId},
		});

		return (await res).data;
	},

	/**
	 * 删除路径
	 * @param pathId
	 */
	async delete_path(pathId: any) {
		const res = ajax({
			url: 'path/delete',
			data: {pathId},
		});

		return (await res).data;
	},

	/**
	 * 新增路径
	 * @param mediaId
	 * @param path
	 */
	async add_path(mediaId: any, pathForm: any) {
		const res = ajax({
			url: 'path/add',
			data: Object.assign({mediaId}, pathForm),
		});

		return (await res).data;
	},
	/**
	 * 删除媒体库
	 * @param mediaId
	 */
	async delete_media(mediaId: any) {
		const res = ajax({
			url: 'php/media/delete.php',
			data: {mediaId},
		});

		return (await res).data;
	},
};

export default pathApi;
