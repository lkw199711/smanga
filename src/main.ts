import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import Vant from 'vant'

createApp(App).use(store).use(router).use(ElementPlus).use(Vant).mount('#app')
