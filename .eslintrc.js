/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-13 15:01:33
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-13 20:26:35
 * @FilePath: /smanga/.eslintrc.js
 */
module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-self-assign': 'off',
		'no-redeclare': 'off',
		// 表达式
		'no-unused-expressions': 'off',
		'@typescript-eslint/no-unused-expressions': ['off'],
		// 未变量使用变量
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['off'],
		// 允许any
		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		// 允许空方法
		'@typescript-eslint/no-empty-function': ['off'],
		'eslint-disable-next-line': 0,
		'@typescript-eslint/ban-ts-comment': 0,
		'@typescript-eslint/no-var-requires': 0,
		'noImplicitThis': 0,
	},
};
