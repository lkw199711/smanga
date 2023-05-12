<template>
	<div class="search">
		<div class="top">
			<tabs v-model="collectType" :items="items" @change="tabs_change"></tabs>
		</div>

		<div class="middle">
			<div class="manga-list" v-if="collectType === 'manga'">
				<div :class="['manga-list-box', {block: config.viewType === 'list'}]">
					<manga
						v-for="(i, k) in list"
						:key="k"
						:viewType="config.viewType"
						:mangaInfo="i"
						@contextmenu.prevent="context_menu(i, k)" />
				</div>

				<!--分页组件-->
				<media-pager
					ref="pager"
					:count="count"
					:params-page="page"
					@page-change="page_change" />
			</div>

			<div class="chapter-list" v-if="collectType === 'chapter'">
				<!--章节列表-->
				<div :class="['chapter-list-box', {block: config.viewType === 'list'}]">
					<chapter
						v-for="(i, k) in list"
						:key="k"
						:view-type="config.viewType"
						:chapterInfo="i"
						@click="go_browse(i)"
						@contextmenu.prevent="context_menu(i, k)" />
				</div>

				<!--分页组件-->
				<media-pager
					ref="pager"
					:count="count"
					:params-page="page"
					@page-change="page_change" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {name: 'collect'};
</script>

<script lang="ts" setup>
import {
	computed,
	watch,
	onMounted,
	onBeforeUnmount,
	ref,
	onActivated,
} from 'vue';
import {useRoute} from 'vue-router';
import {Search} from '@element-plus/icons-vue';
import store, {config, userConfig, pageSizeConfig} from '@/store';
import {search} from '@/api/search';
import router from '@/router';
import {get_poster} from '@/api';
import {get_chapter} from '@/api/chapter';
import {global_set, global_set_json} from '@/utils';
import manga from '@/components/manga.vue';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import {ElMessage} from 'element-plus';
import {get_collect} from '@/api/collect';
import type {TabsPaneContext} from 'element-plus';
import tabs from './tabs.vue';
import i18n from '@/i18n';
const {t} = i18n.global;

const items = ref([
	{
		label: t('collect.manga'),
		value: 'manga',
	},
	{
		label: t('collect.chapter'),
		value: 'chapter',
	},
]);

const collectType = ref('manga');

const handleClick = (tab: TabsPaneContext, event: Event) => {
};

const searchText = ref('');
const searchType = ref('manga');

const route = useRoute();

const defaultPageSize = computed<number>(() => {
	const screen = config.screenType;
	// @ts-ignore
	return Number(pageSizeConfig[screen][0]);
});

let page = ref(1);
let count = ref(0);
let list = ref([]);
let mangaInfo = ref({});
let menuPoster = '';

// 切换排序规则时 重新加载列表
watch(
	() => userConfig.order,
	() => {
		page_change(1);
	}
);
onMounted(async () => {
	store.commit('switch_await', {running: 'collectAwait', bool: true});

	page_change();

	// 为漫画请求海报图片
	get_poster(list.value, 'mangaAwait');
});

onBeforeUnmount(() => {
	store.commit('switch_await', {running: 'collectAwait', bool: false});
});

// KeepAlive相关联 生命周期
onActivated(() => {
	const paramsSearchText = route.params.searchText;

	if (paramsSearchText) {
		searchText.value = String(paramsSearchText);
		searchType.value = String(route.params.searchType);
		page_change();
		route.params.searchText = '';
	}
});

function tabs_change(val: string) {
	list.value = [];
	page_change();
}

async function do_search() {
	const res: any = await search(searchText.value, searchType.value, 0, 12);
	list.value = res.data.list;
}

/**
 * 清空方法
 */
function clear() {
	list.value = [];
}

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(
	pageC = 1,
	pageSize: number = defaultPageSize.value
) {
	if (pageC) {
		page.value = pageC;
	}

	const start = (page.value - 1) * pageSize;
	const res: any = await get_collect(
		collectType.value,
		start,
		pageSize,
		userConfig.order
	);
	list.value = res.data.list;
	count.value = res.data.count;

	// 为漫画请求海报图片
	get_poster(list.value, 'mangaAwait');
}

function reload() {
	/*  关于首页首次加载的页面容量 因逻辑bug暂时不处理
		const screenType = config.screenType;
		const pageSize = mediaPageSize[screenType];
    */
	page_change(1);
}

/**
 * 打开右侧菜单
 */
function context_menu(mangaInfo: any, key: number) {
	menuPoster = (list[key] as any).blob;
	mangaInfo = mangaInfo;
	config.rightSidebar = true;
}

// 章节方法
async function go_browse(item: any) {
	const chapterId = item.chapterId;
	const chapterName = item.chapterName;
	const chapterPath = item.chapterPath;
	const chapterType = item.chapterType;
	const chapterCover = item.chapterCover;
	const browseType = item.browseType;

	// 缓存章节信息
	global_set('chapterId', chapterId);
	global_set('chapterName', chapterName);
	global_set('chapterPath', chapterPath);
	global_set('chapterType', chapterType);
	global_set('chapterCover', chapterCover);

	// 加载章节列表
	const res = await get_chapter(item.mangaId);
	global_set_json('chapterList', res.data.list);

	let page = 1;
	if (browseType === 'flow') {
		page = 0;
	}

	router.push({
		name: browseType,
		query: {
			name: chapterName,
			path: chapterPath,
		},
		params: {page},
	});
}
</script>

<style lang="less" scoped>
.search-input {
	// width: 20rem;
}
.search-btn {
	margin-left: 2rem;
}

.search-select {
	width: 8rem;
}
.top {
	display: flex;
	margin: 3rem 10rem 0rem;
}

@media only screen and (min-width: 1200px) {
	.top {
		margin: 3rem 10rem 0;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.top {
		margin: 2rem 6rem 0;
	}
}

@media only screen and (max-width: 767px) {
	.top {
		margin: 1rem 0 0;
	}
}
</style>

<style src="@/style/manga-list.less" scoped lang="less"></style>
<style src="@/style/chapter-list.less" scoped lang="less"></style>
