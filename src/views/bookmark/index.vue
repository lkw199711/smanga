<template>
  <div class="history-list">
    <!-- 列表 -->
    <div class="touch-dom">
      <!-- 加载骨架屏 -->
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div :class="['chapter-list-box', { 'block': config.viewType === 'list' }]">
          <chapter v-for="chapterItem in list" :key="chapterItem.chapterId" :viewType="config.viewType" :chapterInfo="chapterItem"
            :bookmark="true" @click="go_browse(chapterItem)" @contextmenu.prevent="context_menu(chapterItem)" />
        </div>
      </template>
    </div>

    <!--分页-->
    <media-pager ref="pager" :page="page" :page-size="browse.chapterListPageSize" :count="count"
      :page-size-config="browse.chapterListPageSizes" @page-change="page_change" />

    <!--功能菜单-->
    <right-sidebar v-model:rightSidebarVisible="rightSidebarVisible" :chapterInfo="chapterInfo" @reload="page_change" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import chapter from '@/components/chapter.vue';
import { config, userConfig } from '@/store';
import bookmarkApi from '@/api/bookmark';
import MediaPager from '@/components/media-pager.vue';
import rightSidebar from '@/views/chapter-list/right-sidebar.vue';
import { chapterType } from '@/type/chapter';
import { useRoute, useRouter } from 'vue-router';
import listSkeleton from '@/components/list-skeleton.vue';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();
let loading = ref(false);

const route = useRoute();
const router = useRouter();

const page = ref(1);
const list = ref([]);
const count = ref(-1);
const chapterInfo = ref<chapterType>();
let rightSidebarVisible = ref(false);

/**
 * 去往浏览界面
 */
async function go_browse(item: any) {
  const chapterId = item.chapterId;
  const mangaId = item.mangaId;
  const browseType = item.browseType;

  // 使用pinia存储页码
  browse.page = item.page;
  localStorage.setItem('pageJump', item.page.toString());

  const browsePageRoute = {
    name: browseType,
    query: {
      mediaId: item.mediaId,
      mangaId,
      chapterId,
    }
  }
  if (userConfig.openNewTab) {
    // 如果开启了新标签页,则直接跳转
    window.open(router.resolve(browsePageRoute).href, '_blank');
    return;
  } else {
    await router.push(browsePageRoute);
  }
}

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(pageParams = 1, pageSize: number = 10) {

  if (pageParams !== 1 && count.value !== -1 && pageParams > Math.ceil(count.value / pageSize)) return;
  if (pageParams < 1) return;

  // 获取页码
  page.value = pageParams;
  // 加载骨架屏
  loading.value = true;
  // 取消封面加载任务
  queue.chapterQueue.clear();
  // 清空数据 避免缓存
  list.value = [];

  const res = await bookmarkApi.get(pageParams, pageSize);
  list.value = (res.list || []).map((it: any) => {
    const pageImage = it.pageImage || it.page_image || it.pageimage || '';
    const chapterCover = it.chapterCover || it.chapter_cover || '';
    return { ...it, pageImage, chapterCover };
  });
  count.value = res.count;

  // 结束加载
  loading.value = false;

  // 缓存页码
  browse.chapterListPage = pageParams;
  browse.chapterListPageSizeCache = pageSize;
}

/**
 * 打开右侧菜单
 */
function context_menu(chapter: chapterType) {
  chapter.chapterCover = chapter.pageImage
  chapterInfo.value = chapter;
  rightSidebarVisible.value = true;
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
    if (config.viewType === 'list') return;
    // 得到初始的手指坐标
    startX = e.targetTouches[0].pageX;
    // 获取盒子坐标
    x = this.offsetLeft;
  })

  listDom.addEventListener('touchmove', function (this: HTMLDivElement, e: any) {
    if (config.viewType === 'list') return;
    // 手指的移动距离= 手指移动之后的坐标 - 手指初始的坐标
    moveX = e.targetTouches[0].pageX - startX;
    // 移动盒子，盒子原来的位置+手指移动的距离
    this.style.left = x + moveX + 'px';
    // 阻止屏幕滚动行为
    e.preventDefault();
  })

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
  })
}

onMounted(() => {
  page_change(browse.chapterListPage, browse.chapterListPageSize);
  touch_page_change();
})
</script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
