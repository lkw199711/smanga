type latestType = {
	latestId: number;
	page: string;
	chapterId: string;
	mangaId: number;
	createTime: string;
	updateTime: string;
	mangaCover: string;
	blob: Blob;
	finish: boolean;
};

const latestInit: latestType = {
	latestId: 0,
	page: '',
	chapterId: '',
	mangaId: 0,
	createTime: '',
	updateTime: '',
	mangaCover: '',
	blob: new Blob(),
	finish: false,
};


export {latestType, latestInit};
