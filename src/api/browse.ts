/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:30
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-24 23:20:37
 * @FilePath: \smanga\src\api\browse.ts
 */
import {ajax} from './index';
import {global_get} from '@/utils';

/**
 * 获取章节记录
 */
export function get_chapter_images(chapterId: number) {
	return ajax({
		url: 'chapter/image',
		data: {
			chapterId: chapterId || global_get('chapterId'),
		},
	});
}
