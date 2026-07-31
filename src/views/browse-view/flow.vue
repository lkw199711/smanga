<template>
  <div class="browse-view">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!-- 书签 -->
    <bookmark />

    <!-- 列表 -->
    <div v-pullRefresh="before_page">
      <div v-if="config.android" @click="switch_menu" id="flowList" ref="flowList">
        <img
          :style="browseStore.flowViewStyle"
          :ref="'flow-' + index"
          class="list-img"
          v-for="(image, index) in browseStore.imageFileList"
          :src="image"
          :key="browseStore.imageFileList[index]"
          :alt="t('browse.imgLoadError')"
          draggable="false"
          @click="load_image(index)" />
      </div>
      <div v-else @mousedown="handleMouseDown" @mouseup="handleMouseUp" id="flowList" ref="flowList">
        <img
          :style="browseStore.flowViewStyle"
          :ref="'flow-' + index"
          class="list-img"
          v-for="(image, index) in browseStore.imageFileList"
          :src="image"
          :key="browseStore.imageFileList[index]"
          :alt="t('browse.imgLoadError')"
          draggable="false"
          @click="load_image(index)" />
      </div>
    </div>

    <!-- 页码 -->
    <page-number :page="currentPage" :count="browseStore.pageCount" />

    <!-- 解压缩指示器 -->
    <images-loader ref="imagesLoaderRef" @page_change="page_change" :key="browseStore.chapterId" />

    <!-- 阅读完成指示器 -->
    <finish-indicator :visible="lastImageShown" :disabled="isLastChapter" @nextChapter="next_chapter" />

    <!-- 章节过渡中间页 -->
    <div class="chapter-transition" v-if="finished && browseStore.imageFileList.length > 0">
      <div class="ct-end">
        <span class="ct-line"></span>
        <span class="ct-end-text">{{ t('browse.chapterEnd') }}</span>
        <span class="ct-line"></span>
      </div>
      <div class="ct-current">{{ browseStore.currentChapter?.chapterName }}</div>

      <template v-if="!isLastChapter">
        <div class="ct-next">
          <div class="ct-next-label">{{ t('page.next') }}</div>
          <div class="ct-next-name">{{ nextChapterName }}</div>
        </div>
        <div class="ct-progress-track">
          <div class="ct-progress-bar" :style="{width: overscrollProgress * 100 + '%'}"></div>
        </div>
        <div class="ct-tip">{{ t('browse.continueScrollNext') }}</div>
      </template>
      <div class="ct-tip" v-else>{{ t('page.lastChapter') }}</div>
    </div>

    <div class="bottom" v-if="browseStore.pageCount > 0" v-show="config.browseTop">
      <el-slider class="bottom-slider" v-model="currentPage" :min="1" :max="browseStore.pageCount" @change="jump_page(currentPage)" />
    </div>

    <!-- 功能菜单 -->
    <right-sidebar @dwonload="dwonload_image" @jumpPageNumber="open_jump_dialog" @set_image_width="browseStore.dialogViewWidth = true" />

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
        <el-button type="primary" @click="jump_page()">
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
        <el-button
          type="primary"
          @click="
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
export default {name: 'browse-views'};
</script>
<script setup lang="ts">
import {computed, ref, watch, onMounted, onUnmounted} from 'vue';
import {ElMessage} from 'element-plus';
import {useI18n} from 'vue-i18n';
import imageApi from '@/api/image';
import {delay, window_go_top} from '@/utils';
import {config, userConfig} from '@/store';
import i18n from '@/i18n';
import chapterListMenu from './components/chapter-list-menu.vue';
import rightSidebar from './components/right-sidebar.vue';
import bookmark from './components/bookmark.vue';
import pageNumber from './components/page-number.vue';
import finishIndicator from './components/finish-indicator.vue';
import imagesLoader from './components/imagesLoader.vue';
import {useRoute, useRouter} from 'vue-router';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
import _ from 'lodash';
const {t} = i18n.global;
const {t: vueI18nT} = useI18n();
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

// 是否已是最后一章(没有下一章时禁用下一章按钮)
const isLastChapter = computed(() => {
  const chapterList = browseStore.chapterList;
  return chapterList.length > 0 && browseStore.currentChapterIndex === chapterList.length - 1;
});

// 下一章名称(章节过渡页展示)
const nextChapterName = computed(() => {
  const next = browseStore.chapterList[browseStore.currentChapterIndex + 1];
  return next?.chapterName || '';
});

// ---- 滚动到底后继续滚动 自动进入下一章 ----
// 触发切章的累计滚动距离阈值(px)
const OVERSCROLL_THRESHOLD = 260;
// 到底后累计的越界滚动距离
const overscrollDelta = ref(0);
// 已触发切章 防止重复触发
const overscrollTriggered = ref(false);
// 触摸起点纵坐标
let overscrollTouchY = 0;

