import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import {createHtmlPlugin} from 'vite-plugin-html';
import type {UserConfig} from 'vite';
// Element Plus自动导入插件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

// 定义需要手动分块的库
const nameOutHash = ['axios', 'lodash', 'element-plus', 'echarts', 'vue', 'vue-router', 'pinia', 'vue-i18n', 'vendor'];

// 路径解析函数
const pathResolve = (dir: string) => resolve(__dirname, dir);

// 定义环境变量的类型
interface EnvVariables {
  VITE_APP_PROXY_HTTP_URL?: string;
  VITE_APP_PATH?: string;
  VITE_APP_TITLE?: string;
  VITE_APP_VERSION?: string;
  VITE_ENV?: string;
  [key: string]: string | undefined;
}

// 获取环境变量并设置版本
const getEnvAndVersion = (mode: string): EnvVariables => {
  // 使用传入的mode参数加载环境变量，这是Vite推荐的方式
  const env = loadEnv(mode, process.cwd());
  return {
    ...env,
    VITE_APP_VERSION: '1.0.0', // 硬编码版本号，避免导入package.json
  } as EnvVariables;
};

// 确定输出目录
const getOutputDir = (env: EnvVariables): string => {
  // 首先检查VITE_APP_ENV，然后是VITE_ENV，最后是默认值
  const appEnv = env.VITE_APP_ENV || env.VITE_ENV || 'default';
  console.log('构建环境:', appEnv);
  switch (appEnv) {
    case 'docker':
      return 'dist/docker';
    case 'baota':
      return 'dist/baota';
    default:
      return 'dist/default';
  }
};

export default defineConfig(({mode}): UserConfig => {
  // 将mode参数传递给getEnvAndVersion函数
  const env = getEnvAndVersion(mode);
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  // 开发模式请求地址
  const devUrl = env.VITE_APP_PROXY_HTTP_URL || 'http://localhost:3000';
  // 生产环境请求地址
  const prodUrl = env.VITE_APP_PATH || '/';

  const target = isProduction ? prodUrl : devUrl;

  // 添加日志来验证环境变量是否正确加载
  console.log('Mode:', mode);
  console.log('Loaded env variables:', env);

  return {
    // 基础路径
    base: '/',
    // 输出目录
    build: {
      outDir: getOutputDir(env),
      // 开发环境使用sourcemap
      sourcemap: !isProduction,
      // 构建优化配置
      rollupOptions: {
        // 分割代码
        output: {
          // 自定义文件名格式，为特定chunk设置不带哈希值的文件名
          entryFileNames: 'assets/[name]-[hash].js',
          // 为特定chunk设置固定文件名（不带哈希值）
          chunkFileNames: chunkInfo => {
            // 对特定的chunk使用固定名称（不带哈希）
            if (nameOutHash.includes(chunkInfo.name)) {
              return `assets/${chunkInfo.name}.js`;
            }
            // 其他chunk保持默认的哈希文件名
            return 'assets/[name]-[hash].js';
          },
          // manualChunks: {},
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
            axios: ['axios'],
            lodash: ['lodash'],
          },
          // manualChunks: {
          //   // 开发环境中可以包含所有模块
          //   // 需要注意引入顺序
          //   vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          //   echarts: ['echarts', 'vue-echarts'],
          //   elementPlus: ['element-plus'],
          //   vendor: ['axios', 'lodash'],
          // },
        },
        // 生产环境使用CDN
        // external: isDevelopment ? [] : ['vue', 'vue-router', 'axios', 'lodash', 'pinia', 'vue-i18n', 'element-plus', 'echarts'],
        external: isDevelopment ? [] : ['element-plus', 'echarts'],
        // external: [],
      },
    },
    // 插件配置
    plugins: [
      vue(),
      // 自动导入Element Plus组件和API
      AutoImport({
        resolvers: [ElementPlusResolver()],
        // 自动导入的类型声明文件路径
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        // 自动导入的组件类型声明文件路径
        dts: 'src/components.d.ts',
      }),
      createHtmlPlugin({
        // 使用根目录的index.html作为模板
        template: 'index.html',
        // 传递环境变量到HTML模板中
        inject: {
          data: {
            // 直接使用从loadEnv加载的环境变量
            title: env.VITE_APP_TITLE || 'SManga',
            VITE_APP_TITLE: env.VITE_APP_TITLE || 'SManga',
            // 设置NODE_ENV，支持在HTML中使用<% if (NODE_ENV === 'production') { %>语法
            NODE_ENV: mode,
            // 添加环境信息到HTML，方便确认所在环境
            VITE_APP_ENV: env.VITE_APP_ENV || 'default',
            // 可以添加更多需要在HTML中使用的变量
            isProduction: isProduction,
            isDevelopment: isDevelopment,
            appVersion: env.VITE_APP_VERSION || '1.0.0',
            // 构建时间戳
            buildTime: new Date().toLocaleString(),
          },
        },
        // 自定义HTML压缩选项（可选）
        minify: true,
      }),
    ],
    // 开发服务器配置
    server: {
      // 端口号
      port: 8001,
      // 自动打开浏览器
      open: false,
      // 代理配置
      proxy: {
        '/cms': {
          target: target,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/cms/, ''),
        },
      },
    },
    // 别名配置
    resolve: {
      alias: {
        '@': pathResolve('./src'),
      },
    },
    // CSS配置
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "@/style/public.less";',
        },
      },
    },
    // 环境变量 - 不要覆盖process.env，让Vite正常处理环境变量
    define: {},
  };
});
