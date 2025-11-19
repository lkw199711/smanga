<template>
	<div class="browse-view">
		<!--目录列表-->
		<chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter"
			@change_chapter="change_chapter" />

		<!-- 书签 -->
		<bookmark />

		<!-- 下拉刷新 -->
		<van-pull-refresh v-model="loading" @refresh="before_page">
			<!-- 列表 -->
			<div @click="switch_menu" id="flowList" ref="flowList">
				<van-list v-model:loading="loading" :finished="finished" :immediate-check="false"
					@load="() => { queue.flowQueue.add(page_change) }">
					<img :style="browse.flowViewStyle" :ref="'flow-' + index" class="list-img"
						v-for="(image, index) in browse.imageFileList" :src="image" :key="image"
						:alt="t('browse.imgLoadError')" @click="load_image(index)" />
				</van-list>
			</div>
		</van-pull-refresh>

		<!-- 翻页按钮 -->
		<div class="btn-box" v-show="browse.imageFileList.length">
			<el-button class="btn" type="warning" plain @click="before_chapter">上一章</el-button>
			<el-button class="btn" type="success" plain @click="next_chapter">下一章</el-button>
		</div>

		<!-- 页码 -->
		<page-number :page="currentPage" :count="browse.pageCount" />

		<div class="bottom" v-if="browse.pageCount > 0" v-show="config.browseTop">
			<el-slider class="bottom-slider" v-model="currentPage" :min="1" :max="browse.pageCount" @change="jump_page(currentPage)"/>
		</div>

		<!-- 功能菜单 -->
		<right-sidebar @dwonload="dwonload_image" @jumpPageNumber="open_jump_dialog"
			@set_image_width="browse.dialogViewWidth = true" />

		<!-- 安卓端占位符 -->
		<div class="bottom-seat" v-if="config.android"></div>
	</div>

	<el-dialog v-model="dialogJumpPage" :title="t('browse.jumpPageTitle')" class="dialog-jump-page">
		<template v-if="!showSmallJumpPage">
			<el-slider v-model="targetPage" show-input :min="1" :max="browse.pageCount" />
		</template>
		<template v-else>
			<el-slider v-model="targetPage" :min="1" :max="browse.pageCount" />

			<el-input-number v-model="targetPage" :min="1" :max="browse.pageCount" />
		</template>
		<div class="jump-page-tips">{{ targetPage }} / {{ browse.pageCount }}</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="dialogJumpPage = false">{{ t('option.cancel') }}</el-button>
				<el-button type="primary" @click="jump_page">
					{{ t('option.confirm') }}
				</el-button>
			</div>
		</template>
	</el-dialog>

	<!-- 调整图片宽度 -->
	<el-dialog v-model="browse.dialogViewWidth" :title="t('browse.title.setViewWidth')" class="dialog-jump-page">
		<p>{{ t('browse.label.useAutoViewWidth') }}</p>
		<el-switch v-model="browse.useAutoViewWidth" />
		<template v-if="!browse.useAutoViewWidth">
			<p>{{ t('browse.label.setViewWidth') }}</p>
			<el-slider v-model="browse.viewWidthValue" :min="0" :max="100" />
		</template>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="browse.dialogViewWidth = false">{{ t('option.cancel') }}</el-button>
				<el-button type="primary" @click="() => { browse.set_view_width('flow') }">
					{{ t('option.confirm') }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts">
export default { name: 'browse-views' }
</script>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import imageApi from '@/api/image';
import { delay, window_go_top } from '@/utils';
import { config, userConfig } from '@/store';
import i18n from '@/i18n';
import chapterListMenu from './components/chapter-list-menu.vue';
import rightSidebar from './components/right-sidebar.vue';
import bookmark from './components/bookmark.vue';
import pageNumber from './components/page-number.vue';
import { useRoute, useRouter } from 'vue-router';
import chapterApi from '@/api/chapter';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
import _ from 'lodash';
const { t } = i18n.global;
const route = useRoute();
const router = useRouter();
const browse = useBrowseStore();

// 跳页弹框
let dialogJumpPage = ref(false)
// 跳页目标页码
let targetPage = ref(1)

const showSmallJumpPage = computed(() => {
	return ['mini', 'small'].includes(config.screenType)
})

// 当前真实页码 从零开始
let page = 1;
// 是否正在加载图片
const loading = ref(false);
// 是否加载完全部图片
let finished = ref(false);
let lastImageShown = ref(false);
// ref dom
const flowList = ref();

// 表现页码 未必从零开始
let currentPage = ref(1);

// 在中途加载 前置没有加载的页面数量
let beforeBookMark = 0;

watch(currentPage, (currentPage) => {
	const pageImage = browse.imagePathList[currentPage - beforeBookMark - 1];
	// 记录页码
	browse.page = currentPage;
	// 记录当前图片
	browse.pageImage = pageImage;
	// 保存阅读记录
	browse.save_latest(lastImageShown.value);
})

/**
 * 加载图片
 */
async function page_change() {
	// 无数据 退出
	if (!browse.imagePathList?.length) {
		loading.value = false;
		return;
	}

	// 是否加载完全部
	finished.value = page >= browse.imagePathList.length;

	// 加载页面并等待返回
	await load_image(page - 1);

	// 页码递增
	++page;

	const screenHeight = window.screen.height;
	const listHeight = flowList.value?.scrollHeight || 0;
	if (userConfig.loadAllFlowIamge && page < browse.imagePathList.length) {
		// 如果开启了自动加载所有图片 则继续加载下一页
		queue.flowQueue.add(page_change);
	} else if (listHeight < screenHeight && page < browse.imagePathList.length) {
		// 当图片列表小于屏幕高度时 继续加载图片
		queue.flowQueue.add(page_change)
	}
}

/**
 * @description: 上一页
 * @return {*}
 */
async function before_page() {
	if (beforeBookMark === 0) {
		loading.value = false;
		return;
	}

	// 向前加载一页
	await load_image(--beforeBookMark, true);

	// 重新计算当前页码
	scroll_page();

	// 加载结束,更新状态
	loading.value = false;
}

/**
 * @description: 加载图片
 * @param {*} index
 * @param {*} errNum
 * @param {*} unshift
 * @return {*}
 */
async function load_image(index: number, unshift = false) {
	// 无数据 退出
	if (!browse.imagePathList[index]) return false;
	const mangaId = Number(route.query.mangaId);
	const chapterId = Number(route.query.chapterId);
	const res = await imageApi.chapter_img(browse.imagePathList[index], index + 1, chapterId, mangaId)

	if (unshift) {
		browse.imageFileList.unshift(res);
	} else {
		browse.imageFileList[index - beforeBookMark] = res;
	}

	// 加载结束,更新状态
	loading.value = false;

	return true;
}

/**
 * 重载页面
 */
async function reload_page(clearPage = true, pageParams = 1) {
	// 加载路由参数
	browse.load_route_params(route);
	// 加载章节列表
	browse.load_chapter_list();
	// 清空之前图片内容
	browse.imageFileList = [];

	// 重置图片数据
	// 与其他模式不通 条漫重置页码需要重置滚动条
	if (clearPage) {
		browse.imagePathList = [];
		browse.imageFileList = [];
		beforeBookMark = pageParams - 1;
		currentPage.value = pageParams;
		page = pageParams;
		// 重置滚动条
		window_go_top();
	}

	// 加载图片列表
	const chapterId = Number(route.query.chapterId);
	const res = await chapterApi.get_images(chapterId);
	switch (res.state) {
		case 'uncompressed':
			setTimeout(() => {
				reload_page(false);
			}, 2000);
			break;
		case 'compressing':
			// 进度有所增加 则更新图片列表
			if (res.list.length > browse.imageFileList.length) {
				browse.imagePathList = res.list;
				finished.value = false;
				queue.flowQueue.add(page_change);
			}
			// 再次加载解压进度
			setTimeout(() => {
				reload_page(false);
			}, 2000);
			break;
		case 'compressed':
			browse.imagePathList = res.list;
			queue.flowQueue.add(page_change);
			break;
		default:
			browse.imagePathList = res.list;
			queue.flowQueue.add(page_change);
	}

	browse.save_history();
}

/**
 * 上一页
 * */
async function before_chapter() {
	const index = browse.currentChapterIndex;
	const chapterList = browse.chapterList;

	if (index == 0) {
		msg(t('page.firstChapter'));
		return false;
	}

	if (!index) return;

	const beforeChapterId = chapterList[index - 1].chapterId;

	await router.push({
		name: route.name as string,
		query: {
			...route.query,
			chapterId: beforeChapterId,
		}
	});

	reload_page();
}

/**
 * 下一页
 * */
async function next_chapter() {
	const index = browse.currentChapterIndex;
	const chapterList = browse.chapterList;

	if (index == chapterList.length - 1) {
		msg(t('page.lastChapter'));
		return false;
	}

	const nextChapterId = chapterList[index + 1].chapterId;

	await router.push({
		name: route.name as string,
		query: {
			...route.query,
			chapterId: nextChapterId,
		}
	});

	reload_page();
}
/**
 * 选择章节
 * @param index
 */
async function change_chapter(chapterId: number) {
	await router.push({
		name: route.name as string,
		query: {
			...route.query,
			chapterId: chapterId,
		},
	});

	reload_page();
}

// 阅读状态控制
function switch_menu() {
	config.browseTop = !config.browseTop;
}

/**
 * @description: 绑定滚动事件 用以更新页码
 * @return {*}
 */
function scroll_page() {
	const flowListDom = flowList.value;
	const scrollY = window.scrollY;
	const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

	if (!flowListDom) return 0;

	let imgs = flowListDom.getElementsByTagName('img');

	// 当滚动到页面底部 记录阅读完成
	lastImageShown.value = finished.value && scrollY > maxScrollY - 200;

	for (let i = 0; i < imgs.length; i++) {
		if (scrollY <= imgs[i].offsetTop) {
			currentPage.value = i + beforeBookMark + 1;
			return;
		}
	}
}

/**
 * 下载当前图片
 */
function dwonload_image() {
	// 获取当前图片
	const src = browse.imageFileList[currentPage.value - beforeBookMark - 1];

	const a = document.createElement('a');
	a.href = src;
	a.download = 'smangaImage.png';
	a.click();
}

function open_jump_dialog() {
	// 初始化目标页码为当前页码
	targetPage.value = currentPage.value;
	// 打开跳转对话框
	dialogJumpPage.value = true;
}

function jump_page(pageNum?: number) {
	if (pageNum) {
		targetPage.value = pageNum;
	}
	// return
	reload_page(true, targetPage.value);
}

// 生命周期
onMounted(() => {
	// 设置浏览模式
	config.browseType = 'flow';
	let page = browse.page || 1;

	// 部分旧代码将页码设置为0或者-1 这里做下更正
	if (page < 1) page = 1;

	reload_page(true, page);

	// 加载自定义视图宽度
	browse.load_view_width('flow');

// 原生
// window.addEventListener('scroll', scroll_page);

// 防抖
// window.addEventListener('scroll', _.debounce(scroll_page, 50), { passive: true });
// 节流
	window.addEventListener('scroll', _.throttle(scroll_page, 200), { passive: true });
})


</script>

<style src="./style/index.less" scoped lang="less"></style>
