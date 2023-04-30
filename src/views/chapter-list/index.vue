<template>
	<div class="chapter-list">
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

		<!--功能菜单-->
		<right-sidebar
			:info="chapterInfo"
			:menuPoster="menuPoster"
			@reload="page_change" />
	</div>
</template>

<script lang="ts">
export default {name: 'chapter-list'};
</script>
<script lang="ts" setup>
import {
	computed,
	watch,
	onMounted,
	onBeforeUnmount,
	onActivated,
	ref,
} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {get_poster} from '@/api';
import {get_chapter} from '@/api/chapter';
import store, {config, pageSizeConfig, userConfig} from '@/store';
import {global_get, global_set, global_set_json} from '@/utils';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import rightSidebar from './right-sidebar.vue';

const route = useRoute();
const router = useRouter();

let page = ref(1);
let count = ref(0);
let list = ref([]);
let chapterInfo = ref({});
let menuPoster = ref('');

const defaultPageSize = computed<number>(() => {
	const screen = config.screenType;
	// @ts-ignore
	return Number(pageSizeConfig[screen][0]);
});

const mangaId = computed<number>(() => {
	return Number(route.query.mangaId || global_get('mangaId'));
});

const browseType = computed<string>(() => {
	return String(route.params.browseType || global_get('browseType'));
});

// 切换排序规则时 重新加载列表
watch(
	() => userConfig.order,
	() => {
		page_change();
	}
);

onMounted(() => {
	init();
	route.params.clear = '';
});

onBeforeUnmount(() => {
	store.commit('switch_await', {running: 'chapterAwait', bool: false});
});

onActivated(() => {
	// const clear = route.params.clear;

	// if (clear) {
	// 	init();
	// 	route.params.clear = '';
	// }
});

function go_browse(item: any) {
	const chapterId = item.chapterId;
	const chapterName = item.chapterName;
	const chapterPath = item.chapterPath;
	const chapterType = item.chapterType;
	const chapterCover = item.chapterCover;

	// 缓存章节信息
	global_set('chapterId', chapterId);
	global_set('chapterName', chapterName);
	global_set('chapterPath', chapterPath);
	global_set('chapterType', chapterType);
	global_set('chapterCover', chapterCover);

	let page = 1;
	if (browseType.value === 'flow') {
		page = 0;
	}

	router.push({
		name: browseType.value,
		query: {
			name: chapterName,
			path: chapterPath,
		},
		params: {page},
	});
}
/**
 * 打开右侧菜单
 */
function context_menu(info: any, key: number) {
	menuPoster.value = (list.value[key] as any).blob;
	chapterInfo.value = info;
	config.rightSidebar = true;
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
	if (page.value) {
		page.value = pageC;
	}

	const start = (page.value - 1) * pageSize;
	const res = await get_chapter(
		mangaId.value,
		start,
		pageSize,
		userConfig.order
	);
	list.value = res.data.list;
	count.value = res.data.count;

	// 为章节请求海报图片
	get_poster(list.value, 'chapterAwait');
}

/**
 * 获取全部漫画章节
 */
async function load_chapter() {
	const res = await get_chapter(mangaId.value);
	global_set_json('chapterList', res.data.list);
}

function init() {
	// 缓存浏览方式
	const browseType = route.params.browseType;
	if (browseType) global_set('browseType', browseType);

	store.commit('switch_await', {running: 'chapterAwait', bool: true});
	load_chapter();
	page_change();
}
</script>

<style src="@/style/chapter-list.less" scoped lang="less"></style>
