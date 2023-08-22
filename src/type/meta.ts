type characterItem = {
	characterId: string;
	characterName: string;
	characterPicture: string;
	description: string;
	blob: string;
};

type metaItemType = {
	metaFile: string;
	metaType: string;
	blob?: string;
};

export {characterItem, metaItemType};
