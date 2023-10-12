/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-23 21:05:36
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-24 00:39:15
 * @FilePath: /smanga/src/store/page-size.ts
 */
import { reactive } from 'vue';

export const mangaPageSize = reactive({
	mini: [9, 12, 15, 18, 21],
	small: [12, 18, 32, 38, 44],
	tablet: [20, 25, 30, 35, 40],
	middle: [12, 18, 24, 30, 36],
	large: [27, 36, 45, 54, 63],
	'2k': [48, 50, 62, 74, 86],
	'4k': [48, 50, 62, 74, 86],
});

export const chapterPageSize = reactive({
	mini: [12, 20, 24, 28, 32],
	small: [20, 24, 28, 32, 36],
	tablet: [30, 36, 42, 48, 54],
	middle: [10, 20, 30, 40, 50],
	large: [27, 24, 32, 40, 48],
	'2k': [44, 48, 50, 62, 74],
	'4k': [44, 48, 50, 62, 74],
});
