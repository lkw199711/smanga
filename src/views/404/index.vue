<template>
  <div class="not-found-index">
    <h3>404，您请求的文件不存在!</h3>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'not-found-index',
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
.not-found-index {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  background-color: #444;
}

h3 {
  font-size: 6rem;
  color: #eee;
  text-align: center;
  font-weight: normal;
}
</style>
