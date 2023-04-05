<template>
	<div class="main" id="app">
		<div class="view">
			<el-config-provider :locale="elLocale">
				<router-view v-slot="{Component}">
					<keep-alive include="layout">
						<component :is="Component" />
					</keep-alive>
				</router-view>
			</el-config-provider>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {Cookies, global_set_json} from '@/utils';
import {get_bookmark} from '@/api/bookmark';
import {config} from '@/store';
import router from '@/router';
import {ElConfigProvider, ElMessage, ElMessageBox} from 'element-plus';
import languages from '@/store/language';
import {computed, onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import {set_theme} from '@/style/theme';
import {system_init} from '@/api/login';

const {locale} = useI18n();

const elLocale = computed(() => {
	const index = config.language;
	for (let i = 0; i < languages.length; i++) {
		if (languages[i].value === index) {
			return languages[i].components;
		}
	}
	return '';
});

// 检查登录状态
check_login();

// 获取书签列表
set_bookmark();

// 生命周期
onMounted(() => {
	// 设置语言
	const language = localStorage.getItem('language');
	if (language) {
		config.language = language;
		locale.value = language;
	}

	// 设置主题
	const theme = localStorage.getItem('theme');
	if (theme) {
		config.theme = theme;
		set_theme(theme);
	}

	// 设置安卓环境
	if (window.javaObj) {
		config.android = true;
	}

	system_init();
});

// 设置屏幕尺寸
set_screen_type();
window.addEventListener('resize', set_screen_type);

/**
 * 设置屏幕尺寸
 */
function set_screen_type() {
	// const screen = window.screen.width;
	const screen = document.body.scrollWidth;

	// ElMessage(String(screen));
	if (screen < 390) {
		config.screenType = 'mini';
	} else if (screen < 768) {
		config.screenType = 'small';
	} else if (screen < 1200) {
		config.screenType = 'middle';
	} else if (screen < 2000) {
		config.screenType = 'large';
	} else {
		config.screenType = '2k';
	}
}

/**
 * 检查登录状态
 */
function check_login() {
	const id = Cookies.get('userId');
	const name = Cookies.get('userName');

	if (!name || !id) {
		router.push('/login');
	}
}

/**
 * 获取书签列表
 */
async function set_bookmark() {
	const res = await get_bookmark();
	global_set_json('bookmarkList', res.data.list);
}
</script>

<style lang="less">
.main {
	background-color: #d9d9d9;
	min-height: 100vh;
}
</style>
