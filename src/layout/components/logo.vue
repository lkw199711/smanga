<template>
  <div :class="['logo','posted']">
    <img src="@/assets/logo2.png" alt="logo">
    <span>smanga</span>
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
  font-size: 30px;
  height: 60px;
  line-height: 60px;
  color: #5cdbd3;
  cursor: pointer;

  span {
    line-height: 60px;
    text-wrap: inherit;
  }

  img {
    width: 64px;
    height: 60px;
  }
}
</style>
