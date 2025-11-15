<template>
  <div class="double-page">
    <!-- 目录列表 -->
    <chapter-list-menu @before="before_chapter" @next_chapter="next_chapter" @change_chapter="change_chapter" />

    <!-- 功能菜单 -->
    <right-sidebar :direction="directionDesc" @direction="switch_direction" @dwonload="dwonload_image"
      :removeFirst="removeFirst" @remove_first="remove_poster" @set_image_width="browse.dialogViewWidth = true" />

    <div class="scroll" :style="{ display: browse.useAutoViewWidth ? 'flex' : 'block' }">
      <!-- 图片容器 -->
      <transition :name="animationType" :duration="animationSpeed" mode="out-in" :css="userConfig.enablePageAnimation">
        <div class="double-page-img-box" :style="{ maxHeight: browse.useAutoViewWidth ? '100%' : 'none' }"
          :key="pageKey">
          <bookmark />
          <template v-if="directionDesc">
            <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc2" :alt="t('browse.imgLoadError')"
              v-if="imgSrc2" />
            <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc1"
              :alt="t('browse.imgLoadError')" />
          </template>
          <template v-else>
            <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc1"
              :alt="t('browse.imgLoadError')" />
            <img :style="browse.doubleViewStyle" class="double-page-img" :src="imgSrc2" :alt="t('browse.imgLoadError')"
              v-if="imgSrc2" />
          </template>
        </div>
      </transition>
      <operation-cover @before="beforePage" @next="nextPage" @switch-menu="switch_menu"
        @switch-footer="switch_footer" />
    </div>

    <!-- 页码显示 -->
    <page-number :page="page" :count="browse.pageCount" />

    <!-- 分页按钮 -->
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
        <el-button type="primary" @click="() => { browse.set_view_width('double') }">
          {{ t('option.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang='ts'>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
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
const sBlue = require('@/assets/s-blue-high.png');
const imgSrc1 = ref(sBlue);
const imgSrc2 = ref(sBlue);

const page = ref(1);
const removeFirst = ref(false);
const directionDesc = ref(true);
const browse = useBrowseStore();
const pager = ref();
const pageKey = ref(1); // 用于触发过渡动画
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

// 更新动画速度CSS变量
function updateAnimationSpeed() {
  document.documentElement.style.setProperty('--animation-speed', `${userConfig.pageAnimationSpeed}ms`);
}

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
  page.value = pageParams;
  const index = (pageParams - 1) * 2;
  const pageImage = browse.imagePathList[index];

  // 只有启用动画才需要更新pageKey来触发过渡
  if (userConfig.enablePageAnimation) {
    pageKey.value++;
  }

  // 置空图片 使其不显示上一页
  imgSrc1.value = sBlue;
  imgSrc2.value = sBlue;

  // 加载第一张图片
  imgSrc1.value = await imageApi.get({file: browse.imagePathList[index]});

  // 加载第二张图片
  imgSrc2.value = index + 1 < browse.imagePathList.length
    ? await imageApi.get({file: browse.imagePathList[index + 1]})
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

  // 初始设置动画速度
  updateAnimationSpeed();

  // 监听动画速度变化
  watch(
    () => userConfig.pageAnimationSpeed,
    () => {
      updateAnimationSpeed();
    }
  );

})
</script>

<style src='./style/double-page.less' scoped lang='less'></style>
<style src="./style/pagination.less" scoped lang="less"></style>
