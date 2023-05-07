<template>
	<div class="manga-list">
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

		<!--功能菜单-->
		<rightSidebar
			:mangaInfo="mangaInfo"
			:menuPoster="menuPoster"
			@reload="page_change" />
	</div>
</template>

<script lang="ts">
export default {name: 'manga-list'};
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
import {useRoute} from 'vue-router';
import {get_poster} from '@/api';
import {get_manga} from '@/api/manga';
import store, {config, pageSizeConfig, userConfig} from '@/store';
import {global_get} from '@/utils';
import manga from '@/components/manga.vue';
import mediaPager from '@/components/media-pager.vue';
import rightSidebar from './right-sidebar.vue';
import {mediaPageSize} from '@/store/page-size';

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
	store.commit('switch_await', {running: 'mangaAwait', bool: true});
	reload();
	route.params.clear = '';
});

onBeforeUnmount(() => {
	store.commit('switch_await', {running: 'mangaAwait', bool: false});
});

onActivated(() => {
	const clear = route.params.clear;

	if (clear) {
		reload();
		route.params.clear = '';
	}
});

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(
	pageC = 0,
	pageSize: number = defaultPageSize.value
) {
	if (pageC) {
		page.value = pageC;
	}

	const start = (page.value - 1) * pageSize;
	const res = await get_manga(mediaId.value, start, pageSize, userConfig.order);
	list.value = res.data.list;
	// list.push(...res.data.list)
	count = res.data.count;

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
