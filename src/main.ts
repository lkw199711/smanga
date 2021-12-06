import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import Vant from 'vant'
import 'element-plus/theme-chalk/index.css';
import 'vant/lib/index.css';

createApp(App).use(store).use(router).use(ElementPlus).use(Vant).mount('#app')
