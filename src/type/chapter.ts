import { latestType } from './latest';
type chapterType = {
	browseType: string;
	chapterCover: string;
	chapterId: number;
	chapterName: string;
	chapterPath: string;
	chapterType: string;
	createTime: string;
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