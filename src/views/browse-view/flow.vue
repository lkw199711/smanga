<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-08-25 10:45:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 01:39:09
 * @FilePath: /smanga/src/views/browse-view/flow.vue
-->
<template>
	<div class="browse-view">
		<!--目录列表-->
		<chapter-list-menu @before="before" @next="next" @changeChapter="change_chapter" />

		<!-- 书签 -->
		<bookmark :page="currentPage" :chapterId="chapterInfo.chapterId" />

		<!-- 下拉刷新 -->
		<van-pull-refresh v-model="loading" @refresh="before_page">
			<!-- 列表 -->
			<div @click="switch_menu" id="flowList" ref="flowList">
				<van-list v-model:loading="loading" :finished="finished" :immediate-check="false" @load="page_change">
					<img :ref="'flow-' + i" class="list-img" v-for="(k, i) in imgFileList" :src="k" :key="k" alt="图片加载失败,点击重新加载" @click="load_image(i)" />
				</van-list>
			</div>
		</van-pull-refresh>

		<!-- 翻页按钮 -->
		<div class="btn-box" v-show="imgFileList.length">
			<el-button class="btn" type="warning" plain @click="before">上一章</el-button>
			<el-button class="btn" type="success" plain @click="next">下一章</el-button>
		</div>

		<!-- 页码 -->
		<page-number :page="currentPage" :count="imgPathList.length" />

		<!-- 功能菜单 -->
		<right-sidebar @dwonload="dwonload_image" />

		<!-- 安卓端占位符 -->
		<div class="bottom-seat" v-if="config.android"></div>
	</div>
</template>

<script lang="ts">
export default { name: 'browse-views' }
</script>
<script setup lang="ts">
import { computed, watch, ref, reactive } from 'vue';
import { get_image_blob } from '@/api';
import {
	global_get_array,
	global_set,
	global_set_json,
	window_go_top,
} from '@/utils';
import { ElMessage as msg } from 'element-plus';
import { config } from '@/store';
import { add_history } from '@/api/history';
import { get_chapter_images } from '@/api/browse';
import i18n from '@/i18n';
import { onMounted } from 'vue';
import chapterListMenu from './components/chapter-list-menu.vue';
import rightSidebar from './components/right-sidebar.vue';
import bookmark from './components/bookmark.vue';
import pageNumber from './components/page-number.vue';
import { useRoute, useRouter } from 'vue-router';
import { chapterInfoType } from '@/type/chapter';
import { nextTick } from 'vue';
const { t } = i18n.global;
const route = useRoute();
const router = useRouter();
// 数据

// 图片文件列表
let imgFileList = ref<string[]>([]);
// 图片路径列表
let imgPathList = ref<string[]>([]);
// 当前图片页码
let page = 1;
// 初始加载页码数量
const initPage = 3;
// 是否正在加载图片
const loading = ref(false);
// 是否加载完全部图片
let finished = ref(false);

const flowList = ref();

const chapterList = computed(() => { return global_get_array('chapterList') })

const index = computed<number>(() => {
	const list = chapterList.value;
	const chapterId = Number(route.query.chapterId);

	for (let i = 0; i < list.length; i++) {
		if (chapterId === list[i].chapterId) {
			//缓存章节坐标
			global_set('chapterIndex', i);
			return i;
		}
	}

	return -1;
})

let chapterInfo = reactive<chapterInfoType>({
	chapterId: 0,
	chapterPath: '',
	chapterType: 'img',
	browseType: '',
	chapterCover: '',
	chapterName: '',
	createTime: '',
	mangaId: 0,
	mediaId: 0,
	pathId: 0,
	picNum: 0,
	updateTime: '',
})

// 正在浏览的页码
let currentPage = ref(1);

// 在中途加载 前置没有加载的页面数量
let beforeBookMark = 0;

/**
 * 加载图片
 */
async function page_change() {
	// 无数据 退出
	if (!imgPathList.value.length) {
		loading.value = false;
		return false;
	}

	// 加载页面并等待返回
	await load_image(page - 1);

	// 是否加载完全部
	finished.value = page >= imgPathList.value.length;

	// 页码递增
	++page;

	// 是否完成页面初始化加载,未完成则再次加载图片
	page < initPage && setTimeout(async () => {
		await page_change()
	}, 1000);
}

async function before_page() {
	if (beforeBookMark === 0) {
		loading.value = false;
		return;
	}

	// 向前加载一页
	await load_image(--beforeBookMark, 0, true);

	// 重新计算当前页码
	scroll_page();

	// 加载结束,更新状态
	loading.value = false;
}

