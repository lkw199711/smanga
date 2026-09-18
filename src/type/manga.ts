import { mediaInit, mediaType } from "./media";
import { metaType } from "./meta";
import { tagItemType } from "./tag";

type mangaType = {
	mediaId: number;
	mangaId?: number;
	mangaName: string;
	title?: string;
	author: string;
	browseType?: string;
	direction?: number;
	removeFirst?: number;
	publishDate: string;
	createTime: string;
	updateTime: string;
	describe: string;
	star?: string;
	chapterCount: number;
	isCollected?: boolean;
	parentPath?: string;
	mangaCover: string;
	mangaPath?: string;
	metas?: metaType[];
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
	direction: 1,
	removeFirst: 0,
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
