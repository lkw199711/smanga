<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-08-25 10:45:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-24 11:44:10
 * @FilePath: /smanga/src/views/browse-view/flow.vue
-->
<template>
	<div class="browse-view">
		<!--目录列表-->
		<chapter-list-menu @before="before" @next="next" @changeChapter="change_chapter" />

		<!-- 书签 -->
		<bookmark :chapterId="chapterInfo.chapterId" />
		
		<!--列表-->
		<div @click="switch_menu">
			<van-list v-model:loading="loading" :finished="finished" :immediate-check="false" @load="load_img">
				<img class="list-img" v-for="(k, i) in imgFileList" :src="k" :key="i" alt="接收图片" />
			</van-list>
		</div>

		<!--翻页按钮-->
		<div class="btn-box" v-show="imgFileList.length">
			<el-button class="btn" type="warning" plain @click="before">上一章</el-button>
			<el-button class="btn" type="success" plain @click="next">下一章</el-button>
		</div>

		<!-- 安卓端占位符 -->
		<div class="bottom-seat" v-if="config.android"></div>
	</div>
</template>

<script lang="ts">
export default { name: 'browse-views' }
</script>
<script setup lang="ts">
import { computed, ref } from 'vue';
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
import bookmark from './components/bookmark.vue';
import { useRoute, useRouter } from 'vue-router';
const { t } = i18n.global;
const route = useRoute();
const router = useRouter();
// 数据

// 图片文件列表
let imgFileList = ref<string[]>([]);
// 图片路径列表
let imgPathList: string[] = [];
// 当前图片页码
let page = -1;
// 初始加载页码数量
const initPage = 3;
// 是否正在加载图片
const loading = ref(false);
// 是否正在重载页面
let refreshing = false;
// 是否加载完全部图片
let finished = ref(false);

const chapterList = computed(() => { return global_get_array('chapterList') })

const index = computed<number>(() => {
	const list = chapterList.value;
	const name = route.query.name;

	for (let i = 0; i < list.length; i++) {
		if (name === list[i].chapterName) {
			//缓存章节坐标
			global_set('chapterIndex', i);
			return i;
		}
	}

	return -1;
})

const chapterInfo = computed(() => { return chapterList.value[index.value] || {} })

// 方法

/**
 * 加载图片
 */
async function load_img() {
	const list = imgPathList;
	const init = initPage - 1;

	// if (this.loading) return;

	// 开启加载状态
	// this.loading = true;

	// 无数据 退出
	if (!list.length) {
		loading.value = false;
		return false;
	}

	// 页码递增
	++page;

	const res = await get_image_blob(list[page]);
	imgFileList.value[page] = res.data;
	// 加载结束,更新状态
	loading.value = false;
	refreshing = false;
	// 是否加载完全部
	finished.value = page >= imgPathList.length - 1;
	// 是否完成页面初始化加载,未完成则再次加载图片
	page < init && (await load_img());

	global_set('loadedImages', page);
}

/**
 * 重载页面
 */
async function reload_page(addHistory = true, clearPage = true, pageParams = -1) {
	// 重置图片数据
	if (clearPage) {
		imgFileList.value = [];
		page = pageParams;
		// 重置滚动条
		window_go_top();
	}

	if (addHistory) {
		add_history();
	}

	const res = await get_chapter_images();

	switch (res.data.status) {
		case 'uncompressed':
			setTimeout(() => {
				reload_page(false);
			}, 2000);
			break;
		case 'compressing':
			// 进度有所增加 则更新图片列表
			if (res.data.list.length > imgFileList.value.length) {
				imgPathList = res.data.list;
				finished.value = false;
				load_img();
			}
			// 再次加载解压进度
			setTimeout(() => {
				reload_page(false, false);
			}, 2000);
			break;
		case 'compressed':
			imgPathList = res.data.list;
			load_img();
			break;
		default:
			imgPathList = res.data.list;
			load_img();
	}

	global_set_json('imgPathList', imgPathList);
	global_set('loadedImages', page);
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

	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, {
			name: chapterList.value[index.value - 1].chapterName,
			path: chapterList.value[index.value - 1].chapterPath,
		}),
		params: { page: 1 },
	});

	update_chapter_info();

	/**
	 * 刷新页面
	 * 自定义重载方法没有重置滚动条,导致vant list不断触发触底事件
	 * 因此暂时采用刷新页面的方式解决
	 */
	reload_page();
}
/**
 * 下一页
 * */
async function next() {
	if (index.value == chapterList.value.length - 1) {
		msg(t('page.lastChapter'));
		return false;
	}

	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, {
			name: chapterList.value[index.value + 1].chapterName,
			path: chapterList.value[index.value + 1].chapterPath,
		}),
		params: { page: 1 },
	});

	update_chapter_info();

	// 刷新页面
	reload_page();
}
/**
 * 选择章节
 * @param index
 */
async function change_chapter(index: any) {
	await router.push({
		name: route.name as string,
		query: Object.assign({}, route.query, {
			name: chapterList.value[index].chapterName,
			path: chapterList.value[index].chapterPath,
		}),
	});

	update_chapter_info();

	// 重载页面
	reload_page();
}

function update_chapter_info() {
	const chapterInfoVal = chapterInfo.value;
	global_set('chapterId', chapterInfoVal.chapterId);
	global_set('chapterName', chapterInfoVal.chapterName);
	global_set('chapterPath', chapterInfoVal.chapterPath);
	global_set('chapterCover', chapterInfoVal.chapterCover);
}

// 阅读状态控制
function switch_menu() {
	config.browseTop = !config.browseTop;
}

// 生命周期
onMounted(() => {
	// 设置浏览模式
	config.browseType = 'flow';

	const page = Number(route.params.page) || 0;

	// 加载页面
	const notAddHistory = route.params.notAddHistory || false;
	reload_page(!notAddHistory, true, page - 1);
})


</script>

<style src="./style/index.less" scoped lang="less"></style>
