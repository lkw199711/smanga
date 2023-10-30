<template>
	<div class="search">
		<div class="top">
			<tabs v-model="collectType" :items="items" @change="tabs_change"></tabs>
		</div>

		<div class="middle">
			<div class="manga-list" v-if="collectType === 'manga'">
				<div class="touch-dom">
					<div :class="['manga-list-box', { block: config.viewType === 'list' }]">
						<manga v-for="(i, k) in list" :key="k" :viewType="config.viewType" :mangaInfo="i"
							@contextmenu.prevent="context_menu(i, k)" />
					</div>
				</div>


				<!--分页组件-->
				<media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />
			</div>

			<div class="chapter-list" v-if="collectType === 'chapter'">
				<div class="touch-dom">
					<!--章节列表-->
					<div :class="['chapter-list-box', { block: config.viewType === 'list' }]">
						<chapter v-for="(i, k) in list" :key="k" :view-type="config.viewType" :chapterInfo="i"
							@click="go_browse(i)" @contextmenu.prevent="context_menu(i, k)" />
					</div>
				</div>

				<!--分页组件-->
				<media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default { name: 'collect' };
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
import { useRoute } from 'vue-router';
import store, { config, userConfig, pageSizeConfig } from '@/store';
import { search } from '@/api/search';
import router from '@/router';
import chapterApi from '@/api/chapter';
import { global_set, global_set_json } from '@/utils';
import manga from '@/components/manga.vue';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import { get_collect } from '@/api/collect';
import type { TabsPaneContext } from 'element-plus';
import tabs from './tabs.vue';
import i18n from '@/i18n';
import { pageSizeConfigType, screenType } from '@/type/store';
import { mangaPageSize, chapterPageSize } from '@/store/page-size';
const { t } = i18n.global;

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

const handleClick = (tab: TabsPaneContext, event: Event) => { };

const searchText = ref('');
const searchType = ref('manga');

const route = useRoute();

let page = ref(1);
let count = ref(0);
let list = ref([]);
let mangaInfo = ref({});
let menuPoster = '';

let pageSizes: number[] = [];
let defaultPageSize = 10;

get_page_size_array();

function get_page_size_array() {
	// 获取默认的页面容量
	const screen: screenType = config.screenType;

	const pageSizesConfig = searchType.value === 'manga' ? mangaPageSize : chapterPageSize;

	pageSizes = pageSizesConfig[screen];
	defaultPageSize = pageSizesConfig[screen][0];
}

// 切换排序规则时 重新加载列表
watch(
	() => userConfig.order,
	() => {
		page_change(1);
	}
);
onMounted(async () => {

	page_change();

	touch_page_change();
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

function tabs_change(val: string) {
	list.value = [];
	page_change();
	get_page_size_array();
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
	list.value = [];
	
	const res: any = await get_collect(
		collectType.value,
		page.value,
		pageSize,
		userConfig.order
	);
	list.value = res.data.list;
	count.value = res.data.count;
}

/**
 * 打开右侧菜单
 */
function context_menu(mangaInfo: any, key: number) {
	menuPoster = (list.value[key] as any).blob;
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
	const res = await chapterApi.get(item.mangaId);
	global_set_json('chapterList', res.list);

	let page = 1;

	router.push({
		name: browseType,
		query: {
			chapterId,
		},
		params: { page },
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
