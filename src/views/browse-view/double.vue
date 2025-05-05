<template>
  <div class="double-page">
    <!-- 目录列表 -->
    <chapter-list-menu @before="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!-- 功能菜单 -->
    <right-sidebar :direction="directionDesc" @direction="switch_direction" @dwonload="dwonload_image"
      :removeFirst="removeFirst" @remove_first="remove_poster" @set_image_width="browse.dialogViewWidth = true" />

    <div class="scroll" :style="{ display: browse.useAutoViewWidth ? 'flex' : 'block' }">
      <!-- 图片容器 -->
      <div class="double-page-img-box touch-dom" :style="{ maxHeight: browse.useAutoViewWidth ? '100%' : 'none' }">
        <bookmark />
        <template v-if="directionDesc">
          <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc2" :alt="t('browse.imgLoadError')"
            v-if="imgSrc2" />
          <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc1" :alt="t('browse.imgLoadError')" />
        </template>
        <template v-else>
          <img class="double-page-img" :src="imgSrc1" :alt="t('browse.imgLoadError')" />
          <img class="double-page-img" :src="imgSrc2" :alt="t('browse.imgLoadError')" v-if="imgSrc2" />
        </template>

        <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
          @switch-footer="switch_footer" />
      </div>
    </div>


    <!-- 页码显示 -->
    <page-number :page="page" :count="browse.pageCount" />

    <!-- 分页按钮 -->
    <div class="footer" v-show="config.browseFooter">
      <el-button class="btn" type="warning" plain @click="before_chapter">{{ $t('page.before') }}</el-button>
      <browse-pager ref="pager" @pageChange="page_change" @reloadPage="reload_page" :page="page"
        :count="browse.pageCount" />
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
        <el-button type="primary" @click="() => { browse.set_view_width('double') }">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang='ts'>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { config, userConfig } from '@/store';
import operationCover from './components/operation-cover.vue';
import chapterListMenu from './components/chapter-list-menu.vue';
import bookmark from './components/bookmark.vue';
import browsePager from '@/components/browse-pager.vue';
import rightSidebar from './components/right-sidebar.vue';
import pageNumber from './components/page-number.vue';
import chapterApi from '@/api/chapter';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
const { t } = i18n.global;

const route = useRoute();
const router = useRouter();

const imgSrc1 = ref('');
const imgSrc2 = ref('');

const page = ref(1);
const removeFirst = ref(false);
const directionDesc = ref(true);
const browse = useBrowseStore();

const pager = ref();

/**
 * 页码变更
 * @param page
 */
async function page_change(pageParams: number) {
  page.value = pageParams;
  const index = (pageParams - 1) * 2;
  const pageImage = browse.imagePathList[index];


  // 加载第一张图片
  imgSrc1.value = await imageApi.get(browse.imagePathList[index]);

  // 加载第二张图片
  imgSrc2.value = index + 1 < browse.imagePathList.length
    ? await imageApi.get(browse.imagePathList[index + 1])
    : '';

  // 缓存书签信息
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
 * 上一章节
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
    },
  });

  reload_page();
}

/**
 * 下一章节
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

const listDom = document.querySelector('.touch-dom');

// 获取手指初始坐标和盒子的原来位置
var startX = 0;
// 获取盒子原来的位置
var x = 0;
var moveX = 0;

function touch_page_change() {


  if (listDom === null) return;


  listDom.addEventListener('touchstart', bind1)

  listDom.addEventListener('touchmove', bind2)

  listDom.addEventListener('touchend', bind3)

}

function unmount_touch() {
  if (listDom === null) return;
  listDom.removeEventListener('touchstart', bind1)
  listDom.removeEventListener('touchmove', bind2)
  listDom.removeEventListener('touchend', bind3)
}

function bind1(this: HTMLDivElement, e: any) {
  // 得到初始的手指坐标
  startX = e.targetTouches[0].pageX;
  // 获取盒子坐标
  x = this.offsetLeft;
}

function bind2(this: HTMLDivElement, e: any) {
  // 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
  moveX = e.targetTouches[0].pageX - startX;
  // 移动盒子，盒子原来的位置+手指移动的距离
  this.style.left = x + moveX + 'px';
  // 阻止屏幕滚动行为
  e.preventDefault();
}

function bind3(this: HTMLDivElement, e: any) {
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
}

function remove_poster() {
  if (removeFirst.value) {
    browse.imagePathList.shift();
    browse.imageFileList.shift();
  } else {
    // 添加一张图片对其双页
    browse.imagePathList.unshift(browse.imagePathList[0]);
    browse.imageFileList.unshift(browse.imageFileList[0]);
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
  const page = browse.page || 1;

  await reload_page(page);

  if (removeFirst.value) remove_poster();
  if (!directionDesc.value) switch_direction();

  browse.load_view_width('double');

  if (userConfig.enableTouchPageChange) {
    touch_page_change();
  }

})

onBeforeUnmount(() => {
  unmount_touch();
})
</script>

<style src='./style/double-page.less' scoped lang='less'></style>
