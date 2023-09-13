<template>
	<div class="manga-list">
		<!-- 漫画列表 -->
		<div class="touch-dom">
			<div :class="['manga-list-box', { block: config.viewType === 'list' }]">
				<manga v-for="(i, k) in list" :key="k" :viewType="config.viewType" :mangaInfo="i"
					@contextmenu.prevent="context_menu(i, k)" />
			</div>
		</div>

		<!--分页组件-->
		<media-pager ref="pager" :count="count" :params-page="page" @page-change="page_change" />

		<!--功能菜单-->
		<rightSidebar :mangaInfo="mangaInfo" :menuPoster="menuPoster" @reload="page_change" />
	</div>
</template>

<script lang="ts">
export default { name: 'manga-list' };
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
import { useRoute } from 'vue-router';
import { get_poster } from '@/api';
import mangaApi from '@/api/manga';
import store, { config, pageSizeConfig, userConfig } from '@/store';
import { global_get } from '@/utils';
import manga from '@/components/manga.vue';
import mediaPager from '@/components/media-pager.vue';
import rightSidebar from './right-sidebar.vue';
import { mediaPageSize } from '@/store/page-size';

const route = useRoute();

let page = ref(1);
let count = ref(0);
let list = ref([]);
let mangaInfo = ref({});
let menuPoster = ref('');

const mediaId = computed<number>(() => {
	return Number(route.query.mediaId || global_get('mediaId'));
});

const defaultPageSize = computed<number>(() => {
	const screen = config.screenType;
	// @ts-ignore
	return Number(pageSizeConfig[screen][0]);
});

// 切换排序规则时 重新加载列表
watch(
	() => userConfig.order,
	() => {
		page_change();
	}
);

onMounted(() => {
	store.commit('switch_await', { running: 'mangaAwait', bool: true });
	reload();
	route.params.clear = '';

	touch_page_change();
});

onBeforeUnmount(() => {
	store.commit('switch_await', { running: 'mangaAwait', bool: false });
});

onActivated(() => {
	const clear = route.params.clear;

	if (clear) {
		reload();
		route.params.clear = '';
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
		// 得到初始的手指坐标
		startX = e.targetTouches[0].pageX;
		// 获取盒子坐标
		x = this.offsetLeft;
	})

	listDom.addEventListener('touchmove', function (this: HTMLDivElement, e: any) {
		// 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
		moveX = e.targetTouches[0].pageX - startX;
		// 移动盒子，盒子原来的位置+手指移动的距离
		this.style.left = x + moveX + 'px';
		// 阻止屏幕滚动行为
		e.preventDefault();
	})

	listDom.addEventListener('touchend', function (this: HTMLDivElement, e) {
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

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(
	pageParams = 1,
	pageSize: number = defaultPageSize.value
) {
	
	if (pageParams !== 1 && pageParams > Math.ceil(count.value / pageSize)) return;
	if (pageParams < 1) return;
	page.value = pageParams;
	
	const res = await mangaApi.get(mediaId.value, page.value, pageSize, userConfig.order);
	list.value = res.list;
	count.value = res.count;

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
function context_menu(mangaInfoProps: any, key: number) {
	menuPoster.value = (list.value[key] as any).blob;
	mangaInfo = mangaInfoProps;
	config.rightSidebar = true;
}
</script>

<style src="@/style/manga-list.less" scoped lang="less"></style>
