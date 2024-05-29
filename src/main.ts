/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-08-16 15:09:40
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 11:45:14
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

import {PerfectScrollbar, PerfectScrollbarPlugin} from 'vue3-perfect-scrollbar';
// import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css';
import { createPinia } from 'pinia';

import '@/style/public.less';
// import {Plugin} from 'vue';

// const plugin: Plugin<[]> = PerfectScrollbar as Plugin<[]>;

const appVue = createApp(App);

appVue
	.use(router)
	.use(i18n)
	.use(ElementPlus)
	.use(List)
	.use(PullRefresh)
	.use(createPinia());
	
// 在这里设置全局配置
appVue.use(PerfectScrollbarPlugin);

appVue.mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	appVue.component(key, component);
}