<template>
  <div class="index">
    <div class="media-box">
      <div class="media-item" v-for="(i) in mediaList" :key="i.mediaId" @click="go_manga_list(i.mediaId)">
        {{ i.mediaName }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {get_media} from "@/api/media";
import {global_set} from "@/utils";

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
      const res = await get_media();
      this.mediaList = res.data;
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
    }
  },

  // 生命周期
  created() {
    this.load_media();
  },
})
</script>

<style scoped lang='less'>
.media-box {
  display: flex;
  flex-wrap: wrap;
  width: 100rem;
  margin: 20rem auto;

  .media-item {
    margin: 0 2rem 3rem;
    width: 20rem;
    line-height: 14rem;
    font-size: 2rem;
    text-align: center;
    background-color: rgba(92, 219, 211, .4);
    border-radius: 2rem;
    box-shadow: #9a6e3a 1px 2px 4px;
    cursor: pointer;
  }
}
</style>
