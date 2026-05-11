type mediaType = {
	mediaId: number;
	mediaName: string;
	author: string;
	mediaType: number;
	mediaCover: string;
	mediaCoverLink: string;
	createTime: string;
	updateTime: string;
	describe: string;
	directoryFormat: number;
	sourceWebsite?: string;
	isCloudMedia: number;
	mangaCount?: number;
};

const mediaInit: mediaType = {
	mediaId: 0,
	mediaName: '',
	author: '',
	mediaType: 0,
	mediaCover: '',
	mediaCoverLink: '',
	createTime: '',
	updateTime: '',
	describe: '',
	directoryFormat: 0,
	sourceWebsite: '',
	isCloudMedia: 0,
};

export { mediaType, mediaInit };
