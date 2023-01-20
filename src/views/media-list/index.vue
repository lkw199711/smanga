<template>
  <div class="index">
    <div class="media">
      <div class="media-item" v-for="(i) in mediaList" :key="i.mediaId"
           @click="go_manga_list(i.mediaId)" @contextmenu.prevent="context_menu">
        {{ i.mediaName }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {get_media} from "@/api/media";
import {global_set} from "@/utils";
import {config} from "@/store";

export default defineComponent({
  name: 'index',
  // 数据
  data() {
    return {
      mediaList: [],
    }
  },

  // 传值
  props: [],

  // 引用
  computed: {},

  // 组件
  components: {},

  // 方法
  methods: {
    async load_media() {
      const res = await get_media(0, 1000);
      this.mediaList = res.data.list;
    },
    go_manga_list(mediaId: number) {
      // 设置媒体库id
      global_set('mediaId', mediaId);

      this.$router.push({
        name: 'manga-list',
        query: {
          mediaId
        }
      })
    },
    context_menu() {
      config.rightSidebar = true;
    },
  },

  // 生命周期
  created() {
    this.load_media();
  },
})
</script>

<style scoped lang='less'>
.media {
  display: grid;
  justify-content: space-between;

  &-item {
    text-align: center;
    background-color: rgba(92, 219, 211, .4);
    box-shadow: #9a6e3a 1px 2px 4px;
    cursor: pointer;
  }
}

@media only screen and (min-width: 1200px) {
  .media {
    margin: 6rem auto;
    padding: 0 6rem;
    grid-template-columns: repeat(auto-fill, 20rem);
    grid-gap: 3rem 3rem;

    &-item {
      line-height: 14rem;
      border-radius: 1.4rem;
      font-size: 2rem;
    }
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .media {
    margin: 4rem auto;
    padding: 0 4rem;
    grid-template-columns: repeat(auto-fill, 14rem);
    grid-gap: 2rem 2rem;

    &-item {
      line-height: 10rem;
      border-radius: 1.2rem;
      font-size: 1.6rem;
    }
  }
}

@media only screen and (max-width: 767px) {
  .media {
    margin: 2rem auto;
    padding: 0 2rem;
    grid-template-columns: repeat(auto-fill, 10rem);
    grid-gap: 1.6rem 1rem;

    &-item {
      line-height: 7rem;
      border-radius: 1rem;
      font-size: 1.4rem;
    }
  }
}

</style>
