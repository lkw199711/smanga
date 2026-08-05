<template>
  <div class="single-page">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar @dwonload="dwonload_image" @set_image_width="browseStore.dialogViewWidth = true" />

    <!--图片容器-->
    <div
      class="scroll"
      :class="{'is-auto-fit': browseStore.useAutoViewWidth}"
      @click="handleReaderClick"
      @pointerdown="handleReaderPointerDown"
      @pointermove="handleReaderPointerMove"
      @pointerup="handleReaderPointerUp"
      @pointercancel="handleReaderPointerCancel"
    >
      <div class="single-page-img-box" :style="{maxHeight: browseStore.useAutoViewWidth ? '100%' : 'none'}">
        <bookmark />
        <img
          :style="browseStore.singleViewStyle"
          class="single-page-img"
          :src="imgSrc"
          :alt="t('browse.imgLoadError')" />
      </div>
    </div>

    <!-- 解压缩指示器 -->
    <images-loader @page_change="page_change" :key="browseStore.chapterId" />

    <!-- 完成指示器 -->
    <finish-indicator :visible="page >= browseStore.pageCount" @nextChapter="next_chapter" />

    <!-- 页码显示 -->
    <page-number :page="page" :count="browseStore.pageCount" />

    <!--分页按钮-->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before_chapter">{{ $t('page.before') }}</el-button>

      <el-slider
        class="bottom-slider"
        v-model="page"
        :min="1"
        :max="browseStore.pageCount"
        @change="page_change(page)"
        v-if="browseStore.pageCount > 0 && userConfig.userSlider" />

      <browse-pager
        ref="pager"
        @pageChange="page_change"
        @reloadPage="reload_page"
        :page="page"
        :count="browseStore.pageCount"
        v-show="!userConfig.userSlider" />

      <el-button class="btn" type="success" plain @click="next_chapter">{{ $t('page.next') }}</el-button>
    </div>
  </div>

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
              browseStore.set_view_width('single');
            }
          ">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {config, userConfig} from '@/store';
import chapterListMenu from './components/chapter-list-menu.vue';
import bookmark from './components/bookmark.vue';
import browsePager from '@/components/browse-pager.vue';
import rightSidebar from './components/right-sidebar.vue';
import pageNumber from './components/page-number.vue';
import imagesLoader from './components/imagesLoader.vue';
import finishIndicator from './components/finish-indicator.vue';
import i18n from '@/i18n';
import {useRoute, useRouter} from 'vue-router';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
import sBlue from '@/assets/s-blue-high.png';
import {preloadReaderImage} from './utils/reader-image';
import {usePagedReaderNavigation} from './composables/use-paged-reader-navigation';
const {t} = i18n.global;

const route = useRoute();
const router = useRouter();

const imgSrc = ref(sBlue);
const page = ref(1);
const pager = ref();
const browseStore = useBrowseStore();
const loading = ref(false);
let pageRequestId = 0;

const {
  handleReaderClick,
  handleReaderPointerDown,
  handleReaderPointerMove,
  handleReaderPointerUp,
  handleReaderPointerCancel,
} = usePagedReaderNavigation({
  previous: beforePage,
  next: nextPage,
  canPrevious: () => !loading.value && page.value > 1,
  canNext: () => !loading.value && page.value < browseStore.pageCount,
  toggleControls: toggle_controls,
  isReversed: () => userConfig.pageTurningReverse,
});

/**
 * 页码变更
 * @param page
 */
/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  page.value = pageParams;
  const pageImage = browseStore.imagePathList[pageParams - 1];
  const requestId = ++pageRequestId;
  loading.value = true;
  try {
    const nextSrc = await imageApi.get({file: pageImage});
    await preloadReaderImage(nextSrc);
    if (requestId !== pageRequestId) return;

    imgSrc.value = nextSrc;

    browseStore.imageLoaded = true;
    browseStore.page = pageParams;
    browseStore.pageImage = pageImage;
    browseStore.save_latest();
  } finally {
    if (requestId === pageRequestId) loading.value = false;
  }
}

/**
 * 上一页
 */
function beforePage() {
  if (loading.value) return false;
  if (page.value > 1) {
    return page_change(page.value - 1);
  } else {
    ElMessage.warning(t('page.firstPage'));
    return false;
  }
}

/**
 * 下一页
 */
function nextPage() {
  if (loading.value) return false;
  if (page.value < browseStore.pageCount) {
    return page_change(page.value + 1);
  } else {
    ElMessage.warning(t('page.lastPage'));
    return false;
  }
}

/**
 * 重载页面
 */
async function reload_page() {
  // 加载路由参数
  browseStore.load_route_params(route);
  // 加载章节列表
  browseStore.load_chapter_list();
  // 清空之前图片内容
  browseStore.imageFileList = [];

  browseStore.save_history();
}

/**
 * 上一章
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
 * 下一章
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
  await router.replace({
    name: route.name === 't-reader' ? 't-reader' : route.name as string,
    params: route.name === 't-reader' ? { chapterId } : {},
    query: {
      ...route.query,
      chapterId: chapterId,
    },
  });

  // 重载页面
  reload_page();
}

// 顶栏与底栏作为一组显示/隐藏，避免出现只有一侧控件可见的中间状态。
function toggle_controls() {
  const visible = !(config.browseTop || config.browseFooter);
  config.browseTop = visible;
  config.browseFooter = visible;
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

onMounted(() => {
  // 设置浏览模式
  config.browseType = 'single';

  reload_page();

  // 加载自定义视图宽度
  browseStore.load_view_width('single');

});

// 订阅 control-panel 触发的阅读器操作
watch(() => browseStore.readerActionTick.download, (v, ov) => { if (v > (ov || 0)) dwonload_image(); });
watch(() => browseStore.readerActionTick.jumpToPage, (v, ov) => { if (v > (ov || 0) && browseStore.pendingJumpPage) page_change(browseStore.pendingJumpPage); });
watch(() => browseStore.readerActionTick.setImageWidth, (v, ov) => { if (v > (ov || 0)) browseStore.dialogViewWidth = true; });
watch(() => browseStore.readerActionTick.beforeChapter, (v, ov) => { if (v > (ov || 0)) before_chapter(); });
watch(() => browseStore.readerActionTick.nextChapter, (v, ov) => { if (v > (ov || 0)) next_chapter(); });
watch(() => browseStore.readerActionTick.changeChapter, (v, ov) => { if (v > (ov || 0) && browseStore.pendingChangeChapterId) change_chapter(browseStore.pendingChangeChapterId); });
</script>

<style src="./style/single-page.less" scoped lang="less"></style>

<style src="./style/pagination.less" scoped lang="less"></style>
