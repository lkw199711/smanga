<template>
  <div class="top-nav">
    <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleSelect"
    >
      <el-menu-item index="switch_sidebar"><el-icon><operation /></el-icon></el-menu-item>
      <el-menu-item index="/setting-path">设置</el-menu-item>
      <el-menu-item index="/register">注册</el-menu-item>
      <el-menu-item index="/account">账户管理</el-menu-item>
      <el-menu-item index="/media-setting">媒体库管理</el-menu-item>
      <el-menu-item index="/path-setting">路径管理</el-menu-item>
      <el-menu-item index="/manga-setting">漫画管理</el-menu-item>
      <el-menu-item index="/chapter-setting">章节管理</el-menu-item>
    </el-menu>
  </div>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'
import {config} from "@/store";

export default defineComponent({
  setup() {
    const activeIndex = ref('1')
    const activeIndex2 = ref('1')
    const handleSelect = (key: any, keyPath: any) => {

      switch (key){
        case 'switch_sidebar':
          config.sidebarCollapse = !config.sidebarCollapse;
          break;
        default:
          break;
      }
    }
    return {
      activeIndex,
      activeIndex2,
      handleSelect,
    }
  },

  name: 'top-nav',
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

<style scoped lang='less' type='text/less'>

</style>
