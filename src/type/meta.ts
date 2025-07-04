/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-08-02 19:27:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2024-08-04 17:30:46
 * @FilePath: \smanga\src\type\meta.ts
 */
type characterItem = {
	characterId: string;
	characterName: string;
	characterPicture: string;
	description: string;
	blob: string;
};

type metaItemType = {
	metaId: string;
	metaFile: string;
	metaName: string;
	metaContent: string;
	description: string;
	blob?: string;
	active?: boolean; // 是否为当前漫画封面
	characterId?: string; // 关联的角色ID
};

export { characterItem, metaItemType };
