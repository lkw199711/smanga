// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
const {VueLoaderPlugin} = require('vue-loader');
// 添加压缩插件
const CompressionPlugin = require('compression-webpack-plugin');
// 获取项目版本号
process.env.VUE_APP_VERSION = require('./package.json').version;

// 开发模式请求地址
const devUrl = process.env.VUE_APP_PROXY_HTTP_URL;
// 生产环境请求地址
const prodUrl = process.env.VUE_APP_PATH;

const isProduction = process.env.NODE_ENV === 'production';

const target = isProduction ? prodUrl : devUrl;
const wsTarget = isProduction ? 'ws://192.168.2.10' : 'ws://127.0.0.1';

// 路径
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const outputDir = output_dir();

module.exports = {
  outputDir,
  // 公共路径的配置 生产环境下,可能是子目录 要使用相对路径
  publicPath: '/',

  lintOnSave: false,
  // 优化预加载和预取策略
  chainWebpack: config => {
    // 移除默认的preload和prefetch插件
    if (config.plugins.has('preload')) {
      config.plugins.delete('preload');
    }
    if (config.plugins.has('prefetch')) {
      config.plugins.delete('prefetch');
    }

    // 配置图片压缩
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true,
        mozjpeg: {
          progressive: true,
          quality: 65,
        },
        optipng: {
          enabled: false,
        },
        pngquant: {
          quality: [0.65, 0.9],
          speed: 4,
        },
        gifsicle: {
          interlaced: false,
        },
      })
      .end();
  },
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
    devtool: isProduction ? false : 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      }),
      new VueLoaderPlugin(),
      // 生产环境下使用gzip压缩
      ...(isProduction
        ? [
            new CompressionPlugin({
              test: /\.(js|css|html|svg)$/,
              algorithm: 'gzip',
              threshold: 10240, // 大于10kb的文件才压缩
              minRatio: 0.8, // 压缩率小于0.8的才压缩
            }),
          ]
        : []),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          elementPlus: {
            name: 'chunk-elementPlus',
            priority: 20,
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          },
          vant: {
            name: 'chunk-vant',
            priority: 15,
            test: /[\\/]node_modules[\\/]vant[\\/]/,
          },
          echarts: {
            name: 'chunk-echarts',
            priority: 10,
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
          },
          vendors: {
            name: 'chunk-vendors',
            priority: 0,
            test: /[\\/]node_modules[\\/]/,
          },
        },
      },
    },
    // 使用CDN加载第三方库
    externals: isProduction
      ? {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          lodash: '_',
          pinia: 'Pinia',
          'vue-i18n': 'VueI18n',
          'element-plus': 'ElementPlus',
          echarts: 'echarts',
        }
      : {},
  },
};

function output_dir() {
  switch (process.env.VUE_ENV) {
    case 'docker':
      return './dist/docker';
    case 'baota':
      return './dist/baota';
    default:
      return './dist/default';
  }
}
