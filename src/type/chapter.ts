import { latestType } from './latest';
type chapterType = {
	browseType: string;
	chapterCover: string;
	chapterId: number;
	chapterName: string;
	chapterNumber: number;
	chapterPath: string;
	chapterType: string;
	createTime: string;
	pageCount: number;
	mangaId: number;
	mediaId: number;
	pathId: number;
	picNum: number;
	updateTime: string;
	page?: number;
	latest: latestType;
	chapter: any;
};

export { chapterType };