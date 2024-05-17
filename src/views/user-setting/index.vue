<template>
	<div class="user-setting">
		<el-button type="primary" @click="user_logout">登出用户</el-button>
		<p class="note form-note">
			请注意，设置调配完成后，需要点击保存按钮才能够提交保存。否则有些配置项不能够生效。
		</p>
		<el-form :model="form" label-width="10rem">
			<p class="s-form-title">界面设置</p>
			<!-- 语言设置 -->
			<div class="language">
				<el-form-item label="语言设置">
					<el-select v-model="userConfig.language" class="language-select" size="default"
						@change="language_change">
						<el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value" />
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
					<el-select v-model="userConfig.order" class="sort-select" size="default" @change="sort_order_change">
						<el-option v-for="item in sortOrder" :key="item" :label="$t(`sortOrder.${item}`)" :value="item">
							<span class="op-text">{{ $t(`sortOrder.${item}`) }}</span>
						</el-option>
					</el-select>
				</el-form-item>
			</div>
			<p class="s-form-title">页面容量设置</p>
			<!-- 页面容量设置 -->

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
		</el-form>

		<div class="btn-box">
			<el-button type="primary" @click="submit">保存设置</el-button>
		</div>

	</div>
</template>

<script setup lang="ts">
import { userConfig } from '@/store';
import { useI18n } from 'vue-i18n';
import { set_theme, themes } from '@/style/theme';
import theme from '@/store/theme';
import languages from '@/store/language';
import { pageSizeConfig } from '@/store';
import { ref } from 'vue';
import userApi from '@/api/account'
import { Cookies } from '@/utils';
import { useRouter } from 'vue-router';
const router = useRouter();
const { locale } = useI18n();

const form = ref({ removeFirst: 0, range1: 30 });

// 排序方式
const sortOrder = ['id', 'idDesc', 'name', 'nameDesc', 'time', 'timeDesc'];

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

function submit() {
	const userName = Cookies.get('userName');
	const configValue = { userConfig, pageSizeConfig };

	userApi.update_account(+Cookies.get('userId'), {userConfig: configValue});

}

function user_logout() {
	Cookies.remove('userName');
	Cookies.remove('userId');
	router.push('/login')
}
</script>

<style scoped lang="less" src="./style/index.less"></style>