const overscrollProgress = computed(() => Math.min(overscrollDelta.value / OVERSCROLL_THRESHOLD, 1));
// 是否允许越界滚动切章: 图片全部加载完 且 已滚动到底部区域 且 存在下一章
const canOverscroll = computed(
  () => finished.value && lastImageShown.value && !isLastChapter.value && !overscrollTriggered.value
);

// 是否真正到达页面底部(lastImageShown 只表示接近底部)
function at_page_bottom() {
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  return maxScrollY > 0 && window.scrollY >= maxScrollY - 2;
}

function trigger_overscroll_next() {
  if (overscrollTriggered.value) return;
  overscrollTriggered.value = true;
  overscrollDelta.value = 0;
  next_chapter();
}

// PC端: 到底后继续滚动滚轮 累计距离达到阈值即切章
function handle_overscroll_wheel(e: WheelEvent) {
  if (!canOverscroll.value || !at_page_bottom() || e.deltaY <= 0) {
    overscrollDelta.value = 0;
    return;
  }
  overscrollDelta.value += e.deltaY;
  if (overscrollDelta.value >= OVERSCROLL_THRESHOLD) trigger_overscroll_next();
}

// 移动端: 到底后继续上滑 松手时达到阈值即切章
function handle_overscroll_touchstart(e: TouchEvent) {
  overscrollTouchY = e.touches[0]?.clientY ?? 0;
  overscrollDelta.value = 0;
}

function handle_overscroll_touchmove(e: TouchEvent) {
  const y = e.touches[0]?.clientY ?? 0;
  // 未到底部时不累计 并以当前位置作为新的起点
  if (!canOverscroll.value || !at_page_bottom()) {
    overscrollTouchY = y;
    overscrollDelta.value = 0;
    return;
  }
  overscrollDelta.value = Math.max(overscrollTouchY - y, 0);
}

function handle_overscroll_touchend() {
  if (canOverscroll.value && overscrollProgress.value >= 1) {
    trigger_overscroll_next();
    return;
  }
  overscrollDelta.value = 0;
}

// 当前真实页码 从零开始
let page = 1;
// 是否正在加载图片
const loading = ref(false);
// 是否加载完全部图片
let finished = ref(false);
let lastImageShown = ref(false);
// ref dom
const flowList = ref();
const imagesLoaderRef = ref();

// 表现页码 未必从零开始
let currentPage = ref(1);

// 在中途加载 前置没有加载的页面数量
let beforeBookMark = 0;

watch(
  [currentPage, () => browseStore.imagePathList.length],
  ([currentPage]) => {
    if (!browseStore.imagePathList?.length) return;
    const pageImage = browseStore.imagePathList[currentPage - beforeBookMark - 1] || '';
    // 记录页码
    browseStore.page = currentPage;
    // 记录当前图片
    browseStore.pageImage = pageImage;
    // 保存阅读记录
    queue.saveLatestQueue.add(() => browseStore.save_latest(lastImageShown.value));
  },
  { immediate: true }
);

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
  finished.value = page > browseStore.imagePathList.length;

  // 加载页面并等待返回
  await load_image(page - 1);

  // 加载完第一张图即可改变状态
  browseStore.imageLoaded = true;

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
  // 清空队列
  queue.flowQueue.clear();
  // 重置越界滚动切章状态
  overscrollDelta.value = 0;
  overscrollTriggered.value = false;
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

  browseStore.save_history();
}

/**
 * 上一页
 * */
async function before_chapter() {
  const index = browseStore.currentChapterIndex;
  const chapterList = browseStore.chapterList;

  if (index == 0) {
    ElMessage.warning(t('page.firstChapter'));
    return false;
  }

  if (!index) return;

  const beforeChapterId = chapterList[index - 1].chapterId;
  change_chapter(beforeChapterId);
}

/**
 * 下一页
 * */
async function next_chapter() {
  const index = browseStore.currentChapterIndex;
  const chapterList = browseStore.chapterList;

  if (index == chapterList.length - 1) {
    ElMessage.warning(t('page.lastChapter'));
    return false;
  }

  const nextChapterId = chapterList[index + 1].chapterId;
  change_chapter(nextChapterId);
}

/**
 * 选择章节
 * @param index
 */
