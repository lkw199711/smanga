/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-23 23:57:36
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-23 23:57:37
 * @FilePath: /smanga/src/store/top-layout.ts
 */
export default {
	list: {
		'4k': ['search', 'view', 'sort', 'theme', 'language'],
		'2k': ['search', 'view', 'sort', 'theme', 'language'],
		large: ['search', 'view', 'sort', 'theme', 'language'],
		middle: ['miniSearch', 'view', 'sort', 'theme', 'language'],
		tablet: ['miniSearch', 'view', 'sort'],
		small: ['miniSearch', 'view', 'sort'],
		mini: ['miniSearch', 'view', 'sort'],
	},
	setting: {
		'4k': ['search', 'view', 'sort', 'theme', 'language'],
		'2k': ['search', 'view', 'sort', 'theme', 'language'],
		large: ['search', 'view', 'sort', 'theme', 'language'],
		middle: ['miniSearch', 'view', 'sort', 'theme', 'language'],
		tablet: ['miniSearch', 'theme', 'language'],
		small: ['miniSearch', 'theme', 'language'],
		mini: ['theme', 'language'],
	},
	browse: {
		'4k': ['search', 'view', 'sort', 'theme', 'language'],
		'2k': ['search', 'view', 'sort', 'theme', 'language'],
		large: ['search', 'view', 'sort', 'theme', 'language'],
		middle: ['search', 'theme', 'language'],
		tablet: ['search', 'theme', 'language'],
		small: ['search'],
		mini: ['search'],
	},
	search: {
		'4k': ['view', 'sort', 'theme', 'language'],
		'2k': ['view', 'sort', 'theme', 'language'],
		large: ['view', 'sort', 'theme', 'language'],
		middle: ['view', 'sort', 'theme', 'language'],
		tablet: ['view', 'sort'],
		small: ['view', 'sort'],
		mini: ['view', 'sort'],
	},
	searchOnly: {
		'4k': ['search', 'view', 'sort', 'theme', 'language'],
		'2k': ['search', 'view', 'sort', 'theme', 'language'],
		large: ['search', 'view', 'sort', 'theme', 'language'],
		middle: ['search'],
		tablet: ['search'],
		small: ['search'],
		mini: ['search'],
	},
	default: {
		'4k': ['search', 'view', 'sort', 'theme', 'language'],
		'2k': ['search', 'view', 'sort', 'theme', 'language'],
		large: ['search', 'view', 'sort', 'theme', 'language'],
		middle: ['miniSearch', 'view', 'sort', 'theme', 'language'],
		tablet: ['miniSearch', 'theme', 'language'],
		small: ['miniSearch', 'theme', 'language'],
		mini: ['miniSearch', 'view', 'sort'],
	},
	/*
	'4k': {},
	'2k': {},
	large: {},
	middle: {},
	small: {},
	default: [],
    */
};