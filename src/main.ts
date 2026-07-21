import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import './interface';
import i18n from '@/i18n';

import 'reset-css';
import './style/public.less';
import './assets/icon/iconfont.css';
import './assets/colour/iconfont.css';
import './assets/colour/iconfont.js';
import 'default-passive-events';

import {createPinia} from 'pinia';
import {initTheme} from '@/style/theme';
import {registerDirectives} from '@/utils/directives';
// 初始化主题
initTheme();

const appVue = createApp(App);

appVue.use(router).use(i18n).use(createPinia());
registerDirectives(appVue);

appVue.mount('#app');

// 为了Vite兼容性，导出应用实例（可选）
export default appVue;
