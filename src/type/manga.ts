import { mediaType } from "./media";
import { metaItemType } from "./meta";
import { tagItemType } from "./tag";

/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 20:57:42
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-04 17:44:07
 * @FilePath: /smanga/src/type/manga.ts
 */
type mangaInfoType = {
	mediaId: number;
	mangaId?: number;
	mangaName: string;
	title?: string;
	author: string;
	browseType?: string;
	publishDate: string;
	createTime: string;
	updateTime: string;
	describe: string;
	star?: string;
	chapterCount: number;
	parentPath?: string;
	mangaCover: string;
	metas?: metaItemType[];
	tags?: tagItemType[];
	media?: mediaType;
};

export {mangaInfoType};
