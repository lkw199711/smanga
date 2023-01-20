import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './interface'
import i18n from "@/i18n";

import ElementPlus from 'element-plus'
import 'reset-css'
import 'element-plus/theme-chalk/index.css'
import './style/public.less'
import './assets/icon/iconfont.css'
import './assets/colour/iconfont.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

app.use(store).use(router).use(i18n).use(ElementPlus).mount('#app');

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
