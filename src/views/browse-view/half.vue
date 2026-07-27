<template>
  <div class="single-page">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar @dwonload="dwonload_image" @set_image_width="browseStore.dialogViewWidth = true" />

    <div class="scroll" :style="{display: browseStore.useAutoViewWidth ? 'flex' : 'block'}">
      <!--图片容器-->
      <div class="single-page-img-box" :style="{maxHeight: browseStore.useAutoViewWidth ? '100%' : 'none'}">
        <bookmark />
        <transition :name="animationType" :duration="animationSpeed" mode="out-in" :css="userConfig.enablePageAnimation">
          <img
            :key="pageKey"
            :style="browseStore.singleViewStyle"
            class="single-page-img"
            :src="imgSrc"
            :alt="t('browse.imgLoadError')"
            @click.stop="switch_menu" />
        </transition>
      </div>
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu" @switch-footer="switch_footer"></operation-cover>
    </div>

    <!-- 隐藏的canvas容器 -->
    <canvas id="canvas-cut" width="1920" height="1080" v-show="false"></canvas>

    <!-- 解压缩指示器 -->
    <images-loader @page_change="page_change" :key="browseStore.chapterId" />

    <!-- 阅读完成指示器 -->
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
              browseStore.set_view_width('half');
            }
          ">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import {config, userConfig} from '@/store';
import operationCover from './components/operation-cover.vue';
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
import useBrowse from '@/store/browse';
import sBlue from '@/assets/s-blue-high.png';
const {t} = i18n.global;

const route = useRoute();
const router = useRouter();
const imgSrc = ref(sBlue);
const page = ref(1);
const pageKey = ref(1); // 用于触发过渡动画
const browseStore = useBrowse();
const pager = ref();
const direction = ref('forward'); // 翻页方向: forward(前进), backward(后退)

// 计算属性：根据动画类型和方向返回正确的动画名称
const animationType = computed(() => {
  if (!userConfig.enablePageAnimation) return '';

  // 淡入淡出动画不需要方向
  if (userConfig.pageAnimationType === 'fade') {
    return 'fade';
  }

  // 滑动动画需要根据方向返回不同的动画名称
  if (userConfig.pageAnimationType === 'slide') {
    return direction.value === 'forward' ? 'slide-left' : 'slide-right';
  }

  // 实体书翻页动画需要根据方向返回不同的动画名称
  if (userConfig.pageAnimationType === 'page') {
    return direction.value === 'forward' ? 'page-forward' : 'page-backward';
  }

  return '';
});

// 计算属性：返回动画速度
const animationSpeed = computed(() => {
  return userConfig.pageAnimationSpeed || 300;
});

/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  // 记录翻页方向
  if (pageParams > page.value) {
    direction.value = 'forward';
  } else {
    direction.value = 'backward';
  }

  // 清空之前图片内容
  browseStore.imageFileList = [];

  page.value = pageParams;
  const even = pageParams % 2 === 0;

  const pageImage = browseStore.imagePathList[Math.ceil(pageParams / 2) - 1];

  // 只有启用动画才需要更新pageKey来触发过渡
  if (userConfig.enablePageAnimation) {
    pageKey.value++;
  }
  imgSrc.value = sBlue;

  // 有缓存则加载缓存的图片
  if (browseStore.imageFileList[pageParams - 1]) {
    imgSrc.value = browseStore.imageFileList[pageParams - 1];
  } else {
    const img = new Image();
    img.src = await imageApi.get({file: pageImage});

    const canvas: HTMLCanvasElement | null = document.querySelector('canvas');

    if (!canvas) {
      return false;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return false;
    }

    // 处理toDataURL遇跨域资源导致的报错
    img.crossOrigin = 'Anonymous';

    img.onload = function () {
      const h = img.naturalHeight;
      const w = img.naturalWidth;

      canvas.height = h;
      canvas.width = w / 2;

      if (!even) {
        context.drawImage(img, w / 2, 0, w, h, 0, 0, w, h);
      } else {
        context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
      }

      const imgbase64 = canvas.toDataURL('image/png');
      imgSrc.value = imgbase64;
      browseStore.imageFileList[pageParams - 1] = imgbase64;
    };
  }

  browseStore.imageLoaded = true;

  browseStore.page = pageParams;
  browseStore.pageImage = pageImage;
  browseStore.save_latest();
}

/**
 * 上一页
 */
function beforePage() {
  if (page.value > 1) {
    page_change(page.value - 1);
  } else {
    ElMessage.warning(t('page.firstPage'));
  }
}

/**
 * 下一页
 */
function nextPage() {
  if (page.value < browseStore.pageCount) {
    page_change(page.value + 1);
  } else {
    ElMessage.warning(t('page.lastPage'));
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
 * 上一页
 * */
async function before_chapter() {
  const index = browseStore.currentChapterIndex;
  const chapterList = browseStore.chapterList;

  if (!index) return;

  if (index == 0) {
    ElMessage.warning(t('page.firstChapter'));
    return false;
  }

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

onMounted(() => {
  // 设置浏览模式
  config.browseType = 'half';

  // 加载页面
  reload_page();

  // 加载自定义视图宽度
  browseStore.load_view_width('half');
});

// 订阅 control-panel 触发的阅读器操作
watch(() => browseStore.readerActionTick.download, (v, ov) => { if (v > (ov || 0)) dwonload_image(); });
watch(() => browseStore.readerActionTick.setImageWidth, (v, ov) => { if (v > (ov || 0)) browseStore.dialogViewWidth = true; });
watch(() => browseStore.readerActionTick.beforeChapter, (v, ov) => { if (v > (ov || 0)) before_chapter(); });
watch(() => browseStore.readerActionTick.nextChapter, (v, ov) => { if (v > (ov || 0)) next_chapter(); });
watch(() => browseStore.readerActionTick.changeChapter, (v, ov) => { if (v > (ov || 0) && browseStore.pendingChangeChapterId) change_chapter(browseStore.pendingChangeChapterId); });
</script>

<style src="./style/single-page.less" scoped lang="less"></style>

<style src="./style/pagination.less" scoped lang="less"></style>
