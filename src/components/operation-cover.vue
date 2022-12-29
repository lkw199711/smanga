<template>
  <div class="operation-cover">
    <div class="top" @click="switch_menu"></div>
    <div class="middle">
      <div class="left" @click.stop="before"></div>
      <div class="right" @click.stop="next"></div>
    </div>
    <div class="bottom" @click.stop="switch_footer"></div>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'operation-cover',
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
  methods: {
    before(){
      this.$emit('before');
    },
    next(){
      this.$emit('next');
    },
    switch_menu(){
      this.$emit('switchMenu');
    },
    switch_footer(){
      this.$emit('switchFooter');
    }
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.operation-cover{
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .top{
    height: 40%;
  }
  .middle{
    display: flex;
    flex: 1;
    .left{
      width: 50%;
      height: 100%;
    }
    .right{
      width: 50%;
      height: 100%;
    }
  }
  .bottom{
    height: 40%;
  }
}
</style>
