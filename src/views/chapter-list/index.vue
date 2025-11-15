<template>
  <div class="chapter-list">
    <!-- 章节列表 -->
    <div class="touch-dom">
      <!-- 加载骨架屏 -->
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div :class="['chapter-list-box', {block: config.viewType === 'list'}]">
          <chapter
            v-for="(i, k) in list"
            :key="k"
            :view-type="config.viewType"
            :chapterInfo="i"
            @click="go_browse(i)"
            @contextmenu.prevent="context_menu(i, k)" />
        </div>
      </template>
    </div>

    <!--分页组件-->
    <media-pager
      ref="pager"
      :page="page"
      :page-size="browse.chapterListPageSize"
      :count="count"
      :page-size-config="browse.chapterListPageSizes"
      @page-change="page_change" />

    <!--功能菜单-->
    <right-sidebar v-model:rightSidebarVisible="rightSidebarVisible" :chapterInfo="chapterInfo" @reload="page_change" />
  </div>
</template>

<script lang="ts">
export default {name: 'chapter-list'};
</script>
<script lang="ts" setup>
import {watch, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import chapterApi from '@/api/chapter';
import {config, userConfig} from '@/store';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import listSkeleton from '@/components/list-skeleton.vue';
import rightSidebar from './right-sidebar.vue';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
import { chapterInit, chapterType } from '@/type/chapter';
const browse = useBrowseStore();

const route = useRoute();
const router = useRouter();

let page = ref(1);
let count = ref(-1);
let list = ref([]);
let chapterInfo = ref<chapterType>(chapterInit);
let loading = ref(false);

let rightSidebarVisible = ref(false);

let mangaId = route.query.mangaId;
let mediaId = route.query.mediaId;

// 监听路由变化
watch(
  () => route.query.mangaId,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      mangaId = newVal;
      load();
    }
  }
);

watch(
  () => route.query.mediaId,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      mediaId = newVal;
      load();
    }
  }
);

// 切换排序规则时 重新加载列表
watch(
  () => userConfig.chapterOrder,
  () => {
    page_change();
  }
);

watch(
  () => userConfig.order,
  () => {
    page_change();
  }
);

onMounted(() => {
  load();
  userConfig.enableTouchPageChange && touch_page_change();
});

function touch_page_change() {
  const listDom = document.querySelector('.touch-dom');
  if (listDom === null) return;

  // 获取手指初始坐标和盒子的原来位置
  var startX = 0;
  // 获取盒子原来的位置
  var x = 0;
  var moveX = 0;

  listDom.addEventListener('touchstart', function (this: HTMLDivElement, e: any) {
    if (config.viewType === 'list') return;
    // 得到初始的手指坐标
    startX = e.targetTouches[0].pageX;
    // 获取盒子坐标
    x = this.offsetLeft;
  });

  listDom.addEventListener('touchmove', function (this: HTMLDivElement, e: any) {
    if (config.viewType === 'list') return;
    // 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
    moveX = e.targetTouches[0].pageX - startX;
    // 移动盒子，盒子原来的位置+手指移动的距离
    this.style.left = x + moveX + 'px';
    // 阻止屏幕滚动行为
    e.preventDefault();
  });

  listDom.addEventListener('touchend', function (this: HTMLDivElement, e) {
    if (config.viewType === 'list') return;
    this.style.left = '0';

    // 向左滑动,向右翻页
    if (moveX < -100 && page.value < count.value) {
      page_change(page.value + 1, browse.chapterListPageSize);
    }

    // 向右滑动,向左翻页
    if (moveX > 100 && page.value > 1) {
      page_change(page.value - 1, browse.chapterListPageSize);
    }

    moveX = 0;
  });
}

function go_browse(chapter: any) {
  if (chapter?.latest) {
    browse.page = chapter.latest.page;
    localStorage.setItem('pageJump', chapter.latest.page);
  } else {
    browse.page = 1;
  }

  const browsePageRoute = {
    name: chapter.browseType,
    query: {
      mediaId: chapter.mediaId,
      mangaId: chapter.mangaId,
      chapterId: chapter.chapterId,
    },
  };

  if (userConfig.openNewTab) {
    const newUrl = router.resolve(browsePageRoute);
    window.open(newUrl.href, '_blank');
  } else {
    router.push(browsePageRoute);
  }
}
/**
 * 打开右侧菜单
 */
function context_menu(info: any, key: number) {
  chapterInfo.value = info;
  rightSidebarVisible.value = true;
}

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(pageParams = 1, pageSize: number = browse.chapterListPageSize) {
  if (pageParams !== 1 && count.value !== -1 && pageParams > Math.ceil(count.value / pageSize)) return;
  if (pageParams < 1) return;

  // 获取页码
  page.value = pageParams;
  // 加载骨架屏
  loading.value = true;
  // 取消封面加载任务
  queue.mangaQueue.clear();
  // 清空数据 避免缓存
  list.value = [];
  let res = await chapterApi.get({
    mangaId: mangaId ? Number(mangaId) : 0,
    mediaId: mediaId ? Number(mediaId) : 0,
    page: page.value,
    pageSize,
    order: mediaId ? userConfig.order : userConfig.chapterOrder,
  });

  list.value = res.list;
  count.value = res.count;

  // 结束加载
  loading.value = false;

  // 缓存页码信息
  browse.chapterListPage = page.value;
  browse.chapterListPageSizeCache = pageSize;
}

function load() {
  list.value = [];
  page_change(browse.chapterListPage, browse.chapterListPageSize);
}
</script>

<style src="@/style/chapter-list.less" scoped lang="less"></style>
