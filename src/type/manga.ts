/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 20:57:42
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-08-17 00:56:13
 * @FilePath: /smanga/src/type/manga.ts
 */
type mangaInfoType = {
	mangaId?: number;
	mangaName: string;
	author: string;
	browseType?: string;
	publishDate: string;
	createTime: string;
	updateTime: string;
	describe: string;
	star?: string;
	chapterCount: number;
};

export {mangaInfoType};
