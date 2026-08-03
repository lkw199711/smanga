<template>
	<div class="main" id="app">
		<div class="view">
			<!-- 消息通知 -->
			<!-- <notice /> -->
			<el-config-provider :locale="elLocale">
				<router-view />
			</el-config-provider>
			<ThemeAlertDialog />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { global_set_json, Cookies } from '@/utils';
import { config, pageSizeConfig, userConfig } from '@/store';
import { useRoute, useRouter } from 'vue-router';
import languages from '@/store/language';
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { set_theme } from '@/style/theme';
import userApi from './api/account';
import notice from '@/components/notice.vue';
import useBrowseStore from './store/browse';
import { sessionStore } from '@/store/session';
import { preferencesStore } from '@/store/preferences';
import { STORAGE_KEYS, readLocalPreference, writeLocalPreference } from '@/utils/persistence';
import ThemeAlertDialog from '@/themes/components/theme-alert-dialog.vue';


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

// 此项必须在路由初始化前完成：Android 首屏可能是 /init 或 /login，
// 不能随着这些页面的业务初始化一同被跳过。
init_platform();
sessionStore.hydrate();

// 生命周期
onMounted(async () => {
	await system_init();
	const alreadyAlertsVersionMsg = readLocalPreference(STORAGE_KEYS.versionNotice);
	if (!alreadyAlertsVersionMsg) {
		const laertText = [
			'新版皮肤现已作为默认界面使用.',
			'如需回到旧版界面,可在设置页或顶栏皮肤切换中选择 Legacy 旧版皮肤.',
			'新版本皮肤整体功能的完善还依赖于大家测试并提供依据.',
			'感谢您的使用.',
		].join('<br>');
		ElMessageBox.alert(laertText, '新版本提示', { 
			dangerouslyUseHTMLString: true,
			confirmButtonText: '我已知晓'
		 });
		writeLocalPreference(STORAGE_KEYS.versionNotice, 'true');
	}
});

// App 不会在登录页跳转后重新挂载；监听公共页 -> 功能页的切换以加载用户设置。
watch(
	() => route.path,
	() => {
		void system_init();
	},
);

// 设置屏幕尺寸
set_screen_type();
window.addEventListener('resize', set_screen_type);

async function system_init() {
	if (['/', '/init', '/login', '/t/login', '/register'].includes(route.path)) return

	const token = Cookies.getToken();
	if (token && token === initializedToken) return;

	// 获取用户设置
	const loaded = await get_setting();
	if (!loaded) return;
	initializedToken = token;

	// 获取书签列表
	browse.load_bookmark_list();
}

let initializedToken = '';

function init_platform() {
	config.android = Boolean((window as typeof window & { javaObj?: unknown }).javaObj);
}

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

	// 设置移动端标识（768px 以下视为移动端）
	config.isMobile = screen < 768;

	// ElMessage(String(window.screen.width)+','+String(window.screen.height));
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

	preferencesStore.refreshLegacyValues();
	if (userConfig?.mangaPageSize != 0) {
		browse.mangaListPageSizeCache = preferencesStore.mangaPageSize;
	}
	if (userConfig?.chapterPageSize != 0) {
		browse.chapterListPageSizeCache = preferencesStore.chapterPageSize;
	}

	// 对于功能页面 优先从缓存中加载用户配置
	global_set_json('userConfig', userConfig);
	global_set_json('pageSizeConfig', pageSizeConfig);

	// 设置语言
	preferencesStore.setLanguage(userConfig.language);
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
