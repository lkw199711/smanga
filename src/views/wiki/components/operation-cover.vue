<template>
  <div class="operation-cover">
    <!--目录按钮-->
    <div class="show-menu-btn">
      <i class="colour colour-mulu"/>
    </div>

    <div class="top">呼出/隐藏顶部菜单</div>
    <div class="middle">
      <div class="left">上一页</div>
      <div class="right">下一页</div>
    </div>
    <div class="bottom">呼出/隐藏分页器</div>
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
  methods: {},

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.show-menu-btn {
  position: absolute;
  top: 10rem;
  left: 4rem;
  width: 5rem;
  height: 5rem;
  line-height: 4rem;
  text-align: center;
  background-color: @button-back;
  border-radius: 100%;
  opacity: .7;
  z-index: 1;

  i{
    color: #fff;
    font-size: 2.6rem;
  }

  :after{
    position: absolute;
    top: 7rem;
    left: -7rem;
    display: block;
    width: 20rem;
    content: '切换章节';
  }
}

.operation-cover {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  font-size: 4rem;
  text-align: center;
  color: #f0f0f0;
  background-color: #fff;


  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: .8;
    height: 30%;
    background-color: #55a532;
  }

  .middle {
    display: flex;
    flex: 1;

    .left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: .8;

      width: 50%;
      height: 100%;
      background-color: #0077aa;
    }

    .right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: .8;

      width: 50%;
      height: 100%;
      background-color: #5cdbd3;
    }
  }

  .bottom {
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: .8;
    height: 30%;
    background-color: #795da3;
  }
}
</style>
