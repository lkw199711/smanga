import { latestInit, latestType } from './latest';
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
	isCollected?: boolean;
	latest: latestType;
	chapter: any;
	pageImage: string;
};

const chapterInit: chapterType = {
	browseType: '',
	chapterCover: '',
	chapterId: 0,
	chapterName: '',
	chapterNumber: 0,
	chapterPath: '',
	chapterType: '',
	createTime: '',
	pageCount: 0,
	mangaId: 0,
	mediaId: 0,
	pathId: 0,
	picNum: 0,
	updateTime: '',
	page: 0,
	latest: latestInit,
	chapter: {},
	pageImage: '',
};

export { chapterType, chapterInit };
