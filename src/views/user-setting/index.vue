<template>
	<div class="user-setting">
		<h1 class="page-title">用户偏好</h1>

		<div class="header-actions mb-6">
			<el-button type="primary" @click="user_logout" class="mr-4">登出用户</el-button>
			<el-button type="primary" @click="full_screen">网页全屏</el-button>
		</div>
		<div class="form-note mt-4 text-gray-500 text-sm mb-6">
			请注意，设置调配完成后，需要点击保存按钮才能够提交保存。否则有些配置项不能够生效。
		</div>
		<el-form :model="form" label-width="140px" class="setting-form">
			<el-card class="setting-card mt-6" shadow="hover">
				<template #header>
					<div class="card-header">
						<span class="card-title">界面设置</span>
					</div>
				</template>
				<el-form-item label="语言设置" class="setting-item">
					<el-select v-model="userConfig.language" class="setting-select" size="default"
						@change="language_change">
						<el-option v-for="item in languages" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</el-form-item>

				<el-form-item label="主题设置" class="setting-item theme-setting">
					<span class="theme-color"></span>
					<el-select v-model="userConfig.theme" class="setting-select" size="default" @change="theme_change">
						<el-option v-for="item in theme" :key="item.value" :label="$t(`theme.${item.value}`)"
							:value="item.value">
							<span class="op-color" :style="theme_color(item.value)" />
							<span class="op-text">{{ $t(`theme.${item.value}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item label="侧边栏媒体库" class="setting-item">
					<el-switch v-model="userConfig.showSidebarMediaList" />
				</el-form-item>
			</el-card>

			<el-card class="setting-card mt-6" shadow="hover">
				<template #header>
					<div class="card-header">
						<span class="card-title">列表设置</span>
					</div>
				</template>
				<el-form-item label="漫画默认排序" class="setting-item">
					<el-select v-model="userConfig.order" class="setting-select" size="default"
						@change="sort_order_change">
						<el-option v-for="item in sortOrder" :key="item" :label="$t(`sortOrder.${item}`)" :value="item">
							<span class="op-text">{{ $t(`sortOrder.${item}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="章节默认排序" class="setting-item">
					<el-select v-model="userConfig.chapterOrder" class="setting-select" size="default"
						@change="sort_order_change">
						<el-option v-for="item in chapterSortOrder" :key="item" :label="$t(`sortOrder.${item}`)"
							:value="item">
							<span class="op-text">{{ $t(`sortOrder.${item}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>
			</el-card>

			<el-card class="setting-card mt-6 mb-6" shadow="hover">
				<template #header>
					<div class="card-header">
						<span class="card-title">自定义页面容量设置</span>
					</div>
				</template>
				<el-form-item label="漫画页面容量" class="setting-item">
					<el-input v-model="mangaPageSize" type="number" style="width: 120px;" />
				</el-form-item>
				<el-form-item label="章节页面容量" class="setting-item">
					<el-input v-model="chapterPageSize" type="number" style="width: 120px;" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm">
					自定义页面容量设置，漫画与章节的页面容量已根据不同尺寸设备调试配置好。<br>
					如果还是未能很好的适配您的设备，例如条目内容过多遮挡住分页器与页码，可以对页面容量进行自定义。<br>
					设置为0使用默认值。<br>
					(该设置仅在客户端生效，不影响其他设备)
				</div>
			</el-card>

			<el-card class="setting-card mt-6 mb-6" shadow="hover">
				<template #header>
					<div class="card-header">
						<span class="card-title">阅读设置</span>
					</div>
				</template>
				<el-form-item label="翻页按钮反向" class="setting-item">
					<el-switch v-model="userConfig.pageTurningReverse" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					有朋友反馈，单手操作手机的时候，最方便触碰到屏幕的左侧，因此希望可以通过点击左侧翻下一页。那么，您可以通过此选项修改左右翻页按钮使其调换位置。
				</div>

				<el-form-item label="显示页码" class="setting-item">
					<el-switch v-model="userConfig.showPageNumber" />
				</el-form-item>

				<el-form-item label="使用阅读进度条" class="setting-item">
					<el-switch v-model="userConfig.userSlider" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					开启此选项后，章节阅读界面将显示一个进度条用以切换页码，而不是传统的页码器。<br>
					此改动可以减少视觉干扰，并且可以更快的切换到目标页码。<br>
					但会使部分用户不适应，并且失去传统页码器的一些功能。
				</div>

				<el-form-item label="开启滑动翻页" class="setting-item">
					<el-switch v-model="userConfig.enableTouchPageChange" />
				</el-form-item>
				<el-form-item label="顶栏切换范围" class="setting-item">
					<el-input v-model="userConfig.browseOperationTop" type="number" style="width: 120px;" />
					<span class="ml-2">%</span>
				</el-form-item>
				<el-form-item label="页码切换范围" class="setting-item">
					<el-input v-model="userConfig.browseOperationBottom" type="number" style="width: 120px;" />
					<span class="ml-2">%</span>
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					有朋友反馈，阅读界面操作面板默认的30%-40%-30%尺寸与他的习惯不符，因此开放设置选项用以调整“顶部操作栏”与“页码器”的切换范围。
				</div>

				<el-form-item label="跳转时打开新页签" class="setting-item">
					<el-switch v-model="userConfig.openNewTab" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					使用新标签页可以保留漫画与章节列表页信息，但会使浏览器界面过于臃肿，并且可能导致继续阅读功能失效。
				</div>

				<el-form-item label="单本库直接跳转章节" class="setting-item">
					<el-switch v-model="userConfig.singleMediadirectChapterPage" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					开启此选项后，点击媒体库时会直接进入章节列表页，而不是漫画详情页。<br>
					此改动可以减少一次点击操作，可以看到阅读进度条。<br>
					但会使漫画详情页的功能失效，例如：收藏、元数据浏览/编辑等。
				</div>

				<el-form-item label="条漫加载全部" class="setting-item">
					<el-switch v-model="userConfig.loadAllFlowIamge" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					开启此选项后，条漫模式下会自动加载所有图片，而不是只加载当前屏幕可见的图片。<br>
					此改动可以减少翻页时的加载时间，但会增加内存占用与网络开销。
				</div>

				<el-form-item label="数字排序漫画图" class="setting-item">
					<el-switch v-model="userConfig.orderChapterByNumber" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					开启此选项后，smanga加载章节时会将所有的图片裁剪文件名中的数字部分拼接在一起，按照大小升序排序。<br>
					不开启此选项时，smanga会按照图片文件名以ASCII进行排序。<br>
				</div>

				<el-form-item label="极简章节列表" class="setting-item">
					<el-switch v-model="userConfig.simpleChapterView" @change="switch_change" />
				</el-form-item>
				<div class="form-note mt-4 text-gray-500 text-sm mb-4">
					开启此选项后，章节列表将只显示章节名称，不再显示阅读进度与章节封面等信息。<br>
					此改动可以减少视觉干扰，在界面中展示更多的章节。<br>
				</div>
			</el-card>
		</el-form>

		<div class="btn-box mt-6">
			<el-button type="primary" @click="submit" style="width: 100%;">保存设置</el-button>
		</div>

	</div>
</template>

<script setup lang="ts">
import { userConfig, sortOrder, chapterSortOrder } from '@/store';
import { useI18n } from 'vue-i18n';
import { set_theme, themes } from '@/style/theme';
import theme from '@/store/theme';
import languages from '@/store/language';
import { pageSizeConfig } from '@/store';
import { ref } from 'vue';
import userApi from '@/api/account';
import { Cookies } from '@/utils';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();
const router = useRouter();
const { locale } = useI18n();

const form = ref({ removeFirst: 0, range1: 30 });

const mangaPageSize = ref(0);
const chapterPageSize = ref(0);

onMounted(() => {
	// 设置页面容量
	mangaPageSize.value = Number(localStorage.getItem('mangaPageSize')) || 0;
	chapterPageSize.value = Number(localStorage.getItem('chapterPageSize')) || 0;
});

function language_change(val: string) {
	locale.value = val;
	localStorage.setItem('language', val);
}

function theme_change(val: string) {
	set_theme(val);
	localStorage.setItem('theme', val);
}

function theme_color(theme: string) {
	// @ts-ignore
	const color = themes[theme]['s-menu'];
	return {
		backgroundColor: color,
		width: '16px',
		height: '16px',
		borderRadius: '4px',
		border: '1px solid #eee',
		display: 'inline-block',
		marginRight: '8px',
		verticalAlign: 'middle'
	};
}

function switch_change(val: string) {

}

function sort_order_change(val: string) { }

async function submit() {
	// 设置页面容量
	browse.mangaListPageSizeCache = mangaPageSize.value;
	browse.chapterListPageSizeCache = chapterPageSize.value;
	localStorage.setItem('mangaPageSize', mangaPageSize.value.toString());
	localStorage.setItem('chapterPageSize', chapterPageSize.value.toString());
	// 设置主题
	const configValue = { userConfig, pageSizeConfig };
	await userApi.update_user_config({ userConfig: configValue });
}

function user_logout() {
	Cookies.remove('userName');
	Cookies.remove('userId');
	router.push('/login')
}

function full_screen() {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.documentElement.requestFullscreen();
	}
}
</script>

<style scoped lang="less">
.user-setting {
	padding: 20px 30px;
	min-height: 100vh;
}

.page-title {
	font-size: 18px;
	font-weight: 600;
	color: @s-back-text;
	margin-bottom: 24px;
	padding-bottom: 10px;
	border-bottom: 1px solid #e4e7ed;
}

.header-actions {
	margin-bottom: 24px;
}

.setting-form {
	width: 100%;
	label-width: 160px;
}

.setting-card {
	border-radius: 8px;
	overflow: hidden;
}

.mt-6 {
	margin-top: 24px;
}


.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 20px;
	border-bottom: 1px solid #f0f0f0;
}

.card-title {
	font-size: 16px;
	font-weight: 600;
	color: #1f2d3d;
}

.setting-item {
	margin-bottom: 24px;
}

.setting-select {
	min-width: 200px;
}

.theme-setting {
	position: relative;
	.theme-color {
		display: inline-block;
		position: absolute;
		left: -9rem;
		width: 16px;
		height: 16px;
		border-radius: 4px;
		border: 1px solid #eee;
		margin-right: 8px;
		vertical-align: middle;
		background-color: @s-menu;
	}
}

.form-note {
	padding: 10px 15px;
	background-color: #f4f4f5;
	border-radius: 4px;
	margin-top: 10px;
	margin-bottom: 20px;
	line-height: 1.6;
}

.btn-box {
	margin-top: 30px;
	text-align: center;
	padding-bottom: 20px;
}

@media only screen and (min-width: 1200px) {
	.user-setting {
		margin: 0 auto;
		padding: 30px;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.user-setting {
		max-width: 800px;
		margin: 0 auto;
		padding: 25px;
	}
}

@media only screen and (max-width: 767px) {
	.user-setting {
		padding: 15px;
	}

	.setting-form {
		label-width: 140px;
	}
}
</style>
