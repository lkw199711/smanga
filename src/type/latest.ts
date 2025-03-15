/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-08 15:48:52
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-04 22:04:17
 * @FilePath: /smanga/src/type/last-read.ts
 */
type latestType = {
	latestId: number;
	page: string;
	chapterId: string;
	mangaId: number;
	createTime: string;
	updateTime: string;
	mangaCover: string;
	blob: Blob;
	finish: boolean;
};

export {latestType};
