// 项目发布阶段需要用到的 babel 插件
const isProduction = process.env.NODE_ENV === 'production';
const prodPlugins = [];
// 仅移除console，在所有非开发环境都应用
if (isProduction) {
	prodPlugins.push('transform-remove-console');
}

module.exports = {
	presets: ['@vue/cli-plugin-babel/preset'],
	plugins: [
		// 移除错误的element-ui配置，因为项目使用的是element-plus
		// 且已经在main.ts中手动进行了按需导入
		// 发布产品时候的插件数组
		...prodPlugins,
	],
};
