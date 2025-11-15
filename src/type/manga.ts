import { mediaInit, mediaType } from "./media";
import { metaItemType } from "./meta";
import { tagItemType } from "./tag";

type mangaType = {
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

const mangaInit: mangaType = {
	mediaId: 0,
	mangaId: 0,
	mangaName: '',
	title: '',
	author: '',
	browseType: '',
	publishDate: '',
	createTime: '',
	updateTime: '',
	describe: '',
	star: '',
	chapterCount: 0,
	parentPath: '',
	mangaCover: '',
	metas: [],
	tags: [],
	media: mediaInit,
};


export {mangaType, mangaInit};
