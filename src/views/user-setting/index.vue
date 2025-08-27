<template>
	<div class="user-setting">
		<el-button type="primary" @click="user_logout">登出用户</el-button>
		<el-button type="primary" @click="full_screen">网页全屏</el-button>
		<p class="note form-note">
			请注意，设置调配完成后，需要点击保存按钮才能够提交保存。否则有些配置项不能够生效。
		</p>
		<el-form :model="form">
			<p class="s-form-title">界面设置</p>
			<!-- 语言设置 -->
			<div class="language">
				<el-form-item label="语言设置">
					<el-select v-model="userConfig.language" class="language-select" size="default"
						@change="language_change">
						<el-option v-for="item in languages" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</el-form-item>
			</div>

			<!-- 主题皮肤 -->
			<div class="theme">
				<el-form-item label="主题设置">
					<span class="theme-label" />
					<el-select v-model="userConfig.theme" class="theme-select" size="default" @change="theme_change">
						<el-option v-for="item in theme" :key="item.value" :label="$t(`theme.${item.value}`)"
							:value="item.value">
							<span class="op-color" :style="theme_color(item.value)" />
							<span class="op-text">{{ $t(`theme.${item.value}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>
			</div>

			<p class="s-form-title">列表设置</p>
			<!-- 排序方式 -->
			<div class="sort">
				<el-form-item label="默认排序规则">
					<el-select v-model="userConfig.order" class="sort-select" size="default"
						@change="sort_order_change">
						<el-option v-for="item in sortOrder" :key="item" :label="$t(`sortOrder.${item}`)" :value="item">
							<span class="op-text">{{ $t(`sortOrder.${item}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>
			</div>
			<p class="s-form-title">自定义页面容量设置</p>
			<!-- 页面容量设置 -->
			<el-form-item label="漫画页面容量" class="op-range">
				<el-col :span="4">
					<el-input v-model="mangaPageSize" type="number" />
				</el-col>
			</el-form-item>
			<el-form-item label="章节页面容量" class="op-range">
				<el-col :span="4">
					<el-input v-model="chapterPageSize" type="number" />
				</el-col>
			</el-form-item>
			<p class="note form-note">
				自定义页面容量设置，漫画与章节的页面容量已根据不通尺寸设备调试配置好,<br>
				如果还是未能很好的适配您的设备,例如条目内容过多遮挡住分页器与页码.可以对页面容量进行自定义,<br>
				设置为0使用默认值。<br>
				(该设置仅在客户端生效,不影响其他设备)
			</p>

			<p class="s-form-title">阅读设置</p>
			<el-form-item label="翻页按钮反向">
				<el-switch v-model="userConfig.pageTurningReverse" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				有朋友反馈，单手操作手机的时候，最方便触碰到屏幕的左侧，因此希望可以通过点击左侧翻下一页。那么，您可以通过此选项修改左右翻页按钮使其调换位置。
			</p>

			<el-form-item label="显示页码">
				<el-switch v-model="userConfig.showPageNumber" />
			</el-form-item>

			<el-form-item label="使用阅读进度条">
				<el-switch v-model="userConfig.userSlider" />
			</el-form-item>
			<p class="note form-note">
				开启此选项后,章节阅读界面将显示一个进度条用以切换页码,而不是传统的页码器. <br>
				此改动可以减少视觉干扰,并且可以更快的切换到目标页码. <br>
				但会使部分用户不适应,并且失去传统页码器的一些功能.
			</p>

			<el-form-item label="开启滑动翻页">
				<el-switch v-model="userConfig.enableTouchPageChange" />
			</el-form-item>
			<el-form-item label="顶栏切换范围" class="op-range">
				<el-col :span="4">
					<el-input v-model="userConfig.browseOperationTop" type="number" />
				</el-col>
				<el-col :span="2" class="text-center">%</el-col>
			</el-form-item>
			<el-form-item label="页码切换范围" class="op-range">
				<el-col :span="4">
					<el-input v-model="userConfig.browseOperationBottom" type="number" />
				</el-col>
				<el-col :span="2" class="text-center">%</el-col>
			</el-form-item>
			<p class="note form-note">
				有朋友反馈，阅读界面操作面板默认的30%-40%-30%尺寸与他的习惯不符，因此开放设置选项用以调整“顶部操作栏”与“页码器”的切换范围。
			</p>

			<el-form-item label="打开漫画,章节,阅读界面时使用新标签页">
				<el-switch v-model="userConfig.openNewTab" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				使用新标签页可以保留漫画与章节列表页信息,但会使浏览器界面过于臃肿,并且可能导继续阅读功能失效.
			</p>

			<el-form-item label="单本漫画,由媒体库直接浏览章节页">
				<el-switch v-model="userConfig.singleMediadirectChapterPage" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				开启此选项后,点击媒体库时会直接进入章节列表页,而不是漫画详情页. <br>
				此改动可以减少一次点击操作,可以看到阅读进度条. <br>
				但会使漫画详情页的功能失效,例如:收藏,元数据浏览/编辑等.
			</p>

			<el-form-item label="条漫模式下,自动加载所有图片">
				<el-switch v-model="userConfig.loadAllFlowIamge" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				开启此选项后,条漫模式下会自动加载所有图片,而不是只加载当前屏幕可见的图片. <br>
				此改动可以减少翻页时的加载时间,但会增加内存占用与网络开销.
			</p>

			<el-form-item label="使用数字排序方式加载章节图片">
				<el-switch v-model="userConfig.orderChapterByNumber" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				开启此选项后,smanga加载章节时会将所有的图片裁剪文件名中的数字部分拼接在一起,按照大小升序排序 <br>
				不开启此选项时,smanga会按照图片文件名以ASCII进行排序 <br>
			</p>

			<el-form-item label="以极简模式展示章节列表">
				<el-switch v-model="userConfig.simpleChapterView" @change="switch_change" />
			</el-form-item>
			<p class="note form-note">
				开启此选项后,章节列表将只显示章节名称,不再显示阅读进度与章节封面等信息. <br>
				此改动可以减少视觉干扰,在界面中展示更多的章节. <br>
			</p>
		</el-form>

		<div class="btn-box">
			<el-button type="primary" @click="submit">保存设置</el-button>
		</div>

	</div>
</template>

<script setup lang="ts">
import { userConfig, sortOrder } from '@/store';
import { useI18n } from 'vue-i18n';
import { set_theme, themes } from '@/style/theme';
import theme from '@/store/theme';
import languages from '@/store/language';
import { pageSizeConfig } from '@/store';
import { ref } from 'vue';
import userApi from '@/api/account'
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
	const color = themes[theme]['s-back'];
	return {
		backgroundColor: color,
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

<style scoped lang="less" src="./style/index.less"></style>
