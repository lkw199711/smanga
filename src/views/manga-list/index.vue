<template>
  <div class="manga-list">
    <div class="manga-list-box">
      <manga v-for="(i,k) in list" :key="k" :mangaInfo="i" @contextmenu.prevent="context_menu(i,k)" @more="context_menu(i,k)" />
    </div>

    <!--分页组件-->
    <media-pager ref="pager" :count="count" :params-page="page" @page-change="page_change"/>

    <!--功能菜单-->
    <rightSidebar :mangaInfo="mangaInfo" :menuPoster="menuPoster" @reload="page_change"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_manga} from "@/api/manga"
import store, {config} from "@/store";
import {global_get} from "@/utils";
import manga from "@/components/manga.vue";
import mediaPager from "@/components/media-pager.vue";
import rightSidebar from "./right-sidebar.vue";
import {mediaPageSize} from "@/store/page-size";

export default defineComponent({
  name: 'manga-list',
  // 数据
  data() {
    return {
      page: 1,
      count: 0,
      list: [],
      mangaInfo: {},
      menuPoster: '',
    }
  },

  // 传值
  props: [],

  // 组件
  components: {manga, mediaPager, rightSidebar},

  // 计算
  computed: {
    mediaId() {
      return Number(this.$route.query.mediaId || global_get('mediaId'));
    }
  },

  // 方法
  methods: {
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
      const res = await get_manga(this.mediaId, start, pageSize);
      this.list = res.data.list;
      this.count = res.data.count;

      // 为漫画请求海报图片
      get_poster(this.list, 'mangaAwait');
    },
    reload(){
      const screenType = config.screenType;
      // @ts-ignore
      const pageSize = mediaPageSize[screenType];
      this.page_change(1, pageSize);
    },
    /**
     * 打开右侧菜单
     */
    context_menu(mangaInfo: any, key: number) {
      this.menuPoster = (this.list[key] as any).blob;
      this.mangaInfo = mangaInfo;
      config.rightSidebar = true;
    }
  },

  // 生命周期
  async created() {
    store.commit('switch_await', {running: 'mangaAwait', bool: true});
    this.reload();
  },

  beforeUnmount() {
    store.commit('switch_await', {running: 'mangaAwait', bool: false});
  },

})
</script>

<style src='./style/index.less' scoped lang='less'></style>
