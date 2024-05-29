// eslint-disable-next-line @typescript-eslint/no-var-requires
// 获取项目版本号
process.env.VUE_APP_VERSION = require('./package.json').version;

// 开发模式请求地址
const devUrl = process.env.VUE_APP_PROXY_HTTP_URL;
// 生产环境请求地址
const prodUrl = 'http://127.0.0.1';

// const target = process.env.NODE_ENV === 'development' ? devUrl : prodUrl;
const target = process.env.NODE_ENV === 'development' ? prodUrl : prodUrl;
const wsTarget =
	process.env.NODE_ENV === 'production'
		? 'ws://192.168.2.10'
		: 'ws://127.0.0.1';

// 路径
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const outputDir = output_dir();

module.exports = {
	outputDir,
	// 公共路径的配置 生产环境下,可能是子目录 要使用相对路径
	publicPath: process.env.NODE_ENV === 'development' ? '/' : './',

	lintOnSave: false,
	// 开发环境代理
	devServer: {
		// 开放公网
		open: true,
		// 初始页面
		// openPage: '#/about',
		// 不知道
		hot: true,
		// 端口号
		port: 8001,
		// 请求报错不展示在页面上
		client: {
			overlay: false,
		},
		// 主机
		// host: '0.0.0.0',
		proxy: {
			//配置代理
			'/cms': {
				target: target,
				changeOrigin: true,
				ws: true,
				pathRewrite: {
					'^/cms': '',
				},
			},
		},
	},
	/**
	 * 配置less的相对路径
	 * less相对路径不用配置
	 * 直接@import '~@...'就可以使用
	 */
	// 插件
	pluginOptions: {
		// 为less 配置全局变量，不用每个vue都引入
		'style-resources-loader': {
			preProcessor: 'less',
			patterns: [path.resolve(__dirname, './src/style/public.less')],
		},
	},
	// android应用安装
	pwa: {
		//图标设置
		iconPaths: {
			favicon32: 'favicon.ico',
			favicon16: 'favicon.ico',
			appleTouchIcon: 'favicon.ico',
			maskIcon: 'favicon.ico',
			msTileImage: 'favicon.ico',
		},
	},
	configureWebpack: {
		devtool: 'source-map',
	},
};

function output_dir() {
	switch (process.env.NODE_ENV) {
		case 'docker':
			return './dist/docker';
		case 'baota':
			return './dist/baota';
		default:
			return './dist/default';
	}
}
