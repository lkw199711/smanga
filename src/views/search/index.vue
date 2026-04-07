<template>
  <div class="search">
    <div class="top">
      <el-input
        class="search-input"
        v-model="searchStore.searchText"
        clearable
        @clear="clear"
        @keyup.enter="
          () => {
            page_change();
          }
        ">
        <template #append>
          <el-select v-model="searchStore.searchType" @change="page_change(1)" placeholder="Select" class="search-select">
            <el-option :label="$t('search.manga')" value="manga" />
            <el-option :label="$t('search.chapter')" value="chapter" />
          </el-select>
        </template>
        <template #prepend>
          <el-button
            :icon="Search"
            @click="
              () => {
                page_change();
              }
            " />
        </template>
      </el-input>
      <el-button
        class="search-btn"
        type="primary"
        v-if="config.screenType !== 'small'"
        @click="
          () => {
            page_change();
          }
        ">
        全局搜索
      </el-button>
    </div>

    <div class="middle">
      <!-- 加载骨架屏 -->
      <template v-if="loading">
        <list-skeleton />
      </template>
      <template v-else>
        <div class="manga-list" v-if="searchStore.searchType === 'manga'">
          <div class="touch-dom">
            <div :class="['manga-list-box', {block: config.viewType === 'list'}]">
              <manga v-for="item in list" :key="item.mangaId" :viewType="config.viewType" :mangaInfo="item" @contextmenu.prevent="context_menu(item)" />
            </div>
          </div>

          <!-- 分页组件 -->
          <media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />
        </div>

        <div class="chapter-list" v-if="searchStore.searchType === 'chapter'">
          <!-- 章节列表 -->
          <div :class="['chapter-list-box', {block: config.viewType === 'list'}]">
            <chapter
              v-for="item in list"
              :key="item.chapterId"
              :view-type="config.viewType"
              :chapterInfo="item"
              @click="go_browse(item)"
              @contextmenu.prevent="context_menu(item)" />
          </div>

          <!-- 分页组件 -->
          <media-pager ref="pager" :page="page" :count="count" :page-size-config="pageSizes" @page-change="page_change" />
        </div>

        <chapter-right-sidebar
          :chapter-info="chapterInfo"
          v-model:rightSidebarVisible="chapterRightSidebarVisible"
          @reload="page_change"
          @close="
            () => {
              chapterRightSidebarVisible = false;
            }
          " />
		  
        <manga-right-sidebar
          :manga-info="mangaInfo"
          v-model:rightSidebarVisible="mangaRightSidebarVisible"
          @reload="page_change"
          @close="
            () => {
              mangaRightSidebarVisible = false;
            }
          " />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {name: 'search'};
</script>

<script lang="ts" setup name="search">
import {watch, onMounted, ref, onActivated} from 'vue';
import {Search} from '@element-plus/icons-vue';
import store, {config, userConfig} from '@/store';
import searchApi from '@/api/search';
import router from '@/router';
import manga from '@/components/manga.vue';
import chapter from '@/components/chapter.vue';
import mediaPager from '@/components/media-pager.vue';
import {screenType} from '@/type/store';
import {mangaPageSize, chapterPageSize} from '@/store/page-size';
import listSkeleton from '@/components/list-skeleton.vue';
import queue from '@/store/quque';
import useBrowseStore from '@/store/browse';
import useSearchStore from '@/store/search';
import {mangaType} from '@/type/manga';
import {chapterType} from '@/type/chapter';
import chapterRightSidebar from '../chapter-list/right-sidebar.vue';
import mangaRightSidebar from '../manga-list/right-sidebar.vue';
const browse = useBrowseStore();
const searchStore = useSearchStore();

let loading = ref(false);

let pageSizes: number[] = [];
let defaultPageSize = 10;

get_page_size_array();

function get_page_size_array() {
  // 获取默认的页面容量
  const screen: screenType = config.screenType;

  const pageSizesConfig = searchStore.searchType === 'manga' ? mangaPageSize : chapterPageSize;

  pageSizes = pageSizesConfig[screen];
  defaultPageSize = pageSizesConfig[screen][0];
}
let page = ref(1);
let count = ref(0);
type listType =
  & mangaType
  & chapterType
  & {
      blob: string;
    };
let list = ref<listType[]>([]);
let mangaInfo = ref({});
let chapterInfo = ref({});
let mangaRightSidebarVisible = ref(false);
let chapterRightSidebarVisible = ref(false);

// 切换排序规则时 重新加载列表
watch(
  () => userConfig.order,
  () => {
    page_change(1);
  }
);
onMounted(() => {
  userConfig.enableTouchPageChange && touch_page_change();
  // 加载store中的搜索关键词
  if (searchStore.searchText) {
    page_change();
  }
});

/**
 * 清空方法
 */
function clear() {
  list.value = [];
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
      page_change(page.value + 1);
    }

    // 向右滑动,向左翻页
    if (moveX > 100 && page.value > 1) {
      page_change(page.value - 1);
    }

    moveX = 0;
  });
}

/**
 * 跳页
 * @param page
 * @param pageSize
 */
async function page_change(pageParams = 1, pageSize: number = defaultPageSize) {
  // 获取页码
  page.value = pageParams;
  // 加载骨架屏
  loading.value = true;
  // 取消封面加载任务
  queue.clear();
  // 清空数据 避免缓存
  list.value = [];

  if (!searchStore.searchText) {
    ElMessage.warning('请输入搜索关键词！');
    return false;
  }

  const res: any = await searchApi.get(searchStore.searchText, searchStore.searchType, page.value, pageSize, browse.orderBy);
  list.value = res.list;
  count.value = res.count;

  // 结束加载
  loading.value = false;
}

/**
 * 打开右侧菜单
 */
function context_menu(itemInfo: any) {
  if (searchStore.searchType === 'chapter') {
    chapterInfo.value = itemInfo;
    chapterRightSidebarVisible.value = true;
  } else {
    mangaInfo.value = itemInfo;
    mangaRightSidebarVisible.value = true;
  }
}

// 章节方法
async function go_browse(chapter: any) {
  browse.page = 1;

  router.push({
    name: chapter.browseType,
    query: {
      mediaId: chapter.chapterType === 'pdf' ? 'pdfView' : chapter.mediaId,
      mangaId: chapter.mangaId,
      chapterId: chapter.chapterId,
      chapterPath: chapter.chapterPath,
    },
  });
}
</script>

<style lang="less" scoped>
.search-input {
  // width: 20rem;
}

.search-btn {
  margin-left: 2rem;
}

.search-select {
  width: 8rem;
}

.top {
  display: flex;
  margin: 3rem 10rem 0rem;
}

@media only screen and (min-width: 1200px) {
  .top {
    margin: 3rem 10rem 0;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .top {
    margin: 2rem 6rem 0;
  }
}

@media only screen and (max-width: 767px) {
  .top {
    margin: 1rem 0 0;
  }
}
</style>

<style src="@/style/manga-list.less" scoped lang="less"></style>
<style src="@/style/chapter-list.less" scoped lang="less"></style>
