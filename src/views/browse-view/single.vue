<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:31
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-03-14 19:28:01
 * @FilePath: \smanga\src\views\browse-view\single.vue
-->
<template>
  <div class="single-page">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar @dwonload="dwonload_image" />

    <!--图片容器-->
    <div class="single-page-img-box touch-dom">
      <bookmark />
      <img class="single-page-img" :src="imgSrc" :alt="t('browse.imgLoadError')" @click.stop="switch_menu" />
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
        @switch-footer="switch_footer"></operation-cover>
    </div>

    <!-- 页码显示 -->
    <page-number :page="page" :count="browse.pageCount" />

    <!--分页按钮-->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before_chapter">{{ $t('page.before') }}</el-button>

      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :page="page" :count="browse.pageCount" />

      <el-button class="btn" type="success" plain @click="next_chapter">{{ $t('page.next') }}</el-button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { config, userConfig } from '@/store';
import operationCover from './components/operation-cover.vue';
import chapterListMenu from './components/chapter-list-menu.vue';
import bookmark from './components/bookmark.vue';
import chapterApi from '@/api/chapter';
import browsePager from '@/components/browse-pager.vue';
import rightSidebar from './components/right-sidebar.vue';
import pageNumber from './components/page-number.vue';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
const { t } = i18n.global;

const route = useRoute();
const router = useRouter();

const imgSrc = ref('');
const page = ref(1);
const pager = ref();
const browse = useBrowseStore();

/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  page.value = pageParams
  const pageImage = browse.imagePathList[pageParams - 1];
  imgSrc.value = await imageApi.get(pageImage);

  browse.page = pageParams;
  browse.pageImage = pageImage;
  browse.save_latest();
}

/**
 * 上一页
 */
function beforePage() {
  pager.value.before();
}

/**
 * 下一页
 */
function nextPage() {
  pager.value.next();
}

/**
 * 重载页面
 */
async function reload_page(page = 1) {
  // 加载路由参数
  browse.load_route_params(route);
  // 加载章节列表
  browse.load_chapter_list();
  // 清空之前图片内容
  browse.imageFileList = [];


  // 加载图片列表
  const chapterId = Number(route.query.chapterId);
  const res = await chapterApi.get_images(chapterId);

  switch (res.state) {
    case 'uncompressed':
      setTimeout(() => {
        pager.value.reload();
      }, 2000);
      break;
    case 'compressing':
      browse.imagePathList = res.list;
      pager.value.page_change(page);
      setTimeout(() => {
        pager.value.reload();
      }, 2000);
      break;
    case 'compressed':
      browse.imagePathList = res.list;
      pager.value.page_change(page);
      break;
    default:
      browse.imagePathList = res.list;
      pager.value.page_change(page);
      break;
  }

  browse.save_history();
}

/**
 * 上一章
 * */
async function before_chapter() {
  const index = browse.currentChapterIndex;
  const chapterList = browse.chapterList;

  if (index == 0) {
    ElMessage.warning(t('page.firstChapter'));
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
 * 下一章
 * */
async function next_chapter() {
  const index = browse.currentChapterIndex;
  const chapterList = browse.chapterList;

  if (index == chapterList.length - 1) {
    ElMessage.warning(t('page.lastChapter'));
    return false;
  }

  const nextChapterId = chapterList[index + 1].chapterId;

  await router.push({
    name: route.name as string,
    query: {
      ...route.query,
      chapterId: nextChapterId,
    },
  });

  // 刷新页面
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

  // 重载页面
  reload_page();
}

// 阅读状态控制
function switch_menu() {
  config.browseTop = !config.browseTop;
}

function switch_footer() {
  config.browseFooter = !config.browseFooter;
}

/**
 * 下载当前图片
 */
function dwonload_image() {
  const src = imgSrc.value;

  const a = document.createElement('a');
  a.href = src;
  a.download = 'smangaImage.png';
  a.click();
}

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
    this.style.left = x + '0';

    // 向左滑动,向右翻页
    if (moveX < -100) {
      pager.value.next();
    }

    // 向右滑动,向左翻页
    if (moveX > 100) {
      pager.value.before();
    }

    moveX = 0;
  })
}

onMounted(() => {
  // 设置浏览模式
  config.browseType = 'single';
  const page = browse.page || 1;

  reload_page(page);

  if (userConfig.enableTouchPageChange) {
    touch_page_change();
  }

})
</script>

<style src='./style/single-page.less' scoped lang='less'></style>

<style src="./style/pagination.less" scoped lang="less"></style>
