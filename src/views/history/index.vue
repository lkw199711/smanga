<template>
  <div class="history-list">
    <!--列表-->
    <div class="touch-dom">
      <div :class="['chapter-list-box', { 'block': config.viewType === 'list' }]">
        <chapter v-for="(i, k) in list" :key="k" :viewType="config.viewType" :chapterInfo="i" @click="go_browse(i)"
          @contextmenu.prevent="context_menu(i, k)" />
      </div>
    </div>

    <!--分页组件-->
    <media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />

    <!--功能菜单-->
    <right-sidebar :info="chapterInfo" :menuPoster="menuPoster" @reload="page_change" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import chapter from '@/components/chapter.vue';
import store, { config } from '@/store';
import { global_set, global_set_json } from '@/utils';
import historyApi from '@/api/history';
import chapterApi from '@/api/chapter';
import MediaPager from '@/components/media-pager.vue';
import RightSidebar from './components/right-sidebar.vue';
import { chapterInfoType } from '@/type/chapter';
import { useRoute, useRouter } from 'vue-router';
import { chapterPageSize } from '@/store/page-size';
import { pageSizeConfigType, screenType } from '@/type/store';

let pageSizes:number[] = [];
let defaultPageSize = 10;

get_page_size_array();

function get_page_size_array() {
  // 获取默认的页面容量
  const screen: screenType = config.screenType;

  pageSizes = chapterPageSize[screen];
  defaultPageSize = chapterPageSize[screen][0];
}

const route = useRoute();
const router = useRouter();

const page = ref(1);
const list = ref([]);
const count = ref(0);
const menuPoster = ref('');
const chapterInfo = ref<chapterInfoType>({
  browseType: '',
  chapterCover: '',
  chapterId: 0,
  chapterName: '',
  chapterPath: '',
  chapterType: '',
  createTime: '',
  mangaId: 0,
  mediaId: 0,
  pathId: 0,
  picNum: 0,
  updateTime: '',
});

/**
 * 跳转浏览页面
 * @param item
 */
async function go_browse(item: any) {
  const chapterId = item.chapterId;
  const chapterName = item.chapterName;
  const chapterPath = item.chapterPath;
  const chapterType = item.chapterType;
  const chapterCover = item.chapterCover;
  const mangaId = item.mangaId;
  const mangaCover = item.mangaCover;
  const browseType = item.browseType;
  const removeFirst = item.removeFirst;
  const direction = item.direction;

  const chapterListRes = await chapterApi.get(mangaId);
  const chapterList = chapterListRes.list;

  // 缓存章节信息
  global_set('mangaId', mangaId);
  global_set('mangaCover', mangaCover);
  global_set('chapterId', chapterId);
  global_set('chapterName', chapterName);
  global_set('chapterPath', chapterPath);
  global_set('chapterType', chapterType);
  global_set('browseType', browseType);
  global_set('chapterCover', chapterCover);
  global_set_json('chapterList', chapterList);
  global_set('removeFirst', removeFirst);
  global_set('direction', direction);

  // 不存储历史记录
  await router.push({
    name: browseType,
    query: {
      chapterId,
    },
    params: {
      notAddHistory: 1,
      page: 1,
    },
  });
}

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(pageParams = 1, pageSize = defaultPageSize) {
  if (pageParams !==1 && pageParams > Math.ceil(count.value / pageSize)) return;
  if (pageParams < 1) return;
  page.value = pageParams;

  const res = await historyApi.get_history(pageParams, pageSize);

  list.value = res.list;
  count.value = res.count;
}

/**
 * 打开右侧菜单
 */
function context_menu(info: any, key: number) {
  menuPoster.value = (list.value[key] as any).blob;
  chapterInfo.value = info;
  config.rightSidebar = true;
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
      page_change(++page.value);
    }

    // 向右滑动,向左翻页
    if (moveX > 100 && page.value > 1) {
      page_change(--page.value);
    }


    moveX = 0;
  })
}

onMounted(() => {
  page_change();
  touch_page_change();
})
</script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
