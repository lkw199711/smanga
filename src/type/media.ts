/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-08 15:38:53
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-03-04 03:31:34
 * @FilePath: /smanga/src/type/media.ts
 */
type mediaType = {
	mediaId: number;
	mediaName: string;
	author: string;
	mediaType: number;
	createTime: string;
	updateTime: string;
	describe: string;
	directoryFormat: number;
};

export {mediaType};
