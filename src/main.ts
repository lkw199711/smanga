import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './interface'

import ElementPlus from 'element-plus'
import Vant from 'vant'
import 'reset-css'
import 'element-plus/theme-chalk/index.css'
import 'vant/lib/index.css'
import './style/public.less'

createApp(App).use(store).use(router).use(ElementPlus).use(Vant).mount('#app')
