<template>
  <div :class="['logo','posted']">
    <img src="@/assets/smanga-logo.png" alt="logo">
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'logo',
  // 数据
  data() {
    return {}
  },

  // 传值
  props: [],

  // 引用
  computed: {},

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
.logo.posted {
  display: flex;
  width: 100%;
  font-size: 3rem;
  height: 6rem;
  line-height: 6rem;
  color: #5cdbd3;
  cursor: pointer;

  span {
    line-height: 6rem;
    text-wrap: inherit;
  }

  img {
    max-width: 100%;
    //width: 64px;
    //height: 60px;
  }
}
</style>
