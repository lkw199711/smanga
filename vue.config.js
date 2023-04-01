// eslint-disable-next-line @typescript-eslint/no-var-requires
// 获取项目版本号
process.env.VUE_APP_VERSION = require('./package.json').version;

const pxtorem = require('postcss-pxtorem');
// 网络路径
const network = 'http://192.168.5.8';
// 本地路径
const localhost = 'http://127.0.0.1';

const target = process.env.NODE_ENV === 'production' ? localhost : network;

// 路径
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
    // 公共路径的配置 生产环境下,可能是子目录 要使用相对路径
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',

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
        // 主机
        // host: '0.0.0.0',
        proxy: {//配置代理
            '/cms': {
                target: target,
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/cms': ''
                }
            }
        }
    },
    // css配置项
    css: {
        // posttocss配置
        loaderOptions: {
            postcss: {
                plugins: [
                    // 各浏览器前缀
                    // autoprefixer(),
                    // px单位转换
                    pxtorem({
                        'postcss-import': {},
                        'postcss-url': {},
                        autoprefixer: {
                            // 筛选浏览器
                            browsers: ['Android >= 4.0', 'iOS >= 8'],
                        },
                        // 根元素,1rem的大小
                        rootValue: 10,
                        // 哪些需要进行px转rem
                        propList: ['*'],
                        // 排除哪些开头的如 .weui-button 等等
                        // 该项仅在使用 Circle 组件时需要
                        // 原因参见 https://github.com/youzan/vant/issues/1948
                        // 不想转换的单位针对类名增加尾缀-nopost
                        selectorBlackList: ['posted'],
                        // 最小转换，如低于 4px的不会进行转成rem
                        minPixelValue: 4,
                        // re单位的小数位数上限
                        unitPrecision: 10,
                        exclude: /node_modules|folder_name/i
                    })
                ]
            }
        }
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
            patterns: [
                path.resolve(__dirname, './src/style/public.less'),
            ],
        }
    },
    // android应用安装
    pwa: {//图标设置
        iconPaths: {
            favicon32: 'favicon.ico',
            favicon16: 'favicon.ico',
            appleTouchIcon: 'favicon.ico',
            maskIcon: 'favicon.ico',
            msTileImage: 'favicon.ico'
        }
    },
};

