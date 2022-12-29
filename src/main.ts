import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookie from 'vue-cookies'
import './interface'

import ElementPlus from 'element-plus'
import Vant from 'vant'
import 'reset-css'
import 'element-plus/theme-chalk/index.css'
import 'vant/lib/index.css'
import './style/public.less'
import './assets/icon/iconfont.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);
    app.use(store).use(router).use(ElementPlus).use(Vant)
    .use(VueCookie)
    .mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
