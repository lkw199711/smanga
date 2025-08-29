import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
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
import 'default-passive-events';

import { createPinia } from 'pinia';

import '@/style/public.less';

const appVue = createApp(App);

appVue
	.use(router)
	.use(i18n)
	.use(ElementPlus)
	.use(List)
	.use(PullRefresh)
	.use(createPinia());

appVue.mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	appVue.component(key, component);
}