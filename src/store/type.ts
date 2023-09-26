/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-23 20:00:38
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-26 05:38:28
 * @FilePath: /smanga/src/store/type.ts
 */
export interface GlobalData {
	bookmarkList: any[];
	chapterList: any[];
	imgPathList: string[];
	chapterIndex: number;
	chapterId: number;
	chapterName: string;
	chapterPath: string;
	chapterType: string;
	browseType: string;
	chapterCover: string;
	mediaId: number;
	mangaId: number;
	mangaName: string;
	mangaCover: string;
	page: number;
	doublePage: number;
	pageImage: string;
	direction: string;
	removeFirst: string;
	userConfig: any;
	pageSizeConfig: any;
}