async function change_chapter(chapterId: number) {
  browseStore.page = 1;
  browseStore.imagePathList = [];
  browseStore.imageFileList = [];
  await router.replace({
    name: route.name === 't-reader' ? 't-reader' : route.name as string,
    params: route.name === 't-reader' ? { chapterId } : {},
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
function handleMouseDown(event: MouseEvent) {
  // 如果不是左键 则不处理
  if (event.button !== 0) return;
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
  // 当前滚动高度
  const scrollY = window.scrollY;
  // 最大滚动高度
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

  if (!flowListDom) return 0;

  if (scrollY >= maxScrollY - 200) {
    Array(userConfig.flowLoadStep)
      .fill(0)
      .forEach(() => queue.flowQueue.add(page_change));
  }

  let imgs = flowListDom.getElementsByTagName('img');

  // 当滚动到页面底部 记录阅读完成
  lastImageShown.value = finished.value && maxScrollY > 0 && scrollY > maxScrollY - 500;
  // 保存阅读记录
  lastImageShown.value && queue.saveLatestQueue.add(() => browseStore.save_latest(lastImageShown.value));

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

async function jump_page(pageNum?: number) {
  console.log('jump_page', pageNum);
  if (pageNum) {
    targetPage.value = pageNum;
  }

  // 关闭跳页弹窗
  dialogJumpPage.value = false;

  // return
  reload_page(true, targetPage.value);

  // 调用imagesLoder组件的chapter_images_load方法重载图片路径数组
  if (imagesLoaderRef.value && imagesLoaderRef.value.chapter_images_load) {
    await imagesLoaderRef.value.chapter_images_load(browseStore.chapterId);
  }
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
  window.addEventListener('scroll', _.throttle(scroll_page, 200), {passive: true});

  // 到底后继续滚动切下一章
  window.addEventListener('wheel', handle_overscroll_wheel, {passive: true});
  window.addEventListener('touchstart', handle_overscroll_touchstart, {passive: true});
  window.addEventListener('touchmove', handle_overscroll_touchmove, {passive: true});
  window.addEventListener('touchend', handle_overscroll_touchend, {passive: true});
});

onUnmounted(() => {
  window.removeEventListener('wheel', handle_overscroll_wheel);
  window.removeEventListener('touchstart', handle_overscroll_touchstart);
  window.removeEventListener('touchmove', handle_overscroll_touchmove);
  window.removeEventListener('touchend', handle_overscroll_touchend);
});

// 订阅 control-panel 触发的阅读器操作
watch(() => browseStore.readerActionTick.download, (v, ov) => { if (v > (ov || 0)) dwonload_image(); });
watch(() => browseStore.readerActionTick.jumpPage, (v, ov) => { if (v > (ov || 0)) open_jump_dialog(); });
watch(() => browseStore.readerActionTick.jumpToPage, (v, ov) => { if (v > (ov || 0) && browseStore.pendingJumpPage) jump_page(browseStore.pendingJumpPage); });
watch(() => browseStore.readerActionTick.setImageWidth, (v, ov) => { if (v > (ov || 0)) browseStore.dialogViewWidth = true; });
watch(() => browseStore.readerActionTick.beforeChapter, (v, ov) => { if (v > (ov || 0)) before_chapter(); });
watch(() => browseStore.readerActionTick.nextChapter, (v, ov) => { if (v > (ov || 0)) next_chapter(); });
watch(() => browseStore.readerActionTick.changeChapter, (v, ov) => { if (v > (ov || 0) && browseStore.pendingChangeChapterId) change_chapter(browseStore.pendingChangeChapterId); });
</script>

<style src="./style/index.less" scoped lang="less"></style>

<style scoped lang="less">
// 章节过渡中间页
.chapter-transition {
  min-height: 52vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  padding: 4rem 2rem 6rem;
  color: #909399;
  user-select: none;

  .ct-end {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    .ct-line {
      width: 6rem;
      height: 1px;
      background: currentColor;
      opacity: 0.4;
    }

    .ct-end-text {
      font-size: 1.5rem;
      letter-spacing: 0.4rem;
    }
  }

  .ct-current {
    font-size: 1.3rem;
    opacity: 0.7;
  }

  .ct-next {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;

    .ct-next-label {
      font-size: 1.2rem;
      opacity: 0.6;
    }

    .ct-next-name {
      font-size: 1.6rem;
      font-weight: 600;
      color: #b8bcc2;
      text-align: center;
    }
  }

  .ct-progress-track {
    width: 18rem;
    height: 0.4rem;
    border-radius: 0.2rem;
    background: rgba(144, 147, 153, 0.25);
    overflow: hidden;
  }

  .ct-progress-bar {
    height: 100%;
    border-radius: 0.2rem;
    background: #4caf50;
    transition: width 0.1s linear;
  }

  .ct-tip {
    font-size: 1.3rem;
    opacity: 0.7;
  }
}
</style>
