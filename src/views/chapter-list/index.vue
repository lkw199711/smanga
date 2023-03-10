<template>
  <div class="chapter-list">
    <!--章节列表-->
    <div class="chapter-list-box">
      <chapter v-for="(i,k) in list" :key="k" :chapterInfo="i" @goto="go_browse(i)" @contextmenu.prevent="context_menu(i,k)"  @more="context_menu(i,k)" />
    </div>
    <!--分页组件-->
    <media-pager ref="pager" :count="count" :params-page="page" @page-change="page_change"/>

    <!--功能菜单-->
    <right-sidebar :info="chapterInfo" :menuPoster="menuPoster" @reload="page_change"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_chapter} from "@/api/chapter"
import store, {config} from "@/store";
import {global_get, global_set, global_set_json} from "@/utils";
import chapter from "@/components/chapter.vue";
import mediaPager from "@/components/media-pager.vue";
import rightSidebar from "./right-sidebar.vue"

export default defineComponent({
  name: 'chapter-list',
  // 数据
  data() {
    return {
      page: 1,
      count: 0,
      list: [],
      chapterInfo:{},
      menuPoster: '',
    }
  },

  // 传值
  props: [],

  // 组件
  components: {chapter, mediaPager, rightSidebar},

  // 计算
  computed: {
    mangaId(): number {
      return Number(this.$route.query.mangaId || global_get('mangaId'));
    },
    browseType(): string {
      return String(this.$route.params.browseType || global_get('browseType'));
    },
  },

  // 方法
  methods: {
    go_browse(item: any) {
      const chapterId = item.chapterId;
      const chapterName = item.chapterName;
      const chapterPath = item.chapterPath;
      const chapterType = item.chapterType;
      const chapterCover = item.chapterCover;

      // 缓存章节信息
      global_set('chapterId', chapterId);
      global_set('chapterName', chapterName);
      global_set('chapterPath', chapterPath);
      global_set('chapterType', chapterType);
      global_set('chapterCover', chapterCover);

      let page = 1;
      if (this.browseType==='flow') {
        page = 0;
      }

      this.$router.push({
        name: this.browseType,
        query: {
          name: chapterName,
          path: chapterPath,
        },
        params: {page},
      })
    },
    /**
     * 打开右侧菜单
     */
    context_menu(info: any, key: number) {
      this.menuPoster = (this.list[key] as any).blob;
      this.chapterInfo = info;
      config.rightSidebar = true;
    },
    /**
     * 跳页
     * @param page
     * @param pageSize
     */
    async page_change(page = 0, pageSize = 12) {
      if (page) {
        this.page = page;
      } else {
        page = this.page;
      }

      const start = (page - 1) * pageSize;
      const res = await get_chapter(this.mangaId, start, pageSize);
      this.list = res.data.list;
      this.count = res.data.count;

      // 为章节请求海报图片
      get_poster(this.list, 'chapterAwait');
    },
    /**
     * 获取全部漫画章节
     */
    async load_chapter() {
      const res = await get_chapter(this.mangaId);
      global_set_json('chapterList', res.data.list);
    },
  },

  // 生命周期
  async created() {
    // 缓存浏览方式
    const browseType = this.$route.params.browseType;
    if (browseType) global_set('browseType', browseType);

    store.commit('switch_await', {running: 'chapterAwait', bool: true});
    this.page_change();
    this.load_chapter();
  },
  beforeUnmount() {
    store.commit('switch_await', {running: 'chapterAwait', bool: false});
  },
})

</script>

<style src='@/style/chapter-list.less' scoped lang='less'></style>
