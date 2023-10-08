<template>
  <div class="single-page">
    <!--目录列表-->
    <chapter-list-menu @before="before" @next="next" @changeChapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar @dwonload="dwonload_image" />

    <!--图片容器-->
    <div class="single-page-img-box touch-dom">
      <bookmark :page="page" :chapterId="chapterInfo.chapterId" />
      <img class="single-page-img" :src="imgSrc" alt="接收图片" @click.stop="switch_menu" />

      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
        @switch-footer="switch_footer"></operation-cover>
    </div>

    <!-- 隐藏的canvas容器 -->
    <canvas id="canvas-cut" width="1920" height="1080" v-show="false"></canvas>

    <!-- 页码显示 -->
    <page-number :page="page" :count="imgPathList.length" />

    <!--分页按钮-->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before">{{ $t('page.before') }}</el-button>

      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :page="page" :count="count" />

      <el-button class="btn" type="success" plain @click="next">{{ $t('page.next') }}</el-button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { get_image_blob } from '@/api';
import { global_get, global_get_array, global_set } from '@/utils';
import { ElMessage } from 'element-plus';
import { config, userConfig } from '@/store';
import { add_history } from '@/api/history';
import lastReadApi from '@/api/last-read';
import operationCover from './components/operation-cover.vue';
import chapterListMenu from './components/chapter-list-menu.vue';
import bookmark from './components/bookmark.vue';
import { get_chapter_images } from '@/api/browse';
import browsePager from '@/components/browse-pager.vue';
import rightSidebar from './components/right-sidebar.vue';
import pageNumber from './components/page-number.vue';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import { chapterInfoType } from '@/type/chapter';
const { t } = i18n.global;

const route = useRoute();
const router = useRouter();

const imgSrc = ref('');
const imgPathList = ref<string[]>([]);
const imgPathFiles = ref<string[]>([]);
const page = ref(1);

const chapterList = computed<chapterInfoType[]>(() => {
  return global_get_array('chapterList');
})

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

const count = computed(() => {
  return imgPathList.value.length;
})

const pager = ref();

// 存储进度
watch(
  () => page.value,
  () => {
    lastReadApi.add(page.value, chapterInfo.chapterId, chapterInfo.mangaId);
  }
)

/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  page.value = pageParams;
  const even = pageParams % 2 === 0;

  const pageImage = imgPathList.value[pageParams - 1];
  global_set('page', pageParams);
  global_set('pageImage', pageImage);

  // 有缓存则加载缓存的图片
  if (imgPathFiles.value[pageParams - 1]) {
    imgSrc.value = imgPathFiles.value[pageParams - 1];
    return;
  }

  const res: any = await get_image_blob(pageImage);

  const img = new Image();
  img.src = res.data;

  const canvas: HTMLCanvasElement = document.getElementById('canvas-cut');

  if (!canvas) { return false }

  const context = canvas.getContext('2d');

  if (!context) { return false }

  //处理toDataURL遇跨域资源导致的报错
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
    imgPathFiles.value[pageParams - 1] = imgbase64;
  }
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
async function reload_page(page = 1, addHistory = true) {
  // 初始化chapterInfo
  if (!chapterInfo.chapterId) {
    const chapterId = Number(route.query.chapterId);

    // 获取章节信息
    chapterInfo = chapterList.value.filter((item: chapterInfoType) => item.chapterId == chapterId)[0]

    // 更新阅读记录
    lastReadApi.add(page, chapterInfo.chapterId, chapterInfo.mangaId);
  }

  if (addHistory) add_history();
  // 加载图片列表
  const res = await get_chapter_images(chapterInfo.chapterId);

  switch (res.data.status) {
    case 'uncompressed':
      setTimeout(() => {
        pager.value.reload();
      }, 2000);
      break;
    case 'compressing':
      imgPathList.value = res.data.list;
      pager.value.page_change(page);
      setTimeout(() => {
        pager.value.reload();
      }, 2000);
      break;
    case 'compressed':
      imgPathList.value = res.data.list;
      pager.value.page_change(page);
      break;
    default:
      imgPathList.value = res.data.list;
      pager.value.page_change(page);
      break;
  }
}

/**
 * 上一页
 * */
async function before() {
  if (index.value == 0) {
    ElMessage.warning(t('page.firstChapter'));
    return false;
  }

  if (!index.value) return;

  chapterInfo = chapterList.value[index.value - 1];

  await router.push({
    name: route.name as string,
    query: {
      chapterId: chapterInfo.chapterId,
    },
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
    ElMessage.warning(t('page.lastChapter'));
    return false;
  }

  chapterInfo = chapterList.value[index.value + 1];

  await router.push({
    name: route.name as string,
    query: {
      chapterId: chapterInfo.chapterId,
    },
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
  chapterInfo = chapterList.value[index];

  await router.push({
    name: route.name as string,
    query: {
      chapterId: chapterInfo.chapterId,
    },
    params: { page: 1 },
  });

  update_chapter_info();

  // 重载页面
  reload_page();
}

/**
 * 更新阅读缓存
 */
function update_chapter_info() {
  global_set('chapterId', chapterInfo.chapterId);
  global_set('chapterName', chapterInfo.chapterName);
  global_set('chapterPath', chapterInfo.chapterPath);
  global_set('chapterCover', chapterInfo.chapterCover);
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
  const page = route.params.page || global_get('page') || 1;
  const notAddHistory = route.params.notAddHistory || false;
  // 组件被渲染了两遍

  // 加载页面
  reload_page(Number(page), !notAddHistory);

  if (userConfig.enableTouchPageChange) {
    touch_page_change();
  }

})
</script>

<style src='./style/single-page.less' scoped lang='less'></style>

<style src="./style/pagination.less" scoped lang="less"></style>
