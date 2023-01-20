<template>
  <div v-for="key in forArray" :key="key" class="seat" :style="style"/>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'seat',
  // 数据
  data() {
    return {}
  },

  // 传值
  props: ['height', 'width', 'num'],

  // 计算
  computed: {
    style() {
      let style: any = {};

      if (this.height)
        style.height = this.height;

      if (this.width)
        style.width = this.width;

      return style;
    },
    forArray() {
      const num = this.num || 1;
      return Array(num);
    }
  },
})
</script>

<style scoped lang='less'>

</style>
