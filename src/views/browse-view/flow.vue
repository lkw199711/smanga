<template>
  <div class="browse-view">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!-- 书签 -->
    <bookmark />
    
    <!-- 列表 -->
    <div v-pullRefresh="before_page">
      <div @mousedown="handleMouseDown" @mouseup="handleMouseUp" @touchstart="handleMouseDown" @touchend="handleMouseUp" id="flowList" ref="flowList" v-infinite-scroll="() => {
          queue.flowQueue.add(page_change);
        }
        " class="infinite-list" style="overflow: auto">
        <img :style="browseStore.flowViewStyle" :ref="'flow-' + index" class="list-img"
          v-for="(image, index) in browseStore.imageFileList" :src="image" :key="browseStore.imageFileList[index]"
          :alt="t('browse.imgLoadError')" draggable="false" @click="load_image(index)" />
      </div>
    </div>
    <!-- 翻页按钮 -->
    <div class="btn-box" v-show="browseStore.imageFileList.length">
      <el-button class="btn" type="warning" plain @click="before_chapter">上一章</el-button>
      <el-button class="btn" type="success" plain @click="next_chapter">下一章</el-button>
    </div>

    <!-- 页码 -->
    <page-number :page="currentPage" :count="browseStore.pageCount" />

    <div class="bottom" v-if="browseStore.pageCount > 0" v-show="config.browseTop">
      <el-slider class="bottom-slider" v-model="currentPage" :min="1" :max="browseStore.pageCount"
        @change="jump_page(currentPage)" />
    </div>

    <!-- 功能菜单 -->
    <right-sidebar @dwonload="dwonload_image" @jumpPageNumber="open_jump_dialog"
      @set_image_width="browseStore.dialogViewWidth = true" />

    <!-- 安卓端占位符 -->
    <div class="bottom-seat" v-if="config.android"></div>
  </div>

  <el-dialog v-model="dialogJumpPage" :title="t('browse.jumpPageTitle')" class="dialog-jump-page">
    <template v-if="!showSmallJumpPage">
      <el-slider v-model="targetPage" show-input :min="1" :max="browseStore.pageCount" />
    </template>
    <template v-else>
      <el-slider v-model="targetPage" :min="1" :max="browseStore.pageCount" />

      <el-input-number v-model="targetPage" :min="1" :max="browseStore.pageCount" />
    </template>
    <div class="jump-page-tips">{{ targetPage }} / {{ browseStore.pageCount }}</div>

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
  <el-dialog v-model="browseStore.dialogViewWidth" :title="t('browse.title.setViewWidth')" class="dialog-jump-page">
    <p>{{ t('browse.label.useAutoViewWidth') }}</p>
    <el-switch v-model="browseStore.useAutoViewWidth" />
    <template v-if="!browseStore.useAutoViewWidth">
      <p>{{ t('browse.label.setViewWidth') }}</p>
      <el-slider v-model="browseStore.viewWidthValue" :min="0" :max="100" />
    </template>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="browseStore.dialogViewWidth = false">{{ t('option.cancel') }}</el-button>
        <el-button type="primary" @click="
          () => {
            browseStore.set_view_width('flow');
          }
        ">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default { name: 'browse-views' };
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
const browseStore = useBrowseStore();

// 跳页弹框
let dialogJumpPage = ref(false);
// 跳页目标页码
let targetPage = ref(1);

const showSmallJumpPage = computed(() => {
  return ['mini', 'small'].includes(config.screenType);
});

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

watch(currentPage, currentPage => {
  const pageImage = browseStore.imagePathList[currentPage - beforeBookMark - 1];
  // 记录页码
  browseStore.page = currentPage;
  // 记录当前图片
  browseStore.pageImage = pageImage;
  // 保存阅读记录
  browseStore.save_latest(lastImageShown.value);
});

/**
 * 加载图片
 */
async function page_change() {
  // 无数据 退出
  if (!browseStore.imagePathList?.length) {
    loading.value = false;
    return;
  }

  // 是否加载完全部
  finished.value = page >= browseStore.imagePathList.length;

  // 加载页面并等待返回
  await load_image(page - 1);

  // 页码递增
  ++page;

  const screenHeight = window.screen.height;
  const listHeight = flowList.value?.scrollHeight || 0;
  if (userConfig.loadAllFlowIamge && page < browseStore.imagePathList.length) {
    // 如果开启了自动加载所有图片 则继续加载下一页
    queue.flowQueue.add(page_change);
  } else if (listHeight < screenHeight && page < browseStore.imagePathList.length) {
    // 当图片列表小于屏幕高度时 继续加载图片
    queue.flowQueue.add(page_change);
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
  if (!browseStore.imagePathList[index]) return false;
  const mangaId = Number(route.query.mangaId);
  const chapterId = Number(route.query.chapterId);
  const res = await imageApi.chapter_img(browseStore.imagePathList[index], index + 1, chapterId, mangaId);

  if (unshift) {
    browseStore.imageFileList.unshift(res);
  } else {
    browseStore.imageFileList[index - beforeBookMark] = res;
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
  browseStore.load_route_params(route);
  // 加载章节列表
  browseStore.load_chapter_list();
  // 清空之前图片内容
  browseStore.imageFileList = [];

  // 重置图片数据
  // 与其他模式不通 条漫重置页码需要重置滚动条
  if (clearPage) {
    browseStore.imagePathList = [];
    browseStore.imageFileList = [];
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
      if (res.list.length > browseStore.imageFileList.length) {
        browseStore.imagePathList = res.list;
        finished.value = false;
        queue.flowQueue.add(page_change);
      }
      // 再次加载解压进度
      setTimeout(() => {
        reload_page(false);
      }, 2000);
      break;
    case 'compressed':
      browseStore.imagePathList = res.list;
      queue.flowQueue.add(page_change);
      break;
    default:
      browseStore.imagePathList = res.list;
      queue.flowQueue.add(page_change);
  }

  browseStore.save_history();
}

/**
 * 上一页
 * */
async function before_chapter() {
  const index = browseStore.currentChapterIndex;
  const chapterList = browseStore.chapterList;

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
    },
  });

  reload_page();
}

/**
 * 下一页
 * */
async function next_chapter() {
  const index = browseStore.currentChapterIndex;
  const chapterList = browseStore.chapterList;

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
    },
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

// 点击时间控制变量
let clickStartTime = 0;
const CLICK_TIME_THRESHOLD = 200; // 点击时间阈值，超过这个时间被认为是长按

// 处理鼠标/触摸按下
function handleMouseDown() {
  clickStartTime = Date.now();
}

// 处理鼠标/触摸松开
function handleMouseUp() {
  const clickDuration = Date.now() - clickStartTime;
  // 只有当点击时间小于阈值时才认为是有效点击
  if (clickDuration < CLICK_TIME_THRESHOLD) {
    switch_menu();
  }
}

// 阅读状态控制
function switch_menu() {
  if (browseStore.pulling) return;
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
  const src = browseStore.imageFileList[currentPage.value - beforeBookMark - 1];

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
  let page = browseStore.page || 1;

  // 部分旧代码将页码设置为0或者-1 这里做下更正
  if (page < 1) page = 1;

  reload_page(true, page);

  // 加载自定义视图宽度
  browseStore.load_view_width('flow');

  // 原生
  // window.addEventListener('scroll', scroll_page);

  // 防抖
  // window.addEventListener('scroll', _.debounce(scroll_page, 50), { passive: true });
  // 节流
  window.addEventListener('scroll', _.throttle(scroll_page, 200), { passive: true });
});
</script>

<style src="./style/index.less" scoped lang="less"></style>
