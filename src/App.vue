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
import {config, pageSizeConfig, userConfig} from '@/store';
import {useRoute, useRouter} from 'vue-router';
import {ElConfigProvider, ElMessage, ElMessageBox} from 'element-plus';
import languages from '@/store/language';
import {computed, onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import {set_theme} from '@/style/theme';
import {get_user_config} from './api/account';

const route = useRoute();
const router = useRouter();
const {locale} = useI18n();

const elLocale = computed(() => {
	const index = userConfig.language;
	for (let i = 0; i < languages.length; i++) {
		if (languages[i].value === index) {
			return languages[i].components;
		}
	}
	return '';
});

// 生命周期
onMounted(async () => {
	// 设置安卓环境
	if (window.javaObj) {
		config.android = true;
	}
	await router.isReady();

	// 获取用户设置
	await get_setting();

	// 获取书签列表
	set_bookmark();
	
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
	} else if (screen < 4095) {
		config.screenType = '2k';
	} else {
		config.screenType = '4k';
	}

	// ElMessage(String(config.screenType));
}

/**
 * 检查登录状态
 */
async function check_login() {
	const id = Cookies.get('userId');
	const name = Cookies.get('userName');

	if ((!name || !id) && route.name !== 'init') {
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

async function get_setting() {
	const res = await get_user_config();

	// 非正常状态
	if (res.data.code === 1) {
		switch (res.data.state) {
			case 'first-deploy':
				router.push('/init');
				break;
			case 'user-error':
				router.push('/login');
				break;
			default:
				break;
		}
		return false;
	}

	const configValue = JSON.parse(res.data.configValue);

	// 使用数据库用户设置，覆盖当前设置
	Object.assign(userConfig, configValue.userConfig);
	Object.assign(pageSizeConfig, configValue.pageSizeConfig);

	// 设置语言
	locale.value = userConfig.language;

	// 设置主题
	set_theme(userConfig.theme);
}
</script>

<style lang="less">
.main {
	background-color: #d9d9d9;
	min-height: 100vh;
}
</style>
