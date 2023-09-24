/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-14 03:35:03
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-23 23:54:10
 * @FilePath: /smanga/src/type/store.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
type pageSizeConfigType = {
	mini: number[];
	small: number[];
	tablet: number[];
	middle: number[];
	large: number[];
	'2k': number[];
	'4k': number[];
};

enum screenType {
	mini = 'mini',
	small = 'small',
	tablet = 'tablet',
	middle = 'middle',
	large = 'large',
	'2k' = '2k',
	'4k' = '4k',
}

export {pageSizeConfigType, screenType};
