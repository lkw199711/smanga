<template>
  <el-menu
      :default-active="activeIndex"
      class="browse-top"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
      popper-effect="light"
  >
    <!--<logo/>-->
    <el-menu-item class="padding logo-box" index="home">
      <logo/>
    </el-menu-item>
    <el-menu-item index="media-list">媒体库列表</el-menu-item>
    <el-menu-item index="manga-list">漫画列表</el-menu-item>
    <el-menu-item index="chapter-list">章节列表</el-menu-item>
    <el-sub-menu index="browse">
      <template #title>{{ browseType }}</template>
      <el-menu-item index="flow">条漫模式</el-menu-item>
      <el-menu-item index="single">单页模式</el-menu-item>
      <el-menu-item index="double">双页模式</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="addBookmark">{{ bookmarkTitle }}</el-menu-item>
  </el-menu>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import logo from "@/layout/components/logo.vue";
import {global_get, global_set_json} from "@/utils";
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
    },
    browseType() {
      switch (config.browseType) {
        case 'flow':
          return '条漫模式';
        case 'single':
          return '单页模式';
        case 'double':
          return '双页模式';
        default:
          return '阅读模式';
      }
    },
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
          // 区分单双页
          let page = Number(global_get('page'));
          if (this.$route.name === 'double') {
            page = page * 2 - 1;
          }

          await add_bookmark(page);
        }
        const res = await get_bookmark();

        global_set_json('bookmarkList', res.data.list);

        return;
      }

      let query = {};
      let params = {};

      // 切换浏览模式 保持参数
      if (/(flow|single|double)/.test(key)) {
        query = this.$route.query;
      }

      // 传参记录浏览模式
      if (key === 'chapter-list') Object.assign(params, {browseType: this.$route.name})

      this.$router.push({
        name: key,
        query,
        params,
      });
    },
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.browse-top {
  width: 100%;
}

.padding {
  padding: 0 20px 0 0;
}

@media only screen and (min-width: 1200px) {

}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .browse-top {
    .logo-box {
      width: 20rem;
      padding: 0;
    }
  }

  :deep(.el-menu-item) {
    padding: 0 1rem;
  }

  :deep(.el-sub-menu__title) {
    padding: 0 1rem;
  }
}

@media only screen and (max-width: 767px) {
  // 隐藏顶栏logo以节省空间
  .browse-top {
    .logo-box {
      display: none;
    }
  }

  // 顶栏间距缩小
  :deep(.el-menu-item) {
    padding: 0 .4rem;
  }

  :deep(.el-sub-menu__title) {
    padding: 0 .4rem;
  }
}
</style>
