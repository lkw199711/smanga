/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-08 15:48:52
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-08 15:48:53
 * @FilePath: /smanga/src/type/last-read.ts
 */
type lastReadType = {
	lastReadId: number;
	page: string;
	chapterId: string;
	mangaId: number;
	createTime: string;
	updateTime: string;
};

export {lastReadType};
