<template>
  <div class="item-main" @click="go_chapter">

    <!--封面图片-->
    <el-image v-if="finish" class="anim cover-img" :src="poster" :fit="fit" :alt="title"/>

    <!--占位图标-->
    <el-image v-else class="cover-img" :src="placeholder" fit="fill"/>

    <!--漫画名称-->
    <p class="manga-name single-line-text-overflow">{{ title }}</p>
  </div>
</template>

<script>
import {global_set} from "@/utils";

export default {
  name: "manga-list-item",
  data() {
    return {
      placeholder: require('@/assets/s-blue.png'),
      fit: 'cover',
    }
  },
  props: ['mangaInfo'],

  // 引用
  computed: {
    poster() {
      return this.mangaInfo.blob;
    },
    finish() {
      return this.mangaInfo.finish;
    },
    title() {
      return this.mangaInfo.mangaName;
    },
    path() {
      return this.mangaInfo.mangaPath;
    },

  },

  methods: {
    go_chapter() {
      const mangaId = this.mangaInfo.mangaId;
      const mangaCover = this.mangaInfo.mangaCover;
      const browseType = this.mangaInfo.browseType;

      // 缓存漫画信息
      global_set('mangaId', mangaId);
      global_set('mangaName', this.title);
      global_set('mangaCover', mangaCover);

      this.$router.push({
        path: '/chapter-list',
        query: {mangaId, browseType},
      });
    }
  },
  created() {

  }
}
</script>

<style scoped lang="less">
.item-main {
  cursor: pointer;
  overflow: hidden;
}

.manga-name {
  text-align: center;
  line-height: 4;
}

.cover-img {
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
  .item-main {
    width: @mangaCoverWidth;
  }

  .cover-img {
    width: @mangaCoverWidth;
    height: @mangaCoverHeight;
  }

  .manga-name {
    line-height: 4;
  }
}

@media only screen and (max-width: 1080px) {
  .item-main {
    width: @PhoneMangaCoverWidth;
  }

  .cover-img {
    width: @PhoneMangaCoverWidth;
    height: @PhoneMangaCoverHeight;
  }

  .manga-name {
    line-height: 3;
  }
}
</style>
