<template>
  <div class="double-page">
    <!--目录列表-->
    <chapterList-menu @before="before" @next="next" @changeChapter="change_chapter" />

    <!--功能菜单-->
    <right-sidebar :direction="directionDesc" @direction="switch_direction" @dwonload="dwonload_image"
      :removeFirst="removeFirst" @removeFirst="remove_poster" />

    <!--图片容器-->
    <div class="double-page-img-box touch-dom">
      <bookmark :chapterId="chapterInfo.chapterId" />
      <template v-if="directionDesc">
        <img class="double-page-img" :src="imgSrc2" alt="接收图片2" v-if="imgSrc2" />
        <img class="double-page-img" :src="imgSrc1" alt="接收图片1" />
      </template>
      <template v-else>
        <img class="double-page-img" :src="imgSrc1" alt="接收图片1" />
        <img class="double-page-img" :src="imgSrc2" alt="接收图片1" v-if="imgSrc2" />
      </template>

      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu" @switch-footer="switch_footer" />
    </div>

    <!--分页按钮-->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before">{{ $t('page.before') }}</el-button>
      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :count="count" :set-page-size="2" />
      <el-button class="btn" type="success" plain @click="next">{{ $t('page.next') }}</el-button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, watch, computed } from 'vue';
import { get_image_blob } from '@/api';
import { global_get, global_get_array, global_set } from '@/utils';
import { ElMessage } from 'element-plus';
import { config } from '@/store';
import { add_history } from '@/api/history';
import operationCover from './components/operation-cover.vue';
import chapterListMenu from './components/chapter-list-menu.vue';
import bookmark from './components/bookmark.vue';
import { get_chapter_images } from '@/api/browse';
import browsePager from '@/components/browse-pager.vue';
import rightSidebar from './components/right-sidebar.vue';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import { chapterInfoType } from '@/type/chapter';
const { t } = i18n.global;

const route = useRoute();
const router = useRouter();

const imgSrc1 = ref('');
const imgSrc2 = ref('');
const imgPathList = ref<string[]>([]);
const imgPathFiles = ref<string[]>([]);
const chapterId = ref(0);
const page = ref(1);
const firstImage = ref('');
const firstImageFile = ref('');
const removeFirst = ref(false);
const directionDesc = ref(true);

const name = computed(() => {
  return route.query.name;
})
const chapterList = computed<chapterInfoType[]>(() => {
  return global_get_array('chapterList');
})

const index = computed<number>(() => {
  const list = chapterList.value;

  for (let i = 0; i < list.length; i++) {
    if (name.value === list[i].chapterName) {
      //缓存章节坐标
      global_set('chapterIndex', i);
      return i;
    }
  }

  return -1;
})

const chapterInfo = computed<chapterInfoType>(() => {
  return chapterList.value[index.value] || {};
})

watch(
  () => index.value,
  (val) => {
    if (val < 0 || chapterList.value.length < 1) return 0
    chapterId.value = chapterList.value[val].chapterId;
  },
  {
    immediate: true
  }
)

const count = computed(() => {
  return imgPathList.value.length;
})

const pager = ref();

/**
 * 页码变更
 * @param page
 */
async function page_change(page: number) {
  const index = (page - 1) * 2;
  const pageImage = imgPathList.value[index];

  // 有缓存则加载缓存的图片
  if (imgPathFiles.value[index]) {
    imgSrc1.value = imgPathFiles.value[index];
    imgSrc2.value = imgPathFiles.value[index + 1]
      ? imgPathFiles.value[index + 1]
      : '';
    return;
  }

  // 加载第一张图片
  const res1: any = await get_image_blob(imgPathList.value[index]);
  imgSrc1.value = res1.data;
  imgPathFiles.value[index] = res1.data;

  // 加载第二张图片
  if (index + 1 < imgPathList.value.length) {
    const res2: any = await get_image_blob(imgPathList.value[index + 1]);
    imgSrc2.value = res2.data;
    imgPathFiles.value[index + 1] = res2.data;
  } else {
    imgSrc2.value = '';
  }

  // 缓存书签信息
  global_set('page', page);
  global_set('doublePage', page * 2 - 1);
  global_set('pageImage', pageImage);
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
  if (addHistory) add_history();
  // 加载图片列表
  const res = await get_chapter_images();

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

  await router.push({
    name: route.name as string,
    query: {
      name: chapterList.value[index.value - 1].chapterName,
      path: chapterList.value[index.value - 1].chapterPath,
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

  await router.push({
    name: route.name as string,
    query: {
      name: chapterList.value[index.value + 1].chapterName,
      path: chapterList.value[index.value + 1].chapterPath,
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
  await router.push({
    name: route.name as string,
    query: {
      name: chapterList.value[index].chapterName,
      path: chapterList.value[index].chapterPath,
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

function switch_footer() {
  config.browseFooter = !config.browseFooter;
}

/**
 * 下载当前图片
 */
function dwonload_image() {
  const src1 = imgSrc1.value;
  const src2 = imgSrc2.value;

  const a = document.createElement('a');
  a.href = src1;
  a.download = 'smangaImageLeft.png';
  a.click();

  a.href = src2;
  a.download = 'smangaImageRight.png';
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
    this.style.left = '0';

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

function remove_poster() {
  if (removeFirst.value) {
    imgPathList.value.unshift(firstImage.value);
    imgPathFiles.value.unshift(firstImageFile.value);
  } else {
    firstImage.value = imgPathList.value.shift() || '';
    firstImageFile.value = imgPathFiles.value.shift() || '';
  }

  removeFirst.value = !removeFirst.value;
  pager.value.reload_static();
}

/**
 * 切换阅读方向
 */
function switch_direction() {
  directionDesc.value = !directionDesc.value;
}

onMounted(async () => {
  // 设置浏览模式
  config.browseType = 'double';
  const page = route.params.page || global_get('page') || 1;
  const notAddHistory = route.params.notAddHistory || false;
  const target = Number(page);

  await reload_page(target, !notAddHistory);

  const removeFirst = global_get('removeFirst');
  const direction = global_get('direction');

  if (removeFirst) remove_poster();
  if (!direction) switch_direction();

  touch_page_change();
})
</script>

<style src='./style/double-page.less' scoped lang='less'></style>
