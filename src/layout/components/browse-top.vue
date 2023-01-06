<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
      popper-effect="light"
  >
    <!--<logo/>-->
    <el-menu-item class="padding" index="/">
      <logo/>
    </el-menu-item>
    <el-menu-item index="/media-list/index">媒体库列表</el-menu-item>
    <el-menu-item index="/manga-list/index">漫画列表</el-menu-item>
    <el-menu-item index="/chapter-list/index">章节列表</el-menu-item>
    <el-menu-item index="/browse-view/index">条漫模式</el-menu-item>
    <el-menu-item index="/browse-view/single-page">单页模式</el-menu-item>
    <el-menu-item index="/browse-view/double-page">双页模式</el-menu-item>
    <el-menu-item index="addBookmark">{{ bookmarkTitle }}</el-menu-item>
  </el-menu>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import logo from "@/layout/components/logo.vue";
import {global_set_json} from "@/utils";
import {add_bookmark, delete_bookmark, get_bookmark} from "@/api/bookmark";
import {cache, config} from "@/store";

export default defineComponent({
  name: 'browse-top',
  // 数据
  data() {
    return {
      activeIndex: '',
    }
  },

  // 传值
  props: [],

  // 计算
  computed: {
    bookmarkTitle() {
      return config.bookmarkShow ? '移除书签' : '添加书签';
    }
  },

  // 组件
  components: {logo},

  // 方法
  methods: {
    async handleSelect(key: string) {

      if (key === 'addBookmark') {

        if (config.bookmarkShow) {
          await delete_bookmark(cache.bookmarkId);
        } else {
          await add_bookmark();
        }
        const res = await get_bookmark();

        global_set_json('bookmarkList', res.data.list);

        return;
      }

      let query = {};

      if (/browse/.test(key)) {
        query = this.$route.query;
      }

      this.$router.push({
        path: key,
        query
      });
    },
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.el-menu-demo {
  width: 100%;
}

.padding {
  padding: 0 20px 0 0;
}

.browse-top.posted {
  display: flex;
  width: 100%;
  height: 60px;
  color: @menuText;
  background-color: @menuBack;
  box-shadow: 0 1px 4px #b1b3b8;

  .browse-top-item {
    margin: 0 10px;
    line-height: 60px;
    color: @menuText;
    cursor: pointer;
  }
}
</style>
