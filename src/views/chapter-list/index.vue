<template>
	<div class="chapter-list">
		<!-- 章节列表 -->
		<div class="touch-dom">
			<!-- 加载骨架屏 -->
			<template v-if="loading">
				<list-skeleton />
			</template>
			<template v-else>
				<div :class="['chapter-list-box', { block: config.viewType === 'list' }]">
					<chapter v-for="(i, k) in list" :key="k" :view-type="config.viewType" :chapterInfo="i"
						@click="go_browse(i)" @contextmenu.prevent="context_menu(i, k)" />
				</div>
			</template>
		</div>

		<!--分页组件-->
		<media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

		<!--功能菜单-->
		<right-sidebar :chapterInfo="chapterInfo" :rightSidebarVisible="rightSidebarVisible" @reload="page_change"
			@close="() => { rightSidebarVisible = false }" />
	</div>
</template>

<script lang="ts">
export default { name: 'chapter-list' };
</script>
<script lang="ts" setup>
import {
	watch,
	onMounted,
	ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import chapterApi from '@/api/chapter';
import { config, userConfig } from '@/store';
import { global_set_json } from '@/utils';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import listSkeleton from '@/components/list-skeleton.vue';
import rightSidebar from './right-sidebar.vue';
import { screenType } from '@/type/store';
import { chapterPageSize } from '@/store/page-size';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();

const route = useRoute();
const router = useRouter();

let page = ref(1);
let count = ref(-1);
let list = ref([]);
let chapterInfo = ref({});
let loading = ref(false);

let pageSizes: number[] = [];
let defaultPageSize = 10;
let rightSidebarVisible = ref(false);

get_page_size_array();

function get_page_size_array() {
	// 获取默认的页面容量
	const screen: screenType = config.screenType;

	pageSizes = chapterPageSize[screen];
	defaultPageSize = chapterPageSize[screen][0];
}

const mangaId = Number(route.query.mangaId);

// 切换排序规则时 重新加载列表
watch(
	() => userConfig.order,
	() => {
		page_change();
	}
);

onMounted(() => {
	load();
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

function go_browse(item: any) {
	const newUrl = router.resolve({
		name: item.browseType,
		query: {
			mediaId: item.mediaId,
			mangaId: item.mangaId,
			chapterId: item.chapterId
		}
	});

	window.open(newUrl.href, '_blank');
}
/**
 * 打开右侧菜单
 */
function context_menu(info: any, key: number) {
	chapterInfo.value = info;
	rightSidebarVisible.value = true;
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

	if (pageParams !== 1 && count.value !== -1 && pageParams > Math.ceil(count.value / pageSize)) return;
	if (pageParams < 1) return;

	// 获取页码
	page.value = pageParams;
	// 加载骨架屏
	loading.value = true;
	// 取消封面加载任务
	queue.mangaQueue.clear();
	// 清空数据 避免缓存
	list.value = [];

	const res = await chapterApi.get(
		mangaId,
		page.value,
		pageSize,
		userConfig.order
	);
	list.value = res.list;
	count.value = res.count;

	// 结束加载
	loading.value = false;

	// 缓存页码信息
	browse.chapterListPage = page.value;
	browse.chapterListPageSize = pageSize;
}

function load() {
	list.value = [];
	page_change(browse.chapterListPage, browse.chapterListPageSize);
}
</script>

<style src="@/style/chapter-list.less" scoped lang="less"></style>
