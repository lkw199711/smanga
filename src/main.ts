/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 15:09:40
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-24 20:47:35
 * @FilePath: /smanga/src/main.ts
 */
import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './interface';
import i18n from '@/i18n';

import ElementPlus from 'element-plus';
import {List} from 'vant';
import {PullRefresh} from 'vant';
import 'reset-css';
import 'element-plus/theme-chalk/index.css';
import './style/public.less';
import './assets/icon/iconfont.css';
import './assets/colour/iconfont.css';
import './assets/colour/iconfont.js';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'vant/lib/index.css';

import PerfectScrollbar from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css';
import { createPinia } from 'pinia';

const appVue = createApp(App);

appVue
	.use(store)
	.use(router)
	.use(i18n)
	.use(ElementPlus)
	.use(List)
	.use(PullRefresh)
	.use(createPinia());
	
// 在这里设置全局配置
appVue.use(PerfectScrollbar);

appVue.mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	appVue.component(key, component);
}

// 在应用入口文件中使用: 如 main.js, app.jsx
import { createVersionPolling } from 'version-polling';

const env = process.env.NODE_ENV;
const silent = env === 'development' || env === 'baota' || env === 'docker';
createVersionPolling({
	appETagKey: '__APP_ETAG__',
	pollingInterval: 5 * 1000, // 单位为毫秒
	silent: silent, // 开发环境下不检测
	onUpdate: (self) => {
		// 当检测到有新版本时，执行的回调函数，可以在这里提示用户刷新页面
		const result = confirm('页面有更新，点击确定刷新页面！');
		if (result) {
			self.onRefresh();
		} else {
			self.onCancel();
		}
		// 强制更新可以用alert
		// alert('有新版本，请刷新页面');
	},
	immediate: false,
});
