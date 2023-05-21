<template>
	<!-- 安卓端占位 -->
	<div class="android-seat" v-if="config.android"></div>

	<div class="top-nav posted">
		<div class="menu_collapse" @click="handleSelect('switch_sidebar')">
			<!--大屏幕-->
			<template v-if="screenType">
				<expand v-show="config.sidebarCollapse" class="icon-operation" />
				<fold v-show="!config.sidebarCollapse" class="icon-operation" />
			</template>
			<!--小屏幕-->
			<Operation v-else class="icon-operation"></Operation>
			<!--<expand v-else class="icon-operation"/>-->
		</div>

		<!-- 搜索框 -->
		<div class="search" v-show="layoutLimit('search')">
			<el-input
				class="search-input"
				v-model="searchText"
				clearable
				@keyup.enter="go_search">
				<template #prepend>
					<el-select
						v-model="searchType"
						placeholder="Select"
						class="search-select">
						<el-option :label="$t('search.manga')" value="manga" />
						<el-option :label="$t('search.chapter')" value="chapter" />
					</el-select>
				</template>
				<template #append>
					<el-button :icon="Search" @click="go_search" />
				</template>
			</el-input>
		</div>

		<!--右侧菜单-->
		<div class="right-option">
			<!-- 简化版搜索 -->
			<div
				class="search-small"
				@click="router.push('/search')"
				v-show="layoutLimit('miniSearch')">
				<i class="iconfont icon-sousuo" @click="switch_view_type" />
			</div>

			<!-- 视图切换 -->
			<div class="view-type" v-show="layoutLimit('view')">
				<i :class="['iconfont', viewClass]" @click="switch_view_type" />
			</div>

			<!-- 排序方式 -->
			<div class="sort" v-show="layoutLimit('sort')">
				<i
					:class="['sort-label', 'iconfont', 'icon-paixu']"
					@click="switch_view_type" />
				<el-select
					v-model="userConfig.order"
					class="sort-select"
					size="default"
					@change="sort_order_change">
					<el-option
						v-for="item in sortOrder"
						:key="item"
						:label="$t(`sortOrder.${item}`)"
						:value="item">
						<span class="op-text">{{ $t(`sortOrder.${item}`) }}</span>
					</el-option>
				</el-select>
			</div>

			<!-- 主题皮肤 -->
			<div class="theme" v-show="layoutLimit('theme')">
				<span class="theme-label" />
				<el-select
					v-model="userConfig.theme"
					class="theme-select"
					size="default"
					@change="theme_change">
					<el-option
						v-for="item in theme"
						:key="item.value"
						:label="$t(`theme.${item.value}`)"
						:value="item.value">
						<span class="op-color" :style="theme_color(item.value)" />
						<span class="op-text">{{ $t(`theme.${item.value}`) }}</span>
					</el-option>
				</el-select>
			</div>

			<!--切换语言-->
			<div class="language" v-show="layoutLimit('language')">
				<i class="colour colour-yuyanqiehuan" />
				<el-select
					v-model="userConfig.language"
					class="language-select"
					size="default"
					@change="language_change">
					<el-option
						v-for="item in languages"
						:key="item.value"
						:label="item.label"
						:value="item.value" />
				</el-select>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {config, userConfig} from '@/store';
import languages from '@/store/language';
import theme from '@/store/theme';
import {computed, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {set_theme, themes} from '@/style/theme';
import {Search} from '@element-plus/icons-vue';
import {useRoute} from 'vue-router';
import router from '@/router';
import layoutDic from '@/store/top-layout';
const {locale} = useI18n();
const route = useRoute();

const searchText = ref('');
const searchType = ref('manga');

// 排序方式
const sortOrder = ['id', 'idDesc', 'name', 'nameDesc', 'time', 'timeDesc'];

// 视图类型
const viewClass = computed(() => {
	const viewType = config.viewType;
	switch (viewType) {
		case 'block':
			return 'icon-gonggeshitu';
		case 'list':
			return 'icon-liebiaoshitu';
		default:
			return 'icon-gonggeshitu';
	}
});

const screenType = computed(() => {
	const screenType = config.screenType;
	switch (screenType) {
		case 'large':
			return true;
		case 'middle':
			return false;
		case 'small':
			return false;
		default:
			return true;
	}
});

const layoutLimit = computed(() => (key: string) => {
	const screen = config.screenType;
	const view = route.meta.view;
	let layoutArr: string[];

	if (view) {
		layoutArr = layoutDic[view][screen];
	} else {
		layoutArr = layoutDic.default[screen];
	}

	return layoutArr.includes(key);
});

/**
 * 去往搜索界面
 */
function go_search() {
	if (!searchText.value) {
		return false;
	}

	router.push({
		name: 'search',
		params: {
			searchText: searchText.value,
			searchType: searchType.value,
		},
	});
}

function search_noval() {
	router.push({
		name: 'search',
	});
}

function handleSelect(key: string) {
	switch (key) {
		case 'switch_sidebar':
			config.sidebarCollapse = !config.sidebarCollapse;
			break;
		default:
			break;
	}
}

function sort_order_change(val: string) {}

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

function switch_view_type() {
	if (config.viewType === 'block') {
		config.viewType = 'list';
	} else if (config.viewType === 'list') {
		config.viewType = 'block';
	}
}
</script>

<style scoped lang="less">
.android-seat {
	height: 4rem;
}
.top-nav.posted {
	display: flex;
	justify-content: space-between;
	height: 60px;
	box-shadow: 0 1px 4px #b1b3b8;

	.menu_collapse {
		width: 60px;
	}

	.icon-operation {
		display: block;
		padding: 20px;
		width: 20px;
		color: #909399;
	}
}

.block-middle {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.search {
	flex: 1;
	margin: 1.4rem 1rem 0 0;

	&-select {
		width: 8rem;
	}
}

// 右侧
.right-option {
	display: flex;
	margin-top: 1.4rem;
}

.search-small {
	margin-right: 1rem;
	margin-top: 0.4rem;

	i {
		font-size: 2.6rem;
		color: @s-background;
	}
}
.view-type {
	margin-right: 1rem;

	i {
		font-size: 3.2rem;
		color: @s-background;
	}
}

.sort {
	&-label {
		margin-right: 1rem;
		vertical-align: middle;
		font-size: 2.6rem;
		color: @s-background;
	}

	&-select {
		width: 12rem;
		margin-right: 2rem;
	}
}

.theme {
	margin-right: 2rem;
	&-label {
		display: inline-block;
		margin-right: 0.6rem;
		width: 3rem;
		height: 3rem;
		line-height: 3rem;
		vertical-align: middle;
		background-color: @s-background;
	}

	&-select {
		width: 10rem;
	}
}

.language {
	display: flex;
	margin-right: 2rem;
	i {
		margin-right: 0.6rem;
		font-size: 3.2rem;
		//line-height: 3rem;
		transform: translateY(-0.1rem);
	}
	&-select {
		width: 10rem;
	}
}

.op-color {
	display: inline-block;
	width: 1.4rem;
	height: 1.4rem;
	margin-right: 1rem;
	background-color: @s-background;
	transform: translateY(0.1rem);
}

@media only screen and (min-width: 1200px) {
	.theme {
		margin-right: 2rem;
	}
	.language {
		margin-right: 2rem;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
}

@media only screen and (max-width: 767px) {
	.theme {
		margin-right: 0.8rem;
	}
	.language {
		margin-right: 0.8rem;
	}
}
</style>