async function load_image(index: number, errNum = 0, unshift = false) {
	// 重新请教超过三次 取消此图片加载
	if (errNum > 3) return false;

	const [res, err] = await get_image_blob(imgPathList.value[index]).then(res => [res, null]).catch(err => [null, err]);

	// 错误处理
	if (err) {
		setTimeout(() => {
			load_image(index, errNum + 1);
		}, 1000)
		return;
	}

	if (unshift) {
		imgFileList.value.unshift(res.data);
	} else {
		imgFileList.value[index - beforeBookMark] = res.data;
	}

	// 加载结束,更新状态
	loading.value = false;

	return true;
}

/**
 * 重载页面
 */
async function reload_page(addHistory = true, clearPage = true, pageParams = 1) {
	// 初始化chapterInfo
	if (!chapterInfo.chapterId) chapterInfo.chapterId = Number(route.query.chapterId);

	// 重置图片数据
	if (clearPage) {
		imgPathList.value = [];
		imgFileList.value = [];
		beforeBookMark = pageParams - 1;
		currentPage.value = pageParams;
		page = pageParams;
		// 重置滚动条
		window_go_top();
	}

	if (addHistory) {
		add_history();
	}

	const res = await get_chapter_images(chapterInfo.chapterId);

	switch (res.data.status) {
		case 'uncompressed':
			setTimeout(() => {
				reload_page(false);
			}, 2000);
			break;
		case 'compressing':
			// 进度有所增加 则更新图片列表
			if (res.data.list.length > imgFileList.value.length) {
				imgPathList.value = res.data.list;
				finished.value = false;
				page_change();
			}
			// 再次加载解压进度
			setTimeout(() => {
				reload_page(false, false);
			}, 2000);
			break;
		case 'compressed':
			imgPathList.value = res.data.list;
			page_change();
			break;
		default:
			imgPathList.value = res.data.list;
			page_change();
	}

	global_set_json('imgPathList', imgPathList.value);
}

function load_again() {
	finished.value = false;
}
/**
 * 上一页
 * */
async function before() {
	if (index.value == 0) {
		msg(t('page.firstChapter'));
		return false;
	}

	if (!index.value) return;

	chapterInfo = chapterList.value[index.value - 1];

	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, { chapterId: chapterInfo.chapterId, }),
		params: { page: 1 },
	});

	update_chapter_info();

	/**
	 * 刷新页面
	 * 自定义重载方法没有重置滚动条,导致vant list不断触发触底事件
	 * 因此暂时采用刷新页面的方式解决
	 */
	reload_page(true, true, 1);
}
/**
 * 下一页
 * */
async function next() {
	if (index.value == chapterList.value.length - 1) {
		msg(t('page.lastChapter'));
		return false;
	}

	chapterInfo = chapterList.value[index.value + 1];

	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, { chapterId: chapterInfo.chapterId, }),
		params: { page: 1 },
	});

	update_chapter_info();

	// 刷新页面
	reload_page(true, true, 1);
}
/**
 * 选择章节
 * @param index
 */
async function change_chapter(index: number) {
	chapterInfo = chapterList.value[index];
	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, {
			chapterId: chapterInfo.chapterId,
		}),
	});

	update_chapter_info();

	// 重载页面
	reload_page(true, true, 1);
}

function update_chapter_info() {
	if (!chapterInfo.chapterId) return;
	global_set('chapterId', chapterInfo.chapterId);
	global_set('chapterName', chapterInfo.chapterName);
	global_set('chapterPath', chapterInfo.chapterPath);
	global_set('chapterCover', chapterInfo.chapterCover);
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

	if (!flowListDom) return 0;

	let imgs = flowListDom.getElementsByTagName('img');

	for (let i = 0; i < imgs.length; i++) {
		if (scrollY <= imgs[i].offsetTop) {
			currentPage.value = i + beforeBookMark + 1;
			const pageImage = imgPathList.value[page - 1];
			global_set('page', currentPage.value);
			global_set('pageImage', pageImage);
			return;
		}
	}
}

/**
 * 下载当前图片
 */
function dwonload_image() {
	// 获取当前图片
	const src = imgFileList.value[currentPage.value - 1];

	const a = document.createElement('a');
	a.href = src;
	a.download = 'smangaImage.png';
	a.click();
}

// 生命周期
onMounted(() => {
	// 设置浏览模式
	config.browseType = 'flow';

	let page = Number(route.params.page) || 1;

	// 部分旧代码将页码设置为0或者-1 这里做下更正
	if (page < 1) page = 1;

	// 加载页面
	const notAddHistory = route.params.notAddHistory || false;

	reload_page(!notAddHistory, true, page);

	window.addEventListener('scroll', scroll_page);
})


</script>

<style src="./style/index.less" scoped lang="less"></style>
