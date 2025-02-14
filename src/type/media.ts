/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-08 15:38:53
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-02-15 01:21:19
 * @FilePath: /smanga/src/type/media.ts
 */
type mediaType = {
	mediaId: number;
	mediaName: string;
	author: string;
	mediaType: number;
	mediaCover: string;
	mediaCoverLink: string;
	createTime: string;
	updateTime: string;
	describe: string;
	directoryFormat: number;
};

export {mediaType};
