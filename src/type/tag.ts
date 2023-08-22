/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 21:00:31
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-08-16 21:00:32
 * @FilePath: /smanga/src/type/tag.ts
 *
 */
type tagParams = {
	tagId?: number;
	tagName: string;
	tagColor: string;
	description: string;
};

type tagItemType = {
	tagId: number;
	mangaTagId: number;
	tagName: string;
	tagColor: string;
	description: string;
	checked: boolean;
};

export {tagParams, tagItemType};
