<template>
  <div class="single-page">
    <!--目录列表-->
    <chapter-list-menu @before_chapter="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar @dwonload="dwonload_image" @set_image_width="browse.dialogViewWidth = true" />

    <div class="scroll">
      <!--图片容器-->
      <div class="single-page-img-box touch-dom" :style="{ maxHeight: browse.useAutoViewWidth ? '100%' : 'none' }">
        <bookmark />
        <img :style="browse.singleViewStyle" class="single-page-img" :src="imgSrc" :alt="t('browse.imgLoadError')"
          @click.stop="switch_menu" />

        <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
          @switch-footer="switch_footer"></operation-cover>
      </div>
    </div>

    <!-- 隐藏的canvas容器 -->
    <canvas id="canvas-cut" width="1920" height="1080" v-show="false"></canvas>

    <!-- 页码显示 -->
    <page-number :page="page" :count="browse.pageCount" />

    <!--分页按钮-->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before_chapter">{{ $t('page.before') }}</el-button>
      <el-slider class="bottom-slider" v-model="page" :min="1" :max="browse.pageCount" @change="page_change(page)"
        v-if="browse.pageCount > 0 && userConfig.userSlider" />
      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :page="page"
        :count="browse.pageCount" v-show="!userConfig.userSlider" />
      <el-button class="btn" type="success" plain @click="next_chapter">{{ $t('page.next') }}</el-button>
    </div>
  </div>

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
        <el-button type="primary" @click="() => { browse.set_view_width('half') }">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
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
const browse = useBrowseStore();

const pager = ref();


/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  // 清空之前图片内容
  browse.imageFileList = [];

  page.value = pageParams;
  const even = pageParams % 2 === 0;

  const pageImage = browse.imagePathList[Math.ceil(pageParams / 2) - 1];

  // 有缓存则加载缓存的图片
  if (browse.imageFileList[pageParams - 1]) {
    imgSrc.value = browse.imageFileList[pageParams - 1];
  } else {
    const img = new Image();
    img.src = await imageApi.get(pageImage);;

    const canvas: HTMLCanvasElement | null = document.querySelector('canvas');

    if (!canvas) { return false }

    const context = canvas.getContext('2d');

    if (!context) { return false }

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
      browse.imageFileList[pageParams - 1] = imgbase64;
    }
  }

  browse.page = pageParams;
  browse.pageImage = pageImage;
  browse.save_latest();
}

/**
 * 上一页
 */
function beforePage() {
  if (page.value > 1) {
    page_change(page.value - 1);
  } else {
    ElMessage.warning(t('page.firstPage'));
    before_chapter();
  }
}

/**
 * 下一页
 */
function nextPage() {
  if (page.value < browse.pageCount) {
    page_change(page.value + 1);
  } else {
    ElMessage.warning(t('page.lastPage'));
    next_chapter();
  }
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
 * 上一页
 * */
async function before_chapter() {
  const index = browse.currentChapterIndex;
  const chapterList = browse.chapterList;

  if (!index) return;

  if (index == 0) {
    ElMessage.warning(t('page.firstChapter'));
    return false;
  }

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
    ElMessage.warning(t('page.lastChapter'));
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
    }
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
  config.browseType = 'half';
  const page = browse.page || 1;

  // 加载页面
  reload_page(page);

  // 加载自定义视图宽度
  browse.load_view_width('half');

  if (userConfig.enableTouchPageChange) {
    touch_page_change();
  }

})
</script>

<style src='./style/single-page.less' scoped lang='less'></style>

<style src="./style/pagination.less" scoped lang="less"></style>
