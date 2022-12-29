<template>
  <div class="manga-chapter-item" @click="go_browse">
    <!--封面图片-->
    <el-image v-if="finish" class="anim chapter-cover-img" :src="poster" :fit="fit" :alt="title"/>

    <!--占位图标-->
    <el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill"/>

    <!--章节名称-->
    <p class="chapter-name single-line-text-overflow">{{ title }}</p>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {global_set} from "@/utils";

export default defineComponent({
  name: 'manga-chapter-item',
  // 数据
  data() {
    return {
      placeholder: require('@/assets/s-blue.png'),
      fit: 'cover',
    }
  },

  // 传值
  props: ['chapterInfo'],

  // 引用
  computed: {
    poster() {
      return this.chapterInfo.blob;
    },
    finish() {
      return this.chapterInfo.finish;
    },
    title() {
      return this.chapterInfo.chapterName;
    },
    path() {
      return this.chapterInfo.chapterPath;
    },

  },

  // 组件
  components: {},

  // 方法
  methods: {
    go_browse() {
      const chapterId = this.chapterInfo.chapterId;
      const chapterCover = this.chapterInfo.chapterCover;

      // 缓存章节信息
      global_set('chapterId', chapterId);
      global_set('chapterName', this.title);
      global_set('chapterPath', this.path);
      global_set('chapterPath', this.path);
      global_set('chapterCover', chapterCover);

      this.$router.push({
        path: '/browse-view/index',
        query: {
          name: this.title,
          path: this.path
        }
      })
    }
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less' type='text/less'>
.manga-chapter-item {
  overflow: hidden;
  display: flex;
  cursor: pointer;
}

.chapter-name {
  width: 240px;
  margin-left: 20px;
  text-align: left;
  line-height: 4;
}

.chapter-cover-img {
  background-color: #f0f0f0;
  border-radius: 8px;
}

.anim {
  opacity: 0;
  animation: mymove 1s ease-in forwards;
}

@keyframes mymove {
  10% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.5;
  }
  60% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}

@media only screen and (min-width: 1081px) {
  .manga-chapter-item {
    width: @chapterWidth;
  }

  .chapter-cover-img {
    width: @chapterCoverWidth;
    height: @chapterCoverHeight;
  }
}

@media only screen and (max-width: 1080px) {
  .manga-chapter-item {
    width: @PhoneChapterWidth;
  }

  .chapter-cover-img {
    width: @PhoneChapterCoverWidth;
    height: @PhoneChapterCoverHeight;
  }
}
</style>
