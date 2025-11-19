<template>
	<div class="main" id="app">
		<div class="view">
			<!-- 消息通知 -->
			<!-- <notice /> -->
			<el-config-provider :locale="elLocale">
				<router-view />
			</el-config-provider>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Cookies, global_set_json } from '@/utils';
import { config, pageSizeConfig, userConfig } from '@/store';
import { useRoute, useRouter } from 'vue-router';
import languages from '@/store/language';
import { computed, onMounted, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { set_theme } from '@/style/theme';
import userApi from './api/account';
import notice from '@/components/notice.vue';
import useBrowseStore from './store/browse';

const route = useRoute();
const router = useRouter();
const browse = useBrowseStore();
const { locale } = useI18n();

const elLocale = computed(() => {
	const index = userConfig.language;
	for (let i = 0; i < languages.length; i++) {
		if (languages[i].value === index) {
			return languages[i].components;
		}
	}
	return '';
});

type Win = {
	javaObj: string;
};

// 生命周期
onBeforeMount(async () => {
	// 设置安卓环境
	if ((window as any).javaObj) {
		config.android = true;
	}

	// 获取用户设置
	await get_setting();

	// 获取书签列表
	browse.load_bookmark_list();
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
		config.screenType = 'tablet';
	} else if (screen < 1920) {
		config.screenType = 'middle';
	} else if (screen < 2460) {
		config.screenType = 'large';
	} else if (screen < 4000) {
		config.screenType = '2k';
	} else {
		config.screenType = '4k';
	}

	// ElMessage(String(window.screen.height));
	// ElMessage(String(window.screen.width));
}

async function get_setting() {
	const res = await userApi.get_user_config();
	let configValue = {} as any;

	if (typeof res === 'string') {
		configValue = JSON.parse(res);
	} else if (typeof res === 'object') {
		configValue = res;
	} else {
		return false;
	}

	// 使用数据库用户设置，覆盖当前设置
	Object.assign(userConfig, configValue.userConfig);
	Object.assign(pageSizeConfig, configValue.pageSizeConfig);

	if (userConfig?.mangaPageSize != 0) {
		browse.mangaListPageSizeCache = Number(localStorage.getItem('mangaPageSize')) || 0;
	}
	if (userConfig?.chapterPageSize != 0) {
		browse.chapterListPageSizeCache = Number(localStorage.getItem('chapterPageSize')) || 0;
	}

	// 对于功能页面 优先从缓存中加载用户配置
	global_set_json('userConfig', userConfig);
	global_set_json('pageSizeConfig', pageSizeConfig);

	// 设置语言
	locale.value = userConfig.language;

	// 设置主题
	set_theme(userConfig.theme);

	return true;
}
</script>

<style lang="less">
.main {
	min-height: 100vh;
}
</style>
