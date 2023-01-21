<template>
  <div class="chapter">
    <!--封面图片-->
    <el-image v-if="finish" class="anim chapter-cover-img" :src="poster" :fit="fit" :alt="chapterName"/>

    <!--占位图标-->
    <el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill"/>

    <!--书签图标-->
    <i class="iconfont icon-Bookmark- icon-bookmark" v-if="bookmark"/>

    <!--章节名称-->
    <p class="chapter-name single-line-text-overflow">{{ chapterName }}</p>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'

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
  props: ['chapterInfo', 'bookmark'],

  // 引用
  computed: {
    poster() {
      return this.chapterInfo.blob;
    },
    finish() {
      return this.chapterInfo.finish;
    },
    chapterName() {
      return this.chapterInfo.chapterName;
    },
  },

  // 组件
  components: {},

  // 方法
  methods: {},

  // 生命周期
  created() {

  },
})
</script>

<style scoped lang='less'>
.chapter {
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &-cover-img {
    width: 100%;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
}

.anim {
  opacity: 0;
  animation: mymove 1s ease-in forwards;
}

.icon-bookmark {
  position: absolute;
  top: 0;
  left: 0;
  color: @s-bookmark;
  font-size: 2rem;
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


@media only screen and (min-width: 1200px) {
  .chapter-cover-img {
    height: 24rem;
  }

  .chapter-name {
    margin-top: .6rem;
  }

  .icon-bookmark {
    font-size: 4rem;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .chapter-cover-img {
    height: 18rem;
  }

  .chapter-name {
    margin-top: .4rem;
  }

  .icon-bookmark {
    font-size: 3rem;
  }
}

@media only screen and (max-width: 767px) {
  .chapter-cover-img {
    height: 12rem;
  }

  .chapter-name {
    margin-top: .2rem;
  }

  .icon-bookmark {
    font-size: 2.4rem;
  }
}
</style>
