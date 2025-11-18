import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import './interface';
import i18n from '@/i18n';

// 按需引入Element Plus组件和样式
import { ElButton, ElInput, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElPagination, ElTable, ElTableColumn, ElConfigProvider, ElMenu, ElMenuItem, ElMenuItemGroup,
	ElSubMenu
 } from 'element-plus';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/menu/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-column/style/css';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/config-provider/style/css';
import 'element-plus/es/components/menu-item/style/css';
import 'element-plus/es/components/menu-item-group/style/css';
import 'element-plus/es/components/sub-menu/style/css';

import 'reset-css';
import './style/public.less';
import './assets/icon/iconfont.css';
import './assets/colour/iconfont.css';
import './assets/colour/iconfont.js';
import 'default-passive-events';

import { createPinia } from 'pinia';
import { initTheme } from '@/style/theme';

// 初始化主题
initTheme();

const appVue = createApp(App);

// 注册Element Plus组件
appVue.component('ElButton', ElButton);
appVue.component('ElInput', ElInput);
appVue.component('ElDialog', ElDialog);
appVue.component('ElForm', ElForm);
appVue.component('ElFormItem', ElFormItem);
appVue.component('ElSelect', ElSelect);
appVue.component('ElOption', ElOption);
appVue.component('ElPagination', ElPagination);
appVue.component('ElTable', ElTable);
appVue.component('ElTableColumn', ElTableColumn);
appVue.component('ElConfigProvider', ElConfigProvider);
appVue.component('ElMenu', ElMenu);
appVue.component('ElMenuItem', ElMenuItem);
appVue.component('ElMenuItemGroup', ElMenuItemGroup);
appVue.component('ElSubMenu', ElSubMenu);

appVue
	.use(router)
	.use(i18n)
	.use(createPinia());

appVue.mount('#app');