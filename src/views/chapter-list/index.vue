<template>
	<div class="chapter-list">
		<!--章节列表-->
		<div class="touch-dom">
			<div :class="['chapter-list-box', { block: config.viewType === 'list' }]">
				<chapter v-for="(i, k) in list" :key="k" :view-type="config.viewType" :chapterInfo="i" @click="go_browse(i)"
					@contextmenu.prevent="context_menu(i, k)" />
			</div>
		</div>

		<!--分页组件-->
		<media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

		<!--功能菜单-->
		<right-sidebar :info="chapterInfo" :menuPoster="menuPoster" @reload="page_change" />
	</div>
</template>

<script lang="ts">
export default { name: 'chapter-list' };
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
import { useRoute, useRouter } from 'vue-router';
import chapterApi from '@/api/chapter';
import store, { config, pageSizeConfig, userConfig } from '@/store';
import { global_get, global_set, global_set_json } from '@/utils';
import chapterListMenu from './components/chapter-list-menu.vue';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import rightSidebar from './right-sidebar.vue';
import { screenType } from '@/type/store';
import { chapterPageSize } from '@/store/page-size';

const route = useRoute();
const router = useRouter();

let page = ref(1);
let count = ref(0);
let list = ref([]);
let chapterInfo = ref({});
let menuPoster = ref('');

let pageSizes: number[] = [];
let defaultPageSize = 10;

get_page_size_array();

function get_page_size_array() {
	// 获取默认的页面容量
	const screen: screenType = config.screenType;

	pageSizes = chapterPageSize[screen];
	defaultPageSize = chapterPageSize[screen][0];
}

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
	load();
	route.params.clear = '';

	touch_page_change();
});

function touch_page_change() {

	const listDom = document.querySelector('.touch-dom');
	if (listDom === null) return;

	// 获取手指初始坐标和盒子的原来位置
	var startX = 0;
	// 获取盒子原来的位置
	var x = 0;
	var moveX = 0;

	listDom.addEventListener('touchstart', function (this: HTMLDivElement, e: any) {
		if (config.viewType === 'list') return;
		// 得到初始的手指坐标
		startX = e.targetTouches[0].pageX;
		// 获取盒子坐标
		x = this.offsetLeft;
	})

	listDom.addEventListener('touchmove', function (this: HTMLDivElement, e: any) {
		if (config.viewType === 'list') return;
		// 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
		moveX = e.targetTouches[0].pageX - startX;
		// 移动盒子，盒子原来的位置+手指移动的距离
		this.style.left = x + moveX + 'px';
		// 阻止屏幕滚动行为
		e.preventDefault();
	})

	listDom.addEventListener('touchend', function (this: HTMLDivElement, e) {
		if (config.viewType === 'list') return;
		this.style.left = '0';

		// 向左滑动,向右翻页
		if (moveX < -100 && page.value < count.value) {
			page_change(++page.value);
		}

		// 向右滑动,向左翻页
		if (moveX > 100 && page.value > 1) {
			page_change(--page.value);
		}

		moveX = 0;
	})
}

onActivated(() => {
	const clear = route.params.clear;
	if (clear) {
		load();
		route.params.clear = '';
	}
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

	router.push({
		name: browseType.value,
		query: {
			chapterId
		},
		params: { page },
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
	pageParams = 1,
	pageSize: number = defaultPageSize
) {

	if (pageParams !== 1 && pageParams > Math.ceil(count.value / pageSize)) return;
	if (pageParams < 1) return;
	page.value = pageParams;

	const res = await chapterApi.get(
		mangaId.value,
		page.value,
		pageSize,
		userConfig.order
	);
	list.value = res.list;
	count.value = res.count;
}

/**
 * 获取全部漫画章节
 */
async function load_chapter() {
	const res = await chapterApi.get(mangaId.value);
	global_set_json('chapterList', res.list);
}

function load() {
	list.value = [];
	// 缓存浏览方式
	const browseType = route.params.browseType;
	if (browseType) global_set('browseType', browseType);

	load_chapter();
	page_change();
}
</script>

<style src="@/style/chapter-list.less" scoped lang="less"></style>
