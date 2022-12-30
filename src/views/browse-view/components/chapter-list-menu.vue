<template>
  <div class="chapter-list-menu">
    <!--目录列表-->
    <van-popup class="chapter" v-model="popup" position="left">
      <van-sidebar v-model="chapterIndex" class="chapter-list" @change="change_chapter">
        <van-sidebar-item v-for="(k) in chapterList" :title="k.chapterName" :key="k.chapterId"/>
        <div class="seat"></div>
      </van-sidebar>
    </van-popup>

    <!--翻页按钮-->
    <div class="btn-box" v-show="popup">
      <el-button class="btn" type="warning" plain @click.stop="before">上一章</el-button>
      <el-button class="btn" type="success" plain @click.stop="next">下一章</el-button>
    </div>

    <!--目录按钮-->
    <van-button v-show="browseTop" class="show-menu-posted" type="danger" @click.stop="open_popup('menu')">
      <i class="iconfont icon-mulu"/>
    </van-button>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';
import {config} from "@/store";
import {global_get_array, global_set} from "@/utils";

export default defineComponent({
  name: 'chapter-list-menu',
  // 数据
  data() {
    return {
      popup: false
    }
  },

  // 传值
  props: [],

  // 引用
  computed: {
    browseTop() {
      return config.browseTop;
    },
    chapterName() {
      return this.$route.query.name;
    },
    // 章节列表
    chapterList() {
      return global_get_array('chapterList');
    },
    // 章节的坐标索引
    chapterIndex() {
      const chapterList = this.chapterList;

      for (let i = 0; i < chapterList.length; i++) {
        if (this.chapterName === chapterList[i].chapterName) {
          //缓存章节坐标
          global_set('chapterIndex', i);
          return i;
        }
      }

      return -1;
    },
  },

  // 组件
  components: {},

  // 方法
  methods: {
    change_chapter(index: number) {
      this.$emit('changeChapter', index);
    },
    before() {
      this.$emit('before');
    },
    next() {
      this.$emit('next');
    },
    open_popup() {
      this.popup = true;
    }
  },

  // 生命周期
  created() {

  },
})
</script>

<style scoped lang='less'>
/**
  van-sidebar点击无响应解决
 */

/deep/ .van-sidebar {
  overflow-y: visible;
}

.show-menu-posted {
  position: fixed;
  top: 102px;
  left: 38px;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  opacity: .6;
  z-index: 1;
}

.chapter-list {
  min-width: 600px;
  min-height: 100vh;

  .seat {
    height: 100px;
  }
}

.btn-box {
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  width: 600px;
  z-index: 3000;
  transition: .15s;

  .btn {
    margin: 0;
    width: 50%;
  }
}
</style>
