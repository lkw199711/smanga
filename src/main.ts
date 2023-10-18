/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 15:09:40
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-18 22:19:16
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
import './assets/colour/iconfont.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'vant/lib/index.css';

import PerfectScrollbar from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css';

const app = createApp(App);

app
	.use(store)
	.use(router)
	.use(i18n)
	.use(ElementPlus)
	.use(List)
	.use(PullRefresh);

// 在这里设置全局配置
app.use(PerfectScrollbar);

app.mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}
